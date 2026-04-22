# API/接口测试框架

接口测试框架选型与实践指南。

## Pytest + Requests

Python生态首选API测试方案。

- Python生态首选
- 高度可定制
- 丰富的插件生态
- 参数化测试支持
- 与CI/CD无缝集成

### 核心测试模式

```python
import pytest
import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class APIResponse:
    """API响应封装类"""
    status_code: int
    data: Any
    headers: Dict[str, str]
    response_time: float

class APITestClient:
    """
    API测试客户端
    封装HTTP请求和通用断言
    """
    def __init__(self, base_url: str, timeout: int = 30):
        """
        初始化客户端
        
        Args:
            base_url: 基础URL
            timeout: 请求超时时间
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.default_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def request(self, method: str, endpoint: str, 
                data: Dict = None, params: Dict = None,
                headers: Dict = None, auth: tuple = None) -> APIResponse:
        """
        发送HTTP请求
        
        Args:
            method: HTTP方法
            endpoint: API端点
            data: 请求体数据
            params: URL参数
            headers: 自定义请求头
            auth: 认证信息
            
        Returns:
            APIResponse: 封装的响应对象
        """
        url = f"{self.base_url}{endpoint}"
        merged_headers = {**self.default_headers, **(headers or {})}
        
        import time
        start = time.time()
        response = self.session.request(
            method=method.upper(),
            url=url,
            json=data,
            params=params,
            headers=merged_headers,
            auth=auth,
            timeout=self.timeout
        )
        elapsed = time.time() - start
        
        try:
            response_data = response.json()
        except ValueError:
            response_data = response.text
        
        return APIResponse(
            status_code=response.status_code,
            data=response_data,
            headers=dict(response.headers),
            response_time=elapsed
        )
    
    def get(self, endpoint: str, **kwargs) -> APIResponse:
        """GET请求"""
        return self.request("GET", endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs) -> APIResponse:
        """POST请求"""
        return self.request("POST", endpoint, **kwargs)
    
    def put(self, endpoint: str, **kwargs) -> APIResponse:
        """PUT请求"""
        return self.request("PUT", endpoint, **kwargs)
    
    def delete(self, endpoint: str, **kwargs) -> APIResponse:
        """DELETE请求"""
        return self.request("DELETE", endpoint, **kwargs)
    
    def assert_status(self, response: APIResponse, expected: int):
        """
        断言状态码
        
        Args:
            response: API响应
            expected: 期望状态码
        """
        assert response.status_code == expected, \
            f"期望状态码 {expected}，实际 {response.status_code}"
    
    def assert_json_path(self, response: APIResponse, path: str, expected: Any):
        """
        断言JSON路径值
        
        Args:
            response: API响应
            path: JSON路径（如 'data.user.name'）
            expected: 期望值
        """
        data = response.data
        keys = path.split('.')
        for key in keys:
            if isinstance(data, dict):
                data = data.get(key)
            else:
                pytest.fail(f"无法访问路径 {path}")
        
        assert data == expected, f"路径 {path} 期望 {expected}，实际 {data}"
    
    def assert_response_time(self, response: APIResponse, max_time: float):
        """
        断言响应时间
        
        Args:
            response: API响应
            max_time: 最大允许时间（秒）
        """
        assert response.response_time < max_time, \
            f"响应时间 {response.response_time:.3f}s 超过阈值 {max_time}s"

# pytest fixture
@pytest.fixture
def api_client():
    """API客户端fixture"""
    client = APITestClient("https://api.example.com")
    yield client

# 测试用例示例
class TestUserAPI:
    """用户API测试类"""
    
    def test_get_user_success(self, api_client: APITestClient):
        """测试获取用户成功"""
        response = api_client.get("/users/1")
        api_client.assert_status(response, 200)
        api_client.assert_json_path(response, "data.id", 1)
        api_client.assert_response_time(response, 1.0)
    
    def test_create_user(self, api_client: APITestClient):
        """测试创建用户"""
        payload = {
            "name": "测试用户",
            "email": "test@example.com"
        }
        response = api_client.post("/users", data=payload)
        api_client.assert_status(response, 201)
        api_client.assert_json_path(response, "data.name", "测试用户")
    
    @pytest.mark.parametrize("user_id,expected_status", [
        (1, 200),
        (999999, 404),
        (-1, 400),
    ])
    def test_get_user_various_cases(self, api_client: APITestClient, 
                                     user_id, expected_status):
        """参数化测试各种用户ID场景"""
        response = api_client.get(f"/users/{user_id}")
        api_client.assert_status(response, expected_status)
```

### 契约测试集成

```python
from typing import Dict
import json

class ContractTestBase:
    """
    契约测试基类
    验证API响应符合预定义契约
    """
    def __init__(self, contract_schema: Dict):
        """
        初始化契约测试
        
        Args:
            contract_schema: 契约模式定义
        """
        self.contract = contract_schema
    
    def validate_response(self, response_data: Dict) -> Dict:
        """
        验证响应数据符合契约
        
        Args:
            response_data: 实际响应数据
            
        Returns:
            dict: 验证结果
        """
        errors = []
        
        def validate_type(value, expected_type, path: str):
            """验证类型"""
            type_map = {
                "string": str,
                "integer": int,
                "number": (int, float),
                "boolean": bool,
                "array": list,
                "object": dict
            }
            
            if expected_type not in type_map:
                return
            
            expected = type_map[expected_type]
            if not isinstance(value, expected):
                errors.append(f"{path}: 期望类型 {expected_type}，实际 {type(value).__name__}")
        
        def validate_schema(data, schema, path: str = "root"):
            """递归验证模式"""
            if schema.get("type") == "object" and isinstance(data, dict):
                required = schema.get("required", [])
                for field in required:
                    if field not in data:
                        errors.append(f"{path}.{field}: 必填字段缺失")
                
                properties = schema.get("properties", {})
                for field, field_schema in properties.items():
                    if field in data:
                        validate_schema(data[field], field_schema, f"{path}.{field}")
            
            elif schema.get("type") == "array" and isinstance(data, list):
                items_schema = schema.get("items", {})
                for i, item in enumerate(data):
                    validate_schema(item, items_schema, f"{path}[{i}]")
            
            else:
                validate_type(data, schema.get("type"), path)
        
        validate_schema(response_data, self.contract)
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
```

## Postman/Newman

API调试与自动化测试平台。

- 可视化API调试
- 自动化测试集合
- Newman命令行运行
- CI/CD集成
- 团队协作功能

### Newman CLI集成

```javascript
// newman-run.js - Newman程序化运行示例
const newman = require('newman');

/**
 * 运行Postman集合
 * @param {string} collectionPath - 集合文件路径
 * @param {string} environmentPath - 环境文件路径
 */
function runCollection(collectionPath, environmentPath) {
    return new Promise((resolve, reject) => {
        newman.run({
            collection: require(collectionPath),
            environment: require(environmentPath),
            reporters: ['cli', 'html', 'junit'],
            reporter: {
                html: {
                    export: './reports/api-test-report.html'
                },
                junit: {
                    export: './reports/api-test-junit.xml'
                }
            },
            insecure: true,  // 忽略SSL证书错误
            timeout: {
                request: 30000,
                script: 5000
            }
        }, function(err, summary) {
            if (err) {
                reject(err);
            } else {
                const stats = summary.run.stats;
                resolve({
                    total: stats.tests.total,
                    passed: stats.tests.passed,
                    failed: stats.tests.failed,
                    duration: summary.run.timings.completed - summary.run.timings.started
                });
            }
        });
    });
}

module.exports = { runCollection };
```

## RestAssured

Java生态BDD风格API测试。

- Java生态首选
- BDD风格语法
- REST API测试简化
- 与JUnit/TestNG集成
- 强大的断言能力

### RestAssured示例

```java
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

/**
 * RestAssured API测试示例
 */
public class APITestExample {
    
    @BeforeAll
    public static void setup() {
        RestAssured.baseURI = "https://api.example.com";
        RestAssured.basePath = "/v1";
    }
    
    @Test
    public void testGetUser() {
        given()
            .header("Content-Type", "application/json")
            .auth().oauth2("token")
        .when()
            .get("/users/1")
        .then()
            .statusCode(200)
            .body("data.id", equalTo(1))
            .body("data.name", notNullValue())
            .body("data.email", containsString("@"))
            .time(lessThan(1000L));
    }
    
    @Test
    public void testCreateUser() {
        String requestBody = """
            {
                "name": "测试用户",
                "email": "test@example.com"
            }
            """;
        
        given()
            .header("Content-Type", "application/json")
            .body(requestBody)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("data.id", notNullValue())
            .body("data.name", equalTo("测试用户"));
    }
}
```

## SoapUI

企业级API测试平台。

- 企业级功能
- 数据驱动测试
- SOAP/REST支持
- Mock服务
- 安全测试集成

## 框架选型对比

| 维度 | Pytest+Requests | Postman | RestAssured | SoapUI |
|------|----------------|---------|-------------|--------|
| 语言 | Python | 无/JavaScript | Java | Java/Groovy |
| 学习曲线 | 平缓 | 平缓 | 中等 | 中等 |
| CI/CD集成 | 优秀 | 良好 | 优秀 | 良好 |
| 数据驱动 | 原生 | 支持 | 支持 | 原生 |
| Mock能力 | 需额外工具 | 内置 | 需额外工具 | 内置 |
| 报告 | 丰富插件 | 内置 | 需配置 | 内置 |
| 团队协作 | 代码版本管理 | 云端共享 | 代码版本管理 | 项目文件 |

## 最佳实践

1. **分层测试**：单元→集成→契约→端到端
2. **数据隔离**：每个测试独立准备和清理数据
3. **环境管理**：使用配置文件管理不同环境
4. **响应时间断言**：除了功能还要验证性能
5. **错误场景覆盖**：正向+异常+边界测试
6. **幂等性验证**：重复调用结果一致性
