# 技术领导力

技术团队领导力的培养与实践。

## 制定团队AI测试技术路线图

技术战略规划能力。

- 技术趋势分析
- 路线图制定
- 资源规划
- 风险评估

### 技术路线图制定框架

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum

class Priority(Enum):
    """优先级"""
    P0 = "critical"
    P1 = "high"
    P2 = "medium"
    P3 = "low"

class Status(Enum):
    """状态"""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class RoadmapItem:
    """路线图项目"""
    id: str
    title: str
    description: str
    priority: Priority
    status: Status
    start_date: datetime
    target_date: datetime
    owner: str
    dependencies: List[str]
    deliverables: List[str]
    success_criteria: str
    estimated_effort: int  # 人天

class TechnologyRoadmap:
    """
    技术路线图
    规划团队技术发展方向
    """
    def __init__(self, name: str, horizon_years: int = 3):
        """
        初始化路线图
        
        Args:
            name: 路线图名称
            horizon_years: 规划周期（年）
        """
        self.name = name
        self.horizon_years = horizon_years
        self.items: List[RoadmapItem] = []
        self.phases: Dict[str, Dict] = {}
    
    def add_phase(self, phase_id: str, name: str,
                  start_date: datetime, end_date: datetime,
                  objectives: List[str]):
        """
        添加阶段
        
        Args:
            phase_id: 阶段ID
            name: 阶段名称
            start_date: 开始日期
            end_date: 结束日期
            objectives: 阶段目标
        """
        self.phases[phase_id] = {
            "name": name,
            "start_date": start_date,
            "end_date": end_date,
            "objectives": objectives,
            "items": []
        }
    
    def add_item(self, item: RoadmapItem, phase_id: str = None):
        """
        添加路线图项目
        
        Args:
            item: 项目
            phase_id: 所属阶段
        """
        self.items.append(item)
        
        if phase_id and phase_id in self.phases:
            self.phases[phase_id]["items"].append(item.id)
    
    def get_items_by_priority(self, priority: Priority) -> List[RoadmapItem]:
        """
        按优先级获取项目
        
        Args:
            priority: 优先级
            
        Returns:
            list: 项目列表
        """
        return [item for item in self.items if item.priority == priority]
    
    def get_items_by_status(self, status: Status) -> List[RoadmapItem]:
        """
        按状态获取项目
        
        Args:
            status: 状态
            
        Returns:
            list: 项目列表
        """
        return [item for item in self.items if item.status == status]
    
    def calculate_progress(self) -> Dict:
        """
        计算整体进度
        
        Returns:
            dict: 进度信息
        """
        total = len(self.items)
        if total == 0:
            return {"progress": 0, "completed": 0, "total": 0}
        
        completed = len([i for i in self.items if i.status == Status.COMPLETED])
        in_progress = len([i for i in self.items if i.status == Status.IN_PROGRESS])
        
        return {
            "progress": (completed / total) * 100,
            "completed": completed,
            "in_progress": in_progress,
            "total": total
        }
    
    def identify_risks(self) -> List[Dict]:
        """
        识别风险项目
        
        Returns:
            list: 风险列表
        """
        risks = []
        now = datetime.now()
        
        for item in self.items:
            if item.status == Status.IN_PROGRESS:
                # 检查是否延期
                if item.target_date < now:
                    risks.append({
                        "item": item,
                        "risk_type": "delay",
                        "severity": "high" if item.priority == Priority.P0 else "medium"
                    })
            
            # 检查依赖是否完成
            for dep_id in item.dependencies:
                dep = next((i for i in self.items if i.id == dep_id), None)
                if dep and dep.status != Status.COMPLETED:
                    risks.append({
                        "item": item,
                        "risk_type": "dependency",
                        "dependency": dep,
                        "severity": "medium"
                    })
        
        return risks
    
    def generate_report(self) -> str:
        """
        生成路线图报告
        
        Returns:
            str: Markdown格式报告
        """
        progress = self.calculate_progress()
        risks = self.identify_risks()
        
        report = f"""# {self.name} - 技术路线图

## 概览

- 规划周期: {self.horizon_years}年
- 总体进度: {progress['progress']:.1f}%
- 已完成: {progress['completed']}/{progress['total']}
- 进行中: {progress['in_progress']}
- 风险项: {len(risks)}

## 阶段规划

"""
        
        for phase_id, phase in self.phases.items():
            report += f"### {phase['name']}\n\n"
            report += f"- 时间: {phase['start_date'].strftime('%Y-%m')} ~ {phase['end_date'].strftime('%Y-%m')}\n"
            report += f"- 目标: {', '.join(phase['objectives'])}\n\n"
            
            phase_items = [i for i in self.items if i.id in phase['items']]
            for item in phase_items:
                status_emoji = "✅" if item.status == Status.COMPLETED else "🔄" if item.status == Status.IN_PROGRESS else "⏳"
                report += f"- {status_emoji} [{item.priority.value}] {item.title}\n"
        
        if risks:
            report += "\n## 风险预警\n\n"
            for risk in risks:
                report += f"- ⚠️ **{risk['risk_type']}**: {risk['item'].title} (严重度: {risk['severity']})\n"
        
        return report

# AI测试技术路线图示例
class AITestRoadmap(TechnologyRoadmap):
    """AI测试技术路线图"""
    
    def __init__(self):
        super().__init__("AI测试技术路线图", horizon_years=3)
        
        now = datetime.now()
        
        # 第一阶段：基础建设
        self.add_phase(
            "phase1",
            "基础建设期",
            now,
            now + timedelta(days=180),
            ["搭建AI测试基础设施", "团队技能培训", "试点项目验证"]
        )
        
        # 第二阶段：能力扩展
        self.add_phase(
            "phase2",
            "能力扩展期",
            now + timedelta(days=180),
            now + timedelta(days=365),
            ["扩展AI测试覆盖范围", "建立自动化流水线", "积累领域知识"]
        )
        
        # 第三阶段：智能化
        self.add_phase(
            "phase3",
            "智能化期",
            now + timedelta(days=365),
            now + timedelta(days=730),
            ["实现自主测试", "智能缺陷预测", "持续优化"]
        )
```

## 跨部门横向专案推动

横向协作与项目管理。

- 利益相关者管理
- 沟通策略
- 冲突解决
- 成果展示

### 跨部门项目推动框架

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class StakeholderType(Enum):
    """利益相关者类型"""
    SPONSOR = "sponsor"          # 发起人
    DECISION_MAKER = "decision"  # 决策者
    INFLUENCER = "influencer"    # 影响者
    IMPLEMENTER = "implementer"  # 执行者
    USER = "user"                # 用户

@dataclass
class Stakeholder:
    """利益相关者"""
    name: str
    department: str
    role: str
    type: StakeholderType
    influence: int  # 1-10
    interest: int   # 1-10
    concerns: List[str]
    communication_preference: str

class CrossDepartmentProject:
    """
    跨部门项目
    管理横向协作项目
    """
    def __init__(self, name: str, project_manager: str):
        """
        初始化项目
        
        Args:
            name: 项目名称
            project_manager: 项目经理
        """
        self.name = name
        self.project_manager = project_manager
        self.stakeholders: List[Stakeholder] = []
        self.milestones: List[Dict] = []
        self.communication_log: List[Dict] = []
    
    def add_stakeholder(self, stakeholder: Stakeholder):
        """
        添加利益相关者
        
        Args:
            stakeholder: 利益相关者
        """
        self.stakeholders.append(stakeholder)
    
    def analyze_stakeholders(self) -> Dict:
        """
        分析利益相关者
        
        Returns:
            dict: 分析结果
        """
        matrix = {
            "high_influence_high_interest": [],
            "high_influence_low_interest": [],
            "low_influence_high_interest": [],
            "low_influence_low_interest": []
        }
        
        for s in self.stakeholders:
            if s.influence >= 7 and s.interest >= 7:
                matrix["high_influence_high_interest"].append(s)
            elif s.influence >= 7 and s.interest < 7:
                matrix["high_influence_low_interest"].append(s)
            elif s.influence < 7 and s.interest >= 7:
                matrix["low_influence_high_interest"].append(s)
            else:
                matrix["low_influence_low_interest"].append(s)
        
        return matrix
    
    def get_communication_strategy(self) -> Dict:
        """
        获取沟通策略
        
        Returns:
            dict: 沟通策略
        """
        matrix = self.analyze_stakeholders()
        
        strategies = {}
        
        # 重点管理
        for s in matrix["high_influence_high_interest"]:
            strategies[s.name] = {
                "approach": "密切合作",
                "frequency": "每周",
                "method": "面对面会议",
                "goal": "确保支持和参与"
            }
        
        # 保持满意
        for s in matrix["high_influence_low_interest"]:
            strategies[s.name] = {
                "approach": "保持满意",
                "frequency": "每月",
                "method": "邮件汇报",
                "goal": "避免反对"
            }
        
        # 保持知情
        for s in matrix["low_influence_high_interest"]:
            strategies[s.name] = {
                "approach": "保持知情",
                "frequency": "双周",
                "method": "团队会议",
                "goal": "收集反馈"
            }
        
        # 最小努力
        for s in matrix["low_influence_low_interest"]:
            strategies[s.name] = {
                "approach": "最小努力",
                "frequency": "按需",
                "method": "公告",
                "goal": "避免干扰"
            }
        
        return strategies
    
    def log_communication(self, stakeholder: str, method: str,
                         topic: str, outcome: str):
        """
        记录沟通
        
        Args:
            stakeholder: 利益相关者
            method: 沟通方式
            topic: 主题
            outcome: 结果
        """
        from datetime import datetime
        
        self.communication_log.append({
            "timestamp": datetime.now().isoformat(),
            "stakeholder": stakeholder,
            "method": method,
            "topic": topic,
            "outcome": outcome
        })
    
    def resolve_conflict(self, parties: List[str],
                        issue: str) -> Dict:
        """
        解决冲突
        
        Args:
            parties: 冲突方
            issue: 问题描述
            
        Returns:
            dict: 解决方案
        """
        # 分析各方立场
        positions = {}
        for party in parties:
            stakeholder = next((s for s in self.stakeholders if s.name == party), None)
            if stakeholder:
                positions[party] = stakeholder.concerns
        
        # 寻找共同利益
        common_interests = set.intersection(*[set(p) for p in positions.values()]) if positions else set()
        
        return {
            "issue": issue,
            "parties": parties,
            "positions": positions,
            "common_interests": list(common_interests),
            "recommended_approach": "基于共同利益寻找双赢方案",
            "next_steps": [
                "组织各方会议",
                "明确共同目标",
                "制定妥协方案",
                "达成共识"
            ]
        }
```

## 团队AI思维重塑与技术布道

技术文化塑造。

- 技术培训体系
- 内部分享机制
- 实践社区
- 激励机制

### 技术布道框架

```python
class TechEvangelism:
    """
    技术布道
    推动团队技术文化
    """
    def __init__(self):
        self.training_programs: List[Dict] = []
        self.sharing_sessions: List[Dict] = []
        self.mentorship_pairs: List[Dict] = []
    
    def create_training_program(self, name: str, topics: List[str],
                               target_audience: str,
                               duration_weeks: int) -> Dict:
        """
        创建培训计划
        
        Args:
            name: 计划名称
            topics: 主题列表
            target_audience: 目标受众
            duration_weeks: 持续时间
            
            Returns:
                dict: 培训计划
        """
        program = {
            "name": name,
            "topics": topics,
            "target_audience": target_audience,
            "duration_weeks": duration_weeks,
            "sessions": []
        }
        
        self.training_programs.append(program)
        return program
    
    def organize_sharing_session(self, title: str, speaker: str,
                                topic: str, audience: str) -> Dict:
        """
        组织分享会
        
        Args:
            title: 标题
            speaker: 分享人
            topic: 主题
            audience: 受众
            
        Returns:
            dict: 分享会信息
        """
        session = {
            "title": title,
            "speaker": speaker,
            "topic": topic,
            "audience": audience,
            "date": None,
            "feedback": []
        }
        
        self.sharing_sessions.append(session)
        return session
    
    def setup_mentorship(self, mentor: str, mentee: str,
                        focus_areas: List[str]) -> Dict:
        """
        建立导师制
        
        Args:
            mentor: 导师
            mentee: 学员
            focus_areas: 重点领域
            
        Returns:
            dict: 导师关系
        """
        pair = {
            "mentor": mentor,
            "mentee": mentee,
            "focus_areas": focus_areas,
            "start_date": None,
            "meetings": []
        }
        
        self.mentorship_pairs.append(pair)
        return pair
    
    def calculate_tech_maturity(self, team_skills: Dict[str, int]) -> Dict:
        """
        计算技术成熟度
        
        Args:
            team_skills: 团队技能评分
            
        Returns:
            dict: 成熟度评估
        """
        if not team_skills:
            return {"average": 0, "level": "unknown"}
        
        avg_score = sum(team_skills.values()) / len(team_skills)
        
        if avg_score >= 8:
            level = "expert"
        elif avg_score >= 6:
            level = "proficient"
        elif avg_score >= 4:
            level = "developing"
        else:
            level = "beginner"
        
        return {
            "average": avg_score,
            "level": level,
            "distribution": {
                "expert": sum(1 for s in team_skills.values() if s >= 8),
                "proficient": sum(1 for s in team_skills.values() if 6 <= s < 8),
                "developing": sum(1 for s in team_skills.values() if 4 <= s < 6),
                "beginner": sum(1 for s in team_skills.values() if s < 4)
            }
        }
```

## 领导力自我评估

| 维度 | 评估项 | 自评（1-5） |
|------|--------|-----------|
| 技术视野 | 对AI测试趋势的了解 | |
| 规划能力 | 路线图制定与执行 | |
| 影响力 | 跨部门推动能力 | |
| 培养能力 | 团队成员成长 | |
| 决策能力 | 技术决策质量 | |
| 沟通能力 | 技术布道效果 | |

## 最佳实践

1. **以身作则**：领导者先掌握新技术
2. **倾听反馈**：重视团队声音
3. **授权赋能**：给予团队自主权
4. **持续学习**：保持技术敏锐度
5. **成果共享**：让团队获得成就感
