# 服务端测试技术

服务端测试技术与平台能力验证。

## 概述

服务端测试是验证后端服务、数据库、中间件等服务器端组件质量的关键环节。通过API测试、数据库测试、中间件测试等手段，确保服务端系统的正确性、性能和可靠性。

### 核心能力

- **API接口测试**：验证接口功能、性能、安全性
- **数据库测试**：数据一致性、性能、迁移验证
- **中间件测试**：消息队列、缓存、搜索引擎测试
- **微服务测试**：服务间通信、服务发现、配置管理

### 技术栈

```
服务端测试技术栈
├── API测试
│   ├── REST API测试
│   ├── GraphQL测试
│   ├── gRPC测试
│   └── WebSocket测试
├── 数据库测试
│   ├── MySQL/PostgreSQL
│   ├── MongoDB/Redis
│   ├── 数据迁移
│   └── 性能优化
├── 中间件测试
│   ├── Kafka/RabbitMQ
│   ├── Redis/Memcached
│   ├── Elasticsearch
│   └── Nginx/HAProxy
└── 微服务测试
    ├── 服务发现
    ├── 配置中心
    ├── 熔断限流
    └── 链路追踪
```

## API测试实践

### REST API测试框架

```python
import requests
from typing import Dict, List, Any
from dataclasses import dataclass
import json

@dataclass
class APIRequest:
    """API请求类"""
    method: str
    url: str
    headers: Dict = None
    params: Dict = None
    json_data: Dict = None
    data: Dict = None

@dataclass
class APIResponse:
    """API响应类"""
    status_code: int
    headers: Dict
    body: Any
    elapsed: float

class APITestClient:
    """
    API测试客户端
    提供便捷的API测试能力
    """
    def __init__(self, base_url: str, default_headers: Dict = None):
        self.base_url = base_url.rstrip("/")
        self.default_headers = default_headers or {}
        self.session = requests.Session()
    
    def request(self, api_request: APIRequest) -> APIResponse:
        """
        发送API请求
        
        Args:
            api_request: API请求对象
            
        Returns:
            APIResponse: API响应对象
        """
        url = api_request.url if api_request.url.startswith("http") else f"{self.base_url}{api_request.url}"
        
        headers = {**self.default_headers, **(api_request.headers or {})}
        
        response = self.session.request(
            method=api_request.method,
            url=url,
            headers=headers,
            params=api_request.params,
            json=api_request.json_data,
            data=api_request.data
        )
        
        return APIResponse(
            status_code=response.status_code,
            headers=dict(response.headers),
            body=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
            elapsed=response.elapsed.total_seconds()
        )
    
    def get(self, url: str, params: Dict = None, headers: Dict = None) -> APIResponse:
        """
        GET请求
        
        Args:
            url: 请求URL
            params: 查询参数
            headers: 请求头
            
        Returns:
            APIResponse: 响应对象
        """
        return self.request(APIRequest(
            method="GET",
            url=url,
            params=params,
            headers=headers
        ))
    
    def post(self, url: str, json_data: Dict = None, headers: Dict = None) -> APIResponse:
        """
        POST请求
        
        Args:
            url: 请求URL
            json_data: JSON数据
            headers: 请求头
            
        Returns:
            APIResponse: 响应对象
        """
        return self.request(APIRequest(
            method="POST",
            url=url,
            json_data=json_data,
            headers=headers
        ))

class APIValidator:
    """
    API验证器
    验证API响应
    """
    @staticmethod
    def validate_status_code(response: APIResponse, expected: int) -> bool:
        """
        验证状态码
        
        Args:
            response: 响应对象
            expected: 预期状态码
            
        Returns:
            bool: 是否匹配
        """
        return response.status_code == expected
    
    @staticmethod
    def validate_response_time(response: APIResponse, max_time: float) -> bool:
        """
        验证响应时间
        
        Args:
            response: 响应对象
            max_time: 最大时间（秒）
            
        Returns:
            bool: 是否在范围内
        """
        return response.elapsed <= max_time
    
    @staticmethod
    def validate_json_schema(response: APIResponse, schema: Dict) -> bool:
        """
        验证JSON Schema
        
        Args:
            response: 响应对象
            schema: JSON Schema
            
        Returns:
            bool: 是否符合Schema
        """
        from jsonschema import validate, ValidationError
        
        try:
            validate(instance=response.body, schema=schema)
            return True
        except ValidationError:
            return False
    
    @staticmethod
    def validate_field_value(response: APIResponse, field: str, expected: Any) -> bool:
        """
        验证字段值
        
        Args:
            response: 响应对象
            field: 字段路径（如data.user.name）
            expected: 预期值
            
        Returns:
            bool: 是否匹配
        """
        value = response.body
        for key in field.split("."):
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return False
        
        return value == expected
```

## 数据库测试

### 数据库测试框架

```python
from typing import Dict, List, Any
from dataclasses import dataclass
import pymysql
from contextlib import contextmanager

@dataclass
class DatabaseConfig:
    """数据库配置类"""
    host: str
    port: int
    user: str
    password: str
    database: str

class DatabaseTester:
    """
    数据库测试器
    提供数据库测试能力
    """
    def __init__(self, config: DatabaseConfig):
        self.config = config
    
    @contextmanager
    def get_connection(self):
        """
        获取数据库连接
        
        Yields:
            Connection: 数据库连接对象
        """
        conn = pymysql.connect(
            host=self.config.host,
            port=self.config.port,
            user=self.config.user,
            password=self.config.password,
            database=self.config.database
        )
        try:
            yield conn
        finally:
            conn.close()
    
    def execute_query(self, sql: str, params: tuple = None) -> List[Dict]:
        """
        执行查询
        
        Args:
            sql: SQL语句
            params: 参数
            
        Returns:
            list: 查询结果
        """
        with self.get_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()
    
    def execute_update(self, sql: str, params: tuple = None) -> int:
        """
        执行更新
        
        Args:
            sql: SQL语句
            params: 参数
            
        Returns:
            int: 影响行数
        """
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                affected = cursor.execute(sql, params)
                conn.commit()
                return affected
    
    def verify_record_exists(self, table: str, conditions: Dict) -> bool:
        """
        验证记录存在
        
        Args:
            table: 表名
            conditions: 条件
            
        Returns:
            bool: 是否存在
        """
        where_clause = " AND ".join([f"{k} = %s" for k in conditions.keys()])
        sql = f"SELECT COUNT(*) as count FROM {table} WHERE {where_clause}"
        
        result = self.execute_query(sql, tuple(conditions.values()))
        return result[0]["count"] > 0
    
    def verify_record_count(self, table: str, expected_count: int, conditions: Dict = None) -> bool:
        """
        验证记录数量
        
        Args:
            table: 表名
            expected_count: 预期数量
            conditions: 条件
            
        Returns:
            bool: 是否匹配
        """
        if conditions:
            where_clause = " AND ".join([f"{k} = %s" for k in conditions.keys()])
            sql = f"SELECT COUNT(*) as count FROM {table} WHERE {where_clause}"
            result = self.execute_query(sql, tuple(conditions.values()))
        else:
            sql = f"SELECT COUNT(*) as count FROM {table}"
            result = self.execute_query(sql)
        
        return result[0]["count"] == expected_count
    
    def verify_data_integrity(self, table: str, primary_key: str) -> Dict:
        """
        验证数据完整性
        
        Args:
            table: 表名
            primary_key: 主键字段
            
        Returns:
            dict: 验证结果
        """
        sql = f"""
        SELECT {primary_key}, COUNT(*) as count
        FROM {table}
        GROUP BY {primary_key}
        HAVING COUNT(*) > 1
        """
        
        duplicates = self.execute_query(sql)
        
        return {
            "has_duplicates": len(duplicates) > 0,
            "duplicate_count": len(duplicates),
            "duplicates": duplicates
        }
```

## 最佳实践

### 1. API测试策略

| 测试类型 | 覆盖范围 | 自动化程度 |
|---------|---------|----------|
| 功能测试 | 业务逻辑 | 100% |
| 性能测试 | 响应时间 | 80% |
| 安全测试 | 认证授权 | 90% |
| 兼容性测试 | 版本兼容 | 70% |

### 2. 数据库测试要点

- 数据一致性验证
- 并发操作测试
- 性能基准测试
- 数据迁移验证

### 3. 测试数据管理

- 测试数据隔离
- 数据生成策略
- 数据清理机制
- 敏感数据脱敏

## 相关资源

- [API测试框架](/frameworks/api/) - Pytest+Requests、Postman
- [性能测试框架](/frameworks/performance/) - JMeter、K6
