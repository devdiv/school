# 安全与隐私合规

AI测试中的合规性要求。

## AI生成数据的隐私保护

数据隐私保护技术。

- 数据脱敏
- 差分隐私
- 联邦学习
- 数据最小化

### 隐私保护测试

```python
from typing import Dict, List, Optional
import hashlib
import re
from dataclasses import dataclass

@dataclass
class SensitivePattern:
    """敏感信息模式"""
    name: str
    pattern: str
    replacement: str

class PrivacyProtector:
    """
    隐私保护器
    处理测试数据中的敏感信息
    """
    def __init__(self):
        self.patterns = [
            SensitivePattern("email", r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
            SensitivePattern("phone", r'\b1[3-9]\d{9}\b', '[PHONE]'),
            SensitivePattern("id_card", r'\b\d{17}[\dXx]\b', '[ID_CARD]'),
            SensitivePattern("ip_address", r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '[IP]'),
            SensitivePattern("credit_card", r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', '[CREDIT_CARD]')
        ]
    
    def desensitize_text(self, text: str) -> str:
        """
        文本脱敏
        
        Args:
            text: 原始文本
            
        Returns:
            str: 脱敏后的文本
        """
        result = text
        
        for pattern in self.patterns:
            result = re.sub(pattern.pattern, pattern.replacement, result)
        
        return result
    
    def desensitize_dict(self, data: Dict,
                        sensitive_fields: List[str] = None) -> Dict:
        """
        字典脱敏
        
        Args:
            data: 原始数据
            sensitive_fields: 敏感字段列表
            
        Returns:
            dict: 脱敏后的数据
        """
        if sensitive_fields is None:
            sensitive_fields = ["password", "token", "secret", "key", "credit_card"]
        
        result = {}
        
        for key, value in data.items():
            if key.lower() in sensitive_fields:
                if isinstance(value, str):
                    result[key] = self._mask_string(value)
                else:
                    result[key] = "[REDACTED]"
            elif isinstance(value, dict):
                result[key] = self.desensitize_dict(value, sensitive_fields)
            elif isinstance(value, list):
                result[key] = [
                    self.desensitize_dict(item, sensitive_fields) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                result[key] = value
        
        return result
    
    def _mask_string(self, value: str, visible_chars: int = 4) -> str:
        """
        掩码字符串
        
        Args:
            value: 原始字符串
            visible_chars: 可见字符数
            
        Returns:
            str: 掩码后的字符串
        """
        if len(value) <= visible_chars * 2:
            return "*" * len(value)
        
        return value[:visible_chars] + "*" * (len(value) - visible_chars * 2) + value[-visible_chars:]
    
    def hash_identifier(self, identifier: str,
                       salt: str = "") -> str:
        """
        哈希标识符
        
        Args:
            identifier: 标识符
            salt: 盐值
            
        Returns:
            str: 哈希值
        """
        return hashlib.sha256(f"{identifier}{salt}".encode()).hexdigest()[:16]
    
    def apply_differential_privacy(self, data: List[float],
                                   epsilon: float = 1.0,
                                   sensitivity: float = 1.0) -> List[float]:
        """
        应用差分隐私
        
        Args:
            data: 原始数据
            epsilon: 隐私预算
            sensitivity: 敏感度
            
        Returns:
            list: 加噪后的数据
        """
        import numpy as np
        
        # 计算拉普拉斯噪声尺度
        scale = sensitivity / epsilon
        
        # 添加噪声
        noisy_data = []
        for value in data:
            noise = np.random.laplace(0, scale)
            noisy_data.append(value + noise)
        
        return noisy_data

class ComplianceChecker:
    """
    合规检查器
    检查测试流程的合规性
    """
    def __init__(self):
        self.rules = []
        self._init_rules()
    
    def _init_rules(self):
        """初始化合规规则"""
        self.rules = [
            {
                "name": "数据最小化",
                "check": self._check_data_minimization,
                "description": "只收集必要的测试数据"
            },
            {
                "name": "敏感数据保护",
                "check": self._check_sensitive_data_protection,
                "description": "敏感数据必须脱敏处理"
            },
            {
                "name": "数据保留期限",
                "check": self._check_data_retention,
                "description": "测试数据保留不超过规定期限"
            }
        ]
    
    def check_compliance(self, test_data: Dict,
                        test_logs: List[str]) -> Dict:
        """
        执行合规检查
        
        Args:
            test_data: 测试数据
            test_logs: 测试日志
            
        Returns:
            dict: 检查结果
        """
        results = []
        
        for rule in self.rules:
            passed, details = rule["check"](test_data, test_logs)
            results.append({
                "rule": rule["name"],
                "description": rule["description"],
                "passed": passed,
                "details": details
            })
        
        return {
            "overall_passed": all(r["passed"] for r in results),
            "results": results
        }
    
    def _check_data_minimization(self, test_data: Dict,
                                test_logs: List[str]) -> tuple:
        """检查数据最小化"""
        # 检查是否包含不必要的个人数据
        unnecessary_fields = ["hobby", "birthday", "address"]
        found = [f for f in unnecessary_fields if f in str(test_data).lower()]
        
        return len(found) == 0, f"发现不必要字段: {found}" if found else "符合要求"
    
    def _check_sensitive_data_protection(self, test_data: Dict,
                                        test_logs: List[str]) -> tuple:
        """检查敏感数据保护"""
        # 检查日志中是否有明文敏感信息
        sensitive_patterns = [r'\b\d{17}[\dXx]\b', r'password[=:]\s*\S+']
        
        for log in test_logs:
            for pattern in sensitive_patterns:
                if re.search(pattern, log, re.IGNORECASE):
                    return False, f"日志中发现未脱敏敏感信息"
        
        return True, "符合要求"
    
    def _check_data_retention(self, test_data: Dict,
                             test_logs: List[str]) -> tuple:
        """检查数据保留期限"""
        # 简化实现
        return True, "符合要求"
```

## 测试过程敏感信息脱敏与审计

测试数据安全管理。

- 日志脱敏
- 报告脱敏
- 审计追踪
- 访问控制

### 审计日志系统

```python
import json
from datetime import datetime
from typing import Dict, List

class AuditLogger:
    """
    审计日志器
    记录测试操作的审计日志
    """
    def __init__(self, log_file: str = "audit.log"):
        """
        初始化审计日志器
        
        Args:
            log_file: 日志文件路径
        """
        self.log_file = log_file
    
    def log_access(self, user_id: str, resource: str,
                  action: str, result: str):
        """
        记录访问日志
        
        Args:
            user_id: 用户ID
            resource: 资源
            action: 操作
            result: 结果
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "access",
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "result": result
        }
        
        self._write_log(entry)
    
    def log_data_operation(self, user_id: str,
                          operation: str,
                          data_type: str,
                          data_id: str,
                          details: Dict = None):
        """
        记录数据操作日志
        
        Args:
            user_id: 用户ID
            operation: 操作类型
            data_type: 数据类型
            data_id: 数据ID
            details: 详细信息
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "data_operation",
            "user_id": user_id,
            "operation": operation,
            "data_type": data_type,
            "data_id": data_id,
            "details": details or {}
        }
        
        self._write_log(entry)
    
    def log_security_event(self, event_type: str,
                          severity: str,
                          description: str,
                          source: str = None):
        """
        记录安全事件
        
        Args:
            event_type: 事件类型
            severity: 严重级别
            description: 描述
            source: 来源
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "security",
            "event_type": event_type,
            "severity": severity,
            "description": description,
            "source": source
        }
        
        self._write_log(entry)
    
    def _write_log(self, entry: Dict):
        """
        写入日志
        
        Args:
            entry: 日志条目
        """
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    def query_logs(self, start_time: datetime = None,
                  end_time: datetime = None,
                  user_id: str = None,
                  event_type: str = None) -> List[Dict]:
        """
        查询日志
        
        Args:
            start_time: 开始时间
            end_time: 结束时间
            user_id: 用户ID
            event_type: 事件类型
            
        Returns:
            list: 日志列表
        """
        results = []
        
        try:
            with open(self.log_file, 'r') as f:
                for line in f:
                    entry = json.loads(line.strip())
                    
                    # 过滤条件
                    if start_time:
                        entry_time = datetime.fromisoformat(entry["timestamp"])
                        if entry_time < start_time:
                            continue
                    
                    if user_id and entry.get("user_id") != user_id:
                        continue
                    
                    if event_type and entry.get("type") != event_type:
                        continue
                    
                    results.append(entry)
        except FileNotFoundError:
            pass
        
        return results
```

## 合规框架

| 法规 | 适用范围 | 关键要求 |
|------|---------|---------|
| GDPR | 欧盟 | 数据主体权利、同意机制 |
| CCPA | 加州 | 消费者知情权、删除权 |
| 网络安全法 | 中国 | 数据本地化、安全评估 |
| ISO 27001 | 国际 | 信息安全管理体系 |

## 最佳实践

1. **隐私设计**：从设计阶段就考虑隐私保护
2. **数据分类**：对数据进行分类分级管理
3. **访问控制**：最小权限原则
4. **定期审计**：定期审查数据使用情况
5. **员工培训**：提升团队合规意识
