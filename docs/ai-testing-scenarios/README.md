# AI测试场景

> 覆盖API测试、UI测试、移动端测试、性能测试、安全测试等核心AI应用测试场景，提供各场景的测试策略、工具和方法论。

---

## 1. 测试场景总览

```
AI测试场景
├── 接口测试 (API Testing)
│   ├── REST API测试
│   ├── GraphQL测试
│   └── WebSocket测试
├── 界面测试 (UI Testing)
│   ├── Web应用测试
│   ├── 桌面应用测试
│   └── 多端适配测试
├── 移动端测试 (Mobile Testing)
│   ├── Android/iOS测试
│   ├── 兼容性测试
│   └── 离线测试
├── 性能测试 (Performance Testing)
│   ├── 负载测试
│   ├── 压力测试
│   └── 稳定性测试
└── 安全测试 (Security Testing)
    ├── 漏洞扫描
    ├── 渗透测试
    └── LLM红队测试
```

---

## 2. 测试场景选择指南

| 场景 | 优先级 | 频率 | 工具推荐 | 适用类型 |
|------|--------|------|---------|---------|
| API测试 | P0 | 每次构建 | Postman, pytest, RestAssured | 服务端、微服务 |
| UI测试 | P1 | 每迭代 | Playwright, Selenium, Cypress | Web应用、桌面应用 |
| 移动端 | P1 | 每周 | Appium, Maestro, Detox | Android/iOS应用 |
| 性能测试 | P2 | 每月 | k6, Locust, JMeter | 高并发、大数据量 |
| 安全测试 | P2 | 每季度 | OWASP ZAP, Burp Suite | 对外暴露的服务 |

### 2.1 选择原则

- **P0场景**（API测试）：任何功能变更后必须执行，自动化率要求100%
- **P1场景**（UI/移动端）：核心用户路径必须覆盖，自动化率要求80%以上
- **P2场景**（性能/安全）：定期执行，结合CI/CD流水线设置触发条件

---

## 3. 场景测试框架

### 3.1 数据驱动测试

```python
# 示例：API数据驱动测试
import pytest
from data.generator import test_data

@pytest.mark.parametrize("endpoint,method,payload,expected_status", test_data.api_tests)
def test_api_endpoint(endpoint, method, payload, expected_status):
    response = requests.request(method, endpoint, json=payload)
    assert response.status_code == expected_status
```

### 3.2 视觉回归测试

```python
# 示例：UI视觉对比测试
from selenium import webdriver
from visual_diff import compare_screenshots

driver = webdriver.Chrome()
driver.get("https://app.example.com")
compare_screenshots(driver, "baseline.png", "current.png")
```

### 3.3 智能测试生成

- **基于LLM**：自动从需求文档生成测试用例
- **基于代码分析**：从变更代码中提取测试点
- **基于用户行为**：从日志和埋点中识别高频场景

---

## 4. AI测试场景的特殊挑战

### 4.1 非确定性测试

LLM输出具有随机性，需要：
- 语义相似性比较（非精确匹配）
- 测试用例模糊度控制
- 输出格式约束

### 4.2 上下文依赖

多轮对话场景中：
- 对话状态管理
- 上下文窗口限制
- 对话边界处理

### 4.3 多模态测试

视觉-语言联合场景：
- 图像质量评估
- 图文一致性验证
- 多语言支持测试

---

## 5. 测试金字塔

```
        /\
       /  \      E2E测试 (UI/移动端) - 少
      /----\
     /      \    集成测试 (API/服务) - 中
    /--------\
   /          \  单元测试 (组件/函数) - 多
  /------------\
```

### 5.1 各层级占比建议

| 层级 | 占比 | 自动化率 | 执行时间 |
|------|------|---------|---------|
| 单元测试 | 60-70% | 95%+ | < 5分钟 |
| 集成测试 | 20-30% | 85%+ | < 15分钟 |
| E2E测试 | 5-10% | 70%+ | < 30分钟 |

---

## 6. 持续集成中的场景覆盖

```yaml
# GitHub Actions 示例
name: AI Testing Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run API Tests
        run: pytest tests/api/ -v
      - name: Run UI Tests
        run: npx playwright test
      - name: Run Security Scan
        run: owasp-zap --baseline
```

---

*各场景详细内容见对应子目录*

---

*最后更新：2025-01-15 | 维护团队：场景测试组*
