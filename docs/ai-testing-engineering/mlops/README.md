# MLOps与AI测试

> MLOps将机器学习生命周期标准化和自动化，测试在MLOps各个阶段都有关键作用，包括模型训练验证、部署检查、运行时监控等。

---

## 1. MLOps测试集成架构

```
┌─────────────────────────────────────────────────────┐
│                   测试策略层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ 训练测试 │ │ 模型测试 │ │ 部署测试 │ │ 运行测试 │  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │
├─────────────────────────────────────────────────────┤
│                   自动化管道                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ 数据验证 │ │ 训练监控 │ │ 模型评估 │ │ 部署检查 │  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │
├─────────────────────────────────────────────────────┤
│                   基础设施层                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ 训练平台 │ │ 模型仓库 │ │ 推理服务 │ │ 监控系统 │  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 2. 训练阶段测试

### 2.1 数据验证

```python
class TrainingDataValidator:
    """训练数据验证"""
    
    def validate(self, dataset: Dataset) -> ValidationResult:
        """训练前数据验证"""
        checks = {
            'schema': self._validate_schema(dataset),
            'completeness': self._check_completeness(dataset),
            'distribution': self._check_distribution(dataset),
            'leakage': self._check_data_leakage(dataset),
            'quality': self._check_quality(dataset),
        }
        
        return ValidationResult(
            passed=all(c.passed for c in checks.values()),
            checks=checks,
        )
```

### 2.2 训练过程监控

```python
class TrainingMonitor:
    """训练过程监控"""
    
    def __init__(self, expected_behavior: TrainingSpec):
        self.expected = expected_behavior
    
    def on_epoch_end(self, epoch_logs: dict):
        """每个epoch结束时的检查"""
        # 梯度异常检测
        if 'gradients' in epoch_logs:
            self._check_gradients(epoch_logs['gradients'])
        
        # 损失异常检测
        self._check_loss_anomaly(epoch_logs['loss'])
        
        # 早停条件
        if self._should_early_stop(epoch_logs):
            self._trigger_early_stop()
    
    def _check_gradients(self, gradients: List[float]):
        """梯度检查"""
        max_grad = max(abs(g) for g in gradients)
        if max_grad > self.expected.max_gradient:
            self._warn('梯度爆炸风险')
        if max_grad < 1e-7:
            self._warn('梯度消失风险')
```

---

## 3. 模型评估

### 3.1 自动评估流水线

```python
class ModelEvaluator:
    """模型自动评估器"""
    
    def evaluate(self, model: Model, 
                 test_dataset: Dataset) -> EvaluationReport:
        """
        全面模型评估
        
        评估维度:
        1. 通用性能: 准确率、F1等
        2. 细分性能: 按类别/场景
        3. 鲁棒性: 对抗、噪声、漂移
        4. 公平性: 群体公平性
        5. 效率: 延迟、吞吐、资源
        """
        report = EvaluationReport()
        
        # 通用性能
        report.metrics['accuracy'] = self._accuracy(model, test_dataset)
        report.metrics['f1_score'] = self._f1_score(model, test_dataset)
        report.metrics['precision'] = self._precision(model, test_dataset)
        report.metrics['recall'] = self._recall(model, test_dataset)
        
        # 细分性能
        report.subgroup_metrics = self._subgroup_analysis(
            model, test_dataset
        )
        
        # 鲁棒性
        report.robustness = self._robustness_test(model, test_dataset)
        
        # 公平性
        report.fairness = self._fairness_evaluation(
            model, test_dataset
        )
        
        # 效率
        report.efficiency = self._efficiency_test(model)
        
        return report
```

### 3.2 A/B测试支持

```python
class ABTester:
    """模型A/B测试"""
    
    def setup_experiment(self, 
                         control_model: Model,
                         variant_model: Model,
                         traffic_split: Dict = None) -> ABExperiment:
        """
        设置A/B测试
        
        流程:
        1. 分流配置
        2. 指标采集
        3. 统计检验
        4. 决策输出
        """
        experiment = ABExperiment(
            control=control_model,
            variant=variant_model,
            traffic=traffic_split or {'control': 0.5, 'variant': 0.5},
            metrics=self._define_metrics(),
        )
        
        return experiment
```

---

## 4. 部署阶段测试

### 4.1 部署验证

```python
class DeploymentVerifier:
    """部署验证"""
    
    def verify(self, model: Model, deployment: Deployment) -> VerificationReport:
        """
        部署前验证
        
        检查项:
        1. 模型文件完整性
        2. 运行时依赖
        3. 资源配置
        4. 网络连通性
        5. 性能基线
        """
        checks = {
            'integrity': self._verify_model_integrity(model),
            'dependencies': self._check_dependencies(deployment),
            'resources': self._check_resources(deployment),
            'connectivity': self._check_connectivity(deployment),
            'performance': self._baseline_performance(model),
        }
        
        return VerificationReport(checks=checks)
```

### 4.2 灰度发布测试

```python
class CanaryDeployTester:
    """灰度发布测试"""
    
    def monitor_canary(self, canary_metrics: dict) -> DeploymentDecision:
        """
        灰度发布监控
        
        决策逻辑:
        1. 指标健康 → 扩大流量
        2. 指标异常 → 暂停
        3. 严重问题 → 回滚
        """
        if self._is_healthy(canary_metrics):
            return DeploymentDecision.PROMOTE
        elif self._is_degraded(canary_metrics):
            return DeploymentDecision.PAUSE
        else:
            return DeploymentDecision.ROLLBACK
```

---

## 5. 运行时监控

### 5.1 模型健康监控

```python
class ModelHealthMonitor:
    """模型运行时健康监控"""
    
    def monitor(self, inference_logs: List[InferenceLog]) -> HealthReport:
        """
        运行时监控
        
        监控项:
        1. 延迟分布
        2. 错误率
        3. 数据漂移
        4. 模型漂移
        5. 资源使用
        """
        report = HealthReport()
        
        # 延迟监控
        report.latency = self._analyze_latency(inference_logs)
        
        # 错误率
        report.error_rate = self._compute_error_rate(inference_logs)
        
        # 数据漂移
        report.drift = self._detect_drift(inference_logs)
        
        return report
```

---

## 6. 模型回滚

### 6.1 回滚策略

| 策略 | 触发条件 | 回滚范围 |
|------|---------|---------|
| 自动回滚 | 错误率>阈值 | 单实例 |
| 部分回滚 | 性能下降>阈值 | 部分流量 |
| 全部回滚 | 安全事件 | 全部流量 |
| 渐进回滚 | 多指标异常 | 逐步降级 |

### 6.2 回滚执行

```python
class ModelRollback:
    """模型回滚管理器"""
    
    def rollback(self, current_model: Model,
                 target_version: str,
                 strategy: str = 'immediate') -> RollbackResult:
        """
        执行模型回滚
        
        策略:
        - immediate: 立即回滚，快速但可能影响用户
        - gradual: 渐进回滚，平滑但耗时
        - canary: 灰度回滚，先小流量
        """
        target_model = self.model_registry.get(target_version)
        
        if strategy == 'immediate':
            return self._immediate_switch(target_model)
        elif strategy == 'gradual':
            return self._gradual_switch(current_model, target_model)
        else:
            return self._canary_switch(current_model, target_model)
```

---

## 7. 工具链

| 工具 | 功能 | 说明 |
|------|------|------|
| **MLflow** | 实验管理 | 模型追踪注册 |
| **Kubeflow** | 模型部署 | K8s原生ML平台 |
| **KServe** | 模型推理 | 服务器less推理 |
| **Prometheus** | 指标监控 | 系统指标收集 |
| **Grafana** | 数据可视化 | 监控面板 |
| **Evidently** | 模型监控 | ML drift检测 |

---

*最后更新：2025-01-15 | 维护团队：MLOps组*
