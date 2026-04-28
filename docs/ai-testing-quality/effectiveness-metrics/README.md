# 测试有效性度量

> 测试有效性度量用于评估测试活动本身的质量，回答"我们的测试有多好"的问题。它是持续改进测试能力的基础。

---

## 1. 测试有效性度量框架

### 1.1 度量体系

```
测试有效性度量
├── 过程度量 (How well are we testing?)
│   ├── 测试覆盖率
│   ├── 缺陷检出率
│   └── 测试执行效率
├── 结果度量 (What did we find?)
│   ├── 缺陷密度
│   ├── 缺陷逃逸率
│   └── 缺陷重开率
├── 能力度量 (How good is our testing?)
│   ├── 自动化率
│   ├── 测试用例有效性
│   └── 测试投资回报率
└── 质量度量 (How good is the product?)
    ├── 线上缺陷密度
    ├── 可用性指标
    └── 用户满意度
```

---

## 2. 过程度量

### 2.1 测试覆盖率

```python
class CoverageAnalyzer:
    """测试覆盖率分析"""
    
    def analyze(self, test_suite: TestSuite) -> CoverageReport:
        """
        多维度覆盖率分析
        
        覆盖维度:
        1. 功能覆盖: 已测试功能 vs 总功能
        2. 数据覆盖: 测试数据场景覆盖度
        3. 代码覆盖: 代码行/分支覆盖(传统组件)
        4. 模型覆盖: 模型能力维度覆盖
        5. 场景覆盖: 用户场景覆盖度
        """
        return CoverageReport(
            functional_coverage=self._functional_coverage(test_suite),
            data_coverage=self._data_coverage(test_suite),
            model_coverage=self._model_coverage(test_suite),
            scenario_coverage=self._scenario_coverage(test_suite),
        )
```

### 2.2 缺陷检出率

```
缺陷检出率 = 测试阶段发现的缺陷数 / (测试发现 + 生产发现) × 100%

解读:
- >80%: 测试有效
- 60-80%: 测试需要改进
- <60%: 测试严重不足
```

### 2.3 测试执行效率

| 指标 | 公式 | 目标 |
|------|------|------|
| 执行速率 | 用例数 / 小时 | 持续增长 |
| 单用例平均耗时 | 总耗时 / 用例数 | 稳定 |
| 准备时间占比 | 准备时间 / 总时间 | <20% |
| 自动化执行占比 | 自动化用例 / 总执行 | >80% |

---

## 3. 结果度量

### 3.1 缺陷密度

```
缺陷密度 = 缺陷数 / 规模

AI特殊考量:
- 按模型版本计算
- 按功能模块计算
- 按数据类型计算
- 按严重程度分级
```

### 3.2 缺陷逃逸率

```python
class DefectEscapeAnalyzer:
    """缺陷逃逸分析"""
    
    def analyze(self, test_defects: List[Defect],
                production_defects: List[Defect]) -> EscapeReport:
        """
        缺陷逃逸分析
        
        分析维度:
        1. 逃逸缺陷的分类分布
        2. 逃逸原因分析
        3. 遗漏场景识别
        4. 改进建议生成
        """
        escape_types = self._categorize_escapes(production_defects)
        root_causes = self._find_root_causes(production_defects)
        
        return EscapeReport(
            escape_rate=len(production_defects) / 
                       (len(test_defects) + len(production_defects)),
            type_distribution=escape_types,
            root_causes=root_causes,
            recommendations=self._generate_recommendations(root_causes),
        )
```

### 3.3 缺陷重开率

```
缺陷重开率 = 重开缺陷数 / 修复缺陷总数 × 100%

解读:
- <5%: 修复质量高
- 5-15%: 修复质量可接受
- >15%: 修复流程需要改进
```

---

## 4. 能力度量

### 4.1 自动化率

```
自动化率 = 自动化测试用例数 / 总测试用例数 × 100%

按类型细分:
├── 功能测试自动化: 目标 >70%
├── 性能测试自动化: 目标 >80%
├── 安全测试自动化: 目标 >60%
└── 回归测试自动化: 目标 >90%
```

### 4.2 测试用例有效性

```python
class TestEffectiveness:
    """测试用例有效性分析"""
    
    def calculate(self, test_cases: List[TestCase],
                  execution_history: List[ExecutionRecord]) -> Effectiveness:
        """
        测试用例有效性
        
        指标:
        1. 缺陷发现率: 用例发现的缺陷数 / 执行次数
        2. 回归命中率: 回归测试发现已有缺陷的次数
        3. 误报率: 误报次数 / 总失败次数
        4. 衰减率: 长期未触发失败的用例比例
        """
        # 计算每个用例的有效性分数
        scores = []
        for case in test_cases:
            history = self._get_case_history(case, execution_history)
            score = self._calculate_case_score(case, history)
            scores.append(score)
        
        # 整体有效性
        return Effectiveness(
            avg_score=np.mean(scores),
            case_scores=dict(zip(
                [c.id for c in test_cases], scores
            )),
            low_effective_cases=self._find_low_effective(
                scores, threshold=0.3
            ),
        )
```

### 4.3 测试投资回报率

```python
def calculate_test_roi(
    cost_avoided: float,     # 避免的损失
    testing_cost: float,      # 测试成本
) -> float:
    """
    ROI = (避免的损失 - 测试成本) / 测试成本
    
    避免的损失估算:
    - 线上故障修复成本
    - 用户流失成本
    - 品牌声誉损失
    - 合规罚款风险
    """
    return (cost_avoided - testing_cost) / testing_cost
```

---

## 5. 质量度量

### 5.1 线上质量指标

| 指标 | 说明 | 采集方式 |
|------|------|---------|
| 线上缺陷密度 | 每月每千行/百万token缺陷数 | 工单系统 |
| MTTR | 平均故障恢复时间 | 监控系统 |
| 可用性 | 服务可用时间占比 | 监控平台 |
| 用户投诉率 | 投诉用户占比 | 客服系统 |
| CSAT | 用户满意度评分 | 调查 |

### 5.2 质量趋势分析

```python
class QualityTrendAnalyzer:
    """质量趋势分析"""
    
    def analyze(self, metrics: Dict[str, List[DataPoint]],
                time_range: DateRange) -> TrendReport:
        """
        质量趋势分析
        
        分析:
        1. 各指标趋势方向
        2. 异常点检测
        3. 相关性分析
        4. 预测分析
        """
        report = TrendReport()
        
        for metric_name, data_points in metrics.items():
            trend = self._detect_trend(data_points)
            anomalies = self._detect_anomalies(data_points)
            
            report.add_metric_trend(
                metric_name, trend, anomalies
            )
        
        return report
```

---

## 6. 度量看板

### 6.1 核心看板

```
┌──────────────────────────────────────────────────┐
│              AI测试质量看板                        │
│                                                  │
│  测试概况                                        │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│  │通过率 │ │覆盖率 │ │自动化 │ │缺陷  │       │
│  │ 92%   │ │ 85%   │ │ 78%   │ │逃逸  │       │
│  │ ↑2%   │ │ ↑5%   │ │ ↑3%   │ │ -1%  │       │
│  └───────┘ └───────┘ └───────┘ └───────┘       │
│                                                  │
│  缺陷趋势 (近30天)                                │
│  ┌────────────────────────────────────┐          │
│  │ ████ ███ ████ ██ ████ ████ ████ █ │          │
│  └────────────────────────────────────┘          │
│                                                  │
│  模型质量对比                                     │
│  ┌──────┬───────┬───────┬───────┐               │
│  │模型  │准确率 │ 安全性 │ 性能  │               │
│  ├──────┼───────┼───────┼───────┤               │
│  │v1.0  │ 85.2% │  92%  │  120ms│               │
│  │v1.1  │ 88.5% │  95%  │  135ms│ ✅            │
│  │v1.2  │ 91.0% │  97%  │  128ms │ 🔄构建中     │
│  └──────┴───────┴───────┴───────┘               │
└──────────────────────────────────────────────────┘
```

---

## 7. 持续改进

### 7.1 改进循环

```
度量收集 → 问题识别 → 根因分析 → 改进实施 → 效果验证
  ↑                                              │
  └──────────────── 持续 ────────────────────────┘
```

### 7.2 度量指标目标参考

| 指标 | 优秀 | 良好 | 待改进 |
|------|------|------|--------|
| 测试通过率 | >95% | 90-95% | <90% |
| 缺陷逃逸率 | <5% | 5-10% | >10% |
| 自动化率 | >85% | 70-85% | <70% |
| 覆盖率 | >90% | 80-90% | <80% |
| 测试ROI | >5:1 | 3-5:1 | <3:1 |

---

*最后更新：2025-01-15 | 维护团队：质量度量组*
