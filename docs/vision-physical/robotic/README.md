# 物理机械手集成与交互

视觉与机械手协同的物理世界交互测试。

## 机械手路径规划与坐标标定

机械手控制基础技术。

- 手眼协调标定
- 路径规划算法
- 运动学建模
- 碰撞检测与避障

### 机械手控制封装

```python
from typing import Tuple, List, Dict, Optional
import numpy as np
from dataclasses import dataclass

@dataclass
class Pose:
    """机械手位姿"""
    x: float
    y: float
    z: float
    rx: float = 0.0  # 绕X轴旋转
    ry: float = 0.0  # 绕Y轴旋转
    rz: float = 0.0  # 绕Z轴旋转
    
    def to_array(self) -> np.ndarray:
        """转换为数组"""
        return np.array([self.x, self.y, self.z, self.rx, self.ry, self.rz])

class RobotArmController:
    """
    机械手控制器
    封装机械手的基本运动控制
    """
    def __init__(self, ip: str = "192.168.1.100", port: int = 30002):
        """
        初始化控制器
        
        Args:
            ip: 机械手IP地址
            port: 控制端口
        """
        self.ip = ip
        self.port = port
        self.connected = False
        self.current_pose = None
    
    def connect(self) -> bool:
        """
        连接机械手
        
        Returns:
            bool: 是否连接成功
        """
        # 实际实现需要调用机械手SDK
        self.connected = True
        return True
    
    def disconnect(self):
        """断开连接"""
        self.connected = False
    
    def get_current_pose(self) -> Pose:
        """
        获取当前位姿
        
        Returns:
            Pose: 当前位姿
        """
        # 实际实现需要从机械手读取
        return Pose(0, 0, 0, 0, 0, 0)
    
    def move_to_pose(self, pose: Pose,
                    speed: float = 0.5,
                    acceleration: float = 0.5,
                    wait: bool = True) -> bool:
        """
        移动到指定位姿
        
        Args:
            pose: 目标位姿
            speed: 速度比例
            acceleration: 加速度比例
            wait: 是否等待完成
            
        Returns:
            bool: 是否成功
        """
        if not self.connected:
            raise RuntimeError("机械手未连接")
        
        # 实际实现需要发送运动指令
        self.current_pose = pose
        return True
    
    def move_linear(self, target: Pose,
                   speed: float = 0.1,
                   wait: bool = True) -> bool:
        """
        直线运动
        
        Args:
            target: 目标位姿
            speed: 线速度（m/s）
            wait: 是否等待完成
            
        Returns:
            bool: 是否成功
        """
        return self.move_to_pose(target, speed, wait=wait)
    
    def move_joint(self, joint_angles: List[float],
                  speed: float = 0.5,
                  wait: bool = True) -> bool:
        """
        关节运动
        
        Args:
            joint_angles: 关节角度列表
            speed: 速度比例
            wait: 是否等待完成
            
        Returns:
            bool: 是否成功
        """
        # 实际实现需要逆运动学转换
        return True
    
    def gripper_open(self, width: float = 0.08):
        """
        打开夹爪
        
        Args:
            width: 开口宽度
        """
        pass
    
    def gripper_close(self, force: float = 50.0):
        """
        关闭夹爪
        
        Args:
            force: 夹持力
        """
        pass
    
    def stop(self):
        """紧急停止"""
        pass

class HandEyeCalibration:
    """
    手眼标定
    计算相机坐标系到机械手坐标系的变换
    """
    def __init__(self):
        self.R_camera_to_gripper = None
        self.t_camera_to_gripper = None
    
    def calibrate(self,
                 robot_poses: List[Pose],
                 camera_poses: List[np.ndarray]) -> Dict:
        """
        执行手眼标定
        
        Args:
            robot_poses: 机械手位姿列表
            camera_poses: 相机检测到的标定板位姿列表
            
        Returns:
            dict: 标定结果
        """
        # 使用Tsai-Lenz或AX=XB方法
        # 这里展示简化版
        
        n = len(robot_poses)
        if n < 3:
            raise ValueError("至少需要3组位姿")
        
        # 构建方程组
        A = []
        B = []
        
        for i in range(n - 1):
            # 计算相邻位姿的变换
            H_robot_i = self._pose_to_matrix(robot_poses[i])
            H_robot_j = self._pose_to_matrix(robot_poses[i + 1])
            H_camera_i = camera_poses[i]
            H_camera_j = camera_poses[i + 1]
            
            A_i = np.linalg.inv(H_robot_j) @ H_robot_i
            B_i = H_camera_j @ np.linalg.inv(H_camera_i)
            
            A.append(A_i)
            B.append(B_i)
        
        # 求解AX=XB
        # 实际实现需要使用专门的标定算法
        
        return {
            "R": self.R_camera_to_gripper,
            "t": self.t_camera_to_gripper,
            "error": 0.0
        }
    
    def _pose_to_matrix(self, pose: Pose) -> np.ndarray:
        """
        位姿转变换矩阵
        
        Args:
            pose: 位姿
            
        Returns:
            ndarray: 4x4变换矩阵
        """
        # 简化实现
        T = np.eye(4)
        T[0, 3] = pose.x
        T[1, 3] = pose.y
        T[2, 3] = pose.z
        return T
    
    def camera_to_robot(self, camera_point: np.ndarray) -> np.ndarray:
        """
        相机坐标转机械手坐标
        
        Args:
            camera_point: 相机坐标系中的点
            
        Returns:
            ndarray: 机械手坐标系中的点
        """
        if self.R_camera_to_gripper is None:
            raise ValueError("尚未完成标定")
        
        return self.R_camera_to_gripper @ camera_point + self.t_camera_to_gripper
```

## 视觉-机械手闭环

完整的视觉交互流程。

- 识别：视觉目标检测
- 定位：坐标转换计算
- 抓取：机械手操作执行
- 按压：物理交互动作
- 反馈验证：结果确认

### 视觉引导抓取

```python
class VisionGuidedGrasping:
    """
    视觉引导抓取
    实现从视觉识别到物理抓取的完整流程
    """
    def __init__(self,
                 detector: 'YOLODetector',
                 arm_controller: 'RobotArmController',
                 hand_eye_calib: 'HandEyeCalibration'):
        """
        初始化
        
        Args:
            detector: 目标检测器
            arm_controller: 机械手控制器
            hand_eye_calib: 手眼标定
        """
        self.detector = detector
        self.arm = arm_controller
        self.calib = hand_eye_calib
        
        # 预定义抓取位姿
        self.pre_grasp_offset = np.array([0, 0, 0.1])  # 预抓取高度
        self.grasp_approach = np.array([0, 0, -0.05])  # 接近方向
    
    def detect_and_grasp(self, image: np.ndarray,
                        target_class: str = None) -> Dict:
        """
        检测并抓取目标
        
        Args:
            image: 相机图像
            target_class: 目标类别
            
        Returns:
            dict: 执行结果
        """
        # 1. 视觉检测
        detections = self.detector.detect(image)
        
        if not detections:
            return {"success": False, "error": "未检测到目标"}
        
        # 选择目标
        target = self._select_target(detections, target_class)
        if target is None:
            return {"success": False, "error": "未找到指定类别"}
        
        # 2. 计算3D位置（需要深度相机或已知高度）
        camera_point = self._estimate_3d_position(target)
        
        # 3. 坐标转换
        robot_point = self.calib.camera_to_robot(camera_point)
        
        # 4. 规划抓取
        grasp_pose = self._plan_grasp(robot_point, target)
        
        # 5. 执行抓取
        result = self._execute_grasp(grasp_pose)
        
        return result
    
    def _select_target(self, detections: List,
                      target_class: str = None) -> Optional:
        """
        选择目标
        
        Args:
            detections: 检测结果
            target_class: 目标类别
            
        Returns:
            object: 选中的目标
        """
        if target_class:
            for det in detections:
                if det.class_name == target_class:
                    return det
            return None
        
        # 默认选择置信度最高的
        return max(detections, key=lambda d: d.confidence)
    
    def _estimate_3d_position(self, detection) -> np.ndarray:
        """
        估计目标3D位置
        
        Args:
            detection: 检测结果
            
        Returns:
            ndarray: 3D坐标
        """
        # 简化实现：假设已知工作平面高度
        cx, cy = detection.center
        
        # 需要相机内参进行反投影
        # 这里使用简化模型
        z = 0.3  # 假设高度30cm
        x = (cx - 320) * z / 500  # 假设焦距
        y = (cy - 240) * z / 500
        
        return np.array([x, y, z])
    
    def _plan_grasp(self, target_point: np.ndarray,
                   detection) -> Pose:
        """
        规划抓取位姿
        
        Args:
            target_point: 目标位置
            detection: 检测结果
            
        Returns:
            Pose: 抓取位姿
        """
        # 计算抓取方向（根据检测框方向）
        x, y, z = target_point
        
        # 垂直向下抓取
        return Pose(x, y, z + 0.05, rx=np.pi, ry=0, rz=0)
    
    def _execute_grasp(self, grasp_pose: Pose) -> Dict:
        """
        执行抓取动作
        
        Args:
            grasp_pose: 抓取位姿
            
        Returns:
            dict: 执行结果
        """
        try:
            # 1. 移动到预抓取位置
            pre_pose = Pose(
                grasp_pose.x + self.pre_grasp_offset[0],
                grasp_pose.y + self.pre_grasp_offset[1],
                grasp_pose.z + self.pre_grasp_offset[2],
                grasp_pose.rx, grasp_pose.ry, grasp_pose.rz
            )
            self.arm.move_to_pose(pre_pose)
            
            # 2. 打开夹爪
            self.arm.gripper_open()
            
            # 3. 接近目标
            self.arm.move_linear(grasp_pose)
            
            # 4. 关闭夹爪
            self.arm.gripper_close()
            
            # 5. 抬起
            lift_pose = Pose(
                grasp_pose.x,
                grasp_pose.y,
                grasp_pose.z + 0.1,
                grasp_pose.rx, grasp_pose.ry, grasp_pose.rz
            )
            self.arm.move_linear(lift_pose)
            
            return {"success": True, "grasp_pose": grasp_pose}
        
        except Exception as e:
            self.arm.stop()
            return {"success": False, "error": str(e)}
    
    def press_button(self, image: np.ndarray,
                    button_class: str = "button") -> Dict:
        """
        按压按钮
        
        Args:
            image: 相机图像
            button_class: 按钮类别
            
        Returns:
            dict: 执行结果
        """
        # 检测按钮
        detections = self.detector.detect(image)
        buttons = [d for d in detections if d.class_name == button_class]
        
        if not buttons:
            return {"success": False, "error": "未检测到按钮"}
        
        # 选择第一个按钮
        button = buttons[0]
        
        # 计算按压位置
        camera_point = self._estimate_3d_position(button)
        robot_point = self.calib.camera_to_robot(camera_point)
        
        # 规划按压动作
        press_pose = Pose(robot_point[0], robot_point[1], robot_point[2], 
                         rx=np.pi, ry=0, rz=0)
        
        # 执行按压
        self.arm.move_to_pose(press_pose)
        
        # 向下按压
        press_down = Pose(robot_point[0], robot_point[1], robot_point[2] - 0.01,
                         rx=np.pi, ry=0, rz=0)
        self.arm.move_linear(press_down)
        
        # 抬起
        self.arm.move_linear(press_pose)
        
        return {"success": True, "button": button}
```

## 物理设备状态识别

设备状态智能感知。

- 指示灯状态识别
- 屏幕变化检测
- 机械结构反馈
- 异常状态告警

### 状态监控系统

```python
class DeviceStateMonitor:
    """
    设备状态监控器
    通过视觉识别监控物理设备状态
    """
    def __init__(self, detector: 'YOLODetector'):
        """
        初始化监控器
        
        Args:
            detector: 目标检测器
        """
        self.detector = detector
        self.state_history = []
    
    def recognize_indicator_light(self, image: np.ndarray,
                                  roi: Tuple[int, int, int, int]) -> Dict:
        """
        识别指示灯状态
        
        Args:
            image: 图像
            roi: 感兴趣区域 (x, y, w, h)
            
        Returns:
            dict: 灯状态
        """
        x, y, w, h = roi
        roi_image = image[y:y+h, x:x+w]
        
        # 转换到HSV色彩空间
        hsv = cv2.cvtColor(roi_image, cv2.COLOR_BGR2HSV)
        
        # 定义颜色范围
        color_ranges = {
            "red": [(0, 100, 100), (10, 255, 255)],
            "green": [(40, 100, 100), (80, 255, 255)],
            "yellow": [(20, 100, 100), (35, 255, 255)],
            "blue": [(100, 100, 100), (140, 255, 255)]
        }
        
        # 检测各颜色像素比例
        color_ratios = {}
        for color, (lower, upper) in color_ranges.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            ratio = np.sum(mask > 0) / (w * h)
            color_ratios[color] = ratio
        
        # 判断主导颜色
        dominant_color = max(color_ratios, key=color_ratios.get)
        is_on = color_ratios[dominant_color] > 0.1
        
        return {
            "color": dominant_color if is_on else "off",
            "is_on": is_on,
            "confidence": color_ratios[dominant_color],
            "color_distribution": color_ratios
        }
    
    def detect_screen_change(self, current: np.ndarray,
                            previous: np.ndarray,
                            threshold: float = 0.95) -> Dict:
        """
        检测屏幕变化
        
        Args:
            current: 当前帧
            previous: 上一帧
            threshold: 相似度阈值
            
        Returns:
            dict: 变化检测结果
        """
        if previous is None:
            return {"changed": True, "similarity": 0.0}
        
        # 计算相似度
        gray_current = cv2.cvtColor(current, cv2.COLOR_BGR2GRAY)
        gray_previous = cv2.cvtColor(previous, cv2.COLOR_BGR2GRAY)
        
        from skimage.metrics import structural_similarity
        similarity = structural_similarity(gray_current, gray_previous)
        
        changed = similarity < threshold
        
        if changed:
            # 计算变化区域
            diff = cv2.absdiff(gray_current, gray_previous)
            _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
            
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, 
                                          cv2.CHAIN_APPROX_SIMPLE)
            
            change_regions = []
            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                if w * h > 100:  # 过滤小噪声
                    change_regions.append({"x": x, "y": y, "w": w, "h": h})
        else:
            change_regions = []
        
        return {
            "changed": changed,
            "similarity": similarity,
            "change_regions": change_regions
        }
    
    def check_mechanical_feedback(self, image: np.ndarray,
                                  expected_state: str) -> Dict:
        """
        检查机械结构反馈
        
        Args:
            image: 当前图像
            expected_state: 期望状态
            
        Returns:
            dict: 检查结果
        """
        detections = self.detector.detect(image)
        
        # 分析检测到的机械部件状态
        detected_states = {}
        for det in detections:
            if det.class_name not in detected_states:
                detected_states[det.class_name] = []
            detected_states[det.class_name].append({
                "confidence": det.confidence,
                "position": det.bbox
            })
        
        # 验证期望状态
        state_match = expected_state in detected_states
        
        return {
            "expected_state": expected_state,
            "state_match": state_match,
            "detected_states": detected_states
        }
```

## 最佳实践

1. **安全第一**：机械手操作前确认安全区域
2. **标定精度**：定期重新手眼标定
3. **异常处理**：完善的异常处理和急停机制
4. **视觉验证**：每个动作后视觉确认结果
5. **力控融合**：结合力传感器提高交互安全性
