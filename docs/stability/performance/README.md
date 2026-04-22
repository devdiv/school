# 系统性能分析

多维性能监控与分析方法。

## CPU/GPU/内存/IO多维监控体系

系统资源全方位监控。

- CPU使用率与负载分析
- GPU显存与算力监控
- 内存分配与泄漏检测
- 磁盘IO与网络IO分析

### 系统监控采集器

```python
import psutil
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from collections import deque
import threading

@dataclass
class SystemMetrics:
    """系统指标数据"""
    timestamp: float
    cpu_percent: float
    cpu_per_core: List[float]
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_io_read_mb: float
    disk_io_write_mb: float
    net_io_sent_mb: float
    net_io_recv_mb: float
    load_average: tuple

class SystemMonitor:
    """
    系统监控器
    采集多维系统性能指标
    """
    def __init__(self, history_size: int = 3600):
        """
        初始化监控器
        
        Args:
            history_size: 历史数据保留数量
        """
        self.history: deque = deque(maxlen=history_size)
        self._monitoring = False
        self._monitor_thread = None
        self._interval = 1.0
        
        # 基准值
        self._baseline_disk = psutil.disk_io_counters()
        self._baseline_net = psutil.net_io_counters()
    
    def start_monitoring(self, interval: float = 1.0):
        """
        开始监控
        
        Args:
            interval: 采样间隔（秒）
        """
        self._interval = interval
        self._monitoring = True
        
        self._monitor_thread = threading.Thread(target=self._monitor_loop)
        self._monitor_thread.daemon = True
        self._monitor_thread.start()
    
    def stop_monitoring(self):
        """停止监控"""
        self._monitoring = False
        if self._monitor_thread:
            self._monitor_thread.join(timeout=5)
    
    def _monitor_loop(self):
        """监控循环"""
        while self._monitoring:
            metrics = self._collect_metrics()
            self.history.append(metrics)
            time.sleep(self._interval)
    
    def _collect_metrics(self) -> SystemMetrics:
        """
        采集指标
        
        Returns:
            SystemMetrics: 系统指标
        """
        # CPU
        cpu_percent = psutil.cpu_percent(interval=None)
        cpu_per_core = psutil.cpu_percent(percpu=True, interval=None)
        
        # 内存
        memory = psutil.virtual_memory()
        
        # 磁盘IO
        disk_io = psutil.disk_io_counters()
        disk_read_mb = (disk_io.read_bytes - self._baseline_disk.read_bytes) / 1024 / 1024
        disk_write_mb = (disk_io.write_bytes - self._baseline_disk.write_bytes) / 1024 / 1024
        self._baseline_disk = disk_io
        
        # 网络IO
        net_io = psutil.net_io_counters()
        net_sent_mb = (net_io.bytes_sent - self._baseline_net.bytes_sent) / 1024 / 1024
        net_recv_mb = (net_io.bytes_recv - self._baseline_net.bytes_recv) / 1024 / 1024
        self._baseline_net = net_io
        
        # 负载
        load_avg = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else (0, 0, 0)
        
        return SystemMetrics(
            timestamp=time.time(),
            cpu_percent=cpu_percent,
            cpu_per_core=cpu_per_core,
            memory_percent=memory.percent,
            memory_used_mb=memory.used / 1024 / 1024,
            memory_available_mb=memory.available / 1024 / 1024,
            disk_io_read_mb=disk_read_mb,
            disk_io_write_mb=disk_write_mb,
            net_io_sent_mb=net_sent_mb,
            net_io_recv_mb=net_recv_mb,
            load_average=load_avg
        )
    
    def get_current_metrics(self) -> SystemMetrics:
        """
        获取当前指标
        
        Returns:
            SystemMetrics: 当前指标
        """
        return self._collect_metrics()
    
    def get_average_metrics(self, duration: int = 60) -> Dict:
        """
        获取平均指标
        
        Args:
            duration: 时间窗口（秒）
            
        Returns:
            dict: 平均指标
        """
        cutoff = time.time() - duration
        recent = [m for m in self.history if m.timestamp >= cutoff]
        
        if not recent:
            return {}
        
        return {
            "avg_cpu": sum(m.cpu_percent for m in recent) / len(recent),
            "avg_memory": sum(m.memory_percent for m in recent) / len(recent),
            "avg_disk_read": sum(m.disk_io_read_mb for m in recent) / len(recent),
            "avg_disk_write": sum(m.disk_io_write_mb for m in recent) / len(recent),
            "avg_net_sent": sum(m.net_io_sent_mb for m in recent) / len(recent),
            "avg_net_recv": sum(m.net_io_recv_mb for m in recent) / len(recent),
            "max_cpu": max(m.cpu_percent for m in recent),
            "max_memory": max(m.memory_percent for m in recent),
            "samples": len(recent)
        }
    
    def detect_anomalies(self, threshold: float = 90.0) -> List[Dict]:
        """
        检测异常
        
        Args:
            threshold: 异常阈值
            
        Returns:
            list: 异常列表
        """
        anomalies = []
        
        for metric in self.history:
            if metric.cpu_percent > threshold:
                anomalies.append({
                    "timestamp": metric.timestamp,
                    "type": "cpu_high",
                    "value": metric.cpu_percent
                })
            
            if metric.memory_percent > threshold:
                anomalies.append({
                    "timestamp": metric.timestamp,
                    "type": "memory_high",
                    "value": metric.memory_percent
                })
        
        return anomalies

class GPUMonitor:
    """
    GPU监控器
    监控NVIDIA GPU状态
    """
    def __init__(self):
        self.has_pynvml = False
        try:
            import pynvml
            pynvml.nvmlInit()
            self.has_pynvml = True
            self.pynvml = pynvml
        except ImportError:
            pass
    
    def get_gpu_info(self) -> List[Dict]:
        """
        获取GPU信息
        
        Returns:
            list: GPU信息列表
        """
        if not self.has_pynvml:
            return []
        
        gpu_count = self.pynvml.nvmlDeviceGetCount()
        gpus = []
        
        for i in range(gpu_count):
            handle = self.pynvml.nvmlDeviceGetHandleByIndex(i)
            
            # 利用率
            utilization = self.pynvml.nvmlDeviceGetUtilizationRates(handle)
            
            # 显存
            mem_info = self.pynvml.nvmlDeviceGetMemoryInfo(handle)
            
            # 温度
            temperature = self.pynvml.nvmlDeviceGetTemperature(
                handle, self.pynvml.NVML_TEMPERATURE_GPU
            )
            
            # 功耗
            power = self.pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0
            
            gpus.append({
                "index": i,
                "name": self.pynvml.nvmlDeviceGetName(handle),
                "gpu_utilization": utilization.gpu,
                "memory_utilization": utilization.memory,
                "memory_total_mb": mem_info.total / 1024 / 1024,
                "memory_used_mb": mem_info.used / 1024 / 1024,
                "memory_free_mb": mem_info.free / 1024 / 1024,
                "temperature_c": temperature,
                "power_w": power
            })
        
        return gpus
```

## 帧率监控与丢帧根因定位

前端性能监控技术。

- FPS实时监控
- 帧时间分析
- 丢帧根因定位
- 性能瓶颈识别

### 帧率监控器

```python
import time
from typing import List, Dict, Optional, Callable
from collections import deque
import threading

class FrameRateMonitor:
    """
    帧率监控器
    监控应用渲染帧率
    """
    def __init__(self, target_fps: int = 60):
        """
        初始化监控器
        
        Args:
            target_fps: 目标帧率
        """
        self.target_fps = target_fps
        self.target_frame_time = 1000.0 / target_fps  # ms
        
        self.frame_times: deque = deque(maxlen=120)
        self.frame_history: deque = deque(maxlen=3600)
        
        self._last_frame_time = None
        self._dropped_frames = 0
        self._total_frames = 0
        
        self._callbacks: List[Callable] = []
    
    def on_frame_rendered(self):
        """记录帧渲染完成"""
        current_time = time.time() * 1000  # ms
        
        if self._last_frame_time is not None:
            frame_time = current_time - self._last_frame_time
            self.frame_times.append(frame_time)
            
            self._total_frames += 1
            
            # 检测丢帧
            if frame_time > self.target_frame_time * 1.5:
                dropped = int(frame_time / self.target_frame_time) - 1
                self._dropped_frames += max(0, dropped)
                
                # 触发回调
                for callback in self._callbacks:
                    callback({
                        "type": "frame_drop",
                        "frame_time": frame_time,
                        "dropped": dropped,
                        "timestamp": current_time
                    })
            
            self.frame_history.append({
                "timestamp": current_time,
                "frame_time": frame_time,
                "fps": 1000.0 / frame_time if frame_time > 0 else 0
            })
        
        self._last_frame_time = current_time
    
    def get_current_fps(self) -> float:
        """
        获取当前FPS
        
        Returns:
            float: 当前帧率
        """
        if len(self.frame_times) < 2:
            return 0.0
        
        avg_frame_time = sum(self.frame_times) / len(self.frame_times)
        return 1000.0 / avg_frame_time if avg_frame_time > 0 else 0.0
    
    def get_fps_stats(self) -> Dict:
        """
        获取FPS统计
        
        Returns:
            dict: FPS统计
        """
        if not self.frame_times:
            return {}
        
        times = list(self.frame_times)
        times.sort()
        
        return {
            "current_fps": self.get_current_fps(),
            "avg_frame_time_ms": sum(times) / len(times),
            "min_frame_time_ms": min(times),
            "max_frame_time_ms": max(times),
            "p50_frame_time_ms": times[len(times) // 2],
            "p90_frame_time_ms": times[int(len(times) * 0.9)],
            "p99_frame_time_ms": times[int(len(times) * 0.99)],
            "dropped_frames": self._dropped_frames,
            "total_frames": self._total_frames,
            "drop_rate": self._dropped_frames / max(1, self._total_frames)
        }
    
    def add_callback(self, callback: Callable):
        """
        添加帧事件回调
        
        Args:
            callback: 回调函数
        """
        self._callbacks.append(callback)
    
    def analyze_frame_drops(self) -> List[Dict]:
        """
        分析丢帧原因
        
        Returns:
            list: 丢帧分析结果
        """
        drops = []
        
        for i, frame in enumerate(self.frame_history):
            if frame["frame_time"] > self.target_frame_time * 1.5:
                # 分析前后帧
                prev_frame = self.frame_history[i-1] if i > 0 else None
                next_frame = self.frame_history[i+1] if i < len(self.frame_history)-1 else None
                
                drops.append({
                    "timestamp": frame["timestamp"],
                    "frame_time": frame["frame_time"],
                    "prev_frame_time": prev_frame["frame_time"] if prev_frame else None,
                    "next_frame_time": next_frame["frame_time"] if next_frame else None,
                    "severity": "critical" if frame["frame_time"] > self.target_frame_time * 3 else "warning"
                })
        
        return drops
```

## 内存泄漏自动化检测

内存问题自动发现技术。

- 堆内存监控
- 对象引用分析
- 泄漏模式识别
- 自动化报告

### 内存泄漏检测器

```python
import tracemalloc
import gc
import objgraph
from typing import Dict, List, Optional
import time

class MemoryLeakDetector:
    """
    内存泄漏检测器
    自动检测和定位内存泄漏
    """
    def __init__(self):
        self.tracing = False
        self.snapshots: List = []
        self.baseline_snapshot = None
    
    def start_tracing(self):
        """开始追踪内存"""
        tracemalloc.start()
        self.tracing = True
        gc.collect()
        self.baseline_snapshot = tracemalloc.take_snapshot()
    
    def stop_tracing(self):
        """停止追踪内存"""
        tracemalloc.stop()
        self.tracing = False
    
    def take_snapshot(self, label: str = ""):
        """
        拍摄内存快照
        
        Args:
            label: 快照标签
        """
        if not self.tracing:
            raise RuntimeError("内存追踪未启动")
        
        gc.collect()
        snapshot = tracemalloc.take_snapshot()
        snapshot.label = label
        self.snapshots.append(snapshot)
    
    def compare_snapshots(self, snapshot1, snapshot2,
                         top_n: int = 10) -> List[Dict]:
        """
        比较两个快照
        
        Args:
            snapshot1: 第一个快照
            snapshot2: 第二个快照
            top_n: 显示前N个差异
            
        Returns:
            list: 差异列表
        """
        top_stats = snapshot2.compare_to(snapshot1, 'lineno')
        
        differences = []
        for stat in top_stats[:top_n]:
            differences.append({
                "file": stat.traceback.format()[-1],
                "size_diff": stat.size_diff,
                "size": stat.size,
                "count_diff": stat.count_diff,
                "count": stat.count
            })
        
        return differences
    
    def detect_leaks(self, threshold_mb: float = 10.0) -> Dict:
        """
        检测内存泄漏
        
        Args:
            threshold_mb: 泄漏阈值（MB）
            
        Returns:
            dict: 泄漏检测结果
        """
        if len(self.snapshots) < 2:
            return {"error": "需要至少2个快照"}
        
        first = self.snapshots[0]
        last = self.snapshots[-1]
        
        differences = self.compare_snapshots(first, last, top_n=20)
        
        # 过滤显著增长
        leaks = [d for d in differences if d["size_diff"] > threshold_mb * 1024 * 1024]
        
        # 获取增长趋势
        total_growth = sum(d["size_diff"] for d in differences if d["size_diff"] > 0)
        
        return {
            "has_leak": len(leaks) > 0,
            "total_growth_mb": total_growth / 1024 / 1024,
            "leak_count": len(leaks),
            "leaks": leaks,
            "snapshot_count": len(self.snapshots)
        }
    
    def find_growing_objects(self, obj_type: str = None) -> Dict:
        """
        查找增长的对象
        
        Args:
            obj_type: 对象类型
            
        Returns:
            dict: 对象增长信息
        """
        gc.collect()
        
        if obj_type:
            count = objgraph.count(obj_type)
            objects = objgraph.by_type(obj_type)
            
            return {
                "type": obj_type,
                "count": count,
                "sample_objects": [str(obj) for obj in objects[:5]]
            }
        else:
            # 获取所有类型计数
            type_counts = {}
            for obj in gc.get_objects():
                obj_type = type(obj).__name__
                type_counts[obj_type] = type_counts.get(obj_type, 0) + 1
            
            # 排序
            sorted_types = sorted(type_counts.items(), 
                                 key=lambda x: x[1], reverse=True)[:20]
            
            return {
                "top_types": [
                    {"type": t, "count": c} for t, c in sorted_types
                ]
            }
    
    def generate_report(self) -> Dict:
        """
        生成内存分析报告
        
        Returns:
            dict: 分析报告
        """
        current, peak = tracemalloc.get_traced_memory()
        
        report = {
            "current_memory_mb": current / 1024 / 1024,
            "peak_memory_mb": peak / 1024 / 1024,
            "snapshot_count": len(self.snapshots),
            "leak_detection": self.detect_leaks() if len(self.snapshots) >= 2 else None,
            "top_allocations": self._get_top_allocations()
        }
        
        return report
    
    def _get_top_allocations(self, top_n: int = 10) -> List[Dict]:
        """
        获取顶部内存分配
        
        Args:
            top_n: 前N个
            
        Returns:
            list: 分配信息
        """
        if not self.tracing:
            return []
        
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')[:top_n]
        
        return [
            {
                "file": stat.traceback.format()[-1],
                "size_mb": stat.size / 1024 / 1024,
                "count": stat.count
            }
            for stat in top_stats
        ]

class PerformanceProfiler:
    """
    性能分析器
    综合性能分析工具
    """
    def __init__(self):
        self.system_monitor = SystemMonitor()
        self.frame_monitor = FrameRateMonitor()
        self.memory_detector = MemoryLeakDetector()
    
    def start_full_profiling(self):
        """启动全面性能分析"""
        self.system_monitor.start_monitoring(interval=1.0)
        self.memory_detector.start_tracing()
    
    def stop_full_profiling(self) -> Dict:
        """
        停止分析并生成报告
        
        Returns:
            dict: 综合性能报告
        """
        self.system_monitor.stop_monitoring()
        self.memory_detector.stop_tracing()
        
        return {
            "system_metrics": self.system_monitor.get_average_metrics(),
            "frame_stats": self.frame_monitor.get_fps_stats(),
            "memory_report": self.memory_detector.generate_report(),
            "anomalies": self.system_monitor.detect_anomalies()
        }
```

## 性能测试报告模板

```python
class PerformanceReportGenerator:
    """
    性能报告生成器
    生成标准化的性能测试报告
    """
    def __init__(self):
        self.sections = []
    
    def add_section(self, title: str, data: Dict):
        """
        添加报告章节
        
        Args:
            title: 章节标题
            data: 章节数据
        """
        self.sections.append({"title": title, "data": data})
    
    def generate_markdown(self) -> str:
        """
        生成Markdown报告
        
        Returns:
            str: Markdown格式报告
        """
        lines = ["# 性能测试报告\n"]
        lines.append(f"生成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        for section in self.sections:
            lines.append(f"\n## {section['title']}\n")
            lines.append(self._dict_to_markdown(section['data']))
        
        return "\n".join(lines)
    
    def _dict_to_markdown(self, data: Dict, level: int = 0) -> str:
        """
        字典转Markdown
        
        Args:
            data: 数据字典
            level: 缩进级别
            
        Returns:
            str: Markdown文本
        """
        lines = []
        indent = "  " * level
        
        for key, value in data.items():
            if isinstance(value, dict):
                lines.append(f"{indent}- **{key}**:")
                lines.append(self._dict_to_markdown(value, level + 1))
            elif isinstance(value, list):
                lines.append(f"{indent}- **{key}**: {len(value)} items")
                for item in value[:5]:  # 只显示前5个
                    lines.append(f"{indent}  - {item}")
            else:
                lines.append(f"{indent}- **{key}**: {value}")
        
        return "\n".join(lines)
```

## 最佳实践

1. **基线建立**：建立性能基线用于对比
2. **持续监控**：7x24小时性能监控
3. **告警阈值**：设置合理的告警阈值
4. **关联分析**：多指标关联定位根因
5. **趋势预测**：基于历史数据预测容量
