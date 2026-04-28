# API测试

> AI系统的API测试涵盖功能验证、性能基准、兼容性检查、错误处理等，确保接口行为符合预期。

---

## 1. API测试框架

### 1.1 测试分层

```
┌─────────────────────────────────────────┐
│           API测试金字塔                  │
│         /\                               │
│        /  \                              │
│       /合同测试\                          │
│      /--------\                          │
│     / 集成测试  \                         │
│    /------------\                        │
│   /  单元测试    \                       │
│  /────────────────\                      │
└─────────────────────────────────────────┘
```

### 1.2 测试维度

| 维度 | 测试内容 | 方法 |
|------|---------|------|
| **功能** | 请求/响应正确性 | 自动化用例 |
| **参数** | 参数验证、边界值 | 参数化测试 |
| **错误** | 错误码、异常处理 | 异常测试 |
| **性能** | 延迟、吞吐 | 基准测试 |
| **安全** | 认证、授权、注入 | 安全测试 |
| **兼容** | 版本兼容、协议兼容 | 兼容性测试 |

---

## 2. LLM API测试

### 2.1 核心测试用例

```python
class LLMAPITester:
    """LLM API测试器"""
    
    def test_chat_completion(self, api_client: APIClient):
        """
        对话API测试
        
        测试项:
        1. 基本对话流程
        2. 多轮对话状态
        3. 上下文管理
        4. 长文本处理
        5. 流式响应
        6. 流式中断恢复
        """
        # 基本对话
        response = api_client.chat(messages=[
            {"role": "user", "content": "你好"}
        ])
        assert response.status_code == 200
        assert len(response.choices) > 0
        
        # 多轮对话
        conversation = [
            {"role": "user", "content": "我叫小明"},
            {"role": "assistant", "content": "你好，小明"},
            {"role": "user", "content": "我叫什么？"},
        ]
        response = api_client.chat(messages=conversation)
        assert "小明" in response.choices[0].message.content
    
    def test_streaming(self, api_client: APIClient):
        """流式响应测试"""
        chunks = []
        for chunk in api_client.chat_stream(
            messages=[{"role": "user", "content": "生成一段故事"}],
            stream=True,
        ):
            chunks.append(chunk)
        
        assert len(chunks) > 0
        # 验证流式完整性
        full_response = ''.join(
            c.choices[0].delta.content or '' for c in chunks
        )
        assert len(full_response) > 0
```

### 2.2 API合同测试

```python
class APITestContract:
    """API合同测试"""
    
    def test_response_schema(self, response: Response):
        """验证响应Schema"""
        schema = {
            "type": "object",
            "required": ["id", "choices", "usage"],
            "properties": {
                "id": {"type": "string"},
                "choices": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["index", "message", "finish_reason"],
                    }
                },
                "usage": {
                    "type": "object",
                    "required": ["prompt_tokens", "completion_tokens", "total_tokens"],
                }
            }
        }
        jsonschema.validate(response.json(), schema)
```

---

## 3. 自动化测试实现

### 3.1 测试框架

```python
class APITestFramework:
    """API测试框架"""
    
    def __init__(self, base_url: str, api_key: str):
        self.client = APIBaseClient(base_url, api_key)
        self.test_cases = TestCaseRegistry()
    
    def run(self, suite: TestSuite) -> TestReport:
        """执行API测试套件"""
        results = []
        
        for case in suite.cases:
            result = self._execute_case(case)
            results.append(result)
        
        return TestReport(
            total=len(results),
            passed=sum(1 for r in results if r.passed),
            failed=sum(1 for r in results if not r.passed),
            details=results,
        )
```

### 3.2 断言库

```python
class APIAssertions:
    """API测试断言"""
    
    @staticmethod
    def assert_status_code(response: Response, expected: int):
        """断言状态码"""
        assert response.status_code == expected
    
    @staticmethod
    def assert_response_time(response: Response, max_ms: int):
        """断言响应时间"""
        assert response.elapsed.total_seconds() * 1000 <= max_ms
    
    @staticmethod
    def assert_json_contains(response: Response, key: str, value: Any):
        """断言JSON包含指定键值"""
        data = response.json()
        assert key in data
        assert data[key] == value
    
    @staticmethod
    def assert_semantic_similarity(text1: str, text2: str, threshold: float = 0.85):
        """断言语义相似度"""
        sim = compute_embedding_similarity(text1, text2)
        assert sim >= threshold
```

---

## 4. 性能基准测试

```python
class APIPerformanceTest:
    """API性能基准测试"""
    
    def benchmark(self, api_client: APIClient,
                  workload: WorkloadConfig) -> PerformanceResult:
        """
        API性能基准测试
        
        指标:
        - P50/P90/P99延迟
        - 每秒请求数(RPS)
        - 错误率
        - 吞吐量(Tokens/秒)
        """
        results = concurrent_test(
            api_client=api_client,
            requests=workload.request_count,
            concurrency=workload.concurrency,
        )
        
        return PerformanceResult(
            avg_latency=percentile(results.latencies, 50),
            p90_latency=percentile(results.latencies, 90),
            p99_latency=percentile(results.latencies, 99),
            rps=results.requests / results.duration,
            error_rate=results.errors / results.total,
        )
```

---

## 5. 工具链

| 工具 | 用途 | 说明 |
|------|------|------|
| **pytest** | 测试框架 | Python首选 |
| **Postman** | API测试 | GUI工具 |
| **k6** | 性能测试 | 开源压测 |
| **契约测试** | 合同验证 | Pact, Spring Cloud Contract |
| **Swagger/OpenAPI** | API文档 | 自动生成测试 |

---

*最后更新：2025-01-15 | 维护团队：API测试组*
