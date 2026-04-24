# 视觉测试实践

使用视觉语言模型实现智能化的UI视觉测试，包括视觉回归测试、布局验证、视觉断言等。

## 概述

视觉语言模型（Vision-Language Model, VLM）结合了视觉理解和语言理解能力，能够理解图像内容并进行自然语言交互。在UI测试领域，VLM可以实现基于视觉理解的智能测试，无需依赖传统的元素定位器。

### 核心能力

- **UI截图语义理解**：理解界面元素的语义和功能
- **非标控件定位**：定位自定义控件和动态元素
- **跨设备适配验证**：验证不同设备上的UI一致性
- **视觉断言**：基于视觉理解的智能断言

### 技术优势

| 传统方式 | VLM方式 |
|---------|--------|
| 依赖CSS选择器 | 基于视觉理解 |
| 维护成本高 | 自适应变化 |
| 难以处理动态元素 | 智能识别 |
| 需要技术知识 | 自然语言描述 |

## UI截图语义理解

### 界面元素识别

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
import base64

@dataclass
class UIElement:
    """UI元素类"""
    element_type: str
    text: str
    location: Tuple[int, int]
    size: Tuple[int, int]
    confidence: float
    description: str

class VLMUIAnalyzer:
    """
    VLM UI分析器
    使用视觉语言模型分析UI界面
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
    
    def analyze_screenshot(self, image_path: str) -> Dict:
        """
        分析UI截图
        
        Args:
            image_path: 截图路径
            
        Returns:
            dict: 分析结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = """
分析这个UI界面截图，识别以下内容：
1. 界面类型（登录页、列表页、详情页等）
2. 主要UI元素（按钮、输入框、文本、图片等）
3. 元素的位置和功能
4. 用户可能的操作流程

请以JSON格式返回结果。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        
        return {
            "ui_type": response.get("ui_type"),
            "elements": response.get("elements", []),
            "user_flows": response.get("user_flows", []),
            "accessibility_issues": response.get("accessibility_issues", [])
        }
    
    def identify_interactive_elements(self, image_path: str) -> List[UIElement]:
        """
        识别可交互元素
        
        Args:
            image_path: 截图路径
            
        Returns:
            list: 可交互元素列表
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = """
识别这个界面中所有可交互的元素（按钮、链接、输入框等）。
对于每个元素，提供：
- 类型
- 显示文本
- 大致位置（左上角坐标和尺寸）
- 功能描述
- 置信度

以JSON数组格式返回。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        
        elements = []
        for item in response.get("elements", []):
            elements.append(UIElement(
                element_type=item.get("type"),
                text=item.get("text", ""),
                location=tuple(item.get("location", [0, 0])),
                size=tuple(item.get("size", [0, 0])),
                confidence=item.get("confidence", 0.0),
                description=item.get("description", "")
            ))
        
        return elements
    
    def understand_layout(self, image_path: str) -> Dict:
        """
        理解界面布局
        
        Args:
            image_path: 截图路径
            
        Returns:
            dict: 布局分析结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = """
分析这个界面的布局结构：
1. 页面分区（头部、导航、内容区、底部等）
2. 布局方式（网格、列表、卡片等）
3. 响应式设计特征
4. 视觉层次

返回JSON格式的布局分析。
"""
        
        return self.vlm.analyze_image(image_data, prompt)

class VLMElementLocator:
    """
    VLM元素定位器
    使用视觉理解定位UI元素
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
    
    def locate_by_description(
        self, 
        image_path: str, 
        description: str
    ) -> List[Dict]:
        """
        根据描述定位元素
        
        Args:
            image_path: 截图路径
            description: 元素描述
            
        Returns:
            list: 匹配的元素列表
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
在界面中找到符合以下描述的元素：
"{description}"

返回所有匹配元素的位置信息（坐标和尺寸）。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        
        return response.get("matches", [])
    
    def locate_by_visual_pattern(
        self, 
        image_path: str, 
        pattern_image: str
    ) -> List[Dict]:
        """
        根据视觉模式定位元素
        
        Args:
            image_path: 目标截图路径
            pattern_image: 模式图片路径
            
        Returns:
            list: 匹配位置列表
        """
        with open(image_path, "rb") as f:
            target_data = base64.b64encode(f.read()).decode()
        
        with open(pattern_image, "rb") as f:
            pattern_data = base64.b64encode(f.read()).decode()
        
        prompt = """
在目标图像中找到与模式图像相似的所有位置。
返回每个匹配位置的坐标和相似度。
"""
        
        return self.vlm.compare_images(target_data, pattern_data, prompt)
    
    def locate_text(self, image_path: str, text: str) -> List[Dict]:
        """
        定位文本元素
        
        Args:
            image_path: 截图路径
            text: 要定位的文本
            
        Returns:
            list: 文本位置列表
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
在界面中找到包含文本"{text}"的所有元素。
返回每个元素的：
- 精确位置坐标
- 元素类型
- 是否可点击
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        
        return response.get("locations", [])
```

## 非标控件定位

### 自定义控件识别

```python
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class CustomControl:
    """自定义控件类"""
    control_id: str
    control_type: str
    visual_features: Dict
    interaction_hints: List[str]
    location: Tuple[int, int, int, int]

class CustomControlDetector:
    """
    自定义控件检测器
    识别非标准UI控件
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
        self.known_controls: Dict[str, CustomControl] = {}
    
    def detect_custom_controls(self, image_path: str) -> List[CustomControl]:
        """
        检测自定义控件
        
        Args:
            image_path: 截图路径
            
        Returns:
            list: 自定义控件列表
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = """
识别界面中的自定义控件（非标准HTML元素）。
包括：
- 自定义下拉框
- 自定义日期选择器
- 自定义滑块
- 自定义图表
- 其他非标准交互组件

对于每个控件，描述其视觉特征和交互方式。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        
        controls = []
        for item in response.get("controls", []):
            control = CustomControl(
                control_id=item.get("id", ""),
                control_type=item.get("type"),
                visual_features=item.get("features", {}),
                interaction_hints=item.get("interactions", []),
                location=tuple(item.get("location", [0, 0, 0, 0]))
            )
            controls.append(control)
            
            self.known_controls[control.control_id] = control
        
        return controls
    
    def learn_control_pattern(
        self, 
        control_type: str, 
        examples: List[str]
    ):
        """
        学习控件模式
        
        Args:
            control_type: 控件类型
            examples: 示例图片路径列表
        """
        images_data = []
        for path in examples:
            with open(path, "rb") as f:
                images_data.append(base64.b64encode(f.read()).decode())
        
        prompt = f"""
分析这些{control_type}控件的共同特征：
- 视觉特征
- 交互模式
- 状态变化

总结识别规则。
"""
        
        pattern = self.vlm.analyze_images(images_data, prompt)
        
        return pattern
    
    def generate_interaction_script(
        self, 
        control: CustomControl,
        action: str
    ) -> str:
        """
        生成交互脚本
        
        Args:
            control: 自定义控件
            action: 操作类型
            
        Returns:
            str: 交互脚本
        """
        prompt = f"""
为以下自定义控件生成{action}操作的自动化脚本：

控件类型：{control.control_type}
视觉特征：{control.visual_features}
交互提示：{control.interaction_hints}

使用Playwright语法。
"""
        
        return self.vlm.generate(prompt)

class DynamicElementHandler:
    """
    动态元素处理器
    处理动态变化的UI元素
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
    
    def handle_dynamic_element(
        self, 
        base_image: str, 
        current_image: str,
        element_description: str
    ) -> Dict:
        """
        处理动态元素
        
        Args:
            base_image: 基准截图
            current_image: 当前截图
            element_description: 元素描述
            
        Returns:
            dict: 处理结果
        """
        with open(base_image, "rb") as f:
            base_data = base64.b64encode(f.read()).decode()
        
        with open(current_image, "rb") as f:
            current_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
对比两张截图，找到描述为"{element_description}"的元素。

分析：
1. 元素位置是否变化
2. 元素外观是否变化
3. 如何在当前截图中定位该元素

返回定位策略。
"""
        
        return self.vlm.compare_images(base_data, current_data, prompt)
    
    def track_element_across_states(
        self, 
        images: List[str], 
        element_description: str
    ) -> List[Dict]:
        """
        跨状态追踪元素
        
        Args:
            images: 不同状态的截图列表
            element_description: 元素描述
            
        Returns:
            list: 各状态下的元素位置
        """
        results = []
        
        for i, image_path in enumerate(images):
            with open(image_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode()
            
            prompt = f"""
在状态{i}的界面中找到"{element_description}"元素。
返回其位置和状态。
"""
            
            result = self.vlm.analyze_image(image_data, prompt)
            results.append({
                "state": i,
                "location": result.get("location"),
                "visible": result.get("visible", True)
            })
        
        return results
```

## 跨设备适配验证

### 响应式布局验证

```python
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class DeviceViewport:
    """设备视口类"""
    device_name: str
    width: int
    height: int
    pixel_ratio: float

class CrossDeviceValidator:
    """
    跨设备验证器
    验证UI在不同设备上的一致性
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
        self.devices = [
            DeviceViewport("iPhone 12", 390, 844, 3.0),
            DeviceViewport("iPhone 14 Pro", 393, 852, 3.0),
            DeviceViewport("iPad Pro", 1024, 1366, 2.0),
            DeviceViewport("Desktop", 1920, 1080, 1.0),
            DeviceViewport("Desktop 4K", 2560, 1440, 1.0)
        ]
    
    def validate_responsive_design(
        self, 
        screenshots: Dict[str, str]
    ) -> Dict:
        """
        验证响应式设计
        
        Args:
            screenshots: {设备名: 截图路径} 字典
            
        Returns:
            dict: 验证结果
        """
        results = {}
        
        for device_name, screenshot_path in screenshots.items():
            with open(screenshot_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode()
            
            prompt = """
分析这个界面的响应式设计：
1. 布局是否适配当前屏幕尺寸
2. 文字是否可读
3. 交互元素是否易于点击
4. 是否有溢出或遮挡问题

返回问题列表和改进建议。
"""
            
            result = self.vlm.analyze_image(image_data, prompt)
            results[device_name] = result
        
        return {
            "device_results": results,
            "overall_score": self._calculate_overall_score(results),
            "recommendations": self._generate_recommendations(results)
        }
    
    def compare_across_devices(
        self, 
        screenshots: Dict[str, str]
    ) -> Dict:
        """
        跨设备对比
        
        Args:
            screenshots: {设备名: 截图路径} 字典
            
        Returns:
            dict: 对比结果
        """
        images_data = {}
        for device, path in screenshots.items():
            with open(path, "rb") as f:
                images_data[device] = base64.b64encode(f.read()).decode()
        
        prompt = """
对比这些不同设备上的界面截图：
1. 布局一致性
2. 功能完整性
3. 视觉差异
4. 用户体验一致性

返回详细的对比分析。
"""
        
        return self.vlm.compare_images_multi(images_data, prompt)
    
    def _calculate_overall_score(self, results: Dict) -> float:
        """
        计算总体得分
        
        Args:
            results: 各设备结果
            
        Returns:
            float: 总体得分
        """
        if not results:
            return 0.0
        
        scores = []
        for device_result in results.values():
            issues = device_result.get("issues", [])
            score = max(0, 100 - len(issues) * 10)
            scores.append(score)
        
        return sum(scores) / len(scores)
    
    def _generate_recommendations(self, results: Dict) -> List[str]:
        """
        生成改进建议
        
        Args:
            results: 各设备结果
            
        Returns:
            list: 建议列表
        """
        all_issues = []
        for device_result in results.values():
            all_issues.extend(device_result.get("issues", []))
        
        recommendations = []
        
        issue_counts = {}
        for issue in all_issues:
            issue_type = issue.get("type", "unknown")
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        for issue_type, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
            recommendations.append(f"修复{issue_type}问题（出现{count}次）")
        
        return recommendations[:5]
```

## 视觉断言

### 智能视觉验证

```python
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class VisualAssertion:
    """视觉断言类"""
    assertion_type: str
    description: str
    expected: Any
    actual: Any
    passed: bool
    message: str

class VLMVisualAsserter:
    """
    VLM视觉断言器
    基于视觉理解的智能断言
    """
    def __init__(self, vlm_client):
        self.vlm = vlm_client
    
    def assert_visual_element(
        self, 
        image_path: str, 
        description: str,
        should_exist: bool = True
    ) -> VisualAssertion:
        """
        断言视觉元素存在
        
        Args:
            image_path: 截图路径
            description: 元素描述
            should_exist: 是否应该存在
            
        Returns:
            VisualAssertion: 断言结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
判断界面中是否存在符合以下描述的元素：
"{description}"

返回true或false。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        exists = response.get("exists", False)
        
        return VisualAssertion(
            assertion_type="element_exists",
            description=description,
            expected=should_exist,
            actual=exists,
            passed=exists == should_exist,
            message=f"元素{'存在' if exists else '不存在'}"
        )
    
    def assert_text_visible(
        self, 
        image_path: str, 
        text: str
    ) -> VisualAssertion:
        """
        断言文本可见
        
        Args:
            image_path: 截图路径
            text: 预期文本
            
        Returns:
            VisualAssertion: 断言结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
检查界面中是否可见文本"{text}"。
考虑：
1. 文本是否完整显示
2. 是否被遮挡
3. 是否可读

返回结果。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        visible = response.get("visible", False)
        
        return VisualAssertion(
            assertion_type="text_visible",
            description=f"文本'{text}'可见",
            expected=True,
            actual=visible,
            passed=visible,
            message=response.get("message", "")
        )
    
    def assert_layout_correct(
        self, 
        image_path: str, 
        layout_description: str
    ) -> VisualAssertion:
        """
        断言布局正确
        
        Args:
            image_path: 截图路径
            layout_description: 布局描述
            
        Returns:
            VisualAssertion: 断言结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
验证界面布局是否符合以下描述：
"{layout_description}"

检查：
1. 元素位置
2. 对齐方式
3. 间距
4. 层次关系

返回是否符合预期。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        correct = response.get("correct", False)
        
        return VisualAssertion(
            assertion_type="layout_correct",
            description=layout_description,
            expected=True,
            actual=correct,
            passed=correct,
            message=response.get("message", "")
        )
    
    def assert_visual_state(
        self, 
        image_path: str, 
        expected_state: str
    ) -> VisualAssertion:
        """
        断言视觉状态
        
        Args:
            image_path: 截图路径
            expected_state: 预期状态描述
            
        Returns:
            VisualAssertion: 断言结果
        """
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = f"""
判断界面当前状态是否符合：
"{expected_state}"

返回状态匹配度（0-1）和分析说明。
"""
        
        response = self.vlm.analyze_image(image_data, prompt)
        match_score = response.get("match_score", 0)
        
        return VisualAssertion(
            assertion_type="visual_state",
            description=expected_state,
            expected=1.0,
            actual=match_score,
            passed=match_score >= 0.8,
            message=response.get("analysis", "")
        )
    
    def run_visual_test_suite(
        self, 
        image_path: str, 
        assertions: List[Dict]
    ) -> Dict:
        """
        运行视觉测试套件
        
        Args:
            image_path: 截图路径
            assertions: 断言配置列表
            
        Returns:
            dict: 测试结果
        """
        results = []
        
        for assertion_config in assertions:
            assertion_type = assertion_config["type"]
            
            if assertion_type == "element_exists":
                result = self.assert_visual_element(
                    image_path,
                    assertion_config["description"],
                    assertion_config.get("should_exist", True)
                )
            elif assertion_type == "text_visible":
                result = self.assert_text_visible(
                    image_path,
                    assertion_config["text"]
                )
            elif assertion_type == "layout_correct":
                result = self.assert_layout_correct(
                    image_path,
                    assertion_config["layout"]
                )
            elif assertion_type == "visual_state":
                result = self.assert_visual_state(
                    image_path,
                    assertion_config["state"]
                )
            else:
                continue
            
            results.append(result)
        
        passed_count = sum(1 for r in results if r.passed)
        
        return {
            "total": len(results),
            "passed": passed_count,
            "failed": len(results) - passed_count,
            "pass_rate": passed_count / len(results) if results else 0,
            "results": results
        }
```

## 最佳实践

### 1. VLM测试策略

| 场景 | 推荐策略 | 说明 |
|-----|---------|------|
| 快速验证 | 单次截图分析 | 适合冒烟测试 |
| 回归测试 | 对比验证 | 适合持续集成 |
| 跨设备测试 | 多设备对比 | 适配性验证 |
| 探索测试 | 智能分析 | 发现潜在问题 |

### 2. 性能优化

- 缓存VLM分析结果
- 批量处理截图
- 使用轻量级模型
- 异步执行分析

### 3. 成本控制

- 合理选择模型
- 优化提示词长度
- 复用分析结果
- 设置调用限制

## 相关资源

- [Prompt工程与LangChain](/ai-testing-tech/llm-tech/prompt-engineering/) - Prompt Engineering、LangChain
- [测试脚本自愈](/ai-testing-tech/self-healing/) - 自动修复测试脚本
