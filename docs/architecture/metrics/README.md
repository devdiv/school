# 质量度量与数据驱动

基于数据的质量改进体系。

## 质量仪表盘

可视化质量指标。

- 测试覆盖率
- 缺陷密度
- 交付质量
- 团队效能

### 质量指标计算

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class QualityMetrics:
    """质量指标"""
    test_coverage: float           # 测试覆盖率
    defect_density: float          # 缺陷密度
    defect_escape_rate: float      # 缺陷逃逸率
    mean_time_to_detect: float     # 平均发现时间
    mean_time_to_repair: float     # 平均修复时间
    automation_rate: float         # 自动化率
    pass_rate: float               # 通过率
    flaky_rate: float              # 不稳定率

class QualityCalculator:
    """
    质量指标计算器
    计算各项质量指标
    """
    def calculate_coverage(self, lines_covered: int,
                          total_lines: int) -> float:
        """
        计算覆盖率
        
        Args:
            lines_covered: 覆盖行数
            total_lines: 总行数
            
        Returns:
            float: 覆盖率百分比
        """
        if total_lines == 0:
            return 0.0
        return (lines_covered / total_lines) * 100
    
    def calculate_defect_density(self, defect_count: int,
                                 code_size_kloc: float) -> float:
        """
        计算缺陷密度
        
        Args:
            defect_count: 缺陷数量
            code_size_kloc: 代码规模（千行）
            
        Returns:
            float: 缺陷密度
        """
        if code_size_kloc == 0:
            return 0.0
        return defect_count / code_size_kloc
    
    def calculate_defect_escape_rate(self, 
                                     production_defects: int,
                                     total_defects: int) -> float:
        """
        计算缺陷逃逸率
        
        Args:
            production_defects: 生产环境缺陷
            total_defects: 总缺陷数
            
        Returns:
            float: 逃逸率
        """
        if total_defects == 0:
            return 0.0
        return (production_defects / total_defects) * 100
    
    def calculate_automation_rate(self, automated_tests: int,
                                  total_tests: int) -> float:
        """
        计算自动化率
        
        Args:
            automated_tests: 自动化用例数
            total_tests: 总用例数
            
        Returns:
            float: 自动化率
        """
        if total_tests == 0:
            return 0.0
        return (automated_tests / total_tests) * 100
    
    def calculate_flaky_rate(self, flaky_tests: int,
                            total_executions: int) -> float:
        """
        计算不稳定率
        
        Args:
            flaky_tests: 不稳定用例数
            total_executions: 总执行次数
            
        Returns:
            float: 不稳定率
        """
        if total_executions == 0:
            return 0.0
        return (flaky_tests / total_executions) * 100

class QualityDashboard:
    """
    质量仪表盘
    聚合和展示质量指标
    """
    def __init__(self):
        self.calculator = QualityCalculator()
        self.history: List[Dict] = []
    
    def generate_report(self, data: Dict) -> Dict:
        """
        生成质量报告
        
        Args:
            data: 原始数据
            
        Returns:
            dict: 质量报告
        """
        metrics = QualityMetrics(
            test_coverage=self.calculator.calculate_coverage(
                data.get("lines_covered", 0),
                data.get("total_lines", 1)
            ),
            defect_density=self.calculator.calculate_defect_density(
                data.get("defect_count", 0),
                data.get("code_size_kloc", 1)
            ),
            defect_escape_rate=self.calculator.calculate_defect_escape_rate(
                data.get("production_defects", 0),
                data.get("total_defects", 1)
            ),
            mean_time_to_detect=data.get("mttd", 0),
            mean_time_to_repair=data.get("mttr", 0),
            automation_rate=self.calculator.calculate_automation_rate(
                data.get("automated_tests", 0),
                data.get("total_tests", 1)
            ),
            pass_rate=data.get("pass_rate", 0),
            flaky_rate=self.calculator.calculate_flaky_rate(
                data.get("flaky_tests", 0),
                data.get("total_executions", 1)
            )
        )
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "test_coverage": f"{metrics.test_coverage:.1f}%",
                "defect_density": f"{metrics.defect_density:.2f}/KLOC",
                "defect_escape_rate": f"{metrics.defect_escape_rate:.1f}%",
                "mean_time_to_detect": f"{metrics.mean_time_to_detect:.1f}h",
                "mean_time_to_repair": f"{metrics.mean_time_to_repair:.1f}h",
                "automation_rate": f"{metrics.automation_rate:.1f}%",
                "pass_rate": f"{metrics.pass_rate:.1f}%",
                "flaky_rate": f"{metrics.flaky_rate:.1f}%"
            },
            "grade": self._calculate_grade(metrics)
        }
        
        self.history.append(report)
        return report
    
    def _calculate_grade(self, metrics: QualityMetrics) -> str:
        """
        计算质量等级
        
        Args:
            metrics: 质量指标
            
        Returns:
            str: 等级（A/B/C/D）
        """
        score = 0
        
        if metrics.test_coverage >= 80: score += 25
        elif metrics.test_coverage >= 60: score += 15
        elif metrics.test_coverage >= 40: score += 10
        
        if metrics.defect_escape_rate <= 5: score += 25
        elif metrics.defect_escape_rate <= 10: score += 15
        elif metrics.defect_escape_rate <= 20: score += 10
        
        if metrics.automation_rate >= 70: score += 25
        elif metrics.automation_rate >= 50: score += 15
        elif metrics.automation_rate >= 30: score += 10
        
        if metrics.pass_rate >= 95: score += 25
        elif metrics.pass_rate >= 90: score += 15
        elif metrics.pass_rate >= 80: score += 10
        
        if score >= 90: return "A"
        elif score >= 75: return "B"
        elif score >= 60: return "C"
        else: return "D"
```

## AI提效度量

AI赋能的效能提升度量。

- 用例生成效率
- 缺陷发现效率
- 维护成本降低
- 覆盖率提升

### AI效能度量

```python
class AIEfficiencyMetrics:
    """
    AI效能度量器
    度量AI带来的效能提升
    """
    def __init__(self):
        self.baseline_metrics: Dict = {}
        self.ai_metrics: Dict = {}
    
    def set_baseline(self, metrics: Dict):
        """
        设置基线指标
        
        Args:
            metrics: 基线数据
        """
        self.baseline_metrics = metrics
    
    def calculate_improvement(self, metric_name: str) -> Dict:
        """
        计算改进幅度
        
        Args:
            metric_name: 指标名称
            
        Returns:
            dict: 改进数据
        """
        baseline = self.baseline_metrics.get(metric_name, 0)
        current = self.ai_metrics.get(metric_name, 0)
        
        if baseline == 0:
            return {"improvement": 0, "percentage": 0}
        
        improvement = current - baseline
        percentage = (improvement / baseline) * 100
        
        return {
            "baseline": baseline,
            "current": current,
            "improvement": improvement,
            "percentage": percentage
        }
    
    def generate_ai_report(self) -> Dict:
        """
        生成AI效能报告
        
        Returns:
            dict: 效能报告
        """
        metrics = [
            "test_creation_time",
            "defect_detection_rate",
            "maintenance_effort",
            "coverage_growth_rate"
        ]
        
        report = {}
        for metric in metrics:
            report[metric] = self.calculate_improvement(metric)
        
        return {
            "overall_improvement": sum(
                r["percentage"] for r in report.values()
            ) / len(report),
            "details": report
        }
```

## 基于度量的架构持续优化决策

数据驱动的架构决策。

- 指标收集
- 趋势分析
- 瓶颈识别
- 优化决策

### 架构优化决策引擎

```python
class ArchitectureOptimizer:
    """
    架构优化决策引擎
    基于度量数据提供优化建议
    """
    def __init__(self):
        self.rules = []
        self._init_rules()
    
    def _init_rules(self):
        """初始化优化规则"""
        self.rules = [
            {
                "name": "测试执行时间过长",
                "condition": lambda m: m.get("avg_execution_time", 0) > 3600,
                "action": "考虑并行化测试或优化慢用例"
            },
            {
                "name": "不稳定用例过多",
                "condition": lambda m: m.get("flaky_rate", 0) > 10,
                "action": "优先修复不稳定用例"
            },
            {
                "name": "覆盖率不足",
                "condition": lambda m: m.get("coverage", 0) < 60,
                "action": "增加单元测试和集成测试"
            },
            {
                "name": "缺陷逃逸率高",
                "condition": lambda m: m.get("defect_escape_rate", 0) > 15,
                "action": "加强预发布环境测试"
            }
        ]
    
    def analyze(self, metrics: Dict) -> List[Dict]:
        """
        分析并提供优化建议
        
        Args:
            metrics: 当前指标
            
        Returns:
            list: 优化建议
        """
        recommendations = []
        
        for rule in self.rules:
            if rule["condition"](metrics):
                recommendations.append({
                    "issue": rule["name"],
                    "recommendation": rule["action"],
                    "priority": "high"
                })
        
        return recommendations
```

## 最佳实践

1. **度量先行**：先定义指标再收集数据
2. **可视化**：指标必须可视化才能产生价值
3. **趋势关注**：关注趋势而非单点数据
4. **行动导向**：度量必须驱动改进行动
5. **定期回顾**：定期Review指标有效性
