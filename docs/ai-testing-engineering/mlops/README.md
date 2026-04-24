# MLOps实践

AI模型运维实践，包括模型训练、模型部署、模型监控、模型版本管理等。

## 📚 内容概览

### 模型训练
- **训练流水线**：自动化训练流程、流水线编排
- **实验管理**：实验追踪、参数记录、结果对比
- **超参优化**：自动超参搜索、优化策略
- **分布式训练**：多机多卡训练、训练加速

### 模型部署
- **模型打包**：模型打包规范、容器化部署
- **服务部署**：模型服务化、API部署
- **灰度发布**：金丝雀发布、蓝绿部署
- **回滚机制**：版本回滚、快速回滚

### 模型监控
- **性能监控**：模型性能监控、响应时间监控
- **漂移检测**：数据漂移检测、概念漂移检测
- **异常告警**：异常检测、告警通知
- **效果追踪**：模型效果追踪、长期监控

### 模型版本管理
- **版本控制**：模型版本控制、变更追踪
- **模型注册**：模型注册中心、模型仓库
- **模型lineage**：模型血缘、依赖追踪
- **模型回滚**：版本回滚、快速恢复

## 🏗️ MLOps架构

### 整体架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      实验层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │实验管理  │  │超参优化  │  │特征工程  │  │代码管理  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      训练层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │训练流水线│  │分布式训练│  │资源调度  │  │模型存储  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      部署层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │模型打包  │  │服务部署  │  │负载均衡  │  │自动扩缩  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      监控层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │性能监控  │  │漂移检测  │  │告警系统  │  │日志系统  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈推荐

| 层级 | 技术组件 | 推荐工具 | 说明 |
|------|---------|---------|------|
| 实验管理 | 实验追踪 | MLflow、Weights & Biases | 实验参数和结果管理 |
| 实验管理 | 超参优化 | Optuna、Ray Tune | 自动超参数搜索 |
| 训练框架 | 深度学习 | PyTorch、TensorFlow | 模型训练框架 |
| 训练框架 | 分布式训练 | Horovod、DeepSpeed | 分布式训练加速 |
| 模型存储 | 模型仓库 | MLflow Model Registry | 模型版本管理 |
| 模型存储 | 特征存储 | Feast、Hopsworks | 特征管理系统 |
| 模型服务 | 服务框架 | TorchServe、Triton | 模型服务化框架 |
| 模型服务 | 容器编排 | Kubernetes、Docker | 容器编排管理 |
| 监控系统 | 性能监控 | Prometheus、Grafana | 系统性能监控 |
| 监控系统 | 漂移检测 | Alibi Detect、Evidently | 数据漂移检测 |

## 🎯 应用场景

### 模型训练管理
自动化模型训练流程，提升训练效率。

**具体场景**：
- 自动化训练流水线
- 实验参数追踪
- 超参数自动优化
- 分布式训练管理

**解决方案**：
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd

class ModelTrainingPipeline:
    """模型训练流水线"""
    
    def __init__(self, experiment_name="model_training"):
        self.experiment_name = experiment_name
        mlflow.set_experiment(experiment_name)
    
    def prepare_data(self, data_path, target_column):
        """数据准备"""
        df = pd.read_csv(data_path)
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        return train_test_split(X, y, test_size=0.2, random_state=42)
    
    def train_model(self, X_train, y_train, params):
        """模型训练"""
        with mlflow.start_run():
            # 记录参数
            mlflow.log_params(params)
            
            # 训练模型
            model = RandomForestClassifier(**params)
            model.fit(X_train, y_train)
            
            # 记录模型
            mlflow.sklearn.log_model(model, "model")
            
            return model
    
    def evaluate_model(self, model, X_test, y_test):
        """模型评估"""
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        
        y_pred = model.predict(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted')
        }
        
        # 记录指标
        mlflow.log_metrics(metrics)
        
        return metrics
    
    def run_pipeline(self, data_path, target_column, params):
        """运行训练流水线"""
        X_train, X_test, y_train, y_test = self.prepare_data(data_path, target_column)
        model = self.train_model(X_train, y_train, params)
        metrics = self.evaluate_model(model, X_test, y_test)
        
        return model, metrics
```

### 模型部署运维
标准化模型部署流程，保障服务稳定性。

**具体场景**：
- 模型服务化部署
- 容器化部署
- 灰度发布
- 自动扩缩容

**解决方案**：
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List
import logging

app = FastAPI(title="Model Serving API")
model = None
logger = logging.getLogger(__name__)

class PredictionRequest(BaseModel):
    """预测请求模型"""
    features: List[float]

class PredictionResponse(BaseModel):
    """预测响应模型"""
    prediction: float
    probability: List[float]
    model_version: str

@app.on_event("startup")
async def load_model():
    """加载模型"""
    global model
    try:
        model = joblib.load('model.pkl')
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """模型预测接口"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0].tolist()
        
        return PredictionResponse(
            prediction=prediction,
            probability=probability,
            model_version="v1.0.0"
        )
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.get("/model/info")
async def model_info():
    """模型信息接口"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": type(model).__name__,
        "model_version": "v1.0.0",
        "features_count": model.n_features_in_
    }
```

### 模型效果监控
持续监控模型效果，及时发现和解决问题。

**具体场景**：
- 性能指标监控
- 数据漂移检测
- 模型效果追踪
- 异常告警

**解决方案**：
```python
from alibi_detect import KSDrift, ChiSquareDrift
import numpy as np
import pandas as pd
from typing import Dict, List
import logging

class ModelMonitor:
    """模型监控器"""
    
    def __init__(self, reference_data: np.ndarray):
        self.reference_data = reference_data
        self.drift_detector = KSDrift(
            X_ref=reference_data,
            p_val=0.05,
            alternative='two-sided'
        )
        self.logger = logging.getLogger(__name__)
    
    def detect_data_drift(self, new_data: np.ndarray) -> Dict:
        """检测数据漂移"""
        try:
            result = self.drift_detector.predict(new_data)
            
            drift_info = {
                'drift_detected': result['data']['is_drift'],
                'p_value': result['data']['p_val'].tolist(),
                'threshold': result['data']['threshold'],
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            if drift_info['drift_detected']:
                self.logger.warning(f"Data drift detected: {drift_info}")
            
            return drift_info
        except Exception as e:
            self.logger.error(f"Drift detection failed: {e}")
            return {'error': str(e)}
    
    def monitor_model_performance(self, predictions: List, actuals: List) -> Dict:
        """监控模型性能"""
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        
        try:
            metrics = {
                'accuracy': accuracy_score(actuals, predictions),
                'precision': precision_score(actuals, predictions, average='weighted'),
                'recall': recall_score(actuals, predictions, average='weighted'),
                'f1_score': f1_score(actuals, predictions, average='weighted'),
                'sample_count': len(predictions),
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            return metrics
        except Exception as e:
            self.logger.error(f"Performance monitoring failed: {e}")
            return {'error': str(e)}
    
    def check_prediction_distribution(self, predictions: List) -> Dict:
        """检查预测分布"""
        try:
            pred_series = pd.Series(predictions)
            
            distribution = {
                'value_counts': pred_series.value_counts().to_dict(),
                'unique_values': pred_series.nunique(),
                'total_count': len(predictions),
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            return distribution
        except Exception as e:
            self.logger.error(f"Distribution check failed: {e}")
            return {'error': str(e)}
    
    def generate_monitoring_report(self, monitoring_data: Dict) -> str:
        """生成监控报告"""
        report_lines = [
            "# 模型监控报告",
            f"生成时间: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "## 数据漂移检测",
            f"- 漂移检测: {'是' if monitoring_data.get('drift_detected') else '否'}",
            f"- P值: {monitoring_data.get('p_value', 'N/A')}",
            "",
            "## 模型性能",
            f"- 准确率: {monitoring_data.get('accuracy', 'N/A'):.4f}",
            f"- 精确率: {monitoring_data.get('precision', 'N/A'):.4f}",
            f"- 召回率: {monitoring_data.get('recall', 'N/A'):.4f}",
            f"- F1分数: {monitoring_data.get('f1_score', 'N/A'):.4f}",
            "",
            "## 预测分布",
            f"- 唯一值数量: {monitoring_data.get('unique_values', 'N/A')}",
            f"- 总样本数: {monitoring_data.get('total_count', 'N/A')}"
        ]
        
        return "\n".join(report_lines)
```

### 模型版本管理
规范模型版本管理，支持快速迭代。

**具体场景**：
- 模型版本控制
- 模型注册管理
- 模型血缘追踪
- 模型回滚

**解决方案**：
```python
import mlflow
from mlflow.tracking import MlflowClient
from typing import Dict, List, Optional
import logging

class ModelVersionManager:
    """模型版本管理器"""
    
    def __init__(self, tracking_uri: str = "http://localhost:5000"):
        self.client = MlflowClient(tracking_uri=tracking_uri)
        self.logger = logging.getLogger(__name__)
    
    def register_model(self, model_name: str, run_id: str, model_path: str = "model") -> str:
        """注册模型"""
        try:
            model_uri = f"runs:/{run_id}/{model_path}"
            model_version = mlflow.register_model(model_uri, model_name)
            
            self.logger.info(f"Model {model_name} version {model_version.version} registered")
            return model_version.version
        except Exception as e:
            self.logger.error(f"Model registration failed: {e}")
            raise
    
    def transition_model_stage(self, model_name: str, version: str, stage: str):
        """转换模型阶段"""
        try:
            self.client.transition_model_version_stage(
                name=model_name,
                version=version,
                stage=stage
            )
            
            self.logger.info(f"Model {model_name} v{version} transitioned to {stage}")
        except Exception as e:
            self.logger.error(f"Stage transition failed: {e}")
            raise
    
    def get_model_versions(self, model_name: str) -> List[Dict]:
        """获取模型版本列表"""
        try:
            versions = self.client.search_model_versions(f"name='{model_name}'")
            
            version_list = []
            for version in versions:
                version_list.append({
                    'version': version.version,
                    'stage': version.current_stage,
                    'creation_timestamp': version.creation_timestamp,
                    'last_updated_timestamp': version.last_updated_timestamp,
                    'description': version.description,
                    'run_id': version.run_id
                })
            
            return version_list
        except Exception as e:
            self.logger.error(f"Failed to get model versions: {e}")
            return []
    
    def get_production_model(self, model_name: str) -> Optional[Dict]:
        """获取生产环境模型"""
        try:
            versions = self.client.get_latest_versions(model_name, stages=["Production"])
            
            if versions:
                version = versions[0]
                return {
                    'version': version.version,
                    'run_id': version.run_id,
                    'creation_timestamp': version.creation_timestamp,
                    'source': version.source
                }
            
            return None
        except Exception as e:
            self.logger.error(f"Failed to get production model: {e}")
            return None
    
    def rollback_model(self, model_name: str, target_version: str):
        """回滚模型"""
        try:
            # 将目标版本转换为生产环境
            self.transition_model_stage(model_name, target_version, "Production")
            
            # 将当前生产版本转换为归档
            current_production = self.get_production_model(model_name)
            if current_production and current_production['version'] != target_version:
                self.transition_model_stage(
                    model_name, 
                    current_production['version'], 
                    "Archived"
                )
            
            self.logger.info(f"Model {model_name} rolled back to version {target_version}")
        except Exception as e:
            self.logger.error(f"Model rollback failed: {e}")
            raise
    
    def compare_model_versions(self, model_name: str, version1: str, version2: str) -> Dict:
        """比较模型版本"""
        try:
            v1 = self.client.get_model_version(model_name, version1)
            v2 = self.client.get_model_version(model_name, version2)
            
            run1 = self.client.get_run(v1.run_id)
            run2 = self.client.get_run(v2.run_id)
            
            comparison = {
                'version1': {
                    'version': version1,
                    'metrics': run1.data.metrics,
                    'params': run1.data.params,
                    'creation_time': v1.creation_timestamp
                },
                'version2': {
                    'version': version2,
                    'metrics': run2.data.metrics,
                    'params': run2.data.params,
                    'creation_time': v2.creation_timestamp
                },
                'metrics_diff': {}
            }
            
            # 计算指标差异
            for key in run1.data.metrics:
                if key in run2.data.metrics:
                    comparison['metrics_diff'][key] = {
                        'v1': run1.data.metrics[key],
                        'v2': run2.data.metrics[key],
                        'diff': run2.data.metrics[key] - run1.data.metrics[key]
                    }
            
            return comparison
        except Exception as e:
            self.logger.error(f"Model comparison failed: {e}")
            return {'error': str(e)}
```

## 🛠️ 工具集成

### 训练框架

| 框架名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| PyTorch | 深度学习训练 | 动态图、易调试 | ⭐⭐⭐⭐⭐ |
| TensorFlow | 深度学习训练 | 静态图、生产就绪 | ⭐⭐⭐⭐⭐ |
| PaddlePaddle | 深度学习训练 | 国产框架、中文支持 | ⭐⭐⭐⭐ |
| scikit-learn | 传统机器学习 | 简单易用、算法丰富 | ⭐⭐⭐⭐⭐ |
| XGBoost | 梯度提升 | 高性能、表格数据 | ⭐⭐⭐⭐⭐ |

### 实验管理工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| MLflow | 实验追踪 | 开源、功能全面 | ⭐⭐⭐⭐⭐ |
| Weights & Biases | 实验追踪 | 可视化强、协作友好 | ⭐⭐⭐⭐⭐ |
| Neptune | 实验追踪 | 云端托管、易用 | ⭐⭐⭐⭐ |
| Comet | 实验追踪 | 团队协作、可视化 | ⭐⭐⭐⭐ |

### 模型服务工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| TorchServe | PyTorch模型服务 | 官方支持、性能好 | ⭐⭐⭐⭐⭐ |
| TensorFlow Serving | TF模型服务 | 生产就绪、高性能 | ⭐⭐⭐⭐⭐ |
| Triton Inference Server | 多框架支持 | 统一接口、高性能 | ⭐⭐⭐⭐⭐ |
| FastAPI | 自定义服务 | 灵活、易用 | ⭐⭐⭐⭐ |

### 监控工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Prometheus | 系统监控 | 开源、生态丰富 | ⭐⭐⭐⭐⭐ |
| Grafana | 可视化 | 多数据源、美观 | ⭐⭐⭐⭐⭐ |
| Alibi Detect | 漂移检测 | 开源、算法丰富 | ⭐⭐⭐⭐⭐ |
| Evidently | 模型监控 | 可视化、易用 | ⭐⭐⭐⭐ |

## 📊 性能指标

### 训练性能指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 训练任务成功率 | ≥95% | 模型训练成功率 |
| 训练时间优化 | ≥30% | 训练时间缩短比例 |
| GPU利用率 | ≥80% | GPU资源利用率 |
| 并发训练任务 | ≥10 | 并发训练任务数 |
| 实验追踪完整性 | 100% | 实验参数记录完整性 |

### 部署性能指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 部署成功率 | ≥99% | 模型部署成功率 |
| 部署时间 | ≤10min | 模型部署平均时间 |
| 服务可用性 | ≥99.9% | 服务可用率 |
| 推理延迟 | ≤100ms | 模型推理平均延迟 |
| 推理吞吐量 | ≥1000 QPS | 模型推理吞吐量 |

### 监控效果指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 漂移检测准确率 | ≥90% | 数据漂移检测准确率 |
| 异常检测召回率 | ≥85% | 异常检测召回率 |
| 告警及时性 | ≤5min | 告警响应时间 |
| 监控覆盖率 | 100% | 监控指标覆盖范围 |

## 🔧 最佳实践

### 模型训练最佳实践

1. **实验管理规范**
   - 记录所有实验参数和结果
   - 使用有意义的实验命名
   - 定期清理过期实验

2. **超参优化策略**
   - 使用贝叶斯优化提高效率
   - 设置合理的搜索空间
   - 记录优化历史

3. **分布式训练优化**
   - 合理设置batch size
   - 使用混合精度训练
   - 优化数据加载

### 模型部署最佳实践

1. **容器化部署**
   - 使用多阶段构建优化镜像
   - 设置合理的资源限制
   - 实现健康检查

2. **服务化设计**
   - 设计清晰的API接口
   - 实现请求验证
   - 添加日志和监控

3. **灰度发布策略**
   - 逐步增加流量
   - 监控关键指标
   - 准备回滚方案

### 模型监控最佳实践

1. **性能监控**
   - 监控关键性能指标
   - 设置合理的告警阈值
   - 定期评估模型效果

2. **漂移检测**
   - 建立基线数据
   - 定期检测数据漂移
   - 及时更新模型

3. **异常处理**
   - 建立异常处理流程
   - 自动化告警通知
   - 快速响应机制

### 模型版本管理最佳实践

1. **版本控制规范**
   - 使用语义化版本号
   - 记录版本变更日志
   - 标记重要版本

2. **模型注册流程**
   - 建立模型注册标准
   - 实现自动化注册
   - 完善模型元数据

3. **回滚机制**
   - 建立快速回滚流程
   - 保留历史版本
   - 测试回滚流程

## 🔗 相关资源

- [模型训练实践](/ai-testing-engineering/mlops/model-training/)
- [模型部署方案](/ai-testing-engineering/mlops/model-deployment/)
- [模型监控体系](/ai-testing-engineering/mlops/model-monitoring/)
- [模型版本管理](/ai-testing-engineering/mlops/model-versioning/)
