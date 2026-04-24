# 数据工程

AI测试数据工程实践，包括数据生成、数据管理、数据质量、数据安全等。

## 📚 内容概览

### 数据生成
- **测试数据生成**：智能数据生成、场景数据构建
- **数据增强**：数据扩充、数据变换、数据合成
- **数据脱敏**：敏感数据脱敏、数据隐私保护
- **数据标注**：数据标注工具、标注质量控制

### 数据管理
- **数据版本管理**：数据版本控制、数据变更追踪
- **数据血缘**：数据来源追踪、数据流向分析
- **数据目录**：数据资产目录、元数据管理
- **数据生命周期**：数据采集、存储、使用、销毁

### 数据质量
- **质量评估**：数据质量评估指标、质量评分
- **质量监控**：数据质量监控、异常检测
- **质量治理**：数据清洗、数据修复、质量改进
- **质量报告**：数据质量报告、质量趋势分析

### 数据安全
- **数据加密**：数据加密存储、传输加密
- **访问控制**：数据访问权限、角色管理
- **审计日志**：数据访问日志、操作审计
- **合规管理**：数据合规检查、合规报告

## 🏗️ 数据工程架构

### 整体架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      数据源层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │数据库    │  │文件系统  │  │API接口   │  │流数据    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据采集层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │批量采集  │  │实时采集  │  │增量采集  │  │CDC采集   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据处理层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │数据清洗  │  │数据转换  │  │数据增强  │  │数据脱敏  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │数据湖    │  │数据仓库  │  │特征存储  │  │元数据    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据服务层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │数据查询  │  │数据订阅  │  │数据API   │  │数据目录  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈推荐

| 层级 | 技术组件 | 推荐工具 | 说明 |
|------|---------|---------|------|
| 数据采集 | 批量采集 | Apache Sqoop、DataX | 批量数据迁移工具 |
| 数据采集 | 实时采集 | Apache Kafka、Apache Pulsar | 实时数据流处理 |
| 数据采集 | CDC采集 | Debezium、Canal | 数据变更捕获 |
| 数据处理 | 批处理 | Apache Spark、Apache Flink | 大规模数据处理 |
| 数据处理 | 流处理 | Apache Flink、Apache Storm | 实时流数据处理 |
| 数据存储 | 数据湖 | Delta Lake、Apache Iceberg | 数据湖存储格式 |
| 数据存储 | 数据仓库 | Apache Hive、ClickHouse | 数据仓库系统 |
| 数据存储 | 特征存储 | Feast、Hopsworks | 特征管理系统 |
| 数据治理 | 元数据管理 | Apache Atlas、DataHub | 元数据管理平台 |
| 数据治理 | 数据血缘 | Apache Atlas、OpenLineage | 数据血缘追踪 |
| 数据质量 | 质量监控 | Great Expectations、Deequ | 数据质量监控工具 |

## 🎯 应用场景

### 测试数据准备
快速生成高质量测试数据，提升测试效率。

**具体场景**：
- 模型训练数据准备
- 测试环境数据构建
- 性能测试数据生成
- 边界条件数据构造

**解决方案**：
```python
from faker import Faker
import pandas as pd
import numpy as np

class TestDataGenerator:
    """测试数据生成器"""
    
    def __init__(self, locale='zh_CN'):
        self.fake = Faker(locale)
    
    def generate_user_data(self, num_records=1000):
        """生成用户测试数据"""
        users = []
        for _ in range(num_records):
            user = {
                'user_id': self.fake.uuid4(),
                'username': self.fake.user_name(),
                'email': self.fake.email(),
                'phone': self.fake.phone_number(),
                'age': self.fake.random_int(min=18, max=80),
                'gender': self.fake.random_element(['男', '女']),
                'city': self.fake.city(),
                'registration_date': self.fake.date_time_between(start_date='-2y', end_date='now'),
                'last_login': self.fake.date_time_between(start_date='-30d', end_date='now')
            }
            users.append(user)
        
        return pd.DataFrame(users)
    
    def generate_transaction_data(self, num_records=10000):
        """生成交易测试数据"""
        transactions = []
        for _ in range(num_records):
            transaction = {
                'transaction_id': self.fake.uuid4(),
                'user_id': self.fake.uuid4(),
                'amount': round(self.fake.pyfloat(left_digits=4, right_digits=2, positive=True), 2),
                'currency': self.fake.random_element(['CNY', 'USD', 'EUR']),
                'transaction_type': self.fake.random_element(['购买', '退款', '转账', '充值']),
                'status': self.fake.random_element(['成功', '失败', '处理中']),
                'timestamp': self.fake.date_time_between(start_date='-1y', end_date='now'),
                'merchant': self.fake.company(),
                'category': self.fake.random_element(['餐饮', '购物', '交通', '娱乐', '其他'])
            }
            transactions.append(transaction)
        
        return pd.DataFrame(transactions)
```

### 数据资产管理
建立测试数据资产目录，提升数据利用率。

**具体场景**：
- 数据资产盘点
- 数据目录管理
- 数据血缘追踪
- 数据生命周期管理

**解决方案**：
```python
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict
import json

@dataclass
class DataAsset:
    """数据资产"""
    asset_id: str
    name: str
    description: str
    data_type: str
    schema: Dict
    tags: List[str]
    owner: str
    created_at: datetime
    updated_at: datetime
    quality_score: float
    usage_count: int

class DataCatalog:
    """数据目录管理"""
    
    def __init__(self):
        self.assets = {}
    
    def register_asset(self, asset: DataAsset):
        """注册数据资产"""
        self.assets[asset.asset_id] = asset
    
    def search_assets(self, query: str) -> List[DataAsset]:
        """搜索数据资产"""
        results = []
        for asset in self.assets.values():
            if (query.lower() in asset.name.lower() or
                query.lower() in asset.description.lower() or
                query.lower() in ' '.join(asset.tags).lower()):
                results.append(asset)
        return results
    
    def get_asset_lineage(self, asset_id: str) -> Dict:
        """获取数据血缘"""
        # 实现数据血缘追踪逻辑
        pass
    
    def export_catalog(self, file_path: str):
        """导出数据目录"""
        catalog_data = []
        for asset in self.assets.values():
            catalog_data.append({
                'asset_id': asset.asset_id,
                'name': asset.name,
                'description': asset.description,
                'data_type': asset.data_type,
                'tags': asset.tags,
                'owner': asset.owner,
                'quality_score': asset.quality_score,
                'usage_count': asset.usage_count
            })
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(catalog_data, f, ensure_ascii=False, indent=2)
```

### 数据质量保障
确保测试数据质量，提升测试可靠性。

**具体场景**：
- 数据质量评估
- 数据质量监控
- 数据质量治理
- 数据质量报告

**解决方案**：
```python
from great_expectations import Dataset
import pandas as pd
from typing import Dict, List

class DataQualityChecker:
    """数据质量检查器"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.dataset = Dataset.from_pandas(df)
    
    def check_completeness(self, columns: List[str] = None) -> Dict:
        """检查数据完整性"""
        if columns is None:
            columns = self.df.columns
        
        results = {}
        for col in columns:
            null_count = self.df[col].isnull().sum()
            total_count = len(self.df)
            completeness = (total_count - null_count) / total_count
            
            results[col] = {
                'null_count': null_count,
                'total_count': total_count,
                'completeness': completeness,
                'status': 'PASS' if completeness >= 0.95 else 'FAIL'
            }
        
        return results
    
    def check_uniqueness(self, columns: List[str]) -> Dict:
        """检查数据唯一性"""
        results = {}
        for col in columns:
            duplicate_count = self.df[col].duplicated().sum()
            total_count = len(self.df)
            uniqueness = (total_count - duplicate_count) / total_count
            
            results[col] = {
                'duplicate_count': duplicate_count,
                'total_count': total_count,
                'uniqueness': uniqueness,
                'status': 'PASS' if uniqueness >= 0.99 else 'FAIL'
            }
        
        return results
    
    def check_accuracy(self, rules: Dict) -> Dict:
        """检查数据准确性"""
        results = {}
        for col, rule in rules.items():
            if rule['type'] == 'range':
                min_val, max_val = rule['min'], rule['max']
                valid_count = ((self.df[col] >= min_val) & (self.df[col] <= max_val)).sum()
                total_count = len(self.df)
                accuracy = valid_count / total_count
                
                results[col] = {
                    'valid_count': valid_count,
                    'total_count': total_count,
                    'accuracy': accuracy,
                    'status': 'PASS' if accuracy >= 0.95 else 'FAIL'
                }
            elif rule['type'] == 'pattern':
                import re
                pattern = rule['pattern']
                valid_count = self.df[col].astype(str).str.match(pattern).sum()
                total_count = len(self.df)
                accuracy = valid_count / total_count
                
                results[col] = {
                    'valid_count': valid_count,
                    'total_count': total_count,
                    'accuracy': accuracy,
                    'status': 'PASS' if accuracy >= 0.95 else 'FAIL'
                }
        
        return results
    
    def generate_quality_report(self) -> Dict:
        """生成数据质量报告"""
        report = {
            'summary': {
                'total_rows': len(self.df),
                'total_columns': len(self.df.columns),
                'timestamp': pd.Timestamp.now().isoformat()
            },
            'completeness': self.check_completeness(),
            'uniqueness': self.check_uniqueness(self.df.columns.tolist()),
            'statistics': self.df.describe().to_dict()
        }
        
        return report
```

### 数据安全合规
保障测试数据安全，满足合规要求。

**具体场景**：
- 数据脱敏处理
- 数据加密存储
- 访问权限控制
- 合规性检查

**解决方案**：
```python
import hashlib
from cryptography.fernet import Fernet
from typing import Dict, List
import pandas as pd

class DataSecurityManager:
    """数据安全管理器"""
    
    def __init__(self, encryption_key: bytes = None):
        if encryption_key is None:
            encryption_key = Fernet.generate_key()
        self.cipher = Fernet(encryption_key)
    
    def anonymize_data(self, df: pd.DataFrame, columns: List[str], method: str = 'hash') -> pd.DataFrame:
        """数据脱敏处理"""
        df_anonymized = df.copy()
        
        for col in columns:
            if method == 'hash':
                df_anonymized[col] = df_anonymized[col].astype(str).apply(
                    lambda x: hashlib.sha256(x.encode()).hexdigest()[:16]
                )
            elif method == 'mask':
                df_anonymized[col] = df_anonymized[col].astype(str).apply(
                    lambda x: x[:3] + '*' * (len(x) - 3) if len(x) > 3 else '***'
                )
            elif method == 'random':
                import random
                df_anonymized[col] = [random.choice(['A', 'B', 'C', 'D']) for _ in range(len(df))]
        
        return df_anonymized
    
    def encrypt_data(self, data: str) -> str:
        """数据加密"""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """数据解密"""
        return self.cipher.decrypt(encrypted_data.encode()).decode()
    
    def check_compliance(self, df: pd.DataFrame, rules: Dict) -> Dict:
        """合规性检查"""
        results = {}
        
        for rule_name, rule_config in rules.items():
            if rule_name == 'pii_detection':
                pii_columns = rule_config['columns']
                detected_pii = []
                
                for col in pii_columns:
                    if col in df.columns:
                        sample_data = df[col].dropna().head(100).astype(str)
                        for pattern in rule_config['patterns']:
                            import re
                            matches = sample_data.str.contains(pattern, regex=True, na=False)
                            if matches.any():
                                detected_pii.append(col)
                                break
                
                results['pii_detection'] = {
                    'detected_pii_columns': detected_pii,
                    'status': 'FAIL' if detected_pii else 'PASS'
                }
            
            elif rule_name == 'data_retention':
                date_column = rule_config['date_column']
                retention_days = rule_config['retention_days']
                
                if date_column in df.columns:
                    df['days_old'] = (pd.Timestamp.now() - pd.to_datetime(df[date_column])).dt.days
                    expired_count = (df['days_old'] > retention_days).sum()
                    
                    results['data_retention'] = {
                        'expired_records': expired_count,
                        'retention_days': retention_days,
                        'status': 'FAIL' if expired_count > 0 else 'PASS'
                    }
        
        return results
```

## 🛠️ 工具集成

### 数据生成工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Faker | 测试数据生成 | 多语言支持、丰富的数据类型 | ⭐⭐⭐⭐⭐ |
| SDV | 合成数据生成 | 保持数据统计特性 | ⭐⭐⭐⭐ |
| CTGAN | 表格数据生成 | 基于GAN的生成模型 | ⭐⭐⭐⭐ |
| Gretel | 隐私保护数据生成 | 差分隐私保护 | ⭐⭐⭐⭐ |

### 数据管理工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| DVC | 数据版本管理 | Git-like操作、与Git集成 | ⭐⭐⭐⭐⭐ |
| Git-LFS | 大文件管理 | Git原生支持、简单易用 | ⭐⭐⭐⭐ |
| LakeFS | 数据湖版本管理 | 分支、合并、回滚 | ⭐⭐⭐⭐ |
| Delta Lake | 数据湖存储 | ACID事务、时间旅行 | ⭐⭐⭐⭐⭐ |

### 数据质量工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Great Expectations | 数据质量监控 | 丰富的期望类型、自动文档 | ⭐⭐⭐⭐⭐ |
| Deequ | 数据质量检查 | 基于Spark、可扩展 | ⭐⭐⭐⭐ |
| Apache Griffin | 数据质量监控 | 大数据支持、可视化 | ⭐⭐⭐⭐ |
| Soda | 数据质量测试 | SQL-based、CI/CD集成 | ⭐⭐⭐⭐ |

### 数据安全工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Apache Ranger | 访问控制 | 细粒度权限、审计日志 | ⭐⭐⭐⭐⭐ |
| Apache Atlas | 元数据管理 | 数据血缘、分类管理 | ⭐⭐⭐⭐⭐ |
| Privacera | 数据隐私管理 | 自动化策略、合规检查 | ⭐⭐⭐⭐ |
| Immuta | 数据访问控制 | 动态策略、合规报告 | ⭐⭐⭐⭐ |

## 📊 性能指标

### 数据处理性能

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 数据加载速度 | ≥1GB/min | 数据加载速率 |
| 数据处理速度 | ≥10GB/hour | 数据处理速率 |
| 数据生成速度 | ≥1000条/s | 测试数据生成速率 |
| 数据查询响应 | ≤5s | 数据查询平均响应时间 |
| 并发处理能力 | ≥100任务 | 并发数据处理任务数 |

### 数据质量指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 数据完整性 | ≥99% | 数据完整度 |
| 数据准确性 | ≥95% | 数据准确度 |
| 数据一致性 | ≥98% | 数据一致度 |
| 数据及时性 | ≥90% | 数据更新及时性 |
| 数据唯一性 | ≥99% | 数据唯一度 |

### 数据安全指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 数据加密率 | 100% | 敏感数据加密比例 |
| 访问控制覆盖率 | 100% | 访问控制覆盖范围 |
| 审计日志完整性 | 100% | 审计日志记录完整性 |
| 合规检查通过率 | 100% | 合规检查通过比例 |

## 🔧 最佳实践

### 数据生成最佳实践

1. **场景化数据生成**
   - 根据业务场景设计数据生成规则
   - 保持数据的业务逻辑一致性
   - 生成覆盖边界条件的数据

2. **数据增强策略**
   - 使用多种增强技术组合
   - 保持数据的统计特性
   - 控制增强比例避免过拟合

3. **数据脱敏规范**
   - 识别敏感数据字段
   - 选择合适的脱敏算法
   - 保持数据的可用性

### 数据管理最佳实践

1. **版本管理规范**
   - 使用语义化版本号
   - 记录数据变更日志
   - 建立数据回滚机制

2. **元数据管理**
   - 建立统一的元数据标准
   - 自动化元数据采集
   - 定期更新元数据

3. **数据生命周期管理**
   - 定义数据保留策略
   - 自动化数据归档
   - 安全销毁过期数据

### 数据质量最佳实践

1. **质量检查自动化**
   - 集成到数据流水线
   - 建立质量门禁
   - 自动生成质量报告

2. **质量监控实时化**
   - 实时监控数据质量指标
   - 设置质量告警阈值
   - 及时处理质量问题

3. **质量治理流程化**
   - 建立质量问题处理流程
   - 定期进行质量评估
   - 持续改进数据质量

### 数据安全最佳实践

1. **安全策略制定**
   - 制定数据分类分级标准
   - 建立访问控制策略
   - 定期进行安全审计

2. **加密技术应用**
   - 传输加密（TLS/SSL）
   - 存储加密（AES-256）
   - 密钥管理规范

3. **合规性管理**
   - 了解相关法规要求
   - 建立合规检查机制
   - 定期进行合规审计

## 🔗 相关资源

- [数据生成技术](/ai-testing-engineering/data-engineering/data-generation/)
- [数据管理方案](/ai-testing-engineering/data-engineering/data-management/)
- [数据质量体系](/ai-testing-engineering/data-engineering/data-quality/)
- [数据安全实践](/ai-testing-engineering/data-engineering/data-security/)
