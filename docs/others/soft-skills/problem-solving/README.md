# 问题攻坚能力

复杂问题的分析与解决方法论。

## 复杂场景根因定位思维框架

系统化的问题分析方法。

- 5 Whys分析法
- 鱼骨图分析
- 假设驱动验证
- 二分法排查

### 根因分析框架

```python
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

class EvidenceType(Enum):
    """证据类型"""
    LOG = "log"
    METRIC = "metric"
    CODE = "code"
    CONFIG = "config"
    OBSERVATION = "observation"

@dataclass
class Evidence:
    """证据"""
    type: EvidenceType
    source: str
    content: str
    timestamp: str
    confidence: float = 1.0

@dataclass
class Hypothesis:
    """假设"""
    id: str
    description: str
    probability: float
    evidence_for: List[Evidence] = field(default_factory=list)
    evidence_against: List[Evidence] = field(default_factory=list)
    tests: List[Dict] = field(default_factory=list)

class RootCauseAnalyzer:
    """
    根因分析器
    系统化定位问题根因
    """
    def __init__(self, problem_description: str):
        """
        初始化分析器
        
        Args:
            problem_description: 问题描述
        """
        self.problem = problem_description
        self.hypotheses: List[Hypothesis] = []
        self.evidence_collected: List[Evidence] = []
        self.analysis_tree: Dict = {}
    
    def add_hypothesis(self, hypothesis: Hypothesis):
        """
        添加假设
        
        Args:
            hypothesis: 假设
        """
        self.hypotheses.append(hypothesis)
    
    def collect_evidence(self, evidence: Evidence):
        """
        收集证据
        
        Args:
            evidence: 证据
        """
        self.evidence_collected.append(evidence)
        
        # 自动关联到假设
        for hypothesis in self.hypotheses:
            if self._is_relevant(evidence, hypothesis):
                hypothesis.evidence_for.append(evidence)
    
    def _is_relevant(self, evidence: Evidence,
                    hypothesis: Hypothesis) -> bool:
        """
        判断证据是否与假设相关
        
        Args:
            evidence: 证据
            hypothesis: 假设
            
        Returns:
            bool: 是否相关
        """
        # 简化实现：基于关键词匹配
        keywords = hypothesis.description.lower().split()
        return any(kw in evidence.content.lower() for kw in keywords)
    
    def evaluate_hypotheses(self) -> List[Hypothesis]:
        """
        评估假设
        
        Returns:
            list: 按概率排序的假设
        """
        for hypothesis in self.hypotheses:
            # 计算支持度
            support = len(hypothesis.evidence_for)
            against = len(hypothesis.evidence_against)
            
            if support + against > 0:
                hypothesis.probability = support / (support + against)
        
        return sorted(self.hypotheses, key=lambda h: h.probability, reverse=True)
    
    def five_whys_analysis(self, problem: str,
                          answers: List[str]) -> Dict:
        """
        5 Whys分析
        
        Args:
            problem: 问题
            answers: 逐层答案
            
        Returns:
            dict: 分析结果
        """
        chain = [{"why": "问题", "answer": problem}]
        
        for i, answer in enumerate(answers[:5], 1):
            chain.append({
                "why": f"为什么？（第{i}层）",
                "answer": answer
            })
        
        return {
            "chain": chain,
            "root_cause": answers[-1] if answers else "未确定",
            "depth": len(answers)
        }
    
    def fishbone_analysis(self, categories: List[str],
                         causes: Dict[str, List[str]]) -> Dict:
        """
        鱼骨图分析
        
        Args:
            categories: 类别列表
            causes: 各类别的原因
            
        Returns:
            dict: 分析结果
        """
        return {
            "problem": self.problem,
            "categories": [
                {
                    "name": cat,
                    "causes": causes.get(cat, [])
                }
                for cat in categories
            ]
        }
    
    def generate_report(self) -> Dict:
        """
        生成分析报告
        
        Returns:
            dict: 分析报告
        """
        ranked_hypotheses = self.evaluate_hypotheses()
        
        return {
            "problem": self.problem,
            "hypotheses_count": len(self.hypotheses),
            "evidence_count": len(self.evidence_collected),
            "top_hypotheses": [
                {
                    "id": h.id,
                    "description": h.description,
                    "probability": h.probability,
                    "supporting_evidence": len(h.evidence_for)
                }
                for h in ranked_hypotheses[:3]
            ],
            "recommended_next_steps": [
                f"验证假设: {ranked_hypotheses[0].description}" if ranked_hypotheses else "收集更多证据"
            ]
        }
```

## 第一性原理拆解疑难问题

从根本上思考问题。

- 解构问题
- 识别本质
- 重构方案
- 验证假设

### 第一性原理分析

```python
class FirstPrinciplesAnalyzer:
    """
    第一性原理分析器
    从根本上拆解问题
    """
    def __init__(self):
        self.assumptions: List[str] = []
        self.fundamental_truths: List[str] = []
        self.solutions: List[Dict] = []
    
    def deconstruct_problem(self, problem: str) -> List[str]:
        """
        解构问题
        
        Args:
            problem: 问题描述
            
        Returns:
            list: 组成部分
        """
        # 将问题分解为基本要素
        components = []
        
        # 识别隐含假设
        assumptions = self._identify_assumptions(problem)
        self.assumptions.extend(assumptions)
        
        # 提取基本事实
        truths = self._extract_fundamental_truths(problem)
        self.fundamental_truths.extend(truths)
        
        return components
    
    def _identify_assumptions(self, problem: str) -> List[str]:
        """
        识别隐含假设
        
        Args:
            problem: 问题
            
        Returns:
            list: 假设列表
        """
        # 常见假设模式
        common_assumptions = [
            "必须这样做",
            "这是唯一的方法",
            "资源是有限的",
            "时间不够"
        ]
        
        found = []
        for assumption in common_assumptions:
            if assumption.lower() in problem.lower():
                found.append(assumption)
        
        return found
    
    def _extract_fundamental_truths(self, problem: str) -> List[str]:
        """
        提取基本事实
        
        Args:
            problem: 问题
            
        Returns:
            list: 基本事实
        """
        # 不可再分的事实
        return [
            "系统需要输入才能产生输出",
            "计算需要时间",
            "资源使用有成本"
        ]
    
    def reconstruct_solution(self, constraints: List[str]) -> List[Dict]:
        """
        重构解决方案
        
        Args:
            constraints: 约束条件
            
        Returns:
            list: 解决方案
        """
        solutions = []
        
        # 基于基本事实构建方案
        for truth in self.fundamental_truths:
            solution = {
                "based_on": truth,
                "approach": f"基于'{truth}'的解决方案",
                "breakthrough": self._is_breakthrough(truth)
            }
            solutions.append(solution)
        
        return solutions
    
    def _is_breakthrough(self, truth: str) -> bool:
        """
        判断是否突破性方案
        
        Args:
            truth: 基本事实
            
        Returns:
            bool: 是否突破性
        """
        # 如果方案挑战了原有假设，则为突破性
        return any(assumption in truth for assumption in self.assumptions)
```

## 数据驱动的决策与向上汇报

基于数据的决策方法。

- 数据收集
- 分析框架
- 决策模型
- 汇报技巧

### 数据驱动决策

```python
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class DecisionOption:
    """决策选项"""
    name: str
    description: str
    pros: List[str]
    cons: List[str]
    estimated_impact: float
    estimated_cost: float
    risks: List[str]
    timeline: str

class DataDrivenDecision:
    """
    数据驱动决策
    基于数据做出最优决策
    """
    def __init__(self, decision_context: str):
        """
        初始化决策
        
        Args:
            decision_context: 决策背景
        """
        self.context = decision_context
        self.options: List[DecisionOption] = []
        self.data: Dict = {}
    
    def add_option(self, option: DecisionOption):
        """
        添加选项
        
        Args:
            option: 决策选项
        """
        self.options.append(option)
    
    def collect_data(self, metric_name: str, data: Any):
        """
        收集数据
        
        Args:
            metric_name: 指标名称
            data: 数据
        """
        self.data[metric_name] = data
    
    def score_options(self) -> List[Dict]:
        """
        评分选项
        
        Returns:
            list: 评分结果
        """
        scored = []
        
        for option in self.options:
            # 综合评分
            impact_score = option.estimated_impact * 0.4
            cost_score = (1 / (option.estimated_cost + 1)) * 0.3
            risk_score = (1 / (len(option.risks) + 1)) * 0.3
            
            total_score = impact_score + cost_score + risk_score
            
            scored.append({
                "option": option,
                "score": total_score,
                "breakdown": {
                    "impact": impact_score,
                    "cost_efficiency": cost_score,
                    "risk_score": risk_score
                }
            })
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored
    
    def generate_decision_report(self) -> str:
        """
        生成决策报告
        
        Returns:
            str: 报告
        """
        scored = self.score_options()
        
        report = f"""# 决策分析报告

## 决策背景
{self.context}

## 数据分析
"""
        
        for metric, value in self.data.items():
            report += f"- **{metric}**: {value}\n"
        
        report += "\n## 选项评估\n\n"
        
        for i, item in enumerate(scored, 1):
            option = item["option"]
            report += f"### {i}. {option.name} (评分: {item['score']:.2f})\n\n"
            report += f"**描述**: {option.description}\n\n"
            report += f"**优势**: {', '.join(option.pros)}\n\n"
            report += f"**劣势**: {', '.join(option.cons)}\n\n"
            report += f"**风险**: {', '.join(option.risks)}\n\n"
            report += f"**时间线**: {option.timeline}\n\n"
        
        if scored:
            report += f"\n## 推荐方案\n\n"
            report += f"**首选**: {scored[0]['option'].name}\n\n"
            report += f"理由：综合评分最高，影响/成本比最优。\n"
        
        return report

class ExecutiveReport:
    """
    高管汇报
    向上汇报的技巧
    """
    def __init__(self):
        self.sections = []
    
    def add_executive_summary(self, key_points: List[str],
                             recommendation: str):
        """
        添加执行摘要
        
        Args:
            key_points: 关键点
            recommendation: 建议
        """
        self.sections.append({
            "type": "executive_summary",
            "title": "执行摘要",
            "content": {
                "key_points": key_points,
                "recommendation": recommendation
            }
        })
    
    def add_data_section(self, title: str, charts: List[Dict],
                        insights: List[str]):
        """
        添加数据部分
        
        Args:
            title: 标题
            charts: 图表数据
            insights: 洞察
        """
        self.sections.append({
            "type": "data",
            "title": title,
            "content": {
                "charts": charts,
                "insights": insights
            }
        })
    
    def generate_presentation(self) -> str:
        """
        生成汇报材料
        
        Returns:
            str: 汇报内容
        """
        content = "# 汇报材料\n\n"
        
        for section in self.sections:
            content += f"## {section['title']}\n\n"
            
            if section["type"] == "executive_summary":
                content += "### 关键发现\n\n"
                for point in section["content"]["key_points"]:
                    content += f"- {point}\n"
                
                content += f"\n### 建议行动\n\n"
                content += f"{section['content']['recommendation']}\n"
            
            elif section["type"] == "data":
                content += "### 数据洞察\n\n"
                for insight in section["content"]["insights"]:
                    content += f"- {insight}\n"
        
        return content
```

## 问题解决检查清单

- [ ] 问题定义是否清晰？
- [ ] 是否收集了足够的数据？
- [ ] 假设是否经过验证？
- [ ] 是否考虑了所有相关方？
- [ ] 方案是否可执行？
- [ ] 风险是否已评估？
- [ ] 决策是否可追溯？

## 最佳实践

1. **结构化思考**：使用框架避免遗漏
2. **数据说话**：用数据支撑观点
3. **快速验证**：小步快跑验证假设
4. **复盘总结**：每次问题解决后复盘
5. **知识沉淀**：将经验转化为知识库
