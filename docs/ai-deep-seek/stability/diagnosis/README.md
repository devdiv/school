# 全流程自动化诊断工具链

从告警到根因的自动化诊断体系。

## 监控告警→日志抓取→特征提取→LLM推理→缺陷单自动创建

完整的自动化诊断流水线。

- 告警事件触发
- 关联日志自动收集
- 特征工程与向量化
- LLM智能推理
- 工单自动创建与分派

### 自动化诊断流水线

```python
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
import time
import json

@dataclass
class AlertEvent:
    """告警事件"""
    id: str
    severity: str
    service: str
    metric: str
    threshold: float
    current_value: float
    timestamp: datetime
    description: str
    tags: Dict = None

@dataclass
class DiagnosisResult:
    """诊断结果"""
    alert_id: str
    root_cause: str
    confidence: float
    evidence: List[str]
    affected_services: List[str]
    suggested_actions: List[str]
    auto_created_ticket: bool
    ticket_id: Optional[str] = None

class AutoDiagnosisPipeline:
    """
    自动化诊断流水线
    实现从告警到诊断的全流程自动化
    """
    def __init__(self, 
                 log_collector=None,
                 metric_fetcher=None,
                 llm_client=None,
                 ticket_system=None):
        """
        初始化流水线
        
        Args:
            log_collector: 日志收集器
            metric_fetcher: 指标获取器
            llm_client: LLM客户端
            ticket_system: 工单系统
        """
        self.log_collector = log_collector
        self.metric_fetcher = metric_fetcher
        self.llm_client = llm_client
        self.ticket_system = ticket_system
        
        self.diagnosis_history: List[DiagnosisResult] = []
        self._handlers: List[Callable] = []
    
    def on_alert(self, alert: AlertEvent) -> DiagnosisResult:
        """
        处理告警事件
        
        Args:
            alert: 告警事件
            
        Returns:
            DiagnosisResult: 诊断结果
        """
        print(f"收到告警: [{alert.severity}] {alert.service} - {alert.metric}")
        
        # 1. 收集关联数据
        context = self._collect_context(alert)
        
        # 2. 特征提取
        features = self._extract_features(context)
        
        # 3. LLM推理
        diagnosis = self._llm_diagnose(alert, context, features)
        
        # 4. 创建工单
        ticket_id = None
        if alert.severity in ["critical", "high"]:
            ticket_id = self._create_ticket(alert, diagnosis)
            diagnosis.auto_created_ticket = True
            diagnosis.ticket_id = ticket_id
        
        # 5. 记录历史
        self.diagnosis_history.append(diagnosis)
        
        # 6. 触发回调
        for handler in self._handlers:
            handler(diagnosis)
        
        return diagnosis
    
    def _collect_context(self, alert: AlertEvent) -> Dict:
        """
        收集告警上下文
        
        Args:
            alert: 告警事件
            
        Returns:
            dict: 上下文数据
        """
        context = {
            "alert": alert,
            "timestamp": datetime.now()
        }
        
        # 收集日志
        if self.log_collector:
            start_time = alert.timestamp - timedelta(minutes=10)
            end_time = alert.timestamp + timedelta(minutes=5)
            
            logs = self.log_collector.collect(
                service=alert.service,
                start_time=start_time,
                end_time=end_time,
                levels=["ERROR", "WARN", "INFO"]
            )
            context["logs"] = logs
        
        # 收集指标
        if self.metric_fetcher:
            metrics = self.metric_fetcher.get_metrics(
                service=alert.service,
                metrics=["cpu", "memory", "qps", "latency", "error_rate"],
                duration="30m"
            )
            context["metrics"] = metrics
        
        # 收集相关服务状态
        context["related_services"] = self._find_related_services(alert)
        
        return context
    
    def _find_related_services(self, alert: AlertEvent) -> List[Dict]:
        """
        查找相关服务
        
        Args:
            alert: 告警事件
            
        Returns:
            list: 相关服务状态
        """
        # 基于依赖拓扑查找
        # 简化实现
        return []
    
    def _extract_features(self, context: Dict) -> Dict:
        """
        提取诊断特征
        
        Args:
            context: 上下文数据
            
        Returns:
            dict: 特征数据
        """
        features = {
            "alert_severity": context["alert"].severity,
            "alert_service": context["alert"].service,
            "alert_metric": context["alert"].metric,
            "log_count": len(context.get("logs", [])),
            "error_count": sum(1 for l in context.get("logs", []) 
                             if l.level in ["ERROR", "FATAL"]),
            "unique_error_types": len(set(
                l.message for l in context.get("logs", [])
                if l.level == "ERROR"
            ))
        }
        
        # 指标特征
        metrics = context.get("metrics", {})
        if metrics:
            features["cpu_avg"] = metrics.get("cpu", {}).get("avg", 0)
            features["memory_avg"] = metrics.get("memory", {}).get("avg", 0)
            features["error_rate"] = metrics.get("error_rate", {}).get("avg", 0)
        
        return features
    
    def _llm_diagnose(self, alert: AlertEvent,
                     context: Dict,
                     features: Dict) -> DiagnosisResult:
        """
        LLM智能诊断
        
        Args:
            alert: 告警事件
            context: 上下文
            features: 特征
            
        Returns:
            DiagnosisResult: 诊断结果
        """
        if not self.llm_client:
            # 降级到规则诊断
            return self._rule_based_diagnose(alert, features)
        
        # 构建诊断提示
        prompt = self._build_diagnosis_prompt(alert, context, features)
        
        # 调用LLM
        # response = self.llm_client.complete(prompt)
        # 解析响应
        
        return DiagnosisResult(
            alert_id=alert.id,
            root_cause="需要LLM分析",
            confidence=0.5,
            evidence=["日志分析", "指标关联"],
            affected_services=[alert.service],
            suggested_actions=["查看详细日志", "检查依赖服务"],
            auto_created_ticket=False
        )
    
    def _rule_based_diagnose(self, alert: AlertEvent,
                            features: Dict) -> DiagnosisResult:
        """
        基于规则的诊断（降级方案）
        
        Args:
            alert: 告警事件
            features: 特征
            
        Returns:
            DiagnosisResult: 诊断结果
        """
        root_cause = "未知"
        confidence = 0.3
        suggestions = []
        
        if alert.metric == "cpu_usage" and alert.current_value > 90:
            root_cause = "CPU使用率过高"
            confidence = 0.7
            suggestions = ["检查高CPU进程", "扩容实例", "优化代码"]
        
        elif alert.metric == "memory_usage" and alert.current_value > 90:
            root_cause = "内存使用率过高"
            confidence = 0.7
            suggestions = ["检查内存泄漏", "增加内存配额", "重启服务"]
        
        elif alert.metric == "error_rate" and alert.current_value > 0.1:
            root_cause = "错误率异常升高"
            confidence = 0.6
            suggestions = ["查看错误日志", "检查上游服务", "回滚版本"]
        
        elif features.get("error_count", 0) > 10:
            root_cause = "大量错误日志"
            confidence = 0.6
            suggestions = ["分析错误模式", "检查配置变更"]
        
        return DiagnosisResult(
            alert_id=alert.id,
            root_cause=root_cause,
            confidence=confidence,
            evidence=[f"指标: {alert.metric}={alert.current_value}"],
            affected_services=[alert.service],
            suggested_actions=suggestions,
            auto_created_ticket=False
        )
    
    def _build_diagnosis_prompt(self, alert: AlertEvent,
                               context: Dict,
                               features: Dict) -> str:
        """
        构建诊断提示
        
        Args:
            alert: 告警事件
            context: 上下文
            features: 特征
            
        Returns:
            str: 提示文本
        """
        logs_summary = "\n".join([
            f"- [{l.timestamp}] {l.level}: {l.message[:200]}"
            for l in context.get("logs", [])[:20]
        ])
        
        return f"""作为SRE专家，请分析以下告警并给出根因诊断：

告警信息：
- 服务: {alert.service}
- 指标: {alert.metric}
- 当前值: {alert.current_value}
- 阈值: {alert.threshold}
- 严重级别: {alert.severity}
- 描述: {alert.description}

相关日志：
{logs_summary}

特征摘要：
- 日志总数: {features.get('log_count', 0)}
- 错误数: {features.get('error_count', 0)}
- 唯一错误类型: {features.get('unique_error_types', 0)}

请提供JSON格式的诊断结果：
{{
    "root_cause": "根因描述",
    "confidence": 0.8,
    "evidence": ["证据1", "证据2"],
    "affected_services": ["服务1"],
    "suggested_actions": ["建议1", "建议2"]
}}
"""
    
    def _create_ticket(self, alert: AlertEvent,
                      diagnosis: DiagnosisResult) -> Optional[str]:
        """
        自动创建工单
        
        Args:
            alert: 告警事件
            diagnosis: 诊断结果
            
        Returns:
            str: 工单ID
        """
        if not self.ticket_system:
            return None
        
        ticket_data = {
            "title": f"[{alert.severity}] {alert.service}: {alert.metric}异常",
            "description": f"""
告警ID: {alert.id}
服务: {alert.service}
指标: {alert.metric}
当前值: {alert.current_value}
阈值: {alert.threshold}

AI诊断结果：
根因: {diagnosis.root_cause}
置信度: {diagnosis.confidence}

建议操作：
{chr(10).join('- ' + a for a in diagnosis.suggested_actions)}
            """,
            "priority": alert.severity,
            "labels": [alert.service, "auto-diagnosed", alert.metric],
            "assignee": self._suggest_assignee(alert, diagnosis)
        }
        
        return self.ticket_system.create(ticket_data)
    
    def _suggest_assignee(self, alert: AlertEvent,
                         diagnosis: DiagnosisResult) -> Optional[str]:
        """
        建议处理人
        
        Args:
            alert: 告警事件
            diagnosis: 诊断结果
            
        Returns:
            str: 处理人
        """
        # 基于服务-团队映射
        # 简化实现
        return None
    
    def add_handler(self, handler: Callable):
        """
        添加诊断结果处理器
        
        Args:
            handler: 处理函数
        """
        self._handlers.append(handler)
```

## 诊断知识库构建

诊断经验沉淀与复用。

- 历史诊断记录
- 模式库构建
- 相似案例检索
- 知识图谱

### 诊断知识库

```python
class DiagnosisKnowledgeBase:
    """
    诊断知识库
    存储和管理诊断知识
    """
    def __init__(self, storage_path: str = "./diagnosis_kb"):
        """
        初始化知识库
        
        Args:
            storage_path: 存储路径
        """
        self.storage_path = storage_path
        self.cases: List[Dict] = []
        self.patterns: Dict[str, List] = {}
    
    def add_case(self, diagnosis: DiagnosisResult,
                context: Dict,
                resolution: str = None):
        """
        添加诊断案例
        
        Args:
            diagnosis: 诊断结果
            context: 上下文
            resolution: 解决方案
        """
        case = {
            "id": f"case_{int(time.time())}",
            "alert_id": diagnosis.alert_id,
            "root_cause": diagnosis.root_cause,
            "service": context.get("alert", {}).service,
            "metric": context.get("alert", {}).metric,
            "features": self._extract_feature_signature(context),
            "resolution": resolution,
            "timestamp": datetime.now().isoformat(),
            "success": resolution is not None
        }
        
        self.cases.append(case)
        
        # 更新模式
        pattern_key = f"{case['service']}:{case['metric']}"
        if pattern_key not in self.patterns:
            self.patterns[pattern_key] = []
        self.patterns[pattern_key].append(case)
    
    def find_similar_cases(self, alert: AlertEvent,
                          context: Dict,
                          top_k: int = 5) -> List[Dict]:
        """
        查找相似案例
        
        Args:
            alert: 告警事件
            context: 上下文
            top_k: 返回数量
            
        Returns:
            list: 相似案例
        """
        pattern_key = f"{alert.service}:{alert.metric}"
        candidates = self.patterns.get(pattern_key, [])
        
        if not candidates:
            return []
        
        # 简单相似度计算
        current_features = self._extract_feature_signature(context)
        
        scored = []
        for case in candidates:
            score = self._calculate_similarity(current_features, case["features"])
            scored.append((score, case))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        
        return [case for _, case in scored[:top_k]]
    
    def _extract_feature_signature(self, context: Dict) -> Dict:
        """
        提取特征签名
        
        Args:
            context: 上下文
            
        Returns:
            dict: 特征签名
        """
        logs = context.get("logs", [])
        
        return {
            "error_keywords": self._extract_keywords(
                [l.message for l in logs if l.level == "ERROR"]
            ),
            "log_level_distribution": {
                level: sum(1 for l in logs if l.level == level)
                for level in set(l.level for l in logs)
            }
        }
    
    def _extract_keywords(self, messages: List[str]) -> List[str]:
        """
        提取关键词
        
        Args:
            messages: 消息列表
            
        Returns:
            list: 关键词列表
        """
        # 简化实现
        keywords = []
        for msg in messages:
            words = msg.lower().split()
            keywords.extend(words)
        
        from collections import Counter
        return [word for word, count in Counter(keywords).most_common(10)]
    
    def _calculate_similarity(self, features1: Dict,
                             features2: Dict) -> float:
        """
        计算特征相似度
        
        Args:
            features1: 特征1
            features2: 特征2
            
        Returns:
            float: 相似度
        """
        # 简化实现
        return 0.5
    
    def get_common_root_causes(self, service: str = None,
                               limit: int = 10) -> List[Dict]:
        """
        获取常见根因
        
        Args:
            service: 服务过滤
            limit: 数量限制
            
        Returns:
            list: 常见根因
        """
        from collections import Counter
        
        cases = self.cases
        if service:
            cases = [c for c in cases if c["service"] == service]
        
        causes = Counter(c["root_cause"] for c in cases)
        
        return [
            {"root_cause": cause, "count": count}
            for cause, count in causes.most_common(limit)
        ]
```

## 最佳实践

1. **数据质量**：确保监控数据的准确性和完整性
2. **上下文丰富**：收集足够的上下文用于诊断
3. **人机协同**：AI诊断+人工确认
4. **持续学习**：从每次诊断中学习和优化
5. **反馈闭环**：诊断结果反馈到知识库
