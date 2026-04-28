# 测试数据工程

> AI测试数据工程涵盖数据收集、清洗、标注、增强、版本化、质量监控等全生命周期管理，为AI测试提供可靠的数据基础。

---

## 1. 测试数据生命周期

```
需求分析 → 数据规划 → 数据采集 → 数据清洗 → 数据标注 → 
数据增强 → 质量评估 → 版本管理 → 持续监控
```

---

## 2. 测试数据规划

### 2.1 数据需求分析

```python
class DataRequirementAnalyzer:
    """测试数据需求分析"""
    
    def analyze(self, model_spec: ModelSpecification,
                test_scenarios: List[TestScenario]) -> DataPlan:
        """
        根据模型规格和测试场景分析数据需求
        
        输出:
        - 数据类型和格式
        - 数据量估算
        - 数据分布要求
        - 特殊数据需求（边界、对抗等）
        """
        data_types = self._identify_data_types(model_spec)
        data_volume = self._estimate_volume(test_scenarios)
        distribution = self._define_distribution(model_spec)
        
        return DataPlan(
            types=data_types,
            volume=data_volume,
            distribution=distribution,
            special_requirements=self._identify_special_requirements(
                test_scenarios
            ),
        )
```

### 2.2 数据分布设计

| 数据类别 | 占比 | 说明 |
|---------|------|------|
| 正常样本 | 60% | 典型用户场景 |
| 边界样本 | 15% | 边缘但合法的输入 |
| 对抗样本 | 10% | 恶意构造的输入 |
| 异常样本 | 10% | 格式错误、缺失等 |
| 未知样本 | 5% | 分布外样本 |

---

## 3. 数据采集

### 3.1 采集策略

```python
class DataCollector:
    """数据采集器"""
    
    def collect(self, source_type: str, 
                config: CollectionConfig) -> Dataset:
        """
        多源数据采集
        
        数据源:
        - 线上日志: 真实用户交互
        - 合成数据: 程序化生成
        - 公开数据集: 基准数据集
        - 专家标注: 高质量人工标注
        - AIGC生成: AI辅助生成
        """
        if source_type == 'online_logs':
            return self._collect_from_logs(config)
        elif source_type == 'synthetic':
            return self._generate_synthetic(config)
        elif source_type == 'public':
            return self._download_public(config)
        elif source_type == 'expert':
            return self._annotate_expert(config)
```

### 3.2 合成数据生成

```python
class SyntheticDataGenerator:
    """合成数据生成器"""
    
    def generate(self, schema: DataSchema,
                 count: int,
                 distribution: Dict = None) -> List[Sample]:
        """
        基于规则的合成数据生成
        
        方法:
        1. 模板填充: 预定义模板 + 变量替换
        2. 变异增强: 基于真实样本变异
        3. LLM生成: 利用大语言模型生成
        4. 程序合成: 代码生成对应输入输出
        """
        if method == 'template':
            return self._template_fill(schema, count)
        elif method == 'mutation':
            return self._mutate(schema, count)
        elif method == 'llm':
            return self._llm_generate(schema, count)
```

---

## 4. 数据清洗

### 4.1 清洗规则

```python
class DataCleaner:
    """数据清洗器"""
    
    def clean(self, raw_data: List[Sample]) -> List[Sample]:
        """
        数据清洗流水线
        
        步骤:
        1. 去重: 去除重复样本
        2. 过滤: 移除低质量样本
        3. 修复: 自动修复可修复的问题
        4. 标准化: 统一格式和编码
        5. 脱敏: 移除敏感信息
        """
        cleaned = self._dedup(raw_data)
        cleaned = self._filter_low_quality(cleaned)
        cleaned = self._fix_issues(cleaned)
        cleaned = self._normalize(cleaned)
        cleaned = self._sanitize(cleaned)
        
        return cleaned
    
    def _dedup(self, data: List[Sample]) -> List[Sample]:
        """去重"""
        seen = set()
        unique = []
        for sample in data:
            key = self._hash_sample(sample)
            if key not in seen:
                seen.add(key)
                unique.append(sample)
        return unique
```

### 4.2 数据修复

| 问题类型 | 修复策略 |
|---------|---------|
| 缺失值 | 默认值/均值/模型预测 |
| 格式错误 | 格式转换/正则匹配 |
| 编码问题 | 编码检测/转换 |
| 异常值 | 裁剪/替换/标记 |

---

## 5. 数据标注

### 5.1 标注流程

```
标注设计 → 标注工具配置 → 标注执行 → 质量审核 → 标注验收
```

### 5.2 标注质量管理

```python
class AnnotationQA:
    """标注质量管理"""
    
    def evaluate(self, annotations: List[Annotation]) -> QAResult:
        """
        标注质量评估
        
        指标:
        - 标注一致性: 多标注者间一致性
        - 标注准确率: 与专家标注对比
        - 标注覆盖率: 标注项目覆盖度
        - 标注时效性: 标注完成时效
        """
        inter_annotator = self._inter_rater_reliability(annotations)
        accuracy = self._annotation_accuracy(annotations)
        coverage = self._annotation_coverage(annotations)
        
        return QAResult(
            consistency_score=inter_annotator.cohen_kappa,
            accuracy=accuracy,
            coverage=coverage,
            issues=self._find_annotation_issues(annotations),
        )
```

---

## 6. 数据增强

### 6.1 文本增强

```python
class TextAugmenter:
    """文本数据增强"""
    
    def augment(self, texts: List[str],
                strategy: str = 'mixed') -> List[str]:
        """
        文本增强策略
        
        - 同义替换: 使用词典/模型替换词汇
        - 回译: 中→英→中
        - 随机删除: 随机删除部分词语
        - 随机插入: 插入相关词语
        - EDA: Easy Data Augmentation
        - LLM增强: 大模型改写
        """
        augmented = []
        for text in texts:
            if strategy == 'synonym':
                augmented.append(self._synonym_replace(text))
            elif strategy == 'backtranslate':
                augmented.append(self._backtranslate(text))
            elif strategy == 'mixed':
                augmented.append(self._eda(text))
        
        return augmented
```

### 6.2 数据版本管理

```python
class DataVersionManager:
    """数据版本管理"""
    
    def version(self, dataset: Dataset, 
                version_type: str = 'minor',
                changes: List[ChangeRecord] = None) -> DatasetVersion:
        """
        数据版本管理
        
        版本策略:
        - 语义化版本: MAJOR.MINOR.PATCH
        - MAJOR: 数据分布重大变更
        - MINOR: 数据量增加/质量改进
        - PATCH: 数据修复
        """
        version = DatasetVersion(
            dataset_id=dataset.id,
            version=self._next_version(version_type),
            changes=changes or [],
            statistics=self._compute_statistics(dataset.samples),
        )
        
        self._store(version)
        return version
```

---

## 7. 数据监控

### 7.1 数据漂移检测

```python
class DataDriftDetector:
    """数据漂移检测"""
    
    def detect(self, baseline: Dataset, 
               current: Dataset) -> DriftReport:
        """
        检测数据分布漂移
        
        方法:
        1. PSI: Population Stability Index
        2. KS检验: Kolmogorov-Smirnov test
        3. 特征分布对比
        4. 概念漂移检测
        """
        report = DriftReport()
        
        # 特征级漂移
        for feature in baseline.feature_names:
            psi = self._compute_psi(baseline, current, feature)
            report.add_feature_drift(feature, psi)
        
        # 整体漂移
        report.overall_psi = self._compute_overall_psi(
            baseline, current
        )
        
        return report
```

---

## 8. 工具链

| 工具 | 功能 | 说明 |
|------|------|------|
| **DVC** | 数据版本控制 | Git-like数据管理 |
| **MLflow** | 实验追踪 | 数据+模型追踪 |
| **Label Studio** | 数据标注 | 开源标注平台 |
| **Great Expectations** | 数据质量 | 数据验证框架 |
| **Arize** | 数据监控 | ML监控平台 |
| **Evidently** | 漂移检测 | 数据/模型漂移 |

---

*最后更新：2025-01-15 | 维护团队：数据工程组*
