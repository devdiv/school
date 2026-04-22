# 云原生基础设施

容器化、编排与设备云管理。

## Docker/K8s容器化与编排

现代部署基础设施。

- Dockerfile最佳实践
- K8s部署配置
- Helm Chart管理
- 服务网格

### Docker测试环境

```dockerfile
# Dockerfile.test - 测试专用镜像
FROM python:3.11-slim

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 安装测试工具
RUN pip install --no-cache-dir \
    pytest \
    pytest-html \
    pytest-xdist \
    playwright \
    && playwright install chromium

# 创建工作目录
WORKDIR /tests

# 复制测试代码
COPY . .

# 默认执行测试
CMD ["pytest", "-v", "--html=/reports/report.html"]
```

```yaml
# k8s-test-job.yaml - K8s测试任务
apiVersion: batch/v1
kind: Job
metadata:
  name: integration-test
  namespace: testing
spec:
  template:
    spec:
      containers:
      - name: test-runner
        image: myregistry/test-runner:latest
        env:
        - name: TEST_ENV
          value: "staging"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        volumeMounts:
        - name: test-reports
          mountPath: /reports
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: test-reports
        emptyDir: {}
      restartPolicy: Never
  backoffLimit: 2
  activeDeadlineSeconds: 3600
```

### K8s测试命名空间管理

```python
from typing import Dict, List
import kubernetes
from kubernetes import client, config

class K8sTestNamespaceManager:
    """
    K8s测试命名空间管理器
    管理测试环境的命名空间生命周期
    """
    def __init__(self):
        config.load_kube_config()
        self.core_v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
    
    def create_test_namespace(self, name: str,
                             ttl_hours: int = 24) -> str:
        """
        创建测试命名空间
        
        Args:
            name: 命名空间名称
            ttl_hours: 存活时间
            
        Returns:
            str: 命名空间名称
        """
        namespace = client.V1Namespace(
            metadata=client.V1ObjectMeta(
                name=name,
                labels={
                    "purpose": "testing",
                    "ttl": str(ttl_hours),
                    "created-by": "test-platform"
                },
                annotations={
                    "cleanup-after": f"{ttl_hours}h"
                }
            )
        )
        
        self.core_v1.create_namespace(namespace)
        return name
    
    def deploy_test_services(self, namespace: str,
                            manifest_path: str) -> List[str]:
        """
        部署测试服务
        
        Args:
            namespace: 命名空间
            manifest_path: 清单文件路径
            
        Returns:
            list: 部署的服务名称
        """
        import yaml
        
        deployed = []
        
        with open(manifest_path) as f:
            for doc in yaml.safe_load_all(f):
                if not doc:
                    continue
                
                kind = doc.get("kind")
                name = doc["metadata"]["name"]
                
                if kind == "Deployment":
                    self.apps_v1.create_namespaced_deployment(
                        namespace=namespace, body=doc
                    )
                elif kind == "Service":
                    self.core_v1.create_namespaced_service(
                        namespace=namespace, body=doc
                    )
                
                deployed.append(name)
        
        return deployed
    
    def cleanup_namespace(self, name: str):
        """
        清理命名空间
        
        Args:
            name: 命名空间名称
        """
        self.core_v1.delete_namespace(name=name)
    
    def list_test_namespaces(self) -> List[Dict]:
        """
        列出测试命名空间
        
        Returns:
            list: 命名空间列表
        """
        namespaces = self.core_v1.list_namespace(
            label_selector="purpose=testing"
        )
        
        return [
            {
                "name": ns.metadata.name,
                "created": ns.metadata.creation_timestamp,
                "labels": ns.metadata.labels
            }
            for ns in namespaces.items
        ]
```

## 设备云管理平台

测试设备资源管理。

- 设备池管理
- 远程控制
- 资源调度
- 状态监控

### 设备云管理器

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import threading
import time

class DeviceStatus(Enum):
    """设备状态"""
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

@dataclass
class Device:
    """设备信息"""
    id: str
    name: str
    type: str  # android/ios/desktop
    os_version: str
    status: DeviceStatus
    capabilities: List[str]
    current_session: Optional[str] = None
    last_heartbeat: float = 0

class DeviceCloudManager:
    """
    设备云管理器
    管理测试设备资源池
    """
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        self._lock = threading.RLock()
        self._sessions: Dict[str, str] = {}  # session_id -> device_id
    
    def register_device(self, device: Device):
        """
        注册设备
        
        Args:
            device: 设备信息
        """
        with self._lock:
            self.devices[device.id] = device
    
    def allocate_device(self, device_type: str = None,
                       os_version: str = None,
                       timeout: int = 3600) -> Optional[Device]:
        """
        分配设备
        
        Args:
            device_type: 设备类型
            os_version: 系统版本
            timeout: 超时时间
            
        Returns:
            Device: 分配的设备
        """
        with self._lock:
            for device in self.devices.values():
                if device.status != DeviceStatus.AVAILABLE:
                    continue
                
                if device_type and device.type != device_type:
                    continue
                
                if os_version and not device.os_version.startswith(os_version):
                    continue
                
                # 分配设备
                device.status = DeviceStatus.BUSY
                session_id = f"sess_{int(time.time())}"
                device.current_session = session_id
                self._sessions[session_id] = device.id
                
                return device
            
            return None
    
    def release_device(self, session_id: str):
        """
        释放设备
        
        Args:
            session_id: 会话ID
        """
        with self._lock:
            device_id = self._sessions.get(session_id)
            if not device_id:
                return
            
            device = self.devices.get(device_id)
            if device:
                device.status = DeviceStatus.AVAILABLE
                device.current_session = None
            
            del self._sessions[session_id]
    
    def get_device_stats(self) -> Dict:
        """
        获取设备统计
        
        Returns:
            dict: 统计信息
        """
        with self._lock:
            stats = {
                "total": len(self.devices),
                "available": sum(1 for d in self.devices.values() 
                               if d.status == DeviceStatus.AVAILABLE),
                "busy": sum(1 for d in self.devices.values() 
                          if d.status == DeviceStatus.BUSY),
                "offline": sum(1 for d in self.devices.values() 
                             if d.status == DeviceStatus.OFFLINE),
                "active_sessions": len(self._sessions)
            }
            return stats
    
    def heartbeat(self, device_id: str):
        """
        设备心跳
        
        Args:
            device_id: 设备ID
        """
        with self._lock:
            device = self.devices.get(device_id)
            if device:
                device.last_heartbeat = time.time()
```

## 消息队列

异步通信基础设施。

- Kafka：高吞吐消息流
- RabbitMQ：可靠消息传递
- Redis：轻量级队列
- 事件驱动架构

### 消息队列集成

```python
from typing import Dict, Callable
import json
import asyncio

class MessageQueueClient:
    """
    消息队列客户端
    封装消息发布和订阅
    """
    def __init__(self, broker_type: str = "redis"):
        """
        初始化客户端
        
        Args:
            broker_type: 消息代理类型
        """
        self.broker_type = broker_type
        self._subscribers: Dict[str, list] = {}
    
    async def publish(self, topic: str, message: Dict):
        """
        发布消息
        
        Args:
            topic: 主题
            message: 消息内容
        """
        if self.broker_type == "redis":
            import aioredis
            redis = await aioredis.from_url("redis://localhost")
            await redis.publish(topic, json.dumps(message))
    
    async def subscribe(self, topic: str,
                       handler: Callable[[Dict], None]):
        """
        订阅消息
        
        Args:
            topic: 主题
            handler: 处理函数
        """
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(handler)
    
    async def start_consuming(self):
        """开始消费消息"""
        if self.broker_type == "redis":
            import aioredis
            redis = await aioredis.from_url("redis://localhost")
            pubsub = redis.pubsub()
            
            for topic in self._subscribers:
                await pubsub.subscribe(topic)
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    topic = message["channel"].decode()
                    data = json.loads(message["data"])
                    
                    for handler in self._subscribers.get(topic, []):
                        await handler(data)
```

## 最佳实践

1. **基础设施即代码**：所有配置使用YAML/Terraform管理
2. **环境隔离**：测试环境与生产环境完全隔离
3. **资源限制**：设置合理的资源请求和限制
4. **健康检查**：所有服务配置健康检查端点
5. **日志聚合**：统一日志收集和分析
