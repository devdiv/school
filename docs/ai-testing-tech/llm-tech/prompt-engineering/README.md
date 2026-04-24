# Prompt工程最佳实践

深入探讨大语言模型提示词工程的高级技术与实践方法。

## 概述

大模型应用架构是将LLM能力集成到测试系统的核心技术架构。通过合理的架构设计，可以充分发挥大模型的能力，同时保证系统的稳定性、可扩展性和成本效益。

### 架构原则

- **模块化设计**：各组件解耦，便于维护和升级
- **可扩展性**：支持水平扩展，应对高并发场景
- **成本优化**：合理使用模型，控制API调用成本
- **容错设计**：具备降级和重试机制

### 技术栈

```
大模型应用技术栈
├── 模型层
│   ├── OpenAI GPT-4/GPT-3.5
│   ├── Claude 3
│   ├── 开源模型（LLaMA、Qwen）
│   └── 本地部署模型
├── 框架层
│   ├── LangChain
│   ├── LlamaIndex
│   ├── Semantic Kernel
│   └── AutoGPT
├── 基础设施层
│   ├── 向量数据库（Milvus、Pinecone）
│   ├── 消息队列（Kafka、RabbitMQ）
│   ├── 缓存（Redis）
│   └── 监控（Prometheus、Grafana）
└── 应用层
    ├── 测试用例生成
    ├── 智能诊断
    ├── 代码审查
    └── 文档生成
```

## Prompt Engineering 进阶

### 高级提示词技术

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json

class PromptTemplate:
    """
    提示词模板类
    支持变量插值和条件渲染
    """
    def __init__(self, template: str, input_variables: List[str]):
        self.template = template
        self.input_variables = input_variables
    
    def format(self, **kwargs) -> str:
        """
        格式化提示词
        
        Args:
            **kwargs: 变量值
            
        Returns:
            str: 格式化后的提示词
        """
        return self.template.format(**kwargs)
    
    def partial_format(self, **kwargs) -> 'PromptTemplate':
        """
        部分格式化
        
        Args:
            **kwargs: 部分变量值
            
        Returns:
            PromptTemplate: 新的模板对象
        """
        new_template = self.template.format(**kwargs)
        remaining_vars = [v for v in self.input_variables if v not in kwargs]
        return PromptTemplate(new_template, remaining_vars)

class FewShotPromptTemplate(PromptTemplate):
    """
    Few-shot提示词模板
    包含示例的提示词模板
    """
    def __init__(
        self, 
        template: str,
        input_variables: List[str],
        examples: List[Dict[str, str]],
        example_prompt: PromptTemplate,
        prefix: str = "",
        suffix: str = ""
    ):
        super().__init__(template, input_variables)
        self.examples = examples
        self.example_prompt = example_prompt
        self.prefix = prefix
        self.suffix = suffix
    
    def format(self, **kwargs) -> str:
        """
        格式化包含示例的提示词
        
        Args:
            **kwargs: 变量值
            
        Returns:
            str: 格式化后的提示词
        """
        formatted_examples = []
        for example in self.examples:
            formatted_examples.append(self.example_prompt.format(**example))
        
        examples_str = "\n\n".join(formatted_examples)
        
        return f"{self.prefix}\n\n{examples_str}\n\n{self.suffix}\n\n{super().format(**kwargs)}"

class ChainOfThoughtPrompt(PromptTemplate):
    """
    思维链提示词模板
    引导模型逐步推理
    """
    def __init__(self, template: str, input_variables: List[str]):
        cot_suffix = """
让我们一步步思考：
1. 首先，分析问题的核心
2. 然后，考虑可能的解决方案
3. 接着，评估每个方案的优缺点
4. 最后，给出最优答案

请展示你的完整思考过程。
"""
        super().__init__(template + cot_suffix, input_variables)

class SelfConsistencyPrompt:
    """
    自一致性提示词
    通过多次采样提高答案质量
    """
    def __init__(self, llm_client, num_samples: int = 5):
        self.llm = llm_client
        self.num_samples = num_samples
    
    def generate_with_consistency(
        self, 
        prompt: str, 
        temperature: float = 0.7
    ) -> Dict:
        """
        使用自一致性生成答案
        
        Args:
            prompt: 提示词
            temperature: 温度参数
            
        Returns:
            dict: 包含多个样本和最终答案的结果
        """
        responses = []
        
        for _ in range(self.num_samples):
            response = self.llm.generate(
                prompt, 
                temperature=temperature
            )
            responses.append(response)
        
        final_answer = self._aggregate_responses(responses)
        
        return {
            "samples": responses,
            "final_answer": final_answer,
            "confidence": self._calculate_confidence(responses, final_answer)
        }
    
    def _aggregate_responses(self, responses: List[str]) -> str:
        """
        聚合多个响应
        
        Args:
            responses: 响应列表
            
        Returns:
            str: 最终答案
        """
        from collections import Counter
        
        answers = [self._extract_answer(r) for r in responses]
        answer_counts = Counter(answers)
        return answer_counts.most_common(1)[0][0]
    
    def _extract_answer(self, response: str) -> str:
        """
        从响应中提取答案
        
        Args:
            response: 响应文本
            
        Returns:
            str: 提取的答案
        """
        if "答案是：" in response:
            return response.split("答案是：")[-1].strip()
        return response.strip()
    
    def _calculate_confidence(self, responses: List[str], final_answer: str) -> float:
        """
        计算置信度
        
        Args:
            responses: 响应列表
            final_answer: 最终答案
            
        Returns:
            float: 置信度
        """
        matching = sum(1 for r in responses if final_answer in r)
        return matching / len(responses)

class TreeOfThoughtPrompt:
    """
    思维树提示词
    探索多个推理路径
    """
    def __init__(self, llm_client, max_depth: int = 3, branching_factor: int = 3):
        self.llm = llm_client
        self.max_depth = max_depth
        self.branching_factor = branching_factor
    
    def explore_thought_tree(self, problem: str) -> Dict:
        """
        探索思维树
        
        Args:
            problem: 问题描述
            
        Returns:
            dict: 思维树和最优路径
        """
        tree = self._build_tree(problem, depth=0)
        best_path = self._find_best_path(tree)
        
        return {
            "tree": tree,
            "best_path": best_path,
            "solution": best_path[-1]["thought"] if best_path else None
        }
    
    def _build_tree(self, problem: str, depth: int) -> Dict:
        """
        构建思维树
        
        Args:
            problem: 问题
            depth: 当前深度
            
        Returns:
            dict: 思维树节点
        """
        if depth >= self.max_depth:
            return {"thought": problem, "children": [], "score": self._evaluate(problem)}
        
        prompt = f"""
问题：{problem}

请生成{self.branching_factor}个不同的思考方向：
"""
        
        response = self.llm.generate(prompt)
        thoughts = self._parse_thoughts(response)
        
        children = []
        for thought in thoughts:
            child_tree = self._build_tree(thought, depth + 1)
            children.append(child_tree)
        
        return {
            "thought": problem,
            "children": children,
            "score": max(c["score"] for c in children) if children else 0
        }
    
    def _parse_thoughts(self, response: str) -> List[str]:
        """
        解析思考方向
        
        Args:
            response: 响应文本
            
        Returns:
            list: 思考方向列表
        """
        lines = response.strip().split("\n")
        return [line.strip() for line in lines if line.strip()][:self.branching_factor]
    
    def _evaluate(self, thought: str) -> float:
        """
        评估思考质量
        
        Args:
            thought: 思考内容
            
        Returns:
            float: 评分
        """
        prompt = f"评估以下思考的质量（0-1分）：{thought}\n只返回分数。"
        try:
            score = float(self.llm.generate(prompt).strip())
            return min(max(score, 0), 1)
        except:
            return 0.5
    
    def _find_best_path(self, tree: Dict) -> List[Dict]:
        """
        找到最优路径
        
        Args:
            tree: 思维树
            
        Returns:
            list: 最优路径
        """
        if not tree["children"]:
            return [tree]
        
        best_child = max(tree["children"], key=lambda x: x["score"])
        return [tree] + self._find_best_path(best_child)
```

### 提示词优化策略

```python
from typing import Dict, List, Tuple
import time

class PromptOptimizer:
    """
    提示词优化器
    自动优化提示词效果
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self.optimization_history = []
    
    def optimize_prompt(
        self, 
        initial_prompt: str,
        evaluation_func: callable,
        iterations: int = 5
    ) -> Dict:
        """
        优化提示词
        
        Args:
            initial_prompt: 初始提示词
            evaluation_func: 评估函数
            iterations: 迭代次数
            
        Returns:
            dict: 优化结果
        """
        current_prompt = initial_prompt
        best_score = 0
        best_prompt = current_prompt
        
        for i in range(iterations):
            score = evaluation_func(current_prompt)
            
            if score > best_score:
                best_score = score
                best_prompt = current_prompt
            
            improvement_suggestions = self._generate_improvements(
                current_prompt, 
                score
            )
            
            current_prompt = self._apply_improvements(
                current_prompt,
                improvement_suggestions
            )
            
            self.optimization_history.append({
                "iteration": i + 1,
                "prompt": current_prompt,
                "score": score
            })
        
        return {
            "best_prompt": best_prompt,
            "best_score": best_score,
            "history": self.optimization_history
        }
    
    def _generate_improvements(self, prompt: str, score: float) -> List[str]:
        """
        生成改进建议
        
        Args:
            prompt: 当前提示词
            score: 当前分数
            
        Returns:
            list: 改进建议列表
        """
        meta_prompt = f"""
当前提示词：
{prompt}

当前得分：{score}

请分析这个提示词的不足之处，并提供3个具体的改进建议。
"""
        
        response = self.llm.generate(meta_prompt)
        return response.strip().split("\n")[:3]
    
    def _apply_improvements(self, prompt: str, suggestions: List[str]) -> str:
        """
        应用改进建议
        
        Args:
            prompt: 当前提示词
            suggestions: 改进建议
            
        Returns:
            str: 改进后的提示词
        """
        meta_prompt = f"""
原提示词：
{prompt}

改进建议：
{chr(10).join(suggestions)}

请根据以上建议改进提示词，直接输出改进后的提示词。
"""
        
        return self.llm.generate(meta_prompt)

class PromptVersionControl:
    """
    提示词版本控制
    管理提示词的版本历史
    """
    def __init__(self):
        self.versions: Dict[str, List[Dict]] = {}
    
    def save_version(
        self, 
        prompt_name: str, 
        prompt: str, 
        metadata: Dict = None
    ):
        """
        保存提示词版本
        
        Args:
            prompt_name: 提示词名称
            prompt: 提示词内容
            metadata: 元数据
        """
        if prompt_name not in self.versions:
            self.versions[prompt_name] = []
        
        version_num = len(self.versions[prompt_name]) + 1
        
        self.versions[prompt_name].append({
            "version": version_num,
            "prompt": prompt,
            "metadata": metadata or {},
            "timestamp": time.time()
        })
    
    def get_version(self, prompt_name: str, version: int = None) -> Dict:
        """
        获取提示词版本
        
        Args:
            prompt_name: 提示词名称
            version: 版本号（None表示最新版本）
            
        Returns:
            dict: 版本信息
        """
        if prompt_name not in self.versions:
            return None
        
        versions = self.versions[prompt_name]
        
        if version is None:
            return versions[-1]
        
        for v in versions:
            if v["version"] == version:
                return v
        
        return None
    
    def compare_versions(
        self, 
        prompt_name: str, 
        version1: int, 
        version2: int
    ) -> Dict:
        """
        比较两个版本
        
        Args:
            prompt_name: 提示词名称
            version1: 版本1
            version2: 版本2
            
        Returns:
            dict: 比较结果
        """
        v1 = self.get_version(prompt_name, version1)
        v2 = self.get_version(prompt_name, version2)
        
        if not v1 or not v2:
            return {"error": "版本不存在"}
        
        return {
            "version1": v1,
            "version2": v2,
            "diff": self._compute_diff(v1["prompt"], v2["prompt"])
        }
    
    def _compute_diff(self, text1: str, text2: str) -> List[Dict]:
        """
        计算文本差异
        
        Args:
            text1: 文本1
            text2: 文本2
            
        Returns:
            list: 差异列表
        """
        import difflib
        
        differ = difflib.Differ()
        diff = list(differ.compare(text1.splitlines(), text2.splitlines()))
        
        return [
            {"line": i + 1, "content": line}
            for i, line in enumerate(diff)
            if line.startswith('+') or line.startswith('-')
        ]
```

## LangChain 高级应用

### 自定义链

```python
from typing import Dict, List, Any, Callable
from abc import ABC, abstractmethod

class BaseChain(ABC):
    """
    链基类
    """
    @abstractmethod
    def run(self, inputs: Dict) -> Dict:
        """
        执行链
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 输出字典
        """
        pass

class SequentialChain(BaseChain):
    """
    顺序链
    按顺序执行多个步骤
    """
    def __init__(self, chains: List[BaseChain]):
        self.chains = chains
    
    def run(self, inputs: Dict) -> Dict:
        """
        顺序执行所有链
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 输出字典
        """
        current_input = inputs.copy()
        
        for chain in self.chains:
            current_input = chain.run(current_input)
        
        return current_input

class ParallelChain(BaseChain):
    """
    并行链
    并行执行多个步骤
    """
    def __init__(self, chains: Dict[str, BaseChain]):
        self.chains = chains
    
    def run(self, inputs: Dict) -> Dict:
        """
        并行执行所有链
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 输出字典
        """
        import concurrent.futures
        
        results = {}
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(chain.run, inputs): name
                for name, chain in self.chains.items()
            }
            
            for future in concurrent.futures.as_completed(futures):
                name = futures[future]
                results[name] = future.result()
        
        return results

class ConditionalChain(BaseChain):
    """
    条件链
    根据条件选择执行路径
    """
    def __init__(
        self, 
        condition_func: Callable[[Dict], bool],
        true_chain: BaseChain,
        false_chain: BaseChain
    ):
        self.condition_func = condition_func
        self.true_chain = true_chain
        self.false_chain = false_chain
    
    def run(self, inputs: Dict) -> Dict:
        """
        根据条件执行
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 输出字典
        """
        if self.condition_func(inputs):
            return self.true_chain.run(inputs)
        else:
            return self.false_chain.run(inputs)

class TransformChain(BaseChain):
    """
    转换链
    对输入进行转换
    """
    def __init__(self, transform_func: Callable[[Dict], Dict]):
        self.transform_func = transform_func
    
    def run(self, inputs: Dict) -> Dict:
        """
        执行转换
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 转换后的字典
        """
        return self.transform_func(inputs)

class LLMChain(BaseChain):
    """
    LLM链
    调用大语言模型
    """
    def __init__(self, llm_client, prompt_template: PromptTemplate, output_key: str = "output"):
        self.llm = llm_client
        self.prompt_template = prompt_template
        self.output_key = output_key
    
    def run(self, inputs: Dict) -> Dict:
        """
        执行LLM调用
        
        Args:
            inputs: 输入字典
            
        Returns:
            dict: 包含LLM输出的字典
        """
        prompt = self.prompt_template.format(**inputs)
        response = self.llm.generate(prompt)
        
        return {**inputs, self.output_key: response}

class TestGenerationChain:
    """
    测试用例生成链
    完整的测试用例生成流程
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self._build_chain()
    
    def _build_chain(self):
        """
        构建生成链
        """
        analyze_chain = LLMChain(
            self.llm,
            PromptTemplate(
                "分析以下需求，提取关键测试点：\n{requirement}",
                ["requirement"]
            ),
            "analysis"
        )
        
        generate_chain = LLMChain(
            self.llm,
            PromptTemplate(
                "基于以下分析生成测试用例：\n{analysis}",
                ["analysis"]
            ),
            "test_cases"
        )
        
        optimize_chain = LLMChain(
            self.llm,
            PromptTemplate(
                "优化以下测试用例：\n{test_cases}",
                ["test_cases"]
            ),
            "optimized_cases"
        )
        
        self.chain = SequentialChain([
            analyze_chain,
            generate_chain,
            optimize_chain
        ])
    
    def generate(self, requirement: str) -> Dict:
        """
        生成测试用例
        
        Args:
            requirement: 需求描述
            
        Returns:
            dict: 生成结果
        """
        return self.chain.run({"requirement": requirement})
```

### Agent 实现

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class AgentAction(Enum):
    """智能体动作类型"""
    THINK = "think"
    ACT = "act"
    OBSERVE = "observe"
    FINISH = "finish"

@dataclass
class AgentStep:
    """智能体步骤"""
    action: AgentAction
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[Dict] = None
    observation: Optional[str] = None

class BaseAgent(ABC):
    """
    智能体基类
    """
    def __init__(self, llm_client, tools: Dict[str, Any]):
        self.llm = llm_client
        self.tools = tools
        self.memory: List[AgentStep] = []
    
    @abstractmethod
    def plan(self, task: str) -> List[AgentStep]:
        """
        规划任务
        
        Args:
            task: 任务描述
            
        Returns:
            list: 步骤列表
        """
        pass
    
    @abstractmethod
    def execute(self, step: AgentStep) -> str:
        """
        执行步骤
        
        Args:
            step: 步骤对象
            
        Returns:
            str: 执行结果
        """
        pass
    
    def run(self, task: str, max_iterations: int = 10) -> Dict:
        """
        运行智能体
        
        Args:
            task: 任务描述
            max_iterations: 最大迭代次数
            
        Returns:
            dict: 运行结果
        """
        steps = self.plan(task)
        
        for i, step in enumerate(steps[:max_iterations]):
            result = self.execute(step)
            self.memory.append(step)
            
            if step.action == AgentAction.FINISH:
                return {
                    "status": "completed",
                    "result": result,
                    "steps": self.memory
                }
        
        return {
            "status": "max_iterations_reached",
            "steps": self.memory
        }

class ReActAgent(BaseAgent):
    """
    ReAct智能体
    推理-行动循环
    """
    def plan(self, task: str) -> List[AgentStep]:
        """
        规划任务
        
        Args:
            task: 任务描述
            
        Returns:
            list: 步骤列表
        """
        prompt = f"""
任务：{task}

可用工具：
{self._format_tools()}

请规划如何完成这个任务。使用以下格式：
Thought: 思考下一步
Action: 工具名
Action Input: {{"参数": "值"}}
"""
        
        response = self.llm.generate(prompt)
        return self._parse_response(response)
    
    def execute(self, step: AgentStep) -> str:
        """
        执行步骤
        
        Args:
            step: 步骤对象
            
        Returns:
            str: 执行结果
        """
        if step.action == AgentAction.ACT and step.tool_name:
            tool = self.tools.get(step.tool_name)
            if tool:
                return tool.execute(**step.tool_input)
        return step.content
    
    def _format_tools(self) -> str:
        """
        格式化工具描述
        
        Returns:
            str: 工具描述
        """
        return "\n".join([
            f"- {name}: {tool.description}"
            for name, tool in self.tools.items()
        ])
    
    def _parse_response(self, response: str) -> List[AgentStep]:
        """
        解析响应
        
        Args:
            response: 响应文本
            
        Returns:
            list: 步骤列表
        """
        steps = []
        lines = response.split("\n")
        
        for line in lines:
            if line.startswith("Thought:"):
                steps.append(AgentStep(
                    action=AgentAction.THINK,
                    content=line.replace("Thought:", "").strip()
                ))
            elif line.startswith("Action:"):
                action_name = line.replace("Action:", "").strip()
                steps.append(AgentStep(
                    action=AgentAction.ACT,
                    content=action_name,
                    tool_name=action_name
                ))
        
        return steps

class PlanAndExecuteAgent(BaseAgent):
    """
    规划执行智能体
    先规划后执行
    """
    def __init__(self, llm_client, tools: Dict[str, Any]):
        super().__init__(llm_client, tools)
        self.plan_steps: List[str] = []
    
    def plan(self, task: str) -> List[AgentStep]:
        """
        规划任务
        
        Args:
            task: 任务描述
            
        Returns:
            list: 步骤列表
        """
        prompt = f"""
任务：{task}

请将任务分解为具体的执行步骤，每行一个步骤。
"""
        
        response = self.llm.generate(prompt)
        self.plan_steps = [
            line.strip() for line in response.split("\n")
            if line.strip()
        ]
        
        return [
            AgentStep(action=AgentAction.ACT, content=step)
            for step in self.plan_steps
        ]
    
    def execute(self, step: AgentStep) -> str:
        """
        执行步骤
        
        Args:
            step: 步骤对象
            
        Returns:
            str: 执行结果
        """
        prompt = f"""
执行以下步骤：
{step.content}

可用工具：
{self._format_tools()}

请选择合适的工具执行，并返回结果。
"""
        
        return self.llm.generate(prompt)
    
    def _format_tools(self) -> str:
        """
        格式化工具描述
        
        Returns:
            str: 工具描述
        """
        return "\n".join([
            f"- {name}: {tool.description}"
            for name, tool in self.tools.items()
        ])
```

## 最佳实践

### 1. 提示词设计原则

| 原则 | 说明 | 示例 |
|-----|------|------|
| 清晰性 | 表达明确，避免歧义 | "生成5个测试用例" |
| 结构化 | 使用结构化格式 | 使用JSON、Markdown |
| 示例引导 | 提供示例 | Few-shot learning |
| 约束条件 | 明确限制 | "不超过100字" |

### 2. 成本优化策略

- 使用缓存减少重复调用
- 选择合适的模型大小
- 批量处理请求
- 实施降级策略

### 3. 质量保障

- 输出验证机制
- 人工审核流程
- A/B测试对比
- 持续监控优化

## 🎯 应用场景

### 测试用例生成

使用Prompt工程技术自动生成高质量的测试用例，提升测试覆盖率。

```python
class TestCasePromptEngineer:
    """
    测试用例提示词工程师
    使用高级提示词技术生成测试用例
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self.cot_prompt = ChainOfThoughtPrompt(
            "根据以下需求生成测试用例：\n{requirement}",
            ["requirement"]
        )
    
    def generate_test_cases(
        self,
        requirement: str,
        test_types: List[str] = None
    ) -> List[Dict]:
        """
        生成测试用例
        
        Args:
            requirement: 需求描述
            test_types: 测试类型列表
            
        Returns:
            list: 测试用例列表
        """
        if test_types is None:
            test_types = ["功能测试", "边界测试", "异常测试", "性能测试"]
        
        prompt = self.cot_prompt.format(requirement=requirement)
        prompt += f"\n\n请生成以下类型的测试用例：{', '.join(test_types)}"
        
        response = self.llm.generate(prompt)
        return self._parse_test_cases(response)
    
    def _parse_test_cases(self, response: str) -> List[Dict]:
        """
        解析测试用例
        
        Args:
            response: LLM响应
            
        Returns:
            list: 测试用例列表
        """
        import json
        try:
            return json.loads(response)
        except:
            return []
```

### 智能代码审查

使用Few-shot提示词技术进行代码审查，识别潜在问题。

```python
class CodeReviewPromptEngineer:
    """
    代码审查提示词工程师
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self.examples = [
            {
                "code": "def add(a, b): return a + b",
                "review": "代码简洁，但缺少类型提示和文档字符串"
            },
            {
                "code": "if x = 1: pass",
                "review": "语法错误：应使用 == 进行比较"
            }
        ]
    
    def review_code(self, code: str) -> str:
        """
        审查代码
        
        Args:
            code: 待审查代码
            
        Returns:
            str: 审查结果
        """
        few_shot_prompt = FewShotPromptTemplate(
            template="请审查以下代码：\n{code}",
            input_variables=["code"],
            examples=self.examples,
            example_prompt=PromptTemplate(
                "代码：{code}\n审查：{review}",
                ["code", "review"]
            ),
            prefix="你是一位经验丰富的代码审查专家。",
            suffix="请提供详细的审查意见。"
        )
        
        prompt = few_shot_prompt.format(code=code)
        return self.llm.generate(prompt)
```

### 缺陷分析诊断

使用思维树技术分析测试失败原因，提供修复建议。

```python
class DefectAnalysisPromptEngineer:
    """
    缺陷分析提示词工程师
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self.tot_prompt = TreeOfThoughtPrompt(
            llm_client,
            max_depth=3,
            branching_factor=3
        )
    
    def analyze_defect(
        self,
        failure_info: Dict,
        context: Dict = None
    ) -> Dict:
        """
        分析缺陷
        
        Args:
            failure_info: 失败信息
            context: 上下文信息
            
        Returns:
            dict: 分析结果
        """
        problem = f"""
测试失败分析：
- 失败用例：{failure_info.get('test_case')}
- 错误信息：{failure_info.get('error_message')}
- 堆栈跟踪：{failure_info.get('stack_trace')}
- 环境信息：{context or '无'}

请分析可能的根本原因。
"""
        
        result = self.tot_prompt.explore_thought_tree(problem)
        
        return {
            "root_cause": result.get("solution"),
            "analysis_tree": result.get("tree"),
            "best_path": result.get("best_path")
        }
```

### 测试报告生成

使用结构化输出技术生成标准化测试报告。

```python
class TestReportPromptEngineer:
    """
    测试报告提示词工程师
    """
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def generate_report(
        self,
        test_results: Dict,
        format: str = "markdown"
    ) -> str:
        """
        生成测试报告
        
        Args:
            test_results: 测试结果
            format: 报告格式
            
        Returns:
            str: 测试报告
        """
        prompt = f"""
请根据以下测试结果生成测试报告：

测试统计：
- 总用例数：{test_results.get('total', 0)}
- 通过数：{test_results.get('passed', 0)}
- 失败数：{test_results.get('failed', 0)}
- 跳过数：{test_results.get('skipped', 0)}

失败详情：
{self._format_failures(test_results.get('failures', []))}

请生成包含以下内容的报告：
1. 执行摘要
2. 测试统计
3. 失败分析
4. 风险评估
5. 改进建议

输出{format}格式。
"""
        
        return self.llm.generate(prompt)
    
    def _format_failures(self, failures: List[Dict]) -> str:
        """
        格式化失败信息
        
        Args:
            failures: 失败列表
            
        Returns:
            str: 格式化后的字符串
        """
        import json
        return json.dumps(failures, ensure_ascii=False, indent=2)
```

## 📚 学习资源

### 官方文档与指南

| 资源 | 描述 | 链接 |
|-----|------|------|
| **OpenAI Prompt Engineering Guide** | OpenAI官方提示词工程指南 | [platform.openai.com](https://platform.openai.com/docs/guides/prompt-engineering) |
| **Anthropic Prompt Library** | Claude提示词库和最佳实践 | [docs.anthropic.com](https://docs.anthropic.com/claude/prompt-library) |
| **Google Prompt Engineering** | Google提示词工程白皮书 | [ai.google](https://ai.google/responsible-ai/prompt-engineering/) |

### 经典论文

| 论文 | 描述 | 链接 |
|-----|------|------|
| **Chain-of-Thought Prompting** | 思维链提示词技术 | [arxiv.org](https://arxiv.org/abs/2201.11903) |
| **ReAct: Synergizing Reasoning and Acting** | ReAct框架原论文 | [arxiv.org](https://arxiv.org/abs/2210.03629) |
| **Tree of Thoughts** | 思维树技术论文 | [arxiv.org](https://arxiv.org/abs/2305.10601) |
| **Self-Consistency** | 自一致性技术论文 | [arxiv.org](https://arxiv.org/abs/2203.11171) |

### 在线课程与教程

| 课程 | 平台 | 描述 |
|-----|------|------|
| **Prompt Engineering for Developers** | DeepLearning.AI | Andrew Ng主讲的提示词工程课程 |
| **Learn Prompting** | learmprompting.org | 免费开源的提示词工程教程 |
| **Prompt Engineering Guide** | promptingguide.ai | 最全面的提示词工程指南 |

### 开源工具与框架

| 工具 | 描述 | 链接 |
|-----|------|------|
| **Promptfoo** | 提示词测试和评估工具 | [github.com/promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) |
| **LangSmith** | LangChain提示词管理平台 | [smith.langchain.com](https://smith.langchain.com) |
| **Weights & Biases Prompts** | 提示词版本管理和追踪 | [wandb.ai](https://wandb.ai/site/prompts) |

### 社区资源

| 社区 | 描述 | 链接 |
|-----|------|------|
| **r/PromptEngineering** | Reddit提示词工程社区 | [reddit.com/r/PromptEngineering](https://www.reddit.com/r/PromptEngineering/) |
| **Prompt Engineering Discord** | Discord提示词工程讨论组 | [discord.gg/promptengineering](https://discord.gg/promptengineering) |
| **Awesome ChatGPT Prompts** | 精选提示词集合 | [github.com/f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) |

## 🔗 相关资源

- [LangChain应用](/ai-testing-tech/llm-tech/langchain/) - 框架深度应用
- [模型部署](/ai-testing-tech/llm-tech/model-deployment/) - 部署方案详解
- [模型微调](/ai-testing-tech/llm-tech/model-finetuning/) - 微调技术实践
- [VLM视觉测试](/ai-testing-tech/vlm-tech/visual-testing/) - 多模态模型应用
- [测试脚本自愈](/ai-testing-tech/self-healing/) - 自动修复测试脚本
