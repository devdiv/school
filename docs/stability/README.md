# 稳定性测试与可靠性保障

构建高可用、高可靠系统的测试实践。

## 概述

稳定性测试是验证系统在各种压力条件下保持正常运行能力的关键测试类型。通过模拟故障、压力测试、混沌工程等手段，发现系统的脆弱点，提升系统的可靠性。

### 核心目标

- **发现瓶颈**：识别系统的性能瓶颈和资源限制
- **验证容错**：验证系统的故障恢复能力
- **评估容量**：确定系统的最大承载能力
- **保障可用性**：确保系统满足SLA要求

### 测试类型

```
稳定性测试体系
├── 性能测试
│   ├── 负载测试
│   ├── 压力测试
│   ├── 容量测试
│   └── 基准测试
├── 可靠性测试
│   ├── 故障注入
│   ├── 恢复测试
│   ├── 长期稳定性
│   └── 异常处理
├── 混沌工程
│   ├── 资源故障
│   ├── 网络故障
│   ├── 服务故障
│   └── 数据故障
└── 容灾测试
    ├── 主备切换
    ├── 数据备份恢复
    ├── 多活验证
    └── 灾难恢复
```

## 性能测试实践

### 负载测试框架

```python
from typing import Dict, List, Callable
from dataclasses import dataclass
import time
import threading
import statistics

@dataclass
class LoadTestResult:
    """负载测试结果类"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    p95_response_time: float
    p99_response_time: float
    throughput: float
    error_rate: float

class LoadTester:
    """
    负载测试器
    执行并发负载测试
    """
    def __init__(self, target_func: Callable, concurrent_users: int = 10):
        self.target_func = target_func
        self.concurrent_users = concurrent_users
        self.results: List[float] = []
        self.errors: List[Exception] = []
        self.lock = threading.Lock()
    
    def run(self, duration: int = 60) -> LoadTestResult:
        """
        执行负载测试
        
        Args:
            duration: 测试持续时间（秒）
            
        Returns:
            LoadTestResult: 测试结果
        """
        start_time = time.time()
        threads = []
        
        for _ in range(self.concurrent_users):
            thread = threading.Thread(target=self._worker, args=(start_time, duration))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        return self._calculate_result(start_time)
    
    def _worker(self, start_time: float, duration: int):
        """
        工作线程
        
        Args:
            start_time: 开始时间
            duration: 持续时间
        """
        while time.time() - start_time < duration:
            request_start = time.time()
            try:
                self.target_func()
                elapsed = time.time() - request_start
                
                with self.lock:
                    self.results.append(elapsed)
            except Exception as e:
                with self.lock:
                    self.errors.append(e)
    
    def _calculate_result(self, start_time: float) -> LoadTestResult:
        """
        计算测试结果
        
        Args:
            start_time: 开始时间
            
        Returns:
            LoadTestResult: 测试结果
        """
        total_time = time.time() - start_time
        
        if not self.results:
            return LoadTestResult(
                total_requests=0,
                successful_requests=0,
                failed_requests=len(self.errors),
                avg_response_time=0,
                min_response_time=0,
                max_response_time=0,
                p95_response_time=0,
                p99_response_time=0,
                throughput=0,
                error_rate=1.0
            )
        
        sorted_results = sorted(self.results)
        
        return LoadTestResult(
            total_requests=len(self.results) + len(self.errors),
            successful_requests=len(self.results),
            failed_requests=len(self.errors),
            avg_response_time=statistics.mean(self.results),
            min_response_time=min(self.results),
            max_response_time=max(self.results),
            p95_response_time=sorted_results[int(len(sorted_results) * 0.95)],
            p99_response_time=sorted_results[int(len(sorted_results) * 0.99)],
            throughput=len(self.results) / total_time,
            error_rate=len(self.errors) / (len(self.results) + len(self.errors))
        )

class StressTester:
    """
    压力测试器
    逐步增加负载直到系统崩溃
    """
    def __init__(self, target_func: Callable):
        self.target_func = target_func
    
    def find_breaking_point(
        self, 
        initial_users: int = 10,
        step: int = 10,
        max_users: int = 1000
    ) -> Dict:
        """
        查找系统崩溃点
        
        Args:
            initial_users: 初始用户数
            step: 每次增加的用户数
            max_users: 最大用户数
            
        Returns:
            dict: 测试结果
        """
        results = []
        current_users = initial_users
        
        while current_users <= max_users:
            tester = LoadTester(self.target_func, current_users)
            result = tester.run(duration=30)
            
            results.append({
                "concurrent_users": current_users,
                "result": result
            })
            
            # 如果错误率超过50%，认为达到崩溃点
            if result.error_rate > 0.5:
                break
            
            current_users += step
        
        return {
            "breaking_point": current_users - step,
            "results": results
        }
```

### 性能指标监控

```python
from typing import Dict, List
import psutil
import time
from dataclasses import dataclass

@dataclass
class SystemMetrics:
    """系统指标类"""
    timestamp: float
    cpu_percent: float
    memory_percent: float
    disk_io_read: float
    disk_io_write: float
    network_sent: float
    network_recv: float

class MetricsCollector:
    """
    指标收集器
    收集系统性能指标
    """
    def __init__(self, interval: float = 1.0):
        self.interval = interval
        self.metrics: List[SystemMetrics] = []
        self.running = False
    
    def start(self):
        """
        开始收集指标
        """
        self.running = True
        self._collect()
    
    def stop(self):
        """
        停止收集指标
        """
        self.running = False
    
    def _collect(self):
        """
        收集指标
        """
        while self.running:
            metrics = SystemMetrics(
                timestamp=time.time(),
                cpu_percent=psutil.cpu_percent(interval=self.interval),
                memory_percent=psutil.virtual_memory().percent,
                disk_io_read=psutil.disk_io_counters().read_bytes,
                disk_io_write=psutil.disk_io_counters().write_bytes,
                network_sent=psutil.net_io_counters().bytes_sent,
                network_recv=psutil.net_io_counters().bytes_recv
            )
            
            self.metrics.append(metrics)
    
    def get_statistics(self) -> Dict:
        """
        获取统计信息
        
        Returns:
            dict: 统计结果
        """
        if not self.metrics:
            return {}
        
        cpu_values = [m.cpu_percent for m in self.metrics]
        memory_values = [m.memory_percent for m in self.metrics]
        
        return {
            "cpu": {
                "avg": statistics.mean(cpu_values),
                "max": max(cpu_values),
                "min": min(cpu_values)
            },
            "memory": {
                "avg": statistics.mean(memory_values),
                "max": max(memory_values),
                "min": min(memory_values)
            },
            "duration": self.metrics[-1].timestamp - self.metrics[0].timestamp,
            "samples": len(self.metrics)
        }

class PerformanceMonitor:
    """
    性能监控器
    监控应用性能指标
    """
    def __init__(self):
        self.metrics = MetricsCollector()
    
    def start_monitoring(self):
        """
        开始监控
        """
        self.metrics.start()
    
    def stop_monitoring(self) -> Dict:
        """
        停止监控并返回结果
        
        Returns:
            dict: 监控结果
        """
        self.metrics.stop()
        return self.metrics.get_statistics()
```

## 混沌工程实践

### 故障注入框架

```python
from typing import Dict, List, Callable
from abc import ABC, abstractmethod
from dataclasses import dataclass
import random
import subprocess

@dataclass
class FaultInjection:
    """故障注入配置类"""
    fault_type: str
    target: str
    duration: int
    intensity: float
    description: str

class FaultInjector(ABC):
    """
    故障注入器基类
    """
    @abstractmethod
    def inject(self, config: FaultInjection):
        """
        注入故障
        
        Args:
            config: 故障配置
        """
        pass
    
    @abstractmethod
    def recover(self, config: FaultInjection):
        """
        恢复故障
        
        Args:
            config: 故障配置
        """
        pass

class CPUFaultInjector(FaultInjector):
    """
    CPU故障注入器
    模拟CPU高负载
    """
    def __init__(self):
        self.processes = []
    
    def inject(self, config: FaultInjection):
        """
        注入CPU负载
        
        Args:
            config: 故障配置
        """
        num_cores = psutil.cpu_count()
        load_processes = int(num_cores * config.intensity)
        
        for _ in range(load_processes):
            proc = subprocess.Popen(
                ["python", "-c", "while True: pass"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            self.processes.append(proc)
    
    def recover(self, config: FaultInjection):
        """
        恢复CPU负载
        
        Args:
            config: 故障配置
        """
        for proc in self.processes:
            proc.terminate()
        self.processes.clear()

class MemoryFaultInjector(FaultInjector):
    """
    内存故障注入器
    模拟内存泄漏
    """
    def __init__(self):
        self.memory_hog = []
    
    def inject(self, config: FaultInjection):
        """
        注入内存压力
        
        Args:
            config: 故障配置
        """
        # 分配指定大小的内存
        size_mb = int(config.intensity * 1024)  # 转换为MB
        self.memory_hog = [0] * (size_mb * 1024 * 1024 // 8)
    
    def recover(self, config: FaultInjection):
        """
        恢复内存
        
        Args:
            config: 故障配置
        """
        self.memory_hog.clear()

class NetworkFaultInjector(FaultInjector):
    """
    网络故障注入器
    模拟网络延迟和丢包
    """
    def inject(self, config: FaultInjection):
        """
        注入网络故障
        
        Args:
            config: 故障配置
        """
        if config.fault_type == "latency":
            cmd = f"tc qdisc add dev eth0 root netem delay {config.intensity}ms"
        elif config.fault_type == "packet_loss":
            cmd = f"tc qdisc add dev eth0 root netem loss {config.intensity}%"
        else:
            return
        
        subprocess.run(cmd, shell=True)
    
    def recover(self, config: FaultInjection):
        """
        恢复网络
        
        Args:
            config: 故障配置
        """
        cmd = "tc qdisc del dev eth0 root"
        subprocess.run(cmd, shell=True)

class ChaosExperiment:
    """
    混沌实验
    编排故障注入和验证
    """
    def __init__(self):
        self.injectors = {
            "cpu": CPUFaultInjector(),
            "memory": MemoryFaultInjector(),
            "network": NetworkFaultInjector()
        }
    
    def run_experiment(
        self, 
        fault_config: FaultInjection,
        verification_func: Callable,
        duration: int = 60
    ) -> Dict:
        """
        运行混沌实验
        
        Args:
            fault_config: 故障配置
            verification_func: 验证函数
            duration: 实验持续时间
            
        Returns:
            dict: 实验结果
        """
        injector = self.injectors.get(fault_config.fault_type)
        
        if not injector:
            return {"status": "failed", "reason": "Unknown fault type"}
        
        # 基线验证
        baseline_result = verification_func()
        
        # 注入故障
        injector.inject(fault_config)
        
        # 故障期间验证
        start_time = time.time()
        results = []
        
        while time.time() - start_time < duration:
            result = verification_func()
            results.append(result)
            time.sleep(5)
        
        # 恢复故障
        injector.recover(fault_config)
        
        # 恢复后验证
        recovery_result = verification_func()
        
        return {
            "status": "completed",
            "baseline": baseline_result,
            "during_fault": results,
            "recovery": recovery_result,
            "passed": all(r.get("healthy", False) for r in results)
        }

class ChaosMonkey:
    """
    混沌猴子
    随机注入故障
    """
    def __init__(self):
        self.experiment = ChaosExperiment()
        self.fault_types = ["cpu", "memory", "network"]
    
    def random_fault(self, intensity_range: tuple = (0.1, 0.5)) -> FaultInjection:
        """
        生成随机故障
        
        Args:
            intensity_range: 故障强度范围
            
        Returns:
            FaultInjection: 故障配置
        """
        fault_type = random.choice(self.fault_types)
        intensity = random.uniform(*intensity_range)
        
        return FaultInjection(
            fault_type=fault_type,
            target="system",
            duration=60,
            intensity=intensity,
            description=f"Random {fault_type} fault with intensity {intensity:.2f}"
        )
    
    def run_random_experiment(
        self, 
        verification_func: Callable,
        probability: float = 0.1
    ) -> Dict:
        """
        运行随机实验
        
        Args:
            verification_func: 验证函数
            probability: 触发概率
            
        Returns:
            dict: 实验结果
        """
        if random.random() > probability:
            return {"status": "skipped", "reason": "Random check failed"}
        
        fault = self.random_fault()
        return self.experiment.run_experiment(fault, verification_func)
```

## 可靠性指标

### SLA/SLO/SLI 定义

```python
from typing import Dict, List
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class SLI:
    """服务水平指标"""
    name: str
    description: str
    measurement_window: timedelta
    target: float
    current: float
    
    def is_healthy(self) -> bool:
        """
        检查是否健康
        
        Returns:
            bool: 是否达到目标
        """
        return self.current >= self.target

@dataclass
class SLO:
    """服务水平目标"""
    name: str
    sli: SLI
    error_budget: float
    
    def calculate_error_budget_remaining(self) -> float:
        """
        计算剩余错误预算
        
        Returns:
            float: 剩余预算百分比
        """
        if self.sli.current >= self.sli.target:
            return 1.0
        
        budget_used = (self.sli.target - self.sli.current) / (1 - self.sli.target)
        return max(0, 1 - budget_used)

class SLAManager:
    """
    SLA管理器
    管理服务水平协议
    """
    def __init__(self):
        self.slos: Dict[str, SLO] = {}
    
    def define_slo(
        self, 
        name: str, 
        target: float,
        measurement_window: timedelta = timedelta(days=30)
    ):
        """
        定义SLO
        
        Args:
            name: SLO名称
            target: 目标值
            measurement_window: 测量窗口
        """
        sli = SLI(
            name=f"{name}_sli",
            description=f"SLI for {name}",
            measurement_window=measurement_window,
            target=target,
            current=0.0
        )
        
        self.slos[name] = SLO(
            name=name,
            sli=sli,
            error_budget=1 - target
        )
    
    def update_sli(self, name: str, value: float):
        """
        更新SLI值
        
        Args:
            name: SLO名称
            value: 新值
        """
        if name in self.slos:
            self.slos[name].sli.current = value
    
    def get_slo_report(self) -> Dict:
        """
        获取SLO报告
        
        Returns:
            dict: 报告内容
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "slos": []
        }
        
        for name, slo in self.slos.items():
            report["slos"].append({
                "name": name,
                "target": slo.sli.target,
                "current": slo.sli.current,
                "healthy": slo.sli.is_healthy(),
                "error_budget_remaining": slo.calculate_error_budget_remaining()
            })
        
        return report

class AvailabilityCalculator:
    """
    可用性计算器
    计算系统可用性
    """
    @staticmethod
    def calculate_availability(
        total_time: float, 
        downtime: float
    ) -> float:
        """
        计算可用性
        
        Args:
            total_time: 总时间（秒）
            downtime: 停机时间（秒）
            
        Returns:
            float: 可用性百分比
        """
        if total_time == 0:
            return 0.0
        
        return (total_time - downtime) / total_time * 100
    
    @staticmethod
    def calculate_downtime_budget(
        availability_target: float,
        period_days: int = 30
    ) -> Dict:
        """
        计算停机预算
        
        Args:
            availability_target: 可用性目标
            period_days: 周期天数
            
        Returns:
            dict: 停机预算
        """
        total_minutes = period_days * 24 * 60
        allowed_downtime = total_minutes * (1 - availability_target / 100)
        
        return {
            "period_days": period_days,
            "total_minutes": total_minutes,
            "allowed_downtime_minutes": allowed_downtime,
            "allowed_downtime_hours": allowed_downtime / 60
        }
```

## 最佳实践

### 1. 稳定性测试策略

| 测试类型 | 频率 | 工具 | 目标 |
|---------|------|------|------|
| 负载测试 | 每周 | JMeter/K6 | 验证性能基线 |
| 压力测试 | 每月 | Locust | 发现性能瓶颈 |
| 混沌工程 | 持续 | ChaosBlade | 提升容错能力 |
| 容灾演练 | 每季度 | 自研 | 验证灾备方案 |

### 2. 监控告警

- 建立多级告警机制
- 设置合理的告警阈值
- 实现告警收敛和降噪
- 建立告警响应流程

### 3. 容量规划

- 基于历史数据预测
- 预留30%容量冗余
- 定期容量评估
- 弹性伸缩策略

## 相关资源

- [混沌工程实践](/frameworks/chaos/) - 故障注入、混沌实验
