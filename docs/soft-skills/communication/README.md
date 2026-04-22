# 文档与沟通

高效协作的文档与沟通技巧。

## 系统架构设计文档撰写

技术文档写作方法。

- 架构文档模板
- 技术方案文档
- API文档规范
- 决策记录（ADR）

### 架构文档生成器

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ArchitectureComponent:
    """架构组件"""
    name: str
    type: str
    description: str
    responsibilities: List[str]
    dependencies: List[str]
    technologies: List[str]
    interfaces: List[Dict]

@dataclass
class ArchitectureDecision:
    """架构决策"""
    id: str
    title: str
    context: str
    decision: str
    consequences: List[str]
    alternatives: List[str]
    status: str
    date: str

class ArchitectureDocument:
    """
    架构文档生成器
    生成标准化的架构文档
    """
    def __init__(self, system_name: str, version: str):
        """
        初始化文档
        
        Args:
            system_name: 系统名称
            version: 版本
        """
        self.system_name = system_name
        self.version = version
        self.components: List[ArchitectureComponent] = []
        self.decisions: List[ArchitectureDecision] = []
        self.diagrams: List[Dict] = []
    
    def add_component(self, component: ArchitectureComponent):
        """
        添加组件
        
        Args:
            component: 组件
        """
        self.components.append(component)
    
    def add_decision(self, decision: ArchitectureDecision):
        """
        添加决策
        
        Args:
            decision: 决策
        """
        self.decisions.append(decision)
    
    def generate_adr(self, decision: ArchitectureDecision) -> str:
        """
        生成ADR文档
        
        Args:
            decision: 决策
            
        Returns:
            str: ADR Markdown
        """
        return f"""# ADR {decision.id}: {decision.title}

## 状态
{decision.status}

## 背景
{decision.context}

## 决策
{decision.decision}

## 后果
{chr(10).join(f"- {c}" for c in decision.consequences)}

## 备选方案
{chr(10).join(f"- {a}" for a in decision.alternatives)}

## 日期
{decision.date}
"""
    
    def generate_full_document(self) -> str:
        """
        生成完整架构文档
        
        Returns:
            str: 文档内容
        """
        doc = f"""# {self.system_name} 架构设计文档

**版本**: {self.version}  
**日期**: {datetime.now().strftime('%Y-%m-%d')}  

## 目录

1. [概述](#概述)
2. [架构目标](#架构目标)
3. [系统组件](#系统组件)
4. [架构决策](#架构决策)
5. [接口定义](#接口定义)
6. [部署架构](#部署架构)

## 概述

{self.system_name} 是一个...

## 架构目标

- 高可用性
- 可扩展性
- 可维护性
- 安全性

## 系统组件

"""
        
        for component in self.components:
            doc += f"### {component.name}\n\n"
            doc += f"**类型**: {component.type}\n\n"
            doc += f"**描述**: {component.description}\n\n"
            doc += f"**职责**:\n"
            for resp in component.responsibilities:
                doc += f"- {resp}\n"
            
            doc += f"\n**依赖**:\n"
            for dep in component.dependencies:
                doc += f"- {dep}\n"
            
            doc += f"\n**技术栈**:\n"
            for tech in component.technologies:
                doc += f"- {tech}\n"
            
            doc += "\n---\n\n"
        
        doc += "## 架构决策\n\n"
        for decision in self.decisions:
            doc += f"- **ADR {decision.id}**: {decision.title}\n"
        
        return doc
```

## 测试策略与质量报告输出

测试文档规范。

- 测试策略文档
- 测试计划模板
- 质量报告模板
- 风险评估报告

### 质量报告生成器

```python
class QualityReport:
    """
    质量报告生成器
    生成标准化质量报告
    """
    def __init__(self, project_name: str, period: str):
        """
        初始化报告
        
        Args:
            project_name: 项目名称
            period: 报告周期
        """
        self.project_name = project_name
        self.period = period
        self.metrics: Dict = {}
        self.issues: List[Dict] = []
        self.improvements: List[str] = []
    
    def add_metric(self, name: str, value: Any, target: Any = None,
                  trend: str = "stable"):
        """
        添加指标
        
        Args:
            name: 指标名
            value: 当前值
            target: 目标值
            trend: 趋势
        """
        self.metrics[name] = {
            "value": value,
            "target": target,
            "trend": trend,
            "status": "pass" if target and value >= target else "fail" if target else "unknown"
        }
    
    def add_issue(self, severity: str, category: str,
                 description: str, recommendation: str):
        """
        添加问题
        
        Args:
            severity: 严重级别
            category: 类别
            description: 描述
            recommendation: 建议
        """
        self.issues.append({
            "severity": severity,
            "category": category,
            "description": description,
            "recommendation": recommendation
        })
    
    def generate_report(self) -> str:
        """
        生成报告
        
        Returns:
            str: 报告内容
        """
        report = f"""# 质量报告

## 项目信息

- **项目**: {self.project_name}
- **周期**: {self.period}
- **生成日期**: {datetime.now().strftime('%Y-%m-%d')}

## 质量指标

| 指标 | 当前值 | 目标值 | 状态 | 趋势 |
|------|--------|--------|------|------|
"""
        
        for name, metric in self.metrics.items():
            status_emoji = "✅" if metric["status"] == "pass" else "❌" if metric["status"] == "fail" else "⚪"
            trend_emoji = "📈" if metric["trend"] == "up" else "📉" if metric["trend"] == "down" else "➡️"
            
            report += f"| {name} | {metric['value']} | {metric['target'] or '-'} | {status_emoji} | {trend_emoji} |\n"
        
        if self.issues:
            report += "\n## 发现的问题\n\n"
            
            for issue in sorted(self.issues, key=lambda x: x["severity"]):
                severity_emoji = "🔴" if issue["severity"] == "high" else "🟡" if issue["severity"] == "medium" else "🟢"
                report += f"{severity_emoji} **[{issue['severity'].upper()}]** {issue['category']}\n\n"
                report += f"- 描述: {issue['description']}\n"
                report += f"- 建议: {issue['recommendation']}\n\n"
        
        if self.improvements:
            report += "\n## 改进建议\n\n"
            for i, improvement in enumerate(self.improvements, 1):
                report += f"{i}. {improvement}\n"
        
        return report
```

## 跨角色高效协作

不同角色的沟通策略。

- 与开发沟通
- 与产品沟通
- 与运维沟通
- 与管理层沟通

### 沟通策略

```python
class CommunicationStrategy:
    """
    沟通策略
    针对不同角色的沟通方法
    """
    
    @staticmethod
    def for_developer(technical_detail: str,
                     impact: str,
                     action_needed: str) -> str:
        """
        与开发沟通
        
        Args:
            technical_detail: 技术细节
            impact: 影响
            action_needed: 需要的行动
            
        Returns:
            str: 沟通内容
        """
        return f"""## 技术问题反馈

**问题描述**: {technical_detail}

**影响范围**: {impact}

**建议修复**: {action_needed}

**优先级**: 建议尽快处理，影响测试进度。
"""
    
    @staticmethod
    def for_product_manager(feature: str,
                           quality_status: str,
                           risk: str,
                           recommendation: str) -> str:
        """
        与产品沟通
        
        Args:
            feature: 功能
            quality_status: 质量状态
            risk: 风险
            recommendation: 建议
            
        Returns:
            str: 沟通内容
        """
        return f"""## 功能质量评估

**功能**: {feature}

**质量状态**: {quality_status}

**发布风险**: {risk}

**建议**: {recommendation}

**数据支撑**: 基于X个测试用例，Y个缺陷的统计分析。
"""
    
    @staticmethod
    def for_executive(summary: str,
                     key_metrics: Dict,
                     decision_needed: str) -> str:
        """
        与管理层沟通
        
        Args:
            summary: 摘要
            key_metrics: 关键指标
            decision_needed: 需要的决策
            
        Returns:
            str: 沟通内容
        """
        metrics_text = "\n".join([f"- **{k}**: {v}" for k, v in key_metrics.items()])
        
        return f"""## 质量周报

**概要**: {summary}

**关键指标**:
{metrics_text}

**需要决策**: {decision_needed}

**建议**: 基于当前数据，建议...
"""
```

## 高效会议技巧

- 会前准备：明确议程和目标
- 会中控制：聚焦主题，控制时间
- 会后跟进：明确行动项和责任人
- 异步沟通：减少不必要的会议

## 最佳实践

1. **结构化表达**：结论先行，数据支撑
2. **换位思考**：站在对方角度准备内容
3. **可视化**：用图表代替大段文字
4. **及时反馈**：重要事项及时同步
5. **文档沉淀**：讨论结果形成文档
