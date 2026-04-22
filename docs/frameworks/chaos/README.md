# 混沌工程与稳定性测试

通过混沌工程提升系统稳定性。

## ChaosBlade

阿里开源的混沌工程工具。

- 阿里开源
- 云原生故障注入
- 多场景支持
- K8s集成
- 丰富的故障类型

### ChaosBlade核心能力

```python
from typing import Dict, List, Optional
import subprocess
import json
import time

class ChaosBladeRunner:
    """
    ChaosBlade故障注入运行器
    封装混沌实验的执行和管理
    """
    def __init__(self, blade_path: str = "blade"):
        """
        初始化运行器
        
        Args:
            blade_path: blade可执行文件路径
        """
        self.blade_path = blade_path
        self.active_experiments: Dict[str, Dict] = {}
    
    def create_cpu_load(self, cpu_percent: int = 80, 
                       duration: str = "60s",
                       cpu_list: str = None) -> str:
        """
        创建CPU负载实验
        
        Args:
            cpu_percent: CPU使用率百分比
            duration: 持续时间
            cpu_list: 指定CPU核心列表
            
        Returns:
            str: 实验UID
        """
        cmd = [
            self.blade_path, "create", "cpu", "load",
            "--cpu-percent", str(cpu_percent),
            "--timeout", duration
        ]
        
        if cpu_list:
            cmd.extend(["--cpu-list", cpu_list])
        
        result = self._run_command(cmd)
        uid = self._extract_uid(result)
        
        self.active_experiments[uid] = {
            "type": "cpu_load",
            "params": {"cpu_percent": cpu_percent, "duration": duration}
        }
        
        return uid
    
    def create_memory_load(self, mem_percent: int = 80,
                          duration: str = "60s") -> str:
        """
        创建内存负载实验
        
        Args:
            mem_percent: 内存使用率百分比
            duration: 持续时间
            
        Returns:
            str: 实验UID
        """
        cmd = [
            self.blade_path, "create", "mem", "load",
            "--mem-percent", str(mem_percent),
            "--timeout", duration
        ]
        
        result = self._run_command(cmd)
        uid = self._extract_uid(result)
        
        self.active_experiments[uid] = {
            "type": "memory_load",
            "params": {"mem_percent": mem_percent, "duration": duration}
        }
        
        return uid
    
    def create_network_delay(self, interface: str = "eth0",
                            time: int = 3000,
                            offset: int = 1000,
                            destination_ip: str = None) -> str:
        """
        创建网络延迟实验
        
        Args:
            interface: 网络接口
            time: 延迟时间（毫秒）
            offset: 偏移量
            destination_ip: 目标IP
            
        Returns:
            str: 实验UID
        """
        cmd = [
            self.blade_path, "create", "network", "delay",
            "--interface", interface,
            "--time", str(time),
            "--offset", str(offset)
        ]
        
        if destination_ip:
            cmd.extend(["--destination-ip", destination_ip])
        
        result = self._run_command(cmd)
        return self._extract_uid(result)
    
    def create_disk_fill(self, path: str = "/",
                        percent: int = 80,
                        retain_handle: bool = True) -> str:
        """
        创建磁盘填充实验
        
        Args:
            path: 目标路径
            percent: 填充百分比
            retain_handle: 是否保留文件句柄
            
        Returns:
            str: 实验UID
        """
        cmd = [
            self.blade_path, "create", "disk", "fill",
            "--path", path,
            "--percent", str(percent)
        ]
        
        if retain_handle:
            cmd.append("--retain-handle")
        
        result = self._run_command(cmd)
        return self._extract_uid(result)
    
    def create_k8s_pod_failure(self, namespace: str,
                              labels: Dict[str, str],
                              eviction_count: int = 1) -> str:
        """
        创建K8s Pod故障实验
        
        Args:
            namespace: 目标命名空间
            labels: Pod标签选择器
            eviction_count: 驱逐数量
            
        Returns:
            str: 实验UID
        """
        label_str = ",".join([f"{k}={v}" for k, v in labels.items()])
        
        cmd = [
            self.blade_path, "create", "k8s", "pod-pod",
            "--namespace", namespace,
            "--labels", label_str,
            "--eviction-count", str(eviction_count),
            "--waiting-time", "30s"
        ]
        
        result = self._run_command(cmd)
        return self._extract_uid(result)
    
    def destroy_experiment(self, uid: str) -> bool:
        """
        销毁实验
        
        Args:
            uid: 实验UID
            
        Returns:
            bool: 是否成功
        """
        cmd = [self.blade_path, "destroy", uid]
        result = self._run_command(cmd)
        
        if uid in self.active_experiments:
            del self.active_experiments[uid]
        
        return "success" in result.lower()
    
    def get_experiment_status(self, uid: str) -> Dict:
        """
        获取实验状态
        
        Args:
            uid: 实验UID
            
        Returns:
            dict: 实验状态
        """
        cmd = [self.blade_path, "status", uid]
        result = self._run_command(cmd)
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"raw": result}
    
    def _run_command(self, cmd: List[str]) -> str:
        """
        执行命令
        
        Args:
            cmd: 命令列表
            
        Returns:
            str: 命令输出
        """
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"命令执行失败: {result.stderr}")
        
        return result.stdout
    
    def _extract_uid(self, output: str) -> str:
        """
        从输出中提取UID
        
        Args:
            output: 命令输出
            
        Returns:
            str: 实验UID
        """
        for line in output.split("\n"):
            if "success" in line.lower():
                parts = line.split(":")
                if len(parts) > 1:
                    return parts[-1].strip()
        return ""
    
    def cleanup_all(self):
        """清理所有活跃实验"""
        for uid in list(self.active_experiments.keys()):
            self.destroy_experiment(uid)
```

### 混沌实验编排

```python
from typing import List, Dict
from dataclasses import dataclass
from enum import Enum
import time

class ExperimentPhase(Enum):
    """实验阶段"""
    PREPARE = "prepare"
    INJECT = "inject"
    OBSERVE = "observe"
    RECOVER = "recover"
    ANALYZE = "analyze"

@dataclass
class ExperimentStep:
    """实验步骤"""
    name: str
    action: callable
    params: Dict
    rollback: callable = None
    timeout: int = 300

class ChaosExperimentOrchestrator:
    """
    混沌实验编排器
    管理完整的混沌实验生命周期
    """
    def __init__(self, runner: ChaosBladeRunner):
        """
        初始化编排器
        
        Args:
            runner: ChaosBlade运行器
        """
        self.runner = runner
        self.steps: List[ExperimentStep] = []
        self.results: List[Dict] = []
    
    def add_step(self, step: ExperimentStep):
        """
        添加实验步骤
        
        Args:
            step: 实验步骤
        """
        self.steps.append(step)
    
    def run_experiment(self) -> Dict:
        """
        执行完整实验
        
        Returns:
            dict: 实验结果
        """
        experiment_id = f"exp_{int(time.time())}"
        
        print(f"开始混沌实验: {experiment_id}")
        
        for i, step in enumerate(self.steps):
            print(f"执行步骤 {i+1}/{len(self.steps)}: {step.name}")
            
            try:
                result = step.action(**step.params)
                self.results.append({
                    "step": step.name,
                    "status": "success",
                    "result": result
                })
            except Exception as e:
                self.results.append({
                    "step": step.name,
                    "status": "failed",
                    "error": str(e)
                })
                
                # 执行回滚
                if step.rollback:
                    print(f"执行回滚: {step.name}")
                    step.rollback()
                
                break
        
        return {
            "experiment_id": experiment_id,
            "steps": self.results,
            "overall_status": "success" if all(
                r["status"] == "success" for r in self.results
            ) else "failed"
        }
    
    def create_cpu_stress_scenario(self, target_service: str,
                                   baseline_qps: float) -> 'ChaosExperimentOrchestrator':
        """
        创建CPU压力场景
        
        Args:
            target_service: 目标服务
            baseline_qps: 基线QPS
            
        Returns:
            ChaosExperimentOrchestrator: 编排器实例
        """
        # 基线测量步骤
        self.add_step(ExperimentStep(
            name="measure_baseline",
            action=self._measure_qps,
            params={"service": target_service, "duration": 60}
        ))
        
        # 注入CPU负载
        self.add_step(ExperimentStep(
            name="inject_cpu_load",
            action=self.runner.create_cpu_load,
            params={"cpu_percent": 80, "duration": "120s"},
            rollback=self.runner.cleanup_all
        ))
        
        # 观察指标
        self.add_step(ExperimentStep(
            name="observe_under_load",
            action=self._measure_qps,
            params={"service": target_service, "duration": 120}
        ))
        
        return self
    
    def _measure_qps(self, service: str, duration: int) -> Dict:
        """
        测量服务QPS
        
        Args:
            service: 服务名称
            duration: 测量持续时间
            
        Returns:
            dict: 测量结果
        """
        # 实际实现需要集成监控系统
        return {
            "service": service,
            "duration": duration,
            "qps": 1000,  # 示例值
            "latency_p99": 150  # 示例值
        }
```

## Krkn-AI

AI辅助混沌测试工具。

- AI辅助混沌测试
- 目标驱动测试
- 智能故障选择
- 自动化场景生成

## ChaosEater

LLM全自动混沌工程。

- LLM驱动
- 全自动混沌工程
- 智能故障分析
- 自适应测试

## ChaosKit

Go代码级混沌注入工具。

- Go代码级混沌注入
- 细粒度故障控制
- 可编程故障场景
- 与测试框架集成

## 混沌工程原则

### 五大原则

1. **建立稳定状态的假设**
   - 定义系统正常运行的可测量输出
   - 建立基线指标（QPS、延迟、错误率）

2. **引入真实世界的故障**
   - 模拟真实可能发生的故障场景
   - 避免引入不可能发生的故障

3. **在生产环境运行**
   - 尽可能在生产环境执行实验
   - 使用流量镜像或金丝雀发布

4. **持续自动化**
   - 混沌实验自动化执行
   - 集成到CI/CD流水线

5. **最小化爆炸半径**
   - 控制故障影响范围
   - 随时准备终止实验

### 实验设计模板

```yaml
# chaos-experiment-template.yaml
experiment:
  name: "数据库延迟对订单服务的影响"
  description: "模拟数据库响应延迟增加，观察订单服务的容错能力"
  
  hypothesis:
    - "订单服务在数据库延迟<500ms时，错误率<1%"
    - "订单服务在数据库延迟>1000ms时，应触发熔断"
  
  baseline:
    duration: "5m"
    metrics:
      - name: "order_qps"
        expected: "> 100"
      - name: "error_rate"
        expected: "< 0.1%"
      - name: "p99_latency"
        expected: "< 200ms"
  
  fault_injection:
    type: "network_delay"
    target:
      service: "order-db"
      port: 3306
    parameters:
      delay: "300ms"
      jitter: "50ms"
    duration: "10m"
  
  abort_conditions:
    - metric: "error_rate"
      threshold: "> 10%"
      duration: "2m"
    - metric: "order_qps"
      threshold: "< 50"
      duration: "3m"
  
  rollback:
    automatic: true
    timeout: "30s"
  
  analysis:
    success_criteria:
      - "错误率始终<5%"
      - "熔断机制正常触发"
      - "降级策略生效"
```

## 最佳实践

1. **从开发环境开始**：先在非生产环境验证实验
2. **监控全覆盖**：实验期间加强监控和告警
3. **快速回滚**：确保能在30秒内停止实验
4. **文档记录**：记录每次实验的设计和结果
5. **团队协作**：开发、测试、运维共同参与
6. **持续改进**：基于实验结果优化系统架构
