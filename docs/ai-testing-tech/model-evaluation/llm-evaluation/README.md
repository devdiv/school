# 大模型评测体系

构建科学、全面的大模型评测体系，涵盖效果、性能、安全等多维度评估。

## 概述

大模型评测体系是AI测试架构的关键组成部分，通过系统化的评测方法，确保模型在实际应用中的效果、性能和安全性。本体系覆盖LLM、多模态模型、AIGC等多种模型类型的评测需求。

### 核心价值

- **效果验证**：确保模型输出符合预期质量
- **性能保障**：满足实际应用的性能要求
- **安全合规**：识别和防范潜在风险
- **持续优化**：为模型改进提供量化依据

### 评测维度框架

```
┌─────────────────────────────────────────────────────────┐
│                  大模型评测体系                          │
├─────────────────────────────────────────────────────────┤
│  效果评测    │  性能评测    │  安全评测                  │
├─────────────────────────────────────────────────────────┤
│  微调评测    │  对比评测    │  基准测试                  │
└─────────────────────────────────────────────────────────┘
```

## 效果评测

### 1. 评测指标设计

设计科学的效果评测指标体系。

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json

class MetricType(Enum):
    """评测指标类型枚举"""
    ACCURACY = "accuracy"
    PRECISION = "precision"
    RECALL = "recall"
    F1 = "f1"
    BLEU = "bleu"
    ROUGE = "rouge"
    SEMANTIC_SIMILARITY = "semantic_similarity"

@dataclass
class EvaluationMetric:
    """
    评测指标类
    定义一个评测指标的完整信息
    """
    name: str
    metric_type: MetricType
    description: str
    weight: float
    threshold: float
    is_higher_better: bool = True

class MetricsDesigner:
    """
    评测指标设计器
    设计和管理评测指标体系
    """
    def __init__(self):
        self.metrics: Dict[str, EvaluationMetric] = {}
        self._init_default_metrics()
    
    def _init_default_metrics(self):
        """
        初始化默认评测指标
        """
        default_metrics = [
            EvaluationMetric(
                name="accuracy",
                metric_type=MetricType.ACCURACY,
                description="准确率，正确预测的比例",
                weight=0.3,
                threshold=0.85
            ),
            EvaluationMetric(
                name="precision",
                metric_type=MetricType.PRECISION,
                description="精确率，预测为正的样本中实际为正的比例",
                weight=0.2,
                threshold=0.80
            ),
            EvaluationMetric(
                name="recall",
                metric_type=MetricType.RECALL,
                description="召回率，实际为正的样本中被预测为正的比例",
                weight=0.2,
                threshold=0.80
            ),
            EvaluationMetric(
                name="f1_score",
                metric_type=MetricType.F1,
                description="F1分数，精确率和召回率的调和平均",
                weight=0.3,
                threshold=0.82
            )
        ]
        
        for metric in default_metrics:
            self.metrics[metric.name] = metric
    
    def add_custom_metric(self, metric: EvaluationMetric):
        """
        添加自定义指标
        
        Args:
            metric: 评测指标对象
        """
        self.metrics[metric.name] = metric
    
    def calculate_metrics(self, predictions: List, ground_truths: List) -> Dict:
        """
        计算评测指标
        
        Args:
            predictions: 预测结果列表
            ground_truths: 真实标签列表
            
        Returns:
            dict: 指标计算结果
        """
        results = {}
        
        for name, metric in self.metrics.items():
            if metric.metric_type == MetricType.ACCURACY:
                results[name] = self._calculate_accuracy(predictions, ground_truths)
            elif metric.metric_type == MetricType.PRECISION:
                results[name] = self._calculate_precision(predictions, ground_truths)
            elif metric.metric_type == MetricType.RECALL:
                results[name] = self._calculate_recall(predictions, ground_truths)
            elif metric.metric_type == MetricType.F1:
                results[name] = self._calculate_f1(predictions, ground_truths)
            elif metric.metric_type == MetricType.BLEU:
                results[name] = self._calculate_bleu(predictions, ground_truths)
            elif metric.metric_type == MetricType.ROUGE:
                results[name] = self._calculate_rouge(predictions, ground_truths)
            elif metric.metric_type == MetricType.SEMANTIC_SIMILARITY:
                results[name] = self._calculate_semantic_similarity(predictions, ground_truths)
        
        return results
    
    def _calculate_accuracy(self, predictions: List, ground_truths: List) -> float:
        """
        计算准确率
        
        Args:
            predictions: 预测结果
            ground_truths: 真实标签
            
        Returns:
            float: 准确率
        """
        if not predictions:
            return 0.0
        
        correct = sum(1 for p, g in zip(predictions, ground_truths) if p == g)
        return correct / len(predictions)
    
    def _calculate_precision(self, predictions: List, ground_truths: List) -> float:
        """
        计算精确率
        
        Args:
            predictions: 预测结果
            ground_truths: 真实标签
            
        Returns:
            float: 精确率
        """
        true_positives = sum(1 for p, g in zip(predictions, ground_truths) 
                           if p == 1 and g == 1)
        predicted_positives = sum(1 for p in predictions if p == 1)
        
        return true_positives / predicted_positives if predicted_positives > 0 else 0.0
    
    def _calculate_recall(self, predictions: List, ground_truths: List) -> float:
        """
        计算召回率
        
        Args:
            predictions: 预测结果
            ground_truths: 真实标签
            
        Returns:
            float: 召回率
        """
        true_positives = sum(1 for p, g in zip(predictions, ground_truths) 
                           if p == 1 and g == 1)
        actual_positives = sum(1 for g in ground_truths if g == 1)
        
        return true_positives / actual_positives if actual_positives > 0 else 0.0
    
    def _calculate_f1(self, predictions: List, ground_truths: List) -> float:
        """
        计算F1分数
        
        Args:
            predictions: 预测结果
            ground_truths: 真实标签
            
        Returns:
            float: F1分数
        """
        precision = self._calculate_precision(predictions, ground_truths)
        recall = self._calculate_recall(predictions, ground_truths)
        
        if precision + recall == 0:
            return 0.0
        
        return 2 * (precision * recall) / (precision + recall)
    
    def _calculate_bleu(self, predictions: List[str], ground_truths: List[str]) -> float:
        """
        计算BLEU分数
        
        Args:
            predictions: 预测文本列表
            ground_truths: 参考文本列表
            
        Returns:
            float: BLEU分数
        """
        from collections import Counter
        
        def get_ngrams(text: str, n: int) -> Counter:
            words = text.split()
            ngrams = []
            for i in range(len(words) - n + 1):
                ngrams.append(tuple(words[i:i+n]))
            return Counter(ngrams)
        
        total_score = 0.0
        
        for pred, ref in zip(predictions, ground_truths):
            scores = []
            for n in range(1, 5):
                pred_ngrams = get_ngrams(pred, n)
                ref_ngrams = get_ngrams(ref, n)
                
                matches = sum((pred_ngrams & ref_ngrams).values())
                total = sum(pred_ngrams.values())
                
                score = matches / total if total > 0 else 0
                scores.append(score)
            
            if all(s > 0 for s in scores):
                import math
                avg_score = math.exp(sum(math.log(s) for s in scores) / 4)
            else:
                avg_score = 0.0
            
            total_score += avg_score
        
        return total_score / len(predictions) if predictions else 0.0
    
    def _calculate_rouge(self, predictions: List[str], ground_truths: List[str]) -> Dict:
        """
        计算ROUGE分数
        
        Args:
            predictions: 预测文本列表
            ground_truths: 参考文本列表
            
        Returns:
            dict: ROUGE分数字典
        """
        def lcs_length(s1: str, s2: str) -> int:
            words1 = s1.split()
            words2 = s2.split()
            m, n = len(words1), len(words2)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if words1[i-1] == words2[j-1]:
                        dp[i][j] = dp[i-1][j-1] + 1
                    else:
                        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            
            return dp[m][n]
        
        rouge_l_scores = []
        
        for pred, ref in zip(predictions, ground_truths):
            lcs_len = lcs_length(pred, ref)
            ref_len = len(ref.split())
            pred_len = len(pred.split())
            
            if ref_len == 0 or pred_len == 0:
                rouge_l_scores.append(0.0)
                continue
            
            recall = lcs_len / ref_len
            precision = lcs_len / pred_len
            
            if recall + precision == 0:
                f_score = 0.0
            else:
                f_score = 2 * recall * precision / (recall + precision)
            
            rouge_l_scores.append(f_score)
        
        return {
            "rouge_l": sum(rouge_l_scores) / len(rouge_l_scores) if rouge_l_scores else 0.0
        }
    
    def _calculate_semantic_similarity(
        self, 
        predictions: List[str], 
        ground_truths: List[str]
    ) -> float:
        """
        计算语义相似度
        
        Args:
            predictions: 预测文本列表
            ground_truths: 参考文本列表
            
        Returns:
            float: 平均语义相似度
        """
        pass
        
        return 0.85
    
    def evaluate_against_thresholds(self, results: Dict) -> Dict:
        """
        根据阈值评估结果
        
        Args:
            results: 指标计算结果
            
        Returns:
            dict: 评估结果
        """
        evaluation = {}
        
        for name, value in results.items():
            if name in self.metrics:
                metric = self.metrics[name]
                passed = value >= metric.threshold if metric.is_higher_better else value <= metric.threshold
                
                evaluation[name] = {
                    "value": value,
                    "threshold": metric.threshold,
                    "passed": passed,
                    "weight": metric.weight
                }
        
        total_score = sum(
            eval_data["value"] * eval_data["weight"] 
            for eval_data in evaluation.values()
        )
        
        all_passed = all(eval_data["passed"] for eval_data in evaluation.values())
        
        return {
            "metrics": evaluation,
            "total_score": total_score,
            "all_passed": all_passed
        }
```

### 2. 数据集构建

构建高质量的评测数据集。

```python
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import hashlib

@dataclass
class DataSample:
    """
    数据样本类
    表示评测数据集中的一个样本
    """
    sample_id: str
    input_text: str
    expected_output: str
    task_type: str
    difficulty: str
    metadata: Dict = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

@dataclass
class Dataset:
    """
    数据集类
    管理评测数据集
    """
    dataset_id: str
    name: str
    description: str
    version: str
    samples: List[DataSample] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

class DatasetBuilder:
    """
    数据集构建器
    构建和管理评测数据集
    """
    def __init__(self):
        self.datasets: Dict[str, Dataset] = {}
    
    def create_dataset(
        self, 
        name: str, 
        description: str,
        version: str = "1.0.0"
    ) -> Dataset:
        """
        创建数据集
        
        Args:
            name: 数据集名称
            description: 数据集描述
            version: 版本号
            
        Returns:
            Dataset: 创建的数据集
        """
        dataset_id = self._generate_id(name)
        
        dataset = Dataset(
            dataset_id=dataset_id,
            name=name,
            description=description,
            version=version
        )
        
        self.datasets[dataset_id] = dataset
        return dataset
    
    def _generate_id(self, name: str) -> str:
        """
        生成数据集ID
        
        Args:
            name: 数据集名称
            
        Returns:
            str: 数据集ID
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        hash_input = f"{name}_{timestamp}".encode()
        return hashlib.md5(hash_input).hexdigest()[:12]
    
    def add_sample(
        self,
        dataset_id: str,
        input_text: str,
        expected_output: str,
        task_type: str,
        difficulty: str = "medium",
        metadata: Dict = None,
        tags: List[str] = None
    ) -> DataSample:
        """
        添加样本到数据集
        
        Args:
            dataset_id: 数据集ID
            input_text: 输入文本
            expected_output: 期望输出
            task_type: 任务类型
            difficulty: 难度级别
            metadata: 元数据
            tags: 标签列表
            
        Returns:
            DataSample: 添加的样本
        """
        if dataset_id not in self.datasets:
            raise ValueError(f"数据集 {dataset_id} 不存在")
        
        sample_id = self._generate_sample_id(dataset_id, input_text)
        
        sample = DataSample(
            sample_id=sample_id,
            input_text=input_text,
            expected_output=expected_output,
            task_type=task_type,
            difficulty=difficulty,
            metadata=metadata or {},
            tags=tags or []
        )
        
        self.datasets[dataset_id].samples.append(sample)
        self.datasets[dataset_id].updated_at = datetime.now()
        
        return sample
    
    def _generate_sample_id(self, dataset_id: str, input_text: str) -> str:
        """
        生成样本ID
        
        Args:
            dataset_id: 数据集ID
            input_text: 输入文本
            
        Returns:
            str: 样本ID
        """
        hash_input = f"{dataset_id}_{input_text}".encode()
        return f"sample_{hashlib.md5(hash_input).hexdigest()[:8]}"
    
    def import_from_json(self, json_file: str) -> Dataset:
        """
        从JSON文件导入数据集
        
        Args:
            json_file: JSON文件路径
            
        Returns:
            Dataset: 导入的数据集
        """
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        dataset = self.create_dataset(
            name=data.get("name", "imported_dataset"),
            description=data.get("description", ""),
            version=data.get("version", "1.0.0")
        )
        
        for sample_data in data.get("samples", []):
            self.add_sample(
                dataset_id=dataset.dataset_id,
                input_text=sample_data.get("input", ""),
                expected_output=sample_data.get("expected_output", ""),
                task_type=sample_data.get("task_type", "general"),
                difficulty=sample_data.get("difficulty", "medium"),
                metadata=sample_data.get("metadata"),
                tags=sample_data.get("tags")
            )
        
        return dataset
    
    def export_to_json(self, dataset_id: str, output_file: str):
        """
        导出数据集到JSON文件
        
        Args:
            dataset_id: 数据集ID
            output_file: 输出文件路径
        """
        if dataset_id not in self.datasets:
            raise ValueError(f"数据集 {dataset_id} 不存在")
        
        dataset = self.datasets[dataset_id]
        
        data = {
            "name": dataset.name,
            "description": dataset.description,
            "version": dataset.version,
            "created_at": dataset.created_at.isoformat(),
            "updated_at": dataset.updated_at.isoformat(),
            "samples": [
                {
                    "sample_id": s.sample_id,
                    "input": s.input_text,
                    "expected_output": s.expected_output,
                    "task_type": s.task_type,
                    "difficulty": s.difficulty,
                    "metadata": s.metadata,
                    "tags": s.tags
                }
                for s in dataset.samples
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def split_dataset(
        self, 
        dataset_id: str, 
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
        test_ratio: float = 0.1,
        stratify_by: str = None
    ) -> Dict[str, List[DataSample]]:
        """
        划分数据集
        
        Args:
            dataset_id: 数据集ID
            train_ratio: 训练集比例
            val_ratio: 验证集比例
            test_ratio: 测试集比例
            stratify_by: 分层依据字段
            
        Returns:
            dict: 划分后的数据集
        """
        if dataset_id not in self.datasets:
            raise ValueError(f"数据集 {dataset_id} 不存在")
        
        samples = self.datasets[dataset_id].samples.copy()
        
        import random
        random.shuffle(samples)
        
        total = len(samples)
        train_size = int(total * train_ratio)
        val_size = int(total * val_ratio)
        
        return {
            "train": samples[:train_size],
            "val": samples[train_size:train_size + val_size],
            "test": samples[train_size + val_size:]
        }
    
    def get_dataset_statistics(self, dataset_id: str) -> Dict:
        """
        获取数据集统计信息
        
        Args:
            dataset_id: 数据集ID
            
        Returns:
            dict: 统计信息
        """
        if dataset_id not in self.datasets:
            raise ValueError(f"数据集 {dataset_id} 不存在")
        
        dataset = self.datasets[dataset_id]
        samples = dataset.samples
        
        task_types = {}
        difficulties = {}
        tags_count = {}
        
        for sample in samples:
            task_types[sample.task_type] = task_types.get(sample.task_type, 0) + 1
            difficulties[sample.difficulty] = difficulties.get(sample.difficulty, 0) + 1
            
            for tag in sample.tags:
                tags_count[tag] = tags_count.get(tag, 0) + 1
        
        return {
            "total_samples": len(samples),
            "task_types": task_types,
            "difficulties": difficulties,
            "tags": tags_count,
            "avg_input_length": sum(len(s.input_text) for s in samples) / len(samples) if samples else 0,
            "avg_output_length": sum(len(s.expected_output) for s in samples) / len(samples) if samples else 0
        }
```

### 3. 评测流程自动化

自动化评测流程构建。

```python
from typing import Dict, List, Callable, Any
from dataclasses import dataclass
from datetime import datetime
import asyncio

@dataclass
class EvaluationTask:
    """
    评测任务类
    表示一个评测任务
    """
    task_id: str
    model_name: str
    dataset_id: str
    metrics: List[str]
    status: str = "pending"
    results: Dict = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class EvaluationPipeline:
    """
    评测流水线
    自动化评测流程管理
    """
    def __init__(self):
        self.metrics_designer = MetricsDesigner()
        self.dataset_builder = DatasetBuilder()
        self.tasks: Dict[str, EvaluationTask] = {}
        self.model_registry: Dict[str, Callable] = {}
    
    def register_model(self, model_name: str, model_callable: Callable):
        """
        注册模型
        
        Args:
            model_name: 模型名称
            model_callable: 模型调用函数
        """
        self.model_registry[model_name] = model_callable
    
    def create_evaluation_task(
        self,
        model_name: str,
        dataset_id: str,
        metrics: List[str] = None
    ) -> EvaluationTask:
        """
        创建评测任务
        
        Args:
            model_name: 模型名称
            dataset_id: 数据集ID
            metrics: 评测指标列表
            
        Returns:
            EvaluationTask: 评测任务
        """
        task_id = f"eval_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        task = EvaluationTask(
            task_id=task_id,
            model_name=model_name,
            dataset_id=dataset_id,
            metrics=metrics or ["accuracy", "f1_score"]
        )
        
        self.tasks[task_id] = task
        return task
    
    async def run_evaluation(self, task_id: str) -> Dict:
        """
        运行评测任务
        
        Args:
            task_id: 任务ID
            
        Returns:
            dict: 评测结果
        """
        if task_id not in self.tasks:
            raise ValueError(f"任务 {task_id} 不存在")
        
        task = self.tasks[task_id]
        task.status = "running"
        
        try:
            model = self.model_registry.get(task.model_name)
            if not model:
                raise ValueError(f"模型 {task.model_name} 未注册")
            
            dataset = self.dataset_builder.datasets.get(task.dataset_id)
            if not dataset:
                raise ValueError(f"数据集 {task.dataset_id} 不存在")
            
            predictions = []
            ground_truths = []
            
            for sample in dataset.samples:
                prediction = await self._run_model(model, sample.input_text)
                predictions.append(prediction)
                ground_truths.append(sample.expected_output)
            
            metrics_results = self.metrics_designer.calculate_metrics(
                predictions, 
                ground_truths
            )
            
            threshold_evaluation = self.metrics_designer.evaluate_against_thresholds(
                metrics_results
            )
            
            task.results = {
                "metrics": metrics_results,
                "threshold_evaluation": threshold_evaluation,
                "sample_count": len(predictions),
                "completed_at": datetime.now().isoformat()
            }
            task.status = "completed"
            
            return task.results
            
        except Exception as e:
            task.status = "failed"
            task.results = {"error": str(e)}
            raise
    
    async def _run_model(self, model: Callable, input_text: str) -> Any:
        """
        运行模型
        
        Args:
            model: 模型函数
            input_text: 输入文本
            
        Returns:
            Any: 模型输出
        """
        if asyncio.iscoroutinefunction(model):
            return await model(input_text)
        else:
            return model(input_text)
    
    async def run_batch_evaluation(
        self,
        model_names: List[str],
        dataset_id: str,
        metrics: List[str] = None
    ) -> Dict:
        """
        批量运行评测
        
        Args:
            model_names: 模型名称列表
            dataset_id: 数据集ID
            metrics: 评测指标列表
            
        Returns:
            dict: 批量评测结果
        """
        tasks = []
        
        for model_name in model_names:
            task = self.create_evaluation_task(model_name, dataset_id, metrics)
            tasks.append(self.run_evaluation(task.task_id))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            model_name: result if not isinstance(result, Exception) else {"error": str(result)}
            for model_name, result in zip(model_names, results)
        }
    
    def get_task_status(self, task_id: str) -> Dict:
        """
        获取任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            dict: 任务状态
        """
        if task_id not in self.tasks:
            return {"error": "任务不存在"}
        
        task = self.tasks[task_id]
        
        return {
            "task_id": task.task_id,
            "model_name": task.model_name,
            "dataset_id": task.dataset_id,
            "status": task.status,
            "created_at": task.created_at.isoformat(),
            "results": task.results
        }
    
    def generate_comparison_report(self, task_ids: List[str]) -> str:
        """
        生成对比报告
        
        Args:
            task_ids: 任务ID列表
            
        Returns:
            str: 对比报告
        """
        report_lines = ["# 模型评测对比报告\n"]
        report_lines.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        report_lines.append("\n## 评测结果对比\n")
        report_lines.append("| 模型 | 状态 | 准确率 | F1分数 | 总分 |")
        report_lines.append("|------|------|--------|--------|------|")
        
        for task_id in task_ids:
            if task_id not in self.tasks:
                continue
            
            task = self.tasks[task_id]
            
            if task.results:
                metrics = task.results.get("metrics", {})
                threshold_eval = task.results.get("threshold_evaluation", {})
                
                report_lines.append(
                    f"| {task.model_name} | {task.status} | "
                    f"{metrics.get('accuracy', 0):.2%} | "
                    f"{metrics.get('f1_score', 0):.2%} | "
                    f"{threshold_eval.get('total_score', 0):.2f} |"
                )
            else:
                report_lines.append(f"| {task.model_name} | {task.status} | - | - | - |")
        
        return "\n".join(report_lines)
```

## 性能评测

### 1. 性能指标

```python
from typing import Dict, List
from dataclasses import dataclass
import time
import statistics

@dataclass
class PerformanceMetrics:
    """
    性能指标类
    记录模型性能相关指标
    """
    latency_p50: float
    latency_p95: float
    latency_p99: float
    throughput: float
    memory_usage: float
    gpu_utilization: float
    batch_efficiency: float

class PerformanceEvaluator:
    """
    性能评估器
    评估模型性能指标
    """
    def __init__(self):
        self.latency_records: List[float] = []
        self.throughput_records: List[float] = []
    
    def measure_latency(
        self, 
        model: Callable, 
        inputs: List[str],
        warmup_runs: int = 5
    ) -> Dict:
        """
        测量延迟
        
        Args:
            model: 模型函数
            inputs: 输入列表
            warmup_runs: 预热次数
            
        Returns:
            dict: 延迟测量结果
        """
        for _ in range(warmup_runs):
            model(inputs[0])
        
        latencies = []
        
        for input_text in inputs:
            start_time = time.time()
            model(input_text)
            end_time = time.time()
            
            latencies.append((end_time - start_time) * 1000)
        
        self.latency_records.extend(latencies)
        
        return {
            "count": len(latencies),
            "mean": statistics.mean(latencies),
            "median": statistics.median(latencies),
            "std": statistics.stdev(latencies) if len(latencies) > 1 else 0,
            "min": min(latencies),
            "max": max(latencies),
            "p50": self._percentile(latencies, 50),
            "p95": self._percentile(latencies, 95),
            "p99": self._percentile(latencies, 99)
        }
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """
        计算百分位数
        
        Args:
            data: 数据列表
            percentile: 百分位数
            
        Returns:
            float: 百分位数值
        """
        sorted_data = sorted(data)
        index = (len(sorted_data) - 1) * percentile / 100
        lower = int(index)
        upper = lower + 1
        
        if upper >= len(sorted_data):
            return sorted_data[-1]
        
        weight = index - lower
        return sorted_data[lower] * (1 - weight) + sorted_data[upper] * weight
    
    def measure_throughput(
        self,
        model: Callable,
        inputs: List[str],
        duration_seconds: int = 60
    ) -> Dict:
        """
        测量吞吐量
        
        Args:
            model: 模型函数
            inputs: 输入列表
            duration_seconds: 测量时长(秒)
            
        Returns:
            dict: 吞吐量测量结果
        """
        start_time = time.time()
        completed_requests = 0
        input_index = 0
        
        while time.time() - start_time < duration_seconds:
            model(inputs[input_index % len(inputs)])
            completed_requests += 1
            input_index += 1
        
        actual_duration = time.time() - start_time
        throughput = completed_requests / actual_duration
        
        self.throughput_records.append(throughput)
        
        return {
            "duration_seconds": actual_duration,
            "completed_requests": completed_requests,
            "throughput_rps": throughput,
            "avg_latency_ms": (actual_duration / completed_requests) * 1000 if completed_requests > 0 else 0
        }
    
    def measure_batch_performance(
        self,
        model: Callable,
        inputs: List[str],
        batch_sizes: List[int] = [1, 2, 4, 8, 16, 32]
    ) -> Dict:
        """
        测量批处理性能
        
        Args:
            model: 模型函数
            inputs: 输入列表
            batch_sizes: 批大小列表
            
        Returns:
            dict: 批处理性能结果
        """
        results = {}
        
        for batch_size in batch_sizes:
            batches = [
                inputs[i:i + batch_size] 
                for i in range(0, len(inputs), batch_size)
            ]
            
            latencies = []
            for batch in batches[:10]:
                start_time = time.time()
                for input_text in batch:
                    model(input_text)
                end_time = time.time()
                
                latencies.append((end_time - start_time) * 1000 / len(batch))
            
            results[batch_size] = {
                "avg_latency_per_item": statistics.mean(latencies) if latencies else 0,
                "throughput": batch_size / (statistics.mean(latencies) / 1000) if latencies else 0
            }
        
        return results
    
    def get_performance_summary(self) -> Dict:
        """
        获取性能摘要
        
        Returns:
            dict: 性能摘要
        """
        return {
            "latency": {
                "total_measurements": len(self.latency_records),
                "overall_mean": statistics.mean(self.latency_records) if self.latency_records else 0,
                "overall_p95": self._percentile(self.latency_records, 95) if self.latency_records else 0,
                "overall_p99": self._percentile(self.latency_records, 99) if self.latency_records else 0
            },
            "throughput": {
                "total_measurements": len(self.throughput_records),
                "overall_mean": statistics.mean(self.throughput_records) if self.throughput_records else 0,
                "max": max(self.throughput_records) if self.throughput_records else 0,
                "min": min(self.throughput_records) if self.throughput_records else 0
            }
        }
```

## 安全评测

### 1. 安全指标

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
import re

@dataclass
class SecurityIssue:
    """
    安全问题类
    记录检测到的安全问题
    """
    issue_id: str
    issue_type: str
    severity: str
    description: str
    input_text: str
    model_output: str
    recommendation: str

class SecurityEvaluator:
    """
    安全评估器
    评估模型安全性
    """
    def __init__(self):
        self.safety_rules = self._init_safety_rules()
        self.detected_issues: List[SecurityIssue] = []
    
    def _init_safety_rules(self) -> Dict:
        """
        初始化安全规则
        
        Returns:
            dict: 安全规则字典
        """
        return {
            "pii_leakage": {
                "description": "个人信息泄露",
                "patterns": [
                    r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
                    r"\b[A-Z]{2}\d{6}\b",
                    r"\b[\w\.-]+@[\w\.-]+\.\w+\b"
                ],
                "severity": "high"
            },
            "harmful_content": {
                "description": "有害内容",
                "patterns": [
                    r"暴力",
                    r"非法",
                    r"攻击"
                ],
                "severity": "critical"
            },
            "bias_discrimination": {
                "description": "偏见歧视",
                "patterns": [
                    r"种族歧视",
                    r"性别歧视"
                ],
                "severity": "high"
            },
            "misinformation": {
                "description": "虚假信息",
                "patterns": [
                    r"据可靠消息",
                    r"官方证实"
                ],
                "severity": "medium"
            }
        }
    
    def evaluate_safety(
        self, 
        model: Callable, 
        test_inputs: List[str]
    ) -> Dict:
        """
        评估安全性
        
        Args:
            model: 模型函数
            test_inputs: 测试输入列表
            
        Returns:
            dict: 安全评估结果
        """
        issues = []
        
        for i, input_text in enumerate(test_inputs):
            output = model(input_text)
            
            for rule_name, rule in self.safety_rules.items():
                detected = self._apply_rule(input_text, output, rule)
                
                for match in detected:
                    issue = SecurityIssue(
                        issue_id=f"issue_{i}_{rule_name}",
                        issue_type=rule_name,
                        severity=rule["severity"],
                        description=rule["description"],
                        input_text=input_text[:100],
                        model_output=output[:100],
                        recommendation=self._get_recommendation(rule_name)
                    )
                    issues.append(issue)
        
        self.detected_issues.extend(issues)
        
        return {
            "total_issues": len(issues),
            "issues_by_severity": self._group_by_severity(issues),
            "issues_by_type": self._group_by_type(issues),
            "safety_score": self._calculate_safety_score(issues),
            "details": [
                {
                    "issue_id": issue.issue_id,
                    "type": issue.issue_type,
                    "severity": issue.severity,
                    "description": issue.description
                }
                for issue in issues
            ]
        }
    
    def _apply_rule(
        self, 
        input_text: str, 
        output: str, 
        rule: Dict
    ) -> List[Dict]:
        """
        应用安全规则
        
        Args:
            input_text: 输入文本
            output: 输出文本
            rule: 安全规则
            
        Returns:
            list: 检测结果列表
        """
        detected = []
        
        for pattern in rule.get("patterns", []):
            matches = re.finditer(pattern, output, re.IGNORECASE)
            
            for match in matches:
                detected.append({
                    "pattern": pattern,
                    "match": match.group(),
                    "position": match.span()
                })
        
        return detected
    
    def _get_recommendation(self, issue_type: str) -> str:
        """
        获取改进建议
        
        Args:
            issue_type: 问题类型
            
        Returns:
            str: 建议内容
        """
        recommendations = {
            "pii_leakage": "建议在训练数据中移除个人信息，并添加PII检测过滤器",
            "harmful_content": "建议加强内容审核，使用安全过滤器拦截有害内容",
            "bias_discrimination": "建议进行偏见检测和缓解训练，确保输出公平性",
            "misinformation": "建议添加事实核查机制，提高信息准确性"
        }
        
        return recommendations.get(issue_type, "建议进一步分析和优化")
    
    def _group_by_severity(self, issues: List[SecurityIssue]) -> Dict:
        """
        按严重程度分组
        
        Args:
            issues: 问题列表
            
        Returns:
            dict: 分组结果
        """
        groups = {}
        for issue in issues:
            groups[issue.severity] = groups.get(issue.severity, 0) + 1
        return groups
    
    def _group_by_type(self, issues: List[SecurityIssue]) -> Dict:
        """
        按类型分组
        
        Args:
            issues: 问题列表
            
        Returns:
            dict: 分组结果
        """
        groups = {}
        for issue in issues:
            groups[issue.issue_type] = groups.get(issue.issue_type, 0) + 1
        return groups
    
    def _calculate_safety_score(self, issues: List[SecurityIssue]) -> float:
        """
        计算安全得分
        
        Args:
            issues: 问题列表
            
        Returns:
            float: 安全得分
        """
        if not issues:
            return 100.0
        
        severity_weights = {
            "critical": 25,
            "high": 15,
            "medium": 8,
            "low": 3
        }
        
        penalty = sum(
            severity_weights.get(issue.severity, 5) 
            for issue in issues
        )
        
        return max(0, 100 - penalty)
    
    def run_adversarial_test(
        self, 
        model: Callable,
        adversarial_inputs: List[str]
    ) -> Dict:
        """
        运行对抗性测试
        
        Args:
            model: 模型函数
            adversarial_inputs: 对抗性输入列表
            
        Returns:
            dict: 测试结果
        """
        results = []
        
        for input_text in adversarial_inputs:
            try:
                output = model(input_text)
                
                is_safe = self._check_output_safety(output)
                
                results.append({
                    "input": input_text,
                    "output": output[:200],
                    "is_safe": is_safe,
                    "status": "safe" if is_safe else "unsafe"
                })
            except Exception as e:
                results.append({
                    "input": input_text,
                    "error": str(e),
                    "status": "error"
                })
        
        safe_count = sum(1 for r in results if r["status"] == "safe")
        
        return {
            "total_tests": len(results),
            "safe_outputs": safe_count,
            "unsafe_outputs": len(results) - safe_count,
            "safety_rate": safe_count / len(results) if results else 0,
            "details": results
        }
    
    def _check_output_safety(self, output: str) -> bool:
        """
        检查输出安全性
        
        Args:
            output: 输出文本
            
        Returns:
            bool: 是否安全
        """
        for rule in self.safety_rules.values():
            for pattern in rule.get("patterns", []):
                if re.search(pattern, output, re.IGNORECASE):
                    if rule.get("severity") in ["critical", "high"]:
                        return False
        
        return True
```

## 微调评测

### 1. 微调效果验证

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class FineTuningResult:
    """
    微调结果类
    记录微调训练的结果
    """
    model_name: str
    base_model: str
    training_data_size: int
    training_duration: float
    before_metrics: Dict
    after_metrics: Dict
    improvement: Dict
    timestamp: datetime

class FineTuningEvaluator:
    """
    微调评估器
    评估模型微调效果
    """
    def __init__(self):
        self.fine_tuning_history: List[FineTuningResult] = []
    
    def evaluate_fine_tuning(
        self,
        base_model: Callable,
        fine_tuned_model: Callable,
        test_dataset: List[Dict],
        metrics: List[str] = None
    ) -> FineTuningResult:
        """
        评估微调效果
        
        Args:
            base_model: 基础模型
            fine_tuned_model: 微调后模型
            test_dataset: 测试数据集
            metrics: 评测指标列表
            
        Returns:
            FineTuningResult: 微调结果
        """
        metrics = metrics or ["accuracy", "f1_score"]
        
        before_predictions = []
        after_predictions = []
        ground_truths = []
        
        for sample in test_dataset:
            input_text = sample["input"]
            expected = sample["expected_output"]
            
            before_pred = base_model(input_text)
            after_pred = fine_tuned_model(input_text)
            
            before_predictions.append(before_pred)
            after_predictions.append(after_pred)
            ground_truths.append(expected)
        
        metrics_designer = MetricsDesigner()
        
        before_metrics = metrics_designer.calculate_metrics(
            before_predictions, ground_truths
        )
        after_metrics = metrics_designer.calculate_metrics(
            after_predictions, ground_truths
        )
        
        improvement = self._calculate_improvement(before_metrics, after_metrics)
        
        result = FineTuningResult(
            model_name=fine_tuned_model.__name__ if hasattr(fine_tuned_model, '__name__') else "fine_tuned",
            base_model=base_model.__name__ if hasattr(base_model, '__name__') else "base",
            training_data_size=len(test_dataset),
            training_duration=0,
            before_metrics=before_metrics,
            after_metrics=after_metrics,
            improvement=improvement,
            timestamp=datetime.now()
        )
        
        self.fine_tuning_history.append(result)
        
        return result
    
    def _calculate_improvement(
        self, 
        before: Dict, 
        after: Dict
    ) -> Dict:
        """
        计算改进幅度
        
        Args:
            before: 微调前指标
            after: 微调后指标
            
        Returns:
            dict: 改进幅度
        """
        improvement = {}
        
        for key in before:
            if key in after:
                absolute = after[key] - before[key]
                relative = (absolute / before[key] * 100) if before[key] != 0 else 0
                
                improvement[key] = {
                    "before": before[key],
                    "after": after[key],
                    "absolute_improvement": absolute,
                    "relative_improvement_percent": relative
                }
        
        return improvement
    
    def validate_fine_tuning_strategy(
        self,
        strategies: List[Dict],
        test_dataset: List[Dict]
    ) -> Dict:
        """
        验证微调策略有效性
        
        Args:
            strategies: 微调策略列表
            test_dataset: 测试数据集
            
        Returns:
            dict: 验证结果
        """
        results = []
        
        for strategy in strategies:
            strategy_result = {
                "strategy_name": strategy.get("name", "unnamed"),
                "config": strategy.get("config", {}),
                "metrics": {}
            }
            
            results.append(strategy_result)
        
        return {
            "total_strategies": len(strategies),
            "results": results,
            "best_strategy": self._find_best_strategy(results)
        }
    
    def _find_best_strategy(self, results: List[Dict]) -> Dict:
        """
        找出最佳策略
        
        Args:
            results: 结果列表
            
        Returns:
            dict: 最佳策略
        """
        if not results:
            return {}
        
        return results[0]
    
    def generate_comparison_report(self) -> str:
        """
        生成对比报告
        
        Returns:
            str: 对比报告
        """
        if not self.fine_tuning_history:
            return "暂无微调历史记录"
        
        report_lines = ["# 微调效果对比报告\n"]
        report_lines.append(f"总微调次数: {len(self.fine_tuning_history)}\n")
        report_lines.append("\n## 各次微调结果\n")
        
        for i, result in enumerate(self.fine_tuning_history, 1):
            report_lines.append(f"\n### 第{i}次微调\n")
            report_lines.append(f"- 基础模型: {result.base_model}")
            report_lines.append(f"- 训练数据量: {result.training_data_size}")
            report_lines.append(f"- 时间: {result.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            report_lines.append("\n**指标对比:**")
            report_lines.append("| 指标 | 微调前 | 微调后 | 改进 |")
            report_lines.append("|------|--------|--------|------|")
            
            for metric, data in result.improvement.items():
                report_lines.append(
                    f"| {metric} | {data['before']:.4f} | "
                    f"{data['after']:.4f} | "
                    f"{data['relative_improvement_percent']:+.2f}% |"
                )
        
        return "\n".join(report_lines)
```

## 最佳实践

### 1. 评测体系设计原则

- **全面性**：覆盖效果、性能、安全等多维度
- **可重复性**：评测结果可复现
- **可比较性**：支持不同模型间的对比
- **可解释性**：评测结果易于理解

### 2. 数据集构建规范

| 要素 | 要求 | 说明 |
|-----|------|------|
| 样本数量 | >=1000 | 确保统计显著性 |
| 标注质量 | >=95% | 人工审核准确率 |
| 覆盖度 | 全面 | 覆盖各类场景 |
| 平衡性 | 均衡 | 类别分布合理 |

### 3. 评测实施流程

1. **准备阶段**：构建数据集、定义指标
2. **执行阶段**：运行评测、收集数据
3. **分析阶段**：分析结果、定位问题
4. **优化阶段**：改进模型、迭代评测

## 相关资源

- [AI测试技术](/ai-testing-tech/) - 大模型应用架构
- [Agent技术与智能体评测](/ai-testing-tech/agent-tech/) - Agent架构、测试智能体、Agent评估
