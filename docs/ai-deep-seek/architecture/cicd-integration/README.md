# CI/CD 集成

将自动化测试、回归编排、质量门禁等能力接入CI/CD，支撑更快的研发交付节奏。

## 概述

CI/CD集成是质量保障体系的关键环节，通过将测试能力嵌入持续集成和持续部署流程，实现质量左移和快速反馈，确保每次代码提交都经过充分的质量验证。

### 核心价值

- **快速反馈**：代码提交后快速获得质量反馈
- **质量门禁**：自动化质量检查，防止问题流入下游
- **持续回归**：每次变更自动触发回归测试
- **效率提升**：减少人工干预，提高交付效率

### 集成架构

```
┌─────────────────────────────────────────────────────────┐
│                    代码仓库                              │
│              Git / GitHub / GitLab                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    CI触发器                              │
│        Webhook / Polling / Event-driven                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    测试流水线                            │
│  单元测试 → 集成测试 → E2E测试 → 性能测试 → 安全测试    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    质量门禁                              │
│    代码覆盖率 │ 测试通过率 │ 性能指标 │ 安全扫描        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    部署阶段                              │
│        开发环境 → 测试环境 → 预发环境 → 生产环境        │
└─────────────────────────────────────────────────────────┘
```

## 自动化测试集成

### 1. 流水线配置

```python
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

class StageStatus(Enum):
    """阶段状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class PipelineStage:
    """
    流水线阶段类
    表示流水线中的一个阶段
    """
    name: str
    stage_type: str
    commands: List[str]
    dependencies: List[str] = field(default_factory=list)
    timeout: int = 3600
    retry_count: int = 0
    status: StageStatus = StageStatus.PENDING

@dataclass
class Pipeline:
    """
    流水线类
    表示一个完整的CI/CD流水线
    """
    pipeline_id: str
    name: str
    trigger: str
    stages: List[PipelineStage]
    variables: Dict
    created_at: datetime
    status: StageStatus = StageStatus.PENDING

class PipelineManager:
    """
    流水线管理器
    管理CI/CD流水线
    """
    def __init__(self):
        self.pipelines: Dict[str, Pipeline] = {}
        self.executions: Dict[str, Dict] = {}
    
    def create_pipeline(self, config: Dict) -> Pipeline:
        """
        创建流水线
        
        Args:
            config: 流水线配置
            
        Returns:
            Pipeline: 流水线对象
        """
        stages = [
            PipelineStage(
                name=stage.get("name", ""),
                stage_type=stage.get("type", "custom"),
                commands=stage.get("commands", []),
                dependencies=stage.get("dependencies", []),
                timeout=stage.get("timeout", 3600),
                retry_count=stage.get("retry_count", 0)
            )
            for stage in config.get("stages", [])
        ]
        
        pipeline = Pipeline(
            pipeline_id=f"PIPE_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            name=config.get("name", ""),
            trigger=config.get("trigger", "manual"),
            stages=stages,
            variables=config.get("variables", {}),
            created_at=datetime.now()
        )
        
        self.pipelines[pipeline.pipeline_id] = pipeline
        return pipeline
    
    def execute_pipeline(self, pipeline_id: str, params: Dict = None) -> str:
        """
        执行流水线
        
        Args:
            pipeline_id: 流水线ID
            params: 执行参数
            
        Returns:
            str: 执行ID
        """
        if pipeline_id not in self.pipelines:
            raise ValueError(f"流水线 {pipeline_id} 不存在")
        
        pipeline = self.pipelines[pipeline_id]
        execution_id = f"EXEC_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
        
        execution = {
            "execution_id": execution_id,
            "pipeline_id": pipeline_id,
            "status": StageStatus.RUNNING.value,
            "start_time": datetime.now().isoformat(),
            "stages": [],
            "params": params or {}
        }
        
        for stage in pipeline.stages:
            stage_execution = self._execute_stage(stage, pipeline.variables, params)
            execution["stages"].append(stage_execution)
            
            if stage_execution["status"] == StageStatus.FAILED.value:
                execution["status"] = StageStatus.FAILED.value
                break
        
        if execution["status"] == StageStatus.RUNNING.value:
            execution["status"] = StageStatus.SUCCESS.value
        
        execution["end_time"] = datetime.now().isoformat()
        self.executions[execution_id] = execution
        
        return execution_id
    
    def _execute_stage(
        self, 
        stage: PipelineStage, 
        variables: Dict,
        params: Dict
    ) -> Dict:
        """
        执行阶段
        
        Args:
            stage: 阶段对象
            variables: 变量
            params: 参数
            
        Returns:
            dict: 执行结果
        """
        stage_result = {
            "name": stage.name,
            "status": StageStatus.RUNNING.value,
            "start_time": datetime.now().isoformat(),
            "commands_results": []
        }
        
        try:
            for command in stage.commands:
                command_result = self._execute_command(command, variables, params)
                stage_result["commands_results"].append(command_result)
                
                if not command_result.get("success"):
                    stage_result["status"] = StageStatus.FAILED.value
                    stage_result["error"] = command_result.get("error")
                    break
            
            if stage_result["status"] == StageStatus.RUNNING.value:
                stage_result["status"] = StageStatus.SUCCESS.value
            
        except Exception as e:
            stage_result["status"] = StageStatus.FAILED.value
            stage_result["error"] = str(e)
        
        stage_result["end_time"] = datetime.now().isoformat()
        return stage_result
    
    def _execute_command(
        self, 
        command: str, 
        variables: Dict,
        params: Dict
    ) -> Dict:
        """
        执行命令
        
        Args:
            command: 命令
            variables: 变量
            params: 参数
            
        Returns:
            dict: 命令结果
        """
        resolved_command = self._resolve_variables(command, variables, params)
        
        return {
            "command": resolved_command,
            "success": True,
            "output": f"执行: {resolved_command}"
        }
    
    def _resolve_variables(
        self, 
        text: str, 
        variables: Dict,
        params: Dict
    ) -> str:
        """
        解析变量
        
        Args:
            text: 文本
            variables: 变量
            params: 参数
            
        Returns:
            str: 解析后的文本
        """
        import re
        
        all_vars = {**variables, **params}
        
        def replace_var(match):
            var_name = match.group(1)
            return str(all_vars.get(var_name, match.group(0)))
        
        return re.sub(r'\$\{(\w+)\}', replace_var, text)
    
    def get_execution_status(self, execution_id: str) -> Dict:
        """
        获取执行状态
        
        Args:
            execution_id: 执行ID
            
        Returns:
            dict: 执行状态
        """
        if execution_id not in self.executions:
            return {"error": "执行不存在"}
        
        return self.executions[execution_id]
```

### 2. 测试触发策略

```python
from typing import Dict, List, Callable
from dataclasses import dataclass
from enum import Enum

class TriggerType(Enum):
    """触发类型枚举"""
    PUSH = "push"
    MERGE_REQUEST = "merge_request"
    SCHEDULE = "schedule"
    MANUAL = "manual"
    WEBHOOK = "webhook"

@dataclass
class TriggerRule:
    """
    触发规则类
    定义测试触发的条件
    """
    trigger_type: TriggerType
    conditions: Dict
    test_scope: List[str]
    priority: int = 5

class TestTrigger:
    """
    测试触发器
    根据规则触发测试
    """
    def __init__(self, pipeline_manager: PipelineManager):
        self.pipeline_manager = pipeline_manager
        self.trigger_rules: List[TriggerRule] = []
        self.event_handlers: Dict[TriggerType, Callable] = {}
    
    def add_trigger_rule(self, rule: TriggerRule):
        """
        添加触发规则
        
        Args:
            rule: 触发规则
        """
        self.trigger_rules.append(rule)
        self.trigger_rules.sort(key=lambda r: r.priority, reverse=True)
    
    def handle_event(self, event: Dict) -> List[str]:
        """
        处理事件
        
        Args:
            event: 事件数据
            
        Returns:
            list: 触发的执行ID列表
        """
        event_type = TriggerType(event.get("type", "manual"))
        
        execution_ids = []
        
        for rule in self.trigger_rules:
            if rule.trigger_type != event_type:
                continue
            
            if self._match_conditions(event, rule.conditions):
                execution_id = self._trigger_tests(rule, event)
                if execution_id:
                    execution_ids.append(execution_id)
        
        return execution_ids
    
    def _match_conditions(self, event: Dict, conditions: Dict) -> bool:
        """
        匹配条件
        
        Args:
            event: 事件数据
            conditions: 条件
            
        Returns:
            bool: 是否匹配
        """
        for key, expected_value in conditions.items():
            actual_value = event.get(key)
            
            if isinstance(expected_value, list):
                if actual_value not in expected_value:
                    return False
            elif actual_value != expected_value:
                return False
        
        return True
    
    def _trigger_tests(self, rule: TriggerRule, event: Dict) -> str:
        """
        触发测试
        
        Args:
            rule: 触发规则
            event: 事件数据
            
        Returns:
            str: 执行ID
        """
        params = {
            "test_scope": rule.test_scope,
            "event": event
        }
        
        return self.pipeline_manager.execute_pipeline(
            self._get_pipeline_for_scope(rule.test_scope),
            params
        )
    
    def _get_pipeline_for_scope(self, scope: List[str]) -> str:
        """
        根据范围获取流水线
        
        Args:
            scope: 测试范围
            
        Returns:
            str: 流水线ID
        """
        if "unit" in scope:
            return "unit_test_pipeline"
        elif "integration" in scope:
            return "integration_test_pipeline"
        else:
            return "full_test_pipeline"

class SmartTestSelector:
    """
    智能测试选择器
    根据代码变更智能选择测试用例
    """
    def __init__(self):
        self.code_coverage_map: Dict[str, List[str]] = {}
        self.change_history: List[Dict] = []
    
    def select_tests_for_changes(self, changed_files: List[str]) -> Dict:
        """
        根据变更选择测试
        
        Args:
            changed_files: 变更文件列表
            
        Returns:
            dict: 测试选择结果
        """
        affected_tests = set()
        
        for file in changed_files:
            if file in self.code_coverage_map:
                affected_tests.update(self.code_coverage_map[file])
        
        priority_tests = self._prioritize_tests(list(affected_tests))
        
        return {
            "changed_files": changed_files,
            "affected_tests": list(affected_tests),
            "priority_tests": priority_tests,
            "estimated_duration": len(priority_tests) * 2
        }
    
    def _prioritize_tests(self, tests: List[str]) -> List[str]:
        """
        优先级排序
        
        Args:
            tests: 测试列表
            
        Returns:
            list: 排序后的测试列表
        """
        test_scores = {}
        
        for test in tests:
            score = 0
            
            for change in self.change_history[-100:]:
                if test in change.get("failed_tests", []):
                    score += 10
                if test in change.get("passed_tests", []):
                    score += 1
            
            test_scores[test] = score
        
        return sorted(tests, key=lambda t: test_scores.get(t, 0), reverse=True)
    
    def update_coverage_map(self, test_id: str, covered_files: List[str]):
        """
        更新覆盖映射
        
        Args:
            test_id: 测试ID
            covered_files: 覆盖的文件列表
        """
        for file in covered_files:
            if file not in self.code_coverage_map:
                self.code_coverage_map[file] = []
            
            if test_id not in self.code_coverage_map[file]:
                self.code_coverage_map[file].append(test_id)
    
    def record_test_result(self, test_id: str, passed: bool, duration: float):
        """
        记录测试结果
        
        Args:
            test_id: 测试ID
            passed: 是否通过
            duration: 执行时长
        """
        if not self.change_history:
            self.change_history.append({
                "failed_tests": [],
                "passed_tests": [],
                "durations": {}
            })
        
        current = self.change_history[-1]
        
        if passed:
            current["passed_tests"].append(test_id)
        else:
            current["failed_tests"].append(test_id)
        
        current["durations"][test_id] = duration
```

## 质量门禁

### 1. 门禁规则配置

```python
from typing import Dict, List, Callable
from dataclasses import dataclass
from enum import Enum

class GateAction(Enum):
    """门禁动作枚举"""
    PASS = "pass"
    WARN = "warn"
    BLOCK = "block"

@dataclass
class QualityGate:
    """
    质量门禁类
    定义一个质量门禁规则
    """
    gate_id: str
    name: str
    metric: str
    operator: str
    threshold: float
    action: GateAction
    enabled: bool = True

class QualityGateManager:
    """
    质量门禁管理器
    管理和执行质量门禁
    """
    def __init__(self):
        self.gates: Dict[str, QualityGate] = {}
        self.metric_collectors: Dict[str, Callable] = {}
        self.gate_history: List[Dict] = []
    
    def add_gate(self, gate: QualityGate):
        """
        添加门禁
        
        Args:
            gate: 门禁对象
        """
        self.gates[gate.gate_id] = gate
    
    def register_metric_collector(self, metric_name: str, collector: Callable):
        """
        注册指标收集器
        
        Args:
            metric_name: 指标名称
            collector: 收集函数
        """
        self.metric_collectors[metric_name] = collector
    
    def evaluate_gates(self, context: Dict) -> Dict:
        """
        评估门禁
        
        Args:
            context: 上下文信息
            
        Returns:
            dict: 评估结果
        """
        results = []
        overall_status = GateAction.PASS
        
        for gate in self.gates.values():
            if not gate.enabled:
                continue
            
            result = self._evaluate_gate(gate, context)
            results.append(result)
            
            if result["action"] == GateAction.BLOCK:
                overall_status = GateAction.BLOCK
            elif result["action"] == GateAction.WARN and overall_status != GateAction.BLOCK:
                overall_status = GateAction.WARN
        
        evaluation_result = {
            "overall_status": overall_status.value,
            "gates": results,
            "timestamp": datetime.now().isoformat(),
            "context": context
        }
        
        self.gate_history.append(evaluation_result)
        
        return evaluation_result
    
    def _evaluate_gate(self, gate: QualityGate, context: Dict) -> Dict:
        """
        评估单个门禁
        
        Args:
            gate: 门禁对象
            context: 上下文
            
        Returns:
            dict: 评估结果
        """
        collector = self.metric_collectors.get(gate.metric)
        
        if collector:
            actual_value = collector(context)
        else:
            actual_value = context.get(gate.metric, 0)
        
        passed = self._compare(actual_value, gate.operator, gate.threshold)
        
        if passed:
            action = GateAction.PASS
        elif gate.action == GateAction.BLOCK:
            action = GateAction.BLOCK
        else:
            action = GateAction.WARN
        
        return {
            "gate_id": gate.gate_id,
            "name": gate.name,
            "metric": gate.metric,
            "actual_value": actual_value,
            "threshold": gate.threshold,
            "operator": gate.operator,
            "passed": passed,
            "action": action.value
        }
    
    def _compare(self, actual: float, operator: str, threshold: float) -> bool:
        """
        比较值
        
        Args:
            actual: 实际值
            operator: 操作符
            threshold: 阈值
            
        Returns:
            bool: 是否满足条件
        """
        if operator == ">=":
            return actual >= threshold
        elif operator == "<=":
            return actual <= threshold
        elif operator == ">":
            return actual > threshold
        elif operator == "<":
            return actual < threshold
        elif operator == "==":
            return actual == threshold
        else:
            return False
    
    def get_gate_report(self) -> str:
        """
        获取门禁报告
        
        Returns:
            str: 报告内容
        """
        if not self.gate_history:
            return "暂无门禁历史记录"
        
        latest = self.gate_history[-1]
        
        report_lines = [
            "# 质量门禁报告\n",
            f"评估时间: {latest['timestamp']}\n",
            f"总体状态: {latest['overall_status']}\n",
            "## 门禁详情\n",
            "| 门禁 | 指标 | 实际值 | 阈值 | 状态 |",
            "|------|------|--------|------|------|"
        ]
        
        for gate in latest["gates"]:
            status = "✓" if gate["passed"] else "✗"
            report_lines.append(
                f"| {gate['name']} | {gate['metric']} | "
                f"{gate['actual_value']:.2f} | {gate['threshold']} | {status} |"
            )
        
        return "\n".join(report_lines)
```

### 2. 回归编排

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class RegressionLevel(Enum):
    """回归级别枚举"""
    SMOKE = "smoke"
    SANITY = "sanity"
    FULL = "full"

@dataclass
class RegressionSuite:
    """
    回归测试套件类
    定义一个回归测试套件
    """
    suite_id: str
    name: str
    level: RegressionLevel
    test_cases: List[str]
    parallel: bool = True
    timeout: int = 3600

class RegressionOrchestrator:
    """
    回归编排器
    编排回归测试执行
    """
    def __init__(self):
        self.suites: Dict[str, RegressionSuite] = {}
        self.execution_history: List[Dict] = []
    
    def create_suite(self, suite_data: Dict) -> RegressionSuite:
        """
        创建回归套件
        
        Args:
            suite_data: 套件数据
            
        Returns:
            RegressionSuite: 回归套件
        """
        suite = RegressionSuite(
            suite_id=suite_data.get("suite_id", ""),
            name=suite_data.get("name", ""),
            level=RegressionLevel(suite_data.get("level", "smoke")),
            test_cases=suite_data.get("test_cases", []),
            parallel=suite_data.get("parallel", True),
            timeout=suite_data.get("timeout", 3600)
        )
        
        self.suites[suite.suite_id] = suite
        return suite
    
    def execute_regression(
        self, 
        level: RegressionLevel,
        context: Dict
    ) -> Dict:
        """
        执行回归测试
        
        Args:
            level: 回归级别
            context: 执行上下文
            
        Returns:
            dict: 执行结果
        """
        suite = self._select_suite(level)
        
        if not suite:
            return {"error": f"未找到{level.value}级别的回归套件"}
        
        execution_id = f"REG_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        execution = {
            "execution_id": execution_id,
            "suite_id": suite.suite_id,
            "level": level.value,
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "test_results": [],
            "context": context
        }
        
        if suite.parallel:
            results = self._execute_parallel(suite.test_cases, context)
        else:
            results = self._execute_sequential(suite.test_cases, context)
        
        execution["test_results"] = results
        execution["status"] = "completed"
        execution["end_time"] = datetime.now().isoformat()
        
        passed = sum(1 for r in results if r.get("passed"))
        execution["summary"] = {
            "total": len(results),
            "passed": passed,
            "failed": len(results) - passed,
            "pass_rate": passed / len(results) if results else 0
        }
        
        self.execution_history.append(execution)
        
        return execution
    
    def _select_suite(self, level: RegressionLevel) -> Optional[RegressionSuite]:
        """
        选择回归套件
        
        Args:
            level: 回归级别
            
        Returns:
            RegressionSuite: 回归套件
        """
        for suite in self.suites.values():
            if suite.level == level:
                return suite
        return None
    
    def _execute_parallel(
        self, 
        test_cases: List[str], 
        context: Dict
    ) -> List[Dict]:
        """
        并行执行
        
        Args:
            test_cases: 测试用例列表
            context: 上下文
            
        Returns:
            list: 执行结果
        """
        import concurrent.futures
        
        results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(self._execute_test_case, tc, context): tc 
                for tc in test_cases
            }
            
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                results.append(result)
        
        return results
    
    def _execute_sequential(
        self, 
        test_cases: List[str], 
        context: Dict
    ) -> List[Dict]:
        """
        顺序执行
        
        Args:
            test_cases: 测试用例列表
            context: 上下文
            
        Returns:
            list: 执行结果
        """
        return [
            self._execute_test_case(tc, context) 
            for tc in test_cases
        ]
    
    def _execute_test_case(
        self, 
        test_case_id: str, 
        context: Dict
    ) -> Dict:
        """
        执行测试用例
        
        Args:
            test_case_id: 测试用例ID
            context: 上下文
            
        Returns:
            dict: 执行结果
        """
        return {
            "test_case_id": test_case_id,
            "passed": True,
            "duration": 1.5,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_regression_history(
        self, 
        level: RegressionLevel = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        获取回归历史
        
        Args:
            level: 回归级别
            limit: 限制数量
            
        Returns:
            list: 历史记录
        """
        history = self.execution_history
        
        if level:
            history = [h for h in history if h["level"] == level.value]
        
        return history[-limit:]
```

## 最佳实践

### 1. CI/CD集成策略

| 场景 | 触发策略 | 测试范围 | 目标 |
|-----|---------|---------|------|
| PR提交 | 自动触发 | 单元测试+冒烟测试 | 快速反馈 |
| 合并主分支 | 自动触发 | 完整回归 | 质量保障 |
| 定时任务 | 定时触发 | 全量测试 | 全面覆盖 |
| 发布前 | 手动触发 | 全量+性能+安全 | 发布验证 |

### 2. 质量门禁设置

```
代码提交门禁:
├── 单元测试通过率 >= 95%
├── 代码覆盖率 >= 80%
├── 静态代码分析无高危问题
└── 构建成功

合并门禁:
├── 所有代码提交门禁
├── 集成测试通过率 >= 90%
├── 无未解决的严重缺陷
└── 代码审查通过

发布门禁:
├── 所有合并门禁
├── 性能测试达标
├── 安全扫描通过
└── 验收测试通过
```

### 3. 反馈优化

- **快速失败**：发现问题立即停止，快速反馈
- **精准定位**：提供详细的错误信息和日志
- **趋势分析**：展示质量趋势，辅助决策
- **通知机制**：及时通知相关人员

## 相关资源

- [质量平台建设](/architecture/quality-platform/) - 平台能力建设
- [自动化测试](/frameworks/) - 测试框架和工具
- [AI驱动测试](/ai-testing/) - AI测试能力
