# LangChain

**LangChain 是一个大模型应用开发框架，它负责把大模型、提示词、工具、知识库、记忆等能力连接起来，帮助开发者快速构建 RAG 和 Agent 应用；**

**如果 GPT、Claude、DeepSeek 等大模型是“大脑”，那么 LangChain 就是帮助大脑连接各种能力的“神经系统”。它能够帮助开发者快速构建AI应用。**

## 创建agent

```python
from langchain.agents import create_agent


# 创建一个工具
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city}的天气是晴朗的!"


# 创建Agent代理
agent = create_agent(
    # 模型
    model=model,
    # 工具
    tools=[get_weather],
    # 系统提示
    system_prompt="你是一个乐于助人的助手，能够回答用户关于天气的问题。请使用提供的工具来获取天气信息。",
)

# 创建一个消息
message = {
    "messages": [
        {"role": "user", "content": "广州的天气怎么样?"}
    ]
}

# 调用Agent代理
result = agent.invoke(
    message
)

print(result["messages"][-1].content) # 输出结果: 广州今天天气晴朗，是个好天气！☀️ 适合出门活动哦。
```

**create_agent** 方法用于创建 Agent，model 是模型，tools 工具， system_prompt 系统提示；

## Messages消息

在 LangChain 体系中，Message 是与大语言模型进行交互时的**基础数据结构**，用于维护和管理模型的上下文窗口——它不仅包含实际的对话文本内容，还附带角色标识、时间戳等元数据以完整表征当前的会话状态。



1. **Role角色（system, user, assistant, tool）：表示消息类型**
2. **Content内容：表示消息的实际内容（文本、图片、文档等）**
3. **Metadata元数据：可选字段，如响应信息、消息ID和令牌使用情况**



``` python
{
        "messages": [
            {
                "role": "user", # 角色
                "content": "广州的天气怎么样?", # 内容
                "metadata": { # 元数据
                    "timestamp": "2026-06-10T13:40:30Z",
                }
            }
        ]
    }
```

langchian会提供对不同角色的类

``` python
from langchain.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

message = [
    SystemMessage(
        content="你是一个乐于助人的助手，能够回答用户关于天气的问题。请使用提供的工具来获取天气信息。"
    ), # 系统提示

    HumanMessage(content="广州的天气怎么样?"), # 用户提示

    ToolMessage(content="广州今天天气晴朗。"), # 工具提示 

    AIMessage(content="广州今天天气晴朗，是个好天气！☀️ 适合出门活动哦。"), # 代理提示，LLM 的回复
]

```



## 提示词工程

**提示词工程**（**Prompt Engineering**），就是通过优化提示词让模型输出结果更符合业务需求。

一般来说系统提示词包含以下五个部分：



**系统指令**：设定角色、任务目标、输出格式和规则，相当于给AI的“人设”和“总纲领”。

``` python
SystemMessage(contet="你是一位资深Python开发工程师，请用中文回答问题。")
```



**工具函数定义**：描述AI可以调用的外部工具或函数，包括名称、参数和说明。

``` python
{"name": "get_weather", "parameters": {...}}
```



**上下文/背景知识**：提供完成任务所需的背景文档、数据或示例（Few-shot），是静态的参考资料。

一份用户手册、一篇新闻原文、3个问答示例。



**对话历史**：多轮对话中的历史消息记录，是模型理解上下文的“记忆”。

用户之前问的3个问题和AI的回答。



**用户输入**：当前最新的、动态的用户问题或指令，是每次请求中最核心的变化部分。

``` python
HumanMessage(content="请总结一下今天沪深股市的走势。")
```



``` python
# 创建系统提示词
system_prompt = """
# 角色
你是一位小红书爆款推文作者。

# 目标
根据用户提供的主题，创作一篇小红书推文。

# 输出格式
Markdown

# 内容要求
1. **标题**：提供3个不同风格的爆款标题
   - 公式：数字+形容词+关键词+情绪词（如："3款巨显白发色 | 黄皮必冲！"）

2. **正文**：
   - 开头（2行内抓眼球）：痛点提问或直接安利
   - 中间：分点陈述（用emoji，加粗重点），写真实体验而非堆砌参数
   - 结尾：引导互动（"评论区聊聊你的看法～"）

3. **话题标签**：提供10个精准标签，组合策略：大流量词+细分词+场景词

4. **视觉建议**：一句话描述封面/配图风格

# 风格要求
口语化、有情绪感、善用"绝了""谁懂啊""真的会谢"等小红书高频词。
"""

# 创建代理
agent = create_agent(
    model=model,
    system_prompt=system_prompt
)

# 进行流式输出
for token, metadata in agent.stream(
        {"messages": [HumanMessage(content="帮我写一篇小红书推文，主题是'如何在家制作美味蛋糕'")]},
                      stream_mode="messages",
):
    print(token.content, end="", flush=True)
```

**推荐使用Markdown的语法去编写提示词。**



## Tools工具

**工具（Tool）** 是 Agent 可以调用的外部函数或能力。简单来说，工具就是 Agent 的“手脚”——让 LLM 不仅会说，还能做事。

内置工具：https://docs.langchain.com/oss/python/integrations/tools

### 自定义工具

自定义工具函数，并使用**@tool**装饰器进行注册
函数名称会被当作工具的名称，函数参数会被当作工具的输入参数，函数返回值会被当作工具的输出结果；函数的文档字符串会当作工具的描述
所以文档字符串需要清晰地描述工具的功能和输入输出参数的含义，以便Agent能够正确地调用工具并理解其功能

``` python
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息
    
    Args:
        city (str): 城市名称
    Returns:
        str: 城市的天气信息
    """
    return f"{city}的天气是晴朗的!" 
  
  
```

可以在**@tool**装饰器中添加**description**参数来提供工具的描述信息，这样Agent在调用工具时就能更好地理解工具的功能和用途

``` python
import numexpr  # 用于计算数学表达式的库，可以高效地评估字符串形式的数学表达式 

@tool("calculator", description="执行算术计算。用这个来解数学题。输入应该是一个数学表达式，例如 '2 + 2' 或 'sqrt(16)'。")

def calc(expression: str) -> str:
    """计算数学表达式
    
    Args:
        expression (str): 数学表达式
    
    Returns:
        str: 计算结果
    """
    return str(numexpr.evaluate(expression).item())


```

还可以使用Pydantic模型来定义工具的输入参数，这样可以更清晰地描述工具的输入结构和类型，并且在Agent调用工具时能够进行参数验证和自动补全

``` python
from pydantic import BaseModel, Field

class CalculateInput(BaseModel):
    operation: str = Field(description="要执行的运算类型，如 'add' 或 'multiply'")
    a: float = Field(description="第一个操作数")
    b: float = Field(description="第二个操作数")

@tool("calculator", args_schema=CalculateInput)
def calculate(operation: str, a: float, b: float) -> str:
    """当你需要进行数学计算时使用此工具"""
    if operation == "add":
        return str(a + b)
    elif operation == "multiply":
        return str(a * b)
    return "Unknown operation"
```

还可以通过 response_format 返回一个二元组的方式，有些情况还是需要在程序中额外的出来。

``` python
@tool(response_format="content_and_artifact")
def get_weather(city: str):
    """
    获取指定城市的天气信息

    Args:
        city (str): 城市名称
    Returns:
        str: 城市的天气信息
    """
    return f"{city}的天气是晴朗的!", {"artifact": "weather_info"}
```



#### 描述工程（Description Engineering）

模型完全依赖描述来理解和使用工具，因此描述必须极其精准。

- **做什么**：具体说明工具功能，避免“帮助做”、“可用于”等模糊词汇。
- **何时用**：明确触发条件和适用场景。
- **输入是什么**：说明每个参数的含义、格式、约束和默认值。
- **返回什么**：描述输出结构和格式，包括成功及错误的示例。



#### 参数设计（Parameter Design）

- **自文档化命名**：参数名应清晰表明用途，如`customer_id`，避免使用`x`、`val`等无意义命名。
- **让非法状态不可表示**：善用JSON Schema约束。
  - **明确类型**：为每个参数指定`type`；
  - **使用枚举**：参数值固定时，用`enum`列出所有选项；
  - **标记必填**：在`required`数组中列出必填参数；
  - **禁止额外字段**：



#### 工具实现细节

- **错误信息设计**：错误信息应同时服务于**开发者（调试）** 和**Agent（恢复）**。为Agent提供**可操作的指导**，指明如何修正。
- **响应格式优化**：
  - **默认简洁**：返回核心字段，而非全部数据。
  - **支持分页**：对大量结果进行分页，默认返回20-50项。
  - **设置长度限制**：对文本输出设置字符数限制（如25,000字符）并优雅截断。



#### 工具集管理

- **命名空间**：当工具数量增多时，使用命名空间（如`user.*`, `order.*`）来组织，避免混乱。
- **精简工具集**：保持同时提供给模型的工具集尽可能小，只提供当前任务最相关的工具。
- **明确边界**：在描述中清晰界定该工具与其他工具的职责边界，避免模型混淆。





## Function Calling

**为什么需要有Function Calling技术呢？**

1. **封闭的“黑盒子”结构**：
   1. 传统的大模型（如 GPT-3）只能生成自然语言，不知道如何**调用工具、检索信息或执行操作**。
   2. 比如你问它“明天天气怎么样”，它可能只能胡乱猜测，因为无法连接实时天气服务。
2. **缺乏可控性和可扩展性**：
   1. 模型的推理过程不透明，无法指定它“先查再答”或“先调用数据库再总结”。
   2. 想让模型做一些有顺序的、需要外部操作的任务（如代码执行、数据库查询）很困难。
3. **上下文长度限制 & 知识过时问题**：
   1. 模型的知识是训练时固定的，无法更新。
   2. 没法自己“上网搜索”或“调用知识库 API”。

核心需求是：**让大模型像程序一样，调用外部函数**。

- 让模型“知道”有哪些函数可用，并“学会”在适当的时机调用它们。

OpenAI Function Calling：https://platform.openai.com/docs/guides/function-calling



### Function Calling 的核心概念：严格的“格式化输出”

**核心**：**Function Calling** 是赋予大语言模型（LLM）**生成结构化指令**以驱动外部工具的能力。

**本质**：它并非由模型直接执行代码，而是让模型充当“翻译官”**和**“决策员”。它将用户的模糊意图，精准转化为机器能理解的结构化数据（如 JSON）。

**意义：** 它打破了 LLM 的“知识围墙”，通过外挂函数库，让模型能够获取实时数据（如天气、股价）并操作物理世界（如发邮件、关灯）。



###  Tool Calling 的核心概念：完整的“工具执行闭环”

本质是**让大模型“使用外挂装备”**。

- **核心机制**：它不仅包含第一阶段的“格式化输出”，还默认包含了**工具的调度、执行和结果反馈**。当模型决定调用工具时，系统会暂停推理，去执行真实的 API（查数据库、搜网页），然后把拿到的结果**再喂给模型**，让模型基于真实数据生成最终回答。
- **核心公式**：`用户提问` + `工具集` = **（执行真实API）** -> **基于真实数据的最终回答**。

![image-20260812132658469](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260812132658469.png)

``` python
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import numpy as np

# 加载环境变量
load_dotenv()

# 配置
MODEL_NAME = "qwen3.6-27b"  # 建议使用最新模型以获得更好的指令遵循能力
API_KEY = os.getenv("DASHSCOPE_API_KEY")
BASE_URL = os.getenv("DASHSCOPE_BASE_URL")

# 调用qwen模型
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# ==========================================
# 1. 数据准备 (模拟数据库/全局上下文)
# ==========================================
df_employees = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'],
    'Age': [25, 30, 35, 28, 32, 45, 29, 40],
    'Salary': [50000.0, 75000.5, 95000.75, 62000.0, 88000.25, 120000.0, 55000.0, 105000.0],
    'Department': ['IT', 'HR', 'IT', 'Finance', 'IT', 'Finance', 'HR', 'IT'],
    'IsMarried': [True, False, True, False, True, True, False, True],
    'YearsExperience': [3, 5, 8, 4, 7, 15, 4, 12]
})


# 获取数据的 Schema 信息，用于告诉 LLM 数据长什么样
def get_data_schema():
    return f"""
    数据集包含以下列：
    - Name (str): 员工姓名
    - Age (int): 年龄
    - Salary (float): 年薪
    - Department (str): 部门 (包含: {', '.join(df_employees['Department'].unique())})
    - IsMarried (bool): 婚姻状况
    - YearsExperience (int): 工作年限
    数据总行数: {len(df_employees)}
    """


# ==========================================
# 2. 业务函数定义 (不再接收 input_json)
# ==========================================

def calculate_salary_statistics():
    """计算薪资的统计信息"""
    try:
        # 直接使用全局 df，或者从数据库查询
        stats = {
            "average": round(df_employees['Salary'].mean(), 2),
            "median": round(df_employees['Salary'].median(), 2),
            "max": round(df_employees['Salary'].max(), 2),
            "min": round(df_employees['Salary'].min(), 2)
        }
        return json.dumps(stats)
    except Exception as e:
        return json.dumps({"error": str(e)})


def analyze_by_department():
    """按部门统计分析"""
    try:
        dept_stats = df_employees.groupby('Department').agg({
            'Name': 'count',
            'Salary': 'mean',
            'Age': 'mean'
        }).round(2)

        result = dept_stats.rename(columns={'Name': 'count', 'Salary': 'avg_salary', 'Age': 'avg_age'}).to_dict(
            orient='index')
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})


def find_employees_by_criteria(min_salary=None, max_age=None, department=None):
    """根据条件筛选员工"""
    try:
        df = df_employees.copy()
        if min_salary:
            df = df[df['Salary'] >= min_salary]
        if max_age:
            df = df[df['Age'] <= max_age]
        if department:
            df = df[df['Department'] == department]

        result = df[['Name', 'Department', 'Salary', 'Age']].to_dict(orient='records')
        return json.dumps({"count": len(result), "data": result}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})


def analyze_experience_salary_correlation():
    """分析经验与薪资相关性"""
    try:
        corr = df_employees['YearsExperience'].corr(df_employees['Salary'])
        return json.dumps({"correlation_coefficient": round(corr, 4)})
    except Exception as e:
        return json.dumps({"error": str(e)})


# 函数映射表      模型决定使用工具后会返回 tools_call{name："calculate_salary_statistics"， args:{a,b}}
# 通过函数映射表动态的去调用函数
FUNCTION_MAP = {
    "calculate_salary_statistics": calculate_salary_statistics,
    "analyze_by_department": analyze_by_department,
    "find_employees_by_criteria": find_employees_by_criteria,
    "analyze_experience_salary_correlation": analyze_experience_salary_correlation,
}

# ==========================================
# 3. Tools 定义   提供给模型进行参考的，模型会根据这个信息决定使用哪些工具
# ==========================================
tools = [
    {
        "type": "function",  # 类型
        "function": {  # 函数的信息
            "name": "calculate_salary_statistics",  # 函数名称
            "description": "计算全公司员工薪资的统计指标（平均值、中位数、最大最小）",  # 函数描述
            "parameters": {"type": "object", "properties": {}, "required": []}  # 函数参数
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_by_department",
            "description": "按部门进行分组统计（人数、平均薪资、平均年龄）",
            "parameters": {"type": "object", "properties": {}, "required": []}  # 无参数
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_employees_by_criteria",
            "description": "筛选员工。如果不指定条件，则不要传参。",
            "parameters": {
                "type": "object",  # 参数是object
                "properties": {  # 参数列表
                    "min_salary": {"type": "number", "description": "最低薪资"},
                    "max_age": {"type": "integer", "description": "最大年龄"},
                    "department": {"type": "string", "description": "部门名称"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_experience_salary_correlation",
            "description": "计算工作年限与薪资的相关系数",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    }
]


# ==========================================
# 4. 核心执行逻辑 (支持并行调用)
# ==========================================
def run_query(query):
    print(f"\n{'=' * 60}\n用户提问: {query}\n{'=' * 60}")

    # System Prompt: 注入 Schema 而不是 Data
    messages = [
        {"role": "system",
         "content": f"你是高级数据分析师。当前持有员工数据如下：\n{get_data_schema()}\n请根据用户需求调用工具。"},
        {"role": "user", "content": query}
    ]
    # 当前问题：IT部门有多少人？他们的平均工资是多少？
    # 1. 第一次调用 LLM,   模型就会根据问题，输出我需要调用哪些工具
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        tools=tools,  # 工具列表传递给模型
        tool_choice="auto"
    )

    response_msg = response.choices[0].message
    # 返回要调用的工具列表，，，，，模型会直接决策是否要使用多个工具
    tool_calls = response_msg.tool_calls

    # 2. 判断是否需要调用工具
    if tool_calls:
        print(f"模型决定调用 {len(tool_calls)} 个工具...")
        # 必须把模型的回复（包含 tool_calls）加入历史，否则第二次请求会报错
        messages.append(response_msg)

        # 3. 循环执行所有工具调用 (并行 Function Calling)   案例演示是同步调用工具，langchain调用工具是会按照智能体规划的计划来去调用工具
        for tool_call in tool_calls:
            # 获取调用的函数名称
            fn_name = tool_call.function.name
            # 获取调用的函数参数
            fn_args = json.loads(tool_call.function.arguments)

            print(f"  -> 执行工具: {fn_name} | 参数: {fn_args}")

            if fn_name in FUNCTION_MAP:
                # 手动执行模型需要调用的工具  FUNCTION_MAP->得到对应的工具calculate_salary_statistics()
                # 本质就等于手动调用了calculate_salary_statistics()
                fn_result = FUNCTION_MAP[fn_name](**fn_args)  # **fn_args 解包

                # 将结果作为 tool message 加入历史
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,  # 必须匹配 ID,  模型决定调用工具会生成一个id
                    "name": fn_name,
                    "content": fn_result  # 函数的结果填充到历史记录中
                })
                print(f"  <- 结果: {fn_result}")
            else:
                print(f"Error: 函数 {fn_name} 未定义")

        # 4. 第二次调用 LLM，获取最终自然语言回答
        final_response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages
        )
        print(f"\n 最终回答:\n{final_response.choices[0].message.content}")

    else:
        print(f"直接回答: {response_msg.content}")


# ==========================================
# 5. 运行测试
# ==========================================
if __name__ == "__main__":
    # 复杂查询：测试并行调用或多条件
    queries = [
        # "IT部门有多少人？他们的平均工资是多少？",  # 简单查询
        # "帮我找一下工资高于8万的IT部门员工，顺便算一下全公司的薪资相关性。",  # 复合查询，可能触发并行调用
        "今天天气怎么样"
    ]

    for q in queries:
        run_query(q)
```

### 总结

在LangChain Agent里，Function Calling是**模型与外部工具交互的标准化协议**，而Agent则是利用这一协议的**自主决策循环引擎**。

**核心机制**

**本质上是“思考-行动-观察”的闭环：**

- **思考**：Agent收到问题，不直接回答，而是调用LLM生成带`tool_calls`参数的JSON指令。
- **行动**：LangChain的`create_agent`返回的Agent对象（其底层通过**中间件系统**实现）自动解析JSON，**本地执行对应的Python函数**，拿到返回结果。
- **观察**：将结果封装成`ToolMessage`回传给模型，作为下一次思考的依据，直到任务结束。

**相比原生API的单次调用，LangChain的核心价值在于：**

- **封装屏蔽**：统一了OpenAI、通义等不同厂商的`tool_calls`格式差异。
- **状态管理**：自动维护`messages`列表，处理好`tool_call_id`的匹配，确保多轮工具返回不乱序。

**注意：**

这里有个优化点：Agent支持一次返回多个`tool_calls`实现**并行调用**；但生产环境必须设`max_iterations`防死循环，且在工具执行层做好**权限校验**。

### 并发多个工具

``` python
import time
from settings import app_settings
from langchain.tools import tool
from langchain.agents import create_agent

model = app_settings.get_qwen_client()


# -------- 1. 定义两个模拟耗时工具 --------
@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    time.sleep(2)
    return f"{city}：晴天，28°C"


@tool
def get_population(city: str) -> str:
    """查询指定城市的人口数量"""
    time.sleep(2)
    return f"{city}：约 2000 万人口"


# -------- 2. 绑定工具并创建 Agent --------
tools = [get_weather, get_population]

agent = create_agent(
    model, tools=tools,
    system_prompt="你是一个乐于助人的助手。"
)

# -------- 3. 提问并计时 --------
start_time = time.time()
result = agent.invoke({"messages": [("user", "北京今天的天气和人口分别是多少？")]})
print("总耗时：", time.time() - start_time)
print("最终回答：", result["messages"][-1].content)


for message in result['messages']:
    # if hasattr(message, 'dict'):
    #     pprint(message.dict())
    # else:
    #     pprint(message)
    # print()
    msg_type = message.type
    content = message.content

    # 1. 打印基本类型和文本内容
    print(f"【类型】: {msg_type}")
    if content:
        print(f"【文本内容】: {content}")

    # 2. 重点：如果是 AI 消息，检查是否有工具调用请求
    if msg_type == 'ai':
        # 标准属性（LangChain 官方格式）
        tool_calls = getattr(message, 'tool_calls', [])
        # 备用：某些模型（如 OpenAI）会放在 additional_kwargs 里
        if not tool_calls:
            tool_calls = message.additional_kwargs.get('tool_calls', [])

        if tool_calls:
            print(f"【🔧 请求调用的工具】: ")
            for tc in tool_calls:
                # 兼容不同格式，有的用 'function' 包裹，有的直接展开
                if 'function' in tc:
                    func = tc['function']
                    print(f"   - 工具名: {func.get('name')}")
                    print(f"   - 参数: {func.get('arguments')}")
                else:
                    print(f"   - 工具名: {tc.get('name')}")
                    print(f"   - 参数: {tc.get('args')}")
                print(f"   - ID: {tc.get('id')}")

    # 3. 如果是 Tool 消息（工具执行结果）
    if msg_type == 'tool':
        print(f"【🔧 工具执行结果】: {content}")
        print(f"   - 对应请求ID: {getattr(message, 'tool_call_id', 'N/A')}")

    print("-" * 60)  # 分隔线
    

    
总耗时： 7.856186866760254
最终回答： 北京今天的天气是**晴天**，气温为 **28°C**。
北京的人口约为 **2000 万**。

【类型】: human
【文本内容】: 北京今天的天气和人口分别是多少？
------------------------------------------------------------
【类型】: ai
【🔧 请求调用的工具】: 
- 工具名: get_weather
- 参数: {'city': '北京'}
- ID: call_c89b5bf134b54cf9af223a34
- 工具名: get_population
- 参数: {'city': '北京'}
- ID: call_b3ca299dd0c040109235f958
------------------------------------------------------------
【类型】: tool
【文本内容】: 北京：晴天，28°C
【🔧 工具执行结果】: 北京：晴天，28°C
- 对应请求ID: call_c89b5bf134b54cf9af223a34
------------------------------------------------------------
【类型】: tool
【文本内容】: 北京：约 2000 万人口
【🔧 工具执行结果】: 北京：约 2000 万人口
- 对应请求ID: call_b3ca299dd0c040109235f958
------------------------------------------------------------
【类型】: ai
【文本内容】: 北京今天的天气是**晴天**，气温为 **28°C**。
北京的人口约为 **2000 万**。
------------------------------------------------------------

```

实现并行原理

- **模型侧**：当LLM判断多个工具调用互不依赖时，会在一次`assistant`消息中同时返回多个`tool_calls`对象（列表）。
- **框架侧**：LangGraph的`ToolNode`在接收到列表后，会利用`asyncio.gather`批量异步执行这些工具函数，因此总耗时 ≈ 最慢那个工具的耗时（2秒），而非累加（4秒）。
- **关键前提**：必须确保工具是**线程安全**的（比如不共享全局可变变量），否则需要用`asyncio.Semaphore`控制并发数。



### 并行调用失败

待补充

## state状态

状态是Agent运行过程中的“工作记忆本”，用来在节点之间传递和共享信息，保证任务可以连续、正确的执行；

![image-20260812152514684](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260812152514684.png)

``` python
from pprint import pprint

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息

    Args:
        city (str): 城市名称
    Returns:
        str: 城市的天气信息
    """
    return f"{city}的天气是晴朗的!"

# 创建一个Agent实例
agent = create_agent(
    model=model,
    tools=[get_weather]
    # checkpointer=InMemorySaver(),  # 使用InMemorySaver来保存对话状态，这样在同一线程中进行的对话可以共享状态
)

# 定义一个线程配置，指定线程ID为"user_1"，这样在同一线程中进行的对话可以共享状态
thread_config = {"configurable": {"thread_id": "user_1"}}

# 第一次对话，Agent会记住用户的名字并在后续对话中使用这个信息
response_1 = agent.invoke(
    {"messages": [{"role": "user", "content": "你好，今天北京的天气如何？"}]},
)

for message in response_1['messages']:
    # if hasattr(message, 'dict'):
    #     pprint(message.dict())
    # else:
    #     pprint(message)
    # print()
    msg_type = message.type
    content = message.content

    # 1. 打印基本类型和文本内容
    print(f"【类型】: {msg_type}")
    if content:
        print(f"【文本内容】: {content}")

    # 2. 重点：如果是 AI 消息，检查是否有工具调用请求
    if msg_type == 'ai':
        # 标准属性（LangChain 官方格式）
        tool_calls = getattr(message, 'tool_calls', [])
        # 备用：某些模型（如 OpenAI）会放在 additional_kwargs 里
        if not tool_calls:
            tool_calls = message.additional_kwargs.get('tool_calls', [])

        if tool_calls:
            print(f"【🔧 请求调用的工具】: ")
            for tc in tool_calls:
                # 兼容不同格式，有的用 'function' 包裹，有的直接展开
                if 'function' in tc:
                    func = tc['function']
                    print(f"   - 工具名: {func.get('name')}")
                    print(f"   - 参数: {func.get('arguments')}")
                else:
                    print(f"   - 工具名: {tc.get('name')}")
                    print(f"   - 参数: {tc.get('args')}")
                print(f"   - ID: {tc.get('id')}")

    # 3. 如果是 Tool 消息（工具执行结果）
    if msg_type == 'tool':
        print(f"【🔧 工具执行结果】: {content}")
        print(f"   - 对应请求ID: {getattr(message, 'tool_call_id', 'N/A')}")

    print("-" * 60)  # 分隔线
```

输出

``` python
【类型】: human
【文本内容】: 你好，今天北京的天气如何？
------------------------------------------------------------
【类型】: ai
【🔧 请求调用的工具】: 
   - 工具名: get_weather
   - 参数: {'city': '北京'}
   - ID: call_6fe4269bf397465badb523fc
------------------------------------------------------------
【类型】: tool
【文本内容】: 北京的天气是晴朗的!
【🔧 工具执行结果】: 北京的天气是晴朗的!
   - 对应请求ID: call_6fe4269bf397465badb523fc
------------------------------------------------------------
【类型】: ai
【文本内容】: 你好！今天北京的天气是**晴朗**的 ☀️，是个好天气！适合出门活动哦。还有什么我可以帮你的吗？
------------------------------------------------------------
```

这个 Message 就是整个 Agent 运行过程中所有的状态；

**细节查看 LangGraph；**

## Short-term memory短期记忆

记忆系统就像人工智能体的“人类大脑”，让它能“记住”你们之前的每次聊天。有了记忆，AI才能从过往的交流中学习，逐渐摸清你的喜好，变得越来越“懂你”。当处理复杂问题、需要多聊几句时，这种能力不仅能大大提高办事效率，更能让你感觉是在和一个真正了解你的贴心伙伴交流。

**对话历史**是**短期记忆**最常见的形式。长时间的对话对当今的语言学习模型（LLM）构成挑战；完整的对话历史可能无法容纳在语言学习模型的**上下文窗口**中，从而导致**上下文丢失**或错误。

**短期记忆本质就是存储State状态。**

短期记忆是一个线程级（会话），需要在创建代理的时候指定一个**checkpointer**检查点。

``` python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

# 创建一个Agent实例
agent = create_agent(
    model=model,
    checkpointer=InMemorySaver(),  # 使用InMemorySaver来保存对话状态，这样在同一线程中进行的对话可以共享状态
)

# 定义一个线程配置，指定线程ID为"user_1"，这样在同一线程中进行的对话可以共享状态
thread_config = {"configurable": {"thread_id": "user_1"}}

# 第一次对话，Agent会记住用户的名字并在后续对话中使用这个信息
response_1 = agent.invoke(
    {"messages": [{"role": "user", "content": "你好，我的名字叫做张三！"}]},
    thread_config,  # type: ignore
)

print(response_1['messages'][-1].content) # 你好，张三！很高兴认识你。请问今天有什么我可以帮你的吗？

# 在同一线程中进行的对话可以共享状态，所以当用户再次询问自己的名字时，Agent能够记住之前的对话内容并正确回答
response_2 = agent.invoke(
    {"messages": [{"role": "user", "content": "我的名字是什么？"}]},
    thread_config,  # type: ignore
)

print(response_2['messages'][-1].content) # 你的名字是张三。
```

以上记忆只是在**内存**中存储的。在生产中数据需要持久化，所以使用数据库支持的检查点工具

比如可以考虑使用**langgraph-checkpoint-postgres**

有关更多检查点选项，包括 SQLite、Postgres 和 Azure Cosmos DB，官方文档中的[检查点库列表](https://docs.langchain.com/oss/python/langgraph/checkpointers#checkpointer-libraries)。

``` python

from langgraph.checkpoint.postgres import PostgresSaver

# 数据库连接URI，格式为：postgresql://用户名:密码@主机地址:端口号/数据库名称?sslmode=disable关闭 SSL 加密连接
DB_URI = "postgresql://postgres:12345678@localhost:5432/langchain_agent_01?sslmode=disable"


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息

    Args:
        city (str): 城市名称
    Returns:
        str: 城市的天气信息
    """
    return f"{city}的天气是晴朗的!"


# 创建一个Agent实例
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup()  # 在PostgreSQL中自动创建表

    # 创建一个Agent实例，并将PostgresSaver作为检查点传递给Agent，这样在同一线程中进行的对话可以共享状态
    agent = create_agent(
        model,
        tools=[get_weather],
        checkpointer=checkpointer
    )

    # 定义一个线程配置，指定线程ID为"user_1"，这样在同一线程中进行的对话可以共享状态
    thread_config = {"configurable": {"thread_id": "user_1"}}

    # 第一次对话，Agent会记住用户的名字并在后续对话中使用这个信息
    response = agent.invoke(
        {"messages": [{"role": "user", "content": "你好，我的名字叫做青雀！"}]},
        thread_config,  # type: ignore
    )["messages"][-1].content

    print(response)

    # 在同一线程中进行的对话可以共享状态，所以当用户再次询问自己的名字时，Agent能够记住之前的对话内容并正确回答
    response = agent.invoke(
        {"messages": [{"role": "user", "content": "我的名字是什么？"}]},
        thread_config, # type: ignore
    )["messages"][-1].content

    print(response)  # "你的名字是青雀！"
```



## 自定义Agent记忆

代理默认是使用`AgentState`去管理记忆的，但是有时候需要一些额外的字段去拓展；

``` python
class AgentState(TypedDict, Generic[ResponseT]):
    """State schema for the agent."""
    
    # 聊天消息记录
    messages: Required[Annotated[list[AnyMessage], add_messages]]
    # 代理能跳转的地方["tools", "model", "end"]
    jump_to: NotRequired[Annotated[JumpTo | None, EphemeralValue, PrivateStateAttr]]
    # Agent代理返回格式限制
    structured_response: NotRequired[Annotated[ResponseT, OmitFromInput]]

```

**扩展额外的字段**，通过 **`state_scheme `**参数传递给 **`create_agent`**。

``` python
from typing import cast
from langchain.agents import create_agent, AgentState
from langgraph.checkpoint.memory import InMemorySaver


class CustomAgentState(AgentState):
    user_id: int  # 用于存储用户的ID
    user_name: str  # 用于存储用户的名字
    hobby: dict  # 用于存储用户的爱好


# 创建一个Agent实例
agent = create_agent(
    model=model,
    # 使用自定义的State来存储对话状态
    state_schema=cast(type[AgentState], CustomAgentState),  # 关键：为了编辑器不警告，实际使用中可以忽略
    # 使用InMemorySaver来保存对话状态，这样在同一线程中进行的对话可以共享状态
    checkpointer=InMemorySaver(),
)

# 定义一个线程配置，指定线程ID为"user_1"，这样在同一线程中进行的对话可以共享状态
thread_config = {"configurable": {"thread_id": "user_1"}}

agent.invoke(
    {
        "messages": [{"role": "user", "content": "你好，我的名字叫做青雀！"}],
        # 在输入参数中直接传递用户的ID、名字和爱好等信息，这些信息会被存储在Agent的State中，并且在同一线程中进行的对话可以共享这些状态信息？
        "user_id": "user_id_12345678901234567890",
        "user_name": "青雀",
        "hobby": {
            "sport": "篮球",
            "music": "流行音乐",
            "movie": "动作片",
            "game": "英雄联盟",
            "book": "《活着是为了快乐》",
            "tv_show": "《老友记》",
            "food": "披萨",
            "drink": "可乐",
            "hobby": "阅读",
            "other": "旅行",
        }
    },
    thread_config,  # type: ignore
)
```



## Streaming流媒体

流式输出是一种让 AI 应用能够“边说边想”的技术。它不再是让用户面对一个加载图标苦等完整的回答，而是像人与人对话一样，在生成过程中就一个词一个词地实时显示内容，极大地提升了交互体验。



![image-20260812195618820](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260812195618820.png)

### updates

按执行步骤输出，每个步骤执行完后对应的状态；

``` python
from settings import app_settings
from langchain.agents import create_agent
from langchain.tools import tool

llm = app_settings.get_qwen_client()


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气"""
    return f'{city}的天气是晴天'


agent = create_agent(
    model=llm,
    system_prompt="你是一个乐于助人的智能助手，能够回答用户关于天气的问题，可以使用提供的工具来获取城市的天气信息",
    tools=[get_weather],
)


def main():
    for chunk in agent.stream(
            {"messages": [{"role": "user", "content": "长沙天气怎么样?"}]},
            stream_mode="updates",
            version="v2",
    ):
        if chunk["type"] == "updates":
            for step, data in chunk["data"].items():
                print(f"节点: {step}")
                print(f"content: {data['messages'][-1].content_blocks}")


if __name__ == '__main__':
    main()

    # 节点: model
    # content: [{'type': 'reasoning',
    #            'reasoning': '用户询问长沙的天气。\n我需要调用get_weather工具，传入参数city="长沙"。\n然后返回获取到的天气信息。'},
    #           {'type': 'tool_call', 'id': 'call_3c059510a35646b4911420fa', 'name': 'get_weather',
    #            'args': {'city': '长沙'}}]
    
    

    # 节点: tools
    # content: [{'type': 'text', 'text': '长沙的天气是晴天'}]
    
    

    
    # 节点: model
    # content: [{'type': 'reasoning',
    #            'reasoning': '用户询问长沙的天气，我调用了get_weather工具并得到了结果：长沙的天气是晴天。现在我需要把这个结果用自然语言回复给用户。'},
    #           {'type': 'text',
    #            'text': '长沙现在的天气是晴天 ☀️。如果您需要了解更详细的天气信息（如温度、湿度等），请告诉我！'}]

```

### messages

模型一个token一个token的蹦出来；

``` python
for chunk in agent.stream(
        {"messages": [{"role": "user", "content": "长沙天气怎么样?"}]},
        stream_mode="messages",
        version="v2",
):
    if chunk["type"] == "messages":
        # 在"messages"模式下，流式输出的每个chunk包含一个完整的消息对象和元数据，我们可以直接访问消息内容
        token, metadata = chunk["data"]
        print(f"node: {metadata['langgraph_node']}")
        print(f"content: {token.content_blocks}")  # 会输出很多空的内容，代表模型在进行思考，直到最后输出完整的消息内容
        print("\n")
```



### custom

自定义你需要给到用户的信息

``` python
from langgraph.config import get_stream_writer

from settings import app_settings

model = app_settings.get_qwen_client()

from langchain.tools import tool
from langchain.agents import create_agent


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气
    Args:
        city(str): 城市名称
    Returns:
        str: 天气情况
    """
    stream_writer = get_stream_writer()
    stream_writer(f"正在获取{city}的天气信息...")
    stream_writer(f"{city}的天气信息获取完成！{city}的天气是晴朗的!")
    return f"{city}的天气是晴朗的!"


agent = create_agent(
    model=model,
    system_prompt="你是一个乐于助人的智能助手，能够回答用户关于天气的问题，可以使用提供的工具来获取城市的天气信息",
    tools=[get_weather],
)


def main():
    for chunk in agent.stream(
            {"messages": [{"role": "user", "content": "长沙天气怎么样?"}]},
            stream_mode="custom",
            version="v2",
    ):
        if chunk["type"] == "custom":
            print(chunk["data"])


if __name__ == '__main__':
    main()
```

组合使用

``` python
def main():
    for chunk in agent.stream(
            {"messages": [{"role": "user", "content": "长沙天气怎么样?"}]},
            stream_mode=['messages', 'custom', 'updates'],
            version="v2",
    ):
        if chunk["type"] == "custom":
            print(chunk["data"])

        if chunk["type"] == "updates":
            pass

        if chunk["type"] == "messages":
            pass


if __name__ == '__main__':
    main()
```

### event事件流(Beta测试版)

``` python
stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "长沙天气怎么样？"}]},
    version="v3",
)


def main():
    for message in stream.messages:
        print("获取消息的文本增量和最终文本:")
        for delta in message.text:
            print(delta, end="", flush=True)
        print("获取模型生成工具调用时的内容")
        print(message.tool_calls.get())
        print("获取模型本次输出消息:")
        print(message.output)
        print("获取模型本次推理消息:")
        for delta in message.reasoning:
            print(f"[thinking] {delta}", end="", flush=True)


if __name__ == '__main__':
    main()
```

## Structured output结构化输出

**结构化输出**，简单来说，就是让**AI模型**（如GPT、Claude等）不再是“随口说”一段自然语言，而是严格按照你预先定义好的“**表格**”或“**表单**”来生成数据

**LangChain**实现结构化输出，主要通过**两种策略**：

1. 原生策略 (ProviderStrategy)：利用OpenAI、Anthropic等模型API自带的JSON模式。模型在“生成层”就保证输出格式正确，最可靠。（优先选择）

   ``` python
   from pydantic import BaseModel
   
   class Person(BaseModel):
       name: str
       age: int
   
   # 绑定结构化输出
   structured_llm = model.with_structured_output(Person)
   
   # 直接调用，得到的就是 Person 对象！
   result = structured_llm.invoke("提取：张三，今年25岁")
   
   print(result.name)  # 输出: 张三
   print(result.age)   # 输出: 25
   ```

   ``` python
   """
   langchain支持四种方式去支持模型原生结构化输出
   1.Pydantic模型  -提供数据校验功能、自动转化等功能
   2.Dataclass    -是Python标准库自带的，主要用于简化类的定义
   3.Typeddict    -用于约束字典（Dict）的键和值的类型,运行时就是一个普通的字典
   4.json Schema  -JSON格式规范
   
   """
   from langchain_qwq import ChatQwen
   from dotenv import load_dotenv
   import os
   
   # 加载环境变量
   load_dotenv()
   
   # 初始化模型
   llm = ChatQwen(
       model="deepseek-v4-flash",
       api_key=os.getenv("DASHSCOPE_API_KEY"),
       base_url=os.getenv("DASHSCOPE_BASE_URL")
   )
   
   # 使用qwen模型的结构化输出需要遵守以下内容
   """
   在请求体中设置 response_format 参数即可开启结构化输出，需满足以下两个条件：
   1.设置response_format参数：将 response_format 参数设置为 {"type": "json_object"}。
   2.提示词中包含JSON关键词：System Message 或 User Message 中必须包含"JSON"关键词（不区分大小写），否则API会返回错误：
       'messages' must contain the word 'json' in some form, to use 'response_format' of type 'json_object'.
   """
   
   # ============================================================
   # 1. Pydantic模型
   # ============================================================
   from pydantic import BaseModel, Field
   from langchain.agents import create_agent
   from langchain.messages import HumanMessage
   from langchain.agents.structured_output import ProviderStrategy
   
   class UserInfoPydantic(BaseModel):
       """用户信息"""
       name: str = Field(description="用户姓名")
       age: int = Field(description="用户年龄")
       phone: str = Field(description="手机号")
   
   # 创建代理
   agent_pydantic = create_agent(
       model=llm,
       system_prompt="你是一个信息提取助手。请始终以JSON格式输出提取的结构化数据。",
       response_format=ProviderStrategy(UserInfoPydantic)
   )
   message = [HumanMessage(content="我的名字叫张三，今年20岁，手机号：18578656489")]
   result_pydantic = agent_pydantic.invoke({"messages": message})
   print("1. Pydantic模型结果:")
   print(result_pydantic["structured_response"])
   print("-" * 50)
   
   
   # ============================================================
   # 2. Dataclass (Python标准库)
   # ============================================================
   from dataclasses import dataclass, field
   from langchain.agents import create_agent
   from langchain.messages import HumanMessage
   
   @dataclass
   class UserInfoDataclass:
       """用户信息"""
       name: str = field(metadata={"description": "用户姓名"})
       age: int = field(metadata={"description": "用户年龄"})
       phone: str = field(metadata={"description": "手机号"})
   
   # 创建代理
   agent_dataclass = create_agent(
       model=llm,
       system_prompt="你是一个信息提取助手。请始终以JSON格式输出提取的结构化数据。",
       response_format=UserInfoDataclass
   )
   message = [HumanMessage(content="我的名字叫李四，今年25岁，手机号：13800138000")]
   result_dataclass = agent_dataclass.invoke({"messages": message})
   print("2. Dataclass结果:")
   print(result_dataclass["structured_response"])
   print("-" * 50)
   
   
   # ============================================================
   # 3. TypedDict (类型约束字典)
   # ============================================================
   from typing import TypedDict
   from langchain.agents import create_agent
   from langchain.messages import HumanMessage
   
   class UserInfoTypedDict(TypedDict):
       """用户信息"""
       name: str   # 用户姓名
       age: int    # 用户年龄
       phone: str  # 手机号
   
   # 创建代理
   agent_typeddict = create_agent(
       model=llm,
       system_prompt="你是一个信息提取助手。请始终以JSON格式输出提取的结构化数据。",
       response_format=UserInfoTypedDict
   )
   message = [HumanMessage(content="我的名字叫王五，今年30岁，手机号：13900139000")]
   result_typeddict = agent_typeddict.invoke({"messages": message})
   print("3. TypedDict结果:")
   print(result_typeddict["structured_response"])
   print("-" * 50)
   
   
   # ============================================================
   # 4. Json Schema (直接传入JSON Schema字典)
   # ============================================================
   from langchain.agents import create_agent
   from langchain.messages import HumanMessage
   
   # 定义JSON Schema
   user_info_schema = {
       "type": "object",
       "properties": {
           "name": {
               "type": "string",
               "description": "用户姓名"
           },
           "age": {
               "type": "integer",
               "description": "用户年龄"
           },
           "phone": {
               "type": "string",
               "description": "手机号"
           }
       },
       "required": ["name", "age", "phone"]
   }
   
   # 创建代理
   agent_json_schema = create_agent(
       model=llm,
       system_prompt="你是一个信息提取助手。请始终以JSON格式输出提取的结构化数据。",
       response_format=user_info_schema
   )
   message = [HumanMessage(content="我的名字叫赵六，今年28岁，手机号：13700137000")]
   result_json_schema = agent_json_schema.invoke({"messages": message})
   print("4. Json Schema结果:")
   print(result_json_schema["structured_response"])
   print("-" * 50)
   ```

   

2. 工具策略 (ToolStrategy)：把输出要求伪装成一个“工具”让模型调用。兼容不支持原生JSON模式的模型，但需要处理可能的格式错误。（当模型不支持结构化输出的时候选择）



``` python
from pydantic import BaseModel, Field
from typing import Literal
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain_qwq import ChatQwen
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

# 初始化模型
llm = ChatQwen(
    model="qwen3.6-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url=os.getenv("DASHSCOPE_BASE_URL")
)
# ToolStrategy也支持 pydantic、Dataclass、TypedDict、JSON Schema四种方式，使用方式和模型原生策略一致
# 创建模型类
class ProductReview(BaseModel):
    """产品评价分析结果"""
    rating: int | None = Field(description="产品评分", ge=1, le=5)
    sentiment: Literal["positive", "negative"] = Field(description="评价的情感倾向")
    key_points: list[str] = Field(description="评价的关键要点")

# 创建代理
agent = create_agent(
    model=llm,
    response_format=ToolStrategy(ProductReview)
)

# 接触多智能体就用的多了
# 主智能体  -> {"意图识别": "子智能体1"}   结构化的提取作为一个工具或者子智能体进行使用
# 子智能体1 子智能体2 子智能体3

# 下一个工具的输入参数    是上一个工具的输出内容-> {....}

# 执行代理
result = agent.invoke({
    "messages": [{"role": "user", "content": "分析这条产品评价：'很棒的5星产品。发货很快，但是有点贵'"}]
})
print(result["structured_response"])
# 注意，使用ToolStrategy进行结构化输出，messages中最后一条消息会以ToolMessage结尾
"""
ToolMessage(content="Returning structured response: rating=5 sentiment='positive' key_points=['产品很棒', '发货速度快', '价格偏高']", 
    name='ProductReview', id='475c134e-39c7-44d3-a2ee-563b3c05c069', tool_call_id='call_07384fcbdd3b494ca4b7aeff')]
"""
print(result)
```





## Runtime运行时

**核心定义**：在 LangChain 1.0 中，Runtime 是由底层 LangGraph 提供的一个依赖注入（DI）容器和执行环境。 **通俗比喻**：如果把大模型（Model）比作智能体的大脑，各类工具（Tool）是智能体用来做事的手脚，那 Runtime 就是智能体专属的微型工作台操作系统。智能体执行任务全程，所有临时信息、外部资源、会话记忆、流式输出、权限身份都由它统一调度托管，给大脑和手脚提供完整、有序的工作环境。

![image-20260813144129581](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260813144129581.png)

### Runtime 的核心组件

- **Context（上下文）**：存放静态、不可变的配置信息。例如用户 ID、数据库连接等。它在一次会话中保持不变，为工具提供基础依赖。
- **Store（存储器）**：用于实现长期记忆（BaseStore 实例）。允许智能体跨会话保存和读取固化的数据。
- **State（状态）**：存放交互过程中的可变数据。例如当前的对话历史（messages 列表）、计数器等，类似于前端框架中的 State。
- **Execution Info（运行配置）**：存放可变的标准运行时配置。例如 `thread_id`、运行id、重试次数等。
- **Stream Writer（流写入器）**：用于实现低延迟的流式响应，允许智能体在执行过程中实时向用户推送进度或更新信息。
- **Server info（服务器信息）**: 仅在LangGraph服务器上运行时的服务器特定元数据（助理ID、图ID、已验证用户）



### Conetxt运行依赖

Runtime Context 是单次运行的静态上下文

``` python
from langchain.agents import create_agent
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import ToolRuntime
from pydantic import BaseModel
from langchain.tools import tool

from settings import app_settings

model = app_settings.get_qwen_client()

checkpointer = InMemorySaver()


class UserContext(BaseModel):
    user_id: str
    order_id: str


@tool
def query_order(runtime: ToolRuntime[UserContext]):
    """
    查询订单信息
    """
    print('====== 获取对于的状态（短期记忆） =====')
    for msg in runtime.state["messages"]:  # 获取对于的状态（短期记忆）
        msg.pretty_print()
    print()
    print()
    print()
    print()
    return f'订单号：${runtime.context.order_id} 当前订单状态：待发货， 预计发货时间：2026-08-29， 货物正在准备中， 请耐心等待'  # 工具返回值会自动处理转成ToolMessage


config: RunnableConfig = {"configurable": {"thread_id": "user_1"}}

agent = create_agent(
    model=model,
    checkpointer=checkpointer,
    context_schema=UserContext,
    tools=[query_order],
)

res = agent.invoke(
    {
        "messages": [
            {"role": "user", "content": "你好, 帮我查询订单"},
        ],
    },
    config=config,
    context=UserContext(user_id="123", order_id="456"),
)['messages'][-1]

res.pretty_print()

# ====== 获取对于的状态（短期记忆） =====
# ================================ Human Message =================================
# 
# 你好, 帮我查询订单
# ================================== Ai Message ==================================
# Tool Calls:
#   query_order (call_12df77646abf4983b5664232)
#  Call ID: call_12df77646abf4983b5664232
#   Args:
# 
# 
# 
# 
# ================================== Ai Message ==================================
# 
# 您好！我已经为您查询到订单信息，以下是您的订单详情：
# 
# - **订单号**：$456
# - **当前状态**：待发货
# - **预计发货时间**：2026年8月29日
# - **状态说明**：货物正在准备中，请耐心等待
# 
# 您的订单目前正在准备中，预计将在8月29日发货。如果您还有其他问题，欢迎随时咨询！
```

runtime context 不会自动成为模型 prompt 的一部分，只有当 Tool、Middleware 或其他业务逻辑主动读取它，再把相关信息加入模型上下文时，LLM 才能看到。



### State当前状态

``` python
from typing import TypedDict

from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from settings import app_settings


model = app_settings.get_qwen_client()

class State(AgentState):
    count: int


@tool
def increment(
    runtime: ToolRuntime[State],
) -> Command:
    """将计数器加 1。"""

    current_count = runtime.state["count"]

    return Command( # 更新 state
        update={
            "count": current_count + 1,
            "messages": [
                ToolMessage(
                    tool_call_id=runtime.tool_call_id,
                    output="计数器已加 1"
                )
            ],
        }
    )


agent = create_agent(
    model=model,
    tools=[increment],
    state_schema=State,
)


result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "把计数器加 1"
            }
        ],
        "count": 0,
    }
)

print("count =", result["count"])

for message in result["messages"]:
    message.pretty_print()
    

# count = 1
# ================================ Human Message =================================
# 
# 把计数器加 1
# ================================== Ai Message ==================================
# Tool Calls:
#   increment (call_228438fdc9404dbf9814c311)
#  Call ID: call_228438fdc9404dbf9814c311
#   Args:
# ================================= Tool Message =================================
# Name: increment
# 
# None
# ================================== Ai Message ==================================
# 
# 计数器已经成功加 1 了！
```

#### 搭配 context

以及通过 tool 修改 state 状态；

``` python
from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from pydantic import BaseModel
from settings import app_settings

model = app_settings.get_qwen_client()


# -----------------------------
# Runtime Context
# -----------------------------

class Context(BaseModel):
    user_id: str


# -----------------------------
# State
# -----------------------------

class State(AgentState):
    count: int


# -----------------------------
# Tool
# -----------------------------

@tool
def increment(
        runtime: ToolRuntime[Context, State],
) -> Command:
    """
    同时读取 Runtime Context 和 State。
    """

    user_id = runtime.context.user_id
    count = runtime.state["count"]

    print(
        f"user={user_id}, "
        f"current_count={count}",
        f"tool_call_id={runtime.tool_call_id}",
    )
		
    # 添加 Command 是为了告诉 Model 这次执行 tool 后的结果，为了在 state message 插入一条 ToolMessage；
    # 如果在别的时候简单只是为了更新 state，就没必要这么操作；
    # 不允许这么干， runtime.state["count"] =  1；虽然可行；但不符合 agent runtime State Update 通道；
    # Command：将 Tool 的执行结果 + 对 State 的修改意图；
    # return Command(
    #     update={
    #         "count": count + 1
    #     }
    # )
    # 也可以在中间件处理修改状态；
    return Command(
        update={
            "count": count + 1,
            "messages": [
                ToolMessage(
                    content=f"Count现在是{count + 1}",
                    tool_call_id=runtime.tool_call_id,
                )
            ]
        }
    )


# -----------------------------
# Agent
# -----------------------------

agent = create_agent( # type: ignore
    model=model,
    tools=[increment],
    context_schema=Context,
    state_schema=State,
)

# -----------------------------
# Invoke
# -----------------------------

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "把计数器加 1"
            }
        ],
        "count": 0,
    },
    context=Context(
        user_id="user_001"
    ),
)

print()
print()
print()
print()
print("Result:")
for message in result["messages"]:
    message.pretty_print()


# user=user_001, current_count=0 tool_call_id=call_825f491fb6f94202877bcc1e
# 
# 
# 
# 
# Result:
# ================================ Human Message =================================
# 
# 把计数器加 1
# ================================== Ai Message ==================================
# Tool Calls:
#   increment (call_825f491fb6f94202877bcc1e)
#  Call ID: call_825f491fb6f94202877bcc1e
#   Args:
# ================================= Tool Message =================================
# Name: increment
# 
# Count现在是1
# ================================== Ai Message ==================================
# 
# 计数器已经加 1，现在的值是 **1**。
```

#### 中间件修改 state 状态

``` python
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import AgentMiddleware
from settings import app_settings

model = app_settings.get_qwen_client()


# ============================================================
# State
# ============================================================

class State(AgentState):  # type: ignore
    count: int
    user_name: str


# ============================================================
# Middleware
# ============================================================

class MyMiddleware(AgentMiddleware[State]):  # type: ignore

    def before_agent(
            self,
            state: State,
            runtime,
    ):
        print("\n========== before_agent ==========")

        print("进入前:")
        print("count =", state.get("count"))
        print("user_name =", state.get("user_name"))

        # 修改 State
        return {
            "count": state.get("count", 0) + 1,
            "user_name": "青雀",
        }

    def before_model(
            self,
            state: State,
            runtime,
    ):
        print("\n========== before_model ==========")

        print("before_agent 修改之后:")
        print("count =", state.get("count"))
        print("user_name =", state.get("user_name"))

        # 再修改一次 State
        return {
            "count": state.get("count", 0) + 1,
        }


# ============================================================
# Model
# ============================================================


# ============================================================
# Agent
# ============================================================

agent = create_agent(  # type: ignore
    model=model,
    tools=[],
    state_schema=State,
    middleware=[
        MyMiddleware(),
    ],
)

# ============================================================
# Invoke
# ============================================================

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "你好",
            }
        ],
        "count": 0,
        "user_name": "",
    }
)

# ============================================================
# 最终 State
# ============================================================

print("\n========== 最终 State ==========")

print("count =", result["count"])
print("user_name =", result["user_name"])

print("\n最后消息:")
print(result["messages"][-1].content)


# ========== before_agent ==========
# 进入前:
# count = 0
# user_name =
#
# ========== before_model ==========
# before_agent 修改之后:
# count = 1
# user_name = 青雀
#
# ========== 最终 State ==========
# count = 2
# user_name = 青雀
#
# 最后消息:
# 你好！有什么我可以帮你的吗？
```





 ## Middleware中间件系统

**Middleware 是 Agent Runtime 的可插拔控制层，用来拦截、观察、修改 Agent 执行过程。**

![image-20260813182007721](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260813182007721.png)

### 生命周期 Hook

| before_agent | 每次代理调用之前 |
| ------------ | ---------------- |
| before_model | 每次模型调用之前 |
| after_model  | 每次模型调用之后 |
| after_agent  | 每次调用代理之后 |

### Wrapper Hook

| wrap_model_call | 每次模型调用的时候 |
| --------------- | ------------------ |
| wrap_tool_call  | 每次调用工具的时候 |

``` python


# ============================================================
# Tool
# ============================================================

@tool
def add(a: int, b: int) -> int:
    """计算两个整数的和。"""
    print("\n>>>>>>>>>> TOOL: add() 正在执行")

    result = a + b

    print(f">>>>>>>>>> TOOL: {a} + {b} = {result}")

    return result


# ============================================================
# 1. before_agent
# ============================================================

@before_agent
def my_before_agent(
        state,
        runtime,
):
    print("\n")
    print("=" * 60)
    print("BEFORE AGENT")
    print("=" * 60)

    print("Agent 开始执行")

    messages = state.get("messages", [])

    print(f"当前 messages 数量: {len(messages)}")

    return None


# ============================================================
# 2. after_agent
# ============================================================

@after_agent
def my_after_agent(
        state,
        runtime,
):
    print("\n")
    print("=" * 60)
    print("AFTER AGENT")
    print("=" * 60)

    print("Agent 执行结束")

    messages = state.get("messages", [])

    print(f"最终 messages 数量: {len(messages)}")

    return None


# ============================================================
# 3. before_model
# ============================================================

@before_model
def my_before_model(
        state,
        runtime,
):
    print("\n")
    print("-" * 60)
    print("BEFORE MODEL")
    print("-" * 60)

    messages = state.get("messages", [])

    print(f"Model 调用之前，messages 数量: {len(messages)}")

    return None


# ============================================================
# 4. after_model
# ============================================================

@after_model
def my_after_model(
        state,
        runtime,
):
    print("\n")
    print("-" * 60)
    print("AFTER MODEL")
    print("-" * 60)

    messages = state.get("messages", [])

    print(f"Model 调用完成，messages 数量: {len(messages)}")

    return None


# ============================================================
# 5. wrap_model_call
# ============================================================

@wrap_model_call
def my_wrap_model_call(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
):
    print("\n")
    print("**************** WRAP MODEL BEFORE ****************")

    print(f"当前 Model: {request.model}")

    # 真正执行 Model
    response = handler(request)

    print("**************** WRAP MODEL AFTER ****************")

    return response


# ============================================================
# 6. wrap_tool_call
# ============================================================

@wrap_tool_call
def my_wrap_tool_call(
        request,
        handler,
):
    print("\n")
    print("################ WRAP TOOL BEFORE ################")

    print(f"Tool 名称: {request.tool_call['name']}")
    print(f"Tool 参数: {request.tool_call['args']}")

    try:
        # 真正执行 Tool
        result = handler(request)

        print("################ WRAP TOOL AFTER ################")
        print("Tool 执行成功")

        return result

    except Exception as e:

        print("################ TOOL ERROR ################")
        print(f"Tool 执行失败: {e}")

        raise


# ============================================================
# Model
# ============================================================

# -----------------------------
# Agent
# -----------------------------

agent = create_agent(  # type: ignore
    model=model,
    tools=[add],
    middleware=[
        my_before_agent,
        my_after_agent,
        my_before_model,
        my_after_model,
        my_wrap_model_call,
        my_wrap_tool_call,
    ],
)

# -----------------------------
# Invoke
# -----------------------------

res = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "请使用工具计算 10 + 20。",
            }
        ]
    }
)

print()
print()
print()
print()
print("Result:")
for message in res["messages"]:
    message.pretty_print()




# ============================================================
# BEFORE AGENT
# ============================================================
# Agent 开始执行
# 当前 messages 数量: 1
# 
# 
# ------------------------------------------------------------
# BEFORE MODEL
# ------------------------------------------------------------
# Model 调用之前，messages 数量: 1
# 
# 
# **************** WRAP MODEL BEFORE ****************
# 当前 Model: metadata={'lc_versions': {'langchain-core': '1.5.3', 'langchain': '1.3.14', 'langchain-openai': '1.4.2'}} output_version=None client=<openai.resources.chat.completions.completions.Completions object at 0x1338f0050> async_client=<openai.resources.chat.completions.completions.AsyncCompletions object at 0x1338f0c20> root_client=<openai.OpenAI object at 0x13172fcb0> root_async_client=<openai.AsyncOpenAI object at 0x1338f01a0> model_name='qwen3.7-plus' model_kwargs={} openai_api_key=SecretStr('**********') openai_api_base='https://ws-r3iazzqszhc9lrm7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1' openai_proxy=None stream_chunk_timeout=120.0 api_key=SecretStr('**********') api_base='https://ws-r3iazzqszhc9lrm7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1' enable_thinking=True
# **************** WRAP MODEL AFTER ****************
# 
# 
# ------------------------------------------------------------
# AFTER MODEL
# ------------------------------------------------------------
# Model 调用完成，messages 数量: 2
# 
# 
# ################ WRAP TOOL BEFORE ################
# Tool 名称: add
# Tool 参数: {'a': 10, 'b': 20}
# 
# >>>>>>>>>> TOOL: add() 正在执行
# >>>>>>>>>> TOOL: 10 + 20 = 30
# ################ WRAP TOOL AFTER ################
# Tool 执行成功
# 
# 
# ------------------------------------------------------------
# BEFORE MODEL
# ------------------------------------------------------------
# Model 调用之前，messages 数量: 3
# 
# 
# **************** WRAP MODEL BEFORE ****************
# 当前 Model: metadata={'lc_versions': {'langchain-core': '1.5.3', 'langchain': '1.3.14', 'langchain-openai': '1.4.2'}} output_version=None client=<openai.resources.chat.completions.completions.Completions object at 0x1338f0050> async_client=<openai.resources.chat.completions.completions.AsyncCompletions object at 0x1338f0c20> root_client=<openai.OpenAI object at 0x13172fcb0> root_async_client=<openai.AsyncOpenAI object at 0x1338f01a0> model_name='qwen3.7-plus' model_kwargs={} openai_api_key=SecretStr('**********') openai_api_base='https://ws-r3iazzqszhc9lrm7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1' openai_proxy=None stream_chunk_timeout=120.0 extra_body={'enable_thinking': True} api_key=SecretStr('**********') api_base='https://ws-r3iazzqszhc9lrm7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1' enable_thinking=True
# **************** WRAP MODEL AFTER ****************
# 
# 
# ------------------------------------------------------------
# AFTER MODEL
# ------------------------------------------------------------
# Model 调用完成，messages 数量: 4
# 
# 
# ============================================================
# AFTER AGENT
# ============================================================
# Agent 执行结束
# 最终 messages 数量: 4
# 
# 
# 
# 
# Result:
# ================================ Human Message =================================
# 
# 请使用工具计算 10 + 20。
# ================================== Ai Message ==================================
# Tool Calls:
#   add (call_55b5d0bfbe2d4abaa1bc9aac)
#  Call ID: call_55b5d0bfbe2d4abaa1bc9aac
#   Args:
#     a: 10
#     b: 20
# ================================= Tool Message =================================
# Name: add
# 
# 30
# ================================== Ai Message ==================================
# 
# 10 + 20 = 30
```

### 摘要

``` python
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langchain_tavily import TavilySearch
from settings import app_settings
from langchain.agents import create_agent

# ============================================================
# 主模型
# ============================================================

model = app_settings.get_qwen_client()

"""
 SummarizationMiddleware(
            model=model,  # 进行摘要的模型
            trigger=("tokens", 4000),  
             # 条件控制要保留多少上下文信息 只能选择一个
                1.fraction- 要保留的模型上下文大小的比例
                2.tokens- 要保留的绝对令牌数量
                3.messages- 要保留的最近消息数量
            keep=("messages", 20),
        ),
        
trigger 决定“什么时候压缩”，keep 决定“压缩后保留多少近期信息”；真正合理的参数应该由 Token Budget + 线上 P90/P95 上下文长度共同决定，而不是由 message 数量拍脑袋决定
"""

SHORT_SUMMARY_PROMPT = """你是一个记忆压缩专家。
请将下方的对话历史压缩成一段简洁的背景摘要，保留以下核心：
1. 用户最终想要解决的问题是什么？
2. 已经执行了哪些关键步骤或得到了哪些结论？
3. 还有哪些待办事项？

请直接输出摘要内容，不要包含任何开场白。

待压缩的对话：
{messages}
"""

tools = [TavilySearch(max_results=1, tavily_api_key=app_settings.get_tavily_api_key())]

agent = create_agent(
    model=model,
    tools=tools,
    middleware=[
        SummarizationMiddleware(
            model=model,
            SHORT_SUMMARY_PROMPT=SHORT_SUMMARY_PROMPT,
            trigger=[("tokens", 4000), ("messages", 10)],  # 触发条件
            keep=("messages", 2),  # 摘要后要保留多少上下文信息
        ),
    ],
    checkpointer=InMemorySaver()
)


def run_test():
    print("=== 开始 Agent 自动化测试 ===")
    config = {"configurable": {"thread_id": "1"}}

    # 场景 1：基础问答 + 工具调用（验证 Tavily 搜索是否正常）
    print("\n[测试点 1: 工具调用]")
    query_1 = "2026年3月最新的AI大模型技术趋势是什么？请列出3-4点 简单总结内容"
    print(f"用户: {query_1}")
    response_1 = agent.invoke({"messages": [{"role": "user", "content": query_1}]}, config)
    print(f"Agent 响应: {response_1}")

    # 场景 2：连续对话（验证上下文保留与中间件触发）
    # 我们故意发送一些长文本，模拟达到 4000 tokens 或 3 条消息的触发条件
    print("\n[测试点 2: 多轮对话与摘要中间件验证]")

    test_conversations = [
        "请记住我的名字叫‘浩英’，我是一名AI架构师。",
        "刚才我问的技术趋势中，哪个对医疗行业影响最大？",
        "请基于我们刚才聊到的所有内容，给我写一份200字的行业简报。"
    ]

    for i, user_input in enumerate(test_conversations):
        print(f"\n第 {i + 2} 轮对话输入: {user_input}")
        # 执行对话
        res = agent.invoke({"messages": [{"role": "user", "content": user_input}]}, config)
        print(f"Agent 响应: {res}")

    print("\n=== 测试完成 ===")


if __name__ == "__main__":
    # 可以开启 LangChain 的调试模式查看中间件运行细节
    # import langchain
    # langchain.debug = True

    try:
        run_test()
    except Exception as e:
        print(f"测试过程中出现错误: {e}")

```

### 待办列表

``` python
import numexpr
from langchain.agents.middleware import TodoListMiddleware
from langchain.tools import tool
from langchain_tavily import TavilySearch
from settings import app_settings
from langchain.agents import create_agent

# ============================================================
# 主模型
# ============================================================

model = app_settings.get_qwen_client()


# 创建工具
@tool
def calculator(expression: str):
    """
    一个数学计算工具
    """
    return f"计算结果:{numexpr.evaluate(expression).item()}"


tools = [calculator, TavilySearch(max_results=1, tavily_api_key=app_settings.get_tavily_api_key())]

agent = create_agent(  # type: ignore
    model=model,
    tools=tools,
    middleware=[
        TodoListMiddleware(),
    ]
)

if __name__ == "__main__":
    result = agent.invoke(
        {"messages":
            {
                "role": "user",
                "content": "请帮我查询一下目前最新的小米su7的最低价格，在对比尚界z7的最低价格，他们的价格相差多少？"
                           "请使用待办事项"
            }
        }
    )
    print(result)
    print(result["todos"])

```

如果问题太简单了，TodoListMiddleware 默认不会开启待办事项；



### AgentMiddleware

复杂场景在在用 AgentMiddleware

``` python

class State(AgentState):
    model_calls: int


class JumpMiddleware(AgentMiddleware[State]):
    """
    当 Model 调用次数达到限制时：
    1. 更新 State
    2. Jump 到 END
    """

    # 声明这个 Middleware 允许跳转到 END
    can_jump_to = ["end"]

    def __init__(self, max_model_calls: int = 0):
        self.max_model_calls = max_model_calls

    @hook_config(can_jump_to=["end"])
    def before_agent(
            self,
            state: dict[str, Any],
            runtime: Runtime[Any],
    ):
        count = state.get("model_calls", 0)

        print(f"\n[before_agent] 当前 Model 调用次数: {count}")

        # 已经达到限制
        if count == 0:
            print("[before_agent] 达到最大调用次数")
            print("[before_agent] Jump -> END")

            return {
                "messages": [AIMessage(content=(
                    f"Model 最多只能调用 "
                    f"{self.max_model_calls} 次，"
                    "本次 Agent 提前结束。"
                ))],
                "jump_to": "end"
            }

        # 正常情况：更新 State
        return {
            "model_calls": count + 1
        }

    def before_model(
            self,
            state: State,
            runtime: Runtime[Any],
    ):
        model_calls = state.get("model_calls", 0)
        print(f"[before_model] 当前 Model 调用次数: {model_calls}")
        return None


# --------------------------------------------------
# Model
# --------------------------------------------------

from langchain_openai import ChatOpenAI

# --------------------------------------------------
# Agent
# --------------------------------------------------

agent = create_agent(  # type: ignore
    model=model,
    tools=[],
    state_schema=State,
    middleware=[
        JumpMiddleware(max_model_calls=0),
    ],
)

# --------------------------------------------------
# 执行
# --------------------------------------------------

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "你好，我叫青雀。",
            }
        ],
        "model_calls": 0,
    }
)

print("\n==============================")
print("最终 State")
print("==============================")

print("model_calls =", result.get("model_calls"))

print("\n最后消息：")
print(result["messages"][-1].content)



# [before_model] 当前 Model 调用次数: 0
# [before_model] 达到最大调用次数
# [before_model] Jump -> END
#
# ==============================
# 最终 State
# ==============================
# model_calls = 0
#
# 最后消息：
# Model 最多只能调用 0 次，本次 Agent 提前结束。
```



### dynamic_prompt动态提示词

`@dynamic_prompt` 是 LangChain 1.0 版本中专门为 Agent（智能体） 设计的一个装饰器。它的核心作用是让你能在 Agent 每次调用大模型之前，根据当时的上下文（比如用户身份、对话状态）实时地、动态地生成系统提示词。

``` python
from langchain.agents.middleware import dynamic_prompt, ModelRequest
from langchain.agents import AgentState, create_agent
from settings import app_settings
from typing import cast

model = app_settings.get_qwen_client()


class State(AgentState):
    language: str

@dynamic_prompt
def state_aware_prompt(request: ModelRequest) -> str:
    state = cast(State, cast(object, request.state)) # 强制断言，否则编辑器会警告
    language = state.get("language", "中文")

    if language == "中文":
        return "你是中文助手，只用中文回答。"

    return "You are an English assistant. Answer only in English."


agent = create_agent(  # type: ignore
    model=model,
    tools=[],
    state_schema=State,
    middleware=[state_aware_prompt],
)


result1 = agent.invoke({
    "messages": [
        {"role": "user", "content": "苹果是什么？"}
    ],
    "language": "中文",
})

for message in result1["messages"]:
    message.pretty_print()
    
# ================================ Human Message =================================
# 
# 苹果是什么？
# ================================== Ai Message ==================================
# 
# “苹果”这个词在日常生活中通常指代以下两种最常见的事物：
# 
# **1. 一种水果**
# 苹果（学名：*Malus pumila*）是蔷薇科苹果属植物的果实，也是世界上最广泛种植和食用的水果之一。它通常呈圆形，果皮颜色有红、绿、黄等，口感脆甜或微酸，富含水分、维生素、矿物质和膳食纤维。西方有句谚语“一天一苹果，医生远离我”，形容其丰富的营养价值。
# 
# **2. 一家知名科技公司**
# 苹果公司（Apple Inc.）是一家总部位于美国加利福尼亚州的跨国科技公司，由史蒂夫·乔布斯、斯蒂夫·沃兹尼亚克等人于1976年创立。它是全球最具价值和影响力的科技企业之一，其知名硬件产品包括 iPhone（智能手机）、Mac（个人电脑）、iPad（平板电脑）、Apple Watch（智能手表）等，并开发了 iOS、macOS 等操作系统。
# 
# 此外，在文化和科学史上，“苹果”也常被赋予特殊的象征意义，例如代表科学发现的“牛顿的苹果”，或在西方文学与艺术中代表诱惑的“伊甸园禁果”。
# 

print()
print('------------------------------------')
print()

result2 = agent.invoke({
    "messages": [
        {"role": "user", "content": "苹果是什么？"}
    ],
    "language": "English",
})

for message in result2["messages"]:
    message.pretty_print()

# ================================ Human Message =================================
# 
# 苹果是什么？
# ================================== Ai Message ==================================
# 
# "Apple" can refer to two main things:
# 
# 1. **The Fruit:** A round, edible fruit produced by an apple tree. It is typically red, green, or yellow in color and is known for its crisp texture and sweet or tart flavor. 
# 2. **The Technology Company:** Apple Inc., a major American multinational technology company that designs, manufactures, and sells consumer electronics, software, and online services, such as the iPhone, Mac computers, and the iPad.
```

``` python
from langchain.agents.middleware import dynamic_prompt, ModelRequest
from langchain.agents import create_agent
from pydantic import BaseModel

from settings import app_settings
from typing import cast

model = app_settings.get_qwen_client()


class Context(BaseModel):
    language: str


@dynamic_prompt
def state_aware_prompt(request: ModelRequest[Context]) -> str:
    context = cast(Context, request.runtime.context)

    language = context.language

    if language == "中文":
        return "你是中文助手，只用中文回答。"

    return "You are an English assistant. Answer only in English."


agent = create_agent(  # type: ignore
    model=model,
    tools=[],
    context_schema=Context,
    middleware=[state_aware_prompt],
)

result1 = agent.invoke({
    "messages": [
        {"role": "user", "content": "苹果是什么？"}
    ],

}, context=Context(language="中文"))

for message in result1["messages"]:
    message.pretty_print()

# ================================ Human Message =================================
#
# 苹果是什么？
# ================================== Ai Message ==================================
#
# “苹果”这个词在日常生活中通常指代以下两种最常见的事物：
#
# **1. 一种水果**
# 苹果（学名：*Malus pumila*）是蔷薇科苹果属植物的果实，也是世界上最广泛种植和食用的水果之一。它通常呈圆形，果皮颜色有红、绿、黄等，口感脆甜或微酸，富含水分、维生素、矿物质和膳食纤维。西方有句谚语“一天一苹果，医生远离我”，形容其丰富的营养价值。
#
# **2. 一家知名科技公司**
# 苹果公司（Apple Inc.）是一家总部位于美国加利福尼亚州的跨国科技公司，由史蒂夫·乔布斯、斯蒂夫·沃兹尼亚克等人于1976年创立。它是全球最具价值和影响力的科技企业之一，其知名硬件产品包括 iPhone（智能手机）、Mac（个人电脑）、iPad（平板电脑）、Apple Watch（智能手表）等，并开发了 iOS、macOS 等操作系统。
#
# 此外，在文化和科学史上，“苹果”也常被赋予特殊的象征意义，例如代表科学发现的“牛顿的苹果”，或在西方文学与艺术中代表诱惑的“伊甸园禁果”。
#

print()
print('------------------------------------')
print()

result2 = agent.invoke({
    "messages": [
        {"role": "user", "content": "苹果是什么？"}
    ],
}, context=Context(language="English"))

for message in result2["messages"]:
    message.pretty_print()

# ================================ Human Message =================================
#
# 苹果是什么？
# ================================== Ai Message ==================================
#
# "Apple" can refer to two main things:
#
# 1. **The Fruit:** A round, edible fruit produced by an apple tree. It is typically red, green, or yellow in color and is known for its crisp texture and sweet or tart flavor.
# 2. **The Technology Company:** Apple Inc., a major American multinational technology company that designs, manufactures, and sells consumer electronics, software, and online services, such as the iPhone, Mac computers, and the iPad.

```

### 总结

**业务逻辑与控制逻辑解耦 —— 解耦**

把 Agent 的业务能力和权限、日志、重试、限流、监控、Prompt 动态调整等横切逻辑分离。

**生产环境的“质量安全网” —— 鲁棒性**

在 Agent 执行过程中统一处理异常、重试、超时、权限、安全检查、Token 控制等问题，提高系统稳定性。

**运行时的动态“指挥部” —— 动态干预**

Middleware 可以在 Agent、Model、Tool 执行的关键生命周期节点读取和修改 State，并动态改变执行策略。

**AI 应用的 AOP 标准化 —— 工程化**

将日志、监控、鉴权、缓存、重试、审计、Prompt 管理等横切能力，以 Middleware 形式标准化、复用化。



**Middleware = 在不侵入 Agent 业务逻辑的前提下，对 Agent 的执行过程进行统一的观察、控制、干预和增强。**



## Runnable和LCEL（管道）

### 核心认知：Runnable 就是“能跑的东西”

在 LangChain 里，**任何**能用 `invoke()` 方法调用的组件，都叫 `Runnable`（提示词、模型、工具、链全都是）

**只需要记住一个方法：`invoke()`** —— 把数据丢进去，拿回结果;

LCEL 就是用竖线 `|` 把 Runnable 串起来：**前一个的输出** = **后一个的输入**。

``` python
from settings import app_settings
from langchain_core.prompts import ChatPromptTemplate

model = app_settings.get_qwen_client()

prompt = ChatPromptTemplate.from_template("讲个关于{topic}的冷笑话")

# print(prompt.invoke(
#     {"topic": "程序员"}))  # messages=[HumanMessage(content='讲个关于程序员的冷笑话', additional_kwargs={}, response_metadata={})]

model.invoke(prompt.invoke({"topic": "程序员"})).pretty_print()

# 用 | 组合成链
chain = prompt | model

chain.invoke({"topic": "程序员"}).pretty_print()


```

### 数据转换：用 `RunnableLambda` 包普通函数

要在管道中间处理数据（比如提取字段、改格式），用 `RunnableLambda` 把普通函数包起来，就能放进 `|` 管道了。

``` python
from settings import app_settings
from langchain_core.runnables import RunnableLambda

model = app_settings.get_qwen_client()

# 1. 定义一个普通函数：从字典中提取 name 字段，并构造问候语
def build_greeting(input_dict: dict) -> str:
    name = input_dict.get("name", "朋友")
    return f"请用中文问候 {name}，说一句温暖的话。"

# 2. 包装成 Runnable
greeting_runnable = RunnableLambda(build_greeting)

print(greeting_runnable.invoke({"name": "小明"})) # 请用中文问候 小明，说一句温暖的话。

# 4. 用 | 组合：先执行 greeting_runnable，输出字符串给模型
chain = greeting_runnable | model

# 5. 调用
result = chain.invoke({"name": "小明"})
print(result.content) # 无论今天有多忙碌，都别忘了给自己一个微笑，好好吃饭，好好照顾自己。愿你今天的每一刻都被温暖和快乐包围，一切顺心！




```

**提取字段**

``` python
# 模型返回的假设对象有 content 属性
def extract_content(model_output):
    return model_output.content

extract_runnable = RunnableLambda(extract_content)

# 管道：模型输出 → 提取 content → 后续处理（比如存储或打印）
chain = model | extract_runnable | (lambda x: print(x))

# -------------------------------------

# 模型返回的假设对象有 content 属性
def extract_content(model_output):
    return model_output.content


# 4. 用 | 组合：先执行 greeting_runnable，输出字符串给模型，再 执行extract_content取到 content 在打印出来
chain = greeting_runnable | model | RunnableLambda(extract_content) | RunnableLambda(lambda x: print(x))

# 5. 调用
chain.invoke({"name": "小明"})
```

**`Runnable` 是可调用单元，用 `|` 串联成管道——**上一个 `invoke()` 的返回值，自动成为下一个 `invoke()` 的入参**；`RunnableLambda` 就是把这个规则套到任意普通函数上，让它也能进管道。

### bind

**在 `|` 管道里没法动态传参，所以用 `bind()` 提前把额外参数焊死在 Runnable 上。**

``` python
# 在管道里，必须 bind
chain = prompt | model.bind(stop=["。"])
chain.invoke({"topic": "猫"})
```

自定义函数

``` python
from langchain_core.runnables import RunnableLambda

# 1. 定义函数：必须预留 **kwargs 或者显式声明参数名
def my_func(x, multiplier=1, suffix=""):
    return f"{x * multiplier}{suffix}"

# 2. 用 bind 把 multiplier 和 suffix 焊死在函数上
runnable = RunnableLambda(my_func).bind(multiplier=10, suffix="!!!")
# 注意：这里绑定的参数，会直接作为关键字参数传给 my_func

# 3. 调用时只需要传管道过来的数据（x）
print(runnable.invoke(5))  # 输出: 50!!!
```

### **RunnableBranch**

`RunnableBranch` 就是一个**条件路由器**。它让你在 `|` 管道里实现“根据输入内容，动态选择走哪条路”。

管道 `A | B | C` 是**固定的直线**，无法分叉。但真实场景是：用户问“天气”就走天气链，问“笑话”就走笑话链。`RunnableBranch` 就是用来解决这个的。

``` python
from settings import app_settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableBranch

model = app_settings.get_qwen_client()


# 定义两条不同的提示词链
joke_prompt = ChatPromptTemplate.from_template("讲个关于{topic}的笑话")
poem_prompt = ChatPromptTemplate.from_template("写一首关于{topic}的诗")

joke_chain = joke_prompt | model
poem_chain = poem_prompt | model

# 创建分支路由
branch = RunnableBranch(
    # 条件1：如果输入里包含"笑话"，走 joke_chain
    (lambda x: "笑话" in x["topic"], joke_chain),
    # 条件2：如果输入里包含"诗"，走 poem_chain
    (lambda x: "诗" in x["topic"], poem_chain),
    # 默认：上面都不满足，走这个（这里直接返回提示信息）
    RunnableLambda(lambda x: "我没听懂，请重新输入") # type: ignore
)

# 调用测试
print(branch.invoke({"topic": "讲个笑话"}))   # 走 joke_chain
print(branch.invoke({"topic": "写首诗"}))     # 走 poem_chain
print(branch.invoke({"topic": "随便"}))       # 走默认
```

**`RunnableBranch` 就是管道里的 `if-elif-else`，按顺序匹配，命中即停。**

### RunnableParallel

在 `|` 管道里，用**字典**把任务分叉，多个 Runnable **接收同一个输入**，**同时（并发）执行**，最后把结果**合并成一个字典**返回。

个输入（比如用户 ID），同时要查**天气 API**、查**新闻 API**、查**数据库**，串行等 3 秒，并行只要 1 秒。

``` python
# 模拟三个耗时任务（实际可换成模型调用、API请求）
import time

from langchain_core.runnables import RunnableLambda


def get_weather(city):
    time.sleep(1)  # 模拟 IO
    return f"{city} 晴天 25°C"

def get_news(city):
    time.sleep(1)
    return f"{city} 今日新闻：AI 又进化了"

def get_population(city):
    time.sleep(1)
    return f"{city} 人口 2000 万"

# 包装成 Runnable
weather_r = RunnableLambda(get_weather)
news_r = RunnableLambda(get_news)
pop_r = RunnableLambda(get_population)

# 关键：用字典并行执行
parallel_chain = {
    "weather": weather_r,
    "news": news_r,
    "population": pop_r,
}

# 调用（三个任务同时跑，总共耗时约 1 秒，而不是 3 秒）
result = RunnableLambda(lambda x: x["city"]) | parallel_chain | RunnableLambda(lambda x: print(x))
result.invoke({"city": "广州"})
# 输出: {'weather': '广州 晴天 25°C', 'news': '广州 今日新闻：AI 又进化了', 'population': '广州 人口 2000 万'}
```

**`batch()`（批量并发）**

不是同一个输入并行，而是**多个输入**同时处理（比如给 10 个城市同时查天气）：

``` python
inputs = [{"city": "北京"}, {"city": "上海"}, {"city": "广州"}]
results = weather_r.batch(inputs, config={"max_concurrency": 5}) 
# 5 个线程并发，比 for 循环快 5 倍
```





### **astream_events**

监听每一步的流式输出，适合前端打字机效果或调试中间结果。



### with_fallbacks

主链报错时，自动切换备用链。



### .pick() + .assign()

- **`pick`**：从字典中只取指定字段。
- **`assign`**：保留原字段，额外新增计算字段。



### with_listeners



## 多智能体



### SubAgents子代理模式



### Handoffs移交模式



### SKILLS 模式

参考：[AI Coding提升开发效率](https://my.feishu.cn/docx/Pq6vdj4LNos2ERxUhZVcSpSUnCe#A6Dvdgzv6oLuqHxMOQucRTgpnOk)

#### 关键特征

- 以提示为驱动的专业化：技能主要由专业提示定义
- 渐进式披露：技能根据上下文或用户需求逐步开放
- 团队分工：不同团队可以独立开发和维护技能
- 轻量级组合：技能比完整的子代理更简单
- 引用意识：技能可以引用脚本、模板和其他资源

#### 什么时候使用Skills技能？

> **核心思想：当前 Agent 保持决策权，把具体能力封装成 Skill 调用，执行完成后结果返回给当前 Agent。**

1. **当任务是能力执行，而不是角色切换时**

当前 Agent 仍然适合处理问题，只需要借助某项能力。

例如：客服 → 查询订单、旅行助手 → 搜索路线、写作助手 → 检索资料。

1. **当能力需要复用时**

多个 Agent 都可能使用同一种能力。

Research Agent、Writer Agent、Reviewer Agent 共同调用搜索、总结、翻译等能力。

1. **当输入输出边界清晰时**

Skill 更适合固定输入、固定输出的任务。

例如：输入：文档 → 输出：摘要   输入：城市 → 输出：天气信息。不需要独立规划和持续推理。

1. **当希望由 单Agent 统一控制流程时**
   1.  Agent 决定：是否调用 Skill、调用哪个 Skill、如何组合多个 Skill 的结果  （Skill 只负责执行，不参与任务决策。）

总结：Skills 模式的核心是“**同一个 Agent，多套技能**”。Agent 全程陪客户聊，遇到不同场景就在内部**切换对应的技能**模块，所有对话记忆共享，始终保持统一的“人设”和连贯性。

![image-20260817235127688](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260817235127688.png)

``` python
from langchain_core.runnables import RunnableConfig
from langchain_core.utils.uuid import uuid7
from typing import TypedDict
from langchain.tools import tool
from langchain.agents import create_agent
from langchain.agents.middleware import ModelRequest, ModelResponse, AgentMiddleware
from langchain.messages import SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from typing import Callable
from settings import app_settings

model = app_settings.get_qwen_client()


# ------------------------------- 定义技能 -------------------------------
# 定义技能结构
class Skill(TypedDict):
    """支持按需加载的技能定义"""
    name: str  # 技能名称
    description: str  # 技能简介
    content: str  # 技能详细内容


# --- 技能列表（一般通过加载 md 来实现） ---
# 定义技能（Schema + 业务规则）
SKILLS: list[Skill] = [
    {
        "name": "sales_analytics",
        "description": "销售数据分析相关数据库结构与业务规则，包括客户、订单、收入统计。",
        "content": """
# 销售分析数据库说明

## 数据表

### customers（客户表）
- customer_id（主键）
- name（客户姓名）
- email（邮箱）
- signup_date（注册日期）
- status（状态：active/inactive）
- customer_tier（客户等级：bronze/silver/gold/platinum）

### orders（订单表）
- order_id（主键）
- customer_id（外键 -> customers）
- order_date（下单时间）
- status（状态：pending/completed/cancelled/refunded）
- total_amount（订单总金额）
- sales_region（销售区域：north/south/east/west）

### order_items（订单明细表）
- item_id（主键）
- order_id（外键 -> orders）
- product_id（商品ID）
- quantity（购买数量）
- unit_price（单价）
- discount_percent（折扣百分比）

---

## 业务规则

【活跃客户】
status='active'
且注册时间早于当前日期 90 天。

【收入统计】
仅统计 status='completed' 的订单，
收入直接使用 orders.total_amount。

【客户生命周期价值（CLV）】
统计客户所有已完成订单金额总和。

【高价值订单】
订单金额 total_amount > 1000。

---

## 示例 SQL

-- 查询最近一个季度收入最高的前10名客户
SELECT
    c.customer_id,
    c.name,
    c.customer_tier,
    SUM(o.total_amount) AS total_revenue
FROM customers c
JOIN orders o
ON c.customer_id = o.customer_id
WHERE o.status='completed'
AND o.order_date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY
    c.customer_id,
    c.name,
    c.customer_tier
ORDER BY total_revenue DESC
LIMIT 10;
""",
    },
    {
        "name": "inventory_management",
        "description": "库存管理数据库结构与业务规则，包括商品、仓库和库存分析。",
        "content": """
# 库存管理数据库说明

## 数据表

### products（商品表）
- product_id（主键）
- product_name（商品名称）
- sku（库存编码）
- category（分类）
- unit_cost（成本价）
- reorder_point（补货阈值）
- discontinued（是否停售）

### warehouses（仓库表）
- warehouse_id（主键）
- warehouse_name（仓库名称）
- location（位置）
- capacity（容量）

### inventory（库存表）
- inventory_id（主键）
- product_id（外键 -> products）
- warehouse_id（外键 -> warehouses）
- quantity_on_hand（现有库存）
- last_updated（更新时间）

### stock_movements（库存流水）
- movement_id（主键）
- product_id（外键）
- warehouse_id（外键）
- movement_type（类型：
  inbound 入库 /
  outbound 出库 /
  transfer 调拨 /
  adjustment 调整）
- quantity（数量）
- movement_date（发生时间）
- reference_number（单据号）

---

## 业务规则

【可用库存】
inventory.quantity_on_hand > 0。

【需要补货商品】
所有仓库库存总和
<= 产品 reorder_point。

【有效商品】
默认排除停售商品：
discontinued=false。

【库存估值】
quantity_on_hand × unit_cost。

---

## 示例 SQL

-- 查询库存低于补货线的商品
SELECT
    p.product_id,
    p.product_name,
    p.reorder_point,
    SUM(i.quantity_on_hand) AS total_stock,
    p.unit_cost,
    (
        p.reorder_point
        - SUM(i.quantity_on_hand)
    ) AS units_to_reorder
FROM products p
JOIN inventory i
ON p.product_id=i.product_id
WHERE p.discontinued=false
GROUP BY
    p.product_id,
    p.product_name,
    p.reorder_point,
    p.unit_cost
HAVING
    SUM(i.quantity_on_hand)
    <= p.reorder_point
ORDER BY units_to_reorder DESC;
""",
    },
]


# ------------------------------- 创建技能加载工具 -------------------------------
# 创建技能加载工具
@tool
def load_skill(skill_name: str) -> str:
    """
    加载指定技能的完整内容到上下文。

    当需要详细规则、数据库结构、
    SQL 编写规范时调用。

    参数：
        skill_name：技能名称
    返回：
        已加载技能的名称和内容
    """

    for skill in SKILLS:
        if skill["name"] == skill_name:
            return (
                f"已加载技能：{skill_name}\n\n"
                f"{skill['content']}"
            )

    available = ", ".join(
        s["name"]
        for s in SKILLS
    )

    return (
        f"未找到技能：{skill_name}\n"
        f"可用技能：{available}"
    )


# ------------------------------- 创建系统消息 -------------------------------
system_message_content_1 = """你是一名 SQL 查询助手。
你的职责：
1. 理解用户业务需求
2. 按需加载技能
3. 根据数据库结构生成 SQL
4. 遵循业务规则
"""

# ------------------------------- 创建系统消息 -------------------------------
system_message_content_2 = """## 可用技能
- sales_analytics：销售数据分析相关数据库结构与业务规则，包括客户、订单、收入统计。
- inventory_management：库存管理数据库结构与业务规则，包括商品、仓库和库存分析。
如需完整规则，请调用：
load_skill
"""

# ------------------------------- 创建代理1,初始化添加技能列表到系统提示词中 -------------------------------
create_agent_1 = create_agent(
    model=model,
    system_prompt=SystemMessage(content=[
        {
            "type": "text",
            "text": system_message_content_1
        },
        {
            "type": "text",
            "text": system_message_content_2
        }
    ]),
    tools=[load_skill],
    checkpointer=InMemorySaver(),
)


# ------------------------------- 创建代理2 - 通过中间件的方式添加可用技能 -------------------------------
# 或者通过中间件的方式添加可用技能
class SkillMiddleware(AgentMiddleware):
    tools = [load_skill]  # 静态声明，但是建议还是在 create_agent 定义为好

    def __init__(self):
        # 创建技能列表
        skills_list = []

        for skill in SKILLS:
            # 添加技能名称和描述
            skills_list.append(f"- {skill['name']}：{skill['description']}")

        # 创建技能列表
        self.skills_prompt = "\n".join(skills_list)

    def wrap_model_call(self, request: ModelRequest,
                        handler: Callable[[ModelRequest], ModelResponse]) -> ModelResponse:

        # 创建技能列表
        skills_addendum = f"""
            ## 可用技能
            {self.skills_prompt}
            如需完整规则，请调用：
            load_skill
            """

        if request.system_message:
            # ------------------------------- 重新拼接 -------------------------------
            new_content = request.system_message.content_blocks + [
                {
                    "type": "text",
                    "text": skills_addendum
                }
            ]
        else:
            # ------------------------------- 追加内容 -------------------------------
            new_content = [
                {
                    "type": "text",
                    "text": system_message_content_1
                },
                {
                    "type": "text",
                    "text": skills_addendum
                }
            ]

        #
        modified_request = (
            request.override(
                system_message=SystemMessage(
                    content=new_content
                ),
            )
        )

        return handler(
            modified_request
        )


create_agent_2 = create_agent(
    model=model,
    system_prompt=system_message_content_1,
    middleware=[SkillMiddleware()],
    checkpointer=InMemorySaver(),
)


# ------------------------------- 测试 -------------------------------
def main_invoke(user_input: str | list[dict[str, str]]) -> None:
    # 创建用户配置
    user_config = RunnableConfig(
        # 配置信息
        configurable={
            "thread_id": str(uuid7())  # 创建一个唯一的 thread_id
        }
    )
    # 创建用户输入

    result = create_agent_2.invoke(
        input={
            "messages": user_input
        },
        config=user_config
    )

    for message in result["messages"]:
        message.pretty_print()


# 测试运行
if __name__ == "__main__":
    main_invoke([
        {
            "role": "user",
            "content":
                "查询最近一个月订单金额超过1000元的客户"
        }
    ])

```



### 路由模式

待补充，LangGraph 学习完再补充



----



# LangGraph

LangGraph 的核心是将代理工作流程建模为图表。您可以使用三个关键组件来定义代理的行为：

1. `State`：表示应用程序当前快照的共享数据结构。它可以是任何 Python 类型，但通常是 `TypedDict`或 Pydantic `BaseModel`。
2. `Nodes`：用于编码代理逻辑的 Python 函数。它们接收当前值`State`作为输入，执行一些计算，并返回更新后的`State`。
3. `Edges`：根据当前条件确定下一步执行哪个操作的 Python 函数`State`。它们可以是条件分支或固定转换。

通过组合`Nodes`和`Edges`，您可以创建复杂的循环工作流，使其`State`随时间推移而演化。然而，真正的强大之处在于 LangGraph 对 `State` 的管理方式。需要强调的是：`Nodes`只不过是 Python 函数而已——它们可以包含 LLM 代码，也可以只是经典的 Python 代码。

简而言之：节点负责工作，边负责告诉下一步做什么。

| 序号              | 核心概念                                                     |
| ----------------- | ------------------------------------------------------------ |
| ① State（状态）   | 存储工作流中每个步骤的上下文信息（如问题、回答、变量等）     |
| ② Node（节点）    | 工作流中执行的一个步骤（如调用 LLM、调用工具、某个函数）     |
| ③ Edge（边/跳转） | 控制流程走向的“路口”，决定从哪个节点跳到哪个节点（支持条件判断） |
| ④ Graph（流程图） | 将所有节点和边组织起来形成一张状态流程图，是 LangGraph 的执行主结构 |

强调LangGraph解决了LangChain在处理**循环、条件分支、状态回溯、人机交互**等复杂场景时的局限性

![image-20260819173737894](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260819173737894.png)

### 状态图

`StateGraph` 类是主要使用的图形类。这是由用户定义的 `State` 对象初始化的。

通俗来说，它是一张**流程图 + 状态管理系统**，定义了：

1. 哪些步骤（节点）要执行？
2. 每一步之间怎么跳转（边）？
3. 整个流程中数据状态如何流动和更新（状态）？

**为什么叫“状态图”而不是“流程图”？**

LangGraph 不只是流程控制，还强调：

- 每个节点执行前、执行后都可以**访问和修改状态**（state）
- 状态是图的“血液”，在节点之间流动
- **节点的跳转可以依据状态来判断**（如条件跳转）

所以叫做 **State Graph（有状态的流程图）**，而不是“静态流程图”。

示例：简单的 Graph

``` python
from langgraph.graph import StateGraph
from typing import TypedDict


# 1. 定义状态结构
class State(TypedDict):
    # 问题
    question: str
    # 搜索数据
    search_data: str
    # 答案
    answer: str


# 2. 定义节点
def search_node(state: State) -> dict[str, str]:  # 字段将状态添加到节点上
    # 打印状态
    print('节点（search_node）：', state)

    # 更新状态， return 在节点上用来更新状态
    return {"search_data": "查询数据"}


def answer_node(state: State) -> dict[str, str]:
    # 打印状态
    print('节点（answer_node）：', state)
    # 更新状态
    return {"answer": "答案"}


# 3. 创建图，将节点进行注册和连接（确定工作流程）
graph = StateGraph(
    state_schema=State,  # 状态结构
)

# 4. 添加节点,把节点添加到流程图
graph.add_node(action=search_node, node="search_node") # action 是节点的名称，用于后续引用
graph.add_node(action=answer_node, node="answer_node")

# 5. 添加边，（流程）
graph.add_edge(start_key="search_node", end_key="answer_node")  # 流程 search_node -> answer_node
# 6. 添加边，并设置出口
graph.add_edge(start_key="search_node", end_key="__end__")  # 流程 search_node -> 结束

# 7. 设置入口
graph.set_entry_point(key="search_node")

# 初始化这张流程图
my_graph = graph.compile()

# 运行流程图
result = my_graph.invoke(input={"question": "这是问题？"})

print(f'结果：{result}')

# 节点（search_node）： {'question': '这是问题？'}
# 节点（answer_node）： {'question': '这是问题？', 'search_data': '查询数据'}
# 结果：{'question': '这是问题？', 'search_data': '查询数据', 'answer': '答案'}

```



## State状态

在使用 LangGraph 构建流程图之前，**第一件事**就是定义图的状态 `State`。这是整个图运行中用于**共享和传递信息**的核心机制。

### **什么是 State？**

LangGraph 中的 **State** 是图中所有节点（Node）之间传递数据的**模式结构**，可以类比为一个共享的上下文字典，它包含输入、输出、中间变量等。

定义 State 时，需要包含两个部分：

1. **Schema（模式）**：指定 State 的字段结构（可以用 `TypedDict` 或 `Pydantic`）
   1. TypedDict 是标准库的一部分（来自 typing 模块），零依赖，零性能开销而 Pydantic 会在每一步创建模型实例，会增加运行时负担 ；
   2. LangGraph 中的 State 实质就是一个字典（dict），而 TypedDict 就是“有类型注解的 dict”，与 LangGraph 的执行机制无缝对接，而 Pydantic 是类结构，需要 .dict() 转换，略显多余；

``` python
# 1. 定义状态结构
class State(TypedDict):
    # 问题
    question: str
    # 搜索数据
    search_data: str
    # 答案
    answer: str


# 1.1 定义输入状态结构
class InputSchema(TypedDict):
    question: str


# 1.2 定义输出状态结构
class OutputSchema(TypedDict):
    answer: str
    

# ------ 或者 ------

# 1. 定义输入状态结构
class InputSchema(TypedDict):
    # 问题
    question: str


# 1. 定义输出状态结构
class OutputSchema(TypedDict):
    # 答案
    answer: str


# 1. 定义状态结构
class State(InputSchema, OutputSchema):
    # 搜索数据
    search_data: str

```

通过 **input_schema**  **output_schema** 限制输入和输出类型；



**多个模式（Multiple Schemas）：**在大多数情况下，LangGraph 使用一个统一的 State 模式。但你也可以设置“输入模式”和“输出模式”分开

1. 输入模式：接收用户输入的字段（如 `question`）
2. 输出模式：只保留最终输出的字段（如 `answer`）

``` python
from langgraph.graph import StateGraph, END, START
from typing import TypedDict


# 1. 定义输入状态结构
class InputSchema(TypedDict):
    # 问题
    question: str


# 1. 定义输出状态结构
class OutputSchema(TypedDict):
    # 答案
    answer: str


# 1. 定义状态结构
class State(InputSchema, OutputSchema):
    # 搜索数据
    search_data: str


# 2. 定义节点
def search_node(state: State) -> dict[str, str]:  # 字段将状态添加到节点上
    # 打印状态
    print('节点（search_node）：', state)

    # 更新状态， return 在节点上用来更新状态
    return {"search_data": "查询数据"}


def answer_node(state: State) -> dict[str, str]:
    # 打印状态
    print('节点（answer_node）：', state)
    # 更新状态
    return {"answer": "答案"}


# 3. 创建图，将节点进行注册和连接（确定工作流程）
graph = StateGraph(
    state_schema=State,  # 状态结构
    input_schema=InputSchema,
    output_schema=OutputSchema,
)

# 4. 添加节点,把节点添加到流程图
graph.add_node(node=search_node, action="search_node")  # action 是节点的名称，用于后续引用
graph.add_node(node=answer_node, action="answer_node")

# 5. 添加边，（流程）
graph.add_edge(start_key="search_node", end_key="answer_node")  # 流程 search_node -> answer_node
# 6. 添加边，并设置出口
graph.add_edge(start_key="search_node", end_key="__end__")  # 流程 search_node -> 结束

# 7. 设置入口
graph.set_entry_point(key="search_node")

# 初始化这张流程图
my_graph = graph.compile()

# 运行流程图
result = my_graph.invoke(input={"question": "这是问题？"})

print(f'结果：{result}')

# 节点（search_node）： {'question': '这是问题？'}
# 节点（answer_node）： {'question': '这是问题？', 'search_data': '查询数据'}
# 结果：{'answer': '答案'}

```



### Reducer归并函数

在 LangGraph 中，所有节点返回的都是“局部更新结果”，**Reducer 是用于合并多个节点输出更新的机制**。 **将每个节点返回的“局部状态更新”统一合并进全局的 State。**

![image-20260819211837991](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260819211837991.png)

节点中去进行更新属性的时候默认是进行替换， 需要加上**from operator import add**保证这个属性是进行追加的



### 使用图形状态中的消息

**为什么要使用消息？**

大多数现代 LLM 提供商都提供聊天模型接口，接受消息列表作为输入。LangChain尤其接受`ChatModel`对象列表以`Message`作为输入。这些消息有多种形式，例如`HumanMessage`（用户输入）或`AIMessage`（LLM 响应）。

**在图表中使用消息**

在许多情况下，将之前的对话历史记录以消息列表的形式存储在图状态中会很有帮助。为此，我们可以向图状态添加一个键（通道），该键存储`Message`对象列表，并使用 Reducer 函数对其进行注释。Reducer 函数对于指示图如何`Message`在每次状态更新（例如，当节点发送更新时）时更新状态中的对象列表至关重要。如果您未指定 Reducer，则每次状态更新都会用最新提供的值覆盖消息列表。如果您只想将消息附加到现有列表中，可以使用`operator.add`。

``` python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
from operator import add


# 1. 定义状态结构
class State(TypedDict):
    # 节点中去进行更新属性的时候默认是进行替换， 需要加上from operator import add保证这个属性是进行追加的
    messages: Annotated[list[str], add]  # 每条消息是 {role, content}，会自动追加到列表末尾
    # 问题
    question: str
    # 答案
    answer: str


# 2. 定义节点
def search_node(state: State) -> dict[str, str]:  # 字段将状态添加到节点上
    # 打印状态
    print('节点（search_node）：', state)

    # 是字典类型     更新状态
    return {"messages": ["这是节点 search_node "]}


def answer_node(state: State) -> dict[str, str]:
    # 打印状态
    print('节点（answer_node）：', state)
    # 更新状态
    return {"messages": ["这是节点 answer_node "], "answer": "这是答案"}


# 3. 创建图，将节点进行注册和连接（确定工作流程）
graph = StateGraph(
    state_schema=State,  # 状态结构
)

# 4. 添加节点,把节点添加到流程图
graph.add_node(action=search_node, node="search_node")  # node 是节点的名称，用于后续引用
graph.add_node(action=answer_node, node="answer_node")

# 5. 添加边，（流程）
graph.add_edge(start_key="search_node", end_key="answer_node")  # 流程 search_node -> answer_node
# 6. 添加边，并设置出口
graph.add_edge(start_key="search_node", end_key="__end__")  # 流程 search_node -> 结束

# 7. 设置入口
graph.set_entry_point(key="search_node")

# 初始化这张流程图
my_graph = graph.compile()

# 运行流程图
result = my_graph.invoke(input={"messages": ["这是问题?"], "question": "问题"})

print(f'结果：{result}')

# 节点（search_node）： {'messages': ['这是问题?'], 'question': '问题'}
# 节点（answer_node）： {'messages': ['这是问题?', '这是节点 search_node '], 'question': '问题'}
# 结果：{'messages': ['这是问题?', '这是节点 search_node ', '这是节点 answer_node '], 'question': '问题', 'answer': '这是答案'}

```

节点在更新状态的时候，默认是进行替换的方式；

``` python
from operator import add

class State(TypedDict):
    messages: Annotated[list[str], add] 
```

有场景可能还需要手动更新图状态中的消息（例如，人机交互）。 如果想去修改之前的某一个状态，但使用 `operator.add`，您发送到图的手动状态更新将被附加到现有消息列表中，而不是更新现有消息。

为了避免这种情况，您需要一个能够跟踪消息 ID 并在更新时覆盖现有消息的 Reducer。 为此，您可以使用预构建 `add_messages` 函数。 对于新消息，它只会附加到现有列表中，但它也会正确处理现有消息的更新。

``` python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]


# 节点函数：添加用户问题
def user_input_node(state: GraphState) -> dict:
    return {"messages": [{"role": "user", "content": "什么是LangGraph？"}]}


# 节点函数：添加助手回复
def assistant_node(state: GraphState) -> dict:
    return {"messages": [{"role": "assistant", "content": "LangGraph 是一个有状态的图编排框架。"}]}


# 3. 创建图，将节点进行注册和连接（确定工作流程）
builder = StateGraph(
    state_schema=GraphState,  # 状态结构
)

# 4. 添加节点,把节点添加到流程图
builder.add_node(action=user_input_node, node="user_input_node")  # action 是节点的名称，用于后续引用
builder.add_node(action=assistant_node, node="assistant_node")

# 5. 添加边，（流程）
builder.add_edge(start_key="user_input_node", end_key="assistant_node")  # 流程 user_input_node -> assistant_node

# 7. 设置入口
builder.set_entry_point(key="user_input_node")

# 初始化这张流程图
graph = builder.compile()

# 运行流程图
result = graph.invoke({"messages": []})
print(result["messages"])

# [HumanMessage(content='什么是LangGraph？', additional_kwargs={}, response_metadata={},
#               id='1a56e313-9e4d-46f5-8e90-b8a757db214f'),
#  AIMessage(content='LangGraph 是一个有状态的图编排框架。', additional_kwargs={}, response_metadata={},
#            id='a7af947b-628b-4b3b-b0a2-ea25a58d9c7c', tool_calls=[], invalid_tool_calls=[])]

```



### MessagesState

由于在状态中包含消息列表非常常见，因此存在一个名为`MessagesState`的预建状态，它使用消息变得非常简单。

该状态`MessagesState`使用单个键定义`messages`，该键是对象列表`AnyMessage`并使用`add_messages`。通常，需要跟踪的状态不仅仅是消息，所以我们可以通过继承的方式

本质就是 LangGraph 预构建的好一个类型

``` python
# 和上述代码不同会在State类中自动维护一个messages 字段，不需要显示创建
class State(MessagesState):
    documents: list[str]
```



## Node节点

**节点（Nodes）是图中执行逻辑的基本单位**。每个节点表示一个**函数步骤、处理阶段或子逻辑流程**，多个节点通过边连接成有向图，组成一个完整的有状态计算流程。

**LangGraph 中的节点就是你定义的一个函数**，用于接收状态、执行逻辑，并返回更新后的状态

``` python
def my_node(state: dict) -> dict:
    # 处理输入状态，并返回更新字段
    return {"new_key": "new_value"}
    
# LangGraph 会自动用 reducer 把这些更新合并进全局状态。
```



### START 节点

Node`START`是一个特殊节点，表示将用户输入发送到图的节点。引用此节点的主要目的是确定应首先调用哪些节点。

``` python
from langgraph.graph import START

graph.add_edge(START, "node_a")
```



### END 节点

Node`END`是一个特殊节点，表示终端节点。当需要指示哪些边在完成后没有操作时，可以引用此节点。

``` python
from langgraph.graph import END

graph.add_edge("node_a", END)
```

简单的例子

``` python
builder.add_edge(start_key=START, end_key="user_input_node") # 流程 START -> user_input_node
builder.add_edge(start_key="user_input_node", end_key="assistant_node")  # 流程 user_input_node -> assistant_node
builder.add_edge(start_key="assistant_node", end_key=END) # 流程 assistant_node -> END
```

开始节点：可以通过 **set_entry_point** 指定开始的节点；**set_entry_point** **（首选）**

**唯一性约束**：一个图（Graph）**有且只能有一个**入口节点（Start Node）。

``` python
builder.set_entry_point(key="user_input_node") 

# ----------------- 等价于 -----------------
builder.add_edge(start_key=START, end_key="user_input_node") 
```

结束节点：如果流程在最后节点执行，并且停止了，默认结束；

``` python
# 示例中只有两个流程，user_input_node -> assistant_node;
# 默认执行到 assistant_node 则停止，并且结束；

builder.add_edge(start_key="user_input_node", end_key="assistant_node") 
```

同时也可以使用**（首选）**

``` python
builder.add_edge(start_key="assistant_node", end_key=END) # 流程 assistant_node -> END
```

再或者**（仅适用于单一路径）**

``` python
builder.set_finish_point(key="assistant_node")
```



### 并行运行节点

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

builder.add_edge(START, "a")  # 流程 START -> a
builder.add_edge("a", "b")  # 流程 a -> b
builder.add_edge("a", "c")  # 流程 a -> c
builder.add_edge("b", "d")  # 流程 b -> d
builder.add_edge("c", "d")  # 流程 c -> d
builder.add_edge("d", END)  # 流程 d -> END

graph = builder.compile()

print(graph.invoke({"aggregate": ["start"]}))

# Adding "A" to ['start']
# Adding "B" to ['start', 'A']
# Adding "C" to ['start', 'A']
# Adding "D" to ['start', 'A', 'B', 'C']
# {'aggregate': ['start', 'A', 'B', 'C', 'D']}

```
❌切记不能出现死循环，出现回溯流程必须有结束的环节；

``` python
builder.add_edge("c", "a")  # 流程 c -> 回到 a
```



## Edge边（跳转）

**Edge（边）** 是连接节点的通道，表示图中**节点之间的执行跳转关系**。可以把它理解为「节点执行完之后，下一步去哪，是构成 LangGraph 流程图的核心。



### 普通边

直接从一个节点到下一个节点

``` python
graph.add_edge("节点A", "节点B")
```

### add_conditional_edges条件边

调用一个函数来确定下一步要去哪个节点。**add_conditional_edges**

``` python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

start_node_key = "judge_node"
a_key = "a"
b_key = "b"
default_key = "default"

node_a_key = "node_a"
node_b_key = "node_b"
node_default_key = "default"

class MyState(TypedDict):
    type: str  # "a" / "b"
    result: str  # "走了 A 分支" / "走了 B 分支" / "走了默认分支"


def judge_node(state: MyState):
    """节点函数：可以做一些预处理"""
    return state  # 保持状态不变，只是路由


# 条件函数
def route_condition(state: MyState):
    """条件函数：只负责路由决策"""
    if state["type"] == "a":
        return node_a_key
    elif state["type"] == "b":
        return node_b_key
    else:
        return node_default_key


def node_a(state):
    return {"result": "走了 A 分支"}


def node_b(state):
    return {"result": "走了 B 分支"}


def node_default(state):
    return {"result": "走了默认分支"}




# 构建图
graph = StateGraph(state_schema=MyState)
# 定义节点
graph.add_node(node=start_node_key, action=judge_node)
graph.add_node(node=a_key, action=node_a)
graph.add_node(node=b_key, action=node_b)
graph.add_node(node=default_key, action=node_default)
# 定义开始节点
graph.set_entry_point(start_node_key)

# 使用不同的函数作为条件函数
# add_conditional_edges 条件边
# 第一个参数：当哪个节点执行完成后进行触发条件边执行
# 第二个参数：具体执行的条件函数
# 第三个参数：要跳转的节点映射
graph.add_conditional_edges(source=start_node_key, path=route_condition, path_map={
    node_a_key: a_key,  # key代表条件函数的返回值，value代表具体的节点名称
    node_b_key: b_key,
    node_default_key: default_key
})

# 添加结束边
graph.add_edge(start_key=a_key, end_key=END)
graph.add_edge(start_key=b_key, end_key=END)
graph.add_edge(start_key=default_key, end_key=END)

app = graph.compile()

# 测试
print("测试 A:", app.invoke({"type": "a", "result": ""}))
# 测试 A: {'type': '', 'result': '走了默认分支'}

# print("测试 B:", app.invoke({"type": "b", "result": ""}))
# 测试 B: {'type': 'b', 'result': '走了 B 分支'}

# print("测试 A:", app.invoke({"type": "a", "result": ""}))
# 测试 A: {'type': 'a', 'result': '走了 A 分支'}

```



### set_conditional_entry_point条件入口

调用一个函数来确定当用户输入到达时首先调用哪个节点。

主要是实现：动态入口，根据初始化的state，判断进入哪一个节点。（可以理解路由器，一般做意图识别）

``` python
class MyState(TypedDict):
    user_type: Literal["vip", "normal", "guest"]  # "vip", "normal", "guest"
    message: str
    result: str


# 条件入口点函数
def route_by_user_type(state: MyState):
    """根据用户类型路由到不同的服务"""
    user_type = state["user_type"]

    if user_type == "vip":
        return "vip"
    elif user_type == "normal":
        return "normal"
    else:
        return "guest"
```

和路由器的设计方式很像，在这里通过 state 的方式定义好 **user_type** 规则，在通过一个函数做分发逻辑；

``` python
from typing import TypedDict, Literal
from langgraph.graph import StateGraph, END


class MyState(TypedDict):
    user_type: Literal["vip", "normal", "guest"]  # "vip", "normal", "guest"
    message: str
    result: str


# 条件入口点函数
def route_by_user_type(state: MyState):
    """根据用户类型路由到不同的服务"""
    user_type = state["user_type"]

    if user_type == "vip":
        return "vip"
    elif user_type == "normal":
        return "normal"
    else:
        return "guest"


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


# 构建图
workflow = StateGraph(state_schema=MyState)

# 添加节点
workflow.add_node(node="vip_service", action=vip_service)
workflow.add_node(node="normal_service", action=normal_service)
workflow.add_node(node="guest_service", action=guest_service)

# 设置条件入口点 - 关键部分！
workflow.set_conditional_entry_point(
    path=route_by_user_type,  # 条件函数
    path_map={
        "vip": "vip_service",
        "normal": "normal_service",
        "guest": "guest_service"
    }
)

# 添加结束边
workflow.add_edge(start_key="vip_service", end_key=END)
workflow.add_edge(start_key="normal_service", end_key=END)
workflow.add_edge(start_key="guest_service", end_key=END)

# 编译图
app = workflow.compile()

print(app.invoke({
    "user_type": "vip",
    "message": "我要退款",
}))  # VIP用户: {'user_type': 'vip', 'message': '我要退款', 'result': 'VIP专享服务: 我要退款'}

print("VIP用户:", app.invoke({
    "user_type": "normal",
    "message": "我要退款",
}))  # 标准用户: {'user_type': 'normal', 'message': '我要退款', 'result': '标准服务: 我要退款'}

print("游客用户:", app.invoke({
    "user_type": "guest",
    "message": "我要退款",
}))  # 游客用户: {'user_type': 'guest', 'message': '我要退款', 'result': '游客服务(功能受限): 我要退款'}

```





## Send发送

并发任务，可以通过 条件边 **add_conditional_edges** 的方式处理条件分发并行；

``` python
"""
LangGraph Map-Reduce 简单案例：数字求和
把一堆数字分给多个worker算平方，然后把结果加起来
"""
from time import sleep
from typing import Annotated
import operator
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from typing import TypedDict, List

splitter_key = "splitter"
worker_key = "worker"
summer_key = "summer"


# 状态定义
class MyState(TypedDict):
    numbers: List[int]  # 输入的数字
    results: Annotated[list[int], operator.add]  # worker的结果
    final_sum: int  # 最终求和


# 创建一个send的状态
class WorkerState(TypedDict):
    number: int


# 1. Map阶段：分发数字
def split_numbers(state: MyState):
    """把数字分发给不同的worker"""
    numbers = state["numbers"]
    print(f"分发数字: {numbers}")

    # 每个数字发给一个worker
    return [Send(worker_key, WorkerState(number=num)) for num in numbers]


# 2. Worker阶段：计算平方
def calculate_square(state: WorkerState):  # state 是指分发给 worker 的状态
    """每个worker计算一个数字的平方"""
    number = state["number"]

    if number == 2:
        sleep(5)

    square = number * number
    print(f"Worker: {number}² = {square}")
    return {"results": [square]}  # 返回的 state更新 是指 State 的 state


# 3. Reduce阶段：求和
def sum_results(state: MyState):
    """把所有结果加起来"""
    results = state.get("results", [])
    total = sum(results)
    print(f"求和: {results} = {total}")
    return {"final_sum": total}


# 构建图
def create_simple_graph():
    graph = StateGraph(state_schema=MyState)

    # 添加节点
    graph.add_node(node=splitter_key, action=lambda s: s)  # 分发器
    graph.add_node(node=worker_key, action=calculate_square)  # 工作节点
    graph.add_node(node=summer_key, action=sum_results)  # 求和器

    # 开始边
    graph.add_edge(start_key=START, end_key=splitter_key)
    # 跳转边：worker节点 -> summer节点
    graph.add_edge(start_key=worker_key, end_key=summer_key)
    # 结束边
    graph.add_edge(start_key=summer_key, end_key=END)

    # 条件边
    graph.add_conditional_edges(
        source=splitter_key,
        path=split_numbers,
        path_map=[worker_key]
    )

    return graph.compile()


# 运行例子
def run_example():
    app = create_simple_graph()

    print(app.invoke({
        "numbers": [1, 2, 3, 4, 5],
        "results": [],
        "final_sum": 0
    }))


if __name__ == "__main__":
    run_example()

    # 分发数字: [1, 2, 3, 4, 5]
    # Worker: 1² = 1
    # Worker: 3² = 9
    # Worker: 2² = 4
    # Worker: 4² = 16
    # Worker: 5² = 25
    # 求和: [1, 4, 9, 16, 25] = 55
    # {'numbers': [1, 2, 3, 4, 5], 'results': [1, 4, 9, 16, 25], 'final_sum': 55}

```

状态由节点返回更新；

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


# 定义条件边函数-任务分发
def split_tasks(state: MyState):
    question = state["question"]
    prompt = f"""
        你是一个任务分割助手，擅长将用户问题进行提取分类
        分类格式：{{"math_node": 数学问题, "chinese_node": 语文问题, "search_node": "搜索问题"}}
        注意：严格返回分类数据格式
        用户问题“{question}
        
    """
    # 绑定结构化输出格式的模型
    structured_model = model.with_structured_output(SplitTasksSchema)
    response = structured_model.invoke(prompt)
    print('model 分类格式:\n', response)
    tasks = response["tasks"]

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


graph = StateGraph(state_schema=MyState)
# 添加节点
graph.add_node("splitter", lambda s: s)  # 分发器
graph.add_node("math_node", math_node)  # 数学任务节点
graph.add_node("chinese_node", chinese_node)  # 语文任务节点
graph.add_node("search_node", search_node)  # 搜索任务节点
graph.add_node("summarize_answers", summarize_answers)  # 总结节点
# 连接节点
graph.add_edge(START, "splitter")
graph.add_conditional_edges("splitter", split_tasks, ["math_node", "chinese_node", "search_node"])  # Map阶段
graph.add_edge("math_node", "summarize_answers")
graph.add_edge("chinese_node", "summarize_answers")
graph.add_edge("search_node", "summarize_answers")
graph.add_edge("summarize_answers", END)



async def main():
    g = graph.compile()
    res = await g.ainvoke({"question": "计算5*8+9等于多少？；李白是谁？；帮我查询一下langgraph是什么？"})
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

通过指定下一个节点的状态

``` python
Send(task, TaskState(task_value=value)) 

def math_node(state: TaskState):
  
def chinese_node(state: TaskState):

def search_node(state: TaskState):
```

总结：**Send 用于解决动态任务分发问题。当任务数量未知，或者每个任务需要不同 State 时，可以通过 Send 在运行过程中动态创建节点执行任务，是 LangGraph 实现 Map-Reduce、多任务并行处理的重要机制。**



## Command命令

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

``` python
from typing import Literal
from langgraph.graph import StateGraph, END
from langgraph.types import Command
from pydantic import BaseModel

from settings import app_settings


# 定义状态
class State(BaseModel):
    question: str
    intent: str
    response: str


# 创建模型（关闭思考模式）
model = app_settings.get_qwen_client(enable_thinking=False)


def classify_and_route(state: State) -> Command[
    Literal["return_department", "price_department", "tech_department", "general_department"]]:
    """使用模型决策路由"""
    question = state.question

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
    print("退货部门处理...", state.intent)
    return Command(
        update={"response": "退货流程：请提供订单号和退货原因"},
        goto=END
    )


def price_department(state: State) -> Command[END]:
    print("价格部门处理...", state.intent)
    return Command(
        update={"response": "价格信息：当前商品价格请查看官网"},
        goto=END
    )


def tech_department(state: State) -> Command[END]:
    print("技术部门处理...", state.intent)
    return Command(
        update={"response": "技术问题：请描述具体的错误现象"},
        goto=END
    )


def general_department(state: State) -> Command[END]:
    print("综合部门处理...", state.intent)
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

```

### 使用`Command`进行`Send` 动态并行处理

``` python
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
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
    structured_model = model.with_structured_output(SplitTasksSchema)
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

    print(f"\n汇总结果: {summary}")

    return Command(
        update={"summary": summary.content},
        goto=END
    )


def create_builder():
    # 构建图
    builder = StateGraph(AdvancedState)
    builder.add_node("analyze_and_split", analyze_and_split)
    builder.add_node("math_handler", math_handler)
    builder.add_node("knowledge_handler", knowledge_handler)
    builder.add_node("search_handler", search_handler)
    builder.add_node("default_handler", default_handler)
    builder.add_node("summarize", summarize)

    builder.set_entry_point("analyze_and_split")

    # 所有处理节点完成后进入汇总
    builder.add_edge("math_handler", "summarize")
    builder.add_edge("knowledge_handler", "summarize")
    builder.add_edge("search_handler", "summarize")
    builder.add_edge("default_handler", "summarize")

    return builder


def main():
    graph = create_builder().compile()

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



### 什么时候应该使用`Command`而不是条件边？

在 LangGraph 中：

- **条件边（Conditional Edge）**：适合描述**提前设计好的流程分支**
- **Command**：适合描述**运行过程中动态产生的流程控制，还需要同时更新状态和控制流**

简单判断：

>  如果“下一步去哪”是工作流设计的一部分，用条件边； 如果“下一步去哪”是节点运行后临时决定的，用 Command。

一句话总结：**Conditional Edge 用于定义“预先确定的工作流路径”，Command 用于处理“运行过程中动态产生的流程控制”。当节点或工具需要根据实时结果主动改变流程时，应优先使用 Command。**



## 运行时

创建图时，还可以标记图的某些部分是可配置的。这样做通常是为了方便在模型或系统提示之间切换。这允许创建单个“认知架构”（图），但拥有多个不同的实例。

**在运行图时提供额外的“配置参数”而不是“状态参数”**，并且通过类型约束这些参数。

**传递非图状态的依赖信息，为节点提供执行所需的辅助资源，同时不干扰图状态的正常流转和更新**。

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



### 递归限制

递归限制设置图在单次执行中可以执行的最大超步数。一旦达到限制，LangGraph 将出现`GraphRecursionError`。默认情况下，此值设置为 1000 步。可以在运行时在任何图上设置递归限制，并将其传递给`.invoke`/`.stream`通过配置字典。

通俗理解：节点跳转节点计数为1，递归限制就是控制节点之间跳转的次数

``` python
import operator
from typing import Annotated, Literal
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from langgraph.managed.is_last_step import RemainingSteps


class State(TypedDict):
    aggregate: Annotated[list, operator.add]
    remaining_steps: RemainingSteps # 每次跳转节点减去 1


def a(state: State):
    print("a:", state)
    return {"aggregate": ["A"]}


def b(state: State):
    print("b:", state)
    return {"aggregate": ["B"]}


# Define nodes
builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)


# Define edges
def route(state: State) -> Literal["b", '__end__']:
    print("r:", state)
    if state["remaining_steps"] <= 8:
        return END
    else:
        return "b"

builder.set_entry_point("a")
builder.add_conditional_edges("a", route)
builder.add_edge("b", "a")
graph = builder.compile()

# Test it out
result = graph.invoke({"aggregate": []}, {"recursion_limit": 10})
print("z:", result)
# a: {'aggregate': [], 'remaining_steps': 9}
# r: {'aggregate': ['A'], 'remaining_steps': 9}
# b: {'aggregate': ['A'], 'remaining_steps': 8}
# a: {'aggregate': ['A', 'B'], 'remaining_steps': 7}
# r: {'aggregate': ['A', 'B', 'A'], 'remaining_steps': 7}
# z: {'aggregate': ['A', 'B', 'A']}
```

通过

``` python
from langgraph.managed.is_last_step import RemainingSteps
```

添加到当前的状态

``` python
class State(TypedDict):
    aggregate: Annotated[list, operator.add]
    remaining_steps: RemainingSteps
```

每次节点跳转节点计数为1，再通过条件判断限制停止；

``` python
from langchain_core.runnables import RunnableConfig

config: RunnableConfig = {
    "recursion_limit": 10 # 一个调用可以递归的最大次数。如果未提供，默认为‘ 25 ’。
}
```



### 重试策略

**为什么需要重试策略？**

1. **LLM API 超时**或达到速率限制（Rate Limit）。
2. **数据库连接**瞬时抖动。
3. **网络请求**失败（5xx 错误）。

在 LangGraph 中，我们通过 `add_node` 的 `retry_policy` 参数来增强节点的健壮性。

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





## 可视化图表

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
    print(f"分发数字: {numbers}")

    # 每个数字发给一个worker
    return [Send("worker", {"number": num}) for num in numbers]


# 2. Worker阶段：计算平方
def calculate_square(state: State):
    """每个worker计算一个数字的平方"""
    number = state["number"]
    square = number * number
    print(f"Worker: {number}² = {square}")
    return {"results": [square]}


# 3. Reduce阶段：求和
def sum_results(state: State):
    """把所有结果加起来"""
    results = state.get("results", [])
    total = sum(results)
    print(f"求和: {results} = {total}")
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

    print("开始计算...")
    print("任务：计算每个数字的平方，然后求和")
    print()

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



## 工具

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



## 子图

LangGraph子图（Subgraph）是一种模块化的图结构，允许您将复杂的工作流分解为更小的、可重用的组件。就像函数在编程中的作用一样，子图提供了封装和复用的能力。

![image-20260824113809129](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260824113809129.png)

### **共享状态键（Shared State Keys）**

父图和子图在其状态模式中有共享的状态键。在这种情况下，您可以将子图作为节点包含在父图中。

``` python
from langgraph.graph import StateGraph, MessagesState

from settings import app_settings

llm = app_settings.get_qwen_client()


def summarize_sub_node(state: MessagesState) -> MessagesState:
    # 获取大模型回答的内容进行摘要总结
    answer = state["messages"][-1].content
    summary_prompt = f"请用一句话总结下面这句话：\n\n答：{answer}"
    response = llm.ainvoke(summary_prompt)
    return {"messages": state["messages"] + [response]}


summarize_sub = StateGraph(state_schema=MessagesState)

summarize_sub.add_node("summarize_sub_node", summarize_sub_node)

summarize_sub.set_entry_point("summarize_sub_node")

graph_sub = summarize_sub.compile()


# 创建父图

async def answer_node(state: MessagesState) -> MessagesState:
    # 使用大模型进行回答
    answer = await llm.ainvoke(state["messages"])
    return {"messages": state["messages"] + [answer]}


parent_graph = StateGraph(state_schema=MessagesState)

parent_graph.add_node("answer_node", answer_node)
parent_graph.add_node("summarize_sub", graph_sub)

parent_graph.add_edge("answer_node", "summarize_sub")

parent_graph.set_entry_point("answer_node")

parent = parent_graph.compile()

# 测试
input_state = {
    "messages": [{"role": "user", "content": "langgraph是什么？"}],
}
# result = parent.invoke(input_state)
#
# for message in result['messages']:
#     message.pretty_print()

```

### 不同状态模式（Different State Schemas）

父图和子图有不同的模式（状态模式中没有共享的状态键）。在这种情况下，您必须在父图的节点内部调用子图：这在父图和子图有不同状态模式且需要在调用子图前后转换状态时很有用。

``` python
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



## 多智能体系统

代理是一种使用 LLM 来决定应用程序控制流的系统。随着这些系统的开发，它们可能会随着时间的推移变得更加复杂，从而更难以管理和扩展。例如，您可能会遇到以下问题：

- 代理可以使用的工具太多，无法决定下一步调用哪个工具
- 环境变得过于复杂，单个代理无法跟踪
- 系统中需要多个专业领域（例如规划师、研究员、数学专家等）

为了解决这些问题，您可以考虑将应用程序拆分成多个较小的独立代理，并将它们组合成一个**多代理系统**。这些独立代理可以像提示符和 LLM 调用一样简单，也可以像ReAct代理一样复杂（甚至更多！）。

使用多代理系统的主要好处是：

- **模块化**：独立的代理使得代理系统的开发、测试和维护变得更加容易。
- **专业化**：您可以创建专注于特定领域的专家代理，这有助于提高整体系统性能。
- **控制**：您可以明确控制代理如何通信。

![image-20260824230743904](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260824230743904.png)

在多代理系统中，有几种连接代理的方法：

- **网络（交接）**：每个代理都可以与其他代理通信。任何代理都可以决定接下来要呼叫哪个代理。
- **主管代理**：每个代理只与一个主管代理进行通信。主管代理负责决定接下来应该调用哪个代理。
- **主管（工具调用）**：这是主管架构的一个特例。单个代理可以表示为工具。在这种情况下，主管代理使用工具调用 LLM 来决定调用哪些代理工具，以及传递给这些代理的参数。
- **分层结构**：你可以定义一个多智能体系统，其中包含多个主管的主管。这是主管架构的泛化，允许更复杂的控制流。
- **自定义多代理工作流**：每个代理仅与一部分代理进行通信。流程的某些部分是确定性的，只有部分代理可以决定接下来要调用哪些其他代理。



## 交接（Handoffs）

### 交接概念

在多智能体架构中，智能体可以表示为图节点。每个智能体节点执行其步骤，并决定是完成执行还是路由至其他智能体，包括可能路由至自身（例如，循环运行）。多智能体交互中一种常见的模式是**切换**，即一个智能体将控制权移交给另一个智能体

### 交接的关键要点

- 任务超出当前智能体能力范围
- 需要专业化处理
- 错误处理和重试机制
- 工作流程的自然转换点

### 工具进行交接（重点）

``` python
from typing_extensions import Literal

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

### 自定义主管架构（重点）

先根据主管将用户任务进行分解（多个子问题），在依次指定子智能体去执行任务列表，最后由主智能体总结回复

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
        print("sales pending:", pending)

        completed = state.get("completed", [])
        print("sales completed:", completed)

        result = tech_subgraph.invoke({"messages": state["messages"]})

        return {
            "pending": pending,
            "completed": [*state['completed'], "tech_agent"],
            # "messages": [AIMessage(content="技术问题已处理，24内相关技术人员处理完毕后联系")]
            "messages": result["messages"],
        }

    def sales_agent_node(state: SupervisorState) -> dict:
        """
        调用销售子Agent

        执行流程与 call_tech_agent 相同
        """
        pending = state.get("pending", [])
        print("sales pending:", pending)

        completed = state.get("completed", [])
        print("sales completed:", completed)
        result = sales_subgraph.invoke({"messages": state["messages"]})
        return {
            "pending": pending,
            "completed": [*state['completed'], "sales_agent"],
            "messages": result["messages"],
        }

    def admin_agent_node(state: SupervisorState) -> dict:
        """
        调用客户管理子Agent

        执行流程与 call_tech_agent 相同
        """
        pending = state.get("pending", [])
        print("admin pending:", pending)

        completed = state.get("completed", [])
        print("admin completed:", completed)
        result = admin_subgraph.invoke({"messages": state["messages"]})
        return {
            "pending": pending,
            "completed": [*state['completed'], "admin_agent"],
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
        {"message": "我想了解专业版的价格"},
        # {"message": "查询一下我的余额，用户ID是user123"},
        # {
        #     "message": "我的应用登录有问题，显示error 500，另外我想了解专业版的价格。我的用户ID是user123帮我查询一下我的余额"},
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

send 并发方式

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





## 检查点

检查点是在每个超级步骤中保存的图状态的快照，由`StateSnapshot`具有以下关键属性的对象表示：

- `config`：与此检查点相关的配置。
- `metadata`：与此检查点相关的元数据。
- `values`：当前 `State` 的值。也就是图执行到目前为止，所有变量的状态值（如 `"messages"`, `"steps"`, `"results"` 等字段的值）。
- `next`图中接下来要执行的节点名称的元组。
- `tasks`：包含具体要执行的任务的详细信息，用 `PregelTask` 类型表示。比 `next` 更详细

### LangGraph 中检查点的作用

| 🌟 容错恢复                  | 如果执行中断（如容器崩溃、任务超时），可以从上次保存的状态恢复，不用重跑整个流程 |
| --------------------------- | ------------------------------------------------------------ |
| 💾 状态追踪/审计             | 可以记录每一步节点执行时的中间状态，方便 Debug、回溯和监控   |
| 🔁 实现有状态的异步/长流程图 | 对于多轮对话、多阶段任务，检查点使 LangGraph 支持状态持久化和任务跟踪 |

### 本质理解

LangGraph 中的图是围绕 **`State`** **状态对象** 构建的：

> 每个节点执行时会读取当前State，并返回State的局部更新，这些更新会被合并到全局State中。

所谓的“检查点”就是：

> **在某个节点运行后，把当时的** **`State`** **存起来**（比如存到数据库或磁盘）

然后如果下次因为任何原因中断或重新运行，只需：

> **加载上次的检查点状态** **`State`****，重新进入图流程**

#### 重放机制

``` python
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
    print("node_2")
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
    replay_checkpoint = None
    for checkpoint in history:
        if checkpoint.next == (next_node_name,):
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
    print("第一次执行完成")
    print("#" * 70)
    print(final_result["node_1"])
    print(final_result["node_2"])
    print(final_result["node_3"])
    print(final_result["node_4"])
    print(final_result["comments"])


if __name__ == '__main__':
    fork_main()

```

添加短期记忆存储

``` python
checkpointer = InMemorySaver()
```

添加到 graph

``` python
graph = builder.compile(
    checkpointer=checkpointer
)
```

第一次执行完毕后，下次执行前查看历史

``` python
# 获取 State 历史
history = state_history(graph, config)
  
  
# 获取 State 历史
def state_history(graph: CompiledStateGraph, config: RunnableConfig) -> list[StateSnapshot]:
  return list(
      graph.get_state_history(config)
  )
```

**get_state_history** 获取历史，获取某个检查点，在历史中查找；

``` python
# 获取 Replay 起点
def get_replay_checkpoint(next_node_name: str, history: list[StateSnapshot]):
    replay_checkpoint = None
    for checkpoint in history:
        if checkpoint.next == (next_node_name,): # next 是一个元组
            replay_checkpoint = checkpoint
            break

    if replay_checkpoint is None:
        raise RuntimeError(
            f"没有找到节点 {next_node_name} 执行前的 Checkpoint"
        )

    return replay_checkpoint
```

数据结构

``` python
    replay_checkpoint = get_replay_checkpoint(next_node_name="node_2", history=history)

    print("\n\n")
    print("#" * 70)
    print("获取 node_2 重放")
    print("#" * 70)
    print("\n config 配置:")
    print(
        replay_checkpoint.config)  # {'configurable': {'thread_id': 'replay-demo-001', 'checkpoint_ns': '', 'checkpoint_id': '1f1a075a-40c6-6a86-8001-96a14b89e275'}}
    print("\n parent_config 上个 checkpoint 配置，上个节点执行完后的:")
    print(
        replay_checkpoint.parent_config)  # {'configurable': {'thread_id': 'replay-demo-001', 'checkpoint_ns': '', 'checkpoint_id': '1f1a075a-40c5-6c4e-8000-556b85dc1574'}}
    print("\n state 状态:")
    print(replay_checkpoint.values)  # {'node_1': '节点 1-215', 'question': 'LangGraph 的 Replay 机制是什么？'}
    print("\n next 下个节点，是个元组:")
    print(replay_checkpoint.next)  # ('node_2',)
    print("\n tasks 任务列表:")
    print(
        replay_checkpoint.tasks)  # (PregelTask(id='c3dc8bab-b2ac-52d7-00a5-1392cc4fbe67', name='node_2', path=('__pregel_pull', 'node_2'), error=None, interrupts=(), state=None, result={'node_2': '节点 2-183'}),)
    print("\n metadata 元数据:")
    print(replay_checkpoint.metadata)  # {'source': 'loop', 'step': 1, 'parents': {}}
    print("\n created_at 创建时间:")
    print(replay_checkpoint.created_at)  # '2026-08-25T11:13:09.941173+00:00'
    print("\n interrupts 中断列表:")
    print(replay_checkpoint.interrupts)  # ()
```

**重放（重点）**

```python
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
```

**config** 需要重放的配置项，values 修改状态；**update_state** 运行额外的修改历史状态；

如果当前重放的节点是 **node_2**，那么 **node_2**之前的节点不会更新，意味着之前的节点修改状态不会发生改变；这个时候就可以通过 **values** 修改之前的状态；

节点是 **node_2**，包括**node_2**在内的后续节点都会重新执行；

**update_state** 就是开启一条分支重新走；如果没有使用 **update_state**，则默认重放后的节点覆盖；

``` python
######################################################################
第一次执行完成
######################################################################
节点 1-715
节点 2-504
节点 3-869
节点 4-178
['节点 1-326', '节点 2-856', '节点 3-133', '节点 4-139']



######################################################################
开始 Replay
######################################################################
节点 1-715 未改变
节点 2-384 覆盖
节点 3-487 覆盖
节点 4-289 覆盖
['节点 1-326', "更新插入'comments'", '节点 2-218', '节点 3-140', '节点 4-846']

# "更新插入'comments'", '节点 2-218', '节点 3-140', '节点 4-846' 这块是覆盖

```



不使用**update_state**， 则默认覆盖；

``` python
def main():
    # 创建 Checkpointer
    checkpointer = InMemorySaver()
    # 定义配置
    config: RunnableConfig = {
        "configurable": {
            "thread_id": "replay-demo-001"
        }
    }
    # 创建 Graph
    graph = create_graph(checkpointer)

    # 执行 Graph
    result = graph.invoke(
        {
            "question": "LangGraph 的 Replay 机制是什么？"
        },
        config=config
    )
    print("\n\n")
    print("#" * 70)
    print("第一次执行完成")
    print("#" * 70)
    print(result["node_1"])
    print(result["node_2"])
    print(result["node_3"])
    print(result["node_4"])
    print(result["comments"])

    # 获取 State 历史
    history = state_history(graph, config)
    replay_checkpoint = get_replay_checkpoint(next_node_name="node_2", history=history)

    # 执行 Replay
    replay_result = graph.invoke(
        None,
        config=replay_checkpoint.config
    )

    print("\n\n")
    print("#" * 70)
    print("Replay 完成")
    print("#" * 70)

    print("\nReplay 最终答案：")

    print(replay_result["node_1"])
    print(replay_result["node_2"])
    print(replay_result["node_3"])
    print(replay_result["node_4"])
    print(replay_result["comments"])
```

``` python
######################################################################
第一次执行完成
######################################################################
节点 1-384 未改变
节点 2-106 重放开始，覆盖
节点 3-292 覆盖
节点 4-432 覆盖
['节点 1-974', '节点 2-620', '节点 3-710', '节点 4-512']


######################################################################
Replay 完成
######################################################################

Replay 最终答案：
节点 1-384 未改变
节点 2-930 重放开始，覆盖
节点 3-965 覆盖
节点 4-384 覆盖
['节点 1-974', '节点 2-892', '节点 3-251', '节点 4-997']
```



## 更新对应状态（分叉）

使用 `graph.update_state()` 方法编辑图状态。

**更新状态（Update State）就是手动修改某个 Checkpoint 对应的状态数据。它不会删除原来的历史，而是基于这个状态创建一个新的 Checkpoint。你可以修改消息、工具结果以及其他 State 字段。更新完成后，可以从这个新状态继续执行后续节点。这是实现人工介入、调试和纠错的重要机制。**

### 方法参数

**config**

- 必须包含 `thread_id` 指定要更新的线程
- 可选包含 `checkpoint_id` 来分叉选定的检查点

**values**

- 用于更新状态的值
- 更新会传递给 **reducer** 函数（如果定义了）
- 没有 **reducer** 的通道会被覆盖

**as_node**

- 可选参数，指定更新来自哪个节点
- 影响下一步执行的节点



重放更新状态首选**update_state**

重放之后的节点会把之前的节点状态数据进行替换掉，注意不是替换检查点，检查点是追加。

![image-20260826112407670](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260826112407670.png)

**总结：**

1. **不带状态更新的重放，获取到对应检查点后，会先获取该检查点进行之后节点的执行**
2. **带状态更新的重放，会在原有节点的基础上，开辟一条新分支，继续执行剩下的节点**

**本质区别：update_state 就是带状态更新的重放**



# 记忆存储

长期记忆

短期，长期

# 流式输出





# 记忆

使用 redis

使用 postgres



## 管理短期记忆



裁剪，删除，总结



# 人工审核

动态中断interrpt，静态中断；



# MCP

模型上下文协议；

工具，提示词，文件操作



服务，本地，





# DeepAgent



