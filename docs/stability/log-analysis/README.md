# 日志智能解析与根因分析

日志数据驱动的智能分析技术。

## 分布式日志采集与结构化处理

大规模日志处理架构。

- ELK/EFK日志栈
- 日志结构化解析
- 多源日志聚合
- 实时流处理

### 日志采集与处理

```python
from typing import Dict, List, Optional, Iterator
import json
import re
from datetime import datetime
from dataclasses import dataclass
import hashlib

@dataclass
class LogEntry:
    """结构化日志条目"""
    timestamp: datetime
    level: str
    service: str
    message: str
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    metadata: Dict = None
    raw_log: str = ""
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            "timestamp": self.timestamp.isoformat(),
            "level": self.level,
            "service": self.service,
            "message": self.message,
            "trace_id": self.trace_id,
            "span_id": self.span_id,
            "metadata": self.metadata or {}
        }

class LogParser:
    """
    日志解析器
    将非结构化日志转为结构化数据
    """
    def __init__(self):
        # 常见日志格式正则
        self.patterns = {
            "standard": re.compile(
                r'(?P<timestamp>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.,]?\d*)\s+'
                r'(?P<level>\w+)\s+'
                r'\[(?P<service>[^\]]+)\]\s+'
                r'(?P<message>.*)'
            ),
            "simple": re.compile(
                r'\[(?P<level>\w+)\]\s+(?P<message>.*)'
            ),
            "json": re.compile(r'\{.*\}')
        }
    
    def parse(self, raw_log: str, service: str = "unknown") -> LogEntry:
        """
        解析单条日志
        
        Args:
            raw_log: 原始日志字符串
            service: 服务名称
            
        Returns:
            LogEntry: 结构化日志条目
        """
        # 尝试JSON格式
        try:
            data = json.loads(raw_log)
            return LogEntry(
                timestamp=self._parse_timestamp(data.get("timestamp", "")),
                level=data.get("level", "INFO"),
                service=data.get("service", service),
                message=data.get("message", ""),
                trace_id=data.get("trace_id"),
                span_id=data.get("span_id"),
                metadata={k: v for k, v in data.items() 
                         if k not in ["timestamp", "level", "service", "message", "trace_id", "span_id"]},
                raw_log=raw_log
            )
        except json.JSONDecodeError:
            pass
        
        # 尝试标准格式
        for pattern_name, pattern in self.patterns.items():
            if pattern_name == "json":
                continue
            
            match = pattern.match(raw_log)
            if match:
                groups = match.groupdict()
                return LogEntry(
                    timestamp=self._parse_timestamp(groups.get("timestamp", "")),
                    level=groups.get("level", "INFO"),
                    service=service,
                    message=groups.get("message", ""),
                    raw_log=raw_log
                )
        
        # 无法解析，返回原始内容
        return LogEntry(
            timestamp=datetime.now(),
            level="UNKNOWN",
            service=service,
            message=raw_log,
            raw_log=raw_log
        )
    
    def _parse_timestamp(self, ts_str: str) -> datetime:
        """
        解析时间戳
        
        Args:
            ts_str: 时间戳字符串
            
        Returns:
            datetime: 解析后的时间
        """
        formats = [
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S,%f"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(ts_str, fmt)
            except ValueError:
                continue
        
        return datetime.now()
    
    def parse_batch(self, logs: List[str], 
                   service: str = "unknown") -> List[LogEntry]:
        """
        批量解析日志
        
        Args:
            logs: 日志列表
            service: 服务名称
            
        Returns:
            list: 结构化日志列表
        """
        return [self.parse(log, service) for log in logs]

class LogAggregator:
    """
    日志聚合器
    聚合多源日志数据
    """
    def __init__(self):
        self.logs: List[LogEntry] = []
        self.index_by_service: Dict[str, List[int]] = {}
        self.index_by_trace: Dict[str, List[int]] = {}
    
    def add_logs(self, entries: List[LogEntry]):
        """
        添加日志条目
        
        Args:
            entries: 日志条目列表
        """
        for entry in entries:
            idx = len(self.logs)
            self.logs.append(entry)
            
            # 按服务索引
            if entry.service not in self.index_by_service:
                self.index_by_service[entry.service] = []
            self.index_by_service[entry.service].append(idx)
            
            # 按Trace索引
            if entry.trace_id:
                if entry.trace_id not in self.index_by_trace:
                    self.index_by_trace[entry.trace_id] = []
                self.index_by_trace[entry.trace_id].append(idx)
    
    def get_by_service(self, service: str, 
                      level: str = None) -> List[LogEntry]:
        """
        按服务获取日志
        
        Args:
            service: 服务名称
            level: 日志级别过滤
            
        Returns:
            list: 日志列表
        """
        indices = self.index_by_service.get(service, [])
        logs = [self.logs[i] for i in indices]
        
        if level:
            logs = [l for l in logs if l.level == level]
        
        return logs
    
    def get_by_trace(self, trace_id: str) -> List[LogEntry]:
        """
        按Trace获取日志
        
        Args:
            trace_id: Trace ID
            
        Returns:
            list: 相关日志列表
        """
        indices = self.index_by_trace.get(trace_id, [])
        return [self.logs[i] for i in indices]
    
    def get_error_traces(self) -> List[str]:
        """
        获取包含错误的Trace
        
        Returns:
            list: Trace ID列表
        """
        error_traces = set()
        
        for entry in self.logs:
            if entry.level in ["ERROR", "FATAL", "CRITICAL"] and entry.trace_id:
                error_traces.add(entry.trace_id)
        
        return list(error_traces)
```

## 异常模式挖掘

日志异常检测技术。

- 统计异常检测
- 序列模式挖掘
- 聚类分析
- 时序异常检测

### 异常检测引擎

```python
from typing import Dict, List, Tuple
from collections import Counter, defaultdict
import numpy as np
from datetime import timedelta

class LogAnomalyDetector:
    """
    日志异常检测器
    基于多种方法检测日志异常
    """
    def __init__(self):
        self.pattern_templates = {}
        self.normal_patterns = set()
        self.frequency_baseline = {}
    
    def extract_pattern(self, message: str) -> str:
        """
        提取日志模式模板
        
        Args:
            message: 日志消息
            
        Returns:
            str: 模式模板
        """
        # 替换变量部分
        pattern = message
        
        # 替换数字
        pattern = re.sub(r'\b\d+\b', '<NUM>', pattern)
        
        # 替换IP地址
        pattern = re.sub(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '<IP>', pattern)
        
        # 替换UUID
        pattern = re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '<UUID>', pattern, flags=re.I)
        
        # 替换URL
        pattern = re.sub(r'https?://[^\s]+', '<URL>', pattern)
        
        # 替换路径
        pattern = re.sub(r'/[a-zA-Z0-9_/.-]+', '<PATH>', pattern)
        
        return pattern
    
    def build_baseline(self, logs: List[LogEntry]):
        """
        建立正常行为基线
        
        Args:
            logs: 训练日志
        """
        patterns = Counter()
        service_patterns = defaultdict(Counter)
        
        for log in logs:
            pattern = self.extract_pattern(log.message)
            patterns[pattern] += 1
            service_patterns[log.service][pattern] += 1
        
        # 存储基线
        self.normal_patterns = set(patterns.keys())
        
        total = sum(patterns.values())
        self.frequency_baseline = {
            p: c / total for p, c in patterns.items()
        }
    
    def detect_anomalies(self, logs: List[LogEntry]) -> List[Dict]:
        """
        检测异常日志
        
        Args:
            logs: 待检测日志
            
        Returns:
            list: 异常列表
        """
        anomalies = []
        
        for log in logs:
            pattern = self.extract_pattern(log.message)
            
            # 新模式检测
            if pattern not in self.normal_patterns:
                anomalies.append({
                    "type": "new_pattern",
                    "log": log,
                    "pattern": pattern,
                    "severity": "warning"
                })
                continue
            
            # 频率异常检测
            # 这里可以添加更复杂的频率分析
        
        return anomalies
    
    def detect_burst(self, logs: List[LogEntry],
                    time_window: int = 60,
                    threshold: int = 100) -> List[Dict]:
        """
        检测日志突增
        
        Args:
            logs: 日志列表
            time_window: 时间窗口（秒）
            threshold: 阈值
            
        Returns:
            list: 突增事件
        """
        if not logs:
            return []
        
        # 按时间窗口分组
        buckets = defaultdict(int)
        
        for log in logs:
            bucket_time = log.timestamp.replace(
                second=(log.timestamp.second // time_window) * time_window,
                microsecond=0
            )
            buckets[bucket_time] += 1
        
        # 检测突增
        bursts = []
        avg_count = sum(buckets.values()) / len(buckets) if buckets else 0
        
        for bucket_time, count in buckets.items():
            if count > max(threshold, avg_count * 3):
                bursts.append({
                    "time": bucket_time,
                    "count": count,
                    "avg": avg_count,
                    "severity": "critical" if count > avg_count * 5 else "warning"
                })
        
        return bursts
    
    def detect_sequence_anomaly(self, logs: List[LogEntry]) -> List[Dict]:
        """
        检测序列异常
        
        Args:
            logs: 日志列表
            
        Returns:
            list: 序列异常
        """
        # 按Trace分组
        trace_logs = defaultdict(list)
        for log in logs:
            if log.trace_id:
                trace_logs[log.trace_id].append(log)
        
        anomalies = []
        
        for trace_id, trace in trace_logs.items():
            # 检查错误后是否有成功日志（异常）
            has_error = False
            for log in trace:
                if log.level in ["ERROR", "FATAL"]:
                    has_error = True
                elif has_error and log.level == "INFO":
                    anomalies.append({
                        "type": "sequence_anomaly",
                        "trace_id": trace_id,
                        "description": "错误后出现成功日志",
                        "log": log
                    })
        
        return anomalies
```

## LLM驱动的日志语义理解与故障归因

大模型赋能的日志分析。

- 日志语义理解
- 故障根因推断
- 智能告警聚合
- 修复建议生成

### LLM日志分析器

```python
class LLMLogAnalyzer:
    """
    LLM驱动的日志分析器
    利用大模型进行深度日志分析
    """
    def __init__(self, llm_client=None):
        """
        初始化分析器
        
        Args:
            llm_client: LLM客户端
        """
        self.llm = llm_client
    
    def summarize_logs(self, logs: List[LogEntry],
                      max_logs: int = 50) -> str:
        """
        总结日志内容
        
        Args:
            logs: 日志列表
            max_logs: 最大分析数量
            
        Returns:
            str: 总结文本
        """
        if not self.llm:
            return "LLM未配置"
        
        # 构建提示
        log_text = "\n".join([
            f"[{l.timestamp}] [{l.level}] {l.service}: {l.message}"
            for l in logs[:max_logs]
        ])
        
        prompt = f"""请分析以下系统日志，总结关键问题和异常：

{log_text}

请提供：
1. 主要问题概述
2. 异常模式识别
3. 可能的影响范围
4. 建议的排查方向
"""
        
        # 调用LLM
        # response = self.llm.complete(prompt)
        # return response
        
        return "LLM分析结果（需要配置LLM客户端）"
    
    def root_cause_analysis(self, error_logs: List[LogEntry],
                           context_logs: List[LogEntry]) -> Dict:
        """
        根因分析
        
        Args:
            error_logs: 错误日志
            context_logs: 上下文日志
            
        Returns:
            dict: 根因分析结果
        """
        if not self.llm:
            return {"error": "LLM未配置"}
        
        error_text = "\n".join([l.message for l in error_logs])
        context_text = "\n".join([l.message for l in context_logs[-20:]])
        
        prompt = f"""作为系统运维专家，请分析以下故障日志的根因：

错误日志：
{error_text}

上下文日志：
{context_text}

请提供：
1. 根因推断
2. 证据链
3. 置信度评估
4. 修复建议
"""
        
        return {
            "root_cause": "需要LLM分析",
            "confidence": 0.0,
            "evidence": [],
            "suggestions": []
        }
    
    def generate_alert_summary(self, alerts: List[Dict]) -> str:
        """
        生成告警摘要
        
        Args:
            alerts: 告警列表
            
        Returns:
            str: 摘要文本
        """
        alert_text = "\n".join([
            f"- [{a['severity']}] {a['service']}: {a['message']}"
            for a in alerts
        ])
        
        prompt = f"""请对以下告警进行智能聚合和摘要：

{alert_text}

请提供：
1. 告警聚合（将相关告警分组）
2. 优先级排序
3. 处理建议
"""
        
        return "告警摘要（需要LLM配置）"

class IntelligentLogPipeline:
    """
    智能日志处理流水线
    整合日志处理全流程
    """
    def __init__(self):
        self.parser = LogParser()
        self.aggregator = LogAggregator()
        self.anomaly_detector = LogAnomalyDetector()
        self.llm_analyzer = LLMLogAnalyzer()
    
    def process_logs(self, raw_logs: List[str],
                    service: str = "unknown") -> Dict:
        """
        处理日志流水线
        
        Args:
            raw_logs: 原始日志
            service: 服务名称
            
        Returns:
            dict: 处理结果
        """
        # 1. 解析
        parsed = self.parser.parse_batch(raw_logs, service)
        
        # 2. 聚合
        self.aggregator.add_logs(parsed)
        
        # 3. 异常检测
        anomalies = self.anomaly_detector.detect_anomalies(parsed)
        
        # 4. 突增检测
        bursts = self.anomaly_detector.detect_burst(parsed)
        
        # 5. 序列异常
        seq_anomalies = self.anomaly_detector.detect_sequence_anomaly(parsed)
        
        return {
            "parsed_count": len(parsed),
            "anomalies": anomalies,
            "bursts": bursts,
            "sequence_anomalies": seq_anomalies,
            "error_traces": self.aggregator.get_error_traces()
        }
```

## 最佳实践

1. **统一格式**：推动应用使用结构化日志
2. **Trace关联**：全链路Trace ID传递
3. **采样策略**：高流量场景合理采样
4. **冷热分离**：历史日志归档策略
5. **实时监控**：秒级延迟的异常检测
