# 性能与负载测试框架

性能测试工具选型与最佳实践。

## Apache JMeter

最流行的性能测试工具。

- 协议覆盖最广
- 插件生态丰富
- 可视化测试设计
- 分布式压测支持
- CI/CD集成

### JMeter核心组件

```java
import org.apache.jmeter.config.Arguments;
import org.apache.jmeter.control.LoopController;
import org.apache.jmeter.engine.StandardJMeterEngine;
import org.apache.jmeter.protocol.http.control.gui.HttpTestSampleGui;
import org.apache.jmeter.protocol.http.sampler.HTTPSamplerProxy;
import org.apache.jmeter.reporters.ResultCollector;
import org.apache.jmeter.reporters.Summariser;
import org.apache.jmeter.save.SaveService;
import org.apache.jmeter.testelement.TestElement;
import org.apache.jmeter.testelement.TestPlan;
import org.apache.jmeter.threads.SetupThreadGroup;
import org.apache.jmeter.util.JMeterUtils;
import org.apache.jorphan.collections.HashTree;

/**
 * JMeter程序化配置示例
 * 展示如何通过代码创建和运行测试计划
 */
public class JMeterProgrammaticExample {
    
    public void runLoadTest(String jmeterHome, String outputPath) {
        // 初始化JMeter引擎
        StandardJMeterEngine jmeter = new StandardJMeterEngine();
        JMeterUtils.loadJMeterProperties(jmeterHome + "/bin/jmeter.properties");
        JMeterUtils.setJMeterHome(jmeterHome);
        JMeterUtils.initLocale();
        
        // 创建HTTP采样器
        HTTPSamplerProxy httpSampler = new HTTPSamplerProxy();
        httpSampler.setDomain("api.example.com");
        httpSampler.setPort(443);
        httpSampler.setPath("/users");
        httpSampler.setMethod("GET");
        httpSampler.setName("Get Users API");
        httpSampler.setProperty(TestElement.TEST_CLASS, HTTPSamplerProxy.class.getName());
        httpSampler.setProperty(TestElement.GUI_CLASS, HttpTestSampleGui.class.getName());
        
        // 创建循环控制器
        LoopController loopController = new LoopController();
        loopController.setLoops(100);
        loopController.setFirst(true);
        loopController.setProperty(TestElement.TEST_CLASS, LoopController.class.getName());
        loopController.initialize();
        
        // 创建线程组
        SetupThreadGroup threadGroup = new SetupThreadGroup();
        threadGroup.setName("Load Test Thread Group");
        threadGroup.setNumThreads(50);
        threadGroup.setRampUp(60);
        threadGroup.setDuration(300);
        threadGroup.setSamplerController(loopController);
        threadGroup.setProperty(TestElement.TEST_CLASS, SetupThreadGroup.class.getName());
        
        // 创建测试计划
        TestPlan testPlan = new TestPlan("API Load Test Plan");
        testPlan.setProperty(TestElement.TEST_CLASS, TestPlan.class.getName());
        
        // 构建测试树
        HashTree testPlanTree = new HashTree();
        HashTree threadGroupHashTree = testPlanTree.add(testPlan, threadGroup);
        threadGroupHashTree.add(httpSampler);
        
        // 添加结果收集器
        Summariser summariser = new Summariser("Summary Report");
        ResultCollector resultCollector = new ResultCollector(summariser);
        resultCollector.setFilename(outputPath);
        testPlanTree.add(testPlanTree.getArray()[0], resultCollector);
        
        // 运行测试
        jmeter.configure(testPlanTree);
        jmeter.run();
    }
}
```

### JMeter最佳实践

```python
from typing import Dict, List
import subprocess
import xml.etree.ElementTree as ET

class JMeterTestRunner:
    """
    JMeter测试运行器
    封装JMeter CLI调用和结果解析
    """
    def __init__(self, jmeter_home: str):
        """
        初始化运行器
        
        Args:
            jmeter_home: JMeter安装目录
        """
        self.jmeter_home = jmeter_home
        self.jmeter_path = f"{jmeter_home}/bin/jmeter"
    
    def run_test(self, test_plan: str, output_jtl: str, 
                 properties: Dict[str, str] = None) -> Dict:
        """
        运行JMeter测试计划
        
        Args:
            test_plan: 测试计划文件路径
            output_jtl: 输出结果文件路径
            properties: 运行时属性
            
        Returns:
            dict: 测试结果摘要
        """
        cmd = [
            self.jmeter_path,
            "-n",  # 非GUI模式
            "-t", test_plan,
            "-l", output_jtl,
            "-e",  # 生成报告
            "-o", output_jtl.replace(".jtl", "_report")
        ]
        
        if properties:
            for key, value in properties.items():
                cmd.extend(["-J", f"{key}={value}"])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "output_file": output_jtl
        }
    
    def parse_results(self, jtl_file: str) -> Dict:
        """
        解析JTL结果文件
        
        Args:
            jtl_file: JTL文件路径
            
        Returns:
            dict: 解析后的结果统计
        """
        tree = ET.parse(jtl_file)
        root = tree.getroot()
        
        response_times = []
        errors = 0
        total = 0
        
        for sample in root.findall(".//httpSample"):
            total += 1
            rt = int(sample.get("t", 0))
            response_times.append(rt)
            if sample.get("rc", "200") != "200":
                errors += 1
        
        if not response_times:
            return {"error": "无测试数据"}
        
        response_times.sort()
        
        return {
            "total_samples": total,
            "error_count": errors,
            "error_rate": errors / total * 100,
            "avg_response_time": sum(response_times) / len(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "p50": response_times[int(len(response_times) * 0.5)],
            "p90": response_times[int(len(response_times) * 0.9)],
            "p95": response_times[int(len(response_times) * 0.95)],
            "p99": response_times[int(len(response_times) * 0.99)]
        }
```

## K6

云原生性能测试工具。

- 云原生友好
- 代码化测试脚本（JavaScript）
- Grafana集成
- Kubernetes原生
- 高性能引擎

### K6测试脚本

```javascript
// load-test.js - K6负载测试脚本

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const requestCount = new Counter('requests');

// 测试配置选项
export const options = {
    stages: [
        { duration: '2m', target: 100 },   // 预热阶段
        { duration: '5m', target: 100 },   // 稳定负载
        { duration: '2m', target: 200 },   // 峰值负载
        { duration: '2m', target: 200 },   // 峰值保持
        { duration: '2m', target: 0 },     // 冷却阶段
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],   // 95%请求响应时间<500ms
        http_req_failed: ['rate<0.1'],      // 错误率<10%
        errors: ['rate<0.05'],              // 自定义错误率<5%
    },
};

// 测试数据
const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

/**
 * 设置函数，每个VU只执行一次
 */
export function setup() {
    // 登录获取token
    const loginRes = http.post(`${BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'testpass',
    });
    
    check(loginRes, {
        'login successful': (r) => r.status === 200,
    });
    
    return { token: loginRes.json('token') };
}

/**
 * 主测试函数，每个VU循环执行
 */
export default function (data) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
    };
    
    group('用户相关API', () => {
        // GET 获取用户列表
        const listRes = http.get(`${BASE_URL}/users?page=1&size=20`, { headers });
        requestCount.add(1);
        apiResponseTime.add(listRes.timings.duration);
        
        const listSuccess = check(listRes, {
            'list status is 200': (r) => r.status === 200,
            'list response time < 500ms': (r) => r.timings.duration < 500,
            'list has data': (r) => r.json('data').length > 0,
        });
        errorRate.add(!listSuccess);
        
        sleep(1);
        
        // POST 创建用户
        const createRes = http.post(`${BASE_URL}/users`, JSON.stringify({
            name: `User_${__VU}_${__ITER}`,
            email: `user_${__VU}_${__ITER}@example.com`,
        }), { headers });
        requestCount.add(1);
        apiResponseTime.add(createRes.timings.duration);
        
        const createSuccess = check(createRes, {
            'create status is 201': (r) => r.status === 201,
            'create response time < 1000ms': (r) => r.timings.duration < 1000,
        });
        errorRate.add(!createSuccess);
        
        sleep(2);
    });
    
    group订单相关API', () => {
        // GET 获取订单列表
        const orderRes = http.get(`${BASE_URL}/orders?status=pending`, { headers });
        requestCount.add(1);
        
        check(orderRes, {
            'order list status is 200': (r) => r.status === 200,
        });
        
        sleep(1);
    });
}

/**
 * 清理函数，测试结束后执行
 */
export function teardown(data) {
    console.log('测试完成，清理资源');
}
```

### K6与Grafana集成

```yaml
# docker-compose.yml - K6 + InfluxDB + Grafana 监控栈
version: '3.8'

services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6
      - INFLUXDB_ADMIN_USER=admin
      - INFLUXDB_ADMIN_PASSWORD=admin123
    volumes:
      - influxdb-data:/var/lib/influxdb

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - influxdb

  k6:
    image: grafana/k6:latest
    volumes:
      - ./scripts:/scripts
    command: run --out influxdb=http://influxdb:8086/k6 /scripts/load-test.js
    depends_on:
      - influxdb

volumes:
  influxdb-data:
  grafana-data:
```

## Locust

Python编写的分布式压测工具。

- Python编写
- 分布式施压
- 代码化场景定义
- Web监控界面
- 易于扩展

### Locust测试脚本

```python
from locust import HttpUser, task, between, events
from locust.runners import MasterRunner
import random
import json

class APIUser(HttpUser):
    """
    API性能测试用户类
    定义用户行为和请求模式
    """
    wait_time = between(1, 3)  # 请求间隔1-3秒
    host = "https://api.example.com"
    
    def on_start(self):
        """
        每个用户启动时执行
        用于登录和初始化
        """
        self.login()
    
    def login(self):
        """
        登录获取认证token
        """
        response = self.client.post("/auth/login", json={
            "username": f"user_{self.user_id}",
            "password": "testpass"
        })
        
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            self.token = None
            self.headers = {}
    
    @task(3)
    def get_user_list(self):
        """
        获取用户列表（权重3）
        """
        with self.client.get(
            "/users?page=1&size=20",
            headers=self.headers,
            catch_response=True,
            name="GET /users"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("data"):
                    response.success()
                else:
                    response.failure("响应数据为空")
            else:
                response.failure(f"状态码错误: {response.status_code}")
    
    @task(2)
    def create_user(self):
        """
        创建用户（权重2）
        """
        payload = {
            "name": f"TestUser_{random.randint(1000, 9999)}",
            "email": f"test{random.randint(1000, 9999)}@example.com"
        }
        
        with self.client.post(
            "/users",
            json=payload,
            headers=self.headers,
            catch_response=True,
            name="POST /users"
        ) as response:
            if response.status_code == 201:
                response.success()
            else:
                response.failure(f"创建失败: {response.status_code}")
    
    @task(1)
    def get_user_detail(self):
        """
        获取用户详情（权重1）
        """
        user_id = random.randint(1, 1000)
        self.client.get(
            f"/users/{user_id}",
            headers=self.headers,
            name="GET /users/{id}"
        )
    
    @task(1)
    def update_user(self):
        """
        更新用户信息（权重1）
        """
        user_id = random.randint(1, 1000)
        payload = {
            "name": f"UpdatedUser_{random.randint(1000, 9999)}"
        }
        
        self.client.put(
            f"/users/{user_id}",
            json=payload,
            headers=self.headers,
            name="PUT /users/{id}"
        )

class PeakLoadUser(HttpUser):
    """
    峰值负载测试用户
    更高的请求频率
    """
    wait_time = between(0.1, 0.5)
    host = "https://api.example.com"
    
    @task
    def high_freq_request(self):
        """高频请求"""
        self.client.get("/health", name="GET /health")

# 自定义事件监听
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, 
               response, context, exception, **kwargs):
    """
    请求事件监听
    用于自定义指标收集
    """
    if response_time > 1000:
        print(f"慢请求警告: {name} 耗时 {response_time}ms")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """
    测试停止事件
    用于生成最终报告
    """
    print("测试结束，生成报告...")
    if isinstance(environment.runner, MasterRunner):
        stats = environment.runner.stats
        print(f"总请求数: {stats.total.num_requests}")
        print(f"失败数: {stats.total.num_failures}")
        print(f"平均响应时间: {stats.total.avg_response_time:.2f}ms")
```

## Gatling

高性能负载测试引擎。

- Scala/Java编写
- 高性能压测引擎
- DSL场景定义
- 丰富的报告
- CI/CD集成

### Gatling场景示例

```scala
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

/**
 * Gatling性能测试场景
 * 使用DSL定义复杂的负载测试
 */
class APILoadTest extends Simulation {
  
  // HTTP协议配置
  val httpProtocol = http
    .baseUrl("https://api.example.com")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling/PerformanceTest")
  
  // 请求定义
  object UserRequests {
    val getUsers = http("Get Users")
      .get("/users?page=1&size=20")
      .check(status.is(200))
      .check(jsonPath("$.data").exists)
    
    val createUser = http("Create User")
      .post("/users")
      .body(StringBody("""{"name": "${userName}", "email": "${userEmail}"}"""))
      .check(status.is(201))
      .check(jsonPath("$.data.id").exists)
    
    val getUserDetail = http("Get User Detail")
      .get("/users/${userId}")
      .check(status.in(200, 404))
  }
  
  // 数据 feeders
  val userFeeder = csv("users.csv").random
  val emailFeeder = Iterator.continually(Map(
    "userEmail" -> s"user${System.currentTimeMillis()}@example.com",
    "userName" -> s"User${scala.util.Random.nextInt(10000)}"
  ))
  
  // 场景定义
  val userScenario = scenario("User API Scenario")
    .feed(userFeeder)
    .feed(emailFeeder)
    .exec(UserRequests.getUsers)
    .pause(1, 3)
    .exec(UserRequests.createUser)
    .pause(2, 5)
    .exec(UserRequests.getUserDetail)
  
  // 负载配置
  setUp(
    userScenario.inject(
      rampUsers(100).during(60.seconds),    // 60秒内 ramps up 100用户
      constantUsersPerSec(50).during(300.seconds),  // 持续300秒50用户/秒
      rampUsersPerSec(50).to(100).during(120.seconds), // 逐步增加到100用户/秒
      constantUsersPerSec(100).during(120.seconds),
      rampUsersPerSec(100).to(0).during(60.seconds)   // 逐步减少
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.max.lt(2000),     // 最大响应时间<2s
     global.responseTime.percentile(95).lt(500),  // 95%响应时间<500ms
     global.successfulRequests.percent.gt(95.0)   // 成功率>95%
   )
}
```

## 性能测试指标体系

| 指标类别 | 指标名称 | 说明 | 典型阈值 |
|---------|---------|------|---------|
| 响应时间 | 平均响应时间 | 所有请求的平均耗时 | < 200ms |
| 响应时间 | P50/P90/P95/P99 | 分位响应时间 | P95 < 500ms |
| 吞吐量 | TPS/QPS | 每秒事务/请求数 | 根据业务定 |
| 错误率 | 错误百分比 | 失败请求占比 | < 0.1% |
| 并发 | 并发用户数 | 同时在线用户数 | 根据业务定 |
| 资源 | CPU使用率 | 服务器CPU占用 | < 80% |
| 资源 | 内存使用率 | 服务器内存占用 | < 80% |
| 资源 | 磁盘IO | 磁盘读写性能 | 根据业务定 |

## 框架选型对比

| 维度 | JMeter | K6 | Locust | Gatling |
|------|--------|-----|--------|---------|
| 语言 | Java | JavaScript | Python | Scala/Java |
| 学习曲线 | 中等 | 平缓 | 平缓 | 较陡 |
| 协议支持 | 最全 | HTTP/WebSocket | HTTP | HTTP |
| 分布式 | 原生支持 | 云原生 | 原生支持 | 原生支持 |
| 报告 | 丰富 | Grafana集成 | Web界面 | 优秀 |
| CI/CD | 良好 | 优秀 | 良好 | 良好 |
| 资源占用 | 较高 | 低 | 中等 | 低 |

## 最佳实践

1. **渐进式加压**：从低并发逐步增加，找到性能拐点
2. **独立环境**：性能测试在独立环境执行，避免影响生产
3. **数据准备**：准备足够的测试数据，避免缓存干扰
4. **监控关联**：结合APM工具，定位性能瓶颈
5. **基线对比**：建立性能基线，持续跟踪退化
6. **容量规划**：基于测试结果进行容量规划
