# 云原生/K8s测试框架

云原生环境下的测试框架与实践。

## Testkube

K8s原生测试编排平台。

- K8s原生测试编排
- 支持Cypress/Postman/k6
- 测试即代码
- GitOps集成
- 云原生架构

### Testkube核心概念

```yaml
# testkube-test.yaml - Testkube测试定义
apiVersion: tests.testkube.io/v3
kind: Test
metadata:
  name: api-smoke-test
  namespace: testkube
spec:
  type: postman/collection
  content:
    type: git
    repository:
      type: git
      uri: https://github.com/example/test-collections.git
      branch: main
      path: postman/smoke-tests.json
  executionRequest:
    variables:
      BASE_URL:
        name: BASE_URL
        value: "https://api.example.com"
        type: basic
    runningContext:
      context: "scheduled-smoke-test"
---
apiVersion: tests.testkube.io/v3
kind: TestSuite
metadata:
  name: regression-suite
  namespace: testkube
spec:
  steps:
    - execute:
        name: api-smoke-test
    - execute:
        name: ui-e2e-test
    - execute:
        name: load-test
  executionRequest:
    variables:
      ENV:
        name: ENV
        value: "staging"
        type: basic
```

### Testkube与CI/CD集成

```python
from typing import Dict, Optional
import requests
import time

class TestkubeClient:
    """
    Testkube API客户端
    用于程序化触发和管理测试执行
    """
    def __init__(self, endpoint: str, api_key: Optional[str] = None):
        """
        初始化客户端
        
        Args:
            endpoint: Testkube API端点
            api_key: API认证密钥
        """
        self.endpoint = endpoint.rstrip('/')
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    def run_test(self, test_name: str, namespace: str = "testkube",
                 variables: Dict[str, str] = None) -> Dict:
        """
        触发测试执行
        
        Args:
            test_name: 测试名称
            namespace: 命名空间
            variables: 环境变量
            
        Returns:
            dict: 执行信息
        """
        url = f"{self.endpoint}/v1/tests/{test_name}/executions"
        
        payload = {
            "runningContext": {
                "context": "api-triggered"
            }
        }
        
        if variables:
            payload["variables"] = {
                k: {"name": k, "value": v, "type": "basic"}
                for k, v in variables.items()
            }
        
        response = requests.post(
            url,
            headers=self.headers,
            json=payload
        )
        
        return response.json()
    
    def get_execution_status(self, test_name: str, execution_id: str,
                             namespace: str = "testkube") -> Dict:
        """
        获取测试执行状态
        
        Args:
            test_name: 测试名称
            execution_id: 执行ID
            namespace: 命名空间
            
        Returns:
            dict: 执行状态
        """
        url = (f"{self.endpoint}/v1/tests/{test_name}/"
               f"executions/{execution_id}")
        
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def wait_for_completion(self, test_name: str, execution_id: str,
                           timeout: int = 1800, poll_interval: int = 10) -> Dict:
        """
        等待测试执行完成
        
        Args:
            test_name: 测试名称
            execution_id: 执行ID
            timeout: 超时时间（秒）
            poll_interval: 轮询间隔（秒）
            
        Returns:
            dict: 最终结果
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.get_execution_status(test_name, execution_id)
            state = status.get("status", {}).get("runningContext", {}).get("status", "")
            
            if state in ["passed", "failed", "aborted"]:
                return status
            
            time.sleep(poll_interval)
        
        return {"error": "等待超时", "execution_id": execution_id}
```

## K8sTA

K8s测试自动化框架。

- K8s测试自动化
- CRD驱动测试
- 声明式测试定义
- 与K8s生态集成

### K8sTA CRD定义

```yaml
# k8sta-testrun.yaml - K8sTA测试运行定义
apiVersion: k8sta.io/v1
kind: TestRun
metadata:
  name: integration-test-run
  namespace: testing
spec:
  # 测试镜像配置
  image: myregistry/test-runner:latest
  imagePullPolicy: Always
  
  # 测试环境配置
  env:
    - name: TEST_ENV
      value: "staging"
    - name: DB_HOST
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: host
  
  # 资源限制
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2000m"
  
  # 测试配置
  testConfig:
    parallel: 4
    timeout: "30m"
    retryCount: 2
    
  # 前置条件
  preConditions:
    - name: database-ready
      type: podReady
      selector:
        app: test-database
      timeout: "5m"
    - name: migrations-complete
      type: jobComplete
      name: db-migrations
      
  # 后置清理
  postActions:
    - name: cleanup-test-data
      type: exec
      command: ["python", "cleanup.py"]
      
  # 结果报告
  reporting:
    type: junit
    outputPath: /reports
    uploadTo:
      type: s3
      bucket: test-reports
      path: "runs/{{ .RunName }}/"
```

## Testcontainers

容器化测试环境工具。

- 容器化测试环境
- 多语言支持
- 数据库测试简化
- 集成测试最佳实践

### Testcontainers实践

```python
import pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer
from testcontainers.kafka import KafkaContainer
import psycopg2
import redis

class TestWithContainers:
    """
    使用Testcontainers进行集成测试
    """
    
    @pytest.fixture(scope="class")
    def postgres(self):
        """
        PostgreSQL容器fixture
        """
        with PostgresContainer("postgres:15-alpine") as postgres:
            yield postgres
    
    @pytest.fixture(scope="class")
    def redis_client(self):
        """
        Redis容器fixture
        """
        with RedisContainer("redis:7-alpine") as redis_container:
            client = redis.from_url(redis_container.get_connection_url())
            yield client
    
    def test_database_operations(self, postgres):
        """
        测试数据库操作
        """
        # 获取连接信息
        conn = psycopg2.connect(
            host=postgres.get_container_host_ip(),
            port=postgres.get_exposed_port(5432),
            user=postgres.username,
            password=postgres.password,
            dbname=postgres.dbname
        )
        
        cursor = conn.cursor()
        
        # 创建测试表
        cursor.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100)
            )
        """)
        
        # 插入测试数据
        cursor.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            ("Test User", "test@example.com")
        )
        
        conn.commit()
        
        # 验证数据
        cursor.execute("SELECT * FROM users WHERE name = %s", ("Test User",))
        result = cursor.fetchone()
        
        assert result is not None
        assert result[1] == "Test User"
        assert result[2] == "test@example.com"
        
        cursor.close()
        conn.close()
    
    def test_cache_operations(self, redis_client):
        """
        测试缓存操作
        """
        # 设置缓存
        redis_client.set("test_key", "test_value", ex=300)
        
        # 读取缓存
        value = redis_client.get("test_key")
        assert value.decode() == "test_value"
        
        # 测试过期
        redis_client.set("temp_key", "temp_value", ex=1)
        import time
        time.sleep(2)
        assert redis_client.get("temp_key") is None

# 多容器组合测试
@pytest.fixture
def integration_environment():
    """
    组合多个容器的集成测试环境
    """
    with PostgresContainer("postgres:15-alpine") as postgres, \
         RedisContainer("redis:7-alpine") as redis_container, \
         KafkaContainer("confluentinc/cp-kafka:latest") as kafka:
        
        yield {
            "postgres_url": postgres.get_connection_url(),
            "redis_url": redis_container.get_connection_url(),
            "kafka_bootstrap": kafka.get_bootstrap_server()
        }

def test_microservice_integration(integration_environment):
    """
    微服务集成测试
    """
    env = integration_environment
    
    # 配置服务连接
    db_conn = psycopg2.connect(env["postgres_url"])
    cache = redis.from_url(env["redis_url"])
    
    # 执行集成测试逻辑
    # ...
    
    db_conn.close()
```

## Microcks

云原生API Mock与测试平台。

- 契约测试
- Mock服务
- CNCF项目
- API仿真测试

### Microcks集成

```yaml
# microcks-api-mock.yaml - Microcks API模拟定义
apiVersion: microcks.github.io/v1alpha1
kind: APIMock
metadata:
  name: user-service-mock
  namespace: microcks
spec:
  # OpenAPI规范来源
  openApiSpec:
    url: https://github.com/example/api-specs/raw/main/user-service.yaml
    refreshInterval: 1h
    
  # 自定义响应示例
  examples:
    - operation: GET /users/{id}
      name: user-found
      request:
        parameters:
          id: "123"
      response:
        status: 200
        headers:
          Content-Type: application/json
        body: |
          {
            "id": "123",
            "name": "John Doe",
            "email": "john@example.com"
          }
          
    - operation: GET /users/{id}
      name: user-not-found
      request:
        parameters:
          id: "999"
      response:
        status: 404
        body: |
          {
            "error": "User not found",
            "code": "USER_NOT_FOUND"
          }
          
  # 动态响应规则
  dynamicRules:
    - operation: POST /users
      rule: |
        function createUser(request) {
          return {
            status: 201,
            body: {
              id: Math.random().toString(36).substr(2, 9),
              name: request.body.name,
              email: request.body.email,
              createdAt: new Date().toISOString()
            }
          };
        }
```

## 云原生测试策略

### 测试金字塔在云原生环境中的应用

```
                    /\
                   /  \
                  / E2E\      <- 端到端测试 (少量)
                 /------\
                /Contract\    <- 契约测试
               /----------\
              / Integration\  <- 集成测试
             /--------------\
            /     Unit       \ <- 单元测试 (大量)
           /------------------\
```

### 测试环境管理

```python
from typing import Dict, List
import kubernetes
from kubernetes import client, config

class TestEnvironmentManager:
    """
    测试环境管理器
    动态创建和销毁测试环境
    """
    def __init__(self):
        config.load_kube_config()
        self.core_api = client.CoreV1Api()
        self.apps_api = client.AppsV1Api()
    
    def create_test_namespace(self, name: str) -> str:
        """
        创建测试命名空间
        
        Args:
            name: 命名空间名称
            
        Returns:
            str: 创建的命名空间名称
        """
        namespace = client.V1Namespace(
            metadata=client.V1ObjectMeta(
                name=name,
                labels={"purpose": "testing", "ttl": "24h"}
            )
        )
        
        self.core_api.create_namespace(namespace)
        return name
    
    def deploy_test_services(self, namespace: str, 
                            manifests: List[Dict]) -> List[str]:
        """
        在测试命名空间部署服务
        
        Args:
            namespace: 目标命名空间
            manifests: K8s资源清单列表
            
        Returns:
            list: 部署的服务名称列表
        """
        deployed = []
        
        for manifest in manifests:
            kind = manifest.get("kind")
            name = manifest["metadata"]["name"]
            
            if kind == "Deployment":
                self.apps_api.create_namespaced_deployment(
                    namespace=namespace,
                    body=manifest
                )
            elif kind == "Service":
                self.core_api.create_namespaced_service(
                    namespace=namespace,
                    body=manifest
                )
            
            deployed.append(name)
        
        return deployed
    
    def cleanup_namespace(self, namespace: str):
        """
        清理测试命名空间
        
        Args:
            namespace: 要清理的命名空间
        """
        self.core_api.delete_namespace(name=namespace)
```

## 框架选型对比

| 维度 | Testkube | K8sTA | Testcontainers | Microcks |
|------|----------|-------|----------------|----------|
| 定位 | 测试编排 | 测试自动化 | 集成测试环境 | API Mock |
| K8s集成 | 原生 | 原生 | 可集成 | 可集成 |
| 学习曲线 | 中等 | 中等 | 平缓 | 平缓 |
| 适用场景 | 持续测试 | K8s测试 | 数据库测试 | 契约测试 |
| CI/CD | 优秀 | 良好 | 优秀 | 良好 |

## 最佳实践

1. **测试即代码**：所有测试定义使用YAML/代码管理
2. **环境隔离**：每个测试运行有独立的命名空间
3. **资源清理**：测试完成后自动清理资源
4. **并行执行**：利用K8s的并行能力加速测试
5. **监控集成**：测试指标接入Prometheus/Grafana
6. **GitOps**：测试定义与代码一起版本管理
