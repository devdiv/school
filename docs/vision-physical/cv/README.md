# 图像处理与计算机视觉

OpenCV实战与图像处理技术。

## OpenCV实战

计算机视觉核心技术实践。

- 特征提取：SIFT/ORB特征点检测
- 模板匹配：图像匹配与定位
- 边缘检测：Canny/Sobel边缘提取
- 轮廓检测：形状识别与分析

### 核心图像处理操作

```python
import cv2
import numpy as np
from typing import Tuple, List, Dict, Optional
from dataclasses import dataclass

@dataclass
class ImageFeature:
    """图像特征点"""
    x: float
    y: float
    descriptor: np.ndarray
    response: float

class ImageProcessor:
    """
    图像处理器
    封装常用图像处理操作
    """
    def __init__(self):
        self.sift = cv2.SIFT_create()
        self.orb = cv2.ORB_create(nfeatures=500)
    
    def load_image(self, path: str, grayscale: bool = False) -> np.ndarray:
        """
        加载图像
        
        Args:
            path: 图像路径
            grayscale: 是否转为灰度
            
        Returns:
            ndarray: 图像数组
        """
        if grayscale:
            return cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        return cv2.imread(path)
    
    def detect_features_sift(self, image: np.ndarray) -> Tuple[List, np.ndarray]:
        """
        SIFT特征检测
        
        Args:
            image: 输入图像
            
        Returns:
            tuple: (关键点列表, 描述符)
        """
        keypoints, descriptors = self.sift.detectAndCompute(image, None)
        return keypoints, descriptors
    
    def detect_features_orb(self, image: np.ndarray) -> Tuple[List, np.ndarray]:
        """
        ORB特征检测
        
        Args:
            image: 输入图像
            
        Returns:
            tuple: (关键点列表, 描述符)
        """
        keypoints, descriptors = self.orb.detectAndCompute(image, None)
        return keypoints, descriptors
    
    def match_features(self, desc1: np.ndarray, desc2: np.ndarray,
                      ratio_threshold: float = 0.75) -> List:
        """
        特征匹配
        
        Args:
            desc1: 第一幅图像描述符
            desc2: 第二幅图像描述符
            ratio_threshold: 比率阈值
            
        Returns:
            list: 匹配结果
        """
        bf = cv2.BFMatcher()
        matches = bf.knnMatch(desc1, desc2, k=2)
        
        good_matches = []
        for m, n in matches:
            if m.distance < ratio_threshold * n.distance:
                good_matches.append(m)
        
        return good_matches
    
    def template_match(self, source: np.ndarray, template: np.ndarray,
                      method: int = cv2.TM_CCOEFF_NORMED,
                      threshold: float = 0.8) -> List[Dict]:
        """
        模板匹配
        
        Args:
            source: 源图像
            template: 模板图像
            method: 匹配方法
            threshold: 匹配阈值
            
        Returns:
            list: 匹配位置列表
        """
        result = cv2.matchTemplate(source, template, method)
        locations = np.where(result >= threshold)
        
        matches = []
        h, w = template.shape[:2]
        for pt in zip(*locations[::-1]):
            matches.append({
                "x": int(pt[0]),
                "y": int(pt[1]),
                "width": w,
                "height": h,
                "confidence": float(result[pt[1], pt[0]])
            })
        
        return matches
    
    def detect_edges(self, image: np.ndarray,
                    low_threshold: int = 50,
                    high_threshold: int = 150) -> np.ndarray:
        """
        Canny边缘检测
        
        Args:
            image: 输入图像
            low_threshold: 低阈值
            high_threshold: 高阈值
            
        Returns:
            ndarray: 边缘图像
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        edges = cv2.Canny(gray, low_threshold, high_threshold)
        return edges
    
    def detect_contours(self, image: np.ndarray,
                       min_area: int = 100) -> List[Dict]:
        """
        轮廓检测
        
        Args:
            image: 输入图像
            min_area: 最小面积
            
        Returns:
            list: 轮廓信息列表
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        results = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < min_area:
                continue
            
            x, y, w, h = cv2.boundingRect(contour)
            results.append({
                "x": x,
                "y": y,
                "width": w,
                "height": h,
                "area": area,
                "contour": contour
            })
        
        return results
    
    def find_homography(self, kp1: List, kp2: List,
                       matches: List) -> Optional[np.ndarray]:
        """
        计算单应性矩阵
        
        Args:
            kp1: 第一幅图关键点
            kp2: 第二幅图关键点
            matches: 匹配结果
            
        Returns:
            ndarray: 单应性矩阵
        """
        if len(matches) < 4:
            return None
        
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
        
        H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
        return H
```

## 图像预处理

提升图像质量的预处理技术。

- 去噪处理
- 对比度增强
- 图像归一化
- 几何变换

### 预处理流水线

```python
class ImagePreprocessor:
    """
    图像预处理器
    提供测试场景下的图像优化
    """
    def __init__(self):
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    def denoise(self, image: np.ndarray,
               strength: int = 10) -> np.ndarray:
        """
        图像去噪
        
        Args:
            image: 输入图像
            strength: 去噪强度
            
        Returns:
            ndarray: 去噪后的图像
        """
        if len(image.shape) == 3:
            return cv2.fastNlMeansDenoisingColored(image, None, strength, strength, 7, 21)
        return cv2.fastNlMeansDenoising(image, None, strength, 7, 21)
    
    def enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """
        对比度增强
        
        Args:
            image: 输入图像
            
        Returns:
            ndarray: 增强后的图像
        """
        if len(image.shape) == 3:
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            l = self.clahe.apply(l)
            enhanced = cv2.merge([l, a, b])
            return cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        return self.clahe.apply(image)
    
    def normalize(self, image: np.ndarray,
                 target_size: Tuple[int, int] = None) -> np.ndarray:
        """
        图像归一化
        
        Args:
            image: 输入图像
            target_size: 目标尺寸
            
        Returns:
            ndarray: 归一化后的图像
        """
        if target_size:
            image = cv2.resize(image, target_size)
        
        normalized = image.astype(np.float32) / 255.0
        return normalized
    
    def geometric_transform(self, image: np.ndarray,
                           scale: float = 1.0,
                           rotation: float = 0.0,
                           translation: Tuple[float, float] = (0, 0)) -> np.ndarray:
        """
        几何变换
        
        Args:
            image: 输入图像
            scale: 缩放比例
            rotation: 旋转角度（度）
            translation: 平移量
            
        Returns:
            ndarray: 变换后的图像
        """
        h, w = image.shape[:2]
        center = (w / 2, h / 2)
        
        M = cv2.getRotationMatrix2D(center, rotation, scale)
        M[0, 2] += translation[0]
        M[1, 2] += translation[1]
        
        return cv2.warpAffine(image, M, (w, h))
    
    def preprocess_pipeline(self, image: np.ndarray,
                           config: Dict = None) -> np.ndarray:
        """
        预处理流水线
        
        Args:
            image: 输入图像
            config: 配置参数
            
        Returns:
            ndarray: 处理后的图像
        """
        if config is None:
            config = {
                "denoise": True,
                "enhance_contrast": True,
                "normalize": True
            }
        
        result = image.copy()
        
        if config.get("denoise"):
            result = self.denoise(result)
        
        if config.get("enhance_contrast"):
            result = self.enhance_contrast(result)
        
        if config.get("normalize"):
            result = self.normalize(result)
        
        return result
```

## 抗干扰处理

应对复杂环境的图像处理。

- 光照变化处理
- 遮挡处理
- 模糊恢复
- 背景分离

### 抗干扰技术

```python
class AntiInterferenceProcessor:
    """
    抗干扰处理器
    处理复杂环境下的图像质量问题
    """
    def __init__(self):
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2()
    
    def handle_lighting_variation(self, image: np.ndarray) -> np.ndarray:
        """
        处理光照变化
        
        Args:
            image: 输入图像
            
        Returns:
            ndarray: 处理后的图像
        """
        # 使用直方图均衡化
        if len(image.shape) == 3:
            ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
            ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
            return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
        return cv2.equalizeHist(image)
    
    def handle_occlusion(self, image: np.ndarray,
                        template_mask: np.ndarray = None) -> Dict:
        """
        处理遮挡情况
        
        Args:
            image: 输入图像
            template_mask: 模板掩码
            
        Returns:
            dict: 处理结果
        """
        # 使用 inpainting 修复遮挡区域
        if template_mask is not None:
            mask = cv2.bitwise_not(template_mask)
            restored = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
            return {"restored": restored, "mask": mask}
        
        return {"original": image}
    
    def deblur(self, image: np.ndarray,
              kernel_size: int = 15,
              sigma: float = 3.0) -> np.ndarray:
        """
        模糊恢复
        
        Args:
            image: 模糊图像
            kernel_size: 核大小
            sigma: 高斯核标准差
            
        Returns:
            ndarray: 恢复后的图像
        """
        # 维纳滤波简化版
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # 估计模糊核
        kernel = np.zeros((kernel_size, kernel_size))
        kernel[kernel_size // 2, kernel_size // 2] = 1
        kernel = cv2.GaussianBlur(kernel, (kernel_size, kernel_size), sigma)
        
        # 频域去模糊
        kernel_fft = np.fft.fft2(kernel, s=gray.shape)
        image_fft = np.fft.fft2(gray)
        
        # 维纳滤波
        K = 0.01
        deblurred_fft = image_fft * np.conj(kernel_fft) / (np.abs(kernel_fft) ** 2 + K)
        deblurred = np.abs(np.fft.ifft2(deblurred_fft))
        
        return np.uint8(np.clip(deblurred, 0, 255))
    
    def background_separation(self, image: np.ndarray,
                             method: str = "grabcut") -> Dict:
        """
        背景分离
        
        Args:
            image: 输入图像
            method: 分离方法
            
        Returns:
            dict: 分离结果
        """
        if method == "grabcut":
            mask = np.zeros(image.shape[:2], np.uint8)
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            
            h, w = image.shape[:2]
            rect = (10, 10, w - 20, h - 20)
            
            cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            foreground = image * mask2[:, :, np.newaxis]
            
            return {
                "foreground": foreground,
                "mask": mask2
            }
        
        elif method == "mog2":
            fg_mask = self.bg_subtractor.apply(image)
            foreground = cv2.bitwise_and(image, image, mask=fg_mask)
            
            return {
                "foreground": foreground,
                "mask": fg_mask
            }
        
        return {"original": image}
```

## 视觉回归测试

```python
class VisualRegressionTester:
    """
    视觉回归测试器
    检测UI视觉变化
    """
    def __init__(self, threshold: float = 0.95):
        """
        初始化测试器
        
        Args:
            threshold: 相似度阈值
        """
        self.threshold = threshold
    
    def compare_images(self, baseline: np.ndarray,
                      current: np.ndarray) -> Dict:
        """
        比较两幅图像
        
        Args:
            baseline: 基线图像
            current: 当前图像
            
        Returns:
            dict: 比较结果
        """
        # 确保尺寸一致
        if baseline.shape != current.shape:
            current = cv2.resize(current, (baseline.shape[1], baseline.shape[0]))
        
        # 计算结构相似性
        from skimage.metrics import structural_similarity as ssim
        gray_baseline = cv2.cvtColor(baseline, cv2.COLOR_BGR2GRAY)
        gray_current = cv2.cvtColor(current, cv2.COLOR_BGR2GRAY)
        
        similarity = ssim(gray_baseline, gray_current)
        
        # 生成差异图
        diff = cv2.absdiff(baseline, current)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        _, diff_mask = cv2.threshold(diff_gray, 30, 255, cv2.THRESH_BINARY)
        
        # 高亮差异
        highlighted = baseline.copy()
        highlighted[diff_mask > 0] = [0, 0, 255]
        
        return {
            "similarity": similarity,
            "passed": similarity >= self.threshold,
            "diff_image": diff,
            "highlighted": highlighted,
            "diff_mask": diff_mask
        }
    
    def compare_regions(self, baseline: np.ndarray,
                       current: np.ndarray,
                       regions: List[Dict]) -> Dict:
        """
        比较指定区域
        
        Args:
            baseline: 基线图像
            current: 当前图像
            regions: 区域列表 [{x, y, width, height, name}]
            
        Returns:
            dict: 各区域比较结果
        """
        results = {}
        
        for region in regions:
            x, y = region["x"], region["y"]
            w, h = region["width"], region["height"]
            name = region.get("name", f"region_{x}_{y}")
            
            baseline_roi = baseline[y:y+h, x:x+w]
            current_roi = current[y:y+h, x:x+w]
            
            result = self.compare_images(baseline_roi, current_roi)
            results[name] = result
        
        return results
```

## 最佳实践

1. **预处理选择**：根据场景选择合适的预处理方法
2. **参数调优**：针对具体场景调整算法参数
3. **多尺度处理**：不同分辨率下分别处理
4. **特征组合**：结合多种特征提高鲁棒性
5. **性能优化**：使用GPU加速大规模处理
