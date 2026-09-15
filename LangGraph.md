# LangGraph

**LangGraph** 是由 **LangChain** 团队推出的一个开源框架，用于构建**复杂、可控、有状态（Stateful）的 AI Agent（智能体）工作流**。它的核心思想是：**用图（Graph）来组织 AI 的执行流程，而不是简单的线性调用。** 



![image-20260915094236533](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260915094236533.png)

`create_agent` 目前可以实现理解用户意图、自动选择工具、调用工具、根据结果继续推理；但是都基于提示词约束整体的流程，并让 LLM 决策流程；



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

   LangGraph 中的 **State** 实质就是一个字典（**dict**），而 TypedDict 就是“**有类型注解**的 **dict**”，与 LangGraph 的执行机制无缝对接，而 Pydantic 是类结构，需要 .dict() 转换，略显多余

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

**Reducer（归并函数）**：在 LangGraph 中，所有节点返回的都是“局部更新结果”，**Reducer 是用于合并多个节点输出更新的机制**。 **将每个节点返回的“局部状态更新”统一合并进全局的 State。**

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

大多数现代 LLM 提供商都提供聊天模型接口，接受消息列表作为输入。LangChain尤其接受`ChatModel`对象列表以`Message`作为输入。这些消息有多种形式，例如`HumanMessage`（用户输入）或`AIMessage`（LLM 响应）。



**在图表中使用消息**

在许多情况下，将之前的对话历史记录以消息列表的形式存储在图状态中会很有帮助。为此，我们可以向图状态添加一个键（通道），该键存储`Message`对象列表，并使用 Reducer 函数对其进行注释。Reducer 函数对于指示图如何`Message`在每次状态更新（例如，当节点发送更新时）时更新状态中的对象列表至关重要。如果您未指定 Reducer，则每次状态更新都会用最新提供的值覆盖消息列表。如果您只想将消息附加到现有列表中，可以使用`operator.add`。



```Python
operator 是 Python 的一个内置模块，把常见的运算符（如 +、-、==、getitem 等）变成了函数，方便函数式编程和高阶函数使用。
```



有场景可能还需要手动更新图状态中的消息（例如，人机交互）。 如果想去修改之前的某一个状态，但使用 `operator.add`，您发送到图的手动状态更新将被附加到现有消息列表中，而不是更新现有消息。

为了避免这种情况，您需要一个能够跟踪**消息 ID** 并在更新时覆盖现有消息的 Reducer。 为此，您可以使用预构建 **add_messages** 函数。 对于新消息，它只会附加到现有列表中，但它也会正确处理现有消息的更新。



``` python
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from typing import Annotated
from typing_extensions import TypedDict

class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```



### MessagesState

由于在状态中包含消息列表非常常见，因此存在一个名为`MessagesState`的预建状态，它使使用消息变得非常简单。该状态`MessagesState`使用单个键定义`messages`，该键是对象列表`AnyMessage`并使用`add_messages`。通常，需要跟踪的状态不仅仅是消息，所以我们可以通过继承的方式

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

**Edge（边）** 是连接节点的通道，表示图中**节点之间的执行跳转关系**。可以把它理解为「节点执行完之后，下一步去哪，是构成 LangGraph 流程图的核心。

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



# Command命令



# runtime运行时



# tool工具



# 子图



# 检查点



# 长期记忆



# 多智能体



# 流式输出

