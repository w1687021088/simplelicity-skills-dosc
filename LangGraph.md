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



![agent__009](/Users/zhangjiewu/Desktop/docs/image/agent__009.png)

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


# 多智能体

代理是一种使用 LLM 来决定应用程序控制流的系统。随着这些系统的开发，它们可能会随着时间的推移变得更加复杂，从而更难以管理和扩展。例如，您可能会遇到以下问题：
- 代理可以使用的工具太多，无法决定下一步调用哪个工具
- 环境变得过于复杂，单个代理无法跟踪
- 系统中需要多个专业领域（例如规划师、研究员、数学专家等）



为了解决这些问题，您可以考虑将应用程序拆分成多个较小的独立代理，并将它们组合成一个多代理系统。这些独立代理可以像提示符和 LLM 调用一样简单，也可以像ReAct代理一样复杂（甚至更多！）。

- 使用多代理系统的主要好处是：
- 模块化：独立的代理使得代理系统的开发、测试和维护变得更加容易。
- 专业化：您可以创建专注于特定领域的专家代理，这有助于提高整体系统性能。
- 控制：您可以明确控制代理如何通信。



![agent__010](./image/agent__010.png)

## 交接（Handoffs）

### 交接概念

在多智能体架构中，智能体可以表示为图节点。每个智能体节点执行其步骤，并决定是完成执行还是路由至其他智能体，包括可能路由至自身（例如，循环运行）。多智能体交互中一种常见的模式是**切换**，即一个智能体将控制权移交给另一个智能体

### 交接的关键要点

- 任务超出当前智能体能力范围
- 需要专业化处理
- 错误处理和重试机制
- 工作流程的自然转换点

### 工具进行交接（重点）



![agent__011](/Users/zhangjiewu/Desktop/docs/image/agent__011.png)

``` python
from typing import Literal

from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage, HumanMessage
from langgraph.types import Command
from langgraph.graph import MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from settings import app_settings

# 初始化大模型
llm = app_settings.get_qwen_client(temperature=0.7)


def make_handoff_tool(*, agent_name: str):
    """
    创建一个工具交接函数，用于在代理之间进行转接

    Args:
        agent_name (str): 目标代理的名称

    Returns:
        tool: 返回一个可以执行代理转接的工具函数
    """
    # 根据目标代理名称动态生成工具名称
    tool_name = f"transfer_to_{agent_name}"

    @tool(tool_name)
    def handoff_to_agent(
            runtime: ToolRuntime
    ):
        """请求另一个代理的帮助进行任务交接"""

        # 返回Command对象，用于导航到父图中的另一个代理节点
        return Command(
            # 导航到目标代理节点
            goto=agent_name,
            # 没有Command.PARENT只会在当前图中去找节点，加上Command.PARENT 就能够看到当前图的节点和父图的节点，然后就能跳转父图和自己的任何节点中
            graph="__parent__",
            # 更新状态：将完整的消息历史传递给目标代理，并添加工具消息
            # 这确保了聊天历史的完整性和有效性
            update={"messages": runtime.state["messages"] + [
                ToolMessage(name=tool_name, content=f"成功转接到 {agent_name} 代理，请开始进行乘法运算",
                            tool_call_id=runtime.tool_call_id)]},
        )

    return handoff_to_agent


def make_agent(model, tools, system_prompt=None):
    """
    创建一个智能代理，能够使用工具并在需要时进行代理转接

    Args:
        model: 语言模型实例
        tools: 代理可用的工具列表
        system_prompt: 系统提示词，定义代理的角色和行为

    Returns:
        compiled_graph: 编译后的代理图
    """
    # 将工具绑定到模型上
    model_with_tools = model.bind_tools(tools)

    # 创建工具节点
    tool_node = ToolNode(tools)

    def call_model(state: MessagesState) -> Command[Literal["call_tools", "__end__"]]:
        """
        调用语言模型生成响应

        Args:
            state: 当前消息状态

        Returns:
            Command: 如果需要调用工具则转到 call_tools，否则结束
        """
        messages = state["messages"]
        # 如果有系统提示词，将其添加到消息开头
        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        # 调用绑定了工具的模型
        response = model_with_tools.invoke(messages)

        # 检查模型是否决定使用工具
        if len(response.tool_calls) > 0:
            # 如果有工具调用，转到工具执行节点
            return Command(goto="call_tools", update={"messages": [response]})

        # 如果没有工具调用，直接返回响应消息
        return Command(update={"messages": [response]}, goto="__end__")

    # 构建代理的内部图结构
    graph = StateGraph(MessagesState)

    # 添加模型调用节点和工具调用节点
    graph.add_node("call_model", call_model)
    graph.add_node("call_tools", tool_node)

    # 设置图的边：从开始到模型调用，从工具调用回到模型调用
    graph.set_entry_point("call_model")

    # 添加从工具调用回到模型调用的边
    graph.add_edge("call_tools", "call_model")

    # 编译并返回图
    return graph.compile()


def pretty_print_stream(chunk):
    """
    流式输出美化工具
    """
    # StreamPart 对象包含三个核心属性
    # msg_type = chunk["type"]  # str: 'updates', 'metadata', 'values' 等
    # ns = chunk["ns"]  # tuple: 命名空间
    data = chunk["data"]  # Any: 更新的具体内容
    for node_name, node_update in data.items():
        # 1. 打印节点标题（区分是谁在干活）
        print(f"\n正在运行节点: [{node_name}]")
        print("-" * 30)

        # 2. 检查是否有消息更新
        if "messages" in node_update:
            for msg in node_update["messages"]:
                # --- 核心提取逻辑 ---

                # 如果是 AI 说的话
                if msg.type == "ai":
                    if msg.content:
                        print(f"AI: {msg.content.strip()}")
                    if msg.tool_calls:
                        for tc in msg.tool_calls:
                            print(f"[工具调用] 执行 {tc['name']}，参数: {tc['args']}")

                # 如果是工具返回的结果
                elif msg.type == "tool":
                    print(f"[工具结果] 得到: {msg.content}")

                # 如果是人类的输入
                elif msg.type == "human":
                    print(f"用户: {msg.content}")


# ============= 定义数学工具 =============

@tool
def add(a: int, b: int) -> int:
    """执行两个数字的加法运算"""
    result = a + b
    print(f"执行加法: {a} + {b} = {result}")
    return result


@tool
def multiply(a: int, b: int) -> int:
    """执行两个数字的乘法运算"""
    result = a * b
    print(f"执行乘法: {a} × {b} = {result}")
    return result


@tool
def subtract(a: int, b: int) -> int:
    """执行两个数字的减法运算"""
    result = a - b
    print(f"执行减法: {a} - {b} = {result}")
    return result


@tool
def divide(a: int, b: int) -> float:
    """执行两个数字的除法运算"""
    if b == 0:
        return "错误：不能除以零"
    result = a / b
    print(f"执行除法: {a} ÷ {b} = {result}")
    return result


# ============= 演示单个代理 =============

def demo_single_agent():
    """演示单个具有所有数学工具的代理"""
    print("=" * 60)
    print("演示：单个数学代理")
    print("=" * 60)

    # 创建一个拥有所有数学工具的代理
    math_agent = make_agent(
        llm,
        [add, multiply, subtract, divide],
        system_prompt="你是一个数学专家，可以执行各种数学运算。请一步步解决问题。"
    )

    print("问题: 计算 (3 + 5) × 12")
    print()

    # 运行代理并显示结果
    for chunk in math_agent.stream(
            {"messages": [HumanMessage(content="请计算 (3 + 5) × 12")]},
            version="v2",
            stream_mode="updates"
    ):
        pretty_print_stream(chunk)


# ============= 演示多代理协作 =============

def demo_multi_agent_collaboration():
    """演示多个专业代理之间的协作"""
    print("=" * 60)
    print("演示：多代理协作系统")
    print("=" * 60)

    transfer_to_addition_expert = make_handoff_tool(agent_name="addition_expert")

    transfer_to_multiplication_expert = make_handoff_tool(agent_name="multiplication_expert")

    # 创建加法专家代理
    addition_expert = make_agent(
        llm,
        [add, subtract, transfer_to_multiplication_expert],
        system_prompt="""你是加法和减法专家。你精通加法和减法运算，必须使用工具去计算加法。
            当你完成加法或减法运算后，如果后续还需要乘法或除法运算，
            请立即使用 transfer_to_multiplication_expert 工具转接给乘法专家。
            不要尝试自己完成乘法运算。"""
    )

    # 创建乘法专家代理
    multiplication_expert = make_agent(
        llm,
        [multiply, divide, transfer_to_addition_expert],
        system_prompt="""你是乘法和除法专家。你精通乘法和除法运算。
            当你接收到需要乘法运算的任务时，必须使用工具执行乘法运算。
            如果后续还需要加法或减法运算，请使用 transfer_to_addition_expert 工具转接给加法专家。
            当前任务：执行乘法运算并给出最终答案。"""
    )

    # 构建多代理协作图
    builder = StateGraph(MessagesState)

    # 添加两个专家代理节点
    builder.add_node("addition_expert", addition_expert)
    builder.add_node("multiplication_expert", multiplication_expert)

    # 设置入口点为加法专家
    builder.set_entry_point("addition_expert")

    # 编译协作图
    collaboration_graph = builder.compile()

    print("问题: 计算 (3 + 5) × 12")
    print("加法专家将处理加法，然后转接给乘法专家处理乘法")
    print()

    # 运行协作图并显示子图中的所有更新
    for chunk in collaboration_graph.stream(
            {"messages": [HumanMessage(content="请计算 (3 + 5) × 12")]},
            subgraphs=True,  # 包含子图更新
            version="v2",
            stream_mode="updates"
    ):
        pretty_print_stream(chunk)


# ============= 更复杂的协作示例 =============

def demo_complex_collaboration():
    """演示更复杂的多步骤协作"""
    print("=" * 60)
    print("演示：复杂多步协作")
    print("=" * 60)

    # 创建基础运算专家
    basic_math_expert = make_agent(
        llm,
        [add, subtract, make_handoff_tool(agent_name="advanced_math_expert")],
        system_prompt="""你是基础数学专家。你的唯一职责是执行“加法(add)”和“减法(subtract)”。
        执行逻辑规范：
        1. 观察算式，如果存在可以直接进行的加法或减法（尤其是括号内的），请立即调用工具计算。
        2. 严禁尝试口算，必须通过工具获得结果。
        3. 严禁执行乘法或除法。如果你发现当前步骤必须先进行乘除法才能继续，请立即转接给高级专家。
        4. 只要你刚刚完成了一步加/减法计算，请停下来观察剩下的算式：
           - 如果剩下的算式里还有你能算的加减法，继续算。
           - 如果剩下的部分只涉及乘除法，立即转接到 advanced_math_expert。
        不要道歉，不要解释，只负责计算或转接。"""
    )

    # 创建高级运算专家
    advanced_math_expert = make_agent(
        llm,
        [multiply, divide, make_handoff_tool(agent_name="basic_math_expert")],
        system_prompt="""你是高级数学专家。你的唯一职责是执行“乘法(multiply)”和“除法(divide)”。
        执行逻辑规范：
        1. 观察算式，如果你发现当前必须先执行加法或减法（例如括号内的内容尚未解出），请立即转接到 basic_math_expert。
        2. 如果当前步骤可以直接进行乘法或除法，请立即调用工具计算。
        3. 严禁尝试口算，必须通过工具获得结果。
        4. 只要你刚刚完成了一步乘/除法计算，请停下来观察剩下的算式：
           - 如果剩下的算式需要基础运算（加减），立即转接到 basic_math_expert。
           - 如果剩下的全是乘除，继续计算直到得出最终结果。
        你的目标是完成计算，但在遇到加减法时要坚决交接，不要自己通过“口算”来跳过步骤。"""
    )

    # 构建协作图
    builder = StateGraph(MessagesState)
    builder.add_node("basic_math_expert", basic_math_expert)
    builder.add_node("advanced_math_expert", advanced_math_expert)
    builder.set_entry_point("basic_math_expert")

    complex_graph = builder.compile()

    print("复杂问题: 计算 ((10 + 5) × 3 - 8) ÷ 2")
    print("将需要多次代理转接来完成计算")
    print()

    for chunk in complex_graph.stream(
            {"messages": [HumanMessage(content="请逐步计算 ((10 + 5) × 3 - 8) ÷ 2")]},
            subgraphs=True,
            version="v2",
            stream_mode="updates"
    ):
        pretty_print_stream(chunk)


# ============= 主程序入口 =============

def main():
    """主程序，运行所有演示"""
    print("LangGraph工具交接案例演示")
    print("展示单代理和多代理协作的数学计算系统")
    print()

    try:
        # 演示1：单个代理
        # demo_single_agent()

        # print("\n" + "-" * 20 + "\n")

        # 演示2：多代理协作
        demo_multi_agent_collaboration()

        # print("\n" + "-" * 20 + "\n")

        # # 演示3：复杂协作
        # demo_complex_collaboration()

    except Exception as e:
        print(f"运行出错: {e}")


if __name__ == "__main__":
    main()

```

交接模式采用子图作为父图的节点共享状态的方式，在当前子图无法实现的功能和能力之外将主动权移交给下一个子图处理；



## 如何构建多智能体应用

### 自定义主管架构（重点）

先根据主管将用户任务进行分解（多个子问题），在依次指定子智能体去执行任务列表，最后由主智能体总结回复

![agent__012](/Users/zhangjiewu/Desktop/docs/image/agent__012.png)



``` python
from typing import TypedDict, Literal
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command

from settings import app_settings

llm = app_settings.get_qwen_client(temperature=0.1)

# 知识库: 技术问题的解决方案映射
# Key: 问题关键词 (小写), Value: 解决方案
KNOWLEDGE_BASE = {
    "login": "请清除浏览器缓存并重新登录，或重置密码。",
    "payment": "请检查银行卡余额，确认交易状态，或联系银行。",
    "bug": "我们已记录此问题，技术团队将在24小时内处理。",
    "network": "请检查网络连接，或尝试切换网络环境。",
    "performance": "建议清理缓存、重启应用或检查系统资源使用情况。"
}

# 产品列表: 产品ID -> 产品信息
# 包含名称、价格、功能列表
PRODUCTS = {
    "basic": {"name": "基础版", "price": 99, "features": ["基础功能", "邮件支持"]},
    "pro": {"name": "专业版", "price": 299, "features": ["高级功能", "优先支持", "API访问"]},
    "enterprise": {"name": "企业版", "price": 999, "features": ["企业功能", "专属客服", "定制开发"]}
}

# 用户数据库: 用户ID -> 用户信息
# 包含套餐、状态、支持级别、余额
USER_DATABASE = {
    "user123": {"plan": "pro", "status": "active", "support_level": "premium", "balance": 500},
    "user456": {"plan": "basic", "status": "active", "support_level": "standard", "balance": 100}
}


# ==============================================================================
# 工具定义 (使用 @tool 装饰器)
# ==============================================================================

# ----------------------------------------------------------------------
# 技术支持工具 (tech_agent 使用)
# ----------------------------------------------------------------------

@tool
def search_knowledge_base(query: str) -> str:
    """
    搜索技术知识库，查找解决方案

    Args:
        query: 用户的问题描述

    Returns:
        str: 从知识库中找到的解决方案，或提示创建工单
    """
    print(f"[Tech] 搜索知识库: {query}")

    # 将查询转为小写进行匹配
    query_lower = query.lower()
    results = []

    # 遍历知识库，查找匹配的问题
    for issue, solution in KNOWLEDGE_BASE.items():
        if issue in query_lower:
            results.append(f"{issue}: {solution}")

    # 如果找到匹配项，返回所有解决方案
    if results:
        return "找到以下解决方案:\n" + "\n".join(results)

    # 未找到匹配，返回创建工单提示
    return "未在知识库中找到相关解决方案，建议创建技术工单进行人工处理。"


# ----------------------------------------------------------------------
# 技术支持工具: 创建工单 (tech_agent 使用)
# ----------------------------------------------------------------------

@tool
def create_support_ticket(issue_description: str, priority: str = "normal") -> str:
    """
    创建技术支持工单

    Args:
        issue_description: 问题描述
        priority: 优先级 (normal/high/urgent)

    Returns:
        str: 工单创建成功信息，包含工单ID
    """
    import uuid

    # 生成唯一工单ID: TICKET-XXXXXXXX 格式
    ticket_id = f"TICKET-{str(uuid.uuid4())[:8].upper()}"
    print(f"[Tech] 创建工单: {ticket_id}")

    return f"已创建支持工单: {ticket_id}\n问题描述: {issue_description}\n优先级: {priority}\n我们的技术团队将在24小时内处理您的问题。"


# ----------------------------------------------------------------------
# 销售工具: 获取产品信息 (sales_agent 使用)
# ----------------------------------------------------------------------

@tool
def get_product_info(product_query: str = "") -> str:
    """
    获取产品信息和价格

    Args:
        product_query: 产品查询词（可选），支持产品ID或名称

    Returns:
        str: 产品信息列表，包含价格和功能
    """
    print(f"[Sales] 查询产品: {product_query or '全部'}")

    # 如果没有指定查询词，返回所有产品
    if not product_query:
        result = "我们的产品线包括:\n\n"
        for key, product in PRODUCTS.items():
            result += f"**{product['name']}** - ¥{product['price']}/月\n"
            result += f"功能: {', '.join(product['features'])}\n\n"
        return result

    # 根据查询词查找匹配的产品
    query_lower = product_query.lower()
    for key, product in PRODUCTS.items():
        if key in query_lower or product["name"] in query_lower:
            return (
                f"**{product['name']}**\n"
                f"价格: ¥{product['price']}/月\n"
                f"功能: {', '.join(product['features'])}"
            )

    return f"未找到关于'{product_query}'的产品信息。请查看我们的完整产品列表。"


# ----------------------------------------------------------------------
# 销售工具: 计算升级费用 (sales_agent 使用)
# ----------------------------------------------------------------------

@tool
def calculate_upgrade_cost(current_plan: str, target_plan: str) -> str:
    """
    计算升级费用

    Args:
        current_plan: 当前套餐ID
        target_plan: 目标套餐ID

    Returns:
        str: 升级费用计算结果，包含新增功能列表
    """
    print(f"[Sales] 计算升级: {current_plan} -> {target_plan}")

    # 验证套餐ID有效性
    if current_plan not in PRODUCTS or target_plan not in PRODUCTS:
        return "无效的套餐类型。请检查套餐名称。"

    # 获取当前和目标套餐的价格
    current_price = PRODUCTS[current_plan]["price"]
    target_price = PRODUCTS[target_plan]["price"]

    # 如果目标价格不高于当前价格，无需升级费用
    if target_price <= current_price:
        return (
            f"目标套餐 ({PRODUCTS[target_plan]['name']}) "
            f"价格不高于当前套餐 ({PRODUCTS[current_plan]['name']})，无需升级费用。"
        )

    # 计算升级费用
    upgrade_cost = target_price - current_price

    # 计算新增功能
    new_features = set(PRODUCTS[target_plan]["features"]) - set(PRODUCTS[current_plan]["features"])

    return (
        f"升级费用计算:\n"
        f"当前套餐: {PRODUCTS[current_plan]['name']} (¥{current_price}/月)\n"
        f"目标套餐: {PRODUCTS[target_plan]['name']} (¥{target_price}/月)\n"
        f"升级费用: ¥{upgrade_cost}/月\n\n"
        f"新增功能: {', '.join(new_features)}"
    )


# ----------------------------------------------------------------------
# 管理工具: 查询账户信息 (admin_agent 使用)
# ----------------------------------------------------------------------

@tool
def get_user_account_info(user_id: str) -> str:
    """
    查询用户账户信息

    Args:
        user_id: 用户ID

    Returns:
        str: 用户账户详细信息
    """
    print(f"[Admin] 查询账户: {user_id}")

    # 验证用户ID是否提供
    if not user_id:
        return "请提供您的用户ID以查询账户信息。"

    # 从数据库查找用户
    if user_id in USER_DATABASE:
        user_info = USER_DATABASE[user_id]
        return (
            f"账户信息:\n"
            f"用户ID: {user_id}\n"
            f"当前套餐: {user_info['plan']}\n"
            f"账户状态: {user_info['status']}\n"
            f"支持级别: {user_info['support_level']}\n"
            f"账户余额: ¥{user_info['balance']}"
        )

    return f"未找到用户ID '{user_id}' 的账户信息。"


# ----------------------------------------------------------------------
# 管理工具: 处理退款请求 (admin_agent 使用)
# ----------------------------------------------------------------------

@tool
def process_refund_request(user_id: str, reason: str) -> str:
    """
    处理退款请求

    Args:
        user_id: 用户ID
        reason: 退款原因

    Returns:
        str: 退款申请结果
    """
    print(f"[Admin] 处理退款: {user_id}")

    # 验证用户ID有效性
    if not user_id or user_id not in USER_DATABASE:
        return "请提供有效的用户ID以处理退款请求。"

    user_info = USER_DATABASE[user_id]

    # 检查账户状态
    if user_info["status"] != "active":
        return "只有活跃账户才能申请退款。"

    # 计算退款金额（按月费计算）
    refund_amount = PRODUCTS[user_info["plan"]]["price"]

    return (
        f"退款申请已提交:\n"
        f"用户ID: {user_id}\n"
        f"退款原因: {reason}\n"
        f"退款金额: ¥{refund_amount}\n"
        f"处理时间: 3-5个工作日\n"
        f"退款将原路返回到您的支付账户。"
    )


# ==============================================================================
# 创建子图 (每个子Agent一个子图)
# ==============================================================================

# ----------------------------------------------------------------------
# 子图1: 技术支持 Agent
# 负责处理: 报错、bug、故障、登录问题、网络问题等
# ----------------------------------------------------------------------

def create_tech_agent_subgraph():
    """
    创建技术支持Agent子图

    子图结构:
        START -> tech_model -> (tools_condition) -> tech_tools -> tech_model -> END
                                    |
                                    v
                                   END (无工具调用时)

    工具:
        - search_knowledge_base: 搜索知识库
        - create_support_ticket: 创建工单

    Returns:
        Compiled graph: 编译后的子图，可被主图调用
    """

    # 定义该子图使用的工具列表
    tech_tools = [search_knowledge_base, create_support_ticket]

    # 定义 LLM 调用节点
    # 功能: 调用 LLM，让 LLM 决定是否需要调用工具
    def tech_model_node(state: MessagesState):
        """
        技术Agent的模型节点

        Args:
            state: 包含消息历史的状态

        Returns:
            dict: 更新后的状态，包含 LLM 响应
        """
        print("[Tech] LLM 决策...")

        # 系统提示词：指导 LLM 如何使用工具
        system_message = SystemMessage(content="""
        你是技术支持助手，专注解决技术问题。

        **工作流程**：
        1. 优先调用 search_knowledge_base 查找已知解决方案。
        2. 若知识库有答案 → 直接回复用户。
        3. 若知识库无答案 → 调用 create_support_ticket 创建工单，并告知用户工单 ID 和预计响应时间。

        **职责边界**：
        - ✅ 报错、Bug、登录失败、网络问题、性能问题
        - ❌ 价格咨询、账户余额、退款申请

        **交互原则**：
        - 回答简洁明了，直接给解决方案，不重复用户问题。
        - 若用户询问非职责内容，统一回复：“关于【账户/余额/退款】问题，我会转交相关同事处理。” 随后继续技术支持。
        """)
        # 使用系统提示词 + 用户消息
        messages = [system_message] + state["messages"]
        ai_message = llm.bind_tools(tech_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="tech_tools" if ai_message.tool_calls else "__end__",
        )

    # 创建状态图
    builder = StateGraph(MessagesState)

    # 添加节点:
    # 1. tech_model: LLM 决策节点
    # 2. tech_tools: 工具执行节点 (由 ToolNode 自动处理工具调用)
    builder.add_node("tech_model", tech_model_node)
    builder.add_node("tech_tools", ToolNode(tech_tools))

    # 添加边:
    # 1. START -> tech_model: 起点到 LLM 节点
    builder.set_entry_point("tech_model")

    # 3. tech_tools -> tech_model: 工具执行完后返回 LLM 形成循环
    builder.add_edge("tech_tools", "tech_model")

    return builder.compile()


# ----------------------------------------------------------------------
# 子图2: 销售 Agent
# 负责处理: 价格咨询、套餐升级、产品信息、购买咨询等
# ----------------------------------------------------------------------

def create_sales_agent_subgraph():
    """
    创建销售Agent子图

    工具:
        - get_product_info: 获取产品信息
        - calculate_upgrade_cost: 计算升级费用

    子图结构与 Tech Agent 相同
    """
    sales_tools = [get_product_info, calculate_upgrade_cost]

    def sales_model_node(state: MessagesState):
        print("[Sales] LLM 决策...")
        # 添加专业的销售系统提示词
        system_message = SystemMessage(content="""
        你是销售顾问，专注产品销售与方案推荐。

        **可用工具**：
        - get_product_info：获取产品功能、价格
        - calculate_upgrade_cost：计算套餐升级费用

        **职责边界**：
        - ✅ 产品介绍、价格咨询、套餐推荐、促销活动
        - ❌ 账户余额、退款、技术故障

        **交互原则**：
        - 先了解用户需求，再推荐合适产品，诚实专业不夸大。
        - 若用户询问非职责内容，统一回复：“关于【账户/余额/退款/技术】问题，我会转交相关同事处理。” 随后继续销售咨询。
        """)

        # 将系统消息添加到消息列表（放在最前面）
        messages = [system_message] + state["messages"]

        ai_message = llm.bind_tools(sales_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="sales_tools" if ai_message.tool_calls else "__end__",
        )

    builder = StateGraph(MessagesState)
    builder.add_node("sales_model", sales_model_node)
    builder.add_node("sales_tools", ToolNode(sales_tools))
    builder.set_entry_point("sales_model")
    builder.add_edge("sales_tools", "sales_model")

    return builder.compile()


# ----------------------------------------------------------------------
# 子图3: 客户管理 Agent
# 负责处理: 余额查询、账户信息、退款申请等
# ----------------------------------------------------------------------

def create_admin_agent_subgraph():
    """
    创建客户管理Agent子图

    工具:
        - get_user_account_info: 查询账户信息
        - process_refund_request: 处理退款

    子图结构与 Tech Agent 相同
    """
    admin_tools = [get_user_account_info, process_refund_request]

    def admin_model_node(state: MessagesState):
        print("[Admin] LLM 决策...")
        # 添加系统提示，明确市场功能
        system_message = SystemMessage(content="""
        你是账户管理助手，仅处理账户与支付相关事务。

        **可用工具**：
        - get_user_account_info：查询余额、账户状态
        - process_refund_request：处理退款申请

        **职责边界**：
        - ✅ 账户信息查询、余额、退款
        - ❌ 产品介绍、价格咨询、技术问题、升级费用

        **交互原则**：
        - 先确认用户需求，再调用工具，一次性提供清晰结果。
        - 若用户询问非职责内容，统一回复：“关于【产品/技术】问题，我会转交相关同事处理。” 随后继续处理账户问题。
        """)

        # 将系统消息添加到消息列表
        messages = [system_message] + state["messages"]

        ai_message = llm.bind_tools(admin_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="admin_tools" if ai_message.tool_calls else "__end__",
        )

    builder = StateGraph(MessagesState)
    builder.add_node("admin_model", admin_model_node)
    builder.add_node("admin_tools", ToolNode(admin_tools))

    builder.set_entry_point("admin_model")
    builder.add_edge("admin_tools", "admin_model")

    return builder.compile()


def supervisor_graph():
    """
    创建主管Graph - 协调所有子Agent的任务

    复杂问题示例: "我想了解专业版的价格，另外查一下我的余额"
    - 涉及: 销售问题(价格) + 管理问题(余额)
    - 需要循环调用: supervisor -> sales -> supervisor -> admin -> supervisor -> END

    主管状态 (SupervisorState):
        - messages: 消息列表 (从 MessagesState 继承)
        - pending_tasks: 待处理任务队列 ['tech', 'sales', 'admin']
        - completed_tasks: 已完成任务列表
        - current_agent: 当前正在执行的 Agent

    Returns:
        Compiled graph: 编译后的主管图
    """

    # 定义主管状态类型
    # 继承 MessagesState，获得 messages 通道和 add_messages reducer

    class SupervisorState(MessagesState):
        """
        主管状态: 包含消息和任务追踪信息

        Attributes:
            current: 当前执行的 Agent 名称
            pending: 待处理的任务队列 (关键！用于循环协调)
            completed: 已完成的任务列表
            next: 下一个要执行的 Agent 名称（由 supervisor_node 设置）
        """
        current: str
        pending: list[str]
        completed: list[str]
        next: str | None

    tech_subgraph = create_tech_agent_subgraph()
    sales_subgraph = create_sales_agent_subgraph()
    admin_subgraph = create_admin_agent_subgraph()

    def supervisor_node(state: SupervisorState) -> Command[
        Literal["tech_agent", "sales_agent", "admin_agent", "__end__"]]:
        """
        主管节点 - 负责任务识别和分配

        工作流程:
            1. 如果有待处理任务(pending)，取出第一个任务执行
            2. 如果没有待处理任务（首次），使用 LLM 做意图识别
            3. 将所有识别的任务填入 pending（除第一个外）
            4. 返回第一个任务名称

        关键改进: 使用 LLM 做意图识别，不再用关键词匹配

        Args:
            state: 当前状态

        Returns:
            Command[
        Literal["tech_agent", "sales_agent", "admin_agent", "__end__"]]: 状态更新，包含 pending 和 next
        """
        # 待处理的任务队列
        pending = state.get("pending", [])
        # 已完成的任务队列
        # completed = state.get("completed", [])
        # 当前消息列表
        messages = state["messages"]
        # 最后一条消息
        last_msg = messages[-1] if messages else None

        print(pending)

        # ========== 情况1: 还有待处理任务，从队列取第一个执行 ==========
        if pending:
            return Command(
                update={
                    "pending": pending[1:],
                    "next": pending[0]  # 标记下一个要执行的 Agent
                },
                goto=pending[0]
            )

        # ========== 情况2: 没有待处理任务，使用提示词做 LLM 意图识别 ==========
        if isinstance(last_msg, HumanMessage):
            # 结构化输出，指定输出格式为 OutputRouting
            with_llm = llm.with_structured_output(schema=OutputRouting)
            # 调用 LLM 获取意图识别结果
            response = with_llm.invoke(routing_prompt(last_msg.content))

            # 解析 LLM 返回的 Agent 列表
            new_tasks = response.get("new_tasks", [])

            print(new_tasks)

            if new_tasks:
                print(f"[Supervisor] LLM 识别到任务: {new_tasks}")
                new_task = new_tasks[0]
                goto_node = new_task if new_task in ["tech_agent", "sales_agent", "admin_agent"] else None
                if goto_node is not None:
                    return Command(
                        update={"pending": new_tasks[1:], "next": goto_node},
                        goto=goto_node,
                    )
                else:
                    return Command(
                        update={"pending": [], "next": None},
                        goto="__end__",
                    )

        # ========== 情况3: 没有新任务 ==========
        print("\n[Supervisor] 所有任务已完成，结束对话")
        return Command(
            update={"pending": [], "next": None, },
            goto="__end__",
        )

    def tech_agent_node(state: SupervisorState) -> dict:
        """
        技术支持节点 - 处理技术问题

        Args:
            state: 当前状态

        Returns:
            dict: 状态更新
        """
        pending = state.get("pending", [])
        # print("sales pending:", pending)

        completed = state.get("completed", [])
        # print("sales completed:", completed)

        result = tech_subgraph.invoke({"messages": state["messages"]})

        return {
            "pending": pending,
            "completed": [*completed, "tech_agent"],
            # "messages": [AIMessage(content="技术问题已处理，24内相关技术人员处理完毕后联系")]
            "messages": result["messages"],
        }

    def sales_agent_node(state: SupervisorState) -> dict:
        """
        调用销售子Agent

        执行流程与 call_tech_agent 相同
        """
        pending = state.get("pending", [])
        # print("sales pending:", pending)

        completed = state.get("completed", [])
        # print("sales completed:", completed)

        result = sales_subgraph.invoke({"messages": state["messages"]})
        return {
            "pending": pending,
            "completed": [*completed, "sales_agent"],
            "messages": result["messages"],
        }

    def admin_agent_node(state: SupervisorState) -> dict:
        """
        调用客户管理子Agent

        执行流程与 call_tech_agent 相同
        """
        pending = state.get("pending", [])
        # print("admin pending:", pending)

        completed = state.get("completed", [])
        # print("admin completed:", completed)
        result = admin_subgraph.invoke({"messages": state["messages"]})
        return {
            "pending": pending,
            "completed": [*completed, "admin_agent"],
            "messages": result["messages"],
        }

    # 创建主管图
    builder = StateGraph(state_schema=SupervisorState)

    # 添加所有节点
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("tech_agent", tech_agent_node)
    builder.add_node("sales_agent", sales_agent_node)
    builder.add_node("admin_agent", admin_agent_node)

    builder.set_entry_point("supervisor")

    builder.add_edge("tech_agent", "supervisor")
    builder.add_edge("sales_agent", "supervisor")
    builder.add_edge("admin_agent", "supervisor")

    return builder.compile()


class OutputRouting(TypedDict):
    new_tasks: list[str]


# 意图识别提示词
def routing_prompt(content):
    return f"""你是意图识别专家。根据用户消息，判断需调用的 Agent 类型，并按处理顺序返回 Agent 名称列表（最多3个）。

**Agent 类型**：
- tech_agent：技术支持（报错、bug、故障、登录/网络/性能问题、技术咨询等）
- sales_agent：销售服务（价格、套餐、产品信息、购买咨询、升级费用等）
- admin_agent：账户管理（余额查询、账户信息、退款申请、账户状态等）

**决策原则**：
1. 若用户问题涉及多个领域，按“先诊断后处理”或“先咨询后操作”的顺序排列。
2. 若问题明显属于单一领域，只返回该 Agent。
3. 若无法确定，优先选择最相关的 Agent，避免过度调用。

用户消息：{content}

请直接返回 Agent 名称列表（Python 字符串列表格式），例如：["tech_agent", "sales_agent"]。"""


def examples():
    """
    运行测试示例

    测试场景:
        1. 技术问题: 登录 + 报错
        2. 销售问题: 产品价格咨询
        3. 管理问题: 账户余额查询
        4. 混合问题(循环协调): 价格 + 余额查询 - 需要多次循环协调
    """

    # 定义测试用例
    test_cases = [
        # {"message": "我的应用登录有问题，显示error 500"},
        # {"message": "我想了解专业版的价格"},
        # {"message": "查询一下我的余额，用户ID是user123"},
        {
            "message": "我的应用登录有问题，显示error 500，另外我想了解专业版的价格。我的用户ID是user123帮我查询一下我的余额"},
        # 复杂多任务
    ]

    graph = supervisor_graph()

    initial_state = {
        "messages": [
            HumanMessage(content=test_cases[0].get("message", ""))
        ],
        "current": "supervisor",
        "pending": [],
        "completed": [],
        "next": None
    }

    result = graph.invoke(initial_state)
    print()
    print()
    print()
    print()
    print()
    print('////////' * 10)
    for msg in result["messages"]:
        msg.pretty_print()


if __name__ == '__main__':
    examples()

```



#### Send并发

``` python
from typing import TypedDict, Literal, Annotated
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, AnyMessage
from langgraph.graph import MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, Send
from operator import add

from settings import app_settings

llm = app_settings.get_qwen_client(temperature=0.1)

# 知识库: 技术问题的解决方案映射
# Key: 问题关键词 (小写), Value: 解决方案
KNOWLEDGE_BASE = {
    "login": "请清除浏览器缓存并重新登录，或重置密码。",
    "payment": "请检查银行卡余额，确认交易状态，或联系银行。",
    "bug": "我们已记录此问题，技术团队将在24小时内处理。",
    "network": "请检查网络连接，或尝试切换网络环境。",
    "performance": "建议清理缓存、重启应用或检查系统资源使用情况。"
}

# 产品列表: 产品ID -> 产品信息
# 包含名称、价格、功能列表
PRODUCTS = {
    "basic": {"name": "基础版", "price": 99, "features": ["基础功能", "邮件支持"]},
    "pro": {"name": "专业版", "price": 299, "features": ["高级功能", "优先支持", "API访问"]},
    "enterprise": {"name": "企业版", "price": 999, "features": ["企业功能", "专属客服", "定制开发"]}
}

# 用户数据库: 用户ID -> 用户信息
# 包含套餐、状态、支持级别、余额
USER_DATABASE = {
    "user123": {"plan": "pro", "status": "active", "support_level": "premium", "balance": 500},
    "user456": {"plan": "basic", "status": "active", "support_level": "standard", "balance": 100}
}


# ==============================================================================
# 工具定义 (使用 @tool 装饰器)
# ==============================================================================

# ----------------------------------------------------------------------
# 技术支持工具 (tech_agent 使用)
# ----------------------------------------------------------------------

@tool
def search_knowledge_base(query: str) -> str:
    """
    搜索技术知识库，查找解决方案

    Args:
        query: 用户的问题描述

    Returns:
        str: 从知识库中找到的解决方案，或提示创建工单
    """
    print(f"[Tech] 搜索知识库: {query}")

    # 将查询转为小写进行匹配
    query_lower = query.lower()
    results = []

    # 遍历知识库，查找匹配的问题
    for issue, solution in KNOWLEDGE_BASE.items():
        if issue in query_lower:
            results.append(f"{issue}: {solution}")

    # 如果找到匹配项，返回所有解决方案
    if results:
        return "找到以下解决方案:\n" + "\n".join(results)

    # 未找到匹配，返回创建工单提示
    return "未在知识库中找到相关解决方案，建议创建技术工单进行人工处理。"


# ----------------------------------------------------------------------
# 技术支持工具: 创建工单 (tech_agent 使用)
# ----------------------------------------------------------------------

@tool
def create_support_ticket(issue_description: str, priority: str = "normal") -> str:
    """
    创建技术支持工单

    Args:
        issue_description: 问题描述
        priority: 优先级 (normal/high/urgent)

    Returns:
        str: 工单创建成功信息，包含工单ID
    """
    import uuid

    # 生成唯一工单ID: TICKET-XXXXXXXX 格式
    ticket_id = f"TICKET-{str(uuid.uuid4())[:8].upper()}"
    print(f"[Tech] 创建工单: {ticket_id}")

    return f"已创建支持工单: {ticket_id}\n问题描述: {issue_description}\n优先级: {priority}\n我们的技术团队将在24小时内处理您的问题。"


# ----------------------------------------------------------------------
# 销售工具: 获取产品信息 (sales_agent 使用)
# ----------------------------------------------------------------------

@tool
def get_product_info(product_query: str = "") -> str:
    """
    获取产品信息和价格

    Args:
        product_query: 产品查询词（可选），支持产品ID或名称

    Returns:
        str: 产品信息列表，包含价格和功能
    """
    print(f"[Sales] 查询产品: {product_query or '全部'}")

    # 如果没有指定查询词，返回所有产品
    if not product_query:
        result = "我们的产品线包括:\n\n"
        for key, product in PRODUCTS.items():
            result += f"**{product['name']}** - ¥{product['price']}/月\n"
            result += f"功能: {', '.join(product['features'])}\n\n"
        return result

    # 根据查询词查找匹配的产品
    query_lower = product_query.lower()
    for key, product in PRODUCTS.items():
        if key in query_lower or product["name"] in query_lower:
            return (
                f"**{product['name']}**\n"
                f"价格: ¥{product['price']}/月\n"
                f"功能: {', '.join(product['features'])}"
            )

    return f"未找到关于'{product_query}'的产品信息。请查看我们的完整产品列表。"


# ----------------------------------------------------------------------
# 销售工具: 计算升级费用 (sales_agent 使用)
# ----------------------------------------------------------------------

@tool
def calculate_upgrade_cost(current_plan: str, target_plan: str) -> str:
    """
    计算升级费用

    Args:
        current_plan: 当前套餐ID
        target_plan: 目标套餐ID

    Returns:
        str: 升级费用计算结果，包含新增功能列表
    """
    print(f"[Sales] 计算升级: {current_plan} -> {target_plan}")

    # 验证套餐ID有效性
    if current_plan not in PRODUCTS or target_plan not in PRODUCTS:
        return "无效的套餐类型。请检查套餐名称。"

    # 获取当前和目标套餐的价格
    current_price = PRODUCTS[current_plan]["price"]
    target_price = PRODUCTS[target_plan]["price"]

    # 如果目标价格不高于当前价格，无需升级费用
    if target_price <= current_price:
        return (
            f"目标套餐 ({PRODUCTS[target_plan]['name']}) "
            f"价格不高于当前套餐 ({PRODUCTS[current_plan]['name']})，无需升级费用。"
        )

    # 计算升级费用
    upgrade_cost = target_price - current_price

    # 计算新增功能
    new_features = set(PRODUCTS[target_plan]["features"]) - set(PRODUCTS[current_plan]["features"])

    return (
        f"升级费用计算:\n"
        f"当前套餐: {PRODUCTS[current_plan]['name']} (¥{current_price}/月)\n"
        f"目标套餐: {PRODUCTS[target_plan]['name']} (¥{target_price}/月)\n"
        f"升级费用: ¥{upgrade_cost}/月\n\n"
        f"新增功能: {', '.join(new_features)}"
    )


# ----------------------------------------------------------------------
# 管理工具: 查询账户信息 (admin_agent 使用)
# ----------------------------------------------------------------------

@tool
def get_user_account_info(user_id: str) -> str:
    """
    查询用户账户信息

    Args:
        user_id: 用户ID

    Returns:
        str: 用户账户详细信息
    """
    print(f"[Admin] 查询账户: {user_id}")

    # 验证用户ID是否提供
    if not user_id:
        return "请提供您的用户ID以查询账户信息。"

    # 从数据库查找用户
    if user_id in USER_DATABASE:
        user_info = USER_DATABASE[user_id]
        return (
            f"账户信息:\n"
            f"用户ID: {user_id}\n"
            f"当前套餐: {user_info['plan']}\n"
            f"账户状态: {user_info['status']}\n"
            f"支持级别: {user_info['support_level']}\n"
            f"账户余额: ¥{user_info['balance']}"
        )

    return f"未找到用户ID '{user_id}' 的账户信息。"


# ----------------------------------------------------------------------
# 管理工具: 处理退款请求 (admin_agent 使用)
# ----------------------------------------------------------------------

@tool
def process_refund_request(user_id: str, reason: str) -> str:
    """
    处理退款请求

    Args:
        user_id: 用户ID
        reason: 退款原因

    Returns:
        str: 退款申请结果
    """
    print(f"[Admin] 处理退款: {user_id}")

    # 验证用户ID有效性
    if not user_id or user_id not in USER_DATABASE:
        return "请提供有效的用户ID以处理退款请求。"

    user_info = USER_DATABASE[user_id]

    # 检查账户状态
    if user_info["status"] != "active":
        return "只有活跃账户才能申请退款。"

    # 计算退款金额（按月费计算）
    refund_amount = PRODUCTS[user_info["plan"]]["price"]

    return (
        f"退款申请已提交:\n"
        f"用户ID: {user_id}\n"
        f"退款原因: {reason}\n"
        f"退款金额: ¥{refund_amount}\n"
        f"处理时间: 3-5个工作日\n"
        f"退款将原路返回到您的支付账户。"
    )


# ==============================================================================
# 创建子图 (每个子Agent一个子图)
# ==============================================================================

# ----------------------------------------------------------------------
# 子图1: 技术支持 Agent
# 负责处理: 报错、bug、故障、登录问题、网络问题等
# ----------------------------------------------------------------------

def create_tech_agent_subgraph():
    """
    创建技术支持Agent子图

    子图结构:
        START -> tech_model -> (tools_condition) -> tech_tools -> tech_model -> END
                                    |
                                    v
                                   END (无工具调用时)

    工具:
        - search_knowledge_base: 搜索知识库
        - create_support_ticket: 创建工单

    Returns:
        Compiled graph: 编译后的子图，可被主图调用
    """

    # 定义该子图使用的工具列表
    tech_tools = [search_knowledge_base, create_support_ticket]

    # 定义 LLM 调用节点
    # 功能: 调用 LLM，让 LLM 决定是否需要调用工具
    def tech_model_node(state: MessagesState):
        """
        技术Agent的模型节点

        Args:
            state: 包含消息历史的状态

        Returns:
            dict: 更新后的状态，包含 LLM 响应
        """
        print("[Tech] LLM 决策...")

        # 系统提示词：指导 LLM 如何使用工具
        system_message = SystemMessage(content="""
        你是技术支持助手，专注解决技术问题。

        **工作流程**：
        1. 优先调用 search_knowledge_base 查找已知解决方案。
        2. 若知识库有答案 → 直接回复用户。
        3. 若知识库无答案 → 调用 create_support_ticket 创建工单，并告知用户工单 ID 和预计响应时间。

        **职责边界**：
        - ✅ 报错、Bug、登录失败、网络问题、性能问题
        - ❌ 价格咨询、账户余额、退款申请

        **交互原则**：
        - 回答简洁明了，直接给解决方案，不重复用户问题。
        - 若用户询问非职责内容，统一回复：“关于【账户/余额/退款】问题，我会转交相关同事处理。” 随后继续技术支持。
        """)
        # 使用系统提示词 + 用户消息
        messages = [system_message] + state["messages"]
        ai_message = llm.bind_tools(tech_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="tech_tools" if ai_message.tool_calls else "__end__",
        )

    # 创建状态图
    builder = StateGraph(MessagesState)

    # 添加节点:
    # 1. tech_model: LLM 决策节点
    # 2. tech_tools: 工具执行节点 (由 ToolNode 自动处理工具调用)
    builder.add_node("tech_model", tech_model_node)
    builder.add_node("tech_tools", ToolNode(tech_tools))

    # 添加边:
    # 1. START -> tech_model: 起点到 LLM 节点
    builder.set_entry_point("tech_model")

    # 3. tech_tools -> tech_model: 工具执行完后返回 LLM 形成循环
    builder.add_edge("tech_tools", "tech_model")

    return builder.compile()


# ----------------------------------------------------------------------
# 子图2: 销售 Agent
# 负责处理: 价格咨询、套餐升级、产品信息、购买咨询等
# ----------------------------------------------------------------------

def create_sales_agent_subgraph():
    """
    创建销售Agent子图

    工具:
        - get_product_info: 获取产品信息
        - calculate_upgrade_cost: 计算升级费用

    子图结构与 Tech Agent 相同
    """
    sales_tools = [get_product_info, calculate_upgrade_cost]

    def sales_model_node(state: MessagesState):
        print("[Sales] LLM 决策...")
        # 添加专业的销售系统提示词
        system_message = SystemMessage(content="""
        你是销售顾问，专注产品销售与方案推荐。

        **可用工具**：
        - get_product_info：获取产品功能、价格
        - calculate_upgrade_cost：计算套餐升级费用

        **职责边界**：
        - ✅ 产品介绍、价格咨询、套餐推荐、促销活动
        - ❌ 账户余额、退款、技术故障

        **交互原则**：
        - 先了解用户需求，再推荐合适产品，诚实专业不夸大。
        - 若用户询问非职责内容，统一回复：“关于【账户/余额/退款/技术】问题，我会转交相关同事处理。” 随后继续销售咨询。
        """)

        # 将系统消息添加到消息列表（放在最前面）
        messages = [system_message] + state["messages"]

        ai_message = llm.bind_tools(sales_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="sales_tools" if ai_message.tool_calls else "__end__",
        )

    builder = StateGraph(MessagesState)
    builder.add_node("sales_model", sales_model_node)
    builder.add_node("sales_tools", ToolNode(sales_tools))
    builder.set_entry_point("sales_model")
    builder.add_edge("sales_tools", "sales_model")

    return builder.compile()


# ----------------------------------------------------------------------
# 子图3: 客户管理 Agent
# 负责处理: 余额查询、账户信息、退款申请等
# ----------------------------------------------------------------------

def create_admin_agent_subgraph():
    """
    创建客户管理Agent子图

    工具:
        - get_user_account_info: 查询账户信息
        - process_refund_request: 处理退款

    子图结构与 Tech Agent 相同
    """
    admin_tools = [get_user_account_info, process_refund_request]

    def admin_model_node(state: MessagesState):
        print("[Admin] LLM 决策...")
        # 添加系统提示，明确市场功能
        system_message = SystemMessage(content="""
        你是账户管理助手，仅处理账户与支付相关事务。

        **可用工具**：
        - get_user_account_info：查询余额、账户状态
        - process_refund_request：处理退款申请

        **职责边界**：
        - ✅ 账户信息查询、余额、退款
        - ❌ 产品介绍、价格咨询、技术问题、升级费用

        **交互原则**：
        - 先确认用户需求，再调用工具，一次性提供清晰结果。
        - 若用户询问非职责内容，统一回复：“关于【产品/技术】问题，我会转交相关同事处理。” 随后继续处理账户问题。
        """)

        # 将系统消息添加到消息列表
        messages = [system_message] + state["messages"]

        ai_message = llm.bind_tools(admin_tools).invoke(messages)
        return Command(
            update={"messages": [ai_message]},
            goto="admin_tools" if ai_message.tool_calls else "__end__",
        )

    builder = StateGraph(MessagesState)
    builder.add_node("admin_model", admin_model_node)
    builder.add_node("admin_tools", ToolNode(admin_tools))

    builder.set_entry_point("admin_model")
    builder.add_edge("admin_tools", "admin_model")

    return builder.compile()


def supervisor_graph():
    """
    创建主管Graph - 协调所有子Agent的任务

    复杂问题示例: "我想了解专业版的价格，另外查一下我的余额"
    - 涉及: 销售问题(价格) + 管理问题(余额)
    - 需要循环调用: supervisor -> sales -> supervisor -> admin -> supervisor -> END

    主管状态 (SupervisorState):
        - messages: 消息列表 (从 MessagesState 继承)
        - pending_tasks: 待处理任务队列 ['tech', 'sales', 'admin']
        - completed_tasks: 已完成任务列表
        - current_agent: 当前正在执行的 Agent

    Returns:
        Compiled graph: 编译后的主管图
    """

    # 定义主管状态类型
    # 继承 MessagesState，获得 messages 通道和 add_messages reducer

    class SupervisorState(MessagesState):
        """
        主管状态: 包含消息和任务追踪信息

        Attributes:
            tasks: 任务队列
            completed_tasks: 已完成的任务列表
        """
        tasks: list[str]
        completed_tasks: Annotated[list[str], add]

    tech_subgraph = create_tech_agent_subgraph()
    sales_subgraph = create_sales_agent_subgraph()
    admin_subgraph = create_admin_agent_subgraph()

    class WorkerState(TypedDict):
        task: str

    def supervisor_node(state: SupervisorState) -> Command[
        Literal["tech_agent", "sales_agent", "admin_agent", "__end__"]]:

        # 获取任务队列和已完成任务列表
        tasks = state.get("tasks", [])
        # 获取已完成任务列表
        completed_tasks = state.get("completed_tasks", [])
        # 获取最后一条消息
        last_msg = state["messages"][-1] if state["messages"] else None

        # 首次用户输入（HumanMessage）→ 识别并并发分发
        if isinstance(last_msg, HumanMessage):
            with_llm = llm.with_structured_output(schema=OutputRouting)
            response = with_llm.invoke(routing_prompt(last_msg.content))
            new_tasks = response.get("tasks", {})
            if new_tasks:
                # 并发启动所有子 Agent
                return Command(
                    update={"tasks": list(new_tasks.keys())},
                    goto=[
                        Send(node_name, WorkerState(task=task_content))
                        for node_name, task_content in new_tasks.items()
                    ]
                )
            else:
                # 无任务直接结束
                return Command(goto="__end__")

        # 子 Agent 完成后的回调
        # 检查是否所有任务已完成
        if tasks and set(completed_tasks) == set(tasks):
            # 全部完成 → 生成摘要并结束
            summary_content = llm.invoke(summarize_conversation(state["messages"])).content
            return Command(
                update={
                    "messages": [*state["messages"], AIMessage(content=summary_content)],
                    "tasks": [],
                    "completed_tasks": [],
                },
                goto="__end__"
            )
        else:
            # 还有未完成的任务，直接结束当前分支（主管等待其他分支）
            return Command(goto="__end__")

    def summarize_conversation(messages: list[AnyMessage]) -> str:
        """
        将 LangGraph 消息列表转换为可读性高的对话摘要
        """
        # 1. 构建结构化文本
        lines = []
        for msg in messages:
            if msg.type == "human":
                lines.append(f"用户: {msg.content}")
            elif msg.type == "ai":
                # 如果有工具调用，显示调用内容
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        lines.append(f"AI调用工具 {tc['name']}，参数: {tc['args']}")
                else:
                    # 普通回复
                    lines.append(f"AI: {msg.content}")
            elif msg.type == "tool":
                # 工具返回结果
                lines.append(f"工具 {msg.name} 返回: {msg.content}")
            else:
                # 其他类型（system等）忽略或保留
                pass

        chat_history = "\n".join(lines)

        # 2. 调用 LLM 生成简洁摘要
        prompt = f"""请总结以下对话的核心问题、处理过程和最终结果，用 200 字以内概括：

    {chat_history}

    摘要："""
        summary = llm.invoke(prompt).content
        return summary

    def tech_agent_node(state: WorkerState) -> dict:
        """
        技术支持节点 - 处理技术问题

        Args:
            state: 当前状态

        Returns:
            dict: 状态更新
        """

        task = state.get("task")

        print(state, 'state')

        result = tech_subgraph.invoke({"messages": [HumanMessage(content=task)]})

        return {
            "messages": result["messages"],
            "completed_tasks": ["tech_agent"],
        }

    def sales_agent_node(state: WorkerState) -> dict:
        """
        调用销售子Agent

        执行流程与 call_tech_agent 相同
        """
        print(state, 'state')
        task = state.get("task")
        result = sales_subgraph.invoke({"messages": [HumanMessage(content=task)]})
        return {
            "messages": result["messages"],
            # "messages": [AIMessage(content="销售问题已处理，24内相关销售人员处理完毕后联系")],
            "completed_tasks": ["sales_agent"],
        }

    def admin_agent_node(state: WorkerState) -> dict:
        """
        调用客户管理子Agent

        执行流程与 call_tech_agent 相同
        """
        print(state, 'state')
        task = state.get("task")
        result = admin_subgraph.invoke({"messages": [HumanMessage(content=task)]})
        return {
            "messages": result["messages"],
            # "messages": [AIMessage(content="账户问题已处理，24内相关客服人员处理完毕后联系")],
            "completed_tasks": ["admin_agent"],
        }

    # 创建主管图
    builder = StateGraph(state_schema=SupervisorState)

    # 添加所有节点
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("tech_agent", tech_agent_node)
    builder.add_node("sales_agent", sales_agent_node)
    builder.add_node("admin_agent", admin_agent_node)

    builder.set_entry_point("supervisor")

    builder.add_edge("tech_agent", "supervisor")
    builder.add_edge("sales_agent", "supervisor")
    builder.add_edge("admin_agent", "supervisor")

    return builder.compile()


class OutputRouting(TypedDict):
    tasks: dict[str, str]


def routing_prompt(content):
    return f"""你是意图识别专家。根据用户消息，判断需调用的 Agent 类型，并将用户问题拆解，为每个 Agent 分配相应的任务描述。

**Agent 类型**：
- tech_agent：技术支持（报错、bug、故障、登录/网络/性能问题、技术咨询等）
- sales_agent：销售服务（价格、套餐、产品信息、购买咨询、升级费用等）
- admin_agent：账户管理（余额查询、账户信息、退款申请、账户状态等）

**决策原则**：
1. 若用户问题涉及多个领域，需将问题拆解为对应 Agent 的子任务，并为每个 Agent 分配具体的处理内容（如：将“登录报错且想升级套餐”拆为 tech_agent 和 sales_agent 各自的任务）。
2. 若问题明显属于单一领域，只返回一个 Agent 及其任务。
3. 若无法确定，优先选择最相关的 Agent，避免过度调用。
4. 每个 Agent 的任务描述应清晰、具体，包含用户原始问题的关键信息。

**输出格式**：请返回一个 JSON 对象，键为 Agent 名称（字符串），值为该 Agent 需要处理的问题描述（字符串）。最多包含 3 个键值对。

示例：
用户消息："我登录不了系统，而且我想了解升级套餐的费用。"
输出：{{"tech_agent": "用户无法登录系统，需要排查登录问题", "sales_agent": "用户咨询套餐升级费用"}}

用户消息：{content}

请直接返回 JSON 对象，不要有其他内容。"""


def examples():
    """
    运行测试示例

    测试场景:
        1. 技术问题: 登录 + 报错
        2. 销售问题: 产品价格咨询
        3. 管理问题: 账户余额查询
        4. 混合问题(循环协调): 价格 + 余额查询 - 需要多次循环协调
    """

    # 定义测试用例
    test_cases = [
        # {"message": "我的应用登录有问题，显示error 500"},
        # {"message": "我想了解专业版的价格"},
        # {"message": "查询一下我的余额，用户ID是user123"},
        {
            "message": "我的应用登录有问题，显示error 500，另外我想了解专业版的价格。我的用户ID是user123帮我查询一下我的余额"},
        # 复杂多任务
    ]

    graph = supervisor_graph()

    initial_state = {
        "messages": [
            HumanMessage(content=test_cases[0].get("message", ""))
        ],
        "tasks": [],
        "completed_tasks": [],
    }

    result = graph.invoke(initial_state)
    print()
    print()
    print()
    print()
    print()
    print('////////' * 10)
    for msg in result["messages"]:
        msg.pretty_print()


if __name__ == '__main__':
    examples()

```



### 小结

节点可以通过 **Command** 切换节点；

``` python
def node_01(state):
    return Command(
				goto="", # 切换下一个节点
      	graph="", # 没有Command.PARENT只会在当前图中去找节点，加上Command.PARENT 就能够看到当前图的节点和父图的节点，然后就能跳转父图和自己的任何节点中
      	update={} # 更新状态，这里可以用来更新 messages， 以及其他的状态
    )
  
```

工具可以集成为工具节点；

``` python
@tool
def tool_01(runtime: ToolRuntime):
		return "xxxx"

tools = [tool_01, ...其他的工具]
   
model_with_tools = model.bind_tools(tools)  # 将工具绑定到模型上

tool_node = ToolNode(tools) # langgraph 提供的能力，将工具当成节点

graph.add_node("call_tools", tool_node) # 当成节点
```

工具不仅是返回本身工具返回的能力，也可以通过  **Command** 额外的修改流程上的能力；

``` python
# 返回Command对象，用于导航到父图中的另一个代理节点
return Command(
    # 导航到目标代理节点
    goto=agent_name,
    # 没有Command.PARENT只会在当前图中去找节点，加上Command.PARENT 就能够看到当前图的节点和父图的节点，然后就能跳转父图和自己的任何节点中
    graph="__parent__",
    # 更新状态：将完整的消息历史传递给目标代理，并添加工具消息
    # 这确保了聊天历史的完整性和有效性
    update={"messages": runtime.state["messages"] + [
        ToolMessage(name=tool_name, content=f"成功转接到 {agent_name} 代理，请开始进行乘法运算",
                    tool_call_id=runtime.tool_call_id)]},
)
```

一般建议工具处理额外的能力的时候补充上 **ToolMessage**消息，确保聊天历史的完整性和有效性；



子图消息可以不共享，也可以继承父图的消息（形成流程上的共享状态）；

``` python
parent_graph.add_node("child_graph", child_graph) # 默认情况下 child_graph 节点的状态就是继承父图的


# 子图通过被父图当前节点执行的话，默认子图的节点状态就是继承自父图
def child_graph_node(state: ParentState) -> ParentState:
```

子图通过当成节点的方式，交给父图，默认子图的状态就是接受父图的；如果通过 **send** 并发的方式由 **send** 额外传递；

``` python
# 父图节点
def parent_graph_node(state: ParentState) -> ParentState:
		# 逻辑
    # 或者大模型思考决策后需要调用子图
    return [Send(worker_key, WorkerState(number=num)) for num in numbers]
```

当然也可以配合  **Command**

``` python
# 父图节点
def parent_graph_node(state: ParentState) -> ParentState:
		# 逻辑
    # 或者大模型思考决策后需要调用子图
    return Command(
      goto=[Send(worker_key, WorkerState(number=num)) for num in numbers],
      update={} # 期间也可以更新其他状态
    ) 
```

**工具进行交接**的特点就是依赖工具切换子图的方式实现；

**自定义主管架构**中特点就是，主管节点负责责任务识别和分配（使用 LLM 做意图识别）；子图当前节点由主管节点执行并在最后交回到主管节点总结汇总；

状态的管理可以是由共享的，也可以不共享，建议不共享保证子图的干净利索；

最常见的方式就是父图-子图过程中通过一个中间的节点来承接：

``` python
def middle_node(state:ParentState) -> ParentState:
		result = child_graph.invoke(message) # 在这里调用子图
    return {"messages": [result["messages"]]} # 子图返回的内容是否需要加入到父图的状态中，具体看情况，一般加入会保证聊天历史的完整性和有效性
	
```

工具可以修改状态，可以通过  Command 命令修改节点跳转；

节点可以是函数，工具，也可以是图；



# checkpointer检查点

检查点（Checkpointing）是 LangGraph 持久性的核心机制。它允许你在图执行过程中的任何点保存状态，并在需要时恢复。

**核心概念**
- 检查点(Checkpoint): 图状态的快照
- 线程(Thread): 用于访问检查点的唯一标识
- 检查点保存器(Checkpointer): 负责保存和恢复状态的组件

## 线程(Threads)
线程是检查点保存器保存的每个检查点分配的唯一 ID 或线程标识符
当使用检查点调用图表时，必须指定thread_id作为configurable配置部分的一部分：

```python
# 调用图时必须指定 thread_id
config = {"configurable": {"thread_id": "unique_thread_id"}} # thread_id 必须唯一
result = graph.invoke(input_data, config=config)
```

**特点**
- 每个线程代表一个独立的对话或执行上下文
- 线程允许在图执行后访问图的状态
- 支持多个并发线程

## LangGraph 中检查点的作用

| 🌟 容错恢复                  | 如果执行中断（如容器崩溃、任务超时），可以从上次保存的状态恢复，不用重跑整个流程 |
| --------------------------- | ------------------------------------------------------------ |
| 💾 状态追踪/审计             | 可以记录每一步节点执行时的中间状态，方便 Debug、回溯和监控   |
| 🔁 实现有状态的异步/长流程图 | 对于多轮对话、多阶段任务，检查点使 LangGraph 支持状态持久化和任务跟踪 |


## 本质理解

LangGraph 中的图是围绕 **`State`** **状态对象** 构建的：

> 每个节点执行时会读取当前State，并返回State的局部更新，这些更新会被合并到全局State中。

所谓的“检查点”就是：

> **在某个节点运行后，把当时的** **`State`** **存起来**（比如存到数据库或磁盘）

然后如果下次因为任何原因中断或重新运行，只需：

> **加载上次的检查点状态** **`State`****，重新进入图流程**



# replay重放机制
![agent__013](./image/agent__013.png)



## 更新对应状态（分叉）

使用 graph.update_state() 方法编辑图状态。
更新状态（Update State）就是手动修改某个 Checkpoint 对应的状态数据。它不会删除原来的历史，而是基于这个状态创建一个新的 Checkpoint。你可以修改消息、工具结果以及其他 State 字段。更新完成后，可以从这个新状态继续执行后续节点。这是实现人工介入、调试和纠错的重要机制。


1. **config**
- 必须包含 thread_id 指定要更新的线程
- 可选包含 checkpoint_id 来分叉选定的检查点
2. **values**
- 用于更新状态的值
- 更新会传递给 reducer 函数（如果定义了）
- 没有 reducer 的通道会被覆盖
3. **as_node**
- 可选参数，指定更新来自哪个节点
- 影响下一步执行的节点


**例子：**
```python
from operator import add
from typing import TypedDict, Annotated
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import InMemorySaver
import random

from langgraph.graph.state import CompiledStateGraph
from langgraph.types import StateSnapshot


class State(TypedDict):
    node_1: str
    node_2: str
    node_3: str
    node_4: str
    question: str
    comments: Annotated[list, add]  # 评论


def node_1(_: State):
    return {
        "node_1": f"节点 1-{random.randint(100, 999)}",
        "comments": [f"节点 1-{random.randint(100, 999)}"]
    }


def node_2(_: State):
    return {
        "node_2": f"节点 2-{random.randint(100, 999)}",
        "comments": [f"节点 2-{random.randint(100, 999)}"]
    }


def node_3(_: State):
    return {
        "node_3": f"节点 3-{random.randint(100, 999)}",
        "comments": [f"节点 3-{random.randint(100, 999)}"]
    }


def node_4(_: State):
    return {
        "node_4": f"节点 4-{random.randint(100, 999)}",
        "comments": [f"节点 4-{random.randint(100, 999)}"]

    }


def create_graph(checkpointer: InMemorySaver) -> CompiledStateGraph[State]:  # type: ignore
    builder = StateGraph(State)

    # 添加节点
    builder.add_node(
        "node_1",
        node_1
    )

    builder.add_node(
        "node_2",
        node_2
    )

    builder.add_node(
        "node_3",
        node_3
    )

    builder.add_node(
        "node_4",
        node_4
    )

    # ============================================================
    # 10. 定义 Graph 流程
    # ============================================================

    builder.add_edge(
        "node_1",
        "node_2"
    )

    builder.add_edge(
        "node_2",
        "node_3"
    )

    builder.add_edge(
        "node_3",
        "node_4"
    )

    builder.set_entry_point("node_1")

    graph = builder.compile(
        checkpointer=checkpointer
    )

    return graph


# 获取 State 历史
def state_history(graph: CompiledStateGraph, config: RunnableConfig) -> list[StateSnapshot]:
    return list(
        graph.get_state_history(config)
    )


# 获取 Replay 起点
def get_replay_checkpoint(next_node_name: str, history: list[StateSnapshot]):
    replay_checkpoint = None # 重放检查点
    for checkpoint in history:
        if checkpoint.next == (next_node_name,): # 下个节点名称
            replay_checkpoint = checkpoint
            break

    if replay_checkpoint is None:
        raise RuntimeError(
            f"没有找到节点 {next_node_name} 执行前的 Checkpoint"
        )

    return replay_checkpoint


# 分叉
def fork_main():
    checkpointer = InMemorySaver()
    # 定义配置
    config: RunnableConfig = {
        "configurable": {
            "thread_id": "replay-demo-001"
        }
    }
    # 创建 Graph
    graph = create_graph(checkpointer=checkpointer)

    # 执行 Graph
    result = graph.invoke(
        {
            "question": "LangGraph 的 Replay 机制是什么？"
        },
        config=config
    )


    # 获取 State 历史
    history = state_history(graph, config)
    replay_checkpoint = get_replay_checkpoint(next_node_name="node_2", history=history)

    print("\n\n")
    print("#" * 70)
    print("获取 node_2 重放")
    print("#" * 70)
    print("\nconfig 配置:")
    print(
        replay_checkpoint.config)  # {'configurable': {'thread_id': 'replay-demo-001', 'checkpoint_ns': '', 'checkpoint_id': '1f1a075a-40c6-6a86-8001-96a14b89e275'}}
    print("\nparent_config 上个 checkpoint 配置，上个节点执行完后的:")
    print(
        replay_checkpoint.parent_config)  # {'configurable': {'thread_id': 'replay-demo-001', 'checkpoint_ns': '', 'checkpoint_id': '1f1a075a-40c5-6c4e-8000-556b85dc1574'}}
    print("\nstate 状态:")
    print(replay_checkpoint.values)  # {'node_1': '节点 1-215', 'question': 'LangGraph 的 Replay 机制是什么？'}
    print("\nnext 下个节点，是个元组:")
    print(replay_checkpoint.next)  # ('node_2',)
    print("\ntasks 任务列表:")
    print(
        replay_checkpoint.tasks)  # (PregelTask(id='c3dc8bab-b2ac-52d7-00a5-1392cc4fbe67', name='node_2', path=('__pregel_pull', 'node_2'), error=None, interrupts=(), state=None, result={'node_2': '节点 2-183'}),)
    print("\nmetadata 元数据:")
    print(replay_checkpoint.metadata)  # {'source': 'loop', 'step': 1, 'parents': {}}
    print("\ncreated_at 创建时间:")
    print(replay_checkpoint.created_at)  # '2026-08-25T11:13:09.941173+00:00'
    print("\ninterrupts 中断列表:")
    print(replay_checkpoint.interrupts)  # ()

    print("\n\n")
    print("#" * 70)
    print("开始 Replay")
    print("#" * 70)

    fork_config = graph.update_state(
        config=replay_checkpoint.config,
        values={
            # 修改 comments
            "comments": ["更新插入'comments'"],
            # 覆盖节点 1 的结果
            # "node_1": "节点 1-999",
            # 覆盖 node_2 的结果是不行的，检查点是从 node_2 开始重放；因为 values 先设置，node_2 重放会覆盖 values
            # 如果重放node_2，并且同时需要修改的话，开启 as_node 指定 node_2，代表 node_2 不再执行
            # "node_2": "节点 2-999"
        },
        as_node=None  # as_node - 可选参数，指定更新来自哪个节点, - 影响下一步执行的节点;
    )

    final_result = graph.invoke(None, fork_config)

    print("\n\n")
    print("#" * 70)
    print("第一次执行完成")
    print("#" * 70)
    print(result["node_1"])
    print(result["node_2"])
    print(result["node_3"])
    print(result["node_4"])
    print(result["comments"])

    print("\n\n")
    print("#" * 70)
    print("重放完成")
    print("#" * 70)
    print(final_result["node_1"], "与第一次执行结果相同")
    print(final_result["node_2"], "这里开始重放")
    print(final_result["node_3"])
    print(final_result["node_4"])
    print(final_result["comments"])


if __name__ == '__main__':
    fork_main()
```

获取当前会话的检查点历史记录通过**get_state_history**：

```python
# 获取 State 历史
def state_history(graph: CompiledStateGraph, config: RunnableConfig) -> list[StateSnapshot]:
    return list(
        graph.get_state_history(config)
    )
```

恢复节点：
```python
# 获取 State 历史
history = state_history(graph, config)

# 获取 Replay 起点
def get_replay_checkpoint(next_node_name: str, history: list[StateSnapshot]):
    replay_checkpoint = None # 重放检查点
    for checkpoint in history:
        if checkpoint.next == (next_node_name,): # 下个节点名称
            replay_checkpoint = checkpoint
            break

    if replay_checkpoint is None:
        raise RuntimeError(
            f"没有找到节点 {next_node_name} 执行前的 Checkpoint"
        )

    return replay_checkpoint
```

及时多轮对话后，节点有多次执行记录，取最近的一次执行记录；

采用后进先出的原则，取最新的一次执行记录

```python
# 执行 Graph
result = graph.invoke(
    {
        "question": "LangGraph 的 Replay 机制是什么？ 第一轮"
    },
    config=config
)

result = graph.invoke(
    {
        "question": "LangGraph 的 Replay 机制是什么？ 第二轮"
    },
    config=config
)

history = state_history(graph, config)
for checkpoint in history:
    print(checkpoint.next)
    print()

#目标是 ('node_2',) 重放

# ()
# 
# ('node_4',)
# 
# ('node_3',)
# 
# ('node_2',) 取这一次
# 
# ('node_1',)
# 
# ('__start__',)
# 
# ()
# 
# ('node_4',)
# 
# ('node_3',)
# 
# ('node_2',)
# 
# ('node_1',)
# 
# ('__start__',)
```

重放之后再次检查历史记录
```python
print("\n\n")
print("#" * 70)
print("历史检查点")
print("#" * 70)
history = state_history(graph, config)
for checkpoint in history:
    print(checkpoint.next)
    print()


# ######################################################################
# 历史检查点
# ######################################################################
# ()
# 
# ('node_4',)
# 
# ('node_3',)
# 
# ('node_2',)
# 
# ()
# 
# ('node_4',)
# 
# ('node_3',)
# 
# ('node_2',)
# 
# ('node_1',)
# 
# ('__start__',)
# 
# ()
# 
# ('node_4',)
# 
# ('node_3',)
# 
# ('node_2',)
# 
# ('node_1',)
# 
# ('__start__',)
```
**重放之后的节点会把之前的节点状态数据进行替换掉，注意不是替换检查点，检查点是追加。**

记住检查点会被**追加** **追加** **追加**


**总结：**
1. 不带状态更新的重放，获取到对应检查点后，会先获取该检查点进行之后节点的执行
2. 带状态更新的重放，会在原有节点的基础上，开辟一条新分支，继续执行剩下的节点
本质区别：**update_state** 就是带状态更新的重放;

推荐使用 **update_state** 来进行重放；


# store长期记忆

Store 主要是存储用户画像【用户的行为习惯，用户的爱好、用户相关的一些重要的功能】
langgraph中对应store的介绍，就是为了跨会话知道之前用户的信息

**Store 接口**
- 检查点保存器单独无法跨线程共享信息
- Store 接口解决了这个问题
- 可以在所有聊天对话中保留用户特定信息



# 记忆存储


$|RmK'w#


# stream流式输出





# interrupt 人机交互

