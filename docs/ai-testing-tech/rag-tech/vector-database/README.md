# RAG向量数据库

> 向量数据库是RAG系统的核心存储和检索基础设施。选择合适的向量数据库需要考虑数据规模、查询性能、功能特性和成本等因素。

---

## 1. 向量数据库选型对比

### 1.1 主流向量数据库对比

| 特性 | Milvus | Pinecone | Weaviate | Qdrant | Chroma | FAISS |
|------|--------|----------|----------|--------|--------|-------|
| **部署方式** | 自托管/云 | 云服务 | 自托管/云 | 自托管/云 | 本地/云 | 纯库 |
| **数据规模** | 十亿级 | 百万-千万 | 百万级 | 百万-千万 | 万级 | 百万级 |
| **查询延迟** | 10-50ms | 5-20ms | 10-30ms | 5-15ms | 5-10ms | <5ms |
| **混合检索** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **重排序** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **多模态** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **向量索引** | HNSW/IVF等 | HNSW | HNSW/IVF | HNSW | HNSW | HNSW/IVF |
| **过滤能力** | 强 | 强 | 强 | 强 | 弱 | 无 |
| **社区活跃度** | 高 | 中 | 高 | 高 | 高 | 高 |
| **许可证** | Apache 2.0 | 商业 | Apache 2.0 | Apache 2.0 | Apache 2.0 | 开源 |
| **价格** | 免费 | $/月 | 免费 | 免费 | 免费 | 免费 |

### 1.2 选型决策树

```
选择向量数据库
    │
    ▼
┌─────────────────┐
│ 数据规模？       │
└────┬────────────┘
     │
     ├─ < 10万 → Chroma / FAISS
     │           (开发测试/小规模生产)
     │
     ├─ 10万-1000万 → Qdrant / Weaviate
     │           (中小规模生产)
     │
     └─ > 1000万 → Milvus / Pinecone
                 (大规模生产)
     │
     ▼
┌─────────────────┐
│ 是否需要云服务？  │
└────┬────────────┘
     │
     ├─ 是 → Pinecone / Milvus Cloud
     │
     └─ 否 → Milvus / Qdrant / Weaviate
```

---

## 2. Milvus深度指南

### 2.1 架构概述

```
Milvus 架构
┌────────────────────────────────────────────────┐
│                   Proxy层                      │
│         (路由、认证、限流)                       │
├──────────┬──────────┬──────────┬───────────────┤
│  Coordinator    │    DataNode      │  IndexNode │
│  (元数据管理)    │  (向量存储)       │ (索引构建)  │
├──────────────────┴──────────────────┴──────────┤
│              Etcd / MinIO                       │
│           (元数据 / 对象存储)                    │
└────────────────────────────────────────────────┘
```

### 2.2 Milvus 基础操作

```python
from pymilvus import (
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
    connections,
)

# 连接Milvus
connections.connect("default", host="localhost", port="19530")

# 1. 定义schema
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="metadata", dtype=DataType.JSON),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1024),
]

schema = CollectionSchema(fields, "RAG知识库")
collection = Collection("knowledge_base", schema)

# 2. 创建索引
index_params = {
    "index_type": "HNSW",
    "metric_type": "IP",  # 内积相似度
    "params": {"M": 16, "efConstruction": 256},
}
collection.create_index("embedding", index_params)
collection.load()

# 3. 插入数据
import random
data = [
    list(range(1000)),
    [f"文档{i}" for i in range(1000)],
    [{"source": f"file{i}.pdf"} for i in range(1000)],
    [[random.random() for _ in range(1024)] for _ in range(1000)],
]
collection.insert(data)

# 4. 搜索
import numpy as np
query_vec = [np.random.random() for _ in range(1024)]
results = collection.search(
    data=[query_vec],
    anns_field="embedding",
    param={"ef": 64},
    limit=10,
    output_fields=["text", "metadata"],
)

# 5. 过滤搜索
results = collection.search(
    data=[query_vec],
    anns_field="embedding",
    param={"ef": 64},
    limit=10,
    output_fields=["text", "metadata"],
    expr='source.category == "technical"',
)

# 6. 删除
collection.delete('id in [1, 2, 3]')
```

### 2.3 Milvus 索引策略

| 索引类型 | 最佳场景 | 精度 | 速度 | 内存 |
|---------|---------|------|------|------|
| **HNSW** | 通用首选 | 高 | 快 | 中 |
| **IVF_FLAT** | 大规模数据集 | 中 | 中 | 低 |
| **IVF_SQ8** | 内存受限 | 中低 | 快 | 低 |
| **SCANN** | 内存受限大集合 | 中 | 中 | 低 |
| **DISKANN** | 超大规模(>1亿) | 高 | 中 | 低 |
| **FLAT** | 小规模高精度 | 最高 | 慢 | 最高 |

---

## 3. Pinecone云原生指南

### 3.1 Pinecone特性

```python
import pinecone

# 初始化
pinecone.init(api_key="your-api-key")

# 创建索引
pinecone.create_index(
    name="my-rag-index",
    dimension=1024,
    metric="cosine",
    spec=pinecone.ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)

# 连接索引
index = pinecone.Index("my-rag-index")

# 批量插入
index.upsert(
    vectors=[
        {
            "id": f"doc_{i}",
            "values": embedding_vector,
            "metadata": {
                "title": "文档标题",
                "source": "file.pdf",
                "category": "technical",
            },
        }
        for i, embedding_vector in enumerate(embeddings)
    ]
)

# 查询（支持过滤）
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={
        "category": {"$eq": "technical"},
        "publish_date": {"$gte": "2024-01-01"},
    },
    include_metadata=True,
)
```

### 3.2 Pinecone最佳实践

1. **命名空间隔离**：按项目/租户使用不同namespace
2. **元数据过滤**：利用metadata filter提高检索精度
3. **稀疏向量**：结合稀疏向量实现混合检索
4. **批量操作**：使用upsert/batch操作减少API调用

---

## 4. Qdrant快速入门

### 4.1 Qdrant特色

```python
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

# 连接
client = QdrantClient(host="localhost", port=6333)

# 创建集合
client.create_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(
        size=1024,
        distance=Distance.COSINE,
    ),
)

# 插入数据
client.upsert(
    collection_name="knowledge_base",
    points=[
        PointStruct(
            id=i,
            vector=embedding_vector,
            payload={
                "text": "文档内容",
                "source": "file.pdf",
                "category": "technical",
            },
        )
        for i, embedding_vector in enumerate(embeddings)
    ],
)

# 搜索（带过滤）
results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="category",
                match=MatchValue(value="technical"),
            )
        ]
    ),
    limit=10,
)
```

### 4.2 Qdrant索引配置

```python
# HNSW索引参数优化
client.create_payload_index(
    collection_name="knowledge_base",
    field_name="category",
    field_schema="keyword",
)

# 集合配置
client.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(
        size=1024,
        distance=Distance.COSINE,
        hnsw_config=HnswConfigDiff(
            m=16,           # 每个节点的连接数
            ef_construct=256,  # 构建时的搜索宽度
            full_scan_threshold=10000,  # 全扫描阈值
        ),
    ),
)
```

---

## 5. Weaviate多模态指南

### 5.1 多模态向量搜索

```python
import weaviate
from weaviate.classes.config import Configure, Property, DataType

# 连接
client = weaviate.connect_to_local()

# 创建集合（支持多模态）
client.collections.create(
    name="MultimodalKnowledge",
    vectorizer_config=[
        Configure.Multi2VecClip(  # 支持文本和图像
            model="ViT-L/14",
            image_field="image",
            text_fields=["text"],
        )
    ],
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="source", data_type=DataType.TEXT),
    ],
)

# 插入图文数据
collection = client.collections.get("MultimodalKnowledge")
collection.data.insert(
    properties={
        "title": "架构图",
        "source": "docs/arch.png",
    },
    vector={
        "image": image_embedding,
        "text": text_embedding,
    },
)

# 混合搜索
results = collection.query.hybrid(
    query="系统架构",
    vector=query_vector,
    limit=10,
)
```

---

## 6. Chroma嵌入式指南（开发测试）

### 6.1 快速集成

```python
import chromadb

# 嵌入式数据库（无需独立服务）
client = chromadb.Client()

# 创建集合
collection = client.create_collection(
    name="rag_knowledge",
    metadata={"hnsw:space": "cosine"},
)

# 批量添加
collection.add(
    documents=["文档内容1", "文档内容2"],
    metadatas=[
        {"source": "file1.pdf", "category": "tech"},
        {"source": "file2.pdf", "category": "docs"},
    ],
    ids=["doc1", "doc2"],
)

# 查询
results = collection.query(
    query_texts=["查询文本"],
    n_results=5,
    where={"category": "tech"},
)
```

---

## 7. 向量数据库运维

### 7.1 性能调优

```
性能调优清单

┌─────────────────────────────────────────────────────────┐
│ 索引优化                                                │
│  • 选择合适的索引类型（HNSW为首选）                       │
│  • 调整M和ef参数平衡精度与速度                            │
│  • 定期重建索引以优化结构                                 │
├─────────────────────────────────────────────────────────┤
│ 查询优化                                                │
│  • 设置合理的top_k值                                    │
│  • 使用过滤条件减少搜索空间                                │
│  • 启用缓存提高高频查询性能                               │
├────────��────────────────────────────────────────────────┤
│ 存储优化                                                │
│  • 定期清理过期/重复数据                                  │
│  • 使用压缩降低存储成本                                   │
│  • 监控存储使用率预警                                     │
├─────────────────────────────────────────────────────────┤
│ 监控指标                                                │
│  • 查询延迟（P50/P95/P99）                               │
│  • 查询QPS                                             │
│  • 索引构建时间                                          │
│  • 内存/CPU使用率                                       │
└─────────────────────────────────────────────────────────┘
```

### 7.2 高可用部署

```yaml
# Docker Compose Milvus部署示例
version: '3.5'
services:
  etcd:
    image: quay.io/coreos/etcd:v3.5.5
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls=http://0.0.0.0:2379

  minio:
    image: minio/minio:RELEASE.2023-03-20_20.16.13
    command: minio server /minio_data
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin

  pulsar:
    image: apachepulsar/pulsar:2.10.5
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/pulsar:/pulsar/data

  milvus-standalone:
    image: milvusdb/milvus:v2.4.0
    command: milvus run standalone
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
      PULSAR_ADDRESS: pulsar:6650
    ports:
      - "19530:19530"
      - "9091:9091"
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
```

---

## 8. 选型总结

| 需求 | 推荐方案 |
|------|---------|
| 开发测试/小规模 | Chroma / FAISS |
| 中等规模生产 | Qdrant / Weaviate |
| 大规模生产 | Milvus / Pinecone |
| 需要多模态 | Weaviate / Milvus |
| 需要云服务 | Pinecone / Milvus Cloud |
| 预算有限 | Milvus / Qdrant / Weaviate |
| 快速原型 | Chroma / FAISS |

---

*最后更新：2025-01-15 | 维护团队：RAG技术组*
