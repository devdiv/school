# 具身智能与机器人测试

物理世界AI系统的测试方法。

## 机械臂+视觉+AI的物理世界交互测试

具身智能系统测试。

- 感知系统测试
- 运动规划验证
- 交互安全性
- 端到端任务测试

### 具身智能测试框架

```python
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import numpy as np

@dataclass
class Pose3D:
    """三维位姿"""
    x: float
    y: float
    z: float
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0
    
    def to_array(self) -> np.ndarray:
        """转换为数组"""
        return np.array([self.x, self.y, self.z, self.roll, self.pitch, self.yaw])

@dataclass
class PerceptionResult:
    """感知结果"""
    object_class: str
    confidence: float
    bbox_3d: Tuple[float, float, float, float, float, float]
    position: Tuple[float, float, float]

class EmbodiedAITester:
    """
    具身智能测试器
    测试物理AI系统的综合能力
    """
    def __init__(self, robot_interface=None, vision_system=None):
        """
        初始化测试器
        
        Args:
            robot_interface: 机器人接口
            vision_system: 视觉系统
        """
        self.robot = robot_interface
        self.vision = vision_system
        self.test_results: List[Dict] = []
    
    def test_perception_accuracy(self, test_scenes: List[Dict]) -> Dict:
        """
        测试感知精度
        
        Args:
            test_scenes: 测试场景列表
            
        Returns:
            dict: 测试结果
        """
        total_objects = 0
        correct_detections = 0
        position_errors = []
        
        for scene in test_scenes:
            # 获取视觉感知结果
            perception_results = self.vision.detect_objects(scene["image"])
            
            # 对比Ground Truth
            for gt_obj in scene["ground_truth"]:
                total_objects += 1
                
                # 查找匹配的检测结果
                matched = self._match_detection(gt_obj, perception_results)
                
                if matched:
                    correct_detections += 1
                    
                    # 计算位置误差
                    gt_pos = np.array(gt_obj["position"])
                    det_pos = np.array(matched["position"])
                    error = np.linalg.norm(gt_pos - det_pos)
                    position_errors.append(error)
        
        return {
            "detection_accuracy": correct_detections / total_objects if total_objects > 0 else 0,
            "mean_position_error": np.mean(position_errors) if position_errors else 0,
            "max_position_error": np.max(position_errors) if position_errors else 0,
            "total_tested": total_objects
        }
    
    def test_grasp_success_rate(self, objects: List[Dict],
                               iterations: int = 10) -> Dict:
        """
        测试抓取成功率
        
        Args:
            objects: 测试物体列表
            iterations: 每个物体测试次数
            
        Returns:
            dict: 测试结果
        """
        results = []
        
        for obj in objects:
            successes = 0
            
            for _ in range(iterations):
                # 1. 感知物体位置
                perception = self.vision.detect_objects()[0]
                
                # 2. 规划抓取
                grasp_pose = self._plan_grasp(perception)
                
                # 3. 执行抓取
                success = self._execute_grasp(grasp_pose)
                
                if success:
                    successes += 1
                
                # 4. 重置
                self._reset_scene()
            
            results.append({
                "object": obj["name"],
                "success_rate": successes / iterations,
                "total_attempts": iterations
            })
        
        overall_success = sum(r["success_rate"] for r in results) / len(results) if results else 0
        
        return {
            "overall_success_rate": overall_success,
            "per_object": results
        }
    
    def test_task_completion(self, task: Dict,
                            max_steps: int = 100) -> Dict:
        """
        测试任务完成能力
        
        Args:
            task: 任务定义
            max_steps: 最大步数
            
        Returns:
            dict: 测试结果
        """
        steps = 0
        task_completed = False
        intermediate_results = []
        
        while steps < max_steps and not task_completed:
            # 1. 观察环境
            observation = self._get_observation()
            
            # 2. AI决策
            action = self._ai_decision(observation, task)
            
            # 3. 执行动作
            self._execute_action(action)
            
            # 4. 检查任务状态
            task_completed = self._check_task_completion(task)
            
            intermediate_results.append({
                "step": steps,
                "action": action,
                "observation": observation
            })
            
            steps += 1
        
        return {
            "task": task["name"],
            "completed": task_completed,
            "steps_taken": steps,
            "max_steps": max_steps,
            "efficiency": task_completed / steps if steps > 0 else 0,
            "intermediate_results": intermediate_results
        }
    
    def test_safety_boundaries(self, safety_limits: Dict) -> Dict:
        """
        测试安全边界
        
        Args:
            safety_limits: 安全限制
            
        Returns:
            dict: 安全测试结果
        """
        violations = []
        
        # 测试工作空间边界
        workspace = safety_limits.get("workspace", {})
        test_positions = self._generate_boundary_positions(workspace)
        
        for pos in test_positions:
            # 尝试移动到边界位置
            result = self._safe_move_to(pos)
            
            if not result["safe"]:
                violations.append({
                    "type": "workspace_violation",
                    "position": pos,
                    "reason": result["reason"]
                })
        
        # 测试力限制
        max_force = safety_limits.get("max_force", 100)
        
        return {
            "total_tests": len(test_positions),
            "violations": violations,
            "violation_count": len(violations),
            "safety_score": 1.0 - (len(violations) / len(test_positions)) if test_positions else 1.0
        }
    
    def _match_detection(self, gt: Dict,
                        detections: List[Dict]) -> Optional[Dict]:
        """
        匹配检测结果
        
        Args:
            gt: Ground Truth
            detections: 检测结果
            
        Returns:
            dict: 匹配项
        """
        for det in detections:
            if det["class"] == gt["class"]:
                # IOU计算
                if self._calculate_iou(gt["bbox"], det["bbox"]) > 0.5:
                    return det
        return None
    
    def _calculate_iou(self, box1: List, box2: List) -> float:
        """计算IOU"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        return intersection / (area1 + area2 - intersection) if (area1 + area2 - intersection) > 0 else 0
    
    def _plan_grasp(self, perception: Dict) -> Pose3D:
        """规划抓取位姿"""
        pos = perception["position"]
        return Pose3D(x=pos[0], y=pos[1], z=pos[2] + 0.05)
    
    def _execute_grasp(self, pose: Pose3D) -> bool:
        """执行抓取"""
        # 实际实现需要调用机器人接口
        return True
    
    def _reset_scene(self):
        """重置场景"""
        pass
    
    def _get_observation(self) -> Dict:
        """获取观察"""
        return {}
    
    def _ai_decision(self, observation: Dict, task: Dict) -> Dict:
        """AI决策"""
        return {}
    
    def _execute_action(self, action: Dict):
        """执行动作"""
        pass
    
    def _check_task_completion(self, task: Dict) -> bool:
        """检查任务完成"""
        return False
    
    def _generate_boundary_positions(self, workspace: Dict) -> List[Dict]:
        """生成边界测试位置"""
        positions = []
        bounds = workspace.get("bounds", {})
        
        # 生成边界点
        for x in [bounds.get("x_min", -1), bounds.get("x_max", 1)]:
            for y in [bounds.get("y_min", -1), bounds.get("y_max", 1)]:
                for z in [bounds.get("z_min", 0), bounds.get("z_max", 1)]:
                    positions.append({"x": x, "y": y, "z": z})
        
        return positions
    
    def _safe_move_to(self, position: Dict) -> Dict:
        """安全移动"""
        return {"safe": True, "reason": ""}
```

## Sim2Real：仿真环境到真实世界的迁移测试

仿真到现实的迁移验证。

- 仿真环境搭建
- 域随机化
- 现实差距评估
- 迁移策略验证

### Sim2Real测试框架

```python
class Sim2RealValidator:
    """
    Sim2Real验证器
    验证仿真到现实的迁移效果
    """
    def __init__(self, sim_env, real_env):
        """
        初始化验证器
        
        Args:
            sim_env: 仿真环境
            real_env: 真实环境
        """
        self.sim_env = sim_env
        self.real_env = real_env
    
    def compare_observations(self, action: Dict) -> Dict:
        """
        对比仿真与现实观察
        
        Args:
            action: 执行的动作
            
        Returns:
            dict: 对比结果
        """
        # 在仿真环境执行
        sim_obs = self.sim_env.step(action)
        
        # 在真实环境执行
        real_obs = self.real_env.step(action)
        
        # 计算差异
        if "image" in sim_obs and "image" in real_obs:
            image_diff = self._compare_images(sim_obs["image"], real_obs["image"])
        else:
            image_diff = None
        
        if "state" in sim_obs and "state" in real_obs:
            state_diff = np.linalg.norm(
                np.array(sim_obs["state"]) - np.array(real_obs["state"])
            )
        else:
            state_diff = None
        
        return {
            "action": action,
            "image_difference": image_diff,
            "state_difference": state_diff,
            "sim_observation": sim_obs,
            "real_observation": real_obs
        }
    
    def evaluate_policy_transfer(self, policy,
                                 test_episodes: int = 10) -> Dict:
        """
        评估策略迁移效果
        
        Args:
            policy: 训练好的策略
            test_episodes: 测试轮数
            
        Returns:
            dict: 评估结果
        """
        sim_rewards = []
        real_rewards = []
        
        for _ in range(test_episodes):
            # 仿真环境测试
            sim_reward = self._run_episode(self.sim_env, policy)
            sim_rewards.append(sim_reward)
            
            # 真实环境测试
            real_reward = self._run_episode(self.real_env, policy)
            real_rewards.append(real_reward)
        
        return {
            "sim_mean_reward": np.mean(sim_rewards),
            "real_mean_reward": np.mean(real_rewards),
            "transfer_gap": np.mean(sim_rewards) - np.mean(real_rewards),
            "transfer_ratio": np.mean(real_rewards) / np.mean(sim_rewards) if np.mean(sim_rewards) > 0 else 0
        }
    
    def _run_episode(self, env, policy) -> float:
        """运行一轮"""
        obs = env.reset()
        total_reward = 0
        done = False
        
        while not done:
            action = policy.predict(obs)
            obs, reward, done, _ = env.step(action)
            total_reward += reward
        
        return total_reward
    
    def _compare_images(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """对比图像差异"""
        if img1.shape != img2.shape:
            img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
        
        mse = np.mean((img1 - img2) ** 2)
        return mse
```

## 最佳实践

1. **仿真优先**：在仿真环境充分验证后再上真实机器人
2. **安全优先**：所有测试必须有安全监控
3. **渐进测试**：从简单任务逐步到复杂任务
4. **域随机化**：在仿真中使用域随机化提高鲁棒性
5. **持续监控**：真实环境部署后持续监控性能
