# 数据存储与治理

测试平台数据管理技术。

## 时序数据

性能指标时序存储。

- InfluxDB：时序数据库
- Prometheus：监控指标
- TimescaleDB：PostgreSQL扩展
- 数据保留策略

### 时序数据管理

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import time

@dataclass
class MetricPoint:
    """指标数据点"""
    timestamp: datetime
    metric_name: str
    value: float
    tags: Dict[str, str]
    
    def to_line_protocol(self) -> str:
        """转换为InfluxDB Line Protocol"""
        tags_str = ",".join([f"{k}={v}" for k, v in self.tags.items()])
        return f"{self.metric_name},{tags_str} value={self.value} {int(self.timestamp.timestamp() * 1e9)}"

class TimeSeriesDB:
    """
    时序数据库客户端
    封装时序数据操作
    """
    def __init__(self, url: str = "http://localhost:8086",
                 token: str = None,
                 org: str = "test-org",
                 bucket: str = "test-metrics"):
        """
        初始化客户端
        
        Args:
            url: InfluxDB地址
            token: 认证token
            org: 组织
            bucket: 存储桶
        """
        self.url = url
        self.token = token
        self.org = org
        self.bucket = bucket
        
        try:
            from influxdb_client import InfluxDBClient
            self.client = InfluxDBClient(url=url, token=token, org=org)
            self.write_api = self.client.write_api()
            self.query_api = self.client.query_api()
        except ImportError:
            self.client = None
    
    def write_metric(self, point: MetricPoint):
        """
        写入指标
        
        Args:
            point: 指标数据点
        """
        if not self.client:
            return
        
        from influxdb_client import Point as InfluxPoint
        
        p = InfluxPoint(point.metric_name) \
            .time(point.timestamp) \
            .field("value", point.value)
        
        for k, v in point.tags.items():
            p = p.tag(k, v)
        
        self.write_api.write(bucket=self.bucket, record=p)
    
    def query_metrics(self, metric_name: str,
                     start: str = "-1h",
                     tags: Dict[str, str] = None) -> List[Dict]:
        """
        查询指标
        
        Args:
            metric_name: 指标名称
            start: 开始时间
            tags: 标签过滤
            
        Returns:
            list: 指标数据
        """
        if not self.client:
            return []
        
        filter_conditions = f'|> filter(fn: (r) => r._measurement == "{metric_name}")'
        
        if tags:
            for k, v in tags.items():
                filter_conditions += f'|> filter(fn: (r) => r.{k} == "{v}")'
        
        query = f'''
        from(bucket: "{self.bucket}")
            |> range(start: {start})
            {filter_conditions}
        '''
        
        tables = self.query_api.query(query)
        
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time(),
                    "value": record.get_value(),
                    "tags": record.values
                })
        
        return results
    
    def get_aggregated_stats(self, metric_name: str,
                            start: str = "-1h",
                            window: str = "5m") -> List[Dict]:
        """
        获取聚合统计
        
        Args:
            metric_name: 指标名称
            start: 开始时间
            window: 聚合窗口
            
        Returns:
            list: 聚合结果
        """
        query = f'''
        from(bucket: "{self.bucket}")
            |> range(start: {start})
            |> filter(fn: (r) => r._measurement == "{metric_name}")
            |> aggregateWindow(every: {window}, fn: mean)
        '''
        
        tables = self.query_api.query(query)
        
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time(),
                    "mean": record.get_value()
                })
        
        return results
```

## 知识图谱

测试知识关联存储。

- 实体关系建模
- 图查询语言
- 知识推理
- 可视化展示

### 测试知识图谱

```python
class TestKnowledgeGraph:
    """
    测试知识图谱
    管理测试领域的知识关联
    """
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687",
                 user: str = "neo4j",
                 password: str = "password"):
        """
        初始化图谱
        
        Args:
            neo4j_uri: Neo4j地址
            user: 用户名
            password: 密码
        """
        try:
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(neo4j_uri, 
                                              auth=(user, password))
        except ImportError:
            self.driver = None
    
    def add_test_case(self, case_id: str, name: str,
                     tags: List[str], module: str):
        """
        添加测试用例节点
        
        Args:
            case_id: 用例ID
            name: 用例名称
            tags: 标签
            module: 所属模块
        """
        if not self.driver:
            return
        
        with self.driver.session() as session:
            session.run("""
                MERGE (tc:TestCase {id: $id})
                SET tc.name = $name, tc.module = $module
            """, id=case_id, name=name, module=module)
            
            for tag in tags:
                session.run("""
                    MERGE (t:Tag {name: $tag})
                    WITH t
                    MATCH (tc:TestCase {id: $id})
                    MERGE (tc)-[:HAS_TAG]->(t)
                """, tag=tag, id=case_id)
    
    def add_defect(self, defect_id: str, description: str,
                  severity: str, related_cases: List[str] = None):
        """
        添加缺陷节点
        
        Args:
            defect_id: 缺陷ID
            description: 描述
            severity: 严重级别
            related_cases: 关联用例
        """
        if not self.driver:
            return
        
        with self.driver.session() as session:
            session.run("""
                MERGE (d:Defect {id: $id})
                SET d.description = $description, d.severity = $severity
            """, id=defect_id, description=description, severity=severity)
            
            if related_cases:
                for case_id in related_cases:
                    session.run("""
                        MATCH (d:Defect {id: $defect_id})
                        MATCH (tc:TestCase {id: $case_id})
                        MERGE (tc)-[:HAS_DEFECT]->(d)
                    """, defect_id=defect_id, case_id=case_id)
    
    def find_related_cases(self, case_id: str) -> List[Dict]:
        """
        查找相关用例
        
        Args:
            case_id: 用例ID
            
        Returns:
            list: 相关用例
        """
        if not self.driver:
            return []
        
        with self.driver.session() as session:
            result = session.run("""
                MATCH (tc:TestCase {id: $id})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(related:TestCase)
                WHERE related.id <> $id
                RETURN related.id as id, related.name as name, count(t) as common_tags
                ORDER BY common_tags DESC
                LIMIT 10
            """, id=case_id)
            
            return [dict(record) for record in result]
    
    def get_module_coverage(self, module: str) -> Dict:
        """
        获取模块覆盖信息
        
        Args:
            module: 模块名称
            
        Returns:
            dict: 覆盖信息
        """
        if not self.driver:
            return {}
        
        with self.driver.session() as session:
            result = session.run("""
                MATCH (tc:TestCase {module: $module})
                OPTIONAL MATCH (tc)-[:HAS_DEFECT]->(d:Defect)
                RETURN 
                    count(tc) as total_cases,
                    count(d) as total_defects,
                    collect(DISTINCT d.severity) as severity_distribution
            """, module=module)
            
            record = result.single()
            return dict(record) if record else {}
```

## 向量数据库

语义检索与相似度搜索。

- 测试用例语义检索
- 历史结果相似度搜索
- 缺陷模式匹配
- Embedding存储

### 向量数据库集成

```python
import numpy as np
from typing import List, Dict, Tuple

class VectorStore:
    """
    向量数据库客户端
    用于语义检索和相似度搜索
    """
    def __init__(self, collection_name: str = "test_cases",
                 dimension: int = 768):
        """
        初始化向量存储
        
        Args:
            collection_name: 集合名称
            dimension: 向量维度
        """
        self.collection_name = collection_name
        self.dimension = dimension
        
        try:
            from qdrant_client import QdrantClient
            self.client = QdrantClient(host="localhost", port=6333)
            self._ensure_collection()
        except ImportError:
            self.client = None
            self._local_store: List[Dict] = []
    
    def _ensure_collection(self):
        """确保集合存在"""
        from qdrant_client.models import Distance, VectorParams
        
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE
                )
            )
    
    def add_vectors(self, ids: List[str],
                   vectors: List[List[float]],
                   payloads: List[Dict] = None):
        """
        添加向量
        
        Args:
            ids: ID列表
            vectors: 向量列表
            payloads: 附加数据
        """
        if self.client:
            from qdrant_client.models import PointStruct
            
            points = []
            for i, (id_, vector) in enumerate(zip(ids, vectors)):
                payload = payloads[i] if payloads else {}
                points.append(PointStruct(
                    id=id_,
                    vector=vector,
                    payload=payload
                ))
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
        else:
            # 本地存储降级
            for i, (id_, vector) in enumerate(zip(ids, vectors)):
                self._local_store.append({
                    "id": id_,
                    "vector": np.array(vector),
                    "payload": payloads[i] if payloads else {}
                })
    
    def search_similar(self, query_vector: List[float],
                      top_k: int = 5,
                      filter_conditions: Dict = None) -> List[Dict]:
        """
        相似度搜索
        
        Args:
            query_vector: 查询向量
            top_k: 返回数量
            filter_conditions: 过滤条件
            
        Returns:
            list: 搜索结果
        """
        if self.client:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k
            )
            
            return [
                {
                    "id": r.id,
                    "score": r.score,
                    "payload": r.payload
                }
                for r in results
            ]
        else:
            # 本地相似度计算
            query = np.array(query_vector)
            similarities = []
            
            for item in self._local_store:
                similarity = np.dot(query, item["vector"]) / (
                    np.linalg.norm(query) * np.linalg.norm(item["vector"])
                )
                similarities.append((similarity, item))
            
            similarities.sort(key=lambda x: x[0], reverse=True)
            
            return [
                {
                    "id": item["id"],
                    "score": float(score),
                    "payload": item["payload"]
                }
                for score, item in similarities[:top_k]
            ]
    
    def find_similar_test_cases(self, case_embedding: List[float],
                                threshold: float = 0.8) -> List[Dict]:
        """
        查找相似测试用例
        
        Args:
            case_embedding: 用例Embedding
            threshold: 相似度阈值
            
        Returns:
            list: 相似用例
        """
        results = self.search_similar(case_embedding, top_k=10)
        return [r for r in results if r["score"] >= threshold]

class EmbeddingGenerator:
    """
    Embedding生成器
    生成文本的向量表示
    """
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        初始化生成器
        
        Args:
            model_name: 模型名称
        """
        self.model_name = model_name
        self.model = None
        
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
        except ImportError:
            pass
    
    def encode(self, texts: List[str]) -> List[List[float]]:
        """
        编码文本
        
        Args:
            texts: 文本列表
            
        Returns:
            list: 向量列表
        """
        if self.model:
            embeddings = self.model.encode(texts)
            return embeddings.tolist()
        
        # 降级方案：随机向量
        return [np.random.randn(768).tolist() for _ in texts]
```

## 最佳实践

1. **数据分层**：热数据/温数据/冷数据分层存储
2. **备份策略**：定期备份关键数据
3. **访问控制**：基于角色的数据访问控制
4. **数据质量**：数据校验和清洗流程
5. **性能优化**：索引优化和查询优化
