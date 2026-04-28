# LLM评估框架

> LLM评估是衡量大语言模型能力、质量和可靠性的核心环节。科学的评估体系对模型选择、优化和部署至关重要。

---

## 1. 评估维度体系

### 1.1 核心评估维度

```
LLM评估体系
┌──────────────────────────────────────────────────────┐
│                    核心能力层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 语言理解 │ │ 语言生成 │ │ 推理能力 │ │ 知识掌握 │   │
│  │         │ │         │ │         │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├──────────────────────────────────────────────────────┤
│                    安全合规层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 安全性   │ │ 偏见     │ │ 隐私     │ │ 合规性   │   │
│  │         │ │         │ │         │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├──────────────────────────────────────────────────────┤
│                    工程性能层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 响应速度 │ │ 资源消耗 │ │ 稳定性   │ │ 可扩展性 │   │
│  │         │ │         │ │         │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└──────────────────────────────────────────────────────┘
```

### 1.2 评估指标总览

| 维度 | 子维度 | 评估方法 | 代表基准 |
|------|--------|---------|---------|
| **语言理解** | 分类、NLI、情感分析 | 自动化测试 | GLUE、SuperGLUE |
| **语言生成** | 流畅度、连贯性、多样性 | 人工+自动 | C-Eval、CMMLU |
| **推理能力** | 逻辑、数学、代码 | 自动化测试 | GSM8K、HumanEval |
| **知识掌握** | 事实性、时效性 | 自动化+人工 | MMLU、TriviaQA |
| **安全性** | 毒性、提示注入、越狱 | 自动化测试 | REAL-ToxicityPrompts |
| **偏见** | 性别、种族、宗教 | 自动化测试 | CrowS-Pairs |
| **效率** | 延迟、吞吐、资源 | 性能测试 | 自建测试 |

---

## 2. 语言能力评估

### 2.1 理解能力评估

```python
class LanguageUnderstandingEvaluator:
    """语言理解评估器"""
    
    def __init__(self, model):
        self.model = model
    
    def evaluate_nli(self, test_data: List[Dict]) -> Dict:
        """
        自然语言推理（NLI）评估
        
        任务：给定前提和假设，判断蕴含/矛盾/中立
        """
        results = []
        for item in test_data:
            prompt = f"""
            前提：{item['premise']}
            假设：{item['hypothesis']}
            
            请判断前提和假设之间的关系：
            A. 蕴含（前提为真则假设必为真）
            B. 矛盾（前提为真则假设必为假）
            C. 中立（无法从前提推断假设）
            
            请直接回答A、B或C。
            """
            response = self.model.generate(prompt).strip()
            
            predicted = response.strip().upper()
            correct = item['label']
            
            results.append({
                'premise': item['premise'],
                'hypothesis': item['hypothesis'],
                'predicted': predicted,
                'correct': correct,
                'is_correct': predicted == correct,
            })
        
        accuracy = sum(1 for r in results if r['is_correct']) / len(results)
        
        return {
            'task': 'nli',
            'accuracy': accuracy,
            'total_samples': len(results),
            'per_class_accuracy': self._compute_per_class_accuracy(results),
            'error_analysis': self._analyze_errors(results),
        }
    
    def evaluate_sentiment(self, test_data: List[Dict]) -> Dict:
        """情感分析评估"""
        # 类似实现...
        pass
```

### 2.2 生成能力评估

```python
class LanguageGenerationEvaluator:
    """语言生成评估器"""
    
    def evaluate(self, test_data: List[Dict]) -> Dict:
        """
        多维度生成质量评估
        
        维度:
        1. 流利度 (Fluency)
        2. 连贯性 (Coherence)
        3. 相关性 (Relevance)
        4. 多样性 (Diversity)
        5. 事实性 (Factuality)
        """
        metrics = {}
        
        # 1. 自动评估指标
        metrics['bleu'] = self._compute_bleu(test_data)
        metrics['rouge'] = self._compute_rouge(test_data)
        metrics['bertscore'] = self._compute_bertscore(test_data)
        
        # 2. 人类评估指标（模拟）
        metrics['human_like'] = self._evaluate_humanlikeness(test_data)
        metrics['readability'] = self._evaluate_readability(test_data)
        
        return metrics
    
    def _compute_bertscore(self, test_data: List[Dict]) -> float:
        """使用BERTScore评估生成质量"""
        import bert_score
        
        references = [item['reference'] for item in test_data]
        hypotheses = [item['generated'] for item in test_data]
        
        P, R, F1 = bert_score.score(hypotheses, references, lang='zh')
        return F1.mean().item()
```

---

## 3. 推理能力评估

### 3.1 逻辑推理

```python
class ReasoningEvaluator:
    """推理能力评估器"""
    
    def evaluate_deductive(self, test_data: List[Dict]) -> Dict:
        """演绎推理评估"""
        results = []
        
        for item in test_data:
            prompt = f"""
            前提：
            {chr(10).join(item['premises'])}
            
            问题：{item['question']}
            
            请给出推理过程和答案。
            """
            response = self.model.generate(prompt)
            
            # 提取答案并判断
            predicted_answer = self._extract_answer(response)
            is_correct = predicted_answer == item['answer']
            
            results.append({
                'premises': item['premises'],
                'question': item['question'],
                'expected': item['answer'],
                'predicted': predicted_answer,
                'is_correct': is_correct,
                'reasoning_steps': self._extract_reasoning_steps(response),
            })
        
        return self._compute_metrics(results, 'deductive')
    
    def evaluate_math(self, test_data: List[Dict]) -> Dict:
        """数学推理评估（如GSM8K）"""
        results = []
        
        for item in test_data:
            # 使用CoT提示
            prompt = f"""
            问题：{item['question']}
            
            请一步一步思考，给出推理过程和最终答案。
            
            答案格式：\\boxed{{答案}}
            """
            response = self.model.generate(prompt, max_tokens=512)
            
            # 提取最终答案
            predicted = self._extract_final_answer(response)
            is_correct = predicted == item['answer']
            
            results.append({
                'question': item['question'],
                'expected': item['answer'],
                'predicted': predicted,
                'is_correct': is_correct,
                'uses_cot': True,
            })
        
        accuracy = sum(1 for r in results if r['is_correct']) / len(results)
        
        return {
            'task': 'math',
            'exact_match_accuracy': accuracy,
            'total_samples': len(results),
            'per_difficulty': self._aggregate_by_difficulty(results),
        }
```

### 3.2 代码能力评估

```python
class CodeEvaluationEvaluator:
    """代码能力评估（HumanEval/MBPP）"""
    
    def evaluate(self, test_data: List[Dict]) -> Dict:
        """
        代码生成评估
        
        评估方式:
        1. 生成代码
        2. 在测试用例中执行
        3. 统计通过率
        """
        results = []
        
        for item in test_data:
            prompt = f"""
            请实现以下函数：
            
            {item['prompt']}
            
            只输出代码，不要解释。
            """
            code = self.model.generate(prompt)
            
            # 执行测试
            pass_rate = self._execute_tests(code, item['tests'])
            
            results.append({
                'task_id': item['task_id'],
                'code': code,
                'tests_passed': pass_rate,
                'total_tests': len(item['tests']),
            })
        
        return {
            'pass_rate_1': sum(
                1 for r in results if r['tests_passed'] == 1
            ) / len(results),
            'pass_rate_any': sum(
                1 for r in results if r['tests_passed'] > 0
            ) / len(results),
            'average_pass_rate': np.mean(
                [r['tests_passed'] for r in results]
            ),
        }
```

---

## 4. 知识能力评估

### 4.1 知识基准测试

```python
class KnowledgeEvaluator:
    """知识能力评估"""
    
    def evaluate_mmlu(self, test_data: List[Dict]) -> Dict:
        """
        MMLU（Massive Multi-task Language Understanding）评估
        
        涵盖57个学科领域：
        - 人文、社会科学、STEM、其他
        """
        results = {}
        
        # 按领域分组
        by_subject = {}
        for item in test_data:
            subject = item['subject']
            if subject not in by_subject:
                by_subject[subject] = []
            by_subject[subject].append(item)
        
        # 评估每个领域
        for subject, items in by_subject.items():
            correct = 0
            for item in items:
                prediction = self._predict(item['question'], item['options'])
                if prediction == item['answer']:
                    correct += 1
            
            accuracy = correct / len(items)
            results[subject] = {
                'accuracy': accuracy,
                'total': len(items),
            }
        
        # 总体统计
        overall_accuracy = sum(
            r['accuracy'] * r['total'] for r in results.values()
        ) / sum(r['total'] for r in results.values())
        
        # 按大类分组
        categories = {
            'STEM': ['abstract_algebra', 'astronomy', 'biology', ...],
            'Humanities': ['philosophy', 'history', 'art', ...],
            'Social Science': ['economics', 'psychology', ...],
            'Other': ['law', 'medicine', ...],
        }
        
        category_results = {}
        for cat, subjects in categories.items():
            cat_data = {s: results[s] for s in subjects if s in results}
            category_results[cat] = self._aggregate(category_data)
        
        return {
            'overall': overall_accuracy,
            'by_subject': results,
            'by_category': category_results,
        }
```

### 4.2 时效性评估

```python
class TemporalKnowledgeEvaluator:
    """时效性知识评估"""
    
    def evaluate_temporal_freshness(self, test_data: List[Dict]) -> Dict:
        """
        评估模型知识的时效性
        
        测试类型:
        1. 预训练截止日前的事件（应知道）
        2. 预训练截止日后的事件（可能不知道）
        3. 需要检索增强的事件
        """
        results = {
            'pre_cutoff': [],   # 截止日前
            'post_cutoff': [],  # 截止日后
            'requires_rag': [], # 需要检索
        }
        
        for item in test_data:
            event_date = item['event_date']
            cutoff_date = item['cutoff_date']
            
            if event_date <= cutoff_date:
                results['pre_cutoff'].append(self._evaluate_item(item))
            else:
                results['post_cutoff'].append(self._evaluate_item(item))
        
        return {
            'pre_cutoff_accuracy': self._compute_accuracy(
                results['pre_cutoff']
            ),
            'post_cutoff_accuracy': self._compute_accuracy(
                results['post_cutoff']
            ),
            'freshness_gap': (
                self._compute_accuracy(results['pre_cutoff']) -
                self._compute_accuracy(results['post_cutoff'])
            ),
        }
```

---

## 5. 安全与偏见评估

### 5.1 安全性测试

```python
class SafetyEvaluator:
    """安全性评估"""
    
    def evaluate_toxicity(self, test_prompts: List[str]) -> Dict:
        """毒性内容评估"""
        results = []
        
        for prompt in test_prompts:
            response = self.model.generate(prompt)
            toxicity_score = self._measure_toxicity(response)
            
            results.append({
                'prompt': prompt,
                'response': response,
                'toxicity_score': toxicity_score,
                'is_toxic': toxicity_score > 0.5,
            })
        
        return {
            'average_toxicity': np.mean([r['toxicity_score'] for r in results]),
            'toxic_rate': sum(
                1 for r in results if r['is_toxic']
            ) / len(results),
            'severity_distribution': self._classify_severity(results),
        }
    
    def evaluate_prompt_injection(self, test_cases: List[Dict]) -> Dict:
        """提示注入攻击评估"""
        results = []
        
        for case in test_cases:
            # 构建注入测试
            response = self.model.generate(case['injection_prompt'])
            
            # 判断是否被注入
            is_broken = self._check_vulnerability(response, case['expected_behavior'])
            
            results.append({
                'attack_type': case['attack_type'],
                'is_vulnerable': is_broken,
                'response': response,
            })
        
        return {
            'vulnerability_rate': sum(
                1 for r in results if r['is_vulnerable']
            ) / len(results),
            'by_attack_type': self._group_by_type(results),
        }
```

### 5.2 偏见评估

```python
class BiasEvaluator:
    """偏见评估"""
    
    def evaluate_gender_bias(self, test_cases: List[Dict]) -> Dict:
        """性别偏见评估"""
        bias_scores = []
        
        for case in test_cases:
            response_pos = self.model.generate(case['prompt_a'])
            response_neg = self.model.generate(case['prompt_b'])
            
            # 计算两个响应的差异
            bias_score = self._compute_bias_difference(
                response_pos, response_neg
            )
            bias_scores.append(bias_score)
        
        return {
            'average_bias_score': np.mean(bias_scores),
            'biased_samples': sum(
                1 for s in bias_scores if s > 0.15
            ) / len(bias_scores),
            'severity': self._classify_bias_level(np.mean(bias_scores)),
        }
```

---

## 6. 工程性能评估

### 6.1 性能基准测试

```python
class PerformanceEvaluator:
    """工程性能评估"""
    
    def benchmark(self, model_config: Dict) -> Dict:
        """全面性能基准测试"""
        return {
            'latency': self._measure_latency(model_config),
            'throughput': self._measure_throughput(model_config),
            'resource_usage': self._measure_resources(model_config),
            'scaling': self._measure_scaling(model_config),
        }
    
    def _measure_latency(self, config: Dict) -> Dict:
        """测量响应延迟"""
        latencies = []
        
        for prompt_length in [100, 500, 1000, 2000]:
            prompt = 'a' * prompt_length
            prompt_tokens = len(prompt.split())
            
            times = []
            for _ in range(10):
                start = time.time()
                response = self.model.generate(prompt, max_tokens=100)
                elapsed = time.time() - start
                times.append(elapsed)
            
            latencies.append({
                'input_tokens': prompt_tokens,
                'avg_latency_ms': np.mean(times) * 1000,
                'p50_latency_ms': np.percentile(times, 50) * 1000,
                'p95_latency_ms': np.percentile(times, 95) * 1000,
                'p99_latency_ms': np.percentile(times, 99) * 1000,
            })
        
        return latencies
    
    def _measure_throughput(self, config: Dict) -> Dict:
        """测量吞吐量"""
        throughput = []
        
        for batch_size in [1, 4, 8, 16, 32]:
            prompt = 'a * 500'
            
            start = time.time()
            responses = [
                self.model.generate(prompt, max_tokens=100)
                for _ in range(batch_size)
            ]
            elapsed = time.time() - start
            
            throughput.append({
                'batch_size': batch_size,
                'total_tokens_per_sec': (
                    batch_size * 100 / elapsed
                ),
                'tokens_per_sec_per_request': (
                    100 / (elapsed / batch_size)
                ),
            })
        
        return throughput
```

---

## 7. 综合评估工具

### 7.1 主流评估基准

| 基准 | 评估内容 | 覆盖范围 | 语言 |
|------|---------|---------|------|
| **MMLU** | 多学科知识 | 57学科 | 英文 |
| **CMMLU** | 中文多学科知识 | 52学科 | 中文 |
| **C-Eval** | 中国能力评估 | 52学科 | 中文 |
| **GSM8K** | 小学数学 | 8K题 | 英文 |
| **HumanEval** | Python代码生成 | 164题 | Python |
| **HELM** | 多维度评估框架 | 通用 | 多语言 |
| **OpenAI Evals** | OpenAI评估工具 | 通用 | 多语言 |

### 7.2 评估报告模板

```markdown
# LLM评估报告

## 概览
- 评估时间：2025-01-15
- 模型版本：v1.0
- 总样本数：10,000

## 核心指标
| 维度 | 得分 | 排名 |
|------|------|------|
| 语言理解 | 92.5 | #1 |
| 语言生成 | 88.3 | #2 |
| 推理能力 | 85.7 | #3 |
| 知识掌握 | 90.1 | #1 |
| 安全性 | 95.2 | #1 |
| 综合得分 | 89.4 | #2 |

## 详细分析
### 优势领域
- 中文语言理解（92.5分）
- 知识覆盖度（90.1分）

### 待改进领域
- 数学推理（78.2分）
- 代码生成（81.5分）
```

---

## 8. 评估最佳实践

1. **多维度评估**：不要仅依赖单一指标
2. **定期更新测试集**：防止过拟合测试数据
3. **人工复核**：自动评估结果需要人工抽样验证
4. **基准一致性**：使用标准基准进行横向对比
5. **环境标准化**：确保评估环境一致

---

*最后更新：2025-01-15 | 维护团队：模型评估组*
