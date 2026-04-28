# RAG检索策略

> RAG（Retrieval-Augmented Generation）的检索策略直接影响生成质量。本文档涵盖向量检索、混合检索、重排序等核心检索策略及优化方法。

---

## 1. 检索策略概述

### 1.1 RAG检索流程

```
用户查询
    │
    ▼
┌─────────────┐
│  查询理解    │  ← 查询扩展、重写、分解
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  检索策略    │  ← 向量检索 / 关键词检索 / 混合检索
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  重排序      │  ← Cross-Encoder重排序
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  上下文选择  │  ← 上下文压缩、过滤、截断
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  生成响应    │
└─────────────┘
```

### 1.2 检索策略对比

| 策略 | 精度 | 速度 | 适用场景 | 成本 |
|------|------|------|---------|------|
| **向量检索（Dense）** | 中 | 快 | 语义相似度搜索 | 低 |
| **关键词检索（Sparse）** | 中 | 快 | 精确匹配、专有名词 | 低 |
| **混合检索（Hybrid）** | 高 | 中 | 通用场景 | 中 |
| **跨编码器重排序** | 很高 | 慢 | 结果精炼 | 高 |
| **多路检索+融合** | 很高 | 慢 | 高要求场景 | 很高 |

---

## 2. 向量检索（Dense Retrieval）

### 2.1 基本原理

```python
# 向量检索核心流程
import numpy as np

class DenseRetriever:
    """基于向量相似度的检索器"""
    
    def __init__(self, embedding_model, index):
        self.embedding = embedding_model
        self.index = index  # 向量索引（FAISS/HNSW等）
    
    def embed_query(self, query: str) -> np.ndarray:
        """将查询转换为向量"""
        return self.embedding.encode(query)
    
    def search(self, query: str, top_k: int = 10) -> List[Document]:
        """执行向量检索"""
        # 1. 将查询转换为向量
        query_vector = self.embed_query(query)
        
        # 2. 在向量索引中搜索最近邻
        scores, indices = self.index.search(query_vector, top_k)
        
        # 3. 返回结果
        results = []
        for score, idx in zip(scores, indices):
            doc = self.index.get_document(idx)
            results.append({
                'document': doc,
                'similarity_score': float(score),
                'rank': len(results) + 1,
            })
        
        return results
```

### 2.2 嵌入模型选择

| 模型 | 维度 | 平均精度 | 特点 | 适用场景 |
|------|------|---------|------|---------|
| **text-embedding-3-small** | 1536/512/256 | 0.58 | OpenAI | 通用 |
| **text-embedding-3-large** | 3072/1024/256 | 0.64 | OpenAI | 高精度需求 |
| **bge-large-zh** | 1024 | 0.62 | BAAI | 中文场景 |
| **bge-m3** | 1024 | 0.66 | BAAI | 多语言+多粒度 |
| **e5-mistral** | 4096 | 0.61 | Microsoft | 推理增强 |
| **nomic-embed** | 768 | 0.59 | Nomic | 开源可商用 |

### 2.3 向量索引优化

```python
class IndexOptimizer:
    """向量索引优化"""
    
    # FAISS索引类型选择
    INDEX_TYPES = {
        'flat': {
            'description': '暴力搜索，最高精度',
            'speed': '慢',
            'memory': '高',
            'scale': '< 10万',
        },
        'hnsw': {
            'description': '分层可导航小世界，平衡精度与速度',
            'speed': '快',
            'memory': '中',
            'scale': '10万-1亿',
        },
        'ivf': {
            'description': '倒���文件索引，适合大数据集',
            'speed': '中',
            'memory': '中',
            'scale': '100万-10亿',
        },
        'diskann': {
            'description': '基于磁盘的ANN，适合超大规模',
            'speed': '中',
            'memory': '低',
            'scale': '10亿+',
        },
    }
    
    def recommend_index(self, dataset_size: int, 
                        latency_requirement: str = 'fast') -> str:
        """根据数据规模和延迟要求推荐索引类型"""
        if dataset_size < 100_000:
            return 'flat'
        elif dataset_size < 1_000_000:
            if latency_requirement == 'ultra_fast':
                return 'hnsw'
            return 'hnsw'
        elif dataset_size < 100_000_000:
            return 'ivf'
        else:
            return 'diskann'
```

---

## 3. 混合检索（Hybrid Search）

### 3.1 BM25 + Dense 混合

```python
class HybridRetriever:
    """混合检索器：BM25 + 向量检索"""
    
    def __init__(self, bm25_retriever, dense_retriever):
        self.bm25 = bm25_retriever
        self.dense = dense_retriever
    
    def search(self, query: str, top_k: int = 10, 
               alpha: float = 0.7) -> List[Dict]:
        """
        执行混合检索
        
        参数:
            alpha: Dense检索权重 (0-1)
                   alpha=0: 纯BM25
                   alpha=1: 纯Dense
                   alpha=0.7: 推荐值
        """
        # 1. 分别执行两种检索
        bm25_results = self.bm25.search(query, top_k=top_k * 2)
        dense_results = self.dense.search(query, top_k=top_k * 2)
        
        # 2. 归一化分数
        bm25_scores = self._normalize_scores(
            {r['doc_id']: r['score'] for r in bm25_results}
        )
        dense_scores = self._normalize_scores(
            {r['doc_id']: r['similarity_score'] for r in dense_results}
        )
        
        # 3. 加权融合
        all_doc_ids = set(bm25_scores.keys()) | set(dense_scores.keys())
        fused_results = []
        
        for doc_id in all_doc_ids:
            bm25_score = bm25_scores.get(doc_id, 0)
            dense_score = dense_scores.get(doc_id, 0)
            
            # 融合分数
            fused_score = alpha * dense_score + (1 - alpha) * bm25_score
            
            fused_results.append({
                'doc_id': doc_id,
                'fused_score': fused_score,
                'bm25_score': bm25_score,
                'dense_score': dense_score,
                'alpha': alpha,
            })
        
        # 4. 排序并取top_k
        fused_results.sort(key=lambda x: x['fused_score'], reverse=True)
        return fused_results[:top_k]
    
    def _normalize_scores(self, scores: Dict[str, float]) -> Dict[str, float]:
        """将分数归一化到[0, 1]"""
        if not scores:
            return {}
        max_score = max(scores.values())
        min_score = min(scores.values())
        range_score = max_score - min_score if max_score != min_score else 1
        
        return {
            doc_id: (score - min_score) / range_score
            for doc_id, score in scores.items()
        }
```

### 3.2 自适应权重调优

```python
class AdaptiveWeightTuner:
    """自适应权重调优"""
    
    def optimize_alpha(self, query: str, 
                       validation_set: List[Dict]) -> float:
        """
        根据查询特征自适应选择alpha
        
        策略:
        - 专有名词多的查询 → 降低alpha（偏BM25）
        - 语义查询多的 → 提高alpha（偏Dense）
        - 短查询 → 降低alpha
        - 长查询 → 提高alpha
        """
        # 分析查询特征
        features = self._extract_query_features(query)
        
        # 基于特征的权重计算
        alpha = 0.7  # 默认值
        
        if features['proper_noun_ratio'] > 0.3:
            alpha -= 0.2  # 专有名词多，减少向量权重
        if features['query_length'] < 5:
            alpha -= 0.15  # 短查询，减少向量权重
        if features['semantic_density'] > 0.8:
            alpha += 0.1   # 语义丰富，增加向量权重
        
        return max(0, min(1, alpha))
    
    def _extract_query_features(self, query: str) -> Dict:
        """提取查询特征"""
        words = query.split()
        word_set = set(words)
        
        return {
            'query_length': len(words),
            'unique_ratio': len(word_set) / max(len(words), 1),
            'proper_noun_ratio': self._estimate_proper_nouns(words),
            'semantic_density': self._estimate_semantic_content(words),
        }
```

---

## 4. 查询优化策略

### 4.1 查询扩展

```python
class QueryExpander:
    """查询扩展器"""
    
    def expand(self, original_query: str, 
               context: str = None) -> List[str]:
        """
        生成多个扩展查询
        
        扩展策略:
        1. 同义词扩展
        2. 术语扩展
        3. 泛化/特化扩展
        4. 多语言扩展
        """
        expansions = [original_query]
        
        # 1. 同义词扩展
        synonyms = self._get_synonyms(original_query)
        expansions.extend(synonyms[:3])
        
        # 2. 概念扩展
        concepts = self._extract_concepts(original_query)
        for concept in concepts:
            expanded_terms = self._expand_concept(concept)
            expansions.extend(expanded_terms[:2])
        
        # 3. 如果提供了上下文，基于上下文扩展
        if context:
            context_relevant = self._contextual_expand(
                original_query, context
            )
            expansions.extend(context_relevant[:2])
        
        return list(set(expansions))  # 去重
```

### 4.2 查询重写

```python
class QueryRewriter:
    """查询重写器 - 使用LLM优化查询"""
    
    def rewrite(self, query: str, 
                history: List[str] = None) -> str:
        """
        重写查询以提高检索效果
        
        重写策略:
        1. 歧义消解
        2. 信息补充
        3. 简化/抽象
        4. 多轮对话消解
        """
        if history:
            # 多轮对话：消解代词，补充上下文
            rewritten = self._resolve_coreference(query, history)
        else:
            rewritten = query
        
        # 根据查询类型应用不同策略
        query_type = self._classify_query(query)
        
        if query_type == 'ambiguous':
            rewritten = self._disambiguate(rewritten)
        elif query_type == 'too_specific':
            rewritten = self._generalize(rewritten)
        elif query_type == 'too_broad':
            rewritten = self._specialize(rewritten)
        
        return rewritten
    
    def _resolve_coreference(self, query: str, 
                             history: List[str]) -> str:
        """多轮对话中的代词消解"""
        prompt = f"""
        以下是对话历史：
        {history}
        
        用户最新问题：{query}
        
        请消解其中的代词（他/她/它/这个/那个等），
        生成一个独立完整的查询。
        """
        return llm.generate(prompt)
```

### 4.3 查询分解

```python
class QueryDecomposer:
    """复杂查询分解器"""
    
    def decompose(self, query: str) -> List[Query]:
        """
        将复杂查询分解为多个简单子查询
        
        分解类型:
        1. 并列分解：查询A和B
        2. 嵌套分解：查询A，然后基于结果查询B
        3. 对比分解：对比A和B的特征
        4. 因果分解：查询A的原因和结果
        """
        prompt = f"""
        请将以下复杂查询分解为可独立检索的子查询：
        
        原始查询：{query}
        
        请输出：
        1. 分解后的子查询列表
        2. 每个子查询的类型（并列/嵌套/对比/因果）
        3. 子查询之间的依赖关系
        """
        result = llm.generate(prompt)
        return self._parse_decomposition(result)
```

---

## 5. 重排序（Re-ranking）

### 5.1 Cross-Encoder重排序

```python
class CrossEncoderReranker:
    """Cross-Encoder重排序器"""
    
    def __init__(self, reranker_model):
        self.model = reranker_model
    
    def rerank(self, query: str, 
               candidates: List[Dict], 
               top_k: int = 5) -> List[Dict]:
        """
        对候选文档进行重排序
        
        原理:
        - 双编码器（Dense retrieval）：独立编码查询和文档，适合大规模检索
        - Cross-Encoder：同时编码查询和文档对，捕捉细粒度交互，适合精炼排序
        """
        # 构建查询-文档对
        pairs = [(query, c['document'].text) for c in candidates]
        
        # 批量计算相关性分数
        scores = self.model.predict(pairs)
        
        # 添加分数到候选结果
        for candidate, score in zip(candidates, scores):
            candidate['rerank_score'] = float(score)
            candidate['original_rank'] = candidate.get('rank', 0)
        
        # 按重排序分数排序
        candidates.sort(key=lambda x: x['rerank_score'], reverse=True)
        
        return candidates[:top_k]
```

### 5.2 重排序策略选择

| 场景 | 策略 | 理由 |
|------|------|------|
| 实时应用，latency < 100ms | 不使用重排序 | Cross-Encoder太慢 |
| 实时应用，latency < 500ms | Light-weight重排序（如BGE-Reranker） | 平衡精度和速度 |
| 离线批处理 | Cross-Encoder重排序 | 追求最高精度 |
| 高精度需求 | Multi-stage重排序 | 多层精排 |

---

## 6. 上下文选择策略

### 6.1 上下文压缩

```python
class ContextCompressor:
    """上下文压缩器"""
    
    def compress(self, documents: List[Document], 
                 query: str, 
                 max_tokens: int = 4000) -> str:
        """
        压缩检索到的上下文
        
        策略:
        1. 信息重要性排序
        2. 冗余去除
        3. 关键信息提取
        """
        # 1. 评分
        scored_docs = self._score_documents(documents, query)
        
        # 2. 贪心选择
        selected = self._greedy_selection(scored_docs, max_tokens)
        
        # 3. 合并压缩
        compressed = self._merge_and_compress(selected, query)
        
        return compressed
    
    def _score_documents(self, documents: List[Document],
                         query: str) -> List[Dict]:
        """对文档进行信息密度评分"""
        scores = []
        for doc in documents:
            # 多维度评分
            relevance_score = self._compute_relevance(doc.text, query)
            information_density = self._compute_info_density(doc.text)
            uniqueness = self._compute_uniqueness(doc.text, documents)
            
            # 加权综合
            final_score = (
                relevance_score * 0.5 +
                information_density * 0.3 +
                uniqueness * 0.2
            )
            
            scores.append({
                'document': doc,
                'score': final_score,
                'relevance': relevance_score,
                'density': information_density,
                'uniqueness': uniqueness,
            })
        
        return scores
```

### 6.2 自适应上下文截断

```python
class AdaptiveTruncator:
    """自适应上下文截断"""
    
    def truncate(self, context: str, 
                 query: str,
                 max_tokens: int) -> str:
        """
        根据查询需求自适应截断上下文
        
        策略:
        - 查询涉及具体内容 → 保留开头和结尾
        - 查询需要完整理解 → 保留中间关键段落
        - 多文档场景 → 按相关性排序后截断
        """
        tokens = self._tokenize(context)
        
        if len(tokens) <= max_tokens:
            return context  # 不需要截断
        
        # 根据查询类型决定截断策略
        query_type = self._classify_query_type(query)
        
        if query_type == 'factual':
            # 事实性查询：保留最相关的片段
            return self._extract_relevant_segments(context, query, max_tokens)
        elif query_type == 'summary':
            # 总结性查询：保留开头和结尾
            return self._head_tail(context, max_tokens)
        elif query_type == 'comparative':
            # 对比性查询：保留所有文档的开头
            return self._preserve_beginnings(context, max_tokens)
        
        # 默认：中心优先
        return self._center_focused(context, max_tokens)
```

---

## 7. RAG检索效果评估

### 7.1 评估指标

| 指标 | 定义 | 计算公式 | 理想值 |
|------|------|---------|--------|
| **Recall@K** | K个结果中相关文档的比例 | 相关数/K | 1.0 |
| **MRR@K** | 第一个相关文档排名的倒数均值 | mean(1/rank) | 1.0 |
| **NDCG@K** | 归一化折损累计增益 | 综合排序质量 | 1.0 |
| **Precision@K** | K个结果中相关文档的比例 | 相关数/K | 1.0 |
| **Hit Rate** | 至少有一个相关文档 | hit数/总查询 | 1.0 |

### 7.2 自动化评估流水线

```python
class RetrievalEvaluator:
    """检索效果自动化评估"""
    
    def evaluate(self, retriever: BaseRetriever,
                 test_set: List[TestSample]) -> Dict:
        """
        评估检索器效果
        
        test_sample结构:
        {
            'query': '用户查询',
            'relevant_docs': ['相关文档ID列表'],
            'expected_answer': '预期答案'
        }
        """
        metrics = {
            'recall@5': [],
            'recall@10': [],
            'mrr@10': [],
            'hit_rate@5': [],
            'ndcg@5': [],
            'ndcg@10': [],
            'latency_ms': [],
        }
        
        for sample in test_set:
            # 执行检索
            start_time = time.time()
            results = retriever.search(sample['query'], top_k=10)
            latency = (time.time() - start_time) * 1000
            
            metrics['latency_ms'].append(latency)
            
            # 计算指标
            relevant_ids = set(sample['relevant_docs'])
            retrieved_ids = [r['doc_id'] for r in results[:10]]
            
            # Recall@K
            for k in [5, 10]:
                hit_count = len(set(retrieved_ids[:k]) & relevant_ids)
                metrics[f'recall@{k}'].append(hit_count / len(relevant_ids))
            
            # MRR
            for i, doc_id in enumerate(retrieved_ids[:10]):
                if doc_id in relevant_ids:
                    metrics['mrr@10'].append(1 / (i + 1))
                    break
            
            # Hit Rate
            metrics['hit_rate@5'].append(
                1 if set(retrieved_ids[:5]) & relevant_ids else 0
            )
            
            # NDCG
            for k in [5, 10]:
                dcg = self._compute_dcg(retrieved_ids[:k], relevant_ids)
                idcg = self._compute_idcg(len(relevant_ids), k)
                metrics[f'ndcg@{k}'].append(dcg / idcg if idcg > 0 else 0)
        
        # 汇总
        return {
            metric: {
                'mean': np.mean(values),
                'std': np.std(values),
                'min': np.min(values),
                'max': np.max(values),
            }
            for metric, values in metrics.items()
        }
```

---

## 8. 策略优化建议

### 8.1 根据场景选择策略

| 场景 | 推荐策略 | 理由 |
|------|---------|------|
| **企业内部知识库** | 混合检索 + Cross-Encoder重排 | 高精度要求，延迟可接受 |
| **客服机器人** | 混合检索 + Light重排 | 平衡精度和响应速度 |
| **实时搜索** | 混合检索 | 快速响应，可接受一定精度损失 |
| **学术研究** | 多路检索 + 深度重排 | 最高精度需求 |
| **移动端应用** | 向量检索 + 上下文压缩 | 资源受限 |

### 8.2 持续优化方法

1. **检索质量监控**：跟踪每次检索的效果指标
2. **Bad Case分析**：定期分析检索失败的案例
3. **查询日志分析**：识别高频查询和改进机会
4. **A/B测试**：对比不同检索策略的效果
5. **嵌入模型微调**：针对领域数据优化嵌入模型

---

## 9. 工具与资源

| 工具 | 功能 | 链接 |
|------|------|------|
| **FAISS** | 向量检索库 | Facebook AI |
| **Milvus** | 向量数据库 | Zilliz |
| **Elasticsearch** | 混合检索 | Elastic |
| **BGE-Reranker** | 重排序模型 | BAAI |
| **LangChain** | RAG框架 | LangChain |
| **LlamaIndex** | RAG框架 | LlamaIndex |

---

*最后更新：2025-01-15 | 维护团队：RAG技术组*
