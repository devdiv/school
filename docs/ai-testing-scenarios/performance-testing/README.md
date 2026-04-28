# 性能测试

> AI系统性能测试涵盖响应延迟、吞吐量、资源消耗、稳定性等维度，确保系统满足生产要求。

---

## 1. 性能测试框架

### 1.1 测试类型

| 类型 | 目的 | 方法 |
|------|------|------|
| **基准测试** | 建立性能基线 | 标准负载 |
| **负载测试** | 验证正常负载 | 预期负载 |
| **压力测试** | 找到极限 | 不断增加负载 |
| **稳定性测试** | 长时间运行 | 持续负载24h+ |
| **弹性测试** | 动态扩展效果 | 波浪负载 |

### 1.2 核心指标

| 指标 | 说明 | 采集方式 |
|------|------|---------|
| **延迟** | 请求到响应的时间 | 计时器 |
| **吞吐量** | 单位时间处理量 | 计数器 |
| **错误率** | 失败请求比例 | 状态码统计 |
| **资源使用** | CPU/GPU/内存/带宽 | 系统监控 |
| **并发数** | 同时处理请求数 | 连接数统计 |

---

## 2. LLM性能测试

### 2.1 延迟测试

```python
class LatencyTester:
    """延迟测试"""
    
    def test_ttr(self, model: Model, queries: List[str]) -> LatencyReport:
        """
        Time to First Token (首token延迟)
        
        测量:
        - 从发送请求到收到第一个token的时间
        - 影响用户体验的关键指标
        """
        latencies = []
        
        for query in queries:
            start = time.time()
            first_token = model.generate_stream(query, first_only=True)
            ttr = time.time() - start
            latencies.append(ttr)
        
        return LatencyReport(
            p50_ttr=np.percentile(latencies, 50),
            p90_ttr=np.percentile(latencies, 90),
            p99_ttr=np.percentile(latencies, 99),
            avg_ttr=np.mean(latencies),
        )
    
    def test_ttft(self, model: Model, queries: List[str]) -> LatencyReport:
        """
        Time to Full Response (完整响应延迟)
        """
        latencies = []
        for query in queries:
            start = time.time()
            response = model.generate(query)
            ttft = time.time() - start
            latencies.append(ttft)
        
        return LatencyReport(
            p50=np.percentile(latencies, 50),
            p90=np.percentile(latencies, 90),
            p99=np.percentile(latencies, 99),
        )
```

### 2.2 吞吐量测试

```python
class ThroughputTester:
    """吞吐量测试"""
    
    def benchmark(self, model: Model, 
                  concurrency: int = 10) -> ThroughputResult:
        """
        吞吐量基准测试
        
        指标:
        - Requests Per Second (RPS)
        - Tokens Per Second (TPS)
        - Total Output Tokens
        """
        results = []
        
        for rps in [1, 5, 10, 20, 50, 100]:
            result = self._concurrent_test(model, rps)
            results.append({
                'rps': rps,
                'actual_rps': result.actual_rps,
                'tps': result.tps,
                'avg_latency': result.avg_latency,
                'error_rate': result.error_rate,
            })
        
        return ThroughputResult(
            results=results,
            max_rps=max(results, key=lambda r: r['actual_rps']),
            sweet_spot=self._find_sweet_spot(results),
        )
```

### 2.3 长文本性能测试

```python
class LongContextTester:
    """长文本性能测试"""
    
    def test_context_scaling(self, model: Model):
        """
        长文本处理能力测试
        
        测试不同上下文长度下的性能:
        1K, 4K, 8K, 16K, 32K, 64K tokens
        """
        context_lengths = [1024, 4096, 8192, 16384, 32768, 65536]
        results = []
        
        for ctx_len in context_lengths:
            prompt = self._generate_prompt(ctx_len)
            
            start = time.time()
            response = model.generate(prompt, max_tokens=100)
            latency = time.time() - start
            
            results.append({
                'context_length': ctx_len,
                'latency': latency,
                'output_tokens': len(response.split()),
                'memory_usage': self._get_memory_usage(),
            })
        
        return ContextScalingReport(
            results=results,
            max_context=model.context_window,
            performance_degradation=self._calculate_degradation(results),
        )
```

---

## 3. 系统性能测试

### 3.1 并发测试

```python
class ConcurrencyTester:
    """并发性能测试"""
    
    def test(self, api_endpoint: str,
             config: LoadConfig) -> LoadTestResult:
        """
        并发压力测试
        
        阶段:
        1. 预热: 少量请求预热系统
        2. 升压: 逐步增加负载
        3. 稳态: 保持目标负载
        4. 降压: 逐步降低负载
        5. 恢复: 观察系统恢复
        """
        # 预热
        self._warmup(api_endpoint, requests=100)
        
        # 升压
        for level in self._ramp_up_levels(config):
            result = self._sustained_test(
                api_endpoint, rps=level, duration=60
            )
            self._monitor_system_health(result)
        
        # 稳态
        max_result = self._sustained_test(
            api_endpoint, rps=config.target_rps, 
            duration=config.steady_duration
        )
        
        return LoadTestResult(
            peak_rps=max_result.rps,
            avg_latency=max_result.avg_latency,
            error_rate=max_result.error_rate,
            system_metrics=self._collected_metrics,
        )
```

### 3.2 资源监控

| 资源 | 监控指标 | 告警阈值 |
|------|---------|---------|
| CPU | 使用率 | >80% |
| GPU | 利用率/显存 | >90% |
| 内存 | 使用量/OOM | >85% |
| 磁盘 | IOPS/使用率 | >80% |
| 网络 | 带宽/连接数 | >80% |
| 容器 | CPU/内存限制 | >90% |

---

## 4. 稳定性测试

### 4.1 长时间运行测试

```python
class StabilityTester:
    """稳定性测试"""
    
    def marathon_test(self, model: Model,
                      duration_hours: int = 24) -> StabilityReport:
        """
        马拉松测试 - 长时间运行
        
        监控:
        1. 内存泄漏检测
        2. 性能衰减检测
        3. 错误累积分析
        4. 资源释放监控
        """
        metrics_history = []
        
        for interval in self._intervals(duration_hours):
            batch_results = self._run_batch(model)
            
            metrics = {
                'timestamp': interval.start,
                'rps': batch_results.rps,
                'avg_latency': batch_results.avg_latency,
                'error_rate': batch_results.error_rate,
                'memory_usage': self._get_memory_usage(),
                'gc_count': self._get_gc_count(),
            }
            
            metrics_history.append(metrics)
            
            # 检测异常
            if self._is_degrading(metrics, metrics_history):
                self._alert_performance_degradation(metrics)
        
        return StabilityReport(
            metrics_history=metrics_history,
            memory_leak_detected=self._detect_memory_leak(
                metrics_history
            ),
            performance_trend=self._detect_trend(metrics_history),
            conclusion=self._stability_conclusion(metrics_history),
        )
```

---

## 5. 性能报告

### 5.1 性能报告模板

```
性能测试报告
├── 测试概要
│   ├── 测试时间
│   ├── 测试环境
│   └── 测试配置
├── 基准性能
│   ├── 平均延迟
│   ├── P99延迟
│   └── 吞吐量
├── 压力测试
│   ├── 极限并发
│   ├── 崩溃点
│   └── 恢复时间
├── 资源分析
│   ├── CPU趋势
│   ├── 内存趋势
│   └── GPU趋势
├── 稳定性
│   ├── 24h指标
│   ├── 异常事件
│   └── 结论
└── 建议
    ├── 优化建议
    └── 扩容建议
```

---

## 6. 工具链

| 工具 | 用途 | 特点 |
|------|------|------|
| **k6** | 负载测试 | JavaScript, 云原生 |
| **Locust** | 负载测试 | Python, 分布式 |
| **JMeter** | 负载测试 | GUI, 功能丰富 |
| **Gatling** | 负载测试 | 高性能, Scala |
| **Prometheus** | 指标监控 | 时序数据库 |
| **Grafana** | 可视化 | 面板仪表盘 |
| **nprof** | 性能分析 | Python性能分析 |

---

*最后更新：2025-01-15 | 维护团队：性能测试组*
