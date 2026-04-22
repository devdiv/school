# 深度学习目标检测

基于深度学习的目标检测技术实践。

## YOLO模型选型、训练与部署

YOLO系列模型实践指南。

- YOLOv5：平衡性能与速度
- YOLOv8：最新架构优化
- YOLOv10：实时检测新突破
- 模型训练与调优
- 部署与推理优化

### YOLO模型封装

```python
from typing import List, Dict, Tuple, Optional
import numpy as np
import cv2
from dataclasses import dataclass

@dataclass
class DetectionResult:
    """检测结果"""
    class_id: int
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x, y, w, h
    center: Tuple[float, float]

class YOLODetector:
    """
    YOLO目标检测器
    支持多版本YOLO模型的统一接口
    """
    def __init__(self, model_path: str, 
                 class_names: List[str] = None,
                 input_size: Tuple[int, int] = (640, 640),
                 conf_threshold: float = 0.5,
                 nms_threshold: float = 0.45):
        """
        初始化检测器
        
        Args:
            model_path: 模型文件路径
            class_names: 类别名称列表
            input_size: 输入尺寸
            conf_threshold: 置信度阈值
            nms_threshold: NMS阈值
        """
        self.model_path = model_path
        self.class_names = class_names or []
        self.input_size = input_size
        self.conf_threshold = conf_threshold
        self.nms_threshold = nms_threshold
        self.model = None
        
        self._load_model()
    
    def _load_model(self):
        """加载模型"""
        try:
            import onnxruntime as ort
            self.session = ort.InferenceSession(self.model_path)
            self.input_name = self.session.get_inputs()[0].name
            self.model_type = "onnx"
        except ImportError:
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                self.model_type = "ultralytics"
            except ImportError:
                raise RuntimeError("需要安装 onnxruntime 或 ultralytics")
    
    def preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        预处理图像
        
        Args:
            image: 输入图像
            
        Returns:
            ndarray: 预处理后的图像
        """
        # 调整尺寸
        resized = cv2.resize(image, self.input_size)
        
        # 归一化
        normalized = resized.astype(np.float32) / 255.0
        
        # 通道转换 BGR -> RGB
        rgb = cv2.cvtColor(normalized, cv2.COLOR_BGR2RGB)
        
        # 添加batch维度
        input_tensor = np.transpose(rgb, (2, 0, 1))
        input_tensor = np.expand_dims(input_tensor, axis=0)
        
        return input_tensor
    
    def detect(self, image: np.ndarray) -> List[DetectionResult]:
        """
        执行检测
        
        Args:
            image: 输入图像
            
        Returns:
            list: 检测结果列表
        """
        if self.model_type == "ultralytics":
            return self._detect_ultralytics(image)
        else:
            return self._detect_onnx(image)
    
    def _detect_ultralytics(self, image: np.ndarray) -> List[DetectionResult]:
        """使用ultralytics检测"""
        results = self.model(image, conf=self.conf_threshold, 
                           iou=self.nms_threshold)[0]
        
        detections = []
        orig_h, orig_w = image.shape[:2]
        
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            detections.append(DetectionResult(
                class_id=cls_id,
                class_name=self.class_names[cls_id] if cls_id < len(self.class_names) else f"class_{cls_id}",
                confidence=conf,
                bbox=(int(x1), int(y1), int(x2-x1), int(y2-y1)),
                center=((x1+x2)/2, (y1+y2)/2)
            ))
        
        return detections
    
    def _detect_onnx(self, image: np.ndarray) -> List[DetectionResult]:
        """使用ONNX检测"""
        input_tensor = self.preprocess(image)
        outputs = self.session.run(None, {self.input_name: input_tensor})
        
        # 解析输出（YOLOv5/v8格式）
        predictions = outputs[0][0]  # [num_predictions, num_classes+5]
        
        detections = []
        orig_h, orig_w = image.shape[:2]
        
        for pred in predictions.T:
            conf = pred[4]
            if conf < self.conf_threshold:
                continue
            
            cls_scores = pred[5:]
            cls_id = np.argmax(cls_scores)
            cls_conf = cls_scores[cls_id] * conf
            
            if cls_conf < self.conf_threshold:
                continue
            
            cx, cy, w, h = pred[:4]
            x1 = int((cx - w/2) * orig_w / self.input_size[0])
            y1 = int((cy - h/2) * orig_h / self.input_size[1])
            x2 = int((cx + w/2) * orig_w / self.input_size[0])
            y2 = int((cy + h/2) * orig_h / self.input_size[1])
            
            detections.append(DetectionResult(
                class_id=int(cls_id),
                class_name=self.class_names[int(cls_id)] if int(cls_id) < len(self.class_names) else f"class_{int(cls_id)}",
                confidence=float(cls_conf),
                bbox=(x1, y1, x2-x1, y2-y1),
                center=(cx, cy)
            ))
        
        # NMS
        if detections:
            boxes = np.array([[d.bbox[0], d.bbox[1], d.bbox[0]+d.bbox[2], d.bbox[1]+d.bbox[3]] for d in detections])
            scores = np.array([d.confidence for d in detections])
            indices = cv2.dnn.NMSBoxes(boxes.tolist(), scores.tolist(), 
                                      self.conf_threshold, self.nms_threshold)
            
            if len(indices) > 0:
                detections = [detections[i] for i in indices.flatten()]
        
        return detections
    
    def draw_detections(self, image: np.ndarray,
                       detections: List[DetectionResult],
                       color_map: Dict[int, Tuple[int, int, int]] = None) -> np.ndarray:
        """
        绘制检测结果
        
        Args:
            image: 原始图像
            detections: 检测结果
            color_map: 颜色映射
            
        Returns:
            ndarray: 绘制后的图像
        """
        result = image.copy()
        
        if color_map is None:
            np.random.seed(42)
            color_map = {i: tuple(map(int, np.random.randint(0, 255, 3))) 
                        for i in range(80)}
        
        for det in detections:
            x, y, w, h = det.bbox
            color = color_map.get(det.class_id, (0, 255, 0))
            
            cv2.rectangle(result, (x, y), (x+w, y+h), color, 2)
            
            label = f"{det.class_name}: {det.confidence:.2f}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(result, (x, y-th-10), (x+tw, y), color, -1)
            cv2.putText(result, label, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.6, (255, 255, 255), 1)
        
        return result
```

## 数据集构建

高质量数据集构建方法。

- UI控件标注
- 物理按键标注
- 数据增强策略
- 标注工具与流程

### 数据集管理

```python
import json
import os
from pathlib import Path
from typing import List, Dict
import shutil

class DatasetManager:
    """
    数据集管理器
    管理目标检测数据集的构建和维护
    """
    def __init__(self, dataset_path: str):
        """
        初始化管理器
        
        Args:
            dataset_path: 数据集根目录
        """
        self.dataset_path = Path(dataset_path)
        self.images_dir = self.dataset_path / "images"
        self.labels_dir = self.dataset_path / "labels"
        
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.labels_dir.mkdir(parents=True, exist_ok=True)
    
    def add_image(self, image: np.ndarray, image_id: str,
                  annotations: List[Dict] = None):
        """
        添加图像和标注
        
        Args:
            image: 图像数据
            image_id: 图像ID
            annotations: 标注列表 [{class_id, x, y, width, height}]
        """
        # 保存图像
        image_path = self.images_dir / f"{image_id}.jpg"
        cv2.imwrite(str(image_path), image)
        
        # 保存标注
        if annotations:
            label_path = self.labels_dir / f"{image_id}.txt"
            with open(label_path, 'w') as f:
                for ann in annotations:
                    f.write(f"{ann['class_id']} {ann['x']} {ann['y']} "
                           f"{ann['width']} {ann['height']}\n")
    
    def export_coco_format(self, output_path: str,
                          categories: List[Dict] = None):
        """
        导出COCO格式
        
        Args:
            output_path: 输出路径
            categories: 类别定义
        """
        coco_data = {
            "images": [],
            "annotations": [],
            "categories": categories or []
        }
        
        ann_id = 0
        for img_file in sorted(self.images_dir.glob("*.jpg")):
            img_id = img_file.stem
            img = cv2.imread(str(img_file))
            h, w = img.shape[:2]
            
            coco_data["images"].append({
                "id": img_id,
                "file_name": img_file.name,
                "height": h,
                "width": w
            })
            
            label_file = self.labels_dir / f"{img_id}.txt"
            if label_file.exists():
                with open(label_file) as f:
                    for line in f:
                        parts = line.strip().split()
                        cls_id = int(parts[0])
                        cx, cy, bw, bh = map(float, parts[1:])
                        
                        x = (cx - bw/2) * w
                        y = (cy - bh/2) * h
                        width = bw * w
                        height = bh * h
                        
                        coco_data["annotations"].append({
                            "id": ann_id,
                            "image_id": img_id,
                            "category_id": cls_id,
                            "bbox": [x, y, width, height],
                            "area": width * height,
                            "iscrowd": 0
                        })
                        ann_id += 1
        
        with open(output_path, 'w') as f:
            json.dump(coco_data, f, indent=2)
    
    def split_dataset(self, train_ratio: float = 0.8,
                     val_ratio: float = 0.1):
        """
        划分训练/验证/测试集
        
        Args:
            train_ratio: 训练集比例
            val_ratio: 验证集比例
        """
        import random
        
        all_images = list(self.images_dir.glob("*.jpg"))
        random.shuffle(all_images)
        
        n = len(all_images)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))
        
        splits = {
            "train": all_images[:train_end],
            "val": all_images[train_end:val_end],
            "test": all_images[val_end:]
        }
        
        for split_name, images in splits.items():
            split_dir = self.dataset_path / split_name
            split_dir.mkdir(exist_ok=True)
            
            with open(split_dir / "images.txt", 'w') as f:
                for img in images:
                    f.write(f"{img.name}\n")

class DataAugmentor:
    """
    数据增强器
    扩充训练数据集
    """
    def __init__(self):
        self.augmentations = []
    
    def random_flip(self, image: np.ndarray,
                   annotations: List[Dict],
                   horizontal: bool = True) -> Tuple[np.ndarray, List[Dict]]:
        """
        随机翻转
        
        Args:
            image: 图像
            annotations: 标注
            horizontal: 是否水平翻转
            
        Returns:
            tuple: (翻转后的图像, 更新后的标注)
        """
        h, w = image.shape[:2]
        
        if horizontal:
            flipped = cv2.flip(image, 1)
            for ann in annotations:
                ann["x"] = 1.0 - ann["x"]
        else:
            flipped = cv2.flip(image, 0)
            for ann in annotations:
                ann["y"] = 1.0 - ann["y"]
        
        return flipped, annotations
    
    def random_rotate(self, image: np.ndarray,
                     annotations: List[Dict],
                     angle_range: Tuple[float, float] = (-15, 15)) -> Tuple[np.ndarray, List[Dict]]:
        """
        随机旋转
        
        Args:
            image: 图像
            annotations: 标注
            angle_range: 角度范围
            
        Returns:
            tuple: (旋转后的图像, 更新后的标注)
        """
        angle = np.random.uniform(*angle_range)
        h, w = image.shape[:2]
        center = (w / 2, h / 2)
        
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h))
        
        return rotated, annotations
    
    def random_brightness(self, image: np.ndarray,
                         delta: float = 0.2) -> np.ndarray:
        """
        随机亮度调整
        
        Args:
            image: 图像
            delta: 亮度变化范围
            
        Returns:
            ndarray: 调整后的图像
        """
        factor = 1.0 + np.random.uniform(-delta, delta)
        adjusted = np.clip(image * factor, 0, 255).astype(np.uint8)
        return adjusted
```

## 模型轻量化

模型部署优化技术。

- ONNX格式转换
- TensorRT推理加速
- 模型量化
- 边缘设备部署

### 模型优化

```python
class ModelOptimizer:
    """
    模型优化器
    实现模型转换和加速
    """
    def __init__(self, model_path: str):
        """
        初始化优化器
        
        Args:
            model_path: 模型路径
        """
        self.model_path = model_path
    
    def convert_to_onnx(self, output_path: str,
                       input_shape: Tuple[int, ...] = (1, 3, 640, 640)):
        """
        转换为ONNX格式
        
        Args:
            output_path: 输出路径
            input_shape: 输入形状
        """
        from ultralytics import YOLO
        
        model = YOLO(self.model_path)
        model.export(format="onnx", dynamic=True, simplify=True)
    
    def quantize_model(self, output_path: str,
                      calibration_images: List[str] = None):
        """
        模型量化
        
        Args:
            output_path: 输出路径
            calibration_images: 校准图像列表
        """
        import onnx
        from onnxruntime.quantization import quantize_dynamic, QuantType
        
        quantize_dynamic(
            self.model_path,
            output_path,
            weight_type=QuantType.QInt8
        )
    
    def benchmark(self, image: np.ndarray,
                 iterations: int = 100) -> Dict:
        """
        性能基准测试
        
        Args:
            image: 测试图像
            iterations: 迭代次数
            
        Returns:
            dict: 性能指标
        """
        import time
        
        detector = YOLODetector(self.model_path)
        
        # 预热
        for _ in range(10):
            detector.detect(image)
        
        # 测试
        times = []
        for _ in range(iterations):
            start = time.time()
            detector.detect(image)
            times.append(time.time() - start)
        
        return {
            "avg_latency_ms": np.mean(times) * 1000,
            "p50_latency_ms": np.percentile(times, 50) * 1000,
            "p95_latency_ms": np.percentile(times, 95) * 1000,
            "p99_latency_ms": np.percentile(times, 99) * 1000,
            "throughput_fps": 1.0 / np.mean(times)
        }
```

## 最佳实践

1. **数据质量**：高质量标注数据胜过复杂模型
2. **模型选择**：根据场景选择速度和精度的平衡
3. **持续训练**：定期用新数据更新模型
4. **多尺度检测**：不同尺寸目标使用不同策略
5. **后处理优化**：NMS和过滤策略调优
