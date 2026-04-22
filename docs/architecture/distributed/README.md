# 分布式系统设计

微服务架构与分布式测试策略。

## 微服务测试策略与契约测试

微服务环境下的测试方法。

- 服务单元测试
- 集成测试策略
- 契约测试（Pact）
- 端到端测试

### 微服务测试金字塔

```
                    /\
                   /  \
                  /E2E \      <- 端到端测试（少量）
                 /------\
                /Contract \   <- 契约测试
               /----------\
              / Integration \ <- 服务间集成测试
             /--------------\
            /     Unit       \<- 服务单元测试（大量）
           /------------------\
```

### 契约测试实现

```python
from typing import Dict, List, Optional
import json
import requests

class ContractTest:
    """
    契约测试基类
    验证服务间契约一致性
    """
    def __init__(self, consumer: str, provider: str):
        """
        初始化契约测试
        
        Args:
            consumer: 消费者服务
            provider: 提供者服务
        """
        self.consumer = consumer
        self.provider = provider
        self.contracts: List[Dict] = []
    
    def define_contract(self, endpoint: str, method: str,
                       request_schema: Dict,
                       response_schema: Dict,
                       status_code: int = 200):
        """
        定义契约
        
        Args:
            endpoint: API端点
            method: HTTP方法
            request_schema: 请求模式
            response_schema: 响应模式
            status_code: 期望状态码
        """
        contract = {
            "endpoint": endpoint,
            "method": method,
            "request": request_schema,
            "response": response_schema,
            "status_code": status_code
        }
        self.contracts.append(contract)
    
    def verify_provider(self, base_url: str) -> Dict:
        """
        验证提供者
        
        Args:
            base_url: 提供者基础URL
            
        Returns:
            dict: 验证结果
        """
        results = []
        
        for contract in self.contracts:
            url = f"{base_url}{contract['endpoint']}"
            method = contract['method']
            
            try:
                response = requests.request(method, url)
                
                # 验证状态码
                status_match = response.status_code == contract['status_code']
                
                # 验证响应结构
                try:
                    data = response.json()
                    structure_match = self._verify_schema(data, contract['response'])
                except ValueError:
                    structure_match = False
                
                results.append({
                    "contract": contract,
                    "status_match": status_match,
                    "structure_match": structure_match,
                    "passed": status_match and structure_match
                })
            
            except Exception as e:
                results.append({
                    "contract": contract,
                    "error": str(e),
                    "passed": False
                })
        
        return {
            "total": len(results),
            "passed": sum(1 for r in results if r["passed"]),
            "failed": sum(1 for r in results if not r["passed"]),
            "details": results
        }
    
    def _verify_schema(self, data: Dict, schema: Dict, path: str = "") -> bool:
        """
        验证数据结构
        
        Args:
            data: 实际数据
            schema: 期望模式
            path: 当前路径
            
        Returns:
            bool: 是否匹配
        """
        if schema.get("type") == "object":
            if not isinstance(data, dict):
                return False
            
            for key, field_schema in schema.get("properties", {}).items():
                if key not in data and key in schema.get("required", []):
                    return False
                if key in data:
                    if not self._verify_schema(data[key], field_schema, f"{path}.{key}"):
                        return False
        
        elif schema.get("type") == "array":
            if not isinstance(data, list):
                return False
            
            item_schema = schema.get("items", {})
            for item in data:
                if not self._verify_schema(item, item_schema, f"{path}[]"):
                    return False
        
        return True

class PactContractManager:
    """
    Pact契约管理器
    管理消费者驱动的契约
    """
    def __init__(self, pact_dir: str = "./pacts"):
        """
        初始化管理器
        
        Args:
            pact_dir: 契约文件目录
        """
        self.pact_dir = pact_dir
    
    def generate_pact(self, consumer: str, provider: str,
                     interactions: List[Dict]) -> str:
        """
        生成Pact文件
        
        Args:
            consumer: 消费者
            provider: 提供者
            interactions: 交互定义
            
        Returns:
            str: Pact文件路径
        """
        pact = {
            "consumer": {"name": consumer},
            "provider": {"name": provider},
            "interactions": interactions,
            "metadata": {
                "pactSpecification": {"version": "3.0.0"}
            }
        }
        
        filename = f"{consumer}-{provider}.json"
        filepath = f"{self.pact_dir}/{filename}"
        
        import os
        os.makedirs(self.pact_dir, exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(pact, f, indent=2)
        
        return filepath
```

## 分布式任务调度

大规模测试任务调度。

- 任务队列设计
- 负载均衡
- 故障转移
- 优先级调度

### 分布式调度器

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import threading
import queue
import time
import uuid

class TaskStatus(Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Task:
    """任务定义"""
    id: str
    name: str
    type: str
    priority: int
    payload: Dict
    status: TaskStatus = TaskStatus.PENDING
    worker_id: Optional[str] = None
    created_at: float = 0
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    result: Optional[Dict] = None
    error: Optional[str] = None

class DistributedTaskScheduler:
    """
    分布式任务调度器
    管理测试任务的调度与执行
    """
    def __init__(self, max_workers: int = 10):
        """
        初始化调度器
        
        Args:
            max_workers: 最大工作节点数
        """
        self.max_workers = max_workers
        self.tasks: Dict[str, Task] = {}
        self.task_queue = queue.PriorityQueue()
        self.workers: Dict[str, Dict] = {}
        self._lock = threading.RLock()
        self._running = False
    
    def submit_task(self, name: str, task_type: str,
                   payload: Dict, priority: int = 5) -> str:
        """
        提交任务
        
        Args:
            name: 任务名称
            task_type: 任务类型
            payload: 任务数据
            priority: 优先级（1-10，数字越小优先级越高）
            
        Returns:
            str: 任务ID
        """
        task_id = str(uuid.uuid4())
        
        task = Task(
            id=task_id,
            name=name,
            type=task_type,
            priority=priority,
            payload=payload,
            created_at=time.time()
        )
        
        with self._lock:
            self.tasks[task_id] = task
            self.task_queue.put((priority, task.created_at, task_id))
        
        return task_id
    
    def register_worker(self, worker_id: str,
                       capabilities: List[str],
                       capacity: int = 1):
        """
        注册工作节点
        
        Args:
            worker_id: 工作节点ID
            capabilities: 能力列表
            capacity: 并发容量
        """
        with self._lock:
            self.workers[worker_id] = {
                "id": worker_id,
                "capabilities": capabilities,
                "capacity": capacity,
                "running_tasks": 0,
                "status": "available"
            }
    
    def assign_task(self) -> Optional[str]:
        """
        分配任务
        
        Returns:
            str: 任务ID
        """
        with self._lock:
            # 查找可用工作节点
            available_workers = [
                w for w in self.workers.values()
                if w["status"] == "available" and w["running_tasks"] < w["capacity"]
            ]
            
            if not available_workers:
                return None
            
            try:
                # 获取优先级最高的任务
                _, _, task_id = self.task_queue.get_nowait()
                task = self.tasks.get(task_id)
                
                if not task or task.status != TaskStatus.PENDING:
                    return None
                
                # 选择合适的工作节点
                worker = self._select_worker(available_workers, task)
                if not worker:
                    # 放回队列
                    self.task_queue.put((task.priority, task.created_at, task_id))
                    return None
                
                # 分配任务
                task.status = TaskStatus.RUNNING
                task.worker_id = worker["id"]
                task.started_at = time.time()
                worker["running_tasks"] += 1
                
                return task_id
            
            except queue.Empty:
                return None
    
    def _select_worker(self, workers: List[Dict],
                      task: Task) -> Optional[Dict]:
        """
        选择工作节点
        
        Args:
            workers: 可用工作节点
            task: 任务
            
        Returns:
            dict: 选中的工作节点
        """
        # 根据任务类型匹配能力
        for worker in workers:
            if task.type in worker["capabilities"] or "*" in worker["capabilities"]:
                return worker
        
        return workers[0] if workers else None
    
    def complete_task(self, task_id: str, result: Dict):
        """
        完成任务
        
        Args:
            task_id: 任务ID
            result: 执行结果
        """
        with self._lock:
            task = self.tasks.get(task_id)
            if not task:
                return
            
            task.status = TaskStatus.COMPLETED
            task.completed_at = time.time()
            task.result = result
            
            # 释放工作节点
            if task.worker_id:
                worker = self.workers.get(task.worker_id)
                if worker:
                    worker["running_tasks"] -= 1
    
    def fail_task(self, task_id: str, error: str):
        """
        标记任务失败
        
        Args:
            task_id: 任务ID
            error: 错误信息
        """
        with self._lock:
            task = self.tasks.get(task_id)
            if not task:
                return
            
            task.status = TaskStatus.FAILED
            task.completed_at = time.time()
            task.error = error
            
            # 释放工作节点
            if task.worker_id:
                worker = self.workers.get(task.worker_id)
                if worker:
                    worker["running_tasks"] -= 1
    
    def get_scheduler_stats(self) -> Dict:
        """
        获取调度器统计
        
        Returns:
            dict: 统计信息
        """
        with self._lock:
            return {
                "total_tasks": len(self.tasks),
                "pending": sum(1 for t in self.tasks.values() if t.status == TaskStatus.PENDING),
                "running": sum(1 for t in self.tasks.values() if t.status == TaskStatus.RUNNING),
                "completed": sum(1 for t in self.tasks.values() if t.status == TaskStatus.COMPLETED),
                "failed": sum(1 for t in self.tasks.values() if t.status == TaskStatus.FAILED),
                "workers": len(self.workers),
                "available_workers": sum(1 for w in self.workers.values() if w["status"] == "available")
            }
```

## 平台高可用与容灾设计

测试平台可靠性保障。

- 主备架构
- 数据备份
- 故障切换
- 灾难恢复

### 高可用架构

```python
class HighAvailabilityManager:
    """
    高可用管理器
    管理平台节点的高可用性
    """
    def __init__(self):
        self.nodes: Dict[str, Dict] = {}
        self.primary_node: Optional[str] = None
        self._lock = threading.RLock()
    
    def register_node(self, node_id: str, role: str = "secondary"):
        """
        注册节点
        
        Args:
            node_id: 节点ID
            role: 角色（primary/secondary）
        """
        with self._lock:
            self.nodes[node_id] = {
                "id": node_id,
                "role": role,
                "status": "healthy",
                "last_heartbeat": time.time()
            }
            
            if role == "primary":
                self.primary_node = node_id
    
    def heartbeat(self, node_id: str):
        """
        节点心跳
        
        Args:
            node_id: 节点ID
        """
        with self._lock:
            node = self.nodes.get(node_id)
            if node:
                node["last_heartbeat"] = time.time()
                node["status"] = "healthy"
    
    def check_health(self) -> List[Dict]:
        """
        健康检查
        
        Returns:
            list: 不健康节点列表
        """
        with self._lock:
            unhealthy = []
            current_time = time.time()
            
            for node_id, node in self.nodes.items():
                if current_time - node["last_heartbeat"] > 30:
                    node["status"] = "unhealthy"
                    unhealthy.append(node)
            
            return unhealthy
    
    def failover(self) -> Optional[str]:
        """
        执行故障转移
        
        Returns:
            str: 新的主节点ID
        """
        with self._lock:
            if self.primary_node and self.nodes.get(self.primary_node, {}).get("status") == "healthy":
                return self.primary_node
            
            # 选举新的主节点
            for node_id, node in self.nodes.items():
                if node["status"] == "healthy" and node["role"] == "secondary":
                    node["role"] = "primary"
                    self.primary_node = node_id
                    return node_id
            
            return None
```

## 最佳实践

1. **服务边界清晰**：明确服务职责和接口
2. **异步通信**：优先使用异步消息传递
3. **熔断降级**：防止故障级联传播
4. **监控可观测**：全链路追踪和监控
5. **数据一致性**：根据场景选择一致性模型
