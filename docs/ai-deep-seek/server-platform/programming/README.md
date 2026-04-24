# 编程语言与核心框架

服务端测试平台开发技术栈。

## Python

测试平台开发的首选语言。

- 丰富的测试生态（pytest/unittest）
- 数据处理与分析（pandas/numpy）
- 异步编程（asyncio）
- AI/ML集成（PyTorch/TensorFlow）

### Python测试平台开发

```python
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import asyncio
import json

@dataclass
class TestCase:
    """测试用例数据类"""
    id: str
    name: str
    description: str
    tags: List[str]
    priority: str
    steps: List[Dict]
    created_at: datetime
    updated_at: datetime

class TestCaseManager:
    """
    测试用例管理器
    实现测试用例的CRUD操作
    """
    def __init__(self, storage_path: str = "./test_cases"):
        """
        初始化管理器
        
        Args:
            storage_path: 存储路径
        """
        self.storage_path = storage_path
        self._cases: Dict[str, TestCase] = {}
        self._index_by_tag: Dict[str, List[str]] = {}
    
    def create_case(self, name: str, description: str,
                   steps: List[Dict], tags: List[str] = None,
                   priority: str = "medium") -> TestCase:
        """
        创建测试用例
        
        Args:
            name: 用例名称
            description: 用例描述
            steps: 测试步骤
            tags: 标签列表
            priority: 优先级
            
        Returns:
            TestCase: 创建的用例
        """
        case_id = f"TC{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        case = TestCase(
            id=case_id,
            name=name,
            description=description,
            tags=tags or [],
            priority=priority,
            steps=steps,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self._cases[case_id] = case
        
        # 更新标签索引
        for tag in case.tags:
            if tag not in self._index_by_tag:
                self._index_by_tag[tag] = []
            self._index_by_tag[tag].append(case_id)
        
        return case
    
    def get_case(self, case_id: str) -> Optional[TestCase]:
        """
        获取测试用例
        
        Args:
            case_id: 用例ID
            
        Returns:
            TestCase: 测试用例
        """
        return self._cases.get(case_id)
    
    def search_by_tag(self, tag: str) -> List[TestCase]:
        """
        按标签搜索
        
        Args:
            tag: 标签
            
        Returns:
            list: 测试用例列表
        """
        case_ids = self._index_by_tag.get(tag, [])
        return [self._cases[cid] for cid in case_ids if cid in self._cases]
    
    def update_case(self, case_id: str, **kwargs) -> Optional[TestCase]:
        """
        更新测试用例
        
        Args:
            case_id: 用例ID
            **kwargs: 更新字段
            
        Returns:
            TestCase: 更新后的用例
        """
        case = self._cases.get(case_id)
        if not case:
            return None
        
        for key, value in kwargs.items():
            if hasattr(case, key):
                setattr(case, key, value)
        
        case.updated_at = datetime.now()
        return case

class AsyncTestRunner:
    """
    异步测试执行器
    支持并发执行测试用例
    """
    def __init__(self, max_concurrent: int = 10):
        """
        初始化执行器
        
        Args:
            max_concurrent: 最大并发数
        """
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def run_test(self, case: TestCase) -> Dict:
        """
        执行单个测试
        
        Args:
            case: 测试用例
            
        Returns:
            dict: 执行结果
        """
        async with self.semaphore:
            start_time = datetime.now()
            
            try:
                # 执行测试步骤
                for step in case.steps:
                    await self._execute_step(step)
                
                return {
                    "case_id": case.id,
                    "status": "passed",
                    "duration": (datetime.now() - start_time).total_seconds(),
                    "error": None
                }
            
            except Exception as e:
                return {
                    "case_id": case.id,
                    "status": "failed",
                    "duration": (datetime.now() - start_time).total_seconds(),
                    "error": str(e)
                }
    
    async def _execute_step(self, step: Dict):
        """
        执行测试步骤
        
        Args:
            step: 步骤定义
        """
        action = step.get("action")
        params = step.get("params", {})
        
        if action == "wait":
            await asyncio.sleep(params.get("seconds", 1))
        elif action == "api_call":
            # 执行API调用
            pass
        elif action == "assert":
            # 执行断言
            pass
    
    async def run_batch(self, cases: List[TestCase]) -> List[Dict]:
        """
        批量执行测试
        
        Args:
            cases: 测试用例列表
            
        Returns:
            list: 执行结果列表
        """
        tasks = [self.run_test(case) for case in cases]
        return await asyncio.gather(*tasks)
```

## TypeScript/Node.js

前端测试工具与服务端开发。

- 类型安全
- 现代前端测试工具
- 高性能服务端
- 丰富的npm生态

### Node.js测试服务

```typescript
// test-service.ts - TypeScript测试服务示例

interface TestRequest {
    id: string;
    type: 'api' | 'ui' | 'performance';
    config: Record<string, any>;
    priority: number;
}

interface TestResult {
    requestId: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    details: Record<string, any>;
    logs: string[];
}

/**
 * 测试任务队列管理器
 */
class TestQueueManager {
    private queue: TestRequest[] = [];
    private running: Map<string, AbortController> = new Map();
    private maxConcurrent: number;

    constructor(maxConcurrent: number = 5) {
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * 添加测试任务到队列
     */
    enqueue(request: TestRequest): void {
        this.queue.push(request);
        this.queue.sort((a, b) => b.priority - a.priority);
    }

    /**
     * 取消正在运行的测试
     */
    cancel(requestId: string): boolean {
        const controller = this.running.get(requestId);
        if (controller) {
            controller.abort();
            this.running.delete(requestId);
            return true;
        }
        return false;
    }

    /**
     * 获取队列状态
     */
    getStatus(): { queued: number; running: number } {
        return {
            queued: this.queue.length,
            running: this.running.size
        };
    }
}

/**
 * API测试执行器
 */
class APITestExecutor {
    async execute(request: TestRequest): Promise<TestResult> {
        const startTime = Date.now();
        const logs: string[] = [];

        try {
            const response = await fetch(request.config.url, {
                method: request.config.method || 'GET',
                headers: request.config.headers,
                body: request.config.body ? JSON.stringify(request.config.body) : undefined
            });

            const duration = Date.now() - startTime;
            const success = response.status === (request.config.expectedStatus || 200);

            return {
                requestId: request.id,
                status: success ? 'passed' : 'failed',
                duration,
                details: {
                    statusCode: response.status,
                    headers: Object.fromEntries(response.headers.entries())
                },
                logs
            };
        } catch (error) {
            return {
                requestId: request.id,
                status: 'failed',
                duration: Date.now() - startTime,
                details: { error: (error as Error).message },
                logs
            };
        }
    }
}
```

## Shell

自动化脚本与运维工具。

- 测试环境搭建
- CI/CD流水线
- 日志处理
- 系统监控

### Shell测试脚本

```bash
#!/bin/bash
# test-runner.sh - 自动化测试执行脚本

set -euo pipefail

# 配置
TEST_ENV=${TEST_ENV:-"staging"}
PARALLEL=${PARALLEL:-"4"}
REPORT_DIR=${REPORT_DIR:-"./reports"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 准备环境
prepare_environment() {
    log_info "准备测试环境: $TEST_ENV"
    
    # 创建报告目录
    mkdir -p "$REPORT_DIR/$TIMESTAMP"
    
    # 检查依赖
    command -v python3 >/dev/null 2>&1 || { log_error "需要Python3"; exit 1; }
    command -v pytest >/dev/null 2>&1 || { log_error "需要pytest"; exit 1; }
    
    log_info "环境准备完成"
}

# 运行测试
run_tests() {
    log_info "开始执行测试..."
    
    local test_result=0
    
    # API测试
    log_info "执行API测试"
    pytest tests/api/ \
        -n "$PARALLEL" \
        --html="$REPORT_DIR/$TIMESTAMP/api_report.html" \
        --json-report \
        --json-report-file="$REPORT_DIR/$TIMESTAMP/api_report.json" \
        || test_result=1
    
    # UI测试
    log_info "执行UI测试"
    pytest tests/ui/ \
        --headed \
        --video=retain-on-failure \
        --html="$REPORT_DIR/$TIMESTAMP/ui_report.html" \
        || test_result=1
    
    # 性能测试
    log_info "执行性能测试"
    k6 run \
        --out json="$REPORT_DIR/$TIMESTAMP/performance.json" \
        tests/performance/load-test.js \
        || test_result=1
    
    return $test_result
}

# 生成报告
generate_report() {
    log_info "生成测试报告"
    
    cat > "$REPORT_DIR/$TIMESTAMP/summary.md" << EOF
# 测试执行报告

- 执行时间: $TIMESTAMP
- 环境: $TEST_ENV
- 报告目录: $REPORT_DIR/$TIMESTAMP

## 测试套件

- API测试: tests/api/
- UI测试: tests/ui/
- 性能测试: tests/performance/

EOF
    
    log_info "报告已生成: $REPORT_DIR/$TIMESTAMP/summary.md"
}

# 清理
cleanup() {
    log_info "清理临时文件"
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
}

# 主流程
main() {
    log_info "测试执行开始"
    
    prepare_environment
    
    if run_tests; then
        log_info "所有测试通过"
    else
        log_error "部分测试失败"
    fi
    
    generate_report
    cleanup
    
    log_info "测试执行完成"
}

# 信号处理
trap cleanup EXIT

main "$@"
```

## 框架选型对比

| 场景 | Python | TypeScript | Shell |
|------|--------|-----------|-------|
| 测试框架开发 | 优秀 | 良好 | 不适用 |
| API测试 | 优秀 | 优秀 | 一般 |
| UI自动化 | 良好 | 优秀 | 不适用 |
| 数据处理 | 优秀 | 良好 | 一般 |
| CI/CD脚本 | 良好 | 良好 | 优秀 |
| AI/ML集成 | 优秀 | 一般 | 不适用 |

## 最佳实践

1. **类型安全**：TypeScript优先用于大型项目
2. **异步处理**：IO密集型任务使用异步编程
3. **代码质量**：静态类型检查 + 代码审查
4. **测试覆盖**：核心逻辑100%单元测试覆盖
5. **文档完善**：函数级文档 + 使用示例
