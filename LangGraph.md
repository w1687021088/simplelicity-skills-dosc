# LangGraph

**LangGraph** 是由 **LangChain** 团队推出的一个开源框架，用于构建**复杂、可控、有状态（Stateful）的 AI Agent（智能体）工作流**
。它的核心思想是：**用图（Graph）来组织 AI 的执行流程，而不是简单的线性调用。**

![image-20260915094236533](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260915094236533.png)

`create_agent` 目前可以实现理解用户意图、自动选择工具、调用工具、根据结果继续推理；但是都基于提示词约束整体的流程，并让 LLM
决策流程；

## 状态图

`StateGraph` 类是主要使用的图形类。这是由用户定义的 `State` 对象初始化的。

通俗来说，它是一张**流程图 + 状态管理系统**，定义了：

1. 哪些节点需要执行；
2. 每一步节点之间如何扭转；
3. 整个流程图中的状态如何流动和更新；

LangGraph 不只是流程控制，还强调：

1. 每个节点执行前和执行后都可以访问和修改状态；
2. 状态在整个流程图中流动（每个节点都可以访问和修改）；
3. 节点的跳转可以依据状态来判断；

所以 LangGraph 被称为有状态的流程图，而不是静态的；

## 创建流程图

通过 langgraph 的 StateGraph 类来创建流程图；

### 第一步：定义状态

``` python
from langgraph.graph import StateGraph
from typing import TypedDict

# 1. 定义状态
class MyState(TypedDict):
    question: str
    search_data: str
    answer: str

```

推荐使用 `TypedDict` 类来定义状态；

### 第二步：创建节点

``` python
def search_node(state: MyState):
  	"""查询节点"""
    # 输出状态中的内容
    print("搜索节点：", state)
    # 是字典类型     更新状态
    return {"search_data": "这是搜索内容"}
  
  
def answer_node(state: MyState):
  	"""结果节点"""
    return {"answer": "这是最终答案"}
```

### 第三步：流程图注册

```python
graph = StateGraph(state_schema=MyState)
```

通过graph将节点进行注册和连接（确定工作流程）

### 第四步： 添加节点

``` python
graph.add_node("search_node", search_node)
graph.add_node("answer_node", answer_node)
```

每个节点就是Graph的每个流程节点；

### 第五步：添加边（流程）

``` python
graph.add_edge("__start__", "search_node") # 从search_node节点开始

graph.add_edge("search_node", "answer_node")  # 从search_node->answer_node

graph.add_edge("answer_node", "__end__")  # 从answer_node节点结束

```

将节点通过**“边”**串联起来；

### 第六步：实例化

``` python
my_graph = graph.compile()
```

初始化流程图

> `compile()` = 把图定义编译成可运行图实例的方法。
>
> **`compile()` 是 `StateGraph` builder 的编译方法，用于生成 `CompiledStateGraph` 可运行实例。**



接下来就可以调用了

``` python
result = my_graph.invoke({"question": "这是问题？"})

print(result)
```

# 状态

在使用 LangGraph 构建流程图之前，**第一件事**就是定义图的状态 `State`。这是整个图运行中用于**共享和传递信息**的核心机制。

**LangGraph** 中的 **State** 是图中所有节点（**Node**）之间传递数据的**模式结构**，可以类比为一个共享的上下文字典，它包含输入、输出、中间变量等。

定义 **State** 时，需要包含两个部分：

1. **Schema（模式）**：指定 State 的字段结构（可以用 `TypedDict` 或 `Pydantic`）

   TypedDict 是标准库的一部分（来自 typing 模块），零依赖，零性能开销而 Pydantic 会在每一步创建模型实例，会增加运行时负担

   LangGraph 中的 **State** 实质就是一个字典（**dict**），而 TypedDict 就是“**有类型注解**的 **dict**”，与 LangGraph
   的执行机制无缝对接，而 Pydantic 是类结构，需要 .dict() 转换，略显多余

   ``` python
   from typing import TypedDict
   
   
   class State1(TypedDict):
       user_input: str
   
   # 使用 pydantic 可以进行参数校验和提供默认值
   from pydantic import BaseModel
   
   
   class State2(BaseModel):
       question: str
       result: str = ""
   ```

2. **多个模式（Multiple Schemas）：**在大多数情况下，LangGraph 使用一个统一的 State 模式。但你也可以设置“输入模式”和“输出模式”分开

    1. **输入模式**：接收用户输入的字段（如 `question`）

       ``` python
       # 输入字段：用户的问题
       class InputState(TypedDict):
           question: str
       
       # 其他逻辑...
       
       result = app.invoke({"question": "什么是LangGraph？"})
       ```

       这样，输入的时候只能输入 **question** 字段；

    2. **输出模式**：只保留最终输出的字段（如 `final_answer`）

       ``` python
       # 输出字段：只想返回最终答案
       class OutputState(TypedDict):
           final_answer: str
       ```

**完整例子：**

``` python
from typing import TypedDict
from langgraph.graph import StateGraph


# 1. 定义输入、输出、图内部的状态结构

# 输入字段：用户的问题
class InputState(TypedDict):
    question: str


# 中间状态：包括中间结果
class InternalState(TypedDict):
    question: str
    search_result: str
    final_answer: str


# 输出字段：只想返回最终答案
class OutputState(TypedDict):
    final_answer: str


# 2. 定义节点函数（中间节点用中间字段）
def search_node(state: InternalState) -> dict:
    return {"search_result": f"搜索了：{state['question']}"}


def answer_node(state: InternalState) -> dict:
    return {"final_answer": f"根据搜索结果：{state['search_result']}，这是答案"}


# 3. 创建 StateGraph，显式指定输入/输出 Schema
builder = StateGraph(state_schema=InternalState, 
                     input_schema=InputState, 
                     output_schema=OutputState)

# 4. 添加节点
builder.add_node("search", search_node)
builder.add_node("answer", answer_node)

# 5. 配置流程
builder.set_entry_point("search")
builder.add_edge("search", "answer")

# 6. 编译并执行图
app = builder.compile()

result = app.invoke({"question": "什么是LangGraph？"})

print(result)  # {'final_answer': '根据搜索结果：搜索了：什么是LangGraph？，这是答案'}
```

## Reducer

**Reducer（归并函数）**：在 LangGraph 中，所有节点返回的都是“局部更新结果”，**Reducer 是用于合并多个节点输出更新的机制**。 *
*将每个节点返回的“局部状态更新”统一合并进全局的 State。**

![agent__006](/Users/zhangjiewu/Desktop/docs/image/agent__006.png)

原本的状态更新只能采用覆盖的形式；

但多数情况下需要保留旧状态，通过归并函数的方式追加状态；

节点中去进行更新属性的时候默认是进行替换， 需要加上**from operator import add**保证这个属性是进行追加的；

**示例：**

``` python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
from operator import add


class MyState(TypedDict):
    messages: Annotated[list[str], add]


def node_01(_: MyState):
    return {
        "messages": ["这是节点1"]
    }


def node_02(_: MyState):
    return {
        "messages": ["这是节点2"]
    }


def node_03(_: MyState):
    return {
        "messages": ["这是节点3"]
    }


graph = StateGraph(state_schema=MyState)

graph.add_node("node_01", node_01)
graph.add_node("node_02", node_02)
graph.add_node("node_03", node_03)

graph.add_edge("__start__", "node_01")
graph.add_edge("node_01", "node_02")
graph.add_edge("node_02", "node_03")
graph.add_edge("node_03", "__end__")

builder = graph.compile()

result = builder.invoke({
    "messages": ["这是开始"]
})

print(result) # {'messages': ['这是开始', '这是节点1', '这是节点2', '这是节点3']}

```

## 图形状态

**为什么要使用消息？**

大多数现代 LLM 提供商都提供聊天模型接口，接受消息列表作为输入。LangChain尤其接受`ChatModel`对象列表以`Message`
作为输入。这些消息有多种形式，例如`HumanMessage`（用户输入）或`AIMessage`（LLM 响应）。

**在图表中使用消息**

在许多情况下，将之前的对话历史记录以消息列表的形式存储在图状态中会很有帮助。为此，我们可以向图状态添加一个键（通道），该键存储
`Message`对象列表，并使用 Reducer 函数对其进行注释。Reducer 函数对于指示图如何`Message`
在每次状态更新（例如，当节点发送更新时）时更新状态中的对象列表至关重要。如果您未指定
Reducer，则每次状态更新都会用最新提供的值覆盖消息列表。如果您只想将消息附加到现有列表中，可以使用`operator.add`。

operator 是 Python 的一个内置模块，把常见的运算符（如 +、-、==、getitem 等）变成了函数，方便函数式编程和高阶函数使用。

有场景可能还需要手动更新图状态中的消息（例如，人机交互）。 如果想去修改之前的某一个状态，但使用 `operator.add`
，您发送到图的手动状态更新将被附加到现有消息列表中，而不是更新现有消息。

为了避免这种情况，您需要一个能够跟踪**消息 ID** 并在更新时覆盖现有消息的 Reducer。 为此，您可以使用预构建 **add_messages**
函数。 对于新消息，它只会附加到现有列表中，但它也会正确处理现有消息的更新。

``` python
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from typing import Annotated
from typing_extensions import TypedDict

class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

### MessagesState

由于在状态中包含消息列表非常常见，因此存在一个名为`MessagesState`的预建状态，它使使用消息变得非常简单。该状态
`MessagesState`使用单个键定义`messages`，该键是对象列表`AnyMessage`并使用`add_messages`。通常，需要跟踪的状态不仅仅是消息，所以我们可以通过继承的方式

例如：

``` python
from langgraph.graph import MessagesState

# 和上述代码不同会在State类中自动维护一个messages 字段，不需要显示创建
class State(MessagesState):
    documents: list[str]
```

# 节点

**节点（Nodes）是图中执行逻辑的基本单位**。每个节点表示一个**函数步骤、处理阶段或子逻辑流程**，多个节点通过边连接成有向图，组成一个完整的有状态计算流程。

**LangGraph 中的节点就是你定义的一个函数**，用于接收状态、执行逻辑，并返回更新后的状态

``` python
def my_node(state: dict) -> dict:
    # 处理输入状态，并返回更新字段
    return {"new_key": "new_value"}
```

LangGraph 会自动用 **reducer** 把这些更新合并进全局状态。

## START节点

Node`START`是一个特殊节点，表示将用户输入发送到图的节点。引用此节点的主要目的是确定应首先调用哪些节点。

``` python
from langgraph.graph import START

graph.add_edge(START, "node_01")

# 等价于

graph.add_edge("__start__", "node_01")

# 同时也等价于

graph.set_entry_point("node_01")
```

## END节点

Node`END`是一个特殊节点，表示终端节点。当需要指示哪些边在完成后没有操作时，可以引用此节点。

```python
from langgraph.graph import END

graph.add_edge("node_03", END)

# 等价于

graph.add_edge("node_03", "__end__")
```

如果结束节点后续没有其他的节点跳转，不添加结束节点也可以；（建议加上，毕竟即使有 AI Coding写代码，代码大多数情况还是给程序员看的）；

## 并行运行节点

``` python
import operator
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    # The operator.add reducer fn makes this append-only
    aggregate: Annotated[list, operator.add]

def a(state: State):
    print(f'Adding "A" to {state["aggregate"]}')
    return {"aggregate": ["A"]}

def b(state: State):
    print(f'Adding "B" to {state["aggregate"]}')
    return {"aggregate": ["B"]}

def c(state: State):
    print(f'Adding "C" to {state["aggregate"]}')
    return {"aggregate": ["C"]}

def d(state: State):
    print(f'Adding "D" to {state["aggregate"]}')
    return {"aggregate": ["D"]}

builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)
builder.add_node(c)
builder.add_node(d)
builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)
graph = builder.compile()

print(graph.invoke({"aggregate": ["start"]}))
```

另外：节点也可以是**子逻辑流程**，在多智能体开发中用作**子agent**；

# 边

**Edge（边）** 是连接节点的通道，表示图中**节点之间的执行跳转关系**。可以把它理解为「节点执行完之后，下一步去哪，是构成
LangGraph 流程图的核心。

**Edge 是 LangGraph 中连接两个节点的“执行路径”**，控制流程的走向。

## 普通边

直接从一个节点到下一个节点。

``` python
graph.add_edge("节点A", "节点B")
```

## 条件边

调用一个函数来确定下一步要去哪个节点。

``` python
from langgraph.graph import StateGraph
from typing import TypedDict


class MyState(TypedDict):
    type: str
    result: str


def node_a(_: MyState):
    return {"result": "走了 A 分支"}


def node_b(_: MyState):
    return {"result": "走了 B 分支"}


def node_c(_: MyState):
    return {"result": "走了 C 分支"}


def node_default(_: MyState):
    return {"result": "走了 默认 分支"}


def route_condition(state: MyState):
    """条件函数：只负责路由决策"""
    if state["type"] == "a":
        return "node_a"
    elif state["type"] == "b":
        return "node_b"
    elif state["type"] == "c":
        return "node_c"
    elif state["type"] == "d":
        return "node_default"
    return "node_default"


graph = StateGraph(state_schema=MyState)


def judge_node(state: MyState):
    """节点函数：可以做一些预处理"""
    return state  # 保持状态不变，只是路由


graph.add_node("judge_node", judge_node)
graph.add_node("node_a", node_a)
graph.add_node("node_b", node_b)
graph.add_node("node_c", node_c)

graph.add_node("node_default", node_default)
graph.add_edge("__start__", "judge_node")

graph.add_conditional_edges("judge_node", route_condition, {
    "node_a": "node_a",
    "node_b": "node_b",
    "node_c": "node_c",
    "node_default": "node_default"
})

builder = graph.compile()

result = builder.invoke({
    "type": "a"
})

print(result)  # {'type': 'a', 'result': '走了 A 分支'}

```

## 入口点

当图开始运行时首先运行的第一个（些）节点。

``` python
from langgraph.graph import START

graph.add_edge(START, "node_a")
```

## 条件入口点

调用一个函数来确定当用户输入到达时首先调用哪个节点。

主要是实现：动态入口，根据初始化的state，判断进入哪一个节点。（可以理解路由器，一般做意图识别）

``` python
from langgraph.graph import StateGraph
from typing import TypedDict, Literal


class MyState(TypedDict):
    user_type: Literal["vip", "normal", "guest"]  # "vip", "normal", "guest"
    message: str
    result: str


# 定义不同的处理节点
def vip_service(state: MyState):
    """VIP 用户服务"""
    return {"result": f"VIP专享服务: {state['message']}"}


def normal_service(state: MyState):
    """普通用户服务"""
    return {"result": f"标准服务: {state['message']}"}


def guest_service(state: MyState):
    """游客服务"""
    return {"result": f"游客服务(功能受限): {state['message']}"}


graph = StateGraph(state_schema=MyState)


# 条件入口点函数
def route_by_user_type(state: MyState):
    """根据用户类型路由到不同的服务"""
    user_type = state["user_type"]

    if user_type == "vip":
        return "vip_service"
    elif user_type == "normal":
        return "normal_service"
    else:
        return "guest_service"


graph.add_node("vip_service", vip_service)
graph.add_node("normal_service", normal_service)
graph.add_node("guest_service", guest_service)

graph.set_conditional_entry_point(route_by_user_type, {
    "vip_service": "vip_service",
    "normal_service": "normal_service",
    "guest_service": "guest_service"
})

builder = graph.compile()

result = builder.invoke({
    "user_type": "vip",
    "message": "我要退款",
    "result": ""
})

print(result)  # {'user_type': 'vip', 'message': '我要退款', 'result': 'VIP专享服务: 我要退款'}

```

# Send并行

![agent__007](/Users/zhangjiewu/Desktop/docs/image/agent__007.png)

在 LangGraph 中，默认情况下：

- 节点（Node）提前定义好
- 节点之间的连接关系（Edge）提前确定
- 所有节点共享同一个 State

但是，有一些场景提前不知道：

1. **下一步需要创建多少个任务**
2. **每个任务需要处理的数据不一样**

这时候固定的 Edge 就无法满足需求。

**总结：Send 是 LangGraph 实现动态并行处理的关键能力。让 Graph 图，可以根据实际输入数据，在运行的时候，动态 “派生”
出任意数量的任务节点，实现 Map‑Reduce 模式。**

#### Map-Reduce模式

**Map-Reduce** 是一种经典的并行计算模式，特别适合处理大规模数据。

**Map-Reduce** 将复杂的数据处理任务分解为两个阶段：

1. **Map阶段**：将大任务分解为多个小任务，并行处理
2. **Reduce阶段**：将所有小任务的结果合并成最终结果

``` python
from langgraph.graph import StateGraph

from langgraph.types import Send

from typing import TypedDict, Annotated

from operator import add


# 状态定义
class State(TypedDict):
    numbers: list[int]  # 输入的数字
    results: Annotated[list[int], add]  # worker的结果
    final_sum: int  # 最终求和


# 创建一个send的状态
class WorkerState(TypedDict):
    number: int


# 1. Map阶段：分发数字
def split_numbers(state: State):
    """把数字分发给不同的worker"""
    numbers = state["numbers"]

    # 每个数字发给一个worker
    return [Send("worker", WorkerState(number=num)) for num in numbers]


# 2. Worker阶段：计算平方
def calculate_square(state: WorkerState):
    """每个worker计算一个数字的平方"""
    number = state["number"]
    return {"results": [number * number]}


# 3. Reduce阶段：求和
def sum_results(state: State):
    """把所有结果加起来"""
    results = state.get("results", [])
    total = sum(results)
    return {"final_sum": total}


# 构建图
def create_simple_graph():
    graph = StateGraph(State)

    # 添加节点
    graph.add_node("splitter", lambda s: s)  # 分发器
    graph.add_node("worker", calculate_square)  # 工作节点
    graph.add_node("summer", sum_results)  # 求和器

    # 连接节点
    graph.add_edge("__start__", "splitter")
    graph.add_conditional_edges("splitter", split_numbers, "worker")  # Map阶段
    graph.add_edge("worker", "summer")  # Worker完成后求和
    graph.add_edge("summer", "__end__")

    return graph.compile()


# 运行例子
def run_example():
    app = create_simple_graph()

    # 测试数据
    initial_state = {
        "numbers": [1, 2, 3, 4, 5],
        "results": [],
        "final_sum": 0
    }

    print("开始计算...")
    print("任务：计算每个数字的平方，然后求和")
    print()

    # 运行
    result = app.invoke(initial_state)
    print(result) # {'numbers': [1, 2, 3, 4, 5], 'results': [1, 4, 9, 16, 25], 'final_sum': 55}


if __name__ == "__main__":
    run_example()


```

**Map-Reduce 简单案例**

``` python
"""
LangGraph Map-Reduce 简单案例：分解任务-进行并行执行任务-总结答案
"""
from typing import Annotated
import operator
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from typing import TypedDict
from settings import app_settings
import asyncio

# 创建模型
model = app_settings.get_qwen_client(enable_thinking=False)  # 关键配置：关闭思考模式


class MyState(TypedDict):
    question: str  # 用户一次性问多个任务，通过模型进行规划，并行处理任务（计算5*8+9等于多少？；李白是谁？；帮我查询一下langgraph是什么？）
    tasks_results: Annotated[list[str], operator.add]
    answer: str


class TaskState(TypedDict):
    task_value: str


class SplitTasksSchema(TypedDict):
    tasks: dict[str, str]


# 绑定结构化输出格式的模型
structured_model = model.with_structured_output(SplitTasksSchema)


# 定义条件边函数-任务分发
def split_tasks(state: MyState):
    question = state["question"]
    prompt = f"""
        你是一个任务分割助手，擅长将用户问题进行提取分类
        分类格式：{{"math_node": 数学问题, "chinese_node": 语文问题, "search_node": "搜索问题"}}
        注意：严格返回分类数据格式
        用户问题“{question}

    """

    response = structured_model.invoke(prompt)
    print('model 分类格式:\n', response)
    tasks = response.get('tasks')
    return [Send(task, TaskState(task_value=value)) for task, value in tasks.items()]


# 定义节点-执行不同的任务
def math_node(state: TaskState):
    task_value = state["task_value"]
    print("数学任务：", task_value)
    return {"tasks_results": ["5*8+9=49"]}


def chinese_node(state: TaskState):
    task_value = state["task_value"]
    print("语文任务：", task_value)
    return {"tasks_results": ["李白是唐朝的诗人"]}


def search_node(state: TaskState):
    task_value = state["task_value"]
    print("搜索任务：", task_value)
    return {"tasks_results": ["langgraph是一个带状态的流程图"]}


# 根据并行的任务去进行汇总答案
async def summarize_answers(state: MyState):
    tasks_results = state["tasks_results"]
    prompt = f"""
        你是一个总结多个任务返回结果的专家

        用户问题：{state['question']}

        多个并行节点返回的答案：{tasks_results}
    """
    answer = await model.ainvoke(prompt)
    return {"answer": answer}





def create_graph():
    graph = StateGraph(state_schema=MyState)
    # 添加节点
    # graph.add_node("splitter", lambda s: s)  # 分发器

    graph.add_node("math_node", math_node)  # 数学任务节点
    graph.add_node("chinese_node", chinese_node)  # 语文任务节点
    graph.add_node("search_node", search_node)  # 搜索任务节点
    graph.add_node("summarize_answers", summarize_answers)  # 总结节点

    # 条件入口
    graph.set_conditional_entry_point(split_tasks, ["math_node", "chinese_node", "search_node"])


    # 条件边
    # graph.add_edge(START, "splitter")
    # graph.add_conditional_edges("splitter", split_tasks, ["math_node", "chinese_node", "search_node"])  # Map阶段


    graph.add_edge("math_node", "summarize_answers")
    graph.add_edge("chinese_node", "summarize_answers")
    graph.add_edge("search_node", "summarize_answers")
    graph.add_edge("summarize_answers", END)

    return graph.compile()



async def main():
    graph = create_graph()
    res = await graph.ainvoke({"question": "计算5*8+9等于多少？；李白是谁？；帮我查询一下langgraph是什么？"})
    res['answer'].pretty_print()


if __name__ == '__main__':
    asyncio.run(main())

# model 分类格式:
#  {'tasks': {'math_node': '计算5*8+9等于多少？', 'chinese_node': '李白是谁？', 'search_node': '帮我查询一下langgraph是什么？'}}
# 数学任务： 计算5*8+9等于多少？
# 语文任务： 李白是谁？
# 搜索任务： 帮我查询一下langgraph是什么？
# ================================== Ai Message ==================================
#
# 以下是针对您提出的三个问题的综合回答：
#
# 1.  **数学计算**：$5 \times 8 + 9$ 的计算结果为 **49**。
# 2.  **人物介绍**：李白是**唐朝的诗人**，被后世誉为“诗仙”。
# 3.  **技术查询**：LangGraph 是一个**带状态的流程图**框架，主要用于构建有状态、多代理的 LLM（大语言模型）应用程序。

```

**Send 用于解决动态任务分发问题。当任务数量未知，或者每个任务需要不同 State 时，可以通过 Send 在运行过程中动态创建节点执行任务，是
LangGraph 实现 Map-Reduce、多任务并行处理的重要机制。**

通过  **Send**派发并行的节点接收到的状态由 Send 发送时决定；

``` python
return [Send(task, TaskState(task_value=value)) for task, value in tasks.items()]
```

``` python
def math_node(state: TaskState):
  
def chinese_node(state: TaskState):

def search_node(state: TaskState):
```

# Command命令

Command 是 LangGraph 中用于**控制图执行流程、更新图状态，并支持人机交互、工具调用的标准化对象。**

### 核心作用：

**第一，更新图的运行状态；**

**第二，控制图的执行流向（指定下一个或多个执行节点）；**

**第三，衔接中断恢复、工具调用、人机交互等场景**。

### command参数拆解

`update`：应用状态更新（类似于从节点返回更新）。

`goto`：导航到特定节点（类似于 条件边）。

`graph`：在从 子图 导航时定位到父图。

`resume`：在 中断 后提供一个值以继续执行。

**从节点返回****：**使用 `update`、`goto` 和 `graph` 将状态更新与控制流结合。

**interrupt（人机交互）****输入到****`invoke`****或****`stream`**：在使用**interrupt**中断后使用`resume`继续执行

**从工具返回****：**类似于从节点返回，结合工具内部的状态更新和控制流。

在节点函数中返回时`Command`，必须添加返回类型注释，其中包含节点路由到的节点名称列表，例如
`Command[Literal["my_other_node"]]`。这对于图形渲染是必需的，它告诉 LangGraph 当前节点可以导航到`my_other_node`。

``` python
from typing import Literal, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.types import Command

from settings import app_settings


# 定义状态
class State(TypedDict):
    question: str
    intent: str
    response: str


# 创建模型（关闭思考模式）
model = app_settings.get_qwen_client(enable_thinking=False)


def classify_and_route(state: State) -> Command[
    Literal["return_department", "price_department", "tech_department", "general_department"]]:
    """使用模型决策路由"""
    question = state.get("question")

    # 使用模型进行意图分类和路由决策
    prompt = f"""
    是一个智能路由助手。根据用户问题，决定应该由哪个部门处理。

        可选部门：
        - return_department: 退货、退款、售后问题
        - price_department: 价格、优惠、费用查询
        - tech_department: 技术故障、使用问题
        - general_department: 其他一般咨询

        请只返回部门名称，不要有其他内容

        用户问题:{question}
    """

    response = model.invoke(prompt)
    intent = response.content.strip().lower()

    print(f"AI 决策: 路由到 {intent}")

    # 根据模型决策跳转
    return Command(
        update={"intent": intent},
        goto=intent  # 直接使用模型返回的节点名称
    )


def return_department(state: State) -> Command[END]:
    print("退货部门处理...", state.get("intent"))
    return Command(
        update={"response": "退货流程：请提供订单号和退货原因"},
        goto=END
    )


def price_department(state: State) -> Command[END]:
    print("价格部门处理...", state.get("intent"))
    return Command(
        update={"response": "价格信息：当前商品价格请查看官网"},
        goto=END
    )


def tech_department(state: State) -> Command[END]:
    print("技术部门处理...", state.get("intent"))
    return Command(
        update={"response": "技术问题：请描述具体的错误现象"},
        goto=END
    )


def general_department(state: State) -> Command[END]:
    print("综合部门处理...", state.get("intent"))
    return Command(
        update={"response": "感谢咨询，我们会尽快回复"},
        goto=END
    )


# 构建图
builder = StateGraph(State)
builder.add_node("classify_and_route", classify_and_route)
builder.add_node("return_department", return_department)
builder.add_node("price_department", price_department)
builder.add_node("tech_department", tech_department)
builder.add_node("general_department", general_department)

builder.set_entry_point("classify_and_route")

graph = builder.compile()

# 测试
test_questions = [
    "我想退货，收到商品有质量问题",
    "这个商品现在多少钱？",
    "软件打不开了，怎么办？",
    "你们公司在哪里？"
]

for q in test_questions:
    print(f"\n{'=' * 50}")
    print(f"用户问题: {q}")
    result = graph.invoke({"question": q})
    print(f"响应: {result['response']}")

# ==================================================
# 用户问题: 我想退货，收到商品有质量问题
# AI 决策: 路由到 return_department
# 退货部门处理... return_department
# 响应: 退货流程：请提供订单号和退货原因
#
# ==================================================
# 用户问题: 这个商品现在多少钱？
# AI 决策: 路由到 price_department
# 价格部门处理... price_department
# 响应: 价格信息：当前商品价格请查看官网
#
# ==================================================
# 用户问题: 软件打不开了，怎么办？
# AI 决策: 路由到 tech_department
# 技术部门处理... tech_department
# 响应: 技术问题：请描述具体的错误现象
#
# ==================================================
# 用户问题: 你们公司在哪里？
# AI 决策: 路由到 general_department
# 综合部门处理... general_department
# 响应: 感谢咨询，我们会尽快回复

```

**使用`Command`进行`Send` 动态并行处理**

``` python
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Command, Send
import operator

from settings import app_settings

model = app_settings.get_qwen_client(enable_thinking=True)


class AdvancedState(TypedDict):
    question: str
    subtasks: dict[str, str]  # 子任务映射
    results: Annotated[list[dict[str, str]], operator.add]  # 各节点结果
    summary: str


class SplitTasksSchema(TypedDict):
    tasks: dict[str, str]


class TaskState(TypedDict):
    task: str


structured_model = model.with_structured_output(SplitTasksSchema)


def analyze_and_split(state: AdvancedState) -> Command[list[Send]]:
    """AI 分析问题并拆解成多个子任务"""
    question = state["question"]

    # 使用模型分析并拆解任务
    prompt = f"""
        你是一个任务分析专家。分析用户问题，拆解成多个独立的子任务。

        返回 JSON 格式：
        {{
            "tasks": {{
                "math_handler": "数学计算子问题",
                "knowledge_handler": "知识查询子问题", 
                "search_handler": "信息搜索子问题"
                }}
        }}

        可用处理器：
        - math_handler: 处理数学计算
        - knowledge_handler: 处理知识问答
        - search_handler: 处理信息搜索
        - default_handler: 处理其他问题

        根据问题内容，选择合适的处理器，至少选择1个。

        用户问题：{question}
    """

    result = structured_model.invoke(prompt)
    print(result)
    tasks = result.get("tasks", {"default_handler": question})

    print(f"AI 拆解任务: {list(tasks.keys())}")

    # 并行分发到多个节点
    return Command(
        update={
            "subtasks": tasks
        },
        goto=[
            Send(node_name, {"task": task_content})
            for node_name, task_content in tasks.items()
        ]
    )


def math_handler(state: TaskState):
    task = state["task"]
    print(f"数学处理: {task}")

    # 模拟数学处理
    prompt = f"""
        你是一个数学专家，计算以下数学问题，只返回结果。
        问题： {task}
    """
    result = model.invoke(prompt)

    return {"results": [{"math": result.content}]}


def knowledge_handler(state: TaskState):
    task = state["task"]
    print(f"知识查询: {task}")

    prompt = f"""
           你是一个知识专家，回答以下知识性问题，简洁准确
           问题： {task}
       """
    result = model.invoke(prompt)

    return {"results": [{"knowledge": result.content}]}


def search_handler(state: TaskState):
    task = state["task"]
    print(f"信息搜索: {task}")

    prompt = f"""
              你是一个搜索专家，提供相关信息
              问题： {task}
          """
    result = model.invoke(prompt)

    return {"results": [{"search": result.content}]}


def default_handler(state: TaskState):
    task = state["task"]
    print(f"默认处理: {task}")

    prompt = f"""
                  你是一个通用助手，处理用户的咨询。
                  问题： {task}
              """
    result = model.invoke(prompt)

    return {"results": [{"default": result.content}]}


def summarize(state: AdvancedState) -> Command[END]:
    """汇总所有结果"""
    results = state.get("results", {})

    # 使用模型生成总结
    summary_prompt = f"""
            你是一个总结多个任务返回结果的专家

            用户问题：{state['question']}

            多个并行节点返回的答案：{results}
        """
    summary = model.invoke(summary_prompt)

    print(f"\n汇总结果: {summary.content}")

    return Command(
        update={"summary": summary.content},
        goto=END
    )


def create_builder() -> CompiledStateGraph[AdvancedState]: # type: ignore[type-var]
    # 构建图
    builder = StateGraph(AdvancedState)
    builder.add_node("analyze_and_split", analyze_and_split)
    builder.add_node("math_handler", math_handler)
    builder.add_node("knowledge_handler", knowledge_handler)
    builder.add_node("search_handler", search_handler)
    builder.add_node("default_handler", default_handler)
    builder.add_node("summarize", summarize)

    # 开始节点
    builder.set_entry_point("analyze_and_split")

    # 所有处理节点完成后进入汇总
    builder.add_edge("math_handler", "summarize")
    builder.add_edge("knowledge_handler", "summarize")
    builder.add_edge("search_handler", "summarize")
    builder.add_edge("default_handler", "summarize")

    return builder.compile()


def main():
    graph = create_builder()

    # 测试复杂问题
    test_question = """
    我想知道：
    1. 25 * 36 等于多少？
    2. 李白的代表作品有哪些？
    3. 长沙在清朝的地名？
    """

    print("用户问题:", test_question)
    print("\n" + "=" * 50)
    result = graph.invoke({"question": test_question})
    print("\n" + "=" * 50)
    print("最终总结:", result['summary'])


if __name__ == '__main__':
    main()

```

`Command` 不能用于条件入口边的条件函数中；`Command` 的设计目的是**在节点函数内部**，将**状态更新**和**路由跳转**合二为一。它通常在
**节点执行过程中**被返回，用于动态地改变图的执行流向。

### 什么时候应该使用`Command`而不是条件边？

在 LangGraph 中：

- **条件边（Conditional Edge）**：适合描述**提前设计好的流程分支**
- **Command**：适合描述**运行过程中动态产生的流程控制，还需要同时更新状态和控制流**

简单判断：

> 如果“下一步去哪”是工作流设计的一部分，用条件边； 如果“下一步去哪”是节点运行后临时决定的，用 Command。

一句话总结：**Conditional Edge 用于定义“预先确定的工作流路径”，Command 用于处理“运行过程中动态产生的流程控制”。当节点或工具需要根据实时结果主动改变流程时，应优先使用
Command。**

# runtime运行时

创建图时，还可以标记图的某些部分是可配置的。这样做通常是为了方便在模型或系统提示之间切换。这允许创建单个“认知架构”（图），但拥有多个不同的实例。

**在运行图时提供额外的“配置参数”而不是“状态参数”**，并且通过类型约束这些参数。

**传递非图状态的依赖信息，为节点提供执行所需的辅助资源，同时不干扰图状态的正常流转和更新**。

配置参数通过 context设置；

``` python
from langgraph.graph import StateGraph
from langgraph.runtime import Runtime
from typing import TypedDict


# 定义状态结构
class MyState(TypedDict):
    question: str
    answer: str


# 定义配置结构
class MyContext:
    language: str  # 配置中包含语言选项，比如 "en" 或 "zh"


# 节点函数可以访问 runtime 参数  runtime 可以访问上下文和内存存储
def step1(_: MyState, runtime: Runtime[MyContext]):
    language = runtime.context.get("language")
    if language == "zh":
        answer = "你好！"
    else:
        answer = "Hello!"
    return {"answer": answer}


# 构建图..
graph = StateGraph(state_schema=MyState, context_schema=MyContext)
graph.add_node("step1", step1)

graph.set_entry_point("step1")

# 编译
app = graph.compile()

# 执行时传入 config 参数（区分于 state）
result = app.invoke({"question": "Hi"}, context={"language": "zh"})
print(result)  # => {"question": "Hi", "answer": "你好！"}

```

## 递归限制

递归限制设置图在单次执行中可以执行的最大超步数。一旦达到限制，LangGraph 将出现`GraphRecursionError`。默认情况下，此值设置为
1000 步。可以在运行时在任何图上设置递归限制，并将其传递给`.invoke`/`.stream`通过配置字典。

通俗理解：节点跳转节点计数为1，递归限制就是控制节点之间跳转的次数

``` python
import operator
from typing import Annotated, Literal

from langchain_core.runnables import RunnableConfig
from langgraph.errors import GraphRecursionError
from typing_extensions import TypedDict
from langgraph.graph import StateGraph
from langgraph.managed.is_last_step import RemainingSteps


class State(TypedDict):
    aggregate: Annotated[list, operator.add]
    remaining_steps: RemainingSteps


def a(state: State):
    print(f'Node A sees {state["aggregate"]}', state["remaining_steps"])
    return {"aggregate": ["A"]}


def b(state: State):
    print(f'Node B sees {state["aggregate"]}', state["remaining_steps"])
    return {"aggregate": ["B"]}


# Define nodes
builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)


# Define edges
def route(state: State) -> Literal["b", "__end__"]:
    if state["remaining_steps"] <= 8:
        return "b"  # "__end__"
    else:
        return "b"


builder.add_edge("__start__", "a")
builder.add_conditional_edges("a", route)
builder.add_edge("b", "a")
graph = builder.compile()

config: RunnableConfig = {
    "recursion_limit": 10,  # 设置递归限制
}

# Test it out
try:
    result = graph.invoke({"aggregate": []}, config=config)
    print(result)
except GraphRecursionError as e:
    print(f"图执行步骤过多: {e}")

# Node A sees [] 9
# Node B sees ['A'] 8
# Node A sees ['A', 'B'] 7
# {'aggregate': ['A', 'B', 'A']}

```

关键点就是 设置`recursion_limit`

``` python
config: RunnableConfig = {
    "recursion_limit": 10,  # 设置递归限制
}
```

## 重试策略

1. **LLM API 超时**或达到速率限制（Rate Limit）。
2. **数据库连接**瞬时抖动。
3. **网络请求**失败（5xx 错误）。

在 LangGraph 中，我们通过 `add_node` 的 `retry_policy` 参数来增强节点的健壮性。

``` python
默认情况下，retry_on 参数使用 default_retry_on 函数，
该函数会在任何异常上重试，但不包括以下情况：

ValueError,
TypeError,
ArithmeticError,
ImportError,
LookupError,
NameError,
SyntaxError,
RuntimeError,
ReferenceError,
StopIteration,
StopAsyncIteration,
OSError,
```

``` python
from langgraph.types import RetryPolicy  
# 使用默认策略（自动过滤掉无法通过重试解决的错误，如 SyntaxError） 
builder.add_node("agent", agent_node, retry_policy=RetryPolicy())
```

``` python
import sqlite3
from langchain.chat_models import init_chat_model
from langgraph.graph import END, MessagesState, StateGraph, START
from langgraph.types import RetryPolicy
from langchain_community.utilities import SQLDatabase
from langchain.messages import AIMessage, HumanMessage
from langgraph.runtime import Runtime
from dotenv import load_dotenv

load_dotenv()

db = SQLDatabase.from_uri("sqlite:///:memory:")
model = init_chat_model("deepseek-chat")


def query_database(state: MessagesState, runtime: Runtime):
    print(f"正在尝试第 {runtime.execution_info.node_attempt} 次查询...")
    # 手动抛出一个异常来强制触发重试
    if runtime.execution_info.node_attempt < 3:
        print("模拟数据库连接失败...")
        raise sqlite3.OperationalError("Database connection lost")

    query_result = db.run("SELECT 1;")  # 模拟成功
    return {"messages": [AIMessage(content=str(query_result))]}


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}


# Define a new graph
builder = StateGraph(MessagesState)
builder.add_node(
    "query_database",
    query_database,
    retry_policy=RetryPolicy(retry_on=[sqlite3.OperationalError, sqlite3.IntegrityError]),  # 可以自己设定需要触发的异常类
)
builder.add_node("model", call_model, retry_policy=RetryPolicy(max_attempts=5))  # 重试次数
builder.add_edge(START, "model")
builder.add_edge("model", "query_database")
builder.add_edge("query_database", END)
graph = builder.compile()

response = graph.invoke({"messages": [HumanMessage(content="你好呀？")]})
print(response)
```

# 可视化图谱

``` python
"""
LangGraph Map-Reduce 简单案例：数字求和
把一堆数字分给多个worker算平方，然后把结果加起来
"""
from typing import Annotated
import operator
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from typing import TypedDict, List


# 状态定义
class State(TypedDict):
    numbers: List[int]  # 输入的数字
    number: int
    results: Annotated[list[int], operator.add]  # worker的结果
    final_sum: int  # 最终求和


# 1. Map阶段：分发数字
def split_numbers(state: State):
    """把数字分发给不同的worker"""
    numbers = state["numbers"]
    # print(f"分发数字: {numbers}")

    # 每个数字发给一个worker
    return [Send("worker", {"number": num}) for num in numbers]


# 2. Worker阶段：计算平方
def calculate_square(state: State):
    """每个worker计算一个数字的平方"""
    number = state["number"]
    square = number * number
    # print(f"Worker: {number}² = {square}")
    return {"results": [square]}


# 3. Reduce阶段：求和
def sum_results(state: State):
    """把所有结果加起来"""
    results = state.get("results", [])
    total = sum(results)
    # print(f"求和: {results} = {total}")
    return {"final_sum": total}


# 构建图
def create_simple_graph():
    graph = StateGraph(State)

    # 添加节点
    graph.add_node("splitter", lambda s: s)  # 分发器
    graph.add_node("worker", calculate_square)  # 工作节点
    graph.add_node("summer", sum_results)  # 求和器

    # 连接节点
    graph.add_edge(START, "splitter")
    graph.add_conditional_edges("splitter", split_numbers, ["worker"])  # Map阶段
    graph.add_edge("worker", "summer")  # Worker完成后求和
    graph.add_edge("summer", END)

    return graph.compile()


# 运行例子
def run_example():
    app = create_simple_graph()

    # 测试数据
    initial_state = {
        "numbers": [1, 2, 3, 4, 5],
        "results": [],
        "final_sum": 0
    }

    # print("开始计算...")
    # print("任务：计算每个数字的平方，然后求和")
    # print()

    # 运行
    app.invoke(initial_state)

    # 方法1：可视化成png图片
    # from IPython.display import Image, display
    # display(
    #     Image(
    #         app.get_graph().draw_mermaid_png(output_file_path="./send并行.png")
    #     )
    # )
    # 方法2：转换成 Mermaid 语法
    print(app.get_graph().draw_mermaid())

if __name__ == "__main__":
    run_example()
```

将输出结果复制粘贴到可视化图网站 https://mermaidviewer.com/

``` python
---
config:
  flowchart:
    curve: linear
---
graph TD;
	__start__([<p>__start__</p>]):::first
	splitter(splitter)
	worker(worker)
	summer(summer)
	__end__([<p>__end__</p>]):::last
	__start__ --> splitter;
	splitter -.-> worker;
	worker --> summer;
	summer --> __end__;
	classDef default fill:#f2f0ff,line-height:1.2
	classDef first fill-opacity:0
	classDef last fill:#bfb6fc
```

![image-20260916094232393](/Users/zhangjiewu/Desktop/docs/image/agent__008.png)

# tool工具

**在langgraph中实现工具调用：就是使用function call实现**

**工具**封装了可调用函数及其输入模式。这些可以传递给兼容的聊天模型，让模型决定是否调用工具以及使用哪些参数。

1. 将工具绑定到模型中

   ``` python
   @tool
   def get_weather(city: str) -> str:
       """
       获取指定城市的天气
       Arg:
           city(str):城市名称
       Return:
           str - 天气情况
       """
       return f"{city}的天气是晴天"
       
   # 定义工具列表
   tools = [get_weather]
   
   from settings import app_settings
   
   model = app_settings.get_qwen_client()
   ```


2. 模型根据问题返回tool_calls工具选择列表

   ``` python
   def call_model(state: MessagesState):
       # 获取messages消息列表
       messages = state.get("messages", [])
   
       before_model(messages)
   
       # 2.模型根据问题返回tool_calls工具选择列表   # 添加系统提示词
       response = model_with_tools.invoke([*messages])
   
       after_model([*messages, response])
   
       if response.tool_calls:
           return Command(
               update={
                   "messages": [response]
               },
               goto="tool_node"
           )
   
       return Command(
           update={
               "messages": [response]
           },
           goto="__end__"
       )
   ```

3. 手动执行工具，获取工具的结果添加到聊天历史中

   **langgraph** 提供了 **ToolNode** 节点，并在内部执行；

4. 模型根据用户问题和工具的结果给出最终答案

``` python
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, MessagesState, END, add_messages
from langgraph.types import Command
from settings import app_settings

model = app_settings.get_qwen_client()

@tool
def get_weather(city: str) -> str:
    """
    获取指定城市的天气
    Arg:
        city(str):城市名称
    Return:
        str - 天气情况
    """
    return f"{city}的天气是晴天"

# 定义工具列表
tools = [get_weather]

# 1.将工具绑定到模型中
model_with_tools = model.bind_tools(tools)


# 定义工作流
# 定义调用模型的节点
def call_model(state: MessagesState):
    # 获取messages消息列表
    messages = state.get("messages", [])

    # 2.模型根据问题返回tool_calls工具选择列表   # 添加系统提示词
    response = model_with_tools.invoke([*messages])

    if response.tool_calls:
        return Command(
            update={
                "messages": [response]
            },
            goto="tool_node"
        )

    return Command(
        update={
            "messages": [response]
        },
        goto="__end__"
    )


# 3.手动执行工具，获取工具的结果添加到聊天历史中, 定义工具执行节点   ToolNode是langgraph预构建的工具执行节点
tool_node = ToolNode(tools)

builder = StateGraph(MessagesState)

# 添加模型调用和工具调用节点
builder.add_node("call_model", call_model)
builder.add_node("tool_node", tool_node)

# 添加开始节点
builder.set_entry_point("call_model")

# 添加边    根据langchain创建智能体的流程：从工具回到模型这一条边是固定的
# 这条边是必须返回到 model 的， 因为 model 会根据 tool 的结果进行判断是否循环；
builder.add_edge("tool_node", "call_model")

graph = builder.compile()

result = graph.invoke(
    {"messages":
        [
            {"role": "user", "content": "今天广州天气怎么样？"}
        ]
    }
)
```

也可以采用条件边的方式，langgraph 提供了 tools_condition 函数用来判断是否跳转到工具节点；

``` python
# 添加条件边   因为模型判断是否要使用工具，循环
builder.add_conditional_edges(
    source="call_model",
    path=tools_condition, # tools_condition 内部会做一个判断是否有 tool_calls 参数
    path_map={"tools": "tool_node", END: "__end__"}
)


# 改为条件边的话， call_model需要改造下

def call_model(state: MessagesState):
    # 获取messages消息列表
    messages = state.get("messages", [])

    # 2.模型根据问题返回tool_calls工具选择列表   # 添加系统提示词
    response = model_with_tools.invoke([*messages])

    return {
        "messages": [response] # 返回Ai Message决策的回复，如果需要调用工具，则必然返回一个 Tool Calls
    }

```

相当于

``` python
def should_continue(state: MessagesState):
    messages = state["messages"]
    # 取出最后一条消息
    last_message = messages[-1]
    # 如果在最后一条消息中包含tool_calls，就代表当前要使用工具
    if last_message.tool_calls:
        return "tools"
    return END
```

或者

``` python
    if response.tool_calls:
        return Command(
            update={
                "messages": [response]
            },
            goto="tool_node"
        )

    return Command(
        update={
            "messages": [response]
        },
        goto="__end__"
    )
```

**tools_condition** 本质就是一个用来判断是否跳往 tools 节点的一个判断函数；

定义工具执行节点, langgraph 提供的，简化了需要写 function calling 执行方法；

``` python
tool_node = ToolNode(tools)
```

**工具节点**回传给到 **Model节点**时必须的，需要将工具的结果给到模型，让模型决策；

``` python
builder.add_edge("tool_node", "call_model")
```

完整示例

``` python
from langchain.tools import tool
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, MessagesState
from langgraph.types import Command
from settings import app_settings
import asyncio

model = app_settings.get_qwen_client()


@tool
async def get_weather(city: str) -> str:
    """
    获取指定城市的天气
    Arg:
        city(str):城市名称
    Return:
        str - 天气情况
    """
    return f'{city}的天气是晴天'


tools = [get_weather]

# 将工具绑定到模型中
model_with_tools = model.bind_tools(tools)

# 工具节点
tool_node = ToolNode(tools)


async def model_node(state: MessagesState):
    """模型节点"""

    # 获取messages消息列表
    messages = state.get("messages", [])

    # 2.模型根据问题返回tool_calls工具选择列表   # 添加系统提示词
    response = await model_with_tools.ainvoke([*messages])
    # 如果有工具调用，则跳转到工具节点
    if response.tool_calls:
        return Command(
            update={
                "messages": [response]
            },
            goto="tool_node"
        )
    # 结束
    return Command(
        update={
            "messages": [response]
        },
        goto="__end__"
    )


def create_graph():
    """创建一个状态图，包含模型节点和工具节点"""
    builder = StateGraph(MessagesState)
    builder.add_node("model_node", model_node)
    builder.add_node("tool_node", tool_node)
    builder.set_entry_point("model_node")
    builder.add_edge("tool_node", "model_node")
    return builder.compile()


async def main():
    graph = create_graph()

    result = await graph.ainvoke(
        {"messages":
            [
                {"role": "user", "content": "今天广州天气怎么样？"}
            ]
        }
    )

    result["messages"][-1].pretty_print()


if __name__ == '__main__':
    asyncio.run(main())

```

# 子图

LangGraph子图（Subgraph）是一种模块化的图结构，允许您将复杂的工作流分解为更小的、可重用的组件。就像函数在编程中的作用一样，子图提供了封装和复用的能力。

## 子图的优势

1. **代码复用**：避免重复编写相同的逻辑
2. **清晰的架构**：将复杂流程分解为清晰的模块
3. **易于维护**：修改子图只需在一个地方进行
4. **团队协作**：不同团队可以独立开发不同的子图
5. **测试友好**：可以单独测试子图的功能

## 两种状态通讯

**共享状态键（Shared State Keys）**

父图和子图在其状态模式中有共享的状态键。在这种情况下，您可以将子图作为节点包含在父图中。

``` python
from langgraph.graph import StateGraph, MessagesState

from settings import app_settings

llm = app_settings.get_qwen_client()


def create_sub(state_schema):
    def summarize_child_node(state: MessagesState) -> MessagesState:
        """对大模型的回答进行摘要总结"""
        # 获取大模型回答的内容进行摘要总结
        answer = state["messages"][-1].content
        summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
        response = llm.ainvoke(summary_prompt)
        return {"messages": state["messages"] + [response]}

    # 创建子图
    child = StateGraph(state_schema=state_schema)

    # 添加节点
    child.add_node("summarize_child_node", summarize_child_node)

    # 设置子图的入口节点
    child.set_entry_point("summarize_child_node")

    return child.compile()
# 关键点：父图通过将子图作为父图的节点，父图默认将当前状态传递给子图


def create_graph(child_node):
    def answer_parent_node(state: MessagesState) -> MessagesState:
        """使用大模型进行回答"""
        # 使用大模型进行回答
        answer = llm.ainvoke(state["messages"])
        return {"messages": state["messages"] + [answer]}

    # 创建父图
    parent = StateGraph(state_schema=MessagesState)

    # 添加节点
    parent.add_node("answer_parent_node", answer_parent_node)

    # 添加子图节点
    parent.add_node("child_node", child_node)

    # 添加边
    parent.add_edge("answer_parent_node", "child_node")

    # 设置父图的入口节点
    parent.set_entry_point("answer_parent_node")

    return parent.compile()


def main():
    # 创建子图
    graph_sub = create_sub(state_schema=MessagesState)

    # 创建父图
    graph = create_graph(graph_sub)

    # 测试
    input_state = {
        "messages": [{"role": "user", "content": "langgraph是什么？"}],
    }

    # 测试父图
    result = graph.invoke(input_state)

    for message in result['messages']:
        message.pretty_print()


if __name__ == '__main__':
    main()

```

关键点：父图通过将子图作为父图的节点，父图默认将当前状态传递给子图

```python
# 添加子图节点
parent.add_node("child_node", child_node)
```

**不同状态模式（Different State Schemas）**
父图和子图有不同的模式（状态模式中没有共享的状态键）。在这种情况下，您必须在父图的节点内部调用子图：这在父图和子图有不同状态模式且需要在调用子图前后转换状态时很有用。

```python
from langgraph.graph import StateGraph, MessagesState
from typing_extensions import TypedDict, Annotated
from langchain_core.messages import AnyMessage, RemoveMessage
from langgraph.graph.message import add_messages
from settings import app_settings

llm = app_settings.get_qwen_client()


# 创建子图
class SubgraphMessagesState(TypedDict):
    subgraph_messages: Annotated[list[AnyMessage], add_messages]


def subplot(state: SubgraphMessagesState) -> SubgraphMessagesState:
    # 获取大模型回答的内容进行摘要总结
    answer = state["subgraph_messages"][-1].content
    # 创建摘要总结提示
    summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
    # 使用大模型进行摘要总结
    response = llm.invoke(summary_prompt)
    # 将摘要总结添加到子图消息中
    return {"subgraph_messages": [response]}


summary_subgraph = (
    StateGraph(state_schema=SubgraphMessagesState)
    .add_node("subplot", subplot)
    .set_entry_point("subplot")
    .compile()
)


# 创建父图

def answer_node(state: MessagesState) -> MessagesState:
    # 使用大模型进行回答
    answer = llm.invoke(state["messages"])
    # 将大模型回答添加到父图消息中
    parent_messages = [*state["messages"], answer]
    # 将父图的消息传递给子图, 调用子图进行摘要总结
    summary_result = summary_subgraph.invoke({"subgraph_messages": parent_messages})
    # 获取摘要总结
    summary_message = summary_result["subgraph_messages"][-1]
    # 将大模型回答和摘要总结添加到父图消息中
    return {
        "messages": [answer, summary_message]
    }
    # return {
    #     "messages": [
    #         RemoveMessage(id=state["messages"][0].id),  # 删除第1条（用户消息）
    #         # RemoveMessage(id=answer.id),  # 删除第2条（原始回答）
    #         summary_message]
    # }


parent_graph = (
    StateGraph(state_schema=MessagesState)
    .add_node("answer_node", answer_node)
    .set_entry_point("answer_node")
    .compile()
)

# 测试输入
input_state = {
    "messages": [{"role": "user", "content": "langgraph是什么？"}],
}
result = parent_graph.invoke(input_state)
print("最终结果：")

for message in result["messages"]:
    message.pretty_print()

```

### 总结：

**小型项目或快速原型常用“添加子图作为节点（共享状态）”**，而**大型、生产级系统更倾向于“调用节点内的子图（状态转换）”**。

**补充：**

**共享状态：子图“融入”父图，父图可以把它当成一个节点来调度，所以整体看起来还是一张图。**

**不同状态：子图“独立”运行，父图只负责传入参数、接收结果，相当于调用一个独立的小流程，所以父图不会展开它内部的节点。**

**子图默认只能控制自己的内部节点。如果需要跳转到父图中的节点（包括进入另一个子图），需要使用** **`Command(graph=Command.PARENT)`** **将控制权提升到父图，由父图完成下一步路由。但不能直接跳转到另一个子图内部节点。**


# checkpointer检查点

# store长期记忆

# 多智能体

# stream流式输出

