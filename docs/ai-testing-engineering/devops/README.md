# DevOps集成

AI测试与DevOps集成实践，包括CI/CD集成、自动化流程、监控告警等。

## 📚 内容概览

### CI/CD集成
- **流水线集成**：CI/CD流水线集成、自动化构建
- **自动触发**：代码提交触发、定时触发、手动触发
- **质量门禁**：代码质量门禁、测试质量门禁
- **结果反馈**：构建结果反馈、测试结果反馈

### 自动化流程
- **任务调度**：定时任务调度、依赖任务调度
- **并发控制**：并发任务控制、资源限制
- **失败重试**：失败重试机制、重试策略
- **清理策略**：资源清理、数据清理、日志清理

### 监控告警
- **任务监控**：任务执行监控、任务状态监控
- **资源监控**：CPU、内存、磁盘、网络监控
- **异常告警**：异常检测、告警通知、告警升级
- **事件通知**：邮件通知、短信通知、IM通知

## 🏗️ DevOps架构

### 整体架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      代码管理                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Git仓库   │  │代码审查  │  │分支管理  │  │版本控制  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      CI/CD流水线                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │代码构建  │  │单元测试  │  │代码扫描  │  │打包部署  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      自动化测试                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │功能测试  │  │性能测试  │  │安全测试  │  │AI测试    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      监控告警                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │性能监控  │  │日志监控  │  │告警管理  │  │事件响应  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈推荐

| 层级 | 技术组件 | 推荐工具 | 说明 |
|------|---------|---------|------|
| 代码管理 | 版本控制 | Git、GitLab、GitHub | 代码版本管理 |
| 代码管理 | 代码审查 | GitLab MR、GitHub PR | 代码审查流程 |
| CI/CD | 持续集成 | Jenkins、GitLab CI、GitHub Actions | 自动化构建测试 |
| CI/CD | 持续部署 | ArgoCD、Flux、Spinnaker | 自动化部署 |
| 容器化 | 容器运行时 | Docker、containerd | 容器运行环境 |
| 容器化 | 容器编排 | Kubernetes | 容器编排管理 |
| 监控 | 指标监控 | Prometheus、Grafana | 系统指标监控 |
| 监控 | 日志管理 | ELK Stack、Loki | 日志收集分析 |
| 告警 | 告警管理 | AlertManager、PagerDuty | 告警通知管理 |

## 🎯 应用场景

### 持续集成
集成AI测试到CI流程，实现持续质量保障。

**具体场景**：
- 代码提交自动触发测试
- 自动化测试执行
- 测试结果反馈
- 质量门禁控制

**解决方案**：
```yaml
# GitLab CI配置示例
stages:
  - build
  - test
  - quality
  - deploy

variables:
  DOCKER_IMAGE: ai-test-platform
  KUBERNETES_NAMESPACE: ai-testing

# 构建阶段
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - develop

# 单元测试阶段
unit_test:
  stage: test
  image: python:3.9
  script:
    - pip install -r requirements.txt
    - pytest tests/unit/ --cov=src --cov-report=xml --cov-report=html
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
    paths:
      - htmlcov/
    expire_in: 1 week
  coverage: '/TOTAL.+?(\d+%)$/'

# AI测试阶段
ai_test:
  stage: test
  image: python:3.9
  script:
    - pip install -r requirements.txt
    - python scripts/run_ai_tests.py --config config/ai_test_config.yaml
  artifacts:
    reports:
      junit: ai_test_results.xml
    paths:
      - ai_test_reports/
    expire_in: 1 month
  only:
    - main
    - merge_requests

# 代码质量检查
code_quality:
  stage: quality
  image: sonarsource/sonar-scanner-cli
  script:
    - sonar-scanner
      -Dsonar.projectKey=$CI_PROJECT_NAME
      -Dsonar.sources=src
      -Dsonar.tests=tests
      -Dsonar.python.coverage.reportPaths=coverage.xml
  only:
    - main
    - merge_requests

# 部署到开发环境
deploy_dev:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context dev-cluster
    - kubectl set image deployment/$DOCKER_IMAGE $DOCKER_IMAGE=$DOCKER_IMAGE:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE
    - kubectl rollout status deployment/$DOCKER_IMAGE -n $KUBERNETES_NAMESPACE
  environment:
    name: development
    url: https://dev.example.com
  only:
    - develop

# 部署到生产环境
deploy_prod:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context prod-cluster
    - kubectl set image deployment/$DOCKER_IMAGE $DOCKER_IMAGE=$DOCKER_IMAGE:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE
    - kubectl rollout status deployment/$DOCKER_IMAGE -n $KUBERNETES_NAMESPACE
  environment:
    name: production
    url: https://www.example.com
  when: manual
  only:
    - main
```

### 持续交付
自动化测试流程，支持快速交付。

**具体场景**：
- 自动化部署流程
- 灰度发布
- 回滚机制
- 环境管理

**解决方案**：
```yaml
# ArgoCD应用配置
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-test-platform
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.com/ai-test-platform/k8s-manifests.git
    targetRevision: HEAD
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-testing
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
---
# Kubernetes部署配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-test-platform
  namespace: ai-testing
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ai-test-platform
  template:
    metadata:
      labels:
        app: ai-test-platform
        version: v1.0.0
    spec:
      containers:
      - name: platform
        image: ai-test-platform:latest
        ports:
        - containerPort: 8080
        env:
        - name: ENVIRONMENT
          value: "production"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
# 灰度发布配置（Istio）
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ai-test-platform
  namespace: ai-testing
spec:
  hosts:
  - ai-test-platform
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: ai-test-platform
        subset: canary
      weight: 100
  - route:
    - destination:
        host: ai-test-platform
        subset: stable
      weight: 90
    - destination:
        host: ai-test-platform
        subset: canary
      weight: 10
```

### 质量门禁
建立质量门禁，保障代码质量。

**具体场景**：
- 代码质量检查
- 测试覆盖率要求
- 安全扫描
- 性能基准测试

**解决方案**：
```python
import subprocess
import json
import sys
from typing import Dict, List

class QualityGate:
    """质量门禁检查器"""
    
    def __init__(self):
        self.checks = []
        self.results = []
    
    def add_check(self, name: str, command: str, threshold: float, operator: str = '>='):
        """添加质量检查项"""
        self.checks.append({
            'name': name,
            'command': command,
            'threshold': threshold,
            'operator': operator
        })
    
    def run_checks(self) -> bool:
        """运行所有质量检查"""
        all_passed = True
        
        for check in self.checks:
            result = self._run_single_check(check)
            self.results.append(result)
            
            if not result['passed']:
                all_passed = False
        
        return all_passed
    
    def _run_single_check(self, check: Dict) -> Dict:
        """运行单个质量检查"""
        try:
            result = subprocess.run(
                check['command'],
                shell=True,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            # 解析结果
            value = float(result.stdout.strip())
            
            # 判断是否通过
            if check['operator'] == '>=':
                passed = value >= check['threshold']
            elif check['operator'] == '<=':
                passed = value <= check['threshold']
            elif check['operator'] == '==':
                passed = value == check['threshold']
            else:
                passed = False
            
            return {
                'name': check['name'],
                'value': value,
                'threshold': check['threshold'],
                'operator': check['operator'],
                'passed': passed,
                'output': result.stdout,
                'error': result.stderr
            }
        except Exception as e:
            return {
                'name': check['name'],
                'value': None,
                'threshold': check['threshold'],
                'operator': check['operator'],
                'passed': False,
                'error': str(e)
            }
    
    def generate_report(self) -> str:
        """生成质量报告"""
        report_lines = [
            "# 质量门禁报告",
            "",
            "## 检查结果",
            ""
        ]
        
        for result in self.results:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            report_lines.append(f"### {result['name']}: {status}")
            
            if result['value'] is not None:
                report_lines.append(f"- 实际值: {result['value']}")
                report_lines.append(f"- 阈值: {result['threshold']}")
                report_lines.append(f"- 操作符: {result['operator']}")
            
            if result.get('error'):
                report_lines.append(f"- 错误: {result['error']}")
            
            report_lines.append("")
        
        passed_count = sum(1 for r in self.results if r['passed'])
        total_count = len(self.results)
        
        report_lines.extend([
            "## 总结",
            f"- 通过: {passed_count}/{total_count}",
            f"- 失败: {total_count - passed_count}/{total_count}"
        ])
        
        return "\n".join(report_lines)

# 使用示例
if __name__ == "__main__":
    gate = QualityGate()
    
    # 添加质量检查项
    gate.add_check(
        name="代码覆盖率",
        command="pytest --cov=src --cov-report=term-missing | grep TOTAL | awk '{print $4}' | sed 's/%//'",
        threshold=80,
        operator='>='
    )
    
    gate.add_check(
        name="代码复杂度",
        command="radon cc src -a -s | tail -1 | awk '{print $2}'",
        threshold=10,
        operator='<='
    )
    
    gate.add_check(
        name="安全漏洞",
        command="bandit -r src -f json | jq '.results | length'",
        threshold=0,
        operator='=='
    )
    
    # 运行检查
    if gate.run_checks():
        print("质量门禁检查通过！")
        sys.exit(0)
    else:
        print("质量门禁检查失败！")
        print(gate.generate_report())
        sys.exit(1)
```

### 监控告警
实时监控测试任务，及时发现和解决问题。

**具体场景**：
- 任务执行监控
- 资源使用监控
- 异常告警
- 事件通知

**解决方案**：
```yaml
# Prometheus监控配置
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'ai-test-cluster'
    environment: 'production'

rule_files:
  - 'alerts.yml'

scrape_configs:
  - job_name: 'ai-test-platform'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

---
# 告警规则配置
groups:
  - name: ai_test_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "高错误率告警"
          description: "错误率超过10%，当前值: {{ $value }}"
      
      - alert: TestFailureRate
        expr: rate(test_failures_total[5m]) / rate(test_total[5m]) > 0.05
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "测试失败率告警"
          description: "测试失败率超过5%，当前值: {{ $value }}"
      
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "容器内存使用率超过90%，当前值: {{ $value }}"
      
      - alert: TestExecutionTime
        expr: histogram_quantile(0.95, rate(test_duration_seconds_bucket[5m])) > 300
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "测试执行时间过长"
          description: "95%的测试执行时间超过5分钟，当前值: {{ $value }}s"

---
# AlertManager配置
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default-receiver'
  routes:
    - match:
        severity: critical
      receiver: 'critical-receiver'
    - match:
        severity: warning
      receiver: 'warning-receiver'

receivers:
  - name: 'default-receiver'
    email_configs:
      - to: 'team@example.com'
        send_resolved: true
  
  - name: 'critical-receiver'
    email_configs:
      - to: 'oncall@example.com'
        send_resolved: true
    webhook_configs:
      - url: 'http://webhook.example.com/alert'
        send_resolved: true
  
  - name: 'warning-receiver'
    email_configs:
      - to: 'team@example.com'
        send_resolved: true
```

## 🛠️ 工具集成

### CI/CD工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Jenkins | 持续集成 | 插件丰富、生态完善 | ⭐⭐⭐⭐⭐ |
| GitLab CI | 持续集成 | 与GitLab深度集成、配置简单 | ⭐⭐⭐⭐⭐ |
| GitHub Actions | 持续集成 | 云端托管、GitHub集成 | ⭐⭐⭐⭐⭐ |
| Tekton | 云原生CI/CD | Kubernetes原生、可扩展 | ⭐⭐⭐⭐ |
| ArgoCD | 持续部署 | GitOps、声明式 | ⭐⭐⭐⭐⭐ |

### 自动化测试工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Pytest | Python测试 | 插件丰富、易用 | ⭐⭐⭐⭐⭐ |
| JUnit | Java测试 | 标准化、生态完善 | ⭐⭐⭐⭐⭐ |
| Selenium | Web测试 | 跨浏览器、功能强大 | ⭐⭐⭐⭐⭐ |
| JMeter | 性能测试 | 功能全面、可扩展 | ⭐⭐⭐⭐⭐ |
| Locust | 负载测试 | Python编写、分布式 | ⭐⭐⭐⭐ |

### 监控工具

| 工具名称 | 适用场景 | 特点 | 推荐指数 |
|---------|---------|------|---------|
| Prometheus | 指标监控 | 开源、生态丰富 | ⭐⭐⭐⭐⭐ |
| Grafana | 可视化 | 多数据源、美观 | ⭐⭐⭐⭐⭐ |
| ELK Stack | 日志管理 | 功能全面、可扩展 | ⭐⭐⭐⭐⭐ |
| Jaeger | 分布式追踪 | 云原生、性能好 | ⭐⭐⭐⭐⭐ |
| PagerDuty | 告警管理 | 企业级、集成丰富 | ⭐⭐⭐⭐ |

## 📊 性能指标

### CI/CD性能指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 构建成功率 | ≥95% | 构建任务成功率 |
| 构建时间 | ≤10min | 平均构建时间 |
| 部署成功率 | ≥99% | 部署任务成功率 |
| 部署时间 | ≤5min | 平均部署时间 |
| 流水线执行时间 | ≤30min | 完整流水线执行时间 |

### 测试性能指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 测试覆盖率 | ≥80% | 代码测试覆盖率 |
| 测试成功率 | ≥95% | 测试用例成功率 |
| 测试执行时间 | ≤15min | 测试套件执行时间 |
| 自动化测试比例 | ≥90% | 自动化测试占比 |
| 测试反馈时间 | ≤5min | 测试结果反馈时间 |

### 监控效果指标

| 指标名称 | 目标值 | 说明 |
|---------|--------|------|
| 监控覆盖率 | 100% | 监控指标覆盖范围 |
| 告警准确率 | ≥95% | 告警准确度 |
| 告警响应时间 | ≤5min | 告警响应时间 |
| 故障恢复时间 | ≤30min | 故障平均恢复时间 |
| 误报率 | ≤5% | 告警误报率 |

## 🔧 最佳实践

### CI/CD最佳实践

1. **流水线设计**
   - 分阶段设计流水线
   - 并行执行独立任务
   - 缓存依赖加速构建

2. **质量门禁**
   - 设置合理的质量标准
   - 自动化质量检查
   - 及时反馈质量问题

3. **部署策略**
   - 采用灰度发布
   - 准备回滚方案
   - 监控部署过程

### 自动化测试最佳实践

1. **测试分层**
   - 单元测试快速反馈
   - 集成测试验证功能
   - 端到端测试覆盖场景

2. **测试数据管理**
   - 独立的测试数据
   - 数据清理机制
   - 数据版本管理

3. **测试报告**
   - 详细的测试报告
   - 趋势分析
   - 失败原因分析

### 监控告警最佳实践

1. **监控指标设计**
   - 关键业务指标
   - 系统性能指标
   - 资源使用指标

2. **告警策略**
   - 合理的告警阈值
   - 告警分级管理
   - 避免告警疲劳

3. **事件响应**
   - 明确的响应流程
   - 自动化处理机制
   - 事后复盘改进

## 🔗 相关资源

- [CI/CD集成方案](/ai-testing-engineering/devops/cicd-integration/)
- [自动化流程设计](/ai-testing-engineering/devops/automation/)
- [监控告警体系](/ai-testing-engineering/devops/monitoring/)
