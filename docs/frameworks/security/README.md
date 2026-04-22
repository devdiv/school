# 安全测试工具链

全面的安全测试工具体系。

## SAST（静态应用安全测试）

源代码安全分析工具。

- SonarQube：代码质量与安全平台
- Checkmarx：企业级SAST解决方案
- Yasca：开源代码扫描工具

### SAST集成实践

```python
from typing import Dict, List, Optional
import requests
import json

class SonarQubeClient:
    """
    SonarQube API客户端
    用于自动化代码安全扫描和结果获取
    """
    def __init__(self, base_url: str, token: str):
        """
        初始化客户端
        
        Args:
            base_url: SonarQube服务器地址
            token: API认证token
        """
        self.base_url = base_url.rstrip('/')
        self.auth = (token, '')
    
    def trigger_analysis(self, project_key: str, 
                        branch: str = "main") -> Dict:
        """
        触发代码分析
        
        Args:
            project_key: 项目标识
            branch: 分支名称
            
        Returns:
            dict: 分析任务信息
        """
        # 实际触发通常通过CI/CD中的sonar-scanner完成
        # 这里展示如何通过API获取分析结果
        return {
            "project_key": project_key,
            "branch": branch,
            "status": "triggered"
        }
    
    def get_issues(self, project_key: str, 
                   severities: List[str] = None,
                   types: List[str] = None) -> List[Dict]:
        """
        获取代码问题列表
        
        Args:
            project_key: 项目标识
            severities: 严重级别过滤
            types: 问题类型过滤
            
        Returns:
            list: 问题列表
        """
        params = {
            "componentKeys": project_key,
            "ps": 500,  # 每页数量
            "p": 1
        }
        
        if severities:
            params["severities"] = ",".join(severities)
        if types:
            params["types"] = ",".join(types)
        
        response = requests.get(
            f"{self.base_url}/api/issues/search",
            params=params,
            auth=self.auth
        )
        
        data = response.json()
        return data.get("issues", [])
    
    def get_security_hotspots(self, project_key: str) -> List[Dict]:
        """
        获取安全热点
        
        Args:
            project_key: 项目标识
            
        Returns:
            list: 安全热点列表
        """
        response = requests.get(
            f"{self.base_url}/api/hotspots/search",
            params={"projectKey": project_key},
            auth=self.auth
        )
        
        data = response.json()
        return data.get("hotspots", [])
    
    def get_quality_gate_status(self, project_key: str) -> Dict:
        """
        获取质量门禁状态
        
        Args:
            project_key: 项目标识
            
        Returns:
            dict: 质量门禁状态
        """
        response = requests.get(
            f"{self.base_url}/api/qualitygates/project_status",
            params={"projectKey": project_key},
            auth=self.auth
        )
        
        return response.json()
    
    def generate_security_report(self, project_key: str) -> Dict:
        """
        生成安全报告
        
        Args:
            project_key: 项目标识
            
        Returns:
            dict: 安全报告摘要
        """
        issues = self.get_issues(
            project_key,
            types=["VULNERABILITY", "SECURITY_HOTSPOT"]
        )
        
        severity_counts = {"BLOCKER": 0, "CRITICAL": 0, 
                          "MAJOR": 0, "MINOR": 0, "INFO": 0}
        
        for issue in issues:
            sev = issue.get("severity", "INFO")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
        
        return {
            "project_key": project_key,
            "total_issues": len(issues),
            "severity_distribution": severity_counts,
            "quality_gate": self.get_quality_gate_status(project_key)
        }

class SASTScanner:
    """
    SAST扫描器基类
    统一封装不同SAST工具的调用
    """
    def __init__(self, tool_type: str, config: Dict):
        """
        初始化扫描器
        
        Args:
            tool_type: 工具类型
            config: 配置信息
        """
        self.tool_type = tool_type
        self.config = config
    
    def scan(self, source_path: str, output_format: str = "json") -> Dict:
        """
        执行扫描
        
        Args:
            source_path: 源代码路径
            output_format: 输出格式
            
        Returns:
            dict: 扫描结果
        """
        if self.tool_type == "sonarqube":
            return self._scan_with_sonarqube(source_path)
        elif self.tool_type == "checkmarx":
            return self._scan_with_checkmarx(source_path)
        else:
            raise ValueError(f"不支持的SAST工具: {self.tool_type}")
    
    def _scan_with_sonarqube(self, source_path: str) -> Dict:
        """使用SonarQube扫描"""
        # 实际实现需要调用sonar-scanner CLI
        return {"tool": "sonarqube", "source": source_path, "status": "completed"}
    
    def _scan_with_checkmarx(self, source_path: str) -> Dict:
        """使用Checkmarx扫描"""
        return {"tool": "checkmarx", "source": source_path, "status": "completed"}
```

## DAST（动态应用安全测试）

运行时安全测试工具。

- OWASP ZAP：开源Web安全扫描器
- Burp Suite：专业Web安全测试工具
- Acunetix：自动化Web漏洞扫描

### OWASP ZAP自动化

```python
from typing import Dict, List
import requests
import time

class ZAPClient:
    """
    OWASP ZAP API客户端
    自动化Web应用安全扫描
    """
    def __init__(self, zap_url: str = "http://localhost:8080", 
                 api_key: str = None):
        """
        初始化ZAP客户端
        
        Args:
            zap_url: ZAP代理地址
            api_key: API密钥
        """
        self.zap_url = zap_url.rstrip('/')
        self.api_key = api_key
        self.proxy = {"http": zap_url, "https": zap_url}
    
    def start_spider(self, target_url: str, 
                     max_children: int = 10) -> str:
        """
        启动爬虫扫描
        
        Args:
            target_url: 目标URL
            max_children: 最大子页面数
            
        Returns:
            str: 扫描ID
        """
        params = {
            "url": target_url,
            "maxChildren": max_children
        }
        if self.api_key:
            params["apikey"] = self.api_key
        
        response = requests.get(
            f"{self.zap_url}/JSON/spider/action/scan/",
            params=params,
            proxies=self.proxy
        )
        
        return response.json().get("scan", "")
    
    def start_active_scan(self, target_url: str,
                         scan_policy_name: str = None) -> str:
        """
        启动主动扫描
        
        Args:
            target_url: 目标URL
            scan_policy_name: 扫描策略名称
            
        Returns:
            str: 扫描ID
        """
        params = {"url": target_url}
        if self.api_key:
            params["apikey"] = self.api_key
        if scan_policy_name:
            params["scanPolicyName"] = scan_policy_name
        
        response = requests.get(
            f"{self.zap_url}/JSON/ascan/action/scan/",
            params=params,
            proxies=self.proxy
        )
        
        return response.json().get("scan", "")
    
    def get_scan_progress(self, scan_id: str, scan_type: str = "ascan") -> int:
        """
        获取扫描进度
        
        Args:
            scan_id: 扫描ID
            scan_type: 扫描类型
            
        Returns:
            int: 进度百分比
        """
        params = {"scanId": scan_id}
        if self.api_key:
            params["apikey"] = self.api_key
        
        endpoint = f"JSON/{scan_type}/view/status/"
        response = requests.get(
            f"{self.zap_url}/{endpoint}",
            params=params,
            proxies=self.proxy
        )
        
        return int(response.json().get("status", "0"))
    
    def get_alerts(self, base_url: str = None, 
                   risk_levels: List[str] = None) -> List[Dict]:
        """
        获取安全告警
        
        Args:
            base_url: 基础URL过滤
            risk_levels: 风险级别过滤
            
        Returns:
            list: 告警列表
        """
        params = {}
        if self.api_key:
            params["apikey"] = self.api_key
        if base_url:
            params["baseurl"] = base_url
        if risk_levels:
            params["risklevels"] = ",".join(risk_levels)
        
        response = requests.get(
            f"{self.zap_url}/JSON/core/view/alerts/",
            params=params,
            proxies=self.proxy
        )
        
        return response.json().get("alerts", [])
    
    def generate_report(self, report_type: str = "html") -> str:
        """
        生成扫描报告
        
        Args:
            report_type: 报告类型
            
        Returns:
            str: 报告内容
        """
        params = {}
        if self.api_key:
            params["apikey"] = self.api_key
        
        endpoint_map = {
            "html": "OTHER/core/other/htmlreport/",
            "xml": "OTHER/core/other/xmlreport/",
            "json": "JSON/core/view/alerts/"
        }
        
        response = requests.get(
            f"{self.zap_url}/{endpoint_map.get(report_type, 'html')}",
            params=params,
            proxies=self.proxy
        )
        
        return response.text
    
    def wait_for_scan(self, scan_id: str, scan_type: str = "ascan",
                     timeout: int = 3600, poll_interval: int = 10) -> bool:
        """
        等待扫描完成
        
        Args:
            scan_id: 扫描ID
            scan_type: 扫描类型
            timeout: 超时时间
            poll_interval: 轮询间隔
            
        Returns:
            bool: 是否成功完成
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            progress = self.get_scan_progress(scan_id, scan_type)
            print(f"扫描进度: {progress}%")
            
            if progress >= 100:
                return True
            
            time.sleep(poll_interval)
        
        return False
```

## SCA（软件成分分析）

第三方组件安全分析。

- Snyk：开发者优先的安全平台
- Black Duck：企业级SCA解决方案
- 依赖漏洞检测
- 许可证合规检查

### SCA集成实践

```python
from typing import Dict, List
import json
import subprocess

class SCAScanner:
    """
    软件成分分析扫描器
    检测第三方依赖的安全漏洞
    """
    def __init__(self, tool: str = "snyk"):
        """
        初始化扫描器
        
        Args:
            tool: SCA工具名称
        """
        self.tool = tool
    
    def scan_dependencies(self, manifest_path: str,
                         severity_threshold: str = "high") -> Dict:
        """
        扫描依赖漏洞
        
        Args:
            manifest_path: 依赖清单文件路径
            severity_threshold: 严重级别阈值
            
        Returns:
            dict: 扫描结果
        """
        if self.tool == "snyk":
            return self._scan_with_snyk(manifest_path, severity_threshold)
        elif self.tool == "npm_audit":
            return self._scan_with_npm(manifest_path)
        else:
            raise ValueError(f"不支持的SCA工具: {self.tool}")
    
    def _scan_with_snyk(self, manifest_path: str, 
                       severity_threshold: str) -> Dict:
        """
        使用Snyk扫描
        
        Args:
            manifest_path: 清单路径
            severity_threshold: 严重级别阈值
            
        Returns:
            dict: 扫描结果
        """
        cmd = [
            "snyk", "test",
            "--file", manifest_path,
            "--severity-threshold", severity_threshold,
            "--json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        try:
            vulnerabilities = json.loads(result.stdout)
        except json.JSONDecodeError:
            vulnerabilities = []
        
        summary = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        for vuln in vulnerabilities.get("vulnerabilities", []):
            severity = vuln.get("severity", "low").lower()
            summary[severity] = summary.get(severity, 0) + 1
        
        return {
            "tool": "snyk",
            "manifest": manifest_path,
            "vulnerabilities": vulnerabilities,
            "summary": summary,
            "total": sum(summary.values())
        }
    
    def _scan_with_npm(self, manifest_path: str) -> Dict:
        """
        使用npm audit扫描
        
        Args:
            manifest_path: package.json路径
            
        Returns:
            dict: 扫描结果
        """
        import os
        os.chdir(os.path.dirname(manifest_path))
        
        result = subprocess.run(
            ["npm", "audit", "--json"],
            capture_output=True,
            text=True
        )
        
        audit_data = json.loads(result.stdout)
        
        return {
            "tool": "npm_audit",
            "manifest": manifest_path,
            "vulnerabilities": audit_data.get("vulnerabilities", {}),
            "metadata": audit_data.get("metadata", {})
        }
    
    def check_licenses(self, manifest_path: str,
                      allowed_licenses: List[str] = None) -> Dict:
        """
        检查许可证合规性
        
        Args:
            manifest_path: 清单路径
            allowed_licenses: 允许的许可证列表
            
        Returns:
            dict: 许可证检查结果
        """
        if not allowed_licenses:
            allowed_licenses = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC"]
        
        # 使用license-checker等工具
        cmd = [
            "license-checker",
            "--json",
            "--start", os.path.dirname(manifest_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        licenses = json.loads(result.stdout)
        
        violations = []
        for package, info in licenses.items():
            pkg_license = info.get("licenses", "UNKNOWN")
            if isinstance(pkg_license, list):
                pkg_license = ", ".join(pkg_license)
            
            if pkg_license not in allowed_licenses:
                violations.append({
                    "package": package,
                    "license": pkg_license
                })
        
        return {
            "total_packages": len(licenses),
            "violations": violations,
            "violation_count": len(violations)
        }
```

## IAST（交互式安全测试）

交互式应用安全测试。

- Contrast Security：运行时应用安全
- Seeker：交互式安全测试平台
- 实时漏洞检测
- 精准漏洞定位

### 安全测试流水线

```yaml
# security-pipeline.yaml - 安全测试流水线
stages:
  - sast
  - sca
  - dast
  - report

sast_scan:
  stage: sast
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner
      -Dsonar.projectKey=$CI_PROJECT_NAME
      -Dsonar.sources=.
      -Dsonar.host.url=$SONAR_URL
      -Dsonar.login=$SONAR_TOKEN
  artifacts:
    reports:
      sast: gl-sast-report.json
  allow_failure: true

sca_scan:
  stage: sca
  image: node:18
  script:
    - npm install -g snyk
    - snyk test --json --severity-threshold=high > sca-report.json
  artifacts:
    paths:
      - sca-report.json
  allow_failure: true

dast_scan:
  stage: dast
  image: owasp/zap2docker-stable
  script:
    - zap-baseline.py -t $TARGET_URL -r dast-report.html
  artifacts:
    paths:
      - dast-report.html
  allow_failure: true
  only:
    - main

security_report:
  stage: report
  image: python:3.11
  script:
    - python scripts/merge_security_reports.py
      --sast sast-report.json
      --sca sca-report.json
      --dast dast-report.html
      --output security-summary.html
  artifacts:
    paths:
      - security-summary.html
```

## 安全测试策略

### 测试金字塔（安全视角）

```
                 /\
                /  \
               /DAST\       <- 运行时测试（生产-like环境）
              /------\
             /  IAST  \     <- 交互式测试（运行时插桩）
            /----------\
           /    SCA     \   <- 依赖分析（构建时）
          /--------------\
         /      SAST      \ <- 静态分析（编码时）
        /------------------\
```

### 漏洞严重级别定义

| 级别 | CVSS分数 | 响应时间 | 示例 |
|------|---------|---------|------|
| 严重 | 9.0-10.0 | 24小时 | SQL注入、RCE |
| 高危 | 7.0-8.9 | 72小时 | XSS、认证绕过 |
| 中危 | 4.0-6.9 | 2周 | CSRF、信息泄露 |
| 低危 | 0.1-3.9 | 1个月 | 弱加密、配置问题 |

## 最佳实践

1. **左移安全**：在编码阶段就引入SAST
2. **自动化集成**：安全扫描集成到CI/CD
3. **漏洞管理**：建立漏洞跟踪和修复流程
4. **定期扫描**：定期执行全量安全扫描
5. **渗透测试**：定期邀请外部专家渗透测试
6. **安全培训**：提升团队安全意识
