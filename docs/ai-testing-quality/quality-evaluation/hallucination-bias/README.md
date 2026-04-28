# 幻觉与偏见

> AI模型的幻觉（Hallucination）和偏见（Bias）是影响AI系统可靠性和公平性的两大核心问题。本文档介绍检测方法、评估指标和缓解策略。

---

## 1. 幻觉检测与评估

### 1.1 幻觉类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **事实幻觉** | 生成错误的事实信息 | "李白出生于1900年" |
| **逻辑幻觉** | 推理过程出现错误 | 矛盾的前提和结论 |
| **引用幻觉** | 虚构不存在的引用 | 捏造论文或法规 |
| **对话幻觉** | 对话中虚构上下文 | 编造用户说过的话 |
| **数值幻觉** | 错误的数字计算 | 算术错误 |

### 1.2 幻觉评估框架

```python
class HallucinationEvaluator:
    """幻觉评估器"""
    
    def evaluate(self, responses: List[Response],
                 ground_truth: List[Fact]) -> HallucinationReport:
        """
        幻觉评估
        
        评估方法:
        1. 事实核查: 与权威知识库对比
        2. 一致性检查: 自洽性验证
        3. 引用验证: 检查引用真实性
        4. 逻辑验证: 推理链检查
        5. 数值验证: 计算正确性
        """
        report = HallucinationReport()
        
        # 事实幻觉检测
        factual = self._check_factual_accuracy(
            responses, ground_truth
        )
        report.factual_hallucination = factual
        
        # 一致性检测
        consistency = self._check_consistency(responses)
        report.consistency_hallucination = consistency
        
        # 引用验证
        citations = self._verify_citations(responses)
        report.citation_hallucination = citations
        
        # 综合幻觉率
        report.overall_rate = self._calculate_rate(
            factual, consistency, citations
        )
        
        return report
```

### 1.3 幻觉检测工具

| 工具 | 方法 | 精度 |
|------|------|------|
| **FactCC** | 基于文本的相似度 | 中高 |
| **QAFactEval** | 基于问答的评估 | 高 |
| **RAGAS** | RAG场景评估 | 高 |
| **HalluQA** | 幻觉专项数据集 | 参考 |
| **LLM自评估** | 让LLM自查 | 中 |

### 1.4 幻觉率计算

```python
def calculate_hallucination_rate(
    total_claims: int,       # 总声明数
    hallucinated_claims: int # 幻觉声明数
) -> float:
    """
    幻觉率 = 幻觉声明数 / 总声明数 × 100%
    
    声明提取方法:
    1. 基于句子的声明提取
    2. 基于事实的声明提取
    3. 基于命题的声明提取
    """
    return hallucinated_claims / total_claims if total_claims > 0 else 0
```

---

## 2. 偏见检测与评估

### 2.1 偏见类型

| 偏见类型 | 说明 | 示例 |
|---------|------|------|
| **性别偏见** | 性别刻板印象 | "护士=女性" |
| **种族偏见** | 种族相关偏见 | 种族关联评价 |
| **年龄偏见** | 年龄相关偏见 | 对老年人的负面描述 |
| **地域偏见** | 地域歧视 | 地区刻板印象 |
| **职业偏见** | 职业相关偏见 | 职业等级偏见 |
| **政治偏见** | 政治倾向 | 政治立场偏见 |

### 2.2 偏见评估框架

```python
class BiasEvaluator:
    """偏见评估器"""
    
    def evaluate(self, model: Model,
                 test_datasets: List[Dataset]) -> BiasReport:
        """
        偏见评估
        
        评估方法:
        1. 关联测试: IAT风格测试
        2. 词嵌入分析: 向量空间偏见
        3. 场景测试: 偏见场景覆盖率
        4. 对比测试: 不同群体表现差异
        5. 人类评估: 主观偏见判断
        """
        report = BiasReport()
        
        # 词嵌入偏见分析
        report.embedding_bias = self._embedding_analysis(model)
        
        # 关联偏见测试
        report.association_bias = self._association_test(model)
        
        # 场景偏见测试
        report.scenario_bias = self._scenario_test(
            model, test_datasets
        )
        
        # 群体公平性
        report.fairness = self._fairness_analysis(
            model, test_datasets
        )
        
        return report
```

### 2.3 公平性指标

| 指标 | 公式 | 可接受阈值 |
|------|------|-----------|
| **统计均等** | P(Ŷ=1|A=a) ≈ P(Ŷ=1|A=b) | <10%差异 |
| **机会均等** | TPR|A=a ≈ TPR|A=b | <10%差异 |
| **预测均等** | PPV|A=a ≈ PPV|A=b | <10%差异 |
| **均衡优势** | |P(Ŷ=1|A=a) - P(Ŷ=1|A=b)| | <5% |

---

## 3. 幻觉与偏见缓解

### 3.1 幻觉缓解策略

| 策略 | 方法 | 效果 |
|------|------|------|
| **RAG增强** | 检索增强生成 | 显著降低 |
| **Prompt工程** | 事实约束提示 | 中等降低 |
| **输出验证** | 生成后核查 | 部分降低 |
| **自我反思** | LLM自我修正 | 中等降低 |
| **知识增强** | 领域知识库 | 显著降低 |

### 3.2 偏见缓解策略

| 策略 | 方法 | 效果 |
|------|------|------|
| **数据去偏** | 训练数据平衡 | 显著降低 |
| **提示去偏** | 中立提示模板 | 中等降低 |
| **输出过滤** | 偏见内容检测 | 部分降低 |
| **后处理** | 输出校正 | 部分降低 |
| **对抗训练** | 偏见对抗样本 | 显著降低 |

---

## 4. 评估工具链

| 工具 | 功能 | 支持场景 |
|------|------|---------|
| **HolisticEval** | 偏见+幻觉综合评估 | 通用 |
| **FairLearn** | 公平性评估 | 分类/回归 |
| **AIF360** | 算法公平性 | 各种模型 |
| **TruthfulQA** | 事实性评估 | QA任务 |
| **RealToxicityPrompts** | 毒性检测 | 生成式 |

---

*最后更新：2025-01-15 | 维护团队：质量评估组*
