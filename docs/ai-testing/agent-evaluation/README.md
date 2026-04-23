# Agent 评测体系构建

构建科学、全面的智能体评测体系，确保Agent在测试流程中的可靠性和有效性。

## 概述

Agent评测体系是AI测试架构的核心组成部分，通过多维度的评估指标，确保智能体能够高质量地完成测试任务。一个完善的评测体系需要覆盖任务完成度、决策合理性、工具调用能力、知识时效性和幻觉率等关键维度。

### 核心价值

- **质量保障**：确保Agent输出符合预期质量标准
- **风险控制**：识别和预防Agent可能产生的问题
- **持续优化**：为Agent改进提供量化依据
- **信任建立**：建立团队对AI系统的信任

### 评测维度框架

```
┌─────────────────────────────────────────────────────────┐
│                  Agent评测体系                           │
├─────────────────────────────────────────────────────────┤
│  任务完成度  │  决策合理性  │  工具调用能力              │
├─────────────────────────────────────────────────────────┤
│  知识时效性  │  幻觉率控制  │  安全合规性                │
└─────────────────────────────────────────────────────────┘
```

## 核心评测维度

### 1. 任务完成度评估

评估Agent完成指定任务的能力和效果。

#### 评估指标

```python
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum

class TaskStatus(Enum):
    """任务状态枚举"""
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"
    TIMEOUT = "timeout"

@dataclass
class TaskMetrics:
    """
    任务完成度指标类
    记录任务执行的各项指标
    """
    task_id: str
    status: TaskStatus
    completion_rate: float
    steps_completed: int
    steps_total: int
    time_taken: float
    retry_count: int
    error_messages: List[str]

class TaskCompletionEvaluator:
    """
    任务完成度评估器
    评估Agent完成任务的能力
    """
    def __init__(self):
        self.evaluation_history: List[TaskMetrics] = []
    
    def evaluate(self, task_result: Dict) -> Dict:
        """
        评估任务完成情况
        
        Args:
            task_result: 任务执行结果
            
        Returns:
            dict: 评估结果
        """
        metrics = self._calculate_metrics(task_result)
        self.evaluation_history.append(metrics)
        
        return {
            "task_id": metrics.task_id,
            "completion_score": self._calculate_completion_score(metrics),
            "efficiency_score": self._calculate_efficiency_score(metrics),
            "reliability_score": self._calculate_reliability_score(metrics),
            "details": metrics.__dict__
        }
    
    def _calculate_metrics(self, result: Dict) -> TaskMetrics:
        """
        计算任务指标
        
        Args:
            result: 任务结果
            
        Returns:
            TaskMetrics: 任务指标对象
        """
        steps_completed = result.get("steps_completed", 0)
        steps_total = result.get("steps_total", 1)
        
        return TaskMetrics(
            task_id=result.get("task_id", ""),
            status=TaskStatus(result.get("status", "failed")),
            completion_rate=steps_completed / steps_total if steps_total > 0 else 0,
            steps_completed=steps_completed,
            steps_total=steps_total,
            time_taken=result.get("time_taken", 0),
            retry_count=result.get("retry_count", 0),
            error_messages=result.get("errors", [])
        )
    
    def _calculate_completion_score(self, metrics: TaskMetrics) -> float:
        """
        计算完成度得分
        
        Args:
            metrics: 任务指标
            
        Returns:
            float: 完成度得分
        """
        if metrics.status == TaskStatus.COMPLETED:
            base_score = 100
        elif metrics.status == TaskStatus.PARTIAL:
            base_score = metrics.completion_rate * 80
        else:
            base_score = metrics.completion_rate * 50
        
        return min(100, base_score)
    
    def _calculate_efficiency_score(self, metrics: TaskMetrics) -> float:
        """
        计算效率得分
        
        Args:
            metrics: 任务指标
            
        Returns:
            float: 效率得分
        """
        if metrics.time_taken <= 0:
            return 0
        
        expected_time = metrics.steps_total * 2.0
        efficiency = expected_time / metrics.time_taken
        
        return min(100, efficiency * 100)
    
    def _calculate_reliability_score(self, metrics: TaskMetrics) -> float:
        """
        计算可靠性得分
        
        Args:
            metrics: 任务指标
            
        Returns:
            float: 可靠性得分
        """
        retry_penalty = metrics.retry_count * 10
        error_penalty = len(metrics.error_messages) * 5
        
        return max(0, 100 - retry_penalty - error_penalty)
    
    def get_aggregate_report(self) -> Dict:
        """
        获取聚合报告
        
        Returns:
            dict: 聚合评估报告
        """
        if not self.evaluation_history:
            return {"message": "暂无评估数据"}
        
        total_tasks = len(self.evaluation_history)
        completed = sum(1 for m in self.evaluation_history 
                       if m.status == TaskStatus.COMPLETED)
        
        avg_completion = sum(m.completion_rate for m in self.evaluation_history) / total_tasks
        avg_time = sum(m.time_taken for m in self.evaluation_history) / total_tasks
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "success_rate": completed / total_tasks,
            "average_completion_rate": avg_completion,
            "average_time": avg_time,
            "total_retries": sum(m.retry_count for m in self.evaluation_history)
        }
```

#### 任务完成度分级标准

| 等级 | 完成率 | 描述 |
|-----|-------|------|
| S级 | 95-100% | 完美完成，无错误无重试 |
| A级 | 85-94% | 优秀完成，少量优化空间 |
| B级 | 70-84% | 良好完成，存在改进点 |
| C级 | 50-69% | 基本完成，需要优化 |
| D级 | <50% | 完成度不足，需要重构 |

### 2. 决策合理性评估

评估Agent在测试流程中的决策质量。

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
import json

@dataclass
class DecisionPoint:
    """
    决策点类
    记录Agent在某一时刻的决策
    """
    step_id: str
    context: Dict
    options: List[Dict]
    chosen_option: Dict
    reasoning: str
    outcome: str
    is_optimal: bool

class DecisionRationalityEvaluator:
    """
    决策合理性评估器
    评估Agent决策的质量和合理性
    """
    def __init__(self):
        self.decision_points: List[DecisionPoint] = []
        self.decision_patterns: Dict[str, List] = {}
    
    def record_decision(self, decision: Dict) -> DecisionPoint:
        """
        记录决策点
        
        Args:
            decision: 决策信息
            
        Returns:
            DecisionPoint: 决策点对象
        """
        point = DecisionPoint(
            step_id=decision.get("step_id", ""),
            context=decision.get("context", {}),
            options=decision.get("options", []),
            chosen_option=decision.get("chosen", {}),
            reasoning=decision.get("reasoning", ""),
            outcome=decision.get("outcome", "unknown"),
            is_optimal=decision.get("is_optimal", False)
        )
        
        self.decision_points.append(point)
        self._update_patterns(point)
        
        return point
    
    def _update_patterns(self, point: DecisionPoint):
        """
        更新决策模式
        
        Args:
            point: 决策点
        """
        context_type = self._classify_context(point.context)
        
        if context_type not in self.decision_patterns:
            self.decision_patterns[context_type] = []
        
        self.decision_patterns[context_type].append({
            "decision": point.chosen_option,
            "outcome": point.outcome,
            "is_optimal": point.is_optimal
        })
    
    def _classify_context(self, context: Dict) -> str:
        """
        分类决策上下文
        
        Args:
            context: 上下文信息
            
        Returns:
            str: 上下文类型
        """
        if "error" in context:
            return "error_handling"
        elif "test_case" in context:
            return "test_execution"
        elif "element" in context:
            return "element_location"
        else:
            return "general"
    
    def evaluate_rationality(self) -> Dict:
        """
        评估决策合理性
        
        Returns:
            dict: 评估结果
        """
        if not self.decision_points:
            return {"message": "暂无决策数据"}
        
        optimal_count = sum(1 for p in self.decision_points if p.is_optimal)
        success_count = sum(1 for p in self.decision_points 
                          if p.outcome == "success")
        
        return {
            "total_decisions": len(self.decision_points),
            "optimal_decisions": optimal_count,
            "optimal_rate": optimal_count / len(self.decision_points),
            "success_decisions": success_count,
            "success_rate": success_count / len(self.decision_points),
            "pattern_analysis": self._analyze_patterns(),
            "recommendations": self._generate_recommendations()
        }
    
    def _analyze_patterns(self) -> Dict:
        """
        分析决策模式
        
        Returns:
            dict: 模式分析结果
        """
        analysis = {}
        
        for context_type, decisions in self.decision_patterns.items():
            optimal = sum(1 for d in decisions if d["is_optimal"])
            success = sum(1 for d in decisions if d["outcome"] == "success")
            
            analysis[context_type] = {
                "count": len(decisions),
                "optimal_rate": optimal / len(decisions) if decisions else 0,
                "success_rate": success / len(decisions) if decisions else 0
            }
        
        return analysis
    
    def _generate_recommendations(self) -> List[str]:
        """
        生成改进建议
        
        Returns:
            list: 建议列表
        """
        recommendations = []
        
        for context_type, analysis in self._analyze_patterns().items():
            if analysis["optimal_rate"] < 0.7:
                recommendations.append(
                    f"建议优化{context_type}场景的决策策略，"
                    f"当前最优决策率仅{analysis['optimal_rate']:.1%}"
                )
        
        return recommendations
    
    def get_decision_chain(self, task_id: str) -> List[Dict]:
        """
        获取决策链
        
        Args:
            task_id: 任务ID
            
        Returns:
            list: 决策链列表
        """
        return [
            {
                "step_id": p.step_id,
                "context": p.context,
                "decision": p.chosen_option,
                "reasoning": p.reasoning,
                "outcome": p.outcome
            }
            for p in self.decision_points
            if task_id in p.step_id
        ]
```

### 3. 工具调用能力评估

评估Agent正确使用工具的能力。

```python
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ToolCall:
    """
    工具调用记录类
    记录一次工具调用的详细信息
    """
    call_id: str
    tool_name: str
    parameters: Dict
    result: Any
    success: bool
    error_message: str
    timestamp: datetime
    execution_time: float

class ToolUsageEvaluator:
    """
    工具使用评估器
    评估Agent的工具调用能力
    """
    def __init__(self):
        self.tool_calls: List[ToolCall] = []
        self.tool_registry: Dict[str, Dict] = {}
    
    def register_tool(self, tool_name: str, tool_schema: Dict):
        """
        注册工具
        
        Args:
            tool_name: 工具名称
            tool_schema: 工具Schema
        """
        self.tool_registry[tool_name] = tool_schema
    
    def record_call(self, call: Dict) -> ToolCall:
        """
        记录工具调用
        
        Args:
            call: 调用信息
            
        Returns:
            ToolCall: 工具调用记录
        """
        tool_call = ToolCall(
            call_id=call.get("call_id", ""),
            tool_name=call.get("tool_name", ""),
            parameters=call.get("parameters", {}),
            result=call.get("result"),
            success=call.get("success", False),
            error_message=call.get("error_message", ""),
            timestamp=datetime.now(),
            execution_time=call.get("execution_time", 0)
        )
        
        self.tool_calls.append(tool_call)
        return tool_call
    
    def evaluate_tool_usage(self) -> Dict:
        """
        评估工具使用情况
        
        Returns:
            dict: 评估结果
        """
        if not self.tool_calls:
            return {"message": "暂无工具调用数据"}
        
        total_calls = len(self.tool_calls)
        successful_calls = sum(1 for c in self.tool_calls if c.success)
        
        return {
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "success_rate": successful_calls / total_calls,
            "tool_statistics": self._get_tool_statistics(),
            "parameter_accuracy": self._evaluate_parameter_accuracy(),
            "error_analysis": self._analyze_errors(),
            "efficiency_metrics": self._calculate_efficiency()
        }
    
    def _get_tool_statistics(self) -> Dict:
        """
        获取工具使用统计
        
        Returns:
            dict: 工具统计信息
        """
        stats = {}
        
        for call in self.tool_calls:
            if call.tool_name not in stats:
                stats[call.tool_name] = {
                    "total": 0,
                    "success": 0,
                    "avg_time": 0,
                    "total_time": 0
                }
            
            stats[call.tool_name]["total"] += 1
            if call.success:
                stats[call.tool_name]["success"] += 1
            stats[call.tool_name]["total_time"] += call.execution_time
        
        for tool_name, data in stats.items():
            data["success_rate"] = data["success"] / data["total"] if data["total"] > 0 else 0
            data["avg_time"] = data["total_time"] / data["total"] if data["total"] > 0 else 0
        
        return stats
    
    def _evaluate_parameter_accuracy(self) -> Dict:
        """
        评估参数准确性
        
        Returns:
            dict: 参数准确性评估
        """
        accuracy_report = {}
        
        for call in self.tool_calls:
            if call.tool_name not in self.tool_registry:
                continue
            
            schema = self.tool_registry[call.tool_name]
            validation_result = self._validate_parameters(
                call.parameters, 
                schema.get("parameters", {})
            )
            
            if call.tool_name not in accuracy_report:
                accuracy_report[call.tool_name] = {
                    "total": 0,
                    "valid": 0
                }
            
            accuracy_report[call.tool_name]["total"] += 1
            if validation_result["is_valid"]:
                accuracy_report[call.tool_name]["valid"] += 1
        
        for tool_name, data in accuracy_report.items():
            data["accuracy_rate"] = data["valid"] / data["total"] if data["total"] > 0 else 0
        
        return accuracy_report
    
    def _validate_parameters(self, params: Dict, schema: Dict) -> Dict:
        """
        验证参数
        
        Args:
            params: 实际参数
            schema: 参数Schema
            
        Returns:
            dict: 验证结果
        """
        required = schema.get("required", [])
        properties = schema.get("properties", {})
        
        missing = [r for r in required if r not in params]
        invalid = []
        
        for key, value in params.items():
            if key in properties:
                expected_type = properties[key].get("type")
                if expected_type and not self._check_type(value, expected_type):
                    invalid.append(key)
        
        return {
            "is_valid": len(missing) == 0 and len(invalid) == 0,
            "missing_params": missing,
            "invalid_params": invalid
        }
    
    def _check_type(self, value: Any, expected_type: str) -> bool:
        """
        检查类型
        
        Args:
            value: 值
            expected_type: 期望类型
            
        Returns:
            bool: 是否匹配
        """
        type_map = {
            "string": str,
            "number": (int, float),
            "integer": int,
            "boolean": bool,
            "array": list,
            "object": dict
        }
        
        expected = type_map.get(expected_type)
        if expected is None:
            return True
        
        return isinstance(value, expected)
    
    def _analyze_errors(self) -> Dict:
        """
        分析错误
        
        Returns:
            dict: 错误分析
        """
        errors = [c for c in self.tool_calls if not c.success]
        
        error_types = {}
        for error in errors:
            error_type = self._classify_error(error.error_message)
            error_types[error_type] = error_types.get(error_type, 0) + 1
        
        return {
            "total_errors": len(errors),
            "error_rate": len(errors) / len(self.tool_calls),
            "error_types": error_types,
            "common_errors": self._get_common_errors(errors)
        }
    
    def _classify_error(self, error_message: str) -> str:
        """
        分类错误
        
        Args:
            error_message: 错误信息
            
        Returns:
            str: 错误类型
        """
        if "timeout" in error_message.lower():
            return "timeout"
        elif "not found" in error_message.lower():
            return "not_found"
        elif "invalid" in error_message.lower():
            return "invalid_input"
        elif "permission" in error_message.lower():
            return "permission_denied"
        else:
            return "unknown"
    
    def _get_common_errors(self, errors: List[ToolCall]) -> List[Dict]:
        """
        获取常见错误
        
        Args:
            errors: 错误列表
            
        Returns:
            list: 常见错误列表
        """
        error_messages = {}
        for error in errors:
            msg = error.error_message[:100]
            error_messages[msg] = error_messages.get(msg, 0) + 1
        
        sorted_errors = sorted(error_messages.items(), key=lambda x: x[1], reverse=True)
        
        return [{"message": msg, "count": count} for msg, count in sorted_errors[:5]]
    
    def _calculate_efficiency(self) -> Dict:
        """
        计算效率指标
        
        Returns:
            dict: 效率指标
        """
        if not self.tool_calls:
            return {}
        
        total_time = sum(c.execution_time for c in self.tool_calls)
        avg_time = total_time / len(self.tool_calls)
        
        return {
            "total_execution_time": total_time,
            "average_execution_time": avg_time,
            "calls_per_minute": 60 / avg_time if avg_time > 0 else 0
        }
```

### 4. 知识时效性评估

评估Agent使用知识的时效性和准确性。

```python
from typing import Dict, List
from datetime import datetime, timedelta
from dataclasses import dataclass

@dataclass
class KnowledgeItem:
    """
    知识项类
    表示一条知识记录
    """
    knowledge_id: str
    content: str
    source: str
    created_at: datetime
    last_updated: datetime
    expiry_date: datetime
    relevance_score: float
    usage_count: int

class KnowledgeTimelinessEvaluator:
    """
    知识时效性评估器
    评估Agent使用知识的时效性
    """
    def __init__(self):
        self.knowledge_base: Dict[str, KnowledgeItem] = {}
        self.usage_log: List[Dict] = []
    
    def add_knowledge(self, knowledge: Dict):
        """
        添加知识
        
        Args:
            knowledge: 知识信息
        """
        item = KnowledgeItem(
            knowledge_id=knowledge.get("id", ""),
            content=knowledge.get("content", ""),
            source=knowledge.get("source", ""),
            created_at=knowledge.get("created_at", datetime.now()),
            last_updated=knowledge.get("last_updated", datetime.now()),
            expiry_date=knowledge.get("expiry_date", 
                                     datetime.now() + timedelta(days=30)),
            relevance_score=knowledge.get("relevance_score", 1.0),
            usage_count=0
        )
        
        self.knowledge_base[item.knowledge_id] = item
    
    def record_usage(self, knowledge_id: str, context: Dict):
        """
        记录知识使用
        
        Args:
            knowledge_id: 知识ID
            context: 使用上下文
        """
        if knowledge_id in self.knowledge_base:
            self.knowledge_base[knowledge_id].usage_count += 1
        
        self.usage_log.append({
            "knowledge_id": knowledge_id,
            "context": context,
            "timestamp": datetime.now()
        })
    
    def evaluate_timeliness(self) -> Dict:
        """
        评估知识时效性
        
        Returns:
            dict: 评估结果
        """
        if not self.knowledge_base:
            return {"message": "暂无知识数据"}
        
        now = datetime.now()
        
        expired = []
        expiring_soon = []
        current = []
        
        for item in self.knowledge_base.values():
            days_to_expiry = (item.expiry_date - now).days
            
            if days_to_expiry < 0:
                expired.append(item)
            elif days_to_expiry < 7:
                expiring_soon.append(item)
            else:
                current.append(item)
        
        total = len(self.knowledge_base)
        
        return {
            "total_knowledge": total,
            "current_knowledge": len(current),
            "current_rate": len(current) / total,
            "expiring_soon": len(expiring_soon),
            "expired": len(expired),
            "expired_rate": len(expired) / total,
            "usage_statistics": self._get_usage_statistics(),
            "freshness_score": self._calculate_freshness_score(),
            "recommendations": self._generate_recommendations(expired, expiring_soon)
        }
    
    def _get_usage_statistics(self) -> Dict:
        """
        获取使用统计
        
        Returns:
            dict: 使用统计
        """
        if not self.knowledge_base:
            return {}
        
        usage_counts = [item.usage_count for item in self.knowledge_base.values()]
        
        return {
            "total_usages": sum(usage_counts),
            "average_usage": sum(usage_counts) / len(usage_counts),
            "max_usage": max(usage_counts),
            "unused_count": sum(1 for c in usage_counts if c == 0)
        }
    
    def _calculate_freshness_score(self) -> float:
        """
        计算新鲜度得分
        
        Returns:
            float: 新鲜度得分
        """
        if not self.knowledge_base:
            return 0.0
        
        now = datetime.now()
        total_score = 0.0
        
        for item in self.knowledge_base.values():
            age_days = (now - item.last_updated).days
            freshness = max(0, 1 - (age_days / 30))
            total_score += freshness * item.relevance_score
        
        return total_score / len(self.knowledge_base)
    
    def _generate_recommendations(
        self, 
        expired: List[KnowledgeItem], 
        expiring_soon: List[KnowledgeItem]
    ) -> List[str]:
        """
        生成更新建议
        
        Args:
            expired: 过期知识列表
            expiring_soon: 即将过期知识列表
            
        Returns:
            list: 建议列表
        """
        recommendations = []
        
        if expired:
            recommendations.append(
                f"发现{len(expired)}条过期知识，建议立即更新或删除"
            )
        
        if expiring_soon:
            recommendations.append(
                f"发现{len(expiring_soon)}条知识即将过期，建议安排更新"
            )
        
        unused = [item for item in self.knowledge_base.values() 
                 if item.usage_count == 0]
        if unused:
            recommendations.append(
                f"发现{len(unused)}条未使用知识，建议评估是否保留"
            )
        
        return recommendations
    
    def check_knowledge_validity(self, knowledge_id: str) -> Dict:
        """
        检查知识有效性
        
        Args:
            knowledge_id: 知识ID
            
        Returns:
            dict: 有效性检查结果
        """
        if knowledge_id not in self.knowledge_base:
            return {"valid": False, "reason": "知识不存在"}
        
        item = self.knowledge_base[knowledge_id]
        now = datetime.now()
        
        if now > item.expiry_date:
            return {
                "valid": False,
                "reason": "知识已过期",
                "expired_days": (now - item.expiry_date).days
            }
        
        days_to_expiry = (item.expiry_date - now).days
        
        return {
            "valid": True,
            "days_to_expiry": days_to_expiry,
            "freshness": max(0, 1 - ((now - item.last_updated).days / 30)),
            "usage_count": item.usage_count
        }
```

### 5. 幻觉率控制

检测和控制Agent产生的幻觉内容。

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
import re

@dataclass
class HallucinationInstance:
    """
    幻觉实例类
    记录一次幻觉检测结果
    """
    instance_id: str
    content: str
    hallucination_type: str
    confidence: float
    evidence: List[str]
    correction: str

class HallucinationDetector:
    """
    幻觉检测器
    检测Agent输出中的幻觉内容
    """
    def __init__(self):
        self.detection_rules = self._init_rules()
        self.verification_sources: Dict[str, Any] = {}
        self.detected_hallucinations: List[HallucinationInstance] = []
    
    def _init_rules(self) -> Dict:
        """
        初始化检测规则
        
        Returns:
            dict: 检测规则
        """
        return {
            "factual": {
                "description": "事实性幻觉",
                "patterns": [
                    r"\d{4}年\d{1,2}月\d{1,2}日",
                    r"版本\s*\d+\.\d+",
                    r"API\s*:\s*\w+"
                ],
                "verification": "fact_check"
            },
            "logical": {
                "description": "逻辑性幻觉",
                "patterns": [
                    r"因此\s*.*必然",
                    r"所以\s*.*一定"
                ],
                "verification": "logic_check"
            },
            "reference": {
                "description": "引用性幻觉",
                "patterns": [
                    r"根据.*文档",
                    r"参考.*规范"
                ],
                "verification": "reference_check"
            }
        }
    
    def detect(self, content: str, context: Dict) -> Dict:
        """
        检测幻觉
        
        Args:
            content: 待检测内容
            context: 上下文信息
            
        Returns:
            dict: 检测结果
        """
        hallucinations = []
        
        for h_type, rule in self.detection_rules.items():
            detected = self._apply_rule(content, rule, context)
            hallucinations.extend(detected)
        
        hallucination_rate = len(hallucinations) / max(1, len(content.split()))
        
        result = {
            "content": content,
            "hallucination_count": len(hallucinations),
            "hallucination_rate": hallucination_rate,
            "instances": hallucinations,
            "risk_level": self._assess_risk(hallucination_rate),
            "recommendations": self._generate_recommendations(hallucinations)
        }
        
        return result
    
    def _apply_rule(self, content: str, rule: Dict, context: Dict) -> List[Dict]:
        """
        应用检测规则
        
        Args:
            content: 内容
            rule: 检测规则
            context: 上下文
            
        Returns:
            list: 检测到的幻觉列表
        """
        instances = []
        
        for pattern in rule.get("patterns", []):
            matches = re.finditer(pattern, content)
            
            for match in matches:
                verification_result = self._verify(
                    match.group(),
                    rule["verification"],
                    context
                )
                
                if not verification_result["verified"]:
                    instances.append({
                        "type": rule["description"],
                        "content": match.group(),
                        "position": match.span(),
                        "confidence": verification_result["confidence"],
                        "evidence": verification_result.get("evidence", []),
                        "correction": verification_result.get("correction")
                    })
        
        return instances
    
    def _verify(self, content: str, verification_type: str, context: Dict) -> Dict:
        """
        验证内容
        
        Args:
            content: 待验证内容
            verification_type: 验证类型
            context: 上下文
            
        Returns:
            dict: 验证结果
        """
        if verification_type == "fact_check":
            return self._fact_check(content, context)
        elif verification_type == "logic_check":
            return self._logic_check(content, context)
        elif verification_type == "reference_check":
            return self._reference_check(content, context)
        else:
            return {"verified": True, "confidence": 0.5}
    
    def _fact_check(self, content: str, context: Dict) -> Dict:
        """
        事实核查
        
        Args:
            content: 内容
            context: 上下文
            
        Returns:
            dict: 核查结果
        """
        known_facts = context.get("known_facts", {})
        
        for fact_key, fact_value in known_facts.items():
            if fact_key in content:
                if str(fact_value) in content:
                    return {"verified": True, "confidence": 0.9}
                else:
                    return {
                        "verified": False,
                        "confidence": 0.8,
                        "evidence": [f"正确值应为: {fact_value}"],
                        "correction": content.replace(
                            content, 
                            f"{fact_key}: {fact_value}"
                        )
                    }
        
        return {"verified": True, "confidence": 0.6}
    
    def _logic_check(self, content: str, context: Dict) -> Dict:
        """
        逻辑检查
        
        Args:
            content: 内容
            context: 上下文
            
        Returns:
            dict: 检查结果
        """
        return {"verified": True, "confidence": 0.7}
    
    def _reference_check(self, content: str, context: Dict) -> Dict:
        """
        引用检查
        
        Args:
            content: 内容
            context: 上下文
            
        Returns:
            dict: 检查结果
        """
        available_docs = context.get("available_documents", [])
        
        doc_references = re.findall(r"根据\s*(.+?)\s*文档", content)
        
        for ref in doc_references:
            if ref not in available_docs:
                return {
                    "verified": False,
                    "confidence": 0.9,
                    "evidence": [f"文档 '{ref}' 不存在"],
                    "correction": "请提供正确的文档引用"
                }
        
        return {"verified": True, "confidence": 0.8}
    
    def _assess_risk(self, hallucination_rate: float) -> str:
        """
        评估风险等级
        
        Args:
            hallucination_rate: 幻觉率
            
        Returns:
            str: 风险等级
        """
        if hallucination_rate < 0.05:
            return "low"
        elif hallucination_rate < 0.15:
            return "medium"
        elif hallucination_rate < 0.30:
            return "high"
        else:
            return "critical"
    
    def _generate_recommendations(self, instances: List[Dict]) -> List[str]:
        """
        生成改进建议
        
        Args:
            instances: 幻觉实例列表
            
        Returns:
            list: 建议列表
        """
        if not instances:
            return ["内容质量良好，无明显幻觉"]
        
        recommendations = []
        
        type_counts = {}
        for instance in instances:
            h_type = instance["type"]
            type_counts[h_type] = type_counts.get(h_type, 0) + 1
        
        for h_type, count in type_counts.items():
            recommendations.append(f"发现{count}处{h_type}，建议核实相关内容")
        
        return recommendations
    
    def calculate_hallucination_rate(self, outputs: List[str], contexts: List[Dict]) -> Dict:
        """
        计算整体幻觉率
        
        Args:
            outputs: 输出列表
            contexts: 上下文列表
            
        Returns:
            dict: 幻觉率统计
        """
        total_instances = 0
        total_words = 0
        type_distribution = {}
        
        for output, context in zip(outputs, contexts):
            result = self.detect(output, context)
            total_instances += result["hallucination_count"]
            total_words += len(output.split())
            
            for instance in result["instances"]:
                h_type = instance["type"]
                type_distribution[h_type] = type_distribution.get(h_type, 0) + 1
        
        return {
            "total_outputs": len(outputs),
            "total_hallucinations": total_instances,
            "overall_rate": total_instances / max(1, total_words),
            "average_per_output": total_instances / max(1, len(outputs)),
            "type_distribution": type_distribution
        }
```

## 综合评测流程

### 评测流程编排

```python
from typing import Dict, List
from dataclasses import dataclass
from datetime import datetime

@dataclass
class EvaluationResult:
    """
    评测结果类
    综合各维度的评测结果
    """
    evaluation_id: str
    timestamp: datetime
    task_completion: Dict
    decision_rationality: Dict
    tool_usage: Dict
    knowledge_timeliness: Dict
    hallucination: Dict
    overall_score: float
    grade: str

class AgentEvaluationPipeline:
    """
    Agent评测流水线
    协调各评测模块完成综合评测
    """
    def __init__(self):
        self.task_evaluator = TaskCompletionEvaluator()
        self.decision_evaluator = DecisionRationalityEvaluator()
        self.tool_evaluator = ToolUsageEvaluator()
        self.knowledge_evaluator = KnowledgeTimelinessEvaluator()
        self.hallucination_detector = HallucinationDetector()
    
    def run_evaluation(self, agent_output: Dict) -> EvaluationResult:
        """
        运行完整评测
        
        Args:
            agent_output: Agent输出数据
            
        Returns:
            EvaluationResult: 评测结果
        """
        task_result = self.task_evaluator.evaluate(agent_output.get("task", {}))
        
        for decision in agent_output.get("decisions", []):
            self.decision_evaluator.record_decision(decision)
        decision_result = self.decision_evaluator.evaluate_rationality()
        
        for call in agent_output.get("tool_calls", []):
            self.tool_evaluator.record_call(call)
        tool_result = self.tool_evaluator.evaluate_tool_usage()
        
        knowledge_result = self.knowledge_evaluator.evaluate_timeliness()
        
        hallucination_result = self.hallucination_detector.detect(
            agent_output.get("content", ""),
            agent_output.get("context", {})
        )
        
        overall_score = self._calculate_overall_score({
            "task": task_result,
            "decision": decision_result,
            "tool": tool_result,
            "knowledge": knowledge_result,
            "hallucination": hallucination_result
        })
        
        return EvaluationResult(
            evaluation_id=f"eval_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            timestamp=datetime.now(),
            task_completion=task_result,
            decision_rationality=decision_result,
            tool_usage=tool_result,
            knowledge_timeliness=knowledge_result,
            hallucination=hallucination_result,
            overall_score=overall_score,
            grade=self._get_grade(overall_score)
        )
    
    def _calculate_overall_score(self, results: Dict) -> float:
        """
        计算综合得分
        
        Args:
            results: 各维度评测结果
            
        Returns:
            float: 综合得分
        """
        weights = {
            "task": 0.30,
            "decision": 0.25,
            "tool": 0.20,
            "knowledge": 0.15,
            "hallucination": 0.10
        }
        
        scores = {
            "task": results["task"].get("completion_score", 0),
            "decision": results["decision"].get("optimal_rate", 0) * 100,
            "tool": results["tool"].get("success_rate", 0) * 100,
            "knowledge": results["knowledge"].get("freshness_score", 0) * 100,
            "hallucination": max(0, 100 - results["hallucination"].get("hallucination_rate", 0) * 1000)
        }
        
        overall = sum(scores[key] * weights[key] for key in weights)
        
        return overall
    
    def _get_grade(self, score: float) -> str:
        """
        获取评级
        
        Args:
            score: 得分
            
        Returns:
            str: 评级
        """
        if score >= 90:
            return "S"
        elif score >= 80:
            return "A"
        elif score >= 70:
            return "B"
        elif score >= 60:
            return "C"
        else:
            return "D"
    
    def generate_report(self, result: EvaluationResult) -> str:
        """
        生成评测报告
        
        Args:
            result: 评测结果
            
        Returns:
            str: 报告文本
        """
        report = f"""
# Agent评测报告

## 基本信息
- 评测ID: {result.evaluation_id}
- 评测时间: {result.timestamp}
- 综合得分: {result.overall_score:.2f}
- 评级: {result.grade}

## 各维度得分

### 1. 任务完成度
- 完成度得分: {result.task_completion.get('completion_score', 0):.2f}
- 效率得分: {result.task_completion.get('efficiency_score', 0):.2f}
- 可靠性得分: {result.task_completion.get('reliability_score', 0):.2f}

### 2. 决策合理性
- 最优决策率: {result.decision_rationality.get('optimal_rate', 0):.1%}
- 成功决策率: {result.decision_rationality.get('success_rate', 0):.1%}

### 3. 工具使用能力
- 调用成功率: {result.tool_usage.get('success_rate', 0):.1%}
- 参数准确率: {self._get_avg_param_accuracy(result.tool_usage):.1%}

### 4. 知识时效性
- 新鲜度得分: {result.knowledge_timeliness.get('freshness_score', 0):.2f}
- 当前知识占比: {result.knowledge_timeliness.get('current_rate', 0):.1%}

### 5. 幻觉控制
- 幻觉率: {result.hallucination.get('hallucination_rate', 0):.2%}
- 风险等级: {result.hallucination.get('risk_level', 'unknown')}

## 改进建议
{self._format_recommendations(result)}
"""
        return report
    
    def _get_avg_param_accuracy(self, tool_result: Dict) -> float:
        """
        获取平均参数准确率
        
        Args:
            tool_result: 工具评测结果
            
        Returns:
            float: 平均准确率
        """
        param_accuracy = tool_result.get("parameter_accuracy", {})
        if not param_accuracy:
            return 0.0
        
        rates = [data.get("accuracy_rate", 0) for data in param_accuracy.values()]
        return sum(rates) / len(rates) if rates else 0.0
    
    def _format_recommendations(self, result: EvaluationResult) -> str:
        """
        格式化建议
        
        Args:
            result: 评测结果
            
        Returns:
            str: 格式化的建议
        """
        recommendations = []
        
        if result.task_completion.get("completion_score", 0) < 80:
            recommendations.append("- 提升任务完成度，关注失败步骤的优化")
        
        if result.decision_rationality.get("optimal_rate", 0) < 0.7:
            recommendations.append("- 优化决策策略，提高最优决策比例")
        
        if result.tool_usage.get("success_rate", 0) < 0.9:
            recommendations.append("- 改进工具调用准确性，减少调用失败")
        
        if result.hallucination.get("risk_level") in ["high", "critical"]:
            recommendations.append("- 加强幻觉检测，提升输出可靠性")
        
        return "\n".join(recommendations) if recommendations else "- 整体表现良好，继续保持"
```

## 最佳实践

### 1. 评测体系设计原则

- **全面性**：覆盖所有关键评测维度
- **可量化**：每个维度都有明确的量化指标
- **可追溯**：保留完整的评测记录和证据
- **可改进**：评测结果能指导优化方向

### 2. 评测实施建议

| 阶段 | 重点 | 频率 |
|-----|------|------|
| 开发期 | 功能正确性 | 每次提交 |
| 测试期 | 全面评测 | 每日 |
| 发布前 | 综合评估 | 每版本 |
| 运行期 | 持续监控 | 实时 |

### 3. 评测结果应用

- **质量门禁**：设定最低评测标准
- **版本对比**：追踪版本间的质量变化
- **问题定位**：快速识别问题根源
- **优化指导**：为改进提供数据支持

## 相关资源

- [Agentic QA 自主测试体系](/ai-testing/agentic/) - 测试智能体演进与多智能体协作
- [LLM/VLM工程化](/llm-vlm/) - 大模型应用架构与工程实践
