# 多模态RAG

> 多模态RAG将视觉信息与文本知识结合，支持图像、文档、视频等多源信息的检索和生成。本文档涵盖核心架构、技术和实践方法。

---

## 1. 多模态RAG架构

### 1.1 完整架构

```
多模态RAG系统
┌─────────────────────────────────────────────────────────┐
│                      用户输入层                         │
│         文本查询 / 图像上传 / 混合输入                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     查询理解层                           │
│  • 多模态查询解析                                        │
│  • 意图识别                                             │
│  • 模态融合判断                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     多模态检索层                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 文本检索  │ │ 图像检索  │ │ 文档检索  │ │ 视频检索  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│           ↓                    ↓                        │
│        向量融合 + 重排序                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     多模态理解层                         │
│  • 视觉编码器（图像/视频帧）                               │
│  • 跨模态对齐                                             │
│  • 上下文融合                                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    多模态生成层                           │
│  • 视觉-语言模型（VLM）                                   │
│  • 多模态上下文组装                                       │
│  • 响应生成（文本+可选图像）                                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 多模态检索策略

```python
class MultimodalRetriever:
    """多模态检索器"""
    
    def __init__(self, text_retriever, image_retriever, 
                 cross_modal_encoder):
        self.text_retriever = text_retriever
        self.image_retriever = image_retriever
        self.cross_modal_encoder = cross_modal_encoder
    
    def search(self, query: Union[str, Image], 
               query_type: str = 'text',
               top_k: int = 10) -> MultimodalResults:
        """
        多模态查询检索
        
        查询类型:
        - text: 文本查询 → 检索文本+相关图像
        - image: 图像查询 → 检索相似图像+相关文本
        - hybrid: 混合查询
        """
        if query_type == 'text':
            # 文本查询：同时检索文本和相关图像
            text_results = self.text_retriever.search(
                query, top_k=top_k
            )
            image_results = self.image_retriever.search_by_text(
                query, top_k=top_k // 2
            )
            
        elif query_type == 'image':
            # 图像查询：检索相似图像和描述
            image_results = self.image_retriever.search(
                query, top_k=top_k
            )
            text_results = self.text_retriever.search_by_image(
                query, top_k=top_k
            )
        
        # 跨模态融合
        fused_results = self._cross_modal_fusion(
            text_results, image_results, query
        )
        
        return fused_results[:top_k]
```

---

## 2. 视觉编码技术

### 2.1 图像编码模型

| 模型 | 类型 | 维度 | 特点 | 适用场景 |
|------|------|------|------|---------|
| **CLIP-ViT-L/14** | 图文对比 | 768 | 通用图文匹配 | 通用多模态 |
| **SigLIP-So400M** | 图文对比 | 1152 | 大规模训练 | 高精度检索 |
| **InternVL-2** | 多模态对话 | 4096 | 详细理解 | 复杂图像问答 |
| **Qwen2-VL** | 视频理解 | 3584 | 视频+图像 | 视频RAG |
| **BLIP-2** | 问答驱动 | 2048 | 轻量高效 | 实时应用 |

### 2.2 图像编码实现

```python
class ImageEncoder:
    """图像编码器"""
    
    def __init__(self, model_name: str = 'clip-vit-large-patch14'):
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()
    
    def encode(self, image: Image) -> np.ndarray:
        """将图像编码为向量"""
        inputs = self.processor(images=image, return_tensors='pt')
        
        with torch.no_grad():
            image_features = self.model.get_image_features(
                **inputs
            )
            image_features = image_features / image_features.norm(
                dim=-1, keepdim=True
            )
        
        return image_features.cpu().numpy()[0]
    
    def encode_batch(self, images: List[Image]) -> np.ndarray:
        """批量编码"""
        inputs = self.processor(images=images, return_tensors='pt')
        
        with torch.no_grad():
            features = self.model.get_image_features(**inputs)
            features = features / features.norm(dim=-1, keepdim=True)
        
        return features.cpu().numpy()
```

### 2.3 文档视觉编码

```python
class DocumentVisualEncoder:
    """文档视觉编码器 - 处理PDF/扫描文档"""
    
    def encode_document(self, document: Document) -> MultimodalChunk:
        """
        将文档转换为多模态chunk
        
        策略:
        1. 提取文本内容和页面截图
        2. 对页���截图进行视觉编码
        3. 保留文本用于精确检索
        4. 视觉编码用于相似性检索
        """
        chunks = []
        
        for page_num, page in enumerate(document.pages):
            # 提取页面视觉表示
            page_image = page.render_to_image()
            visual_embedding = self._encode_image(page_image)
            
            # 提取页面文本
            text_content = page.extract_text()
            text_embedding = self._encode_text(text_content)
            
            chunks.append(MultimodalChunk(
                chunk_id=f'{document.id}_page_{page_num}',
                text=text_content,
                text_embedding=text_embedding,
                visual_embedding=visual_embedding,
                source_page=page_num,
                source_file=document.file_path,
            ))
        
        return chunks
```

---

## 3. 跨模态检索

### 3.1 文本到图像检索

```python
class TextToImageRetrieval:
    """文本到图像检索"""
    
    def __init__(self, clip_encoder):
        self.encoder = clip_encoder
    
    def search(self, query: str, top_k: int = 10) -> List[ImageResult]:
        """
        基于文本查询检索相关图像
        
        原理:
        - CLIP将文本和图像映射到同一向量空间
        - 通过向量相似度找到最匹配的图像
        """
        # 编码查询文本
        query_embedding = self.encoder.encode_text(query)
        
        # 在图像向量索引中搜索
        scores, indices = self.image_index.search(
            query_embedding, top_k=top_k
        )
        
        results = []
        for score, idx in zip(scores, indices):
            image_meta = self.image_index.get_metadata(idx)
            results.append(ImageResult(
                image_id=image_meta['id'],
                image_path=image_meta['path'],
                caption=image_meta.get('caption', ''),
                similarity_score=float(score),
                related_text=self._get_related_text(idx, query),
            ))
        
        return results
    
    def _get_related_text(self, image_idx: int, 
                          query: str) -> str:
        """获取与图像最相关的文本片段"""
        # 使用CLIP计算图像与知识库文本的相关性
        text_embeddings = self.text_index.get_all_embeddings()
        similarities = text_embeddings @ self.encoder.encode_image_idx(
            image_idx
        )
        
        # 返回最相关的文本
        top_text_idx = np.argmax(similarities)
        return self.text_index.get_text(top_text_idx)
```

### 3.2 图像到文本检索

```python
class ImageToTextRetrieval:
    """图像到文本检索"""
    
    def search(self, image: Image, 
               top_k: int = 10) -> List[TextResult]:
        """
        基于图像查询检索相关文本
        
        场景:
        - 上传截图找文档
        - 产品图片找规格说明
        - 图表找原始数据
        """
        # 编码图像
        image_embedding = self.encoder.encode_image(image)
        
        # 跨模态检索
        scores, indices = self.text_index.search(
            image_embedding, top_k=top_k
        )
        
        return [
            TextResult(
                doc_id=self.text_index.get_doc_id(idx),
                content=self.text_index.get_content(idx),
                similarity_score=float(score),
            )
            for score, idx in zip(scores, indices)
        ]
```

---

## 4. 多模态上下文融合

### 4.1 上下文组装策略

```python
class MultimodalContextComposer:
    """多模态上下文组装器"""
    
    def compose(self, query: str, 
                results: List[MultimodalResult],
                max_tokens: int = 8000) -> ContextBlock:
        """
        将多模态检索结果组装为LLM可理解的上下文
        
        策略:
        1. 文本结果直接放入上下文
        2. 图像结果转换为描述文本
        3. 关键图像保留为视觉输入
        4. 按相关性排序组装
        """
        # 1. 排序和筛选
        ranked = self._rank_results(results)
        selected = self._select_top(ranked, max_tokens)
        
        # 2. 转换为统一格式
        context_parts = []
        visual_inputs = []
        
        for result in selected:
            if result.type == 'text':
                context_parts.append({
                    'type': 'text',
                    'content': result.content,
                    'source': result.source,
                    'relevance': result.score,
                })
            elif result.type == 'image':
                # 图像转换为描述
                description = self._describe_image(result.image)
                context_parts.append({
                    'type': 'image_description',
                    'content': description,
                    'source': result.source,
                    'relevance': result.score,
                })
                # 保留关键图像作为视觉输入
                if result.score > 0.8:
                    visual_inputs.append(result.image)
        
        return ContextBlock(
            text_context=self._merge_context(context_parts),
            visual_inputs=visual_inputs[:3],  # 最多3张图像
            query=query,
        )
    
    def _describe_image(self, image: Image) -> str:
        """将图像转换为文本描述"""
        prompt = f"""
        请详细描述以下图像的内容：
        
        [图像]
        
        包括：场景、对象、文字、关系、上下文
        """
        return self.vlm.generate(prompt, image=image)
```

### 4.2 跨模态重排序

```python
class CrossModalReranker:
    """跨模态重排序器"""
    
    def rerank(self, query: str, 
               results: List[MultimodalResult]) -> List[MultimodalResult]:
        """
        使用跨模态Cross-Encoder对混合结果重新排序
        
        优势:
        - 直接建模查询与每个结果的交互
        - 统一处理文本和图像
        - 更高的排序质量
        """
        scored = []
        
        for result in results:
            if result.type == 'text':
                # 文本查询-文本结果对
                score = self.model.predict_score(query, result.content)
            else:
                # 文本查询-图像结果对
                score = self.model.predict_image_score(
                    query, result.image
                )
            
            result.re_rank_score = score
            scored.append(result)
        
        # 按重排序分数排序
        scored.sort(key=lambda x: x.re_rank_score, reverse=True)
        return scored
```

---

## 5. 多模态生成

### 5.1 VLM生成架构

```python
class MultimodalGenerator:
    """多模态生成器"""
    
    def generate(self, query: str, 
                 context: ContextBlock,
                 include_images: bool = True) -> Response:
        """
        基于多模态上下文生成响应
        
        输入:
        - query: 用户查询
        - context: 多模态上下文（文本+图像）
        """
        # 构建多模态prompt
        prompt = self._build_multimodal_prompt(
            query, context, include_images
        )
        
        # 调用VLM生成
        response = self.vlm.generate(
            prompt=prompt,
            images=context.visual_inputs,
            max_tokens=1024,
        )
        
        return Response(
            text=response,
            images=self._extract_images(response, context),
            sources=self._extract_sources(context),
        )
    
    def _build_multimodal_prompt(self, query: str,
                                  context: ContextBlock,
                                  include_images: bool) -> str:
        """构建多模态prompt"""
        prompt = f"""基于以下上下文回答用户问题：

## 上下文信息

"""
        for part in context.text_context:
            if part['type'] == 'text':
                prompt += f"【文档】{part['content']}\n\n"
            elif part['type'] == 'image_description':
                prompt += f"【图片描述】{part['content']}\n\n"
        
        if include_images and context.visual_inputs:
            prompt += "\n## 参考图片\n"
        
        prompt += f"""
## 问题

{query}

## 回答要求

- 基于以上上下文回答
- 引用信息来源
- 如果上下文不足，请明确说明
"""
        return prompt
```

### 5.2 多模态问答示例

```python
class MultimodalQA:
    """多模态问答引擎"""
    
    def answer(self, query: str, 
               image: Image = None) -> AnswerResult:
        """
        多模态问答
        
        支持:
        1. 纯文本问答（带图像检索增强）
        2. 图像+文本问答
        3. 复杂图表分析
        """
        # 步骤1: 查询理解
        query_info = self._analyze_query(query, image)
        
        # 步骤2: 多模态检索
        retrieval_results = self.retriever.search(
            query=query if image else query,
            image=image if query_info.needs_image else None,
            top_k=query_info.top_k,
        )
        
        # 步骤3: 上下文组装
        context = self.composer.compose(
            query=query,
            results=retrieval_results,
        )
        
        # 步骤4: 生成回答
        response = self.generator.generate(
            query=query,
            context=context,
        )
        
        return AnswerResult(
            answer=response.text,
            images=response.images,
            sources=response.sources,
            confidence=response.confidence,
        )
```

---

## 6. 视频RAG

### 6.1 视频内容结构化

```python
class VideoContentExtractor:
    """视频内容提取器"""
    
    def extract(self, video_path: str) -> VideoKnowledgeBase:
        """
        从视频提取结构化知识
        
        流程:
        1. 关键帧提取
        2. 画面描述生成
        3. 音频转文字（ASR）
        4. 时间戳对齐
        """
        # 1. 提取关键帧
        frames = self._extract_keyframes(video_path)
        
        # 2. 生成画面描述
        frame_descriptions = []
        for timestamp, frame in frames:
            description = self.vlm.describe(frame)
            frame_descriptions.append({
                'timestamp': timestamp,
                'frame': frame,
                'description': description,
                'embedding': self.encoder.encode(frame),
            })
        
        # 3. ASR转录
        transcript = self.asr.transcribe(video_path)
        
        # 4. 构建知识库
        return VideoKnowledgeBase(
            video_id=self._generate_id(video_path),
            duration=self._get_duration(video_path),
            frames=frame_descriptions,
            transcript=transcript,
            segments=self._segment_video(
                frames, transcript
            ),
        )
```

---

## 7. 多模态评估

### 7.1 评估指标

| 维度 | 指标 | 说明 |
|------|------|------|
| **检索精度** | Recall@K | 多模态检索召回率 |
| **排序质量** | NDCG@K | 混合排序质量 |
| **图像描述** | BLEU-4, CIDEr | 自动生成描述质量 |
| **图文匹配** | Recall@1 (ITM/MTM) | 图像-文本匹配 |
| **问答质量** | Exact Match, F1 | 多模态QA准确性 |
| **用户满意度** | CSAT | 最终用户体验 |

### 7.2 自动化评估

```python
class MultimodalEvaluator:
    """多模态评估器"""
    
    def evaluate_qa(self, test_set: List[TestSample]) -> Dict:
        """
        多模态QA评估
        """
        metrics = {
            'exact_match': [],
            'f1_score': [],
            'multimodal_correct': [],
            'image_usage_rate': [],
            'latency': [],
        }
        
        for sample in test_set:
            start = time.time()
            
            # 执行多模态QA
            result = self.engine.answer(
                query=sample.query,
                image=sample.query_image,
            )
            
            latency = time.time() - start
            
            # 评估答案准确性
            em = self._compute_em(result.answer, sample.answer)
            f1 = self._compute_f1(result.answer, sample.answer)
            
            metrics['exact_match'].append(em)
            metrics['f1_score'].append(f1)
            metrics['latency'].append(latency * 1000)
            metrics['image_usage_rate'].append(
                1 if result.images else 0
            )
        
        return {k: {
            'mean': np.mean(v),
            'std': np.std(v),
        } for k, v in metrics.items()}
```

---

## 8. 工具与框架

| 工具 | 功能 | 说明 |
|------|------|------|
| **LlamaIndex** | 多模态RAG框架 | 内置多模态支持 |
| **LangChain** | 多模态链 | 图像+文本处理 |
| **Milvus** | 多模态向量库 | 支持多模态索引 |
| **Weaviate** | 多模态搜索 | CLIP集成 |
| **OpenCLIP** | 图像编码 | 开放CLIP实现 |
| **InternVL** | 多模态对话 | 开源VLM |
| **Qwen2-VL** | 视觉理解 | 阿里开源 |

---

## 9. 最佳实践

1. **选择合适的编码器**：根据任务选择CLIP/SigLIP/InternVL等
2. **跨模态融合**：在检索阶段和生成阶段都进行融合
3. **上下文管理**：多模态上下文更占token，需要智能压缩
4. **增量更新**：建立多模态内容的增量更新机制
5. **评估体系**：同时评估检索精度和生成质量

---

*最后更新：2025-01-15 | 维护团队：多模态技术组*
