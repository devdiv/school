# 视觉融合测试

计算机视觉与物理世界测试，拓展测试边界。

## 概述

视觉融合测试是将计算机视觉技术应用于软件测试领域，实现对图形界面、物理设备、文档图像等视觉元素的自动化测试。通过视觉感知能力，测试系统可以像人类一样理解和验证视觉内容。

### 核心价值

- **非侵入式测试**：不依赖应用内部结构，通过视觉验证功能
- **跨平台一致性**：验证不同设备上的视觉呈现一致性
- **用户体验验证**：从用户视角验证界面设计和交互
- **物理世界测试**：测试IoT设备、嵌入式系统等物理实体

### 应用场景

```
视觉融合测试应用
├── UI视觉测试
│   ├── 视觉回归测试
│   ├── 响应式布局验证
│   ├── 跨浏览器一致性
│   └── 无障碍性检测
├── 移动端测试
│   ├── 跨设备适配
│   ├── 触摸交互验证
│   ├── 相机功能测试
│   └── AR/VR应用测试
├── 文档测试
│   ├── PDF验证
│   ├── 图表识别
│   ├── OCR文字提取
│   └── 格式一致性
└── 物理设备测试
    ├── IoT设备状态
    ├── 显示屏验证
    ├── 指示灯检测
    └── 硬件交互
```

## 计算机视觉基础

### 图像处理基础

```python
import cv2
import numpy as np
from typing import Tuple, List, Dict
from dataclasses import dataclass

@dataclass
class ImageRegion:
    """图像区域类"""
    x: int
    y: int
    width: int
    height: int
    confidence: float = 1.0

class ImageProcessor:
    """
    图像处理器
    提供基础的图像处理功能
    """
    def __init__(self):
        pass
    
    def load_image(self, path: str) -> np.ndarray:
        """
        加载图像
        
        Args:
            path: 图像路径
            
        Returns:
            np.ndarray: 图像数组
        """
        return cv2.imread(path)
    
    def save_image(self, image: np.ndarray, path: str):
        """
        保存图像
        
        Args:
            image: 图像数组
            path: 保存路径
        """
        cv2.imwrite(path, image)
    
    def resize(self, image: np.ndarray, width: int, height: int) -> np.ndarray:
        """
        调整图像大小
        
        Args:
            image: 原始图像
            width: 目标宽度
            height: 目标高度
            
        Returns:
            np.ndarray: 调整后的图像
        """
        return cv2.resize(image, (width, height))
    
    def crop(self, image: np.ndarray, region: ImageRegion) -> np.ndarray:
        """
        裁剪图像
        
        Args:
            image: 原始图像
            region: 裁剪区域
            
        Returns:
            np.ndarray: 裁剪后的图像
        """
        return image[region.y:region.y+region.height, 
                      region.x:region.x+region.width]
    
    def convert_to_gray(self, image: np.ndarray) -> np.ndarray:
        """
        转换为灰度图
        
        Args:
            image: 彩色图像
            
        Returns:
            np.ndarray: 灰度图像
        """
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    def apply_blur(self, image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        应用模糊
        
        Args:
            image: 原始图像
            kernel_size: 核大小
            
        Returns:
            np.ndarray: 模糊后的图像
        """
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    def apply_threshold(self, image: np.ndarray, threshold: int = 127) -> np.ndarray:
        """
        应用阈值
        
        Args:
            image: 灰度图像
            threshold: 阈值
            
        Returns:
            np.ndarray: 二值图像
        """
        _, binary = cv2.threshold(image, threshold, 255, cv2.THRESH_BINARY)
        return binary
    
    def detect_edges(self, image: np.ndarray, low: int = 50, high: int = 150) -> np.ndarray:
        """
        边缘检测
        
        Args:
            image: 灰度图像
            low: 低阈值
            high: 高阈值
            
        Returns:
            np.ndarray: 边缘图像
        """
        return cv2.Canny(image, low, high)

class TemplateMatcher:
    """
    模板匹配器
    在图像中查找模板
    """
    def __init__(self):
        self.methods = {
            "normal": cv2.TM_CCOEFF_NORMED,
            "correlation": cv2.TM_CCORR_NORMED,
            "square_diff": cv2.TM_SQDIFF_NORMED
        }
    
    def find_template(
        self, 
        image: np.ndarray, 
        template: np.ndarray, 
        threshold: float = 0.8,
        method: str = "normal"
    ) -> List[ImageRegion]:
        """
        查找模板
        
        Args:
            image: 目标图像
            template: 模板图像
            threshold: 匹配阈值
            method: 匹配方法
            
        Returns:
            list: 匹配区域列表
        """
        result = cv2.matchTemplate(image, template, self.methods[method])
        locations = np.where(result >= threshold)
        
        regions = []
        h, w = template.shape[:2]
        
        for pt in zip(*locations[::-1]):
            regions.append(ImageRegion(
                x=int(pt[0]),
                y=int(pt[1]),
                width=w,
                height=h,
                confidence=float(result[pt[1], pt[0]])
            ))
        
        return self._remove_duplicates(regions)
    
    def _remove_duplicates(self, regions: List[ImageRegion], min_distance: int = 10) -> List[ImageRegion]:
        """
        去除重复区域
        
        Args:
            regions: 区域列表
            min_distance: 最小距离
            
        Returns:
            list: 去重后的区域列表
        """
        if not regions:
            return []
        
        unique = [regions[0]]
        
        for region in regions[1:]:
            is_duplicate = False
            for u in unique:
                if abs(region.x - u.x) < min_distance and abs(region.y - u.y) < min_distance:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique.append(region)
        
        return unique

class FeatureDetector:
    """
    特征检测器
    检测图像中的关键特征
    """
    def __init__(self):
        self.sift = cv2.SIFT_create()
        self.orb = cv2.ORB_create()
    
    def detect_keypoints(self, image: np.ndarray, method: str = "sift") -> Tuple:
        """
        检测关键点
        
        Args:
            image: 输入图像
            method: 检测方法 (sift/orb)
            
        Returns:
            tuple: (关键点列表, 描述符)
        """
        detector = self.sift if method == "sift" else self.orb
        return detector.detectAndCompute(image, None)
    
    def match_features(
        self, 
        desc1: np.ndarray, 
        desc2: np.ndarray,
        ratio: float = 0.75
    ) -> List:
        """
        匹配特征
        
        Args:
            desc1: 描述符1
            desc2: 描述符2
            ratio: 比例阈值
            
        Returns:
            list: 匹配结果
        """
        bf = cv2.BFMatcher()
        matches = bf.knnMatch(desc1, desc2, k=2)
        
        good_matches = []
        for m, n in matches:
            if m.distance < ratio * n.distance:
                good_matches.append(m)
        
        return good_matches
    
    def find_object(
        self, 
        image: np.ndarray, 
        template: np.ndarray
    ) -> ImageRegion:
        """
        查找对象位置
        
        Args:
            image: 目标图像
            template: 模板图像
            
        Returns:
            ImageRegion: 对象位置
        """
        kp1, desc1 = self.detect_keypoints(template)
        kp2, desc2 = self.detect_keypoints(image)
        
        matches = self.match_features(desc1, desc2)
        
        if len(matches) < 4:
            return None
        
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
        
        M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
        
        h, w = template.shape[:2]
        pts = np.float32([[0, 0], [0, h-1], [w-1, h-1], [w-1, 0]]).reshape(-1, 1, 2)
        dst = cv2.perspectiveTransform(pts, M)
        
        x, y, w, h = cv2.boundingRect(dst)
        
        return ImageRegion(x=x, y=y, width=w, height=h)
```

### OCR文字识别

```python
import pytesseract
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class TextRegion:
    """文本区域类"""
    text: str
    x: int
    y: int
    width: int
    height: int
    confidence: float

class OCREngine:
    """
    OCR引擎
    提供文字识别能力
    """
    def __init__(self, lang: str = "chi_sim+eng"):
        self.lang = lang
    
    def recognize_text(self, image: np.ndarray) -> str:
        """
        识别图像中的文字
        
        Args:
            image: 输入图像
            
        Returns:
            str: 识别的文字
        """
        return pytesseract.image_to_string(image, lang=self.lang)
    
    def recognize_with_boxes(self, image: np.ndarray) -> List[TextRegion]:
        """
        识别文字并返回位置
        
        Args:
            image: 输入图像
            
        Returns:
            list: 文本区域列表
        """
        data = pytesseract.image_to_data(image, lang=self.lang, output_type=pytesseract.Output.DICT)
        
        regions = []
        n_boxes = len(data['text'])
        
        for i in range(n_boxes):
            if int(data['conf'][i]) > 0:
                regions.append(TextRegion(
                    text=data['text'][i],
                    x=data['left'][i],
                    y=data['top'][i],
                    width=data['width'][i],
                    height=data['height'][i],
                    confidence=float(data['conf'][i]) / 100
                ))
        
        return regions
    
    def find_text(self, image: np.ndarray, target_text: str) -> List[TextRegion]:
        """
        查找指定文字
        
        Args:
            image: 输入图像
            target_text: 目标文字
            
        Returns:
            list: 匹配的文本区域列表
        """
        all_regions = self.recognize_with_boxes(image)
        
        return [
            region for region in all_regions 
            if target_text.lower() in region.text.lower()
        ]

class UIElementDetector:
    """
    UI元素检测器
    检测界面中的各种元素
    """
    def __init__(self):
        self.ocr = OCREngine()
        self.image_processor = ImageProcessor()
    
    def detect_buttons(self, image: np.ndarray) -> List[ImageRegion]:
        """
        检测按钮
        
        Args:
            image: 界面图像
            
        Returns:
            list: 按钮区域列表
        """
        gray = self.image_processor.convert_to_gray(image)
        edges = self.image_processor.detect_edges(gray)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        buttons = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # 按钮通常有一定的宽高比
            aspect_ratio = w / h
            if 2 < aspect_ratio < 10 and w > 50 and h > 20:
                buttons.append(ImageRegion(x=x, y=y, width=w, height=h))
        
        return buttons
    
    def detect_input_fields(self, image: np.ndarray) -> List[ImageRegion]:
        """
        检测输入框
        
        Args:
            image: 界面图像
            
        Returns:
            list: 输入框区域列表
        """
        gray = self.image_processor.convert_to_gray(image)
        edges = self.image_processor.detect_edges(gray)
        
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
        
        input_fields = []
        if lines is not None:
            horizontal_lines = [line for line in lines if abs(line[0][3] - line[0][1]) < 5]
            
            for i, line1 in enumerate(horizontal_lines):
                for line2 in horizontal_lines[i+1:]:
                    y1 = line1[0][1]
                    y2 = line2[0][1]
                    
                    if 20 < abs(y2 - y1) < 60:
                        x_min = min(line1[0][0], line2[0][0])
                        x_max = max(line1[0][2], line2[0][2])
                        
                        input_fields.append(ImageRegion(
                            x=x_min,
                            y=min(y1, y2),
                            width=x_max - x_min,
                            height=abs(y2 - y1)
                        ))
        
        return input_fields
    
    def detect_text_by_label(self, image: np.ndarray, label: str) -> List[TextRegion]:
        """
        根据标签查找文本
        
        Args:
            image: 界面图像
            label: 标签文字
            
        Returns:
            list: 文本区域列表
        """
        return self.ocr.find_text(image, label)
```

## 视觉回归测试

### 截图对比

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
import numpy as np

@dataclass
class DiffRegion:
    """差异区域类"""
    x: int
    y: int
    width: int
    height: int
    diff_percentage: float

class VisualRegressionTester:
    """
    视觉回归测试器
    对比截图差异
    """
    def __init__(self, threshold: float = 0.01):
        self.threshold = threshold
    
    def compare_images(
        self, 
        baseline: np.ndarray, 
        current: np.ndarray
    ) -> Dict:
        """
        对比两张图片
        
        Args:
            baseline: 基准图片
            current: 当前图片
            
        Returns:
            dict: 对比结果
        """
        if baseline.shape != current.shape:
            current = cv2.resize(current, (baseline.shape[1], baseline.shape[0]))
        
        diff = cv2.absdiff(baseline, current)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        
        _, diff_binary = cv2.threshold(diff_gray, 25, 255, cv2.THRESH_BINARY)
        
        diff_percentage = np.count_nonzero(diff_binary) / diff_binary.size
        
        diff_regions = self._find_diff_regions(diff_binary)
        
        return {
            "match": diff_percentage < self.threshold,
            "diff_percentage": diff_percentage,
            "diff_regions": diff_regions,
            "diff_image": self._highlight_diff(baseline, diff_regions)
        }
    
    def _find_diff_regions(self, diff_binary: np.ndarray) -> List[DiffRegion]:
        """
        查找差异区域
        
        Args:
            diff_binary: 二值差异图
            
        Returns:
            list: 差异区域列表
        """
        contours, _ = cv2.findContours(diff_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            total_area = diff_binary.shape[0] * diff_binary.shape[1]
            
            regions.append(DiffRegion(
                x=x,
                y=y,
                width=w,
                height=h,
                diff_percentage=area / total_area
            ))
        
        return regions
    
    def _highlight_diff(
        self, 
        image: np.ndarray, 
        regions: List[DiffRegion]
    ) -> np.ndarray:
        """
        高亮差异区域
        
        Args:
            image: 原始图像
            regions: 差异区域列表
            
        Returns:
            np.ndarray: 标记后的图像
        """
        result = image.copy()
        
        for region in regions:
            cv2.rectangle(
                result,
                (region.x, region.y),
                (region.x + region.width, region.y + region.height),
                (0, 0, 255),
                2
            )
        
        return result
    
    def compare_with_mask(
        self, 
        baseline: np.ndarray, 
        current: np.ndarray,
        mask: np.ndarray
    ) -> Dict:
        """
        带遮罩的对比
        
        Args:
            baseline: 基准图片
            current: 当前图片
            mask: 遮罩图像（白色区域忽略）
            
        Returns:
            dict: 对比结果
        """
        baseline_masked = cv2.bitwise_and(baseline, baseline, mask=cv2.bitwise_not(mask))
        current_masked = cv2.bitwise_and(current, current, mask=cv2.bitwise_not(mask))
        
        return self.compare_images(baseline_masked, current_masked)

class ScreenshotManager:
    """
    截图管理器
    管理基准截图和对比结果
    """
    def __init__(self, baseline_dir: str, result_dir: str):
        self.baseline_dir = baseline_dir
        self.result_dir = result_dir
    
    def save_baseline(self, name: str, image: np.ndarray):
        """
        保存基准截图
        
        Args:
            name: 截图名称
            image: 截图图像
        """
        path = f"{self.baseline_dir}/{name}.png"
        cv2.imwrite(path, image)
    
    def load_baseline(self, name: str) -> np.ndarray:
        """
        加载基准截图
        
        Args:
            name: 截图名称
            
        Returns:
            np.ndarray: 截图图像
        """
        path = f"{self.baseline_dir}/{name}.png"
        return cv2.imread(path)
    
    def save_comparison_result(self, name: str, result: Dict):
        """
        保存对比结果
        
        Args:
            name: 结果名称
            result: 对比结果
        """
        import json
        
        result_path = f"{self.result_dir}/{name}_result.json"
        with open(result_path, 'w') as f:
            json.dump({
                "match": result["match"],
                "diff_percentage": result["diff_percentage"],
                "diff_regions": [
                    {"x": r.x, "y": r.y, "width": r.width, "height": r.height}
                    for r in result["diff_regions"]
                ]
            }, f, indent=2)
        
        diff_image_path = f"{self.result_dir}/{name}_diff.png"
        cv2.imwrite(diff_image_path, result["diff_image"])
```

### 响应式布局验证

```python
from typing import List, Dict, Tuple

class ResponsiveLayoutValidator:
    """
    响应式布局验证器
    验证不同屏幕尺寸下的布局
    """
    def __init__(self):
        self.breakpoints = [
            {"name": "mobile", "width": 375, "height": 667},
            {"name": "tablet", "width": 768, "height": 1024},
            {"name": "desktop", "width": 1920, "height": 1080},
            {"name": "large", "width": 2560, "height": 1440}
        ]
    
    def validate_all_breakpoints(
        self, 
        page_url: str, 
        elements: List[Dict]
    ) -> Dict:
        """
        验证所有断点
        
        Args:
            page_url: 页面URL
            elements: 需要验证的元素列表
            
        Returns:
            dict: 验证结果
        """
        results = {}
        
        for breakpoint in self.breakpoints:
            results[breakpoint["name"]] = self._validate_breakpoint(
                page_url, 
                breakpoint, 
                elements
            )
        
        return results
    
    def _validate_breakpoint(
        self, 
        url: str, 
        breakpoint: Dict, 
        elements: List[Dict]
    ) -> Dict:
        """
        验证单个断点
        
        Args:
            url: 页面URL
            breakpoint: 断点配置
            elements: 元素列表
            
        Returns:
            dict: 验证结果
        """
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(
                viewport={"width": breakpoint["width"], "height": breakpoint["height"]}
            )
            
            page.goto(url)
            
            issues = []
            
            for element in elements:
                locator = page.locator(element["selector"])
                
                if locator.count() == 0:
                    issues.append({
                        "element": element["name"],
                        "issue": "元素不存在"
                    })
                    continue
                
                box = locator.bounding_box()
                
                if box is None:
                    issues.append({
                        "element": element["name"],
                        "issue": "元素不可见"
                    })
                    continue
                
                if box["x"] < 0 or box["y"] < 0:
                    issues.append({
                        "element": element["name"],
                        "issue": "元素超出屏幕边界"
                    })
                
                if box["x"] + box["width"] > breakpoint["width"]:
                    issues.append({
                        "element": element["name"],
                        "issue": "元素超出屏幕宽度"
                    })
            
            browser.close()
        
        return {
            "breakpoint": breakpoint["name"],
            "viewport": breakpoint,
            "issues": issues,
            "passed": len(issues) == 0
        }

class CrossBrowserValidator:
    """
    跨浏览器验证器
    验证不同浏览器下的一致性
    """
    def __init__(self):
        self.browsers = ["chromium", "firefox", "webkit"]
    
    def validate_cross_browser(
        self, 
        url: str, 
        screenshot_name: str
    ) -> Dict:
        """
        跨浏览器验证
        
        Args:
            url: 页面URL
            screenshot_name: 截图名称
            
        Returns:
            dict: 验证结果
        """
        from playwright.sync_api import sync_playwright
        
        screenshots = {}
        
        with sync_playwright() as p:
            for browser_type in self.browsers:
                browser = getattr(p, browser_type).launch()
                page = browser.new_page()
                page.goto(url)
                
                screenshot_path = f"{screenshot_name}_{browser_type}.png"
                page.screenshot(path=screenshot_path)
                
                screenshots[browser_type] = cv2.imread(screenshot_path)
                
                browser.close()
        
        # 对比不同浏览器的截图
        comparison_results = {}
        tester = VisualRegressionTester(threshold=0.05)
        
        baseline = screenshots["chromium"]
        for browser_type, screenshot in screenshots.items():
            if browser_type != "chromium":
                comparison_results[f"chromium_vs_{browser_type}"] = tester.compare_images(
                    baseline, screenshot
                )
        
        return {
            "screenshots": screenshots,
            "comparisons": comparison_results
        }
```

## 最佳实践

### 1. 视觉测试策略

| 测试类型 | 适用场景 | 工具推荐 |
|---------|---------|---------|
| 像素级对比 | 精确UI验证 | Percy、Applitools |
| 感知对比 | 容忍细微差异 | 自研方案 |
| AI视觉验证 | 智能识别差异 | VLM模型 |
| OCR验证 | 文字内容验证 | Tesseract |

### 2. 截图管理

- 建立基准截图库
- 定期更新基准
- 版本化管理
- 自动化对比流程

### 3. 差异处理

- 设置合理阈值
- 忽略动态区域
- 人工审核机制
- 自动更新基准

## 相关资源

- [计算机视觉基础](/vision-physical/cv/) - 图像处理、特征检测、OCR识别
