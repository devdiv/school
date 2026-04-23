# LLM/VLM 工程化落地与自愈体系

大模型与多模态模型在测试领域的工程化实践，构建智能化测试核心能力。

## 概述

LLM（大语言模型）和 VLM（视觉语言模型）正在重塑软件测试的方式。通过工程化落地，我们可以将 AI 能力深度集成到测试流程中，实现测试用例自动生成、智能诊断、脚本自愈等核心能力。

### 核心价值

- **效率提升**：测试用例生成效率提升 70%+
- **维护成本降低**：自愈能力减少 50%+ 的脚本维护工作
- **覆盖率提升**：AI 探索发现人工难以覆盖的边界场景
- **智能化诊断**：根因分析准确率达 85%+

### 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层                                │
│  用例生成 │ 执行增强 │ 结果分析 │ 脚本自愈 │ 智能诊断   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    能力层                                │
│  LLM服务 │ VLM服务 │ RAG检索 │ Prompt管理 │ 工具调用    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    基础设施层                            │
│  模型部署 │ 向量数据库 │ 知识图谱 │ 监控告警            │
└─────────────────────────────────────────────────────────┘
```

## 大模型应用架构

构建企业级大模型应用架构，实现测试场景的智能化升级。

### Prompt Engineering 最佳实践

提示词工程是发挥大模型能力的关键技术。

#### ReAct 框架实现

```python
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import json

class ActionType(Enum):
    """动作类型枚举"""
    THINK = "think"
    ACT = "act"
    OBSERVE = "observe"

@dataclass
class ReActStep:
    """
    ReAct步骤类
    表示ReAct推理过程中的一个步骤
    """
    step_type: ActionType
    content: str
    tool_name: str = None
    tool_input: Dict = None
    observation: str = None

class ReActAgent:
    """
    ReAct智能体
    实现推理(Reasoning)与行动(Acting)结合的框架
    """
    def __init__(self, llm_client, tools: Dict[str, Any]):
        """
        初始化ReAct智能体
        
        Args:
            llm_client: LLM客户端
            tools: 工具字典 {工具名: 工具实例}
        """
        self.llm = llm_client
        self.tools = tools
        self.max_iterations = 10
    
    def run(self, task: str) -> Dict:
        """
        执行任务
        
        Args:
            task: 任务描述
            
        Returns:
            dict: 执行结果
        """
        steps = []
        iteration = 0
        
        while iteration < self.max_iterations:
            # 思考阶段
            thought = self._think(task, steps)
            steps.append(ReActStep(
                step_type=ActionType.THINK,
                content=thought
            ))
            
            # 判断是否需要行动
            if "任务完成" in thought or "Final Answer:" in thought:
                return self._extract_final_answer(thought, steps)
            
            # 行动阶段
            action = self._decide_action(thought)
            if action:
                steps.append(ReActStep(
                    step_type=ActionType.ACT,
                    content=action["action"],
                    tool_name=action["tool"],
                    tool_input=action["input"]
                ))
                
                # 观察阶段
                observation = self._execute_tool(action["tool"], action["input"])
                steps.append(ReActStep(
                    step_type=ActionType.OBSERVE,
                    content=observation,
                    observation=observation
                ))
            
            iteration += 1
        
        return {
            "status": "max_iterations_reached",
            "steps": steps
        }
    
    def _think(self, task: str, history: List[ReActStep]) -> str:
        """
        思考阶段
        
        Args:
            task: 任务描述
            history: 历史步骤
            
        Returns:
            str: 思考结果
        """
        prompt = self._build_think_prompt(task, history)
        return self.llm.generate(prompt)
    
    def _build_think_prompt(self, task: str, history: List[ReActStep]) -> str:
        """
        构建思考提示词
        
        Args:
            task: 任务描述
            history: 历史步骤
            
        Returns:
            str: 提示词
        """
        history_str = "\n".join([
            f"{step.step_type.value}: {step.content}"
            for step in history
        ])
        
        return f"""
任务: {task}

可用工具:
{self._format_tools()}

历史步骤:
{history_str}

请思考下一步应该做什么。如果任务已完成，请以"Final Answer:"开头给出最终答案。
如果需要使用工具，请以"Action:"开头，格式为：
Action: 工具名
Action Input: {{"参数名": "参数值"}}
"""
    
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
    
    def _decide_action(self, thought: str) -> Dict:
        """
        决定行动
        
        Args:
            thought: 思考结果
            
        Returns:
            dict: 行动决策
        """
        if "Action:" not in thought:
            return None
        
        lines = thought.split("\n")
        action_line = next((l for l in lines if "Action:" in l), None)
        input_line = next((l for l in lines if "Action Input:" in l), None)
        
        if not action_line:
            return None
        
        tool_name = action_line.split("Action:")[1].strip()
        tool_input = {}
        
        if input_line:
            input_str = input_line.split("Action Input:")[1].strip()
            try:
                tool_input = json.loads(input_str)
            except:
                pass
        
        return {
            "tool": tool_name,
            "action": action_line,
            "input": tool_input
        }
    
    def _execute_tool(self, tool_name: str, tool_input: Dict) -> str:
        """
        执行工具
        
        Args:
            tool_name: 工具名
            tool_input: 工具输入
            
        Returns:
            str: 执行结果
        """
        if tool_name not in self.tools:
            return f"错误: 工具 {tool_name} 不存在"
        
        tool = self.tools[tool_name]
        try:
            result = tool.execute(**tool_input)
            return json.dumps(result, ensure_ascii=False)
        except Exception as e:
            return f"错误: {str(e)}"
    
    def _extract_final_answer(self, thought: str, steps: List[ReActStep]) -> Dict:
        """
        提取最终答案
        
        Args:
            thought: 思考结果
            steps: 所有步骤
            
        Returns:
            dict: 最终结果
        """
        if "Final Answer:" in thought:
            answer = thought.split("Final Answer:")[1].strip()
        else:
            answer = thought
        
        return {
            "status": "completed",
            "answer": answer,
            "steps": steps
        }
```

#### 结构化约束输出

```python
from typing import Dict, Any, Type
from pydantic import BaseModel
import json

class StructuredOutputParser:
    """
    结构化输出解析器
    确保LLM输出符合预定义的格式
    """
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def generate_with_schema(
        self, 
        prompt: str, 
        schema: Type[BaseModel]
    ) -> BaseModel:
        """
        生成结构化输出
        
        Args:
            prompt: 提示词
            schema: Pydantic模型类
            
        Returns:
            BaseModel: 结构化输出对象
        """
        schema_str = schema.model_json_schema()
        
        full_prompt = f"""
{prompt}

请严格按照以下JSON Schema格式输出：
{json.dumps(schema_str, indent=2, ensure_ascii=False)}

只输出JSON，不要包含其他内容。
"""
        
        response = self.llm.generate(full_prompt)
        
        try:
            data = json.loads(response)
            return schema(**data)
        except Exception as e:
            return self._repair_and_parse(response, schema, str(e))
    
    def _repair_and_parse(
        self, 
        response: str, 
        schema: Type[BaseModel],
        error: str
    ) -> BaseModel:
        """
        修复并解析输出
        
        Args:
            response: 原始响应
            schema: 目标Schema
            error: 错误信息
            
        Returns:
            BaseModel: 结构化对象
        """
        repair_prompt = f"""
原始输出：
{response}

解析错误：{error}

请修复JSON格式，使其符合以下Schema：
{json.dumps(schema.model_json_schema(), indent=2, ensure_ascii=False)}

只输出修复后的JSON。
"""
        
        repaired = self.llm.generate(repair_prompt)
        data = json.loads(repaired)
        return schema(**data)

class TestCaseSchema(BaseModel):
    """测试用例Schema"""
    name: str
    description: str
    steps: list
    expected: str
    priority: str

class TestGenerator:
    """
    测试用例生成器
    使用结构化输出确保生成质量
    """
    def __init__(self, llm_client):
        self.parser = StructuredOutputParser(llm_client)
    
    def generate_test_case(self, requirement: str) -> TestCaseSchema:
        """
        生成测试用例
        
        Args:
            requirement: 需求描述
            
        Returns:
            TestCaseSchema: 测试用例对象
        """
        prompt = f"""
基于以下需求生成一个测试用例：

{requirement}

生成一个完整的测试用例，包含名称、描述、步骤、预期结果和优先级。
"""
        
        return self.parser.generate_with_schema(prompt, TestCaseSchema)
```

#### 思维链推理

```python
from typing import List, Dict

class ChainOfThought:
    """
    思维链推理
    通过分步推理解决复杂问题
    """
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def reason(self, problem: str) -> Dict:
        """
        执行思维链推理
        
        Args:
            problem: 问题描述
            
        Returns:
            dict: 推理结果
        """
        prompt = f"""
问题：{problem}

请一步步思考这个问题：

1. 首先，理解问题的核心是什么
2. 然后，分析问题的关键要素
3. 接着，考虑可能的解决方案
4. 最后，给出最优答案

请详细展示你的思考过程。
"""
        
        response = self.llm.generate(prompt)
        
        return {
            "problem": problem,
            "reasoning": response,
            "steps": self._extract_steps(response)
        }
    
    def _extract_steps(self, reasoning: str) -> List[str]:
        """
        提取推理步骤
        
        Args:
            reasoning: 推理过程
            
        Returns:
            list: 步骤列表
        """
        steps = []
        lines = reasoning.split("\n")
        
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith("-")):
                steps.append(line)
        
        return steps

class FewShotLearner:
    """
    Few-shot学习
    通过示例引导优化模型输出
    """
    def __init__(self, llm_client):
        self.llm = llm_client
        self.examples = []
    
    def add_example(self, input_text: str, output_text: str):
        """
        添加示例
        
        Args:
            input_text: 输入示例
            output_text: 输出示例
        """
        self.examples.append({
            "input": input_text,
            "output": output_text
        })
    
    def generate(self, prompt: str, num_examples: int = 3) -> str:
        """
        使用Few-shot生成
        
        Args:
            prompt: 提示词
            num_examples: 使用的示例数量
            
        Returns:
            str: 生成结果
        """
        examples_text = ""
        
        for i, example in enumerate(self.examples[:num_examples]):
            examples_text += f"""
示例 {i+1}:
输入: {example['input']}
输出: {example['output']}

"""
        
        full_prompt = f"""
{examples_text}
现在请处理以下输入：
输入: {prompt}
输出:
"""
        
        return self.llm.generate(full_prompt)
```

### LangChain/LangGraph 应用

测试流程编排与工具调用框架。

#### LangChain 测试流程编排

```python
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from langchain.llms import BaseLLM
from typing import Dict, List

class TestGenerationChain:
    """
    测试生成链
    使用LangChain编排测试生成流程
    """
    def __init__(self, llm: BaseLLM):
        self.llm = llm
        self._build_chains()
    
    def _build_chains(self):
        """
        构建处理链
        """
        # 需求分析链
        analyze_template = PromptTemplate(
            input_variables=["requirement"],
            template="""
分析以下测试需求，提取关键测试点：

需求：{requirement}

请列出：
1. 功能点
2. 边界条件
3. 异常场景
4. 性能要求
"""
        )
        self.analyze_chain = LLMChain(
            llm=self.llm,
            prompt=analyze_template,
            output_key="analysis"
        )
        
        # 用例生成链
        generate_template = PromptTemplate(
            input_variables=["analysis"],
            template="""
基于以下分析结果生成测试用例：

{analysis}

请生成详细的测试用例，包含步骤和预期结果。
"""
        )
        self.generate_chain = LLMChain(
            llm=self.llm,
            prompt=generate_template,
            output_key="test_cases"
        )
        
        # 用例优化链
        optimize_template = PromptTemplate(
            input_variables=["test_cases"],
            template="""
优化以下测试用例，去除重复，补充遗漏：

{test_cases}

输出优化后的测试用例列表。
"""
        )
        self.optimize_chain = LLMChain(
            llm=self.llm,
            prompt=optimize_template,
            output_key="optimized_cases"
        )
        
        # 组合为顺序链
        self.overall_chain = SequentialChain(
            chains=[self.analyze_chain, self.generate_chain, self.optimize_chain],
            input_variables=["requirement"],
            output_variables=["analysis", "test_cases", "optimized_cases"],
            verbose=True
        )
    
    def generate(self, requirement: str) -> Dict:
        """
        执行测试生成流程
        
        Args:
            requirement: 需求描述
            
        Returns:
            dict: 生成结果
        """
        return self.overall_chain({"requirement": requirement})

from langgraph.graph import StateGraph, END
from typing import TypedDict

class TestState(TypedDict):
    """测试状态"""
    requirement: str
    analysis: str
    test_cases: List[Dict]
    review_result: Dict
    final_cases: List[Dict]

class TestWorkflowGraph:
    """
    测试工作流图
    使用LangGraph构建复杂测试流程
    """
    def __init__(self, llm: BaseLLM):
        self.llm = llm
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """
        构建工作流图
        
        Returns:
            StateGraph: 状态图
        """
        workflow = StateGraph(TestState)
        
        # 添加节点
        workflow.add_node("analyze", self._analyze_node)
        workflow.add_node("generate", self._generate_node)
        workflow.add_node("review", self._review_node)
        workflow.add_node("refine", self._refine_node)
        
        # 添加边
        workflow.add_edge("analyze", "generate")
        workflow.add_edge("generate", "review")
        
        # 添加条件边
        workflow.add_conditional_edges(
            "review",
            self._should_refine,
            {
                "refine": "refine",
                "end": END
            }
        )
        workflow.add_edge("refine", "review")
        
        # 设置入口
        workflow.set_entry_point("analyze")
        
        return workflow.compile()
    
    def _analyze_node(self, state: TestState) -> TestState:
        """
        分析节点
        
        Args:
            state: 当前状态
            
        Returns:
            TestState: 更新后的状态
        """
        prompt = f"分析需求：{state['requirement']}"
        state["analysis"] = self.llm(prompt)
        return state
    
    def _generate_node(self, state: TestState) -> TestState:
        """
        生成节点
        
        Args:
            state: 当前状态
            
        Returns:
            TestState: 更新后的状态
        """
        prompt = f"基于分析生成测试用例：{state['analysis']}"
        state["test_cases"] = self._parse_cases(self.llm(prompt))
        return state
    
    def _review_node(self, state: TestState) -> TestState:
        """
        审查节点
        
        Args:
            state: 当前状态
            
        Returns:
            TestState: 更新后的状态
        """
        state["review_result"] = {
            "passed": len(state["test_cases"]) >= 3,
            "issues": [] if len(state["test_cases"]) >= 3 else ["用例数量不足"]
        }
        return state
    
    def _refine_node(self, state: TestState) -> TestState:
        """
        优化节点
        
        Args:
            state: 当前状态
            
        Returns:
            TestState: 更新后的状态
        """
        prompt = f"补充测试用例，当前用例数：{len(state['test_cases'])}"
        new_cases = self._parse_cases(self.llm(prompt))
        state["test_cases"].extend(new_cases)
        return state
    
    def _should_refine(self, state: TestState) -> str:
        """
        判断是否需要优化
        
        Args:
            state: 当前状态
            
        Returns:
            str: 下一个节点名
        """
        return "refine" if not state["review_result"]["passed"] else "end"
    
    def _parse_cases(self, text: str) -> List[Dict]:
        """
        解析测试用例
        
        Args:
            text: 文本内容
            
        Returns:
            list: 用例列表
        """
        return [{"name": f"用例{i+1}", "content": line}
                for i, line in enumerate(text.split("\n")) if line.strip()]
    
    def run(self, requirement: str) -> TestState:
        """
        运行工作流
        
        Args:
            requirement: 需求描述
            
        Returns:
            TestState: 最终状态
        """
        initial_state = {
            "requirement": requirement,
            "analysis": "",
            "test_cases": [],
            "review_result": {},
            "final_cases": []
        }
        return self.graph.invoke(initial_state)
```

#### 工具调用集成

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, Type

class BrowserToolInput(BaseModel):
    """浏览器工具输入"""
    url: str = Field(description="要访问的URL")
    action: str = Field(description="要执行的动作：visit, click, input, screenshot")

class BrowserTool(BaseTool):
    """
    浏览器工具
    用于Web UI测试
    """
    name = "browser"
    description = "用于浏览器操作，如访问页面、点击元素、输入文本等"
    args_schema: Type[BaseModel] = BrowserToolInput
    
    def _run(self, url: str, action: str) -> str:
        """
        执行浏览器操作
        
        Args:
            url: URL或选择器
            action: 动作类型
            
        Returns:
            str: 执行结果
        """
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            if action == "visit":
                page.goto(url)
                return f"已访问: {url}"
            elif action == "screenshot":
                screenshot = page.screenshot()
                return f"截图成功，大小: {len(screenshot)} bytes"
            
            browser.close()
        
        return "操作完成"

class APIToolInput(BaseModel):
    """API工具输入"""
    endpoint: str = Field(description="API端点")
    method: str = Field(description="HTTP方法")
    data: Optional[dict] = Field(description="请求数据")

class APITool(BaseTool):
    """
    API测试工具
    用于接口测试
    """
    name = "api_test"
    description = "用于API接口测试，支持GET、POST等方法"
    args_schema: Type[BaseModel] = APIToolInput
    
    def _run(self, endpoint: str, method: str, data: dict = None) -> str:
        """
        执行API测试
        
        Args:
            endpoint: API端点
            method: HTTP方法
            data: 请求数据
            
        Returns:
            str: 测试结果
        """
        import requests
        
        try:
            if method.upper() == "GET":
                response = requests.get(endpoint)
            elif method.upper() == "POST":
                response = requests.post(endpoint, json=data)
            else:
                return f"不支持的方法: {method}"
            
            return f"状态码: {response.status_code}, 响应: {response.text[:200]}"
        except Exception as e:
            return f"请求失败: {str(e)}"

from langchain.agents import AgentExecutor, create_react_agent

class TestAgent:
    """
    测试智能体
    集成多种工具完成测试任务
    """
    def __init__(self, llm: BaseLLM):
        self.llm = llm
        self.tools = [
            BrowserTool(),
            APITool()
        ]
        self.agent = self._create_agent()
    
    def _create_agent(self) -> AgentExecutor:
        """
        创建智能体
        
        Returns:
            AgentExecutor: 智能体执行器
        """
        from langchain import hub
        
        prompt = hub.pull("hwchase17/react")
        agent = create_react_agent(self.llm, self.tools, prompt)
        
        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=10
        )
    
    def execute(self, task: str) -> Dict:
        """
        执行测试任务
        
        Args:
            task: 任务描述
            
        Returns:
            dict: 执行结果
        """
        return self.agent.invoke({"input": task})
```

### RAG 检索增强生成

检索增强生成，提升模型专业能力。

#### 向量数据库集成

```python
from typing import List, Dict
import numpy as np
from dataclasses import dataclass

@dataclass
class Document:
    """文档类"""
    doc_id: str
    content: str
    embedding: List[float]
    metadata: Dict

class VectorStore:
    """
    向量存储
    存储和检索文档向量
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension
        self.documents: Dict[str, Document] = {}
    
    def add_document(self, doc_id: str, content: str, embedding: List[float], metadata: Dict = None):
        """
        添加文档
        
        Args:
            doc_id: 文档ID
            content: 文档内容
            embedding: 向量嵌入
            metadata: 元数据
        """
        self.documents[doc_id] = Document(
            doc_id=doc_id,
            content=content,
            embedding=embedding,
            metadata=metadata or {}
        )
    
    def similarity_search(self, query_embedding: List[float], k: int = 5) -> List[Document]:
        """
        相似度搜索
        
        Args:
            query_embedding: 查询向量
            k: 返回数量
            
        Returns:
            list: 相似文档列表
        """
        if not self.documents:
            return []
        
        similarities = []
        query_vec = np.array(query_embedding)
        
        for doc_id, doc in self.documents.items():
            doc_vec = np.array(doc.embedding)
            similarity = np.dot(query_vec, doc_vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(doc_vec)
            )
            similarities.append((doc_id, similarity))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [self.documents[doc_id] for doc_id, _ in similarities[:k]]

class RAGSystem:
    """
    RAG检索增强生成系统
    """
    def __init__(self, llm_client, embedding_model):
        self.llm = llm_client
        self.embedding = embedding_model
        self.vector_store = VectorStore()
    
    def index_documents(self, documents: List[Dict]):
        """
        索引文档
        
        Args:
            documents: 文档列表
        """
        for doc in documents:
            embedding = self.embedding.embed(doc["content"])
            self.vector_store.add_document(
                doc_id=doc["id"],
                content=doc["content"],
                embedding=embedding,
                metadata=doc.get("metadata", {})
            )
    
    def query(self, question: str, k: int = 3) -> Dict:
        """
        查询并生成回答
        
        Args:
            question: 问题
            k: 检索文档数
            
        Returns:
            dict: 回答结果
        """
        # 生成查询向量
        query_embedding = self.embedding.embed(question)
        
        # 检索相关文档
        relevant_docs = self.vector_store.similarity_search(query_embedding, k)
        
        # 构建上下文
        context = "\n\n".join([doc.content for doc in relevant_docs])
        
        # 生成回答
        prompt = f"""
基于以下上下文回答问题：

上下文：
{context}

问题：{question}

请给出详细、准确的回答。
"""
        
        answer = self.llm.generate(prompt)
        
        return {
            "question": question,
            "answer": answer,
            "sources": [
                {"doc_id": doc.doc_id, "content": doc.content[:100]}
                for doc in relevant_docs
            ]
        }

class TestKnowledgeBase:
    """
    测试知识库
    存储测试相关的知识
    """
    def __init__(self, rag_system: RAGSystem):
        self.rag = rag_system
    
    def add_test_case(self, test_case: Dict):
        """
        添加测试用例到知识库
        
        Args:
            test_case: 测试用例
        """
        doc = {
            "id": test_case["id"],
            "content": f"""
测试用例：{test_case['name']}
描述：{test_case['description']}
步骤：{test_case['steps']}
预期结果：{test_case['expected']}
标签：{test_case.get('tags', [])}
""",
            "metadata": {
                "type": "test_case",
                "tags": test_case.get("tags", [])
            }
        }
        self.rag.index_documents([doc])
    
    def add_defect(self, defect: Dict):
        """
        添加缺陷到知识库
        
        Args:
            defect: 缺陷信息
        """
        doc = {
            "id": defect["id"],
            "content": f"""
缺陷：{defect['title']}
描述：{defect['description']}
根因：{defect.get('root_cause', '未知')}
解决方案：{defect.get('solution', '未知')}
""",
            "metadata": {
                "type": "defect",
                "severity": defect.get("severity", "medium")
            }
        }
        self.rag.index_documents([doc])
    
    def search_similar_cases(self, description: str) -> List[Dict]:
        """
        搜索相似测试用例
        
        Args:
            description: 描述
            
        Returns:
            list: 相似用例列表
        """
        query_embedding = self.rag.embedding.embed(description)
        docs = self.rag.vector_store.similarity_search(query_embedding, k=5)
        
        return [
            {"id": doc.doc_id, "content": doc.content}
            for doc in docs
            if doc.metadata.get("type") == "test_case"
        ]
```

### 模型部署选型

模型部署方案评估与选择。

```python
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ModelConfig:
    """模型配置"""
    model_name: str
    model_type: str
    parameters: int
    context_length: int
    deployment_type: str
    cost_per_token: float

class ModelSelector:
    """
    模型选择器
    根据需求选择最优模型
    """
    def __init__(self):
        self.models = self._init_models()
    
    def _init_models(self) -> Dict[str, ModelConfig]:
        """
        初始化模型列表
        
        Returns:
            dict: 模型配置字典
        """
        return {
            "gpt-4": ModelConfig(
                model_name="gpt-4",
                model_type="commercial",
                parameters=175_000_000_000,
                context_length=8192,
                deployment_type="api",
                cost_per_token=0.03
            ),
            "gpt-3.5-turbo": ModelConfig(
                model_name="gpt-3.5-turbo",
                model_type="commercial",
                parameters=175_000_000_000,
                context_length=4096,
                deployment_type="api",
                cost_per_token=0.002
            ),
            "claude-3": ModelConfig(
                model_name="claude-3",
                model_type="commercial",
                parameters=200_000_000_000,
                context_length=100000,
                deployment_type="api",
                cost_per_token=0.015
            ),
            "llama-2-70b": ModelConfig(
                model_name="llama-2-70b",
                model_type="open_source",
                parameters=70_000_000_000,
                context_length=4096,
                deployment_type="local",
                cost_per_token=0.0
            )
        }
    
    def select_model(self, requirements: Dict) -> ModelConfig:
        """
        选择最优模型
        
        Args:
            requirements: 需求字典
            
        Returns:
            ModelConfig: 推荐的模型配置
        """
        candidates = []
        
        for name, config in self.models.items():
            score = self._calculate_score(config, requirements)
            candidates.append((name, score, config))
        
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        return candidates[0][2]
    
    def _calculate_score(self, config: ModelConfig, requirements: Dict) -> float:
        """
        计算模型得分
        
        Args:
            config: 模型配置
            requirements: 需求
            
        Returns:
            float: 得分
        """
        score = 0.0
        
        # 能力得分
        if requirements.get("need_high_accuracy"):
            score += config.parameters / 1e11
        
        # 成本得分
        if requirements.get("cost_sensitive"):
            score += 1 / (config.cost_per_token + 0.001)
        
        # 隐私得分
        if requirements.get("privacy_required"):
            if config.deployment_type == "local":
                score += 10
        
        # 上下文长度得分
        if requirements.get("long_context"):
            score += config.context_length / 10000
        
        return score

class ModelDeployer:
    """
    模型部署器
    部署和管理模型
    """
    def deploy_local_model(self, model_name: str, config: Dict):
        """
        部署本地模型
        
        Args:
            model_name: 模型名
            config: 部署配置
        """
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype="auto",
            device_map="auto"
        )
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        return {
            "model": model,
            "tokenizer": tokenizer,
            "status": "deployed"
        }
    
    def setup_lora_finetuning(self, model, lora_config: Dict):
        """
        配置LoRA微调
        
        Args:
            model: 基础模型
            lora_config: LoRA配置
        """
        from peft import LoraConfig, get_peft_model
        
        config = LoraConfig(
            r=lora_config.get("r", 8),
            lora_alpha=lora_config.get("alpha", 32),
            target_modules=lora_config.get("target_modules", ["q_proj", "v_proj"]),
            lora_dropout=lora_config.get("dropout", 0.1),
            bias="none",
            task_type="CAUSAL_LM"
        )
        
        return get_peft_model(model, config)
```

## 相关资源

- [多模态模型(VLM)的UI测试应用](/llm-vlm/vlm/) - UI截图语义理解、非标控件定位
- [测试脚本自愈体系](/llm-vlm/self-healing/) - 元素定位失效检测、备选定位策略

## 核心技术学习资源

### LLM 核心技术

#### Transformer 架构
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) - Transformer 可视化详解
- [Attention Is All You Need 论文](https://arxiv.org/abs/1706.03762) - 原始论文
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) - 带注释的 Transformer 实现
- [Transformer from Scratch](https://peterbloem.nl/blog/transformers) - 从零实现 Transformer

#### 大模型架构
- [GPT 系列论文解读](https://jalammar.github.io/illustrated-gpt2/) - GPT 架构详解
- [LLaMA 论文](https://arxiv.org/abs/2302.13971) - Meta 开源模型
- [Mistral 论文](https://arxiv.org/abs/2310.06825) - 高效开源模型
- [Mixture of Experts 详解](https://arxiv.org/abs/2401.04088) - MoE 架构

### VLM 多模态模型

#### 核心模型
- [CLIP 论文](https://arxiv.org/abs/2103.00020) - 图文对比学习
- [GPT-4V 技术报告](https://arxiv.org/abs/2309.17421) - GPT-4 视觉能力
- [LLaVA 论文](https://arxiv.org/abs/2304.08485) - 开源多模态模型
- [BLIP-2 论文](https://arxiv.org/abs/2301.12597) - 视觉语言预训练

#### 学习资源
- [多模态学习综述](https://arxiv.org/abs/2303.05058) - 多模态学习最新进展
- [Vision-Language Models Guide](https://huggingface.co/blog/vision-language-models) - HuggingFace 指南
- [CLIP 原理详解](https://openai.com/research/clip) - OpenAI CLIP 介绍

### LangChain 开发

#### 官方资源
- [LangChain 官方文档](https://python.langchain.com/docs/get_started/introduction) - 完整开发文档
- [LangChain GitHub](https://github.com/langchain-ai/langchain) - 源码仓库
- [LangChain Cookbook](https://python.langchain.com/docs/cookbook/) - 实战案例
- [LangSmith 文档](https://docs.smith.langchain.com/) - 调试与监控平台

#### 学习教程
- [LangChain 入门教程](https://www.bilibili.com/video/BV1EM411K7Vg/) - 中文视频教程
- [Build with LangChain](https://blog.langchain.dev/) - 官方博客
- [LangChain Examples](https://github.com/langchain-ai/langchain/tree/master/cookbook) - 代码示例

### LangGraph 工作流

#### 核心文档
- [LangGraph 官方文档](https://langchain-ai.github.io/langgraph/) - 工作流编排框架
- [LangGraph Tutorials](https://langchain-ai.github.io/langgraph/tutorials/) - 官方教程
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples) - 示例代码

#### Agent 架构
- [Building LLM Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) - Agent 架构详解
- [LangGraph Agent 教程](https://langchain-ai.github.io/langgraph/tutorials/introduction/) - Agent 开发入门

### RAG 检索增强生成

#### 技术文档
- [RAG 最佳实践](https://blog.langchain.dev/deconstructing-rag/) - LangChain 官方指南
- [Advanced RAG Techniques](https://blog.llamaindex.ai/a-cheat-sheet-and-a-roadmap-for-advanced-rag-techniques-4e0e8b2f9c69) - 高级 RAG 技术
- [RAG 评估框架](https://docs.ragas.io/en/stable/) - RAGAS 评估工具

#### 向量数据库
- [Milvus 官方文档](https://milvus.io/docs) - 开源向量数据库
- [Pinecone 学习中心](https://www.pinecone.io/learn/) - 向量数据库教程
- [Chroma 文档](https://docs.trychroma.com/) - 轻量级向量数据库
- [Weaviate 文档](https://weaviate.io/developers/weaviate) - 语义搜索引擎

### Prompt Engineering

#### 系统学习
- [Prompt Engineering Guide](https://www.promptingguide.ai/) - 最全面的提示词指南
- [Learn Prompting](https://learnprompting.org/) - 免费课程
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering) - 官方最佳实践

#### 高级技术
- [Chain-of-Thought 论文](https://arxiv.org/abs/2201.11903) - 思维链推理
- [ReAct 论文](https://arxiv.org/abs/2210.03629) - 推理与行动
- [Self-Consistency](https://arxiv.org/abs/2203.11171) - 自一致性方法
- [Tree of Thoughts](https://arxiv.org/abs/2305.10601) - 思维树方法

### 模型微调

#### 微调技术
- [LoRA 论文](https://arxiv.org/abs/2106.09685) - 低秩适配微调
- [QLoRA 论文](https://arxiv.org/abs/2305.14314) - 量化 LoRA
- [PEFT 文档](https://huggingface.co/docs/peft) - 参数高效微调库
- [Hugging Face 微调教程](https://huggingface.co/docs/transformers/training) - 模型训练指南

#### 实践资源
- [Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) - 微调工具
- [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) - 一键微调平台
- [Unsloth](https://github.com/unslothai/unsloth) - 快速微调工具

### 模型部署

#### 推理框架
- [vLLM 文档](https://vllm.readthedocs.io/) - 高性能推理引擎
- [TGI 文档](https://huggingface.co/docs/text-generation-inference) - HuggingFace 推理
- [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) - NVIDIA 推理优化
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - CPU 推理

#### 部署平台
- [Hugging Face Inference](https://huggingface.co/inference) - 云端推理
- [Together AI](https://together.ai/) - 开源模型托管
- [Anyscale](https://www.anyscale.com/) - Ray 集群部署
- [Modal](https://modal.com/) - 无服务器部署

### 测试与评估

#### 模型评估
- [HELM 排行榜](https://crfm.stanford.edu/helm/lite/) - 斯坦福模型评估
- [Open LLM Leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard) - 开源模型排行
- [MMLU 基准](https://github.com/hendrycks/test) - 多任务语言理解
- [HumanEval](https://github.com/openai/human-eval) - 代码生成评估

#### LLM 测试
- [Promptfoo](https://github.com/promptfoo/promptfoo) - Prompt 测试工具
- [TruLens](https://www.trulens.org/) - LLM 应用评估
- [DeepEval](https://github.com/confident-ai/deepeval) - LLM 单元测试
- [Giskard](https://github.com/Giskard-AI/giskard) - AI 模型测试
