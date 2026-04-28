# RAG知识库构建

> 知识库是RAG系统的核心资产。高质量的文档处理、分块策略和索引构建直接决定检索效果。

---

## 1. 文档处理流程

### 1.1 完整处理流水线

```
原始文档
    │
    ▼
┌─────────────┐
│ 文档解析     │  ← PDF/Word/HTML/Markdown/Excel
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 内容清洗     │  ← 去噪、标准化、格式修复
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 分块策略     │  ← 按段落/标题/语义分块
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 元数据增强   │  ← 添加标题、来源、时间、分类
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 向量嵌入     │  ← 生成文档向量
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 索引构建     │  ← 存入向量数据库
└─────────────┘
```

### 1.2 文档解析器

```python
class DocumentParser:
    """文档解析器"""
    
    def __init__(self):
        self.parsers = {
            'pdf': PDFParser(),
            'docx': DOCXParser(),
            'html': HTMLParser(),
            'markdown': MarkdownParser(),
            'txt': TXTParser(),
            'excel': ExcelParser(),
            'pptx': PPTXParser(),
        }
    
    def parse(self, file_path: str) -> Document:
        """解析文档"""
        ext = Path(file_path).suffix.lower()
        parser = self.parsers.get(ext)
        
        if not parser:
            raise ValueError(f"Unsupported file type: {ext}")
        
        return parser.parse(file_path)
```

### 1.3 文档解析最佳实践

| 文档类型 | 推荐解析器 | 注意事项 |
|---------|-----------|---------|
| **PDF（文本型）** | PyMuPDF/pdfplumber | 保留表格结构 |
| **PDF（扫描型）** | OCR + LLM解析 | 识别质量影响分块 |
| **Word** | python-docx | 保留标题层级 |
| **HTML** | BeautifulSoup | 去除导航/广告 |
| **Markdown** | 直接解析 | 保留层级结构 |
| **Excel** | openpyxl | 表格转自然语言 |

---

## 2. 分块策略（Chunking）

### 2.1 分块策略对比

| 策略 | 精度 | 上下文完整性 | 实现复杂度 | 适用场景 |
|------|------|------------|-----------|---------|
| **固定大小分块** | 中 | 差 | 低 | 快速原型 |
| **按字符分块** | 中 | 中 | 低 | 通用场景 |
| **按段落分块** | 中高 | 好 | 中 | 结构化文档 |
| **按标题分块** | 高 | 好 | 中高 | 层次化文档 |
| **语义分块** | 很高 | 很好 | 高 | 高质量要求 |
| **递归分块** | 高 | 好 | 中 | 通用推荐 |

### 2.2 递归分块实现

```python
class RecursiveCharacterTextSplitter:
    """递归字符分块器（推荐）"""
    
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        separators: List[str] = None,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or [
            "\n\n",    # 段落分隔
            "\n",      # 换行
            "。", "！", "？",  # 中文标点
            " ",       # 空格
            "",        # 字符（最后手段）
        ]
    
    def split_text(self, text: str) -> List[str]:
        """递归分块"""
        chunks = self._recursive_split(text, self.separators)
        return [chunk for chunk in chunks if len(chunk.strip()) > 0]
    
    def _recursive_split(self, text: str, separators: List[str]) -> List[str]:
        """递归分割"""
        if not separators:
            # 最后一层：按字符分割
            return self._chunk_by_size(text, self.chunk_size, self.chunk_overlap)
        
        separator = separators[0]
        remaining_separators = separators[1:]
        
        # 尝试用当前分隔符分割
        splits = text.split(separator)
        
        # 检查是否需要进一步分割
        needs_split = any(len(s) > self.chunk_size for s in splits)
        
        if not needs_split:
            return self._chunk_by_size(
                text, self.chunk_size, self.chunk_overlap
            )
        
        # 递归处理需要分割的部分
        chunks = []
        for s in splits:
            if len(s) <= self.chunk_size:
                chunks.append(s)
            else:
                chunks.extend(
                    self._recursive_split(s, remaining_separators)
                )
        
        # 处理重叠
        return self._add_overlap(chunks, self.chunk_overlap)
    
    def _chunk_by_size(self, text: str, size: int, 
                       overlap: int) -> List[str]:
        """按固定大小分块"""
        chunks = []
        start = 0
        while start < len(text):
            end = start + size
            chunks.append(text[start:end])
            start = end - overlap
        
        return chunks
```

### 2.3 分块参数调优

```
分块参数推荐值

文档类型          块大小    重叠    说明
─────────────────────────────────────────
技术文档          800-1000  150-200  技术细节需要精确匹配
新闻报道          500-800   100-150  内容相对独立
学术论文          1000-1500 200-300  长段落需要保留
代码文档          600-1000  100-200  代码块需要完整
FAQ/客服          200-500   50-100   简短问答
法律文档          1000-2000 300-500  条款独立性重要
```

---

## 3. 元数据增强

### 3.1 元数据策略

```python
class MetadataEnricher:
    """元数据增强器"""
    
    def enrich(self, chunk: str, source_doc: Document) -> ChunkWithMetadata:
        """为文档块添加丰富元数据"""
        return {
            # 基础元数据
            'chunk_id': self._generate_chunk_id(chunk),
            'source_file': source_doc.file_path,
            'source_page': source_doc.page_number,
            'chunk_index': source_doc.chunk_index,
            
            # 内容元数据
            'title': source_doc.title,
            'heading': self._extract_heading(chunk, source_doc),
            'section': self._extract_section(chunk, source_doc),
            
            # 时间元数据
            'publish_date': source_doc.publish_date,
            'update_date': source_doc.update_date,
            
            # 分类元数据
            'category': source_doc.category,
            'tags': self._extract_tags(chunk),
            'language': source_doc.language,
            
            # 质量元数据
            'word_count': len(chunk.split()),
            'character_count': len(chunk),
            'completeness': self._estimate_completeness(chunk),
            
            # 嵌入元数据
            'embedding_model': 'bge-large-zh',
            'embedding_version': 'v1',
        }
```

### 3.2 标题层级提取

```python
class HeadingExtractor:
    """标题层级提取器"""
    
    def extract(self, doc: Document) -> Dict[int, List[Dict]]:
        """
        从文档中提取标题层级结构
        
        返回: {level: [heading_info]}
        """
        headings = []
        
        for i, line in enumerate(doc.lines):
            if self._is_heading(line):
                level = self._get_heading_level(line)
                headings.append({
                    'text': line.strip(),
                    'level': level,
                    'position': i,
                    'children': [],
                })
        
        # 构建层级关系
        self._build_hierarchy(headings)
        
        return {h['level']: h for h in headings}
```

---

## 4. 向量嵌入策略

### 4.1 分块嵌入策略

```python
class EmbeddingStrategy:
    """嵌入策略"""
    
    # 策略选择
    STRATEGIES = {
        'single': {
            'description': '对每个块单独嵌入',
            'pros': ['简单', '粒度细'],
            'cons': ['丢失上下文', '块间独立'],
            'recommended_chunk_size': 500,
        },
        'parent_child': {
            'description': '父块嵌入用于检索，子块用于生成',
            'pros': ['检索准确', '内容完整'],
            'cons': ['存储开销大'],
            'parent_chunk_size': 2000,
            'child_chunk_size': 500,
        },
        'hierarchical': {
            'description': '多层级嵌入，支持不同粒度的检索',
            'pros': ['灵活性高'],
            'cons': ['实现复杂'],
            'levels': ['section', 'paragraph', 'sentence'],
        },
    }
```

### 4.2 Parent-Child 嵌入

```python
class ParentChildEmbedding:
    """父-子嵌入策略"""
    
    def __init__(self, embedder, chunker):
        self.embedder = embedder
        self.chunker = chunker
    
    def index_document(self, doc: Document):
        """
        构建父-子索引
        
        流程:
        1. 将文档分割为父块（较大）
        2. 将每个父块分割为子块（较小）
        3. 只对父块生成嵌入
        4. 检索时返回匹配的父块内容
        """
        # 1. 分割父块
        parent_chunks = self.chunker.split(
            doc.text, 
            chunk_size=2000, 
            chunk_overlap=200
        )
        
        indexed_chunks = []
        for parent in parent_chunks:
            # 2. 分割子块
            child_chunks = self.chunker.split(
                parent,
                chunk_size=500,
                chunk_overlap=100
            )
            
            # 3. 嵌入父块
            embedding = self.embedder.encode(parent)
            
            indexed_chunks.append({
                'parent_id': self._generate_id(parent),
                'embedding': embedding,
                'content': parent,
                'children': [
                    {
                        'child_id': self._generate_id(c),
                        'content': c,
                    }
                    for c in child_chunks
                ],
            })
        
        return indexed_chunks
```

---

## 5. 知识库质量评估

### 5.1 评估维度

| 维度 | 指标 | 评估方法 |
|------|------|---------|
| **完整性** | 信息覆盖率 | 人工抽样检查 |
| **准确性** | 事实正确率 | 交叉验证 |
| **一致性** | 内容不冲突率 | 冲突检测 |
| **可读性** | 语言流畅度 | 评估模型打分 |
| **可检索性** | 检索命中率 | 测试集评估 |

### 5.2 质量检查脚本

```python
class KnowledgeBaseValidator:
    """知识库验证器"""
    
    def validate(self, chunk: Chunk) -> ValidationResult:
        """验证单个文档块的质量"""
        issues = []
        
        # 1. 内容完整性检查
        if self._is_incomplete(chunk):
            issues.append({
                'type': 'incomplete',
                'severity': 'high',
                'message': '文档块内容不完整',
            })
        
        # 2. 空内容检查
        if not chunk.text.strip():
            issues.append({
                'type': 'empty',
                'severity': 'critical',
                'message': '文档块为空',
            })
        
        # 3. 乱码检查
        if self._has_garbage_text(chunk):
            issues.append({
                'type': 'garbled',
                'severity': 'high',
                'message': '包含���码或异常字符',
            })
        
        # 4. 重复内容检查
        if self._is_duplicate(chunk):
            issues.append({
                'type': 'duplicate',
                'severity': 'medium',
                'message': '与已有文档块高度重复',
            })
        
        return ValidationResult(
            chunk_id=chunk.id,
            is_valid=len([i for i in issues if i['severity'] in ['critical', 'high']]) == 0,
            issues=issues,
        )
```

---

## 6. 知识库更新策略

### 6.1 增量更新

```python
class IncrementalUpdater:
    """增量更新器"""
    
    def update(self, new_docs: List[Document], 
               existing_index: VectorIndex) -> UpdateResult:
        """
        增量更新知识库
        
        策略:
        1. 检测新增/修改/删除的文档
        2. 处理新文档
        3. 更新修改的文档
        4. 删除已移除的文档
        """
        changes = self._detect_changes(new_docs, existing_index)
        
        # 处理新增
        for doc in changes['new']:
            chunks = self._process_document(doc)
            self._add_to_index(chunks)
        
        # 更新修改
        for doc in changes['modified']:
            self._replace_in_index(doc)
        
        # 删除移除
        for doc_id in changes['deleted']:
            self._remove_from_index(doc_id)
        
        return UpdateResult(
            new_count=len(changes['new']),
            modified_count=len(changes['modified']),
            deleted_count=len(changes['deleted']),
        )
```

### 6.2 过期内容处理

```python
class ExpiryManager:
    """过期内容管理器"""
    
    def __init__(self, expiry_rules: List[ExpiryRule]):
        self.rules = expiry_rules
    
    def check_expiry(self, chunk: Chunk) -> ExpiryStatus:
        """检查文档块是否过期"""
        for rule in self.rules:
            if rule.applies_to(chunk):
                if rule.is_expired(chunk):
                    return ExpiryStatus(
                        expired=True,
                        rule=rule,
                        reason=rule.expiry_reason,
                    )
        
        return ExpiryStatus(expired=False)
```

---

## 7. 最佳实践

1. **分块大小**：根据文档类型和检索策略选择，一般500-1000字符
2. **重叠设置**：保持10%-30%的重叠以保留上下文
3. **元数据丰富**：充分利用元数据增强检索精度
4. **定期维护**：建立知识库更新和清理机制
5. **质量监控**：持续监控知识库质量指标
6. **版本管理**：对知识库变更进行版本控制

---

*最后更新：2025-01-15 | 维护团队：RAG技术组*
