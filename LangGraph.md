# LangGraph

**LangGraph** 是由 **LangChain** 团队推出的一个开源框架，用于构建**复杂、可控、有状态（Stateful）的 AI Agent（智能体）工作流**
。它的核心思想是：**用图（Graph）来组织 AI 的执行流程，而不是简单的线性调用。**

![image-20260915094236533](./image/agent__014.png)

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

![agent__006](./image/agent__006.png)

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

![agent__007](./image/agent__007.png)

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

![image-20260916094232393](./image/agent__008.png)

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



![agent__009](./image/agent__009.png)

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



![agent__011](./image/agent__011.png)

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

![agent__012](./image/agent__012.png)



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



**通过内存方式**(开发快速验证)

``` python
from langgraph.store.memory import InMemoryStore
```





**namespace 命名空间**

命名空间用于标记 store

推荐用 `(user_id, "preferences")` 或 `(user_id, "profile")` 这样的元组来隔离每个用户的偏好。同一个用户的不同类型记忆放在不同 namespace 下，互不干扰。



``` python
namespace_for_memory = ("user_id", "memories")
```



**key 键**

默认用 `str(uuid.uuid4())` 就够。如果你需要**按固定 key 精确读取**（比如用 `store.get(namespace, "user_profile")` 直接获取用户档案），才用有语义的 key。否则 UUID 更省心，不需要操心冲突。

``` python
import uuid

memory_id_key = str(uuid.uuid4())
```



**value  值（任意值）**



``` python
memory_1 = {
    "hobby": "我的爱好是：篮球、音乐、美食、编程..."
}

```



### 基础用法

每种内存类型都是一个具有特定属性的 Python 类（**Item**）。我们可以通过上述转换将其作为字典访问`.dict`。它具有以下属性：

- `value`：此内存的值（本身就是一个字典）
- `key`：此命名空间中此内存的唯一键
- `namespace`：字符串元组，此内存类型的命名空间
- `created_at`：此内存创建的时间戳
- `updated_at`：此内存更新的时间戳

### 查询

``` python
value = store.get(namespace, key)

print(value) # Item
```

### 添加

``` python
store.put(namespace, key, val) 

store.put(namespace, key, val, ttl=1)  # 可以设置过期时间，分钟
```

**注意 InMemoryStore 不支持设置 ttl**



### 修改

``` python
store.put(
        namespace,
        key,                        # 用查到的 key
        {"food": "sushi"}                # 新内容
    )
```

put 默认会检查是否存在，不存在则设置，存在则替换；



### 删除

``` python
store.delete(namespace, key)
```



### **按 namespace 批量删除**

``` python
store.delete(namespace)
```



### 查询

``` python
items = store.search(namespace) 
```

- **query**: （语义检索）：匹配的是你通过 `index` 配置嵌入的 `value` 字段。

- **filter**: 是对 `value` 字典里任意字段做**精确的结构化过滤**，不涉及向量计算。

  初始化 Store 时，通过 `index` 参数告诉它要把 `value` 里的哪些内容转成向量。

  可以指定只嵌入特定字段，比如 fields: ["text"]，那么语义搜索就只基于这个 text 字段的内容进行匹配。

  ``` python
  store.put(
      namespace=("user_123", "memories"),  # 命名空间，不参与嵌入
      key="mem-001",                       # 键，不参与嵌入
      value={                              # 值，嵌入的候选源
          "text": "用户偏好深色模式",       # 如果 fields=["text"]，嵌入这个
          "confidence": 0.9,               # 不会被嵌入（如果只嵌 text）
          "category": "preference"         # 不会被嵌入（如果只嵌 text）
      }
  )
  ```

  当配置 `fields=["text"]` 时，Store 只会把 `"用户偏好深色模式"` 这句话转成向量。后续你用 `query="UI 设置"` 去搜，语义匹配的是 `text` 字段的内容，而不是 `confidence` 或 `category`。

- **limit**: 限制取值数量
- **offset** 在返回结果之前要跳过的项目数量。
- **refresh_ttl** 是否刷新返回项目的 TTL。如果未指定 TTL，则忽略此参数。



## 语义搜索

通过设置 **index**，语义化检索；

``` python
import uuid

from langgraph.store.memory import InMemoryStore
from settings import app_settings

embedding = app_settings.bailian_openai_embedding_client()

store = InMemoryStore(
    index={
        "embed": embedding, # 向量模型
        "dims": 1024, # 向量的维度
        "fields": [ # 告诉向量数据库哪些字段需要嵌入
            "hobby",
        ]
    }
)

namespace = ("user_id", "memories")

key = str(uuid.uuid4())

value = {
    "hobby": "我的爱好是：篮球、音乐、美食、编程..."
}

store.put(namespace, key, value)

print(f"✓ 存储 hobby 记忆: {key}")

print("\n搜索: 用户的爱好有哪些？")
memories = store.search(
    namespace,
    query="用户的爱好有哪些？",
    limit=3
)
print(f"搜索结果数量: {len(memories)}")
if memories:
    print(f"最相关结果: {memories[0].dict()}")
else:
    print("没有找到结果")
```

- **embed** 向量模型

- **dims** 向量的维度

- **fields** 告诉向量数据库哪些字段需要嵌入



### 建议用 Store 存偏好

**它就是为“跨会话记忆”设计的**
Store 的核心定位就是“跨 thread 长期记忆”，存储用户偏好、事实、积累的知识，这些数据应该在一个会话结束后依然存在，并在下一个会话中能被读取 。你用表存虽然也能实现，但 Store 的 `namespace + key` 模型天然适配这种“按用户隔离、按类型分组”的需求。



**语义检索是“内置能力”，不是“额外工程”**
Store 配置好 Embedding 后，`store.search(namespace, query="用户喜欢吃什么")` 直接返回结果 。用表存的话，你得自己接入向量库、写相似度查询、把结果拼回上下文，工作量不小。



**开发效率和一致性**
LangGraph 的节点函数里，通过 `Runtime` 对象可以直接访问 `store`，记忆的读写和图执行生命周期绑定，不需要额外管理数据库连接和事务 。用表存则需要自己处理连接池、事务、以及“什么时候读、什么时候写”的逻辑。



### 什么时候可以不用 Store

如果你的偏好存储**极其简单**：比如只有“主题颜色”“语言”这种固定 key-value，不需要语义搜索，也不需要跨会话的复杂召回，那你用自己的表（甚至 Redis）完全够用。Store 的价值在于它把“语义检索 + 命名空间隔离 + 图集成”打包好了，如果你不需要这些，用表更轻。



### 建议

**用 Store。** 已经在做 LangGraph 项目，偏好存储和 Agent 的“记忆”能力是同一套体系。用 Store 能让你在后续加 RAG、加多 Agent 共享记忆时，不用重新造轮子。



### langgraph中使用

``` python
import uuid
from dataclasses import dataclass
from operator import add
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph

from settings import app_settings

from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.runtime import Runtime
from langgraph.store.memory import InMemoryStore

llm = app_settings.get_qwen_client()


# 定义状态结构
class MessagesState(TypedDict):
    messages: Annotated[list[BaseMessage], add]


@dataclass
class MyContext:
    user_id: str



# 创建检查点保存器和内存存储
checkpointer = InMemorySaver()
in_memory_store = InMemoryStore()


# 聊天机器人节点  *代表后面的参数必须使用显示写出参数名称  store=in_memory_store
def chatbot(state: MessagesState, runtime: Runtime[MyContext]): # type: ignore
    """主聊天机器人节点，处理用户消息并生成回复"""

    # 获取用户ID和最新消息
    user_id = runtime.context.user_id
    last_message = state["messages"][-1]

    # 定义内存命名空间
    namespace = (user_id, "memories")

    # 简单的聊天逻辑
    user_input = last_message.content.lower()
    # 将用户的长期记忆获取并组装提示词    获取所有记忆
    memories = runtime.store.search(namespace)
    memory_text = "\n".join(m.value["memory"] for m in memories)
    prompt = f"请参考聊天记录：{memory_text}\n\nHuman: {user_input}\nAI:"

    response = llm.invoke(prompt).content

    # 存储对应的问题和答案     一般用LLM去帮你确认是否要存储当前这次对话
    memory = f"问题：{user_input} --- 答案:{response}"
    memory_id = str(uuid.uuid4())
    runtime.store.put(namespace, memory_id, {"memory": memory})
    # 返回AI消息
    return {"messages": [AIMessage(content=response)]}



# 创建图
def create_persistent_graph():
    """创建持久化的聊天机器人图"""

    # 创建状态图
    workflow = StateGraph(MessagesState, context_schema=MyContext)
    # 添加节点
    workflow.add_node("chatbot", chatbot)
    # 添加边
    workflow.add_edge("__start__", "chatbot")
    workflow.add_edge("chatbot", "__end__")

    # 编译图，使用检查点保存器和存储
    graph = workflow.compile(checkpointer=checkpointer, store=in_memory_store)

    return graph



# 工具函数：显示状态历史
def show_state_history(graph, config):
    """显示状态历史"""
    print("\n=== 状态历史 ===")
    history = graph.get_state_history(config)
    for i, snapshot in enumerate(history):
        print(f"\n步骤 {i}:")
        print(f"  配置: {snapshot.config}")
        print(f"  值: {snapshot.values}")
        print(f"  下一步: {snapshot.next}")
        print(f"  元数据: {snapshot.metadata}")



# 工具函数：显示存储的记忆
def show_memories(store, user_id):
    """显示用户的所有记忆"""
    print(f"\n=== 用户 {user_id} 的记忆 ===")
    namespace = (user_id, "memories")
    memories = store.search(namespace)

    if memories:
        for memory in memories:
            print(f"记忆ID: {memory.key}")
            print(f"内容: {memory.value}")
            print(f"创建时间: {memory.created_at}")
            print(f"更新时间: {memory.updated_at}")
            print("---")
    else:
        print("没有找到记忆")



# 主程序
def main():
    # 创建图
    graph = create_persistent_graph()

    # 用户配置
    user_id = "user_123"
    thread_id = "conversation_1"

    config = {
        "configurable": {
            "thread_id": thread_id,
            "user_id": user_id
        }
    }

    print("=== LangGraph 持久化聊天机器人 ===")
    print("输入 'quit' 退出，'history' 查看状态历史，'memories' 查看记忆")

    while True:
        user_input = input("\n用户: ").strip()

        if user_input.lower() == 'quit':
            break
        elif user_input.lower() == 'history':
            show_state_history(graph, config)
            continue
        elif user_input.lower() == 'memories':
            show_memories(in_memory_store, user_id)
            continue

        # 创建用户消息
        initial_state = {
            "messages": [HumanMessage(content=user_input)]
        }

        # 运行图
        try:
            result = graph.invoke(initial_state, config, context=MyContext(user_id))

            # 显示AI回复
            ai_message = result["messages"][-1]
            print(f"AI: {ai_message.content}")

        except Exception as e:
            print(f"错误: {e}")

    print("\n=== 最终状态 ===")
    final_state = graph.get_state(config)
    print(f"最终状态: {final_state.values}")

    print("\n=== 所有记忆 ===")
    show_memories(in_memory_store, user_id)


# 演示不同线程间的记忆共享
def demo_cross_thread_memory():
    """演示跨线程记忆共享"""
    print("\n=== 跨线程记忆共享演示 ===")

    graph = create_persistent_graph()
    user_id = "user_456"

    # 第一个对话线程
    config1 = {
        "configurable": {
            "thread_id": "thread_1",
            "user_id": user_id
        }
    }

    print("线程1 - 建立记忆:")
    result1 = graph.invoke({
        "messages": [HumanMessage(content="我叫Alice，我喜欢音乐")]
    }, config1)
    print(f"AI: {result1['messages'][-1].content}")

    # 第二个对话线程（相同用户）
    config2 = {
        "configurable": {
            "thread_id": "thread_2",
            "user_id": user_id
        }
    }

    print("\n线程2 - 访问记忆:")
    result2 = graph.invoke({
        "messages": [HumanMessage(content="你还记得我吗？")]
    }, config2)
    print(f"AI: {result2['messages'][-1].content}")

    # 显示共享的记忆
    show_memories(in_memory_store, user_id)


if __name__ == "__main__":
    # 运行主程序
    main()

    # 演示跨线程记忆共享
    demo_cross_thread_memory()
```



**InMemorySaver和InMemoryStore的使用场景**：

**InMemorySaver** 短期记忆：存储每个节点执行完成之后的状态（聊天历史）;

**InMemoryStore** 长期记忆：跨会话（线程），存储用户相关的内容（例如用户偏好、背景资料、项目上下文、历史决策和反馈）;



# 记忆存储

对于人工智能代理来说，记忆至关重要，因为它能让它们记住之前的交互，从反馈中学习，并适应用户的偏好。随着代理需要处理更复杂的任务，并进行大量的用户交互，这种能力对于效率和用户满意度都至关重要。

- 短期记忆（或线程范围的记忆）通过维护会话中的消息历史记录来跟踪正在进行的对话。LangGraph 将短期记忆作为代理状态的一部分进行管理。状态使用检查点持久化到数据库中，以便线程可以随时恢复。短期记忆会在图被调用或某个步骤完成时更新，并且在每个步骤开始时读取状态。
- 长期记忆跨会话存储用户特定或应用程序级别的数据，并在对话线程之间共享。它可以在任何时间、任何线程中调用。记忆的作用域是任何自定义命名空间，而不仅仅是单个线程 ID。LangGraph 提供存储，方便您保存和调用长期记忆。



![agent__015](./image/agent__015.png)

## Postgress

安装

``` python
uv add "psycopg[binary,pool]" langgraph-checkpoint-postgres
```



使用 docker 安装 **Postgres** **作为存储**

``` python
s# 1.使用docker下载对应镜像
docker pull postgres:alpine # 这边使用的是体积更小的镜像
```



``` python
import uuid
from dataclasses import dataclass

from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.runtime import Runtime
from langgraph.store.postgres import PostgresStore

from settings import app_settings

DB_URI = "postgresql://postgres:12345678@localhost:5432/postgres?sslmode=disable"

llm= app_settings.get_qwen_client()


@dataclass
class Context:
    user_id: str


# --- 2. 定义节点逻辑 ---
def call_model(state: MessagesState, runtime: Runtime[Context]):
    user_id = runtime.context.user_id
    namespace = ("memories", user_id)

    # 检索长期记忆
    last_user_msg = state["messages"][-1].content
    memories = runtime.store.search(namespace, query=str(last_user_msg))
    info = "\n".join([d.value["data"] for d in memories])

    system_msg = f"你是一个有帮助的助手。已知用户信息: {info}"

    # 逻辑存储：如果用户说“记住...”，则存入 Store
    if "记住" in last_user_msg:
        # 简单提取“记住”后面的内容（实际生产可用LLM提取）
        memory_content = last_user_msg.replace("记住", "").strip("：: ")
        runtime.store.put(namespace, str(uuid.uuid4()), {"data": memory_content})
        print(f"--- [系统日志] 已存入长期记忆: {memory_content} ---")

    response = llm.invoke(
        [{"role": "system", "content": system_msg}] + state["messages"]
    )
    return {"messages": response}


# 使用 context manager 保持连接
with PostgresStore.from_conn_string(DB_URI) as store, \
        PostgresSaver.from_conn_string(DB_URI) as checkpointer:

    # 第一次初始化的时候需要
    checkpointer.setup()
    store.setup()

    builder = StateGraph(MessagesState)
    builder.add_node("call_model", call_model)
    builder.add_edge(START, "call_model")
    graph = builder.compile(checkpointer=checkpointer, store=store)

    # --- 4. 交互循环 ---
    current_thread_id = "1"
    current_user_id = "user_v1"

    print("=== LangGraph 交互系统 ===")
    print("指令说明: 输入 'switch' 切换会话, 'exit' 退出程序")

    while True:
        prompt = f"\n[当前线程: {current_thread_id}] 用户: "
        user_input = input(prompt).strip()

        if user_input.lower() == 'exit':
            break

        if user_input.lower() == 'switch':
            new_id = input("请输入新的 Thread ID (例如 1, 2, 3): ")
            current_thread_id = new_id
            print(f"--- 已切换到线程 {current_thread_id} ---")
            continue

        if not user_input:
            continue

        # 构建配置
        config = {
            "configurable": {
                "thread_id": current_thread_id,
                "user_id": current_user_id,
            }
        }

        # 执行流式输出（使用 values 模式）
        # 注意：由于我们要手动输入，每次流只传入当前这一条消息
        for chunk in graph.stream(
                {"messages": [{"role": "user", "content": user_input}]},
                config,
                context=Context(user_id=current_user_id),
                stream_mode="messages",
                version="v2"
        ):
            if chunk["type"] == "messages":
                result, metadata = chunk["data"]
                print(result.content, end="", flush=True)

```

## redis

**使用redis作为存储**

``` python
uv add langgraph-checkpoint-redis
```



``` python
import uuid
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.redis import RedisSaver
from langgraph.store.redis import RedisStore
from langgraph.runtime import Runtime
from dataclasses import dataclass

load_dotenv()

# --- 1. 初始化模型 ---
llm = init_chat_model(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model_provider="openai",
    model='MiniMax-M2.1'
)


@dataclass
class Context:
    user_id: str


# --- 2. 定义节点逻辑 ---
def call_model(state: MessagesState, runtime: Runtime[Context]):
    user_id = runtime.context.user_id
    namespace = ("memories", user_id)

    # 检索长期记忆
    last_user_msg = state["messages"][-1].content
    memories = runtime.store.search(namespace, query=str(last_user_msg))
    info = "\n".join([d.value["data"] for d in memories])

    system_msg = f"你是一个有帮助的助手。已知用户信息: {info}"

    # 逻辑存储：如果用户说“记住...”，则存入 Store
    if "记住" in last_user_msg:
        # 简单提取“记住”后面的内容（实际生产可用LLM提取）
        memory_content = last_user_msg.replace("记住", "").strip("：: ")
        runtime.store.put(namespace, str(uuid.uuid4()), {"data": memory_content})
        print(f"--- [系统日志] 已存入长期记忆: {memory_content} ---")

    response = llm.invoke(
        [{"role": "system", "content": system_msg}] + state["messages"]
    )
    return {"messages": response}


# --- 3. 构建图 ---
DB_URI = "redis://localhost:6379"

# 使用 context manager 保持连接
with RedisStore.from_conn_string(DB_URI) as store, \
        RedisSaver.from_conn_string(DB_URI) as checkpointer:
    # 第一次初始化的时候需要
    checkpointer.setup()
    store.setup()

    builder = StateGraph(MessagesState)
    builder.add_node("call_model", call_model)
    builder.add_edge(START, "call_model")
    graph = builder.compile(checkpointer=checkpointer, store=store)

    # --- 4. 交互循环 ---
    current_thread_id = "1"
    current_user_id = "user_v1"

    print("=== LangGraph 交互系统 ===")
    print("指令说明: 输入 'switch' 切换会话, 'exit' 退出程序")

    while True:
        prompt = f"\n[当前线程: {current_thread_id}] 用户: "
        user_input = input(prompt).strip()

        if user_input.lower() == 'exit':
            break

        if user_input.lower() == 'switch':
            new_id = input("请输入新的 Thread ID (例如 1, 2, 3): ")
            current_thread_id = new_id
            print(f"--- 已切换到线程 {current_thread_id} ---")
            continue

        if not user_input:
            continue

        # 构建配置
        config = {
            "configurable": {
                "thread_id": current_thread_id,
                "user_id": current_user_id,
            }
        }

        # 执行流式输出（使用 values 模式）
        # 注意：由于我们要手动输入，每次流只传入当前这一条消息
        for chunk in graph.stream(
                {"messages": [{"role": "user", "content": user_input}]},
                config,
                context=Context(user_id=current_user_id),
                stream_mode="messages",
                version="v2"
        ):
            if chunk["type"] == "messages":
                result, metadata = chunk["data"]
                print(result.content, end="", flush=True)
```







# 管理短期记忆

启用短期记忆后，长对话可能会超出 LLM 的上下文窗口。常见的解决方案如下：

- 修剪消息：删除前 N 条或后 N 条消息（在调用 LLM 之前）
- 从 LangGraph 状态中永久删除消息
- 总结消息：总结历史记录中较早的消息，并用摘要替换它们
- 管理检查点以存储和检索消息历史记录
- 自定义策略（例如，消息过滤等）



### 裁剪消息

大多数 LLM 都有一个最大支持的上下文窗口（以 token 为单位）。决定何时截断消息的一种方法是计算消息历史记录中的 token 数量，并在接近该限制时进行截断。

``` python
```





### 删除消息

可以从图表状态中删除消息，以管理消息历史记录。当您想要移除特定消息或清除整个消息历史记录时，此功能非常有用。

``` python
```





### 摘要消息（总结消息）

修剪或删除消息的问题在于，可能会因剔除消息队列而丢失信息。因此，一些应用程序受益于一种更复杂的方法，即使用聊天模型来汇总消息历史记录。

![agent__016](./image/agent__016.png)

``` python
```












# stream流式输出

LangGraph 实施了流式系统来显示实时更新，从而实现响应迅速且透明的用户体验。

LangGraph 的流式传输系统可将图形运行的实时反馈显示到您的应用中。

**流式输出在LangGraph中的重要性：**

⚡ 用户立即看到反馈

🎯 减少等待时间

💾 节省内存使用

😊 提升用户体验

将以下一个或多个流模式作为列表传递给`stream()`或`astream()`方法：

| 模式        | 描述                                                         | 概述                           |
| ----------- | ------------------------------------------------------------ | ------------------------------ |
| values      | 在图的每个步骤之后流式传输状态的完整值。                     | 看到完整状态                   |
| updates     | 将图的每个步骤之后的更新流式传输到状态。如果在同一步骤中进行了多个更新（例如，运行了多个节点），则这些更新将分别流式传输。 | 看到变化部分                   |
| custom      | 从图形节点内部流式传输自定义数据。                           | 看到自定义数据                 |
| messages    | 从调用 LLM 的任何图形节点流式传输 2 元组（LLM 令牌、元数据）。 | 看到AI逐字输出                 |
| debug       | 在整个图表执行过程中传输尽可能多的信息。                     | 看到调试信息                   |
| checkpoints | 返回的检查点的完整状态内容                                   | 看到所有检查点的状态信息       |
| tasks       | 返回任务开始/结束、错误、结果的内容                          | 看到每个任务的开始、结束和错误 |

### values

``` python
from typing import TypedDict, Annotated

import operator

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from settings import app_settings

llm = app_settings.get_qwen_client()


# 状态定义
class State(TypedDict):
    numbers: list[int]  # 输入的数字
    results: Annotated[list[int], operator.add]  # worker的结果
    final_sum: int  # 最终求和


class WorkerState(TypedDict):
    number: int

# 1. Map阶段：分发数字
def split_numbers(state: State):
    """把数字分发给不同的worker"""
    numbers = state["numbers"]

    # 每个数字发给一个worker
    return [Send("worker", WorkerState(number=num)) for num in numbers]


# 2. Worker阶段：计算平方
def worker(state: WorkerState):
    """每个worker计算一个数字的平方"""
    number = state["number"]
    square = number * number
    return {"results": [square]}


# 3. Reduce阶段：求和
def summer(state: State):
    """把所有结果加起来"""
    results = state.get("results", [])
    total = sum(results)
    return {"final_sum": total}


# 构建图
def create_simple_graph():
    graph = StateGraph(state_schema=State)

    # 添加节点
    graph.add_node("splitter", lambda s: s)  # 分发器
    graph.add_node("worker", worker)  # 工作节点
    graph.add_node("summer", summer)  # 求和器

    # 连接节点
    graph.add_edge(START, "splitter")
    graph.add_conditional_edges("splitter", split_numbers, ["worker"])  # Map阶段
    graph.add_edge("worker", "summer")  # Worker完成后求和
    graph.add_edge("summer", END)

    return graph.compile()


def main():
    graph = create_simple_graph()

    initial_state = {
        "numbers": [1, 2, 3, 4, 5],
        "results": [],
        "final_sum": 0
    }

    for result in graph.stream(initial_state, stream_mode="values", version="v2"):
        print(result)


if __name__ == '__main__':
    main()


```

输出：

``` python
{'type': 'values', 'ns': (), 'data': {'numbers': [1, 2, 3, 4, 5], 'results': [], 'final_sum': 0}, 'interrupts': ()}
{'type': 'values', 'ns': (), 'data': {'numbers': [1, 2, 3, 4, 5], 'results': [], 'final_sum': 0}, 'interrupts': ()}
{'type': 'values', 'ns': (), 'data': {'numbers': [1, 2, 3, 4, 5], 'results': [1, 4, 9, 16, 25], 'final_sum': 0}, 'interrupts': ()}
{'type': 'values', 'ns': (), 'data': {'numbers': [1, 2, 3, 4, 5], 'results': [1, 4, 9, 16, 25], 'final_sum': 55}, 'interrupts': ()}

```

在图的每个步骤之后流式传输状态的完整值。

**data** 返回当前每个步骤的执行完成之后的状态；



### update

``` python
    print("====================UPDATES模式=====================")
    for result in graph.stream(initial_state, stream_mode="updates", version="v2"):
        print(result)
```

输出：

``` python
{'type': 'updates', 'ns': (), 'data': {'splitter': {'numbers': [1, 2, 3, 4, 5], 'results': [], 'final_sum': 0}}}
{'type': 'updates', 'ns': (), 'data': {'worker': {'results': [1]}}}
{'type': 'updates', 'ns': (), 'data': {'worker': {'results': [4]}}}
{'type': 'updates', 'ns': (), 'data': {'worker': {'results': [9]}}}
{'type': 'updates', 'ns': (), 'data': {'worker': {'results': [16]}}}
{'type': 'updates', 'ns': (), 'data': {'worker': {'results': [25]}}}
{'type': 'updates', 'ns': (), 'data': {'summer': {'final_sum': 55}}}
```

将图的每个步骤之后的更新流式传输到状态。如果在同一步骤中进行了多个更新（例如**Send**，运行了多个节点），则这些更新将分别流式传输。



### debug

调试

``` python
    print("====================DEBUG模式=====================")
    for result in graph.stream(initial_state, stream_mode="debug", version="v2"):
        print(result)

```

输出：

``` python
# 数据有点多

{
    'type': 'debug', 
     'ns': (), 
     'data': {
        'step': 2,  # 当前步骤
        'timestamp': '2026-09-19T11:20:59.373682+00:00', 
        'type': 'task_result', 
        'payload': {
            'id': '31bda4e3-89f9-edd4-a8ae-6674bf40b156', 
            'name': 'worker',  # 节点名称
            'error': None,  # 节点错误
            'result': {
                'results': [1] # 更新的状态
            }, 
            'interrupts': []
        }
    }
}
```

在整个图表执行过程中传输尽可能多的信息。



### messages

实现打字搞的视觉效果；

``` python
from typing import TypedDict, Annotated

import operator

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from settings import app_settings

llm = app_settings.get_qwen_client()


class MyState(TypedDict):
    question: str
    results: str


def generate_answer(state: MyState):
    question = state["question"]
    answer = llm.invoke([
        {"role": "user", "content": f"{question}"}
    ]) # 通过 invoke 或者 ainvoke 返回，也能实现流式，因为langchain core 内部做了处理
    return {"answer": answer.content}


def generate_answer1(state: MyState):
    answer = llm.invoke([
        {"role": "user", "content": f"你好"}
    ])
    return {"answer": answer.content}


# 构建图
def create_llm_graph():
    graph = StateGraph(state_schema=MyState)

    # 添加节点
    graph.add_node("generate_answer", generate_answer)
    graph.add_node("generate_answer1", generate_answer1)

    # 连接节点
    graph.add_edge(START, "generate_answer")
    graph.add_edge("generate_answer", "generate_answer1")
    graph.add_edge("generate_answer", END)

    return graph.compile()


def main():
    graph = create_llm_graph()

    initial_state = {"question": "什么是状态图？"}

    print("====================MESSAGES模式=====================")
    for chunk in graph.stream(initial_state, stream_mode="messages", version="v2"):
        if chunk["type"] == "messages":
            print(chunk) # 下面的输出
            result, metadata = chunk["data"]
            print(result.content, end="", flush=True) # 拿到 result.content 返回

if __name__ == '__main__':
    main()

```

每次流式输出都会产生一条下面的数据；

重点是 **data**， 是个元组；

**langgraph_node** 表示当前输出是在哪个节点；

``` python
{
    'type': 'messages',
    'ns': (), 
    'data': (
        AIMessageChunk(
            content='状态图', 
            additional_kwargs={}, 
            response_metadata={
                'model_provider': 
                'dashscope'
            }, 
            id='lc_run--01a0b96f-babd-7172-b8db-b9a720a0157b', 
            tool_calls=[], 
            invalid_tool_calls=[],
            tool_call_chunks=[]
        ), 
        {
            'ls_integration': 'langchain_chat_model', 
            'langgraph_step': 1, 
            'langgraph_node': 'generate_answer', 
            'langgraph_triggers': ('branch:to:generate_answer',), 
            'langgraph_path': ('__pregel_pull', 'generate_answer'), 
            'langgraph_checkpoint_ns': 'generate_answer:a8a43693-805b-51b0-e02c-19750dd51fa0', 
            'checkpoint_ns': 'generate_answer:a8a43693-805b-51b0-e02c-19750dd51fa0',
            'ls_provider': 'openai', 
            'ls_model_name': 'qwen3.8-flash', 
            'ls_model_type': 'chat', 
            'ls_temperature': None,
            'lc_versions': {
                'langchain-core': '1.6.1', 
                'langchain': '1.3.18', 
                'langchain-openai': '1.5.1'
            }
        }
    )
}
```

 #### LangChain 的自动流式（关键点）

在 `langchain_core/language_models/chat_models.py` 里，`BaseChatModel` 有个逻辑叫 `_should_stream`：

```python
def _should_stream(self, *, async_, run_manager=None, **kwargs):
    # 如果显式传了 streaming=True，就走流
    if self.streaming: 
        return True
    # 如果回调里有 on_llm_new_token 的处理器，也走流
    if run_manager:
        handlers = run_manager.handlers  # 遍历所有 callback
        if any(isinstance(h, _StreamingCallbackHandler) or 
               hasattr(h, "on_llm_new_token") for h in handlers):
            return True
    return False
```

**当 `_should_stream` 返回 True，`invoke` 内部其实是这么干的：**

```python
def invoke(self, input, **kwargs):
    if self._should_stream(kwargs):
        # 偷偷把 stream 收集成一个最终结果返回
        chunks = [c for c in self.stream(input, **kwargs)]
        return generate_from_stream(iter(chunks))
    # 否则才走真正的非流式 HTTP 请求
    return self._generate(input, **kwargs)
```

所以在节点里写 `llm.invoke(...)`，代码看起来是"一次性调用"，但 LangGraph 注入的 callback 让它触发了 `stream` 路径，每个 token 都会通过 `on_llm_new_token` 冒泡到 `stream_mode="messages"`。



#### subgraphs子图开启流式

``` python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, MessagesState, END

from settings import app_settings

llm = app_settings.get_qwen_client()


# 创建子图
def subplot(state: MessagesState) -> MessagesState:
    # 获取大模型回答的内容进行摘要总结
    answer = state["messages"][-1].content
    summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
    response = llm.invoke(summary_prompt)
    return {"messages": [response]}


summary_subgraph = (
    StateGraph(state_schema=MessagesState)
    .add_node("subplot", subplot)
    .add_edge(START, "subplot")
    .add_edge("subplot", END)
    .compile()
)


def llm_answer_node(state: MessagesState) -> MessagesState:
    # 使用大模型进行回答
    answer = llm.invoke(state["messages"])
    return {"messages": [answer]}


checkpointer = InMemorySaver()


# 构建图
def create_check_tasks_graph():
    parent_graph = (
        StateGraph(MessagesState)
        .add_node("llm_answer", llm_answer_node)
        .add_node("summarize_subgraph", summary_subgraph)
        .add_edge(START, "llm_answer")
        .add_edge("llm_answer", "summarize_subgraph")
        .compile(checkpointer=checkpointer)
    )
    return parent_graph


def main():
    graph = create_check_tasks_graph()

    print("====================checkpoints、tasks模式=====================")

    config = {"configurable": {"thread_id": "1"}}
    # 测试输入
    input_state = {
        "messages": [{"role": "user", "content": "langgraph是什么？请用100字介绍"}],
    }

    for chunk in graph.stream(
            input_state,
            config,
            stream_mode="messages",  # tasks  |  checkpoints
            subgraphs=True,  # 如果要子图也进行流式输出，需要开启
            version="v2"
    ):
        print(chunk)
        if chunk["type"] == "messages":
            result, metadata = chunk["data"]
            print(result.content, end="", flush=True)  # 拿到 result.content 返回


if __name__ == '__main__':
    main()

```

#### 不共享状态方式

``` python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, MessagesState, END
from langgraph.config import get_config
from settings import app_settings

llm = app_settings.get_qwen_client()


# ============ 子图 ============
def subplot(state: MessagesState) -> MessagesState:
    """子图节点：对最后一条消息做一句话总结"""
    answer = state["messages"][-1].content
    summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
    response = llm.invoke(summary_prompt)
    # ✅ 把摘要真正写回子图 state
    return {"messages": [response]}


summary_subgraph = (
    StateGraph(state_schema=MessagesState)
    .add_node("subplot", subplot)
    .add_edge(START, "subplot")
    .add_edge("subplot", END)
    .compile()
)


# ============ 父图节点 ============
def llm_answer_node(state: MessagesState) -> MessagesState:
    """父图节点：让 LLM 回答用户问题"""
    answer = llm.invoke(state["messages"])
    return {"messages": [answer]}


def summarize(state: MessagesState) -> MessagesState:
    """父图节点：在节点内手动调用子图，需要把父图 config 传下去"""
    config = get_config()  # ✅ 拿到父图当前节点的运行 config
    # ✅ 关键：把 config 传给子图 invoke，子图的流式才能冒泡到父图
    result = summary_subgraph.invoke(state, config=config)
    # ✅ 把子图结果合并回父图 state，否则白白算了
    return {"messages": result["messages"]}


checkpointer = InMemorySaver()


# ============ 构建父图 ============
def create_check_tasks_graph():
    parent_graph = (
        StateGraph(MessagesState)
        .add_node("llm_answer", llm_answer_node)
        .add_node("summarize", summarize)
        .add_edge(START, "llm_answer")
        .add_edge("llm_answer", "summarize")
        .compile(checkpointer=checkpointer)
    )
    return parent_graph


def main():
    graph = create_check_tasks_graph()

    print("==================== messages 模式（带子图）=====================")

    config = {"configurable": {"thread_id": "1"}}
    input_state = {
        "messages": [{"role": "user", "content": "langgraph是什么？请用100字介绍"}],
    }

    for chunk in graph.stream(
            input_state,
            config,
            stream_mode="messages",
            subgraphs=True,      # ✅ 开启子图流式
            version="v2",
    ):
        if chunk["type"] != "messages":
            continue

        result, metadata = chunk["data"]
        ns = chunk.get("ns", ())                       # namespace：区分父子图
        node = metadata.get("langgraph_node", "?")     # 当前节点名
        is_sub = bool(ns)                              # ns 非空 => 来自子图

        # 用不同前缀区分：父图节点直接打，子图节点加 [SUB] 标记
        prefix = f"\n[SUB ns={ns} node={node}] " if is_sub else f"\n[MAIN node={node}] "
        print(prefix, end="")
        print(result.content, end="", flush=True)

    print("\n\n==================== 最终 state =====================")
    final = graph.get_state(config)
    for m in final.values["messages"]:
        print(f"- {type(m).__name__}: {m.content[:60]}...")


if __name__ == '__main__':
    main()
```



### custom

``` python
import time
from typing import TypedDict

from langgraph.config import get_stream_writer
from langgraph.graph import StateGraph, START

from settings import app_settings

llm = app_settings.get_qwen_client()


# 定义状态
class FileState(TypedDict):
    filename: str  # 文件名称
    content: str  # 文件内容
    word_count: int  # 内容数量
    processed: bool  # 是否处理完成


def read_file(state: FileState):
    """步骤1：读取文件"""
    writer = get_stream_writer()
    # 发送开始信息
    writer({"step": "读取文件", "status": "开始", "progress": 0})
    time.sleep(1)

    # 发送进度信息
    writer({"step": "读取文件", "status": "正在读取...", "progress": 50})
    time.sleep(1)

    # 模拟文件内容
    content = "这是一个示例文件，包含一些文本内容。"

    # 发送完成信息
    writer({
        "step": "读取文件",
        "status": "完成",
        "progress": 100,
        "data": {"size": len(content)}
    })

    return {"content": content}


def count_words(state: FileState):
    """步骤2：统计字数"""
    writer = get_stream_writer()
    writer({"step": "统计字数", "status": "开始", "progress": 0})
    time.sleep(0.5)

    writer({"step": "统计字数", "status": "正在分析...", "progress": 30})
    time.sleep(1)

    writer({"step": "统计字数", "status": "计算中...", "progress": 70})
    time.sleep(0.5)

    # 计算字数
    word_count = len(state["content"])

    writer({
        "step": "统计字数",
        "status": "完成",
        "progress": 100,
        "data": {"word_count": word_count}
    })

    return {"word_count": word_count}


def finalize_processing(state: FileState):
    """步骤3：完成处理"""
    writer = get_stream_writer()
    writer({"step": "完成处理", "status": "生成报告", "progress": 50})
    time.sleep(1)

    writer({
        "step": "完成处理",
        "status": "全部完成",
        "progress": 100,
        "data": {
            "filename": state["filename"],
            "total_chars": state["word_count"],
            "summary": f"文件 {state['filename']} 处理完成，共 {state['word_count']} 个字符"
        }
    })

    return {"processed": True}


# 构建图
def create_custom_graph():
    graph = (
        StateGraph(state_schema=FileState)
        .add_node("read_file", read_file)
        .add_node("count_words", count_words)
        .add_node("finalize", finalize_processing)
        .add_edge(START, "read_file")
        .add_edge("read_file", "count_words")
        .add_edge("count_words", "finalize")
        .compile()
    )
    return graph


def main():
    graph = create_custom_graph()

    print("====================CUSTOM模式=====================")
    # 初始状态
    initial_state1 = {
        "filename": "example.txt",
        "content": "",
        "word_count": 0,
        "processed": False
    }
    # 使用Custom模式运行
    for chunk in graph.stream(initial_state1, stream_mode="custom", version="v2"):
        if chunk["type"] == "custom":
            data = chunk["data"]
            step = data.get("step", "")  # 当前步骤
            status = data.get("status", "")  # 目前状态
            progress = data.get("progress", 0)  # 完成进度
            data_result = data.get("data", {})  # 最终数据

            # 显示进度
            progress_bar = "█" * (progress // 10) + "░" * (10 - progress // 10)
            print(f"\n[{step}] {status}")
            print(f"进度: [{progress_bar}] {progress}%")

            # 显示额外数据
            if data_result:
                for key, value in data_result.items():
                    print(f"{key}: {value}")



if __name__ == '__main__':
    main()

```

自定义输出只能通过**get_stream_writer**写入

``` python
from langgraph.config import get_stream_writer

writer = get_stream_writer()
```



#### 实现打字机的写法

``` python
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.config import get_stream_writer
from langgraph.graph import StateGraph, START, MessagesState

from settings import app_settings

llm = app_settings.get_qwen_client()


# 定义状态
class State(MessagesState):
    question: str
    answer: str


def node_01(state: State):
    writer = get_stream_writer()  # 拿到当前节点的“管道”
    answer = ""

    # 用 llm.stream() 而不是 invoke，拿到 token 迭代器
    for chunk in llm.stream([HumanMessage(content=state["question"])]):
        if chunk.content:
            writer({"content": chunk.content})   # 手动把每个 token 推给 custom 流
            answer += chunk.content

    # 如果你还需要更新 state，正常 return 即可
    return {
        "answer": answer,
        "messages": [AIMessage(content=answer)]
    }


# 构建图
def create_custom_graph():
    graph = (
        StateGraph(state_schema=State)
        .add_node("node_01", node_01)
        .add_edge(START, "node_01")
        .compile()
    )
    return graph


def main():
    graph = create_custom_graph()

    print("====================CUSTOM模式=====================")
    # 初始状态
    initial_state1 = {"question": "什么是状态图？"}
    # 使用Custom模式运行
    for chunk in graph.stream(initial_state1, stream_mode="custom", version="v2"):
        print(chunk)


if __name__ == '__main__':
    main()

```

关键在于**管道get_stream_writer**，并且自定义模式下无法使用 **invoke**实现流式；LLM 调用 **stream**，拿到 token 迭代器；

``` python
{'type': 'custom', 'ns': (), 'data': {'content': '**'}} 
{'type': 'custom', 'ns': (), 'data': {'content': '状态图'}}
{'type': 'custom', 'ns': (), 'data': {'content': '（State Diagram）**'}}
{'type': 'custom', 'ns': (), 'data': {'content': '，也称为'}}
{'type': 'custom', 'ns': (), 'data': {'content': '**状态机图'}}
{'type': 'custom', 'ns': (), 'data': {'content': '（State Machine'}}
{'type': 'custom', 'ns': (), 'data': {'content': ' Diagram）**或**'}}
{'type': 'custom', 'ns': (), 'data': {'content': '有限状态自动机'}}
...
```

**data** 类型就是由管道决定返回什么；

``` python
writer({"content": chunk.content}) # 可以在这里添加其他的状态或者数据信息；
```



### tasks

任务模式和debug 比较像；返回的数据没有debug 那么详细；是按照任务的方式返回的，每个任务就是每次节点的执行；

``` python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, MessagesState, END
from settings import app_settings

llm = app_settings.get_qwen_client()


# ============ 子图 ============
def subplot(state: MessagesState) -> MessagesState:
    """子图节点：对最后一条消息做一句话总结"""
    answer = state["messages"][-1].content
    summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
    response = llm.invoke(summary_prompt)
    # ✅ 把摘要真正写回子图 state
    return {"messages": [response]}


summary_subgraph = (
    StateGraph(state_schema=MessagesState)
    .add_node("subplot", subplot)
    .add_edge(START, "subplot")
    .add_edge("subplot", END)
    .compile()
)


# ============ 父图节点 ============
def llm_answer_node(state: MessagesState) -> MessagesState:
    """父图节点：让 LLM 回答用户问题"""
    answer = llm.invoke(state["messages"])
    return {"messages": [answer]}


checkpointer = InMemorySaver()


# ============ 构建父图 ============
def create_check_tasks_graph():
    parent_graph = (
        StateGraph(MessagesState)
        .add_node("llm_answer", llm_answer_node)
        .add_node("summarize", summary_subgraph)
        .add_edge(START, "llm_answer")
        .add_edge("llm_answer", "summarize")
        .compile(checkpointer=checkpointer)
    )
    return parent_graph


def main():
    graph = create_check_tasks_graph()

    print("==================== tasks 模式（带子图）=====================")

    config = {"configurable": {"thread_id": "1"}}
    input_state = {
        "messages": [{"role": "user", "content": "langgraph是什么？请用100字介绍"}],
    }

    for chunk in graph.stream(
            input_state,
            config,
            stream_mode="tasks",
            subgraphs=True,      # ✅ 开启子图流式
            version="v2",
    ):
        print(chunk, end="")


if __name__ == '__main__':
    main()
```

输出：

``` python
{'type': 'tasks', 'ns': ('summarize:ba3500ee-db07-9134-dfae-1f8460bd0b06',), 'data': {'id': '14ab2b21-a549-68e8-d6a0-a1b5bafc92a9', 'name': 'subplot', 'input': {'messages': [HumanMessage(content='langgraph是什么？请用100字介绍', additional_kwargs={}, response_metadata={}, id='721dd1fe-1d1a-487f-93de-f97a28623f2f'), AIMessage(content='LangGraph 是 LangChain 推出的框架，用于构建有状态、多角色的 LLM 应用。它通过图结构管理复杂工作流，支持循环、分支及持久化记忆，特别适合开发需要精细控制流程的智能代理系统。', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 35, 'total_tokens': 85, 'completion_tokens_details': None, 'prompt_tokens_details': {'audio_tokens': None, 'cache_write_tokens': None, 'cached_tokens': 0, 'text_tokens': 35}}, 'model_provider': 'dashscope', 'model_name': 'qwen3.8-flash', 'system_fingerprint': None, 'id': 'chatcmpl-fa7293fb-78ee-974b-aaf7-8c843ae530f0', 'finish_reason': 'stop', 'logprobs': None}, id='lc_run--01a0b9b0-c9fd-7e71-89c9-72554d5d4d9a-0', tool_calls=[], invalid_tool_calls=[], usage_metadata={'input_tokens': 35, 'output_tokens': 50, 'total_tokens': 85, 'input_token_details': {'cache_read': 0}, 'output_token_details': {}})]}, 'triggers': ('branch:to:subplot',)}}{'type': 'tasks', 'ns': ('summarize:ba3500ee-db07-9134-dfae-1f8460bd0b06',), 'data': {'id': '14ab2b21-a549-68e8-d6a0-a1b5bafc92a9', 'name': 'subplot', 'error': None, 'result': {'messages': [AIMessage(content='LangGraph 是 LangChain 推出的用于构建有状态、多角色 LLM 应用的框架，通过图结构管理复杂工作流以支持精细控制的智能代理系统开发。', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 37, 'prompt_tokens': 84, 'total_tokens': 121, 'completion_tokens_details': None, 'prompt_tokens_details': {'audio_tokens': None, 'cache_write_tokens': None, 'cached_tokens': 0, 'text_tokens': 84}}, 'model_provider': 'dashscope', 'model_name': 'qwen3.8-flash', 'system_fingerprint': None, 'id': 'chatcmpl-dfc2674c-9d3f-9f35-93b5-7f3f8df6241a', 'finish_reason': 'stop', 'logprobs': None}, id='lc_run--01a0b9b0-d11a-7480-b9f9-941cfdc91e25-0', tool_calls=[], invalid_tool_calls=[], usage_metadata={'input_tokens': 84, 'output_tokens': 37, 'total_tokens': 121, 'input_token_details': {'cache_read': 0}, 'output_token_details': {}})]}, 'interrupts': []}}
```



### checkpoints

检查点，每次返回当前的检查点



### 融合多种模式

``` python
from typing import TypedDict
from settings import app_settings
from langgraph.graph import StateGraph, START, END


# ==========================================
# 1. 定义状态和工具
# ==========================================

class EditorState(TypedDict):
    topic: str  # 主题
    content: str  # 生成的内容
    score: int  # 评分
    status: str  # 当前状态描述


llm = app_settings.get_qwen_client()


# ==========================================
# 2. 定义节点逻辑
# ==========================================

def write_article(state: EditorState):
    """节点1：负责写文章（耗时操作，会有流式输出）"""
    topic = state["topic"]
    # 这里我们用 invoke，依靠 stream_mode="messages" 来捕获流
    response = llm.invoke(f"请写一段关于'{topic}'的短文，50字左右。")
    return {
        "content": response.content,
        "status": "写作完成"
    }


def review_article(state: EditorState):
    """节点2：负责打分（逻辑操作，瞬间完成）"""
    # 简单模拟打分逻辑
    content_len = len(state["content"])
    score = min(100, content_len * 2)
    return {
        "score": score,
        "status": "评分完成"
    }


# ==========================================
# 3. 构建图
# ==========================================

workflow = StateGraph(EditorState)

workflow.add_node("writer", write_article)
workflow.add_node("reviewer", review_article)

workflow.add_edge(START, "writer")
workflow.add_edge("writer", "reviewer")
workflow.add_edge("reviewer", END)

app = workflow.compile()


# ==========================================
# 4. 核心：融合流式输出处理
# ==========================================

def run_mixed_mode_demo():
    inputs = {
        "topic": "人工智能的未来",
        "content": "",
        "score": 0,
        "status": "开始任务"
    }

    print(f"任务启动：主题 - {inputs['topic']}\n")
    print("-" * 50)

    # 关键点：传入一个列表 ["messages", "updates", "values"]
    # 这样 app.stream 会返回一个元组：(mode, chunk)
    for mode, chunk in app.stream(inputs, stream_mode=["messages", "updates", "values"]):

        # --- 模式 A: Messages (处理打字机效果) ---
        if mode == "messages":
            # chunk 结构是 (message, metadata)
            message, metadata = chunk
            # 只显示 AI 生成的内容，过滤掉系统消息等
            if message.content:
                print(message.content, end="", flush=True)

        # --- 模式 B: Updates (处理节点完成通知) ---
        elif mode == "updates":
            # chunk 是该节点刚刚更新的字段
            # 这里的 chunk 类似于Key-Value：{'writer': {'content': '...', 'status': '...'}}
            node_name = list(chunk.keys())[0]
            updates = chunk[node_name]
            print(f"\n\n[节点完成] {node_name} -> 状态: {updates.get('status')}")
            if "score" in updates:
                print(f"[评分结果] 得分: {updates['score']}")
            print("-" * 50)  # 分割线

        # --- 模式 C: Values (处理全局状态快照) ---
        elif mode == "values":
            # chunk 是当前的完整 State
            print(f"\n📦 [全量状态快照] {chunk}")

    print("\n流程结束！")


if __name__ == "__main__":
    run_mixed_mode_demo()

```



### 工具

``` python
import time
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.messages.tool import tool_call
from langchain_core.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.prebuilt.tool_node import ToolRuntime

from settings import app_settings

llm = app_settings.get_qwen_client()


# ============ 1. 流式工具 ============
@tool
def long_running_task(query: str, runtime: ToolRuntime) -> str:
    """模拟耗时任务，逐步推送中间结果。"""
    steps = 5
    for i in range(steps):
        time.sleep(0.4)
        partial = f"[第 {i+1}/{steps} 步] 正在处理「{query}」..."
        runtime.emit_output_delta(partial + "\n")
    return f"「{query}」处理完成，共 {steps} 步。"


# ============ 2. 图结构：START → tools → chatbot → END ============
def chatbot(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}


builder = StateGraph(MessagesState)
builder.add_node("chatbot", chatbot)
builder.add_node("tools", ToolNode([long_running_task]))
builder.add_edge(START, "tools")        # ✅ 直接进 tools，跳过 LLM 首轮
builder.add_edge("tools", "chatbot")    # 工具跑完，交给 LLM 总结
builder.add_edge("chatbot", END)

graph = builder.compile(checkpointer=InMemorySaver())


# ============ 3. 手动构造 tool_calls 触发 ToolNode ============
def main():
    config = {"configurable": {"thread_id": "demo"}}

    input_state = {
        "messages": [
            AIMessage(
                "",   # 不会被 qwen 看到，因为不经过 chatbot 首轮
                tool_calls=[
                    tool_call(
                        name="long_running_task",
                        args={"query": "数据清洗"},
                        id="call_001",
                    )
                ],
            )
        ]
    }

    print("=" * 60)
    print("stream_mode='tools'")
    print("=" * 60)

    for chunk in graph.stream(input_state, config, stream_mode="tools"):
        event = chunk.get("event")
        data = chunk.get("data", {})

        if event == "tool-started":
            print(f"\n🔧 工具启动: {data.get('tool_name')}  (id={data.get('tool_call_id')})")
            print(f"   入参: {data.get('input')}")
        elif event == "tool-output-delta":
            print(data.get("delta", ""), end="", flush=True)
        elif event == "tool-finished":
            print(f"\n✅ 工具完成: {data.get('tool_name')}  (id={data.get('tool_call_id')})")
        elif event == "tool-error":
            print(f"\n❌ 工具出错: {data.get('error')}")

    print("\n" + "=" * 60)
    print("最终 state:")
    final = graph.get_state(config)
    for m in final.values["messages"]:
        content = m.content if isinstance(m.content, str) else str(m.content)
        print(f"  [{type(m).__name__}] {content[:80]}")


if __name__ == "__main__":
    main()
```





### 总结

**checkpoints**、**tasks**和**debug**一般用于调试模式；



**messages** 和**update**比较多用于给到前端；



流式输出在父子图模式下，子图需要当成父图的节点，如果不是的话需要拿到父图的config 给到子图；

``` python
def summarize(state: MessagesState) -> MessagesState:
    """父图节点：在节点内手动调用子图，需要把父图 config 传下去"""
    config = get_config()  # ✅ 拿到父图当前节点的运行 config
    # ✅ 关键：把 config 传给子图 invoke，子图的流式才能冒泡到父图
    result = summary_subgraph.invoke(state, config=config)
    # ✅ 把子图结果合并回父图 state，否则白白算了
    return {"messages": result["messages"]}
```



**管道+自定义+llm.stream** 可能**比较直观**一点和 **好控制**，如果采用invoke让langgraph内部自己帮你处理流式输出，尤其是多智能体的方式下比较**黑盒**；

# interrupt 人机交互

