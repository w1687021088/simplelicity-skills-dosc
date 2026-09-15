# Agent

将聊天的 LLM ChatGPT 原本的输出理解、分析推理、输出文字或者代码真正的落地。

- **规划**：拆解复杂任务；

- **动手**：能调用工具；

- **记忆**：长期记住你的习惯；

- **主动**：遇到问题会自己调整方案；

  ![agent__002](/Users/zhangjiewu/Desktop/docs/image/agent__002.png)

## 框架

### 单智能体编排型

让一个 Agent 能稳定的干活、可控的执行流程；

- **LangChain**：工具调用，Prompt 链路、Agent 执行；

- **LangGraph**： 状态流转、循环推理、复杂任务流程控制；

- **AgentsSDK**： OpenAI 官方的 Agent + 工具调用、结构化输出；

- **GoogleADK**：基于 Gemini 的 Agent + 工具 + 企业集成；

### 多智能体协作框架

一个流程化的工作流，让 AI 默认全套流程；

- **CrewAL**：角色分工（写手、分析、执行）；

- **AutoGen**： Agent 互相对话，解决问题；

- **MetaGPT**：自动 PM/开发/测试流程；

- **LangGraph**：基于状态图的多 Agent 协作与流程控制；

## 核心

- **推理**：理解问题，分析信息；
- **规划**：制定计划，选择工具；
  - 工具：搜索、数据库、代码执行、api 调用等；
  - 企业集成：对接企业系统
- **决策**：判断下一步，生成行动指令；

![agent__003](/Users/zhangjiewu/Desktop/docs/image/agent__003.png)

## 记忆

### 短期记忆

### 长期记忆

### 记忆管理

## 技能

## 反馈与迭代

### 结果评估

检查任务结果是否符合目标；

### 经验沉淀

更新长期记忆，积累经验；

### 策略调整

优化计划，改进执行策略；

### 人类反馈

# # Langchain

## Agents代理

一个典型的 Agent 在接到任务后，会启动一个**思考、行动、观察**的循环，直到问题解决。这个流程通常称为 **ReAct** 模式；

<img src="/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260801004153560.png" alt="image-20260801004153560" style="zoom:50%;" />

```python
from langchain.agents import create_agent
from settings import app_settings

llm = app_settings.get_bailian_openai_client()


# 创建工具
def get_weather(city: str) -> str:
    """获取指定城市的天气"""
    return f'{city}的天气是晴天'


def main():
    agent = create_agent(
        model=llm,
        system_prompt="你是一个乐于助人的智能助手，能够回答用户关于天气的问题，可以使用提供的工具来获取城市的天气信息",
        tools=[get_weather],
    )

    messages = {
        "messages": [
            {"role": "user", "content": "广州今天气怎么样？"},
        ]
    }

    result = (agent.invoke(messages))

    print(result.get("messages"))
    print(result)


if __name__ == '__main__':
    main()
```

输出的结构

```python
{
        'messages': [
            # 用户的问题
            HumanMessage(
                content='广州今天气怎么样？',
                additional_kwargs={},
                response_metadata={},
                id='20cdf857-2a3e-4978-8556-827c8ea6e4b1'
            ),
          	# agent
            AIMessage(
                content='我来帮您查询广州今天的天气情况。',
                additional_kwargs={
                    'refusal': None
                },
                response_metadata={
                    'token_usage': {
                        'completion_tokens': 26,
                        'prompt_tokens': 79,
                        'total_tokens': 105,
                        'completion_tokens_details': {
                            'accepted_prediction_tokens': None,
                            'audio_tokens': None,
                            'reasoning_tokens': None,
                            'rejected_prediction_tokens': None,
                            'text_tokens': 26
                        },
                        'prompt_tokens_details': {
                            'audio_tokens': None,
                            'cache_write_tokens': None,
                            'cached_tokens': 0, 'text_tokens': 79
                        }
                    },
                    'model_provider': 'openai',
                    'model_name': 'kimi-k2.6',
                    'system_fingerprint': None,
                    'id': 'chatcmpl-08b6be4d-c065-9df3-bfdb-a7e67a347016',
                    'finish_reason': 'tool_calls',
                    'logprobs': None
                },
                id='lc_run--019fbc7e-3037-7a41-ae13-546116012f67-0',
              # 提取参数
                tool_calls=[
                    {'name': 'get_weather', 'args': {'city': '广州'},
                     'id': 'call_b91d1f9d2a784e03b99e9b4b',
                     'type': 'tool_call'}],
                invalid_tool_calls=[],
                usage_metadata={
                    'input_tokens': 79,
                    'output_tokens': 26,
                    'total_tokens': 105,
                    'input_token_details': {
                        'cache_read': 0
                    },
                    'output_token_details': {}
                }
            ),
          	# 工具
            ToolMessage(
                content='广州的天气是晴天',
                name='get_weather',
                id='257c7574-ddcb-4bc3-a18f-fa368812e2db',
                tool_call_id='call_b91d1f9d2a784e03b99e9b4b'
            ),
           # agent
            AIMessage(
                content='广州今天的天气是**晴天**，适合外出活动。建议您注意防晒，多补充水分。',
                additional_kwargs={'refusal': None},
                response_metadata={
                    'token_usage': {
                        'completion_tokens': 18,
                        'prompt_tokens': 128,
                        'total_tokens': 146,
                        'completion_tokens_details': {
                            'accepted_prediction_tokens': None,
                            'audio_tokens': None,
                            'reasoning_tokens': None,
                            'rejected_prediction_tokens': None,
                            'text_tokens': 18
                        },
                        'prompt_tokens_details': {
                            'audio_tokens': None,
                            'cache_write_tokens': None, 'cached_tokens': 0,
                            'text_tokens': 128
                        }
                    },
                    'model_provider': 'openai',
                    'model_name': 'kimi-k2.6',
                    'system_fingerprint': None,
                    'id': 'chatcmpl-34be2c92-29cf-997b-a745-a2f804ea0693',
                    'finish_reason': 'stop',
                    'logprobs': None
                },
                id='lc_run--019fbc7e-3503-77e1-ac6a-9c7f0348a053-0',
                tool_calls=[],
                invalid_tool_calls=[],
                usage_metadata={
                    'input_tokens': 128,
                    'output_tokens': 18,
                    'total_tokens': 146,
                    'input_token_details': {
                        'cache_read': 0
                    },
                    'output_token_details': {}
                }
            )
        ]
    }
```

 人机交互流程拆解意思

```text
用户：广州今天气怎么样？

agent： 我看到有一个工具是查询天气的，这个工具叫 get_weather，并提取参数；

工具： get_weather -> 广州的天气是晴天；

agent： 广州今天的天气是**晴天**，适合外出活动。建议您注意防晒，多补充水分。
```

## Models模型

模型是Agent代理的推理引擎。模型驱动代理的决策过程，决定调用哪些工具、如何解释结果以及何时提供正确答案。

所以选择的模型质量和能力直接影响代理的**可靠性和性能**。不同的模型在相同的任务中表现不一样。

LangChain提供了很多供应商的集成，所以能很方便的接入并测试合适自己的模型。

聊天模型：https://docs.langchain.com/oss/python/integrations/chat

嵌入模型：https://docs.langchain.com/oss/python/integrations/embeddings

#### 独立模型

在LangChain中使用独立模型的最简单方法是使用**`init_chat_model`**从你选择的聊天模型提供商初始化一个模型对象。

```Python
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os
# 加载环境变量
load_dotenv()

# 初始化模型
llm = init_chat_model(model="qwen3.6-plus", 
                      api_key=os.getenv("DASHSCOPE_API_KEY"), 
                      base_url=os.getenv("DASHSCOPE_BASE_URL"),
                      model_provider="openai")  # 指定模型提供商为OpenAI，千问在langchain中并没有原生支持，可以使用openai兼容模式

# 普通对话
# result = llm.invoke("你好！")
# print(result.content)
# 流式输出
# for chunk in llm.stream("请告诉我一个笑话！"):
#     print(chunk.text, end="", flush=True)
# 批次对话-并行调用Agent完成任务
responses = llm.batch([
    "为什么天空是蓝色的？",
    "为什么鸡有翅膀却不能飞？",
    "什么是langchain ？"
])
for response in responses:
    print(response.content)
    
```

#### 模型厂商

通过对应模型厂商提供的模块调用模型

```python
# Qwen
def get_qwen_client(self, model: str = "qwen-plus", enable_thinking: bool = True,
                    thinking_budget: Optional[int] = None):
    return ChatQwen(
        api_key=self.BAILIAN_OPEN_AI_KEY,
        base_url=self.BAILIAN_OPEN_AI_BASE_URL,
        model=model,
        # 是否显示思考过程
        enable_thinking=enable_thinking,
        # 思考过程预算
        thinking_budget=thinking_budget
    )

# openai
def get_openai_client(
        self,
        model: Literal[
            'gpt-5.6-sol',
            'gpt-5.6-terra',
            'gpt-5.6-luna',
            'gpt-5.5',
            'gpt-5.4',
            'gpt-5.4-mini',
            'gpt-image-2'
        ] = 'gpt-5.6-terra'
):
    return ChatOpenAI(
        api_key=self.TEAMOROUTER_OPENAI_API_KEY,
        base_url=self.TEAMOROUTER_OPENAI_BASE_URL,
        model=model,
    )

# deepseek
def get_deepseek_client(self, model: str = "deepseek-v4-pro", **kwargs: Any):
    return ChatDeepSeek(
        api_key=self.DEEPSEEK_KEY,
        base_url=self.DEEPSEEK_OPEN_AI_BASE_URL,
        model=model,
        **kwargs
    )
```

#### 多模态模型

首先去供应商的官网看模型是否支持多模态。

```Python
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
# 在线的图片
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "描述这个图像的内容"},
        {"type": "image", "url": "https://bkimg.cdn.bcebos.com/pic/2e2eb9389b504fc2ef3eb893ebdde71191ef6dc6?x-bce-process=image/format,f_auto/quality,Q_70/resize,m_lfit,limit_1,w_536"},
    ]
}
response = llm.invoke([message])
print(response.content_blocks)
```

## Messages消息

在 LangChain 体系中，Message 是与大语言模型进行交互时的**基础数据结构**，用于维护和管理模型的上下文窗口——它不仅包含实际的对话文本内容，还附带角色标识、时间戳等元数据以完整表征当前的会话状态。

消息包含：

1. Role角色（system-系统, human-用户, assistant-助手, tool-工具）：表示消息类型
2. Content内容：表示消息的实际内容（文本、图片、文档等）
3. Metadata元数据：可选字段，如响应信息、消息ID和令牌使用情况

```Python
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os
# 加载环境变量
load_dotenv()

# 初始化模型
llm = init_chat_model(model="qwen3.6-plus", 
                      api_key=os.getenv("DASHSCOPE_API_KEY"), 
                      base_url=os.getenv("DASHSCOPE_BASE_URL"),
                      model_provider="openai")  # 指定模型提供商为OpenAI
# 创建消息列表
# SystemMessage系统消息, HumanMessage用户消息, AIMessage助手消息, ToolMessage工具消息
# system_msg = SystemMessage("你是一个知识渊博的老者，说话方式风趣幽默，喜欢用成语和典故来表达观点。")
# human_msg = HumanMessage("大模型是什么?")
# messages = [system_msg, human_msg]

# 也可以使用字典格式的消息列表
messages = [
    {"role": "system", "content": "你是一个知识渊博的老者，说话方式风趣幽默，喜欢用成语和典故来表达观点。"},
    {"role": "user", "content": "写一首关于春天的诗句。"}  
]

# 普通对话
result = llm.invoke(messages)  # 会返回一个AIMessage
print(result.content)
```

### 提示词工程

**提示词工程**（**Prompt Engineering**），就是通过优化提示词让模型输出结果更符合业务需求。

角色： system，user，assistant，tool；

一般来说系统提示词包含以下五个部分：

| 组成部分        | 核心作用                                                     | 示例                                               |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| 系统指令        | 设定角色、任务目标、输出格式和规则，相当于给AI的“人设”和“总纲领”。 | “你是一位资深Python开发工程师，请用中文回答问题。” |
| 工具/函数定义   | 描述AI可以调用的外部工具或函数，包括名称、参数和说明。       | {"name": "get_weather", "parameters": {...}}       |
| 上下文/背景知识 | 提供完成任务所需的背景文档、数据或示例（Few-shot），是静态的参考资料。 | 一份用户手册、一篇新闻原文、3个问答示例。          |
| 对话历史        | 多轮对话中的历史消息记录，是模型理解上下文的“记忆”。         | 用户之前问的3个问题和AI的回答。                    |
| 用户输入        | 当前最新的、动态的用户问题或指令，是每次请求中最核心的变化部分。 | “请总结一下今天沪深股市的走势。”                   |

## Tools工具

**工具（Tool）** 是 Agent 可以调用的外部函数或能力。简单来说，工具就是 Agent 的“手脚”——让 LLM 不仅会说，还能做事。

内置工具：https://docs.langchain.com/oss/python/integrations/tools

工具写法

``` python
from langchain.tools import tool

# 自定义工具函数，并使用@tool装饰器进行注册
# 函数名称会被当作工具的名称，函数参数会被当作工具的输入参数，函数返回值会被当作工具的输出结果；函数的文档字符串会当作工具的描述
# 所以文档字符串需要清晰地描述工具的功能和输入输出参数的含义，以便Agent能够正确地调用工具并理解其功能
@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息

    Args:
        city (str): 城市名

    Returns:
        str: 天气信息
    """
    return f"{city}的天气是晴朗的!"  # 工具返回值会自动处理转成ToolMessage
```

或者

``` python
from pydantic import BaseModel, Field
from langchain.tools import tool

class Weather(BaseModel):
    city: str = Field(..., description="城市名")

@tool("get_city_weather", description="获取指定城市的天气信息", args_schema=Weather, return_direct=True)
def get_weather_02(city: str) -> str:
    """获取指定城市的天气信息

    Args:
        city (str): 城市名

    Returns:
        str: 天气信息
    """
    return f"{city}的天气是晴朗的!"  # 工具返回值会自动处理转成ToolMessage
```

推荐第一种方式；

也可以使用 pydantic

```python
class CalculateInput(BaseModel):
  a: float = Field(description="第一个参数")
	b: float = Field(description="第二个参数")

@tool("calculator", args_schema=CalculateInput)
def calculate(a: float, b: float):

```



### Function Calling（重点）

**核心**：**Function Calling** 是赋予大语言模型（LLM）**生成结构化指令**以驱动外部工具的能力。

**本质**：它并非由模型直接执行代码，而是让模型充当“翻译官”**和**“决策员”。它将用户的模糊意图，精准转化为机器能理解的结构化数据（如 JSON）。

**意义：** 它打破了 LLM 的“知识围墙”，通过外挂函数库，让模型能够获取实时数据（如天气、股价）并操作物理世界（如发邮件、关灯）。

#### 概念

**Function Calling 是大语言模型（LLM）的一项标准化接口能力，其本质是一种“意图识别与结构化输出”机制。**

具体来说，它允许开发者在调用模型时，预先定义一组带有详细描述和参数 Schema（模式）的工具（Tools）或函数（Functions）。当用户输入指令后，模型不会直接生成最终的自然语言回复，而是**先判断是否需要调用外部工具**。

如果需要，模型会**输出一个结构化的 JSON 对象**，其中精确包含了需要调用的**函数名称**以及**符合预设要求的实参（Arguments）**。

请注意，**模型本身并不执行该函数**，而是将这份“调用指令”返回给宿主应用程序，由宿主程序负责执行并获取结果。

#### 作用

**引入 Function Calling 的核心目的，是为了突破大模型固有的能力边界，实现从“纯粹的文本生成引擎”向“能够连接物理世界的通用任务处理器”的进化。具体必要性体现在以下三个层面：**

- **获取实时与私有数据（打破知识壁垒）**：大模型的训练数据存在滞后性，且无法接触企业内部私有数据。Function Calling 允许模型按需调用外部 API（如实时天气、股票行情、数据库查询），使模型能够获取最新、最准确的事实性信息，从而有效避免“幻觉”问题。
- **赋予模型执行能力（实现“知行合一”）**：大模型缺乏操作系统的执行权限。Function Calling 将模型的语义理解转化为可执行的机器指令（如发送邮件、创建工单、控制硬件），使得应用程序能够根据模型输出自动触发业务逻辑，真正实现端到端的自动化。
- **确保输出的确定性与兼容性（工程化落地）**：在实际生产环境中，上游系统要求严格的输入格式。Function Calling 强制模型输出遵循预定义的 JSON Schema，这比依赖“提示词工程”来硬控输出格式要**更稳定、更精准**，极大地降低了解析错误率，保障了企业级应用的可维护性。

#### 总结

**模型输出的是指令，执行的是外部程序**

**Function Calling 是底层的基础设施（通信协议）**，而 **Agent 是上层的高级应用架构**。Agent 利用 Function Calling 作为决策闭环中的‘执行抓手’，通过多次调用（ReAct 模式）来完成复杂的、多步骤的自主任务。”

#### 拆解

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

## Memory记忆

记忆系统就像人工智能体的“人类大脑”，让它能“记住”你们之前的每次聊天。有了记忆，AI才能从过往的交流中学习，逐渐摸清你的喜好，变得越来越“懂你”。当处理复杂问题、需要多聊几句时，这种能力不仅能大大提高办事效率，更能让你感觉是在和一个真正了解你的贴心伙伴交流。

**对话历史**是**短期记忆**最常见的形式。长时间的对话对当今的语言学习模型（LLM）构成挑战；完整的对话历史可能无法容纳在语言学习模型的**上下文窗口**中，从而导致**上下文丢失**或错误。

#### 短期记忆

短期记忆本质是存储state状态；

短期记忆是一个线程级（会话），需要在创建代理的时候指定一个**checkpointer**检查点。

``` python
agent = create_agent(
    model=llm,
)
没有短期记忆的话，每次对话都是独立的， 会忘记之前对话的内容
result_1 = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "你好，我叫青雀"
        }
    ]
})


result_2 = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "你好，我的名字叫什么"
        }
    ]
})
```

以上记忆只是在**内存**中存储的。在生产中数据需要持久化，所以使用数据库支持的检查点工具

有关更多检查点选项，包括 SQLite、Postgres 和 Azure Cosmos DB，请参阅持久化文档中的[检查点库列表](https://docs.langchain.com/oss/python/langgraph/checkpointers#checkpointer-libraries)。

使用postgres，并且每次的提问与回复的内容全部存储在数据库，并且在下一个问题中将这么消息一起发给大模型

``` python
DB_URI = "postgresql://postgres:12345678@localhost:5432/langchain_agent_01?sslmode=disable"

"""
定义一个线程的配置，指定这个线程的id = qin_que_01（自定义），这个id可以是任何字符串，用于标识这个线程

同一个线程的id之间的内容（记忆）是共享的
"""
thread_config = {
    "configurable": {
        "thread_id": "qin_que_01",
    }
}

# 短期记忆
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup() # 设置检查点

    agent = create_agent(
        model=llm,
        checkpointer=checkpointer
    )

    # result_1 = agent.invoke(
    #     {
    #         "messages": [
    #             {
    #                 "role": "user",
    #                 "content": "你好，我叫青雀"
    #             }
    #         ]
    #     },
    #     config=thread_config # type: ignore
    # )


    result_2 = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": "你好，我的名字叫什么"
            }
        ]
    }, config=thread_config) # type: ignore

    # print(result_1)
    print(result_2)
```

#### 自定义Agent记忆

目前的 Agent 默认记忆就是 **`messages`（消息列表）**。它记录了“用户说了什么”、“AI 回了什么”、“调了什么工具”。这些信息以**时间线**的方式存在 Postgres 里 或者内存。但它是**被动记录**，Agent 只是“回忆”对话历史，并没有“提炼”出什么。

- **静态注入**：在 System Prompt 里写死一句“你是一个精通 Python 的专家”。（这叫系统提示词，不算持久化记忆）。
- **动态注入（RAG）**：把数据库里查到的“用户名片”塞进 State。比如在 State 里加一个 `user_info` 字段，里面存着 `{"name": "张三", "vip_level": 3}`。Agent 看到这个，就知道怎么称呼用户、给什么折扣；

代理默认是使用`AgentState`去管理记忆的。

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

也可以**扩展额外的字段**，通过 **`state_scheme `**参数传递给 **`create_agent`****。**

``` python
# 创建一个Agent实例
agent = create_agent(
    model=llm,
    state_schema=CustomAgentState,  # 使用自定义的State来存储对话状态
    checkpointer=InMemorySaver(),  # 使用InMemorySaver来保存对话状态，这样在同一线程中进行的对话可以共享状态
)

# 定义一个线程配置，指定线程ID为"user_1"，这样在同一线程中进行的对话可以共享状态
thread_config = {"configurable": {"thread_id": "user_1"}}

agent.invoke(
    {
        "messages": [{"role": "user", "content": "你好，我的名字叫做初见！"}],
        # 在输入参数中直接传递用户的ID、名字和爱好等信息，这些信息会被存储在Agent的State中，并且在同一线程中进行的对话可以共享这些状态信息？
        "user_id": "user_18564877216",
        "user_name": "初见",
        "hobby": {"sport": "basketball", "music": "pop"}
    },    
    thread_config,           
)
```

当我们开启短期记忆之后，记忆长度可能会超过模型得上下文窗口,langhcain提供三种方案去解决问题。

1. 裁剪消息：删除前面或者最后得N条信息（在调用llm之前）
2. 删除消息：永久删除LangGraph状态中的消息
3. 总结消息：总结早期的消息并用摘要替换

## Streaming流式输出



![agent__004](/Users/zhangjiewu/Desktop/docs/image/agent__004.png)

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
def main():
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
from settings import app_settings
from langchain.agents import create_agent
from langchain.tools import tool
from langgraph.config import get_stream_writer  # 导入get_stream_writer函数

llm = app_settings.get_qwen_client()


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
    model=llm,
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

    # step: model
    # content: [{'type': 'reasoning',
    #            'reasoning': '用户询问长沙的天气。\n我需要调用get_weather工具，传入参数city="长沙"。\n然后返回获取到的天气信息。'},
    #           {'type': 'tool_call', 'id': 'call_3c059510a35646b4911420fa', 'name': 'get_weather',
    #            'args': {'city': '长沙'}}]

    # step: tools
    # content: [{'type': 'text', 'text': '长沙的天气是晴天'}]

    # step: model
    # content: [{'type': 'reasoning',
    #            'reasoning': '用户询问长沙的天气，我调用了get_weather工具并得到了结果：长沙的天气是晴天。现在我需要把这个结果用自然语言回复给用户。'},
    #           {'type': 'text',
    #            'text': '长沙现在的天气是晴天 ☀️。如果您需要了解更详细的天气信息（如温度、湿度等），请告诉我！'}]

```

### 组合使用

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

```

### event事件流(Beta测试版)

``` python
agent = create_agent(
    model=llm,
    system_prompt="你是一个乐于助人的智能助手，能够回答用户关于天气的问题，可以使用提供的工具来获取城市的天气信息",
    tools=[get_weather],
)

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
            
```

## 结构化输出

**结构化输出**，简单来说，就是让**AI模型**（如GPT、Claude等）不再是“随口说”一段自然语言，而是严格按照你预先定义好的“**表格**”或“**表单**”来生成数据

**为什么要结构化输出？**  

你问：“提取张三的联系方式，邮箱是zhangsan@email.com，电话13800001111。”

AI回复：“好的，张三的联系方式是邮箱zhangsan@email.com，电话13800001111。”

问题：这句话你的程序没法直接使用，需要用正则表达式等复杂方法去“猜”和“解析”。

传统自由文本输出存在解析脆弱、正则容易出错、无法自动校验数据完整性等局限。结构化输出能够：

- 保证类型安全：LLM 输出与 Python 类型系统对齐。
- 提升系统可靠性：支持 Schema 验证，若不符合预期可自动修复和重试。
- 增强程序可执行性：输出可直接作为函数参数、路由决策或 Agent 行为指令。

**实际用途：**

1. 信息提取（简历解析、合同字段抽取、具体意图提取等）
2. Agent 参数生成（提取具体参数，调用API或工具）
3. Workflow 状态控制（决定下一步执行节点）
4. 多 Agent 通信（作为 Agent 间的数据协议）
5. 决策与路由（决定执行什么动作）

原生策略 (ProviderStrategy)：利用OpenAI、Anthropic等模型API自带的JSON模式。模型在“生成层”就保证输出格式正确，最可靠。（优先选择）

``` python
from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.messages import HumanMessage
from langchain.agents.structured_output import ProviderStrategy
from settings import app_settings

llm = app_settings.get_qwen_client()

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
print(result_pydantic.get("structured_response"))
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

工具策略 (ToolStrategy)：把输出要求伪装成一个“工具”让模型调用。兼容不支持原生JSON模式的模型，但需要处理可能的格式错误。（当模型不支持结构化输出的时候选择）

``` python
from typing import Literal

from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from settings import app_settings

llm = app_settings.get_qwen_client()

# ToolStrategy 也支持 pydantic、Dataclass、TypedDict、JSON Schema四种方式，使用方式和模型原生策略一致
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

**核心定义**：在 LangChain 1.0 中，Runtime 是由底层 LangGraph 提供的一个依赖注入（DI）容器和执行环境。 

**通俗比喻**：如果把大模型（Model）比作智能体的大脑，各类工具（Tool）是智能体用来做事的手脚，那 Runtime 就是智能体专属的微型工作台操作系统。智能体执行任务全程，所有临时信息、外部资源、会话记忆、流式输出、权限身份都由它统一调度托管，给大脑和手脚提供完整、有序的工作环境。

![agent__005](/Users/zhangjiewu/Desktop/docs/image/agent__005.png)

### Runtime 是什么

可以把 Runtime 理解成：

> **Agent 当前这一次执行时，LangChain 给 Middleware / Tool 提供的“运行环境”。**



### Runtime 的核心组件

- **Context（上下文）**：存放静态、不可变的配置信息。例如用户 ID、数据库连接等。它在一次会话中保持不变，为工具提供基础依赖。
- **Store（存储器）**：用于实现长期记忆（BaseStore 实例）。允许智能体跨会话保存和读取固化的数据。
- **State（状态）**：存放交互过程中的可变数据。例如当前的对话历史（messages 列表）、计数器等，类似于前端框架中的 State。
- **Execution Info（运行配置）**：存放可变的标准运行时配置。例如 `thread_id`、运行id、重试次数等。
- **Stream Writer（流写入器）**：用于实现低延迟的流式响应，允许智能体在执行过程中实时向用户推送进度或更新信息。
- **Server info（服务器信息）**: 仅在LangGraph服务器上运行时的服务器特定元数据（助理ID、图ID、已验证用户）

#### 用法

``` python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime
from langchain_core.messages import ToolMessage
from langgraph.types import Command  # 可以在工具中修改状态
from langgraph.store.memory import InMemoryStore
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState

from settings import app_settings

llm = app_settings.get_qwen_client()

# DB_URI = "postgresql://postgres:12345678@localhost:5432/langchain_agent_01?sslmode=disable"

"""
定义一个线程的配置，指定这个线程的id = qin_que_01（自定义），这个id可以是任何字符串，用于标识这个线程

同一个线程的id之间的内容（记忆）是共享的
"""
thread_config = {
    "configurable": {
        "thread_id": "qin_que_01",
    }
}

# 定义一个常量，用于存储用户信息
STORE_KEY = "user_profile"
# 定义一个常量，用于存储用户信息的命名空间路径
NAMESPACE_PATH = "user"


# 短期记忆
# 自定义状态
class CustomAgent(AgentState):
    # 用户爱好
    user_hobby: list[str]


# 自定义上下文的属性
@dataclass  #
class CustomContext:  # 名字随便取
    user_id: str  # 用户id
    user_name: str  # 用户名称


@tool
def set_user_hobby(hobby: list[str], runtime: ToolRuntime[CustomContext, CustomAgent]):  # state是存在一次会话中的
    """设置用户爱好"""
    # print(f"提取的用户爱好：{hobby}")
    # state是短期记忆，要想长期保存需要使用长期记忆   长期记忆会在langgraph详细介绍
    if runtime.config:
        configurable = runtime.config.get("configurable", {})
        thread_id = configurable.get("thread_id")
    else:
        thread_id = None
    # print(f"thread_id: {thread_id}", runtime.context.user_name)

    # 构造的 Namespace 和存放路径
    namespace = (runtime.context.user_id, NAMESPACE_PATH)  # 对应：(用户ID, 记忆类别)
    # 新增长期记忆
    if runtime.store:
        runtime.store.put(
            namespace=namespace,
            key=STORE_KEY,  # 记忆条目的 Key
            value={
                # 存储用户名
                "user_name": runtime.context.user_name,
                # 存储用户爱好
                "hobby": hobby
            }
        )

    # 可以使用command在工具中更新状态，Command会在langgraph详细介绍
    return Command(
        update={  # 更新Agent的state状态
            "user_hobby": hobby,
            "messages": [
                ToolMessage(
                    content=f"已更新用户爱好：{hobby}",
                    tool_call_id=runtime.tool_call_id
                )
            ]
        }
    )


# 创建工具
@tool
def get_user_name(runtime: ToolRuntime[CustomContext]):  # 在工具中使用runtime，runtime只存在一次任务中
    """获取用户姓名"""
    # print(f'获取对于的状态（短期记忆）: {runtime.state["messages"]}')  # 获取对于的状态（短期记忆）
    return runtime.context.user_name  # 工具返回值会自动处理转成ToolMessage


# 创建一个内存的长期记忆
store = InMemoryStore()  # 存储容器-用户的长期记忆

# 创建一个内存的短期记忆（state）
checkpointer = InMemorySaver()

# 创建代理
agent = create_agent(  # type: ignore
    model=llm,  # 模型
    tools=[get_user_name, set_user_hobby],
    store=store,  # 长期记忆
    checkpointer=checkpointer,  # 短期记忆
    state_schema=CustomAgent,  # 自定义state
    context_schema=CustomContext,  # 自定义context
)

# Context上下文只存在一次任务中 ， runtime的生命周期就是Agent执行一次任务
agent.invoke(
    {"messages": [{"role": "user", "content": "我的名字叫什么"}]},
    config=thread_config,  # type: ignore
    context=CustomContext(user_id="user1", user_name="青雀")
)

agent.invoke(
    {"messages": [{"role": "user", "content": "我目前的爱好喜欢编程、看电视、看球赛等"}]},
    config=thread_config,  # type: ignore
    context=CustomContext(user_id="user1", user_name="青雀")
)

response = agent.invoke(
    {"messages": [{"role": "user", "content": "我的爱好是什么"}]},
    config=thread_config,  # type: ignore
    context=CustomContext(user_id="user1", user_name="青雀")
)

# print('-' * 30)
# messages = (response['messages'])
# for message in messages:
#     print(message.content)
#     print()
# 
#
# print('-' * 30)
# print(response["messages"][-1].content)

print("长期记忆中存储的内容：", store.get(("user1", NAMESPACE_PATH), STORE_KEY))

```

### state 状态

**State = Agent 在一次执行过程中，可以被读取、修改、传递，并最终保存/恢复的数据结构。**

比如用户说：

> 帮我查一下北京天气，然后告诉我适不适合跑步。

Agent 执行过程中可能经历：

```
用户问题
 ↓
LLM 决定调用天气 Tool
 ↓
天气 Tool 返回结果
 ↓
LLM 根据天气分析
 ↓
最终答案
```

那么 State 就像 Agent 手里的：

> **“工作记录本”**

里面记录：

```python
messages:
    用户说了什么
    LLM 说了什么
    Tool 返回了什么

当前 Agent 状态:
    现在进行到哪一步
```

可以粗略想成：

```python
state = {
    "messages": [
        用户消息,
        AI 消息,
        Tool 消息,
        AI 消息
    ]
}
```

#### 为什么 Agent 需要 State？

因为 Agent 不是一次 LLM 调用。

比如：

```
用户
 ↓
LLM
 ↓
Tool
 ↓
LLM
 ↓
Tool
 ↓
LLM
 ↓
最终答案
```

第二次 LLM 调用的时候，它需要知道：

> “刚才发生了什么？”

这些信息就需要存在 State 中。

可以理解：

```
State
 ↓
保存 Agent 当前这一次任务的上下文
```

#### State 是“本次运行”的

也可以理解为 state 是在本次任务中；

这是最重要的一点。

比如：

```
用户：
帮我查订单 123
```

这次 Agent 运行：

```
Run #1
State
├── 用户问题
├── Tool 调用
├── Tool 结果
└── 最终回答
```

任务完成后，这个 State 通常就结束了。

下一次：

```
用户：
帮我查订单 456
```

是：

```
Run #2
State
├── 用户问题
├── Tool 调用
├── Tool 结果
└── 最终回答
```

所以：

> **State 主要服务于“一次 Agent 执行过程”。**



### State 可以自定义

``` python
from langchain.agents import create_agent, AgentState
from langgraph.checkpoint.memory import InMemorySaver


# 自定义状态
class CustomAgentState(AgentState):
    # 用户爱好
    user_hobby: list[str]

# 创建一个内存的短期记忆（state）
checkpointer = InMemorySaver()

# 创建工具
@tool
def get_user_name(runtime: ToolRuntime[CustomContext]):  # 在工具中使用runtime，runtime只存在一次任务中
    """获取用户姓名"""
    # print(f'获取对于的状态（短期记忆）: {runtime.state["messages"]}')  # 获取对于的状态（短期记忆）
    return runtime.context.user_name  # 工具返回值会自动处理转成ToolMessage

@tool
def set_user_hobby(hobby: list[str], runtime: ToolRuntime[CustomContext, CustomAgent]):  # state是存在一次会话中的
    """设置用户爱好"""
    # 可以使用command在工具中更新状态，Command会在langgraph详细介绍
    return Command(
        update={  # 更新Agent的state状态
            "user_hobby": hobby,
            "messages": [
                ToolMessage(
                    content=f"已更新用户爱好：{hobby}",
                    tool_call_id=runtime.tool_call_id
                )
            ]
        }
    )

    # 创建代理
agent = create_agent(  # type: ignore
    model=llm,  # 模型
    tools=[get_user_name, set_user_hobby],
    checkpointer=checkpointer,  # 短期记忆
    state_schema=CustomAgentState,  # 自定义state
)
```





### Context 上下文

Context 理解成：

> **“这一次 Agent 运行时，外部给它的背景信息。”**

比如：

```
context = {
    "user_id": "123",
    "role": "admin",
    "language": "zh",
    "tenant_id": "company_a"
}
```

这些信息通常不是 Agent 自己通过对话产生的。

而是：

```
你的应用程序
      ↓
启动 Agent
      ↓
把 Context 传进去
      ↓
Agent 使用
```

#### State 和 Context 的核心区别

应该记住的一张表：

|          | State                    | Context                         |
| -------- | ------------------------ | ------------------------------- |
| 是什么   | Agent 当前状态           | 本次运行的外部背景              |
| 谁产生   | Agent 执行过程中不断变化 | 通常由应用传入                  |
| 是否变化 | **会变化**               | 通常相对稳定                    |
| 生命周期 | 当前 Agent 执行          | 当前 Agent 执行                 |
| 例子     | messages、tool result    | user_id、role、tenant_id        |
| 用途     | Agent 记住“刚才发生什么” | Agent 知道“我现在是谁/在哪工作” |

一句非常好记的话：

> **State 是“发生了什么”。**
>
> **Context 是“我是谁、我在哪、当前环境是什么”。**



#### 实际的例子

假设你做一个企业客服 Agent。

用户：

> 帮我查询订单 123。

你的应用可能给 Agent：

```python
context = {
    "user_id": "u001",
    "role": "employee",
    "tenant_id": "company_a",
    "language": "zh"
}
```

这属于：

```
Context
```

Agent 开始执行后：

```python
State
├── 用户：帮我查询订单 123
├── AI：我要调用 get_order
├── Tool：订单 123 已发货
└── AI：你的订单已经发货
```

所以：

```python
Context
├── user_id = u001
├── role = employee
├── tenant_id = company_a
└── language = zh

State
├── 用户消息
├── AI 消息
├── Tool 消息
└── AI 消息
```









## Middleware中间件

把 **Middleware** 理解成：Agent 执行任务时，站在中间“**管控流程**”的一层代码。

比如一个 Agent：

```
用户
 ↓
Agent
 ↓
LLM
 ↓
Tool
 ↓
LLM
 ↓
最终答案
```

加入 **Middleware** 后：

```
用户
 ↓
Agent
 ↓
Middleware  ← 在这里检查、修改、记录、拦截
 ↓
LLM
 ↓
Middleware  ← 再检查一次
 ↓
Tool
 ↓
Middleware  ← 工具调用也可以管
 ↓
LLM
 ↓
Middleware  ← 最终回复用户前做一些操作，评估，监控，同步数据，上报日志等；
 ↓
最终答案
```

所以它叫 **Middleware（中间件）**。

### 为什么 Agent 需要中间件？

先假设你写了一个很简单的 Agent：

``` python
用户：
帮我查一下订单 12345

       ↓

Agent

       ↓

LLM：
我需要调用 get_order

       ↓

get_order(12345)

       ↓

返回订单

       ↓

LLM：
你的订单已经发货了
```

这时候 Agent 很简单。

但是你的系统慢慢变复杂了。

你可能突然需要：

```
① 每次调用 LLM 都记录日志

② LLM 失败自动重试

③ 用户没有权限不能调用某个 Tool

④ Tool 出错要转换成友好的错误

⑤ Prompt 根据用户身份动态变化

⑥ Token 太多的时候压缩上下文

⑦ 调用 send_email 之前要求人工确认

⑧ 根据任务选择不同的模型
```

如果没有 Middleware，你可能会把这些东西全部塞进 Agent：

```
Agent
├── 业务逻辑
├── 权限
├── Retry
├── Logging
├── Prompt
├── Token 管理
├── Human approval
└── ...
```

最后 Agent 会变得非常乱。

Middleware 的目的就是：

> **把这些“Agent 怎么运行”的通用逻辑，从 Agent 的核心业务逻辑里拿出来。**

### 非常重要的区分

**Agent**

负责：

> **决定下一步做什么。**

例如：

```
用户问：
“帮我查订单”

Agent：
我要调用 get_order
```

**Tool**

负责：

> **真正执行某个具体动作。**

例如：

```
get_order("12345")
```

去数据库查订单。

**Middleware**

负责：

> **控制 Agent 执行这些动作时应该遵守什么规则。**

例如：

```
Agent 想调用 get_order
        ↓
Middleware：
这个用户有权限吗？
        ↓
YES → 执行
NO  → 拒绝
```

所以可以记：

```
Agent      = 决策者
Tool       = 执行者
Middleware = 管理者
```

### Middleware 最重要的能力：拦截

假设 Agent 想调用：

```python
send_email(...)
```

正常情况下：

```
Agent
 ↓
send_email
 ↓
邮件发送
```

加 Middleware：

```
Agent
 ↓
“我要调用 send_email”
 ↓
Middleware
 ↓
“这是高风险操作，需要人工确认”
 ↓
暂停
 ↓
人工批准
 ↓
send_email
```

所以 Middleware 不只是“做一些事情”。

它甚至可以：

> **阻止 Agent 继续执行。**

这也是它非常重要的原因。

### Middleware 可以在哪些地方“插手”

LangChain 里经常会看到这些名字：

```
before_agent
before_model
after_model
after_agent

wrap_model_call
wrap_tool_call
```

### before_agent

意思就是：

> **Agent 开始工作之前，我先做点事情。**

例如：

```
用户请求
 ↓
before_agent
 ↓
Agent
```

可以做：

```
检查用户身份
初始化状态
检查请求是否合法
还有加载长期记忆注入到 state
```

比如：

```
用户是谁？
↓
有没有登录？
↓
没有 → 直接拒绝
有 → Agent 继续
```

### before_model

这个特别重要。

意思是：

> **每次 Agent 准备调用 LLM 之前，我先插手一下。**

流程：

```
Agent
 ↓
before_model
 ↓
LLM
```

例如：

```
Context 太长了
        ↓
before_model
        ↓
压缩历史消息
        ↓
LLM
```

或者：

```
当前用户是管理员
        ↓
before_model
        ↓
动态生成管理员 Prompt
        ↓
LLM
```



### after_model

就是：

> **LLM 调用完成之后，我再检查一下。**

流程：

```
Agent
 ↓
LLM
 ↓
after_model
 ↓
继续执行
```

### after_agent

`after_agent` = Agent 整个执行完成以后，再执行一次。

用户问：

> 北京天气怎么样？

Agent 可能经历：

```
Agent 开始
 ↓
LLM
 ↓
get_weather()
 ↓
LLM
 ↓
最终回答
 ↓
Agent 结束
```

如果你想统计：

> **“这一次 Agent 总共花了多少时间？”**

那么 `after_agent` 就非常合适。

```python
from langchain.agents.middleware import after_agent
import time


@after_agent
def log_agent_end(state, runtime):
    print("Agent 执行完成")
```

或者是质量评估 & 监控，并上报监控平台；计费，外部系统同步，长期记忆持久化等；

### wrap_model_call

`wrap_model_call` 就是“包住 LLM”

``` python
@wrap_model_call
def my_model_middleware(request, handler):

    print("LLM 调用之前")

    response = handler(request)

    print("LLM 调用之后")

    return response
```

执行的过程

``` python
Agent 要调用 LLM
        ↓
Middleware：
“等一下，我先记录一下”
        ↓
handler(request)
        ↓
真正调用 LLM
        ↓
LLM 返回
        ↓
Middleware：
“我再看一下结果”
        ↓
return response
        ↓
Agent 继续
```

本质就是 `before_model` + `after_model`

``` python
            wrap_model_call
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
    调用之前              调用之后
        │                   │
        └──── handler ──────┘
                   ↓
                  LLM
```

但是通过 **wrap_model_call**，是在这个函数的作用域内的，实际上可以很方便一些操作；

```python
@wrap_model_call
def wrap(request, handler):
    print("之前")

    response = handler(request)

    print("之后")

    return response
```

比如可以决定要不要调用 `handler`

``` python
@wrap_model_call
def my_middleware(request, handler):

    if something_is_wrong:
        raise Exception("禁止调用 LLM")

    return handler(request)
```

如果不执行handler，那么：

> **LLM 根本不会被调用。**

这就是 `wrap_model_call` 比简单的 `before_model` 更强的地方之一。

**更重要：可以重试**

比如：

```python
@wrap_model_call
def retry_model(request, handler):

    for i in range(3):
        try:
            return handler(request)
        except Exception:
            print("失败，重试")

    raise Exception("失败三次")
```

现在流程变成：

```
Agent
 ↓
wrap_model_call
 ↓
handler()
 ↓
LLM ❌
 ↓
重试
 ↓
handler()
 ↓
LLM ❌
 ↓
重试
 ↓
handler()
 ↓
LLM ✅
 ↓
返回
```

这就是为什么叫 `wrap_model_call`。

它不是简单地：

> “在 LLM 前执行一段代码。”

而是：

> **“我接管这一次 LLM 调用的外围流程。”**



**换模型**

这个是非常经典的用法。

比如：

```
普通任务
    ↓
便宜模型

复杂任务
    ↓
强模型
```

你可以让 Middleware 决定：

```
wrap_model_call
      ↓
判断任务
      ↓
选择模型
      ↓
handler(request)
```

概念上：

```python
@wrap_model_call
def dynamic_model(request, handler):
    if is_complex(request):
        request.model = powerful_model
    else:
        request.model = cheap_model

    return handler(request)
```

所以：

```
wrap_model_call
```

特别适合：

**Retry**、**Fallback**、**动态模型选择**、**LLM 调用监控**、**统一异常处理**、**LLM 调用前后处理**。

### wrap_tool_call

**wrap_tool_call** 用来包住 **tools** 的执行；

```python
@wrap_tool_call
def my_tool_middleware(request, handler):

    print("Tool 调用之前")

    result = handler(request)

    print("Tool 调用之后")

    return result
```

翻译：

```
Agent：
我要调用 refund_order
        ↓
Middleware：
等一下
        ↓
handler(request)
        ↓
真正执行 refund_order()
        ↓
返回结果
        ↓
Middleware：
我看看结果
        ↓
Agent 继续
```

**Tool 特别需要 `wrap_tool_call`？**

ool 经常涉及**真实世界的操作**。

比如：增删改查，操作可能有风险。所以在执行这些操作之前先进行校验或者人工干预；



**最典型的 Tool 权限例子**

比如：

```python
@wrap_tool_call
def authorization(request, handler):

    tool_name = request.tool_call["name"]

    user = request.runtime.context.user

    if tool_name == "refund_order":

        if user.role != "admin":
            raise PermissionError(
                "没有退款权限"
            )

    return handler(request)
```

注意这里最关键的一行：

```python
return handler(request)
```

意思是：

> **检查通过了，现在继续执行原本的 Tool。**

如果没有权限：

```python
raise PermissionError(...)
```

那么：

```
Agent
 ↓
wrap_tool_call
 ↓
权限检查
 ↓
❌
```

Tool 根本不会执行。





**可以把 `handler` 想成“继续按钮”**

看到：

```python
handler(request)
```

你脑子里就想：

> **“继续执行原本的操作。”**



**不调用 handler 会怎样？**

比如：

```python
@wrap_tool_call
def my_tool(request, handler):

    print("我不让你执行")

    return "拒绝执行"
```

这里没有：

```
handler(request)
```

所以：

```
Agent
 ↓
Middleware
 ↓
❌ handler 没调用
 ↓
Tool 没执行
```

这就是 Middleware 的**拦截能力**。

所以：

```
                         Agent
                           │
                           │
                     决定下一步
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
               LLM                   Tool
                │                     │
                │                     │
        wrap_model_call       wrap_tool_call
                │                     │
        ┌───────┴───────┐     ┌───────┴───────┐
        ↓               ↓     ↓               ↓
      调用前          调用后  调用前          调用后
        │               │     │               │
        └──── handler ──┘     └──── handler ──┘
               ↓                     ↓
              LLM                   Tool
```

**最关键的一句话：**

> `handler` 就是“原本要执行的东西”；`wrap_xxx_call` 就是让 Middleware 在这个东西执行前后拥有控制权。



### 系统中间件

摘要

任务列表





## DynamicPrompt动态提示词

LangChain 的 `dynamic_prompt` middleware 本质上就是在模型调用前，根据当前请求动态生成 system message。

LangChain 的 **middleware** 机制提供了 `before_model`、`after_model`、`wrap_model_call` 等拦截点，而**动态 Prompt** 可以在模型调用前利用这些机制**修改/生成 system prompt**。

### 静态 Prompt vs 动态 Prompt

**静态 Prompt**最普通的 Agent：

```python
agent = create_agent(
    model,
    tools=tools,
    system_prompt="你是一个专业的客服助手。"
)
```

不管谁使用：

```
用户 A → 你是一个专业的客服助手
用户 B → 你是一个专业的客服助手
管理员 → 你是一个专业的客服助手
```

Prompt 都一样。

**动态 Prompt** 则是：

```python
用户
 ↓
Agent
 ↓
获取当前用户/运行上下文
 ↓
生成 System Prompt
 ↓
LLM
```

例如：

```
普通用户：
你是一个客服助手，只能查询订单。

VIP 用户：
你是一个高级客服助手，可以查询订单并提供优惠。

管理员：
你是后台管理员助手，可以查询订单、修改订单。
```

**Agent 本身还是同一个 Agent。**

只是每次调用 LLM 时，它拿到的 System Prompt 不一样。

### 为什么需要动态 Prompt？

实际项目中，Prompt 往往不是一个固定字符串。

比如你的 Agent 需要知道：

```
当前用户是谁？
用户是什么角色？
用户属于哪个公司？
用户有什么权限？
当前时间？
当前任务是什么？
用户有哪些偏好？
```

假设：

```python
context = {
    "user_id": "123",
    "role": "admin",
    "language": "zh",
}
```

你可能希望 Prompt 自动变成：

```
你是企业内部 AI 助手。

当前用户角色：admin
语言：中文

你可以帮助用户查询和修改企业数据。
```

如果换成普通员工：

```
你是企业内部 AI 助手。

当前用户角色：employee
语言：中文

你只能查询企业数据，不能修改数据。
```

这就是动态 Prompt。

### LangChain 中怎么实现

``` python
from langchain.agents.middleware import dynamic_prompt, ModelRequest


@dynamic_prompt
def my_prompt(request: ModelRequest[CustomContext]):
    runtime = cast(ToolRuntime[CustomContext], request.runtime)
    user = runtime.context.user

    if user.role == "admin":
        return """
        你是管理员助手。
        你可以执行管理操作。
        """

    return """
    你是普通用户助手。
    你只能执行普通查询。
    """


agent = create_agent(
    model=model,
    tools=tools,
    middleware=[my_prompt],
)
```

这样 Agent 每次运行时：

```
                 Agent
                   │
                   ↓
          dynamic_prompt
                   │
          ┌────────┴────────┐
          ↓                 ↓
       admin             normal user
          ↓                 ↓
   管理员 System       普通用户 System
          │                 │
          └────────┬────────┘
                   ↓
                  LLM
```

LangChain 的 `dynamic_prompt` middleware 本质上就是在模型调用前，根据当前请求动态生成 system message

### 常见的用途

#### **用户权限**

例如你有：

```
Admin
Manager
Employee
Guest
```

可以设计：

```python
def get_prompt(role):
    if role == "admin":
        return ADMIN_PROMPT

    if role == "manager":
        return MANAGER_PROMPT

    if role == "employee":
        return EMPLOYEE_PROMPT

    return GUEST_PROMPT
```

于是：

```
                User
                  │
                  ↓
            role = admin
                  │
                  ↓
         Dynamic Prompt
                  │
                  ↓
       Admin System Prompt
                  │
                  ↓
                 LLM
```

这比创建四个 Agent 更方便：

```
❌ AdminAgent
❌ ManagerAgent
❌ EmployeeAgent
❌ GuestAgent
```

而是：

```
✅ 一个 Agent
   +
   Dynamic Prompt
```

#### 语言

比如你的产品支持：

```
中文
英文
日文
```

你可以：

```python
@dynamic_prompt
def prompt(request):
    language = request.runtime.context.language

    return f"""
    你是一个专业 AI 助手。

    请始终使用 {language} 回复用户。
    """
```

于是：

```
language = zh
→ 中文 Prompt

language = en
→ English Prompt

language = ja
→ Japanese Prompt
```

Agent 逻辑完全不用变化。

#### 客户/租户

这个在企业 AI 中特别常见。

比如 SaaS：

```
Tenant A
Tenant B
Tenant C
```

每家公司可能有自己的：

```
公司名称
业务规则
术语
品牌语气
数据权限
```

动态 Prompt：

```
                 Agent
                   ↓
             tenant_id
                   ↓
          Dynamic Prompt
           ↙      ↓      ↘
       Tenant A Tenant B Tenant C
           ↓      ↓      ↓
        Prompt A Prompt B Prompt C
                   ↓
                  LLM
```

例如：

```
Tenant A：
订单叫 Order

Tenant B：
订单叫 Purchase Order

Tenant C：
订单叫 Sales Order
```

不用维护三个 Agent。

### Dynamic Prompt 和直接传变量有什么区别

这是一个很容易混淆的地方。

比如你可以直接：

```python
prompt = f"""
你是客服。
当前用户：{user_name}
"""
```

这也叫动态构造 Prompt。

但 LangChain Agent 的 **Dynamic Prompt Middleware** 更强调：

```
Agent Runtime
      ↓
Middleware
      ↓
根据 Runtime Context
      ↓
生成 System Prompt
      ↓
Model
```

也就是说，它是**Agent 生命周期的一部分**，而不是你在 Agent 外面手动拼字符串。

### 非常重要的安全问题

不要把 Dynamic Prompt 当成真正的权限系统。

例如：

```
管理员：
Prompt：可以删除订单

普通用户：
Prompt：不能删除订单
```

这只能算是**告诉 LLM 应该怎么做**。

不能真正阻止：

```
普通用户 → Agent → delete_order()
```

如果 Tool 没有权限检查，LLM 还是可能调用。

所以生产系统应该：

```
Dynamic Prompt
       ↓
告诉 LLM：
“你不能做 X”
       
       +
       
Tool Middleware / Tool 权限系统
       ↓
真正检查：
“你有没有权限做 X？”
```

也就是：

> **Prompt 是行为指导；Middleware / Tool 层才应该承担真正的安全控制。**

这个区别在做生产级 Agent 时非常重要。

### 注意点

> **如果变化的是“这个 Agent 面对谁、在什么环境下工作”，用 Dynamic Prompt。**
>
> **如果变化的是“这个 Agent 到底负责什么工作”，考虑拆 Agent。**

# LangGraph

构建可控、可观察的智能体工作流

状态管理

流程编排

条件路由

检查点

人工参与

多智能体

# MCP

# DeepAgent

基于 **LangGraph** 开发的**自主智能体框架**，面向长期任务的自主执行能力；

企业级深度能力平台，构建可落地的智能体应用；

- 技能（Skills）：可复用技能库，快速扩展 Agent 能力；
- 知识/记忆管理：长期记忆、知识库与上下文管理；
- 代码执行/沙箱环境：安全执行代码，脚背、数据分析等任务；
- 多 Agent 编排：可视化编排多 Agent，复杂业务流程落地；
- 企业集成： 

# LangSmith

收费

目前无法私有部署

# 多智能体

```json

```



# Agent 到底是什么

**Agent 是一个能够利用 LLM 进行思考和决策，并通过工具等手段采取行动、循环执行，从而完成目标的系统。**

## 先看普通 LLM

你问：

> 中国的首都是哪里？

LLM：

```
用户
 ↓
LLM
 ↓
“中国的首都是北京。”
```

这个过程很简单：

> **输入 → LLM → 输出**

LLM 主要负责**理解和生成语言**。

最简单的 LLM 调用：

``` python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4.1-mini")

response = model.invoke(
    "广州今天的天气怎么样？"
)

print(response.content)

# 当然当前无法知道

"""
抱歉，作为人工智能，我无法实时联网获取最新的天气数据，因此无法告诉您广州今天准确的天气情况。

建议您直接打开手机上的**天气APP**，或者在搜索引擎中输入“**广州天气**”来获取最新、最准确的实时天气、气温以及穿衣指数。

如果您需要了解广州近期的气候特点、四季穿衣指南，或者需要广州的旅游攻略、美食推荐，我非常乐意为您提供帮助！
"""
```



## Agent 和它有什么不同？

假设你告诉 Agent：

> “帮我查一下北京今天的天气，如果下雨就提醒我带伞。”

这个任务就不只是“回答一个问题”了。

Agent 需要：

```
① 理解用户的目标
       ↓
② 判断需要做什么
       ↓
③ 获取天气
       ↓
④ 判断是否下雨
       ↓
⑤ 根据结果采取行动
       ↓
⑥ 给用户最终结果
```

也就是说，Agent 不只是：

> **回答问题**

而是：

> **为了完成一个目标，能够进行决策，并采取行动。**



## Agent 的核心：Reason + Act

可以先记住两个词：

```
Reason
思考 / 决策

Act
行动
```

例如：

> “帮我查一下订单 123，如果已经发货就告诉我物流信息。”

Agent 可能：

```
用户任务
   ↓
理解任务
   ↓
决定：需要查询订单
   ↓
调用订单查询工具
   ↓
得到订单结果
   ↓
决定：已经发货
   ↓
调用物流查询工具
   ↓
得到物流信息
   ↓
最终回答
```

所以 Agent 的一个核心特点是：

> **它可以根据当前情况决定下一步行动。**



## Agent 不等于 LLM

这个非常重要。

很多人在初学阶段会认为：

```
Agent = 更强的 LLM
```

不是。

更准确地说：

```
              Agent
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
      LLM      Tools    执行机制
       │        │
       │        │
       └────┬───┘
            ↓
          完成任务
```

LLM 可以负责：

> 理解、推理、决策、生成文本。

Tools 可以负责：

> 真正执行外部操作。

例如：

```
查询数据库
调用 API
搜索网页
发送邮件
创建文件
查询订单
计算价格
```

Agent 则负责把这些东西**组织起来完成任务**。

## 为什么需要 Agent？

因为很多任务不是：

```
问题 → 答案
```

而是：

```
目标
 ↓
判断下一步
 ↓
执行
 ↓
得到结果
 ↓
根据结果判断下一步
 ↓
执行
 ↓
……
 ↓
完成目标
```

例如：

> “帮我比较 iPhone 17 和 Pixel 10 的价格，并告诉我哪个更便宜。”

可能需要：

```
搜索 iPhone 价格
       ↓
搜索 Pixel 价格
       ↓
比较价格
       ↓
生成结论
```

这就是一个**多步骤任务**。



## Agent 最核心的模型

你现在先记住这个图：

```
                用户目标
                   ↓
                 Agent
                   ↓
                  LLM
                   ↓
             决定下一步
                   ↓
              ┌────┴────┐
              ↓         ↓
           不需要      需要行动
              ↓         ↓
           直接回答    调用 Tool
                        ↓
                    得到结果
                        ↓
                       LLM
                        ↓
                  再决定下一步
                        ↓
                      ...
                        ↓
                    最终结果
```

所以一句话总结：

> **Agent 是一个能够利用 LLM 进行决策，并通过工具等手段采取行动、循环执行，从而完成目标的系统。**



## 一个非常重要的区分

学习 LangChain 时，会经常遇到：

### LLM

```
输入 → 输出
```

### Workflow

```
步骤 A → 步骤 B → 步骤 C
```

步骤通常是**预先确定的**。

### Agent

```
目标
 ↓
LLM 决定下一步
 ↓
执行
 ↓
根据结果再次决定
 ↓
...
```

**下一步是什么，可以根据当前情况动态决定。**

这就是 Agent 和固定 Workflow 一个非常重要的区别。



## 小结

- **Agent ≠ LLM**：LLM 是 Agent 的核心组件之一。

- **Agent 的核心是“决策 + 行动”**：不只是生成文本。

- **Agent 可以循环执行**：

  ``` 
  LLM
   ↓
  Tool
   ↓
  LLM
   ↓
  Tool
   ↓
  LLM
   ↓
  完成任务
  ```

# Message 消息

Message 理解成：

> **Agent 执行过程中，各个参与者之间传递的信息记录。**

## 最常见的 4 种 Message



### HumanMessage

用户发给 Agent 的消息：

``` python
from langchain_core.messages import HumanMessage

message = HumanMessage(
    content="北京今天的天气怎么样？"
)
```

可以理解为：

```
HumanMessage
    ↓
用户说：
“北京今天的天气怎么样？”
```



### AIMessage

LLM 产生的消息。

比如 LLM 最终回答：

```python
AIMessage(
    content="北京今天晴天，25°C。"
)
```

但这里有一个非常重要的地方：



**AIMessage 不一定是最终回答。**

它还可以表示：

> “LLM 决定调用某个 Tool。”

例如概念上：

```python
AIMessage(
    content="",
    tool_calls=[
        {
            "name": "get_weather",
            "args": {
                "city": "北京"
            }
        }
    ]
)
```

意思不是：

> LLM 已经调用了 Tool。

而是：

> **LLM 发出了一个 Tool Call 请求。**

这个区别非常重要。



### ToolMessage

Tool 执行之后产生的结果：

```python
ToolMessage(
    content="北京今天晴天，25°C。",
    tool_call_id="..."
)
```

它表示：

> **这个 Tool 调用执行完了，结果是这个。**



### SystemMessage

System Message 是给 LLM 的系统级指令。

例如：

```python
SystemMessage(
    content="你是一个专业的天气助手。"
)
```

它告诉 LLM：

> 你是谁，以及你应该遵守什么规则。

## 刚才的 Agent 例子串起来

用户说：

> 北京今天的天气怎么样？

首先：

```
HumanMessage
“北京今天的天气怎么样？”
```

然后 LLM 判断：

> 我需要调用天气 Tool。

于是产生：

```python
AIMessage
tool_calls:
    get_weather("北京")
```

然后 Agent 执行 Tool。

Tool 返回：

```python
ToolMessage
“北京今天晴天，25°C”
```

然后 LLM 再根据 Tool 的结果生成：

```python
AIMessage
“北京今天晴天，25°C。”
```

所以整个过程可以画成：

```python
HumanMessage
      ↓
      ↓
   AIMessage
   Tool Call
      ↓
      ↓
  ToolMessage
   Tool Result
      ↓
      ↓
   AIMessage
   最终回答
```



## 最核心的一句话：

> **Message 是 Agent 执行过程中传递的结构化信息单元。**

```
Agent 执行过程
      │
      ↓
   Messages
      │
      ├── HumanMessage
      │     └── 用户输入
      │
      ├── AIMessage
      │     └── LLM 输出 / Tool Call
      │
      ├── ToolMessage
      │     └── Tool 执行结果
      │
      └── AIMessage
            └── 最终回答
```

# System Prompt

## System Prompt 是干什么的？

假设你直接告诉 LLM：

> 帮我查询订单 123。

模型当然可以回答。

但是如果你希望它：

> 你是一个电商客服，只能回答订单相关的问题。如果用户问天气，就告诉他你不能回答。

这时候你就需要给 LLM 一些**系统级的行为规则**。

例如：

```python
system_prompt = """
你是一个电商客服助手。

你的职责是：
1. 帮助用户查询订单
2. 帮助用户查询物流
3. 不能回答与订单无关的问题
"""
```

这个东西就是：

> **System Prompt**

它的作用简单来说就是：

> **告诉 LLM：你是谁、你的任务是什么、你应该遵守什么规则。**



## 在 LangChain Agent 中怎么写？

LangChain 1.0+ 可以这样：

```python
from langchain.agents import create_agent

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[],
    system_prompt="""
    你是一个电商客服助手。
    只能帮助用户处理订单和物流相关问题。
    """
)
```

这里：

```python
system_prompt="..."
```

就是给 Agent 配置系统提示词。



## 和 Message 是什么关系？

System Prompt 是系统指令的内容，而 SystemMessage 是承载这个系统指令的消息结构。

System Prompt 是属于 Message但是：

> **System Prompt 的概念 ≠ SystemMessage 这个数据结构。**

一个是**提示词/指令的概念**，一个是**消息对象**。



## 和 HumanMessage 对比一下

例如用户说：

> 我要查询订单 123。

那么：

```python
SystemMessage
    "你是一个电商客服，只处理订单问题"

HumanMessage
    "我要查询订单123"
```

它们的职责完全不同。

### SystemMessage

告诉模型：

> **你应该怎么做。**

### HumanMessage

告诉模型：

> **用户现在要什么。**

可以记成：

```python
SystemMessage
    ↓
规则 / 身份 / 行为约束

HumanMessage
    ↓
当前用户请求
```



## 流程

加入 System Prompt：

```
SystemMessage
"你是电商客服"
       ↓
HumanMessage
"查询订单123"
       ↓
LLM
       ↓
AIMessage
"我要调用 get_order"
       ↓
Tool
       ↓
ToolMessage
"订单123已发货"
       ↓
LLM
       ↓
AIMessage
"你的订单123已经发货"
```

注意：

> **SystemMessage 通常不是用户和 AI 对话过程中不断产生的新消息，而是给模型提供系统级指导。**

## 一个非常重要的误区

不要认为：

> System Prompt = “让 LLM 变聪明的提示词”。

它更准确的作用是：

> **给模型提供角色、目标、规则、约束以及行为指导。**

比如：

```
你是客服
只能查询订单
不要泄露用户隐私
回答要简洁
遇到无法处理的问题转人工
```

这些都可以属于 System Prompt。

知识树变成：

```
Agent
│
├── LLM
├── Tools
├── 执行循环
│
└── Messages
      │
      ├── SystemMessage
      │     └── System Prompt
      │
      ├── HumanMessage
      │     └── 用户输入
      │
      ├── AIMessage
      │     └── LLM 输出 / Tool Call
      │
      └── ToolMessage
            └── Tool 执行结果
```

这时候你已经可以理解一个简单 Agent：

```
System Prompt
      ↓
“你是电商客服”
      ↓
用户
      ↓
“查询订单123”
      ↓
LLM
      ↓
决定调用 Tool
      ↓
Tool
      ↓
结果
      ↓
LLM
      ↓
最终回答
```

System Prompt 是给 LLM 的系统级指令；在 LangChain 的 Message 模型中，它通常由 `SystemMessage` 承载。

# Tool Calling / Function Calling

**首先，AIMessage 不一定是最终回答，也可能包含 Tool Call。**

**Tool Calling 是 LLM 结构化地告诉 Agent“要使用哪个 Tool，以及参数是什么”的机制；它本身不是 Tool，也不是 Tool 的执行。它是一种接口协议 schema**

## Tool Calling 是什么？

假设我们有一个 Tool：

```python
from langchain.tools import tool


@tool
def get_order(order_id: str) -> str:
    """查询订单信息"""
    return f"订单 {order_id} 已发货"
```

用户：

```python
帮我查询订单 123
```

LLM 判断：

> 这个问题需要查询订单，我应该调用 `get_order`。

但注意：

**LLM 不能直接执行 Python 函数。**

LLM 做的是：

> **产生一个结构化的 Tool Call。**

概念上类似：

```python
AIMessage(
    content="",
    tool_calls=[
        {
            "name": "get_order",
            "args": {
                "order_id": "123"
            }
        }
    ]
)
```

你可以把它理解成 LLM 发了一张“操作申请单”：

```python
我要调用：
get_order

参数：
order_id = 123
```



## 为什么需要 Tool Calling？

假设没有 Tool Calling。

LLM 可能只回复：

```python
“我想调用 get_order，订单号是 123。”
```

这只是**普通文本**。

程序很难可靠地知道：

```python
到底调用哪个函数？
参数是什么？
参数类型是什么？
```

而 Tool Calling 给出了结构化信息：

```python
name:
get_order

args:
{
    "order_id": "123"
}
```

于是 Agent 就可以根据这个结构真正执行：

```python
get_order(order_id="123")
```



## 一个非常重要的边界

这里你一定要区分：

### LLM

负责：

```
“我要调用 get_order”
```

### Agent / Tool 执行机制

负责：

```
“好，那我真的执行 get_order()”
```

### Tool

负责：

```
真正执行 Python/API/数据库操作
```

所以：

```
LLM
 ↓
决定调用哪个 Tool
 ↓
AIMessage.tool_calls
 ↓
Agent 执行 Tool
 ↓
ToolMessage
 ↓
LLM
```



## Tool Calling ≠ Tool

这个非常容易混。

### Tool

是实际可以执行的东西：

```
@tool
def get_order(order_id):
    ...
```

### Tool Calling

是：

> **LLM 表达“我要调用这个 Tool”的机制。**

所以：

```
Tool
= 工具本身

Tool Calling
= LLM 请求使用工具的方式
```

## Function Calling

可能会看到两个词：

```
Function Calling
Tool Calling
```

它们关系很近。

早期很多 LLM API 使用：

> Function Calling

这个名字强调：

```
模型
 ↓
调用一个函数
```

现在 Agent 框架和模型 API 越来越倾向使用：

> Tool Calling

因为“工具”比“函数”更广泛。

例如 Tool 不一定只是 Python 函数，也可能代表：

```
搜索
数据库
API
浏览器
文件操作
MCP Tool
```

所以在现代 Agent 开发里，你经常会看到：

```
Tool Calling
```

我们现在学习 LangChain 1.0+，**优先记 Tool Calling 就可以。**

## 和前面所有知识串起来

我们现在已经有三个知识点：

```
Agent
Message
System Prompt
```

再加入 Tool Calling：

```
                    Agent
                      │
                 SystemMessage
                 "你是客服"
                      ↓
                 HumanMessage
                 "查询订单123"
                      ↓
                     LLM
                      ↓
                  AIMessage
                 tool_calls
                      ↓
                    Tool
                 get_order()
                      ↓
                 ToolMessage
                "订单已发货"
                      ↓
                     LLM
                      ↓
                  AIMessage
                 "订单已发货"
```

**State 的 `messages`，就是在记录这里发生过的这些 Message。**

## 一个非常容易踩的坑

不要认为：

```
AIMessage
 ↓
Tool Call
 ↓
Tool 一定会执行
```

中间其实还有 Agent 的执行机制。

也就是说：

```
AIMessage
└── tool_calls
```

只是：

> **LLM 提出了一个工具调用请求。**

Agent 是否执行、怎么执行、执行结果是什么，是另外一回事。

这也是为什么：

> **LLM ≠ Agent。**

## 总结

### Tool

```
真正执行工作的工具
```

例如：

```
get_order("123")
```

### Tool Calling

```
LLM 告诉 Agent：
我要调用 get_order
参数是 123
```

通常体现在：

```
AIMessage(
    tool_calls=[
        {
            "name": "get_order",
            "args": {
                "order_id": "123"
            }
        }
    ]
)
```

### 整个过程

```
HumanMessage
      ↓
LLM
      ↓
AIMessage(tool_calls)
      ↓
Agent 执行 Tool
      ↓
ToolMessage
      ↓
LLM
      ↓
AIMessage
```

### 最重要的一句话

> **Tool Calling 是 LLM 结构化地告诉 Agent“我要使用哪个 Tool，以及参数是什么”的机制；它本身不是 Tool，也不是 Tool 的执行。**

# Tools 工具

**Tool 是 Agent 可以调用的外部能力。**

## Tool 本质是什么？

最简单理解：

> **Tool 是 Agent 可以调用的一个“能力”。**

例如：

```
查询订单
查询天气
搜索商品
查询数据库
发送邮件
创建文件
调用 API
```

这些都可以变成 Tool。



## 最简单的 Tool

LangChain 可以这样定义：

```python
from langchain.tools import tool


@tool
def get_order(order_id: str) -> str:
    """查询订单信息"""
    return f"订单 {order_id} 已发货"
```

看起来它就是一个普通 Python 函数。

但是：

```python
@tool
```

之后，它就不仅仅是普通 Python 函数了。

它变成了一个：

> **LangChain Tool**

## Tool 里面最重要的几个东西

看这个：

```python
@tool
def get_order(order_id: str) -> str:
    """查询订单信息"""
    return f"订单 {order_id} 已发货"
```

拆开看。

### Tool Name

```
get_order
```

这是 Tool 的名字。

LLM 进行 Tool Calling 时需要知道：

> 我要调用哪个 Tool？

所以会出现：

```python
tool_calls:
    name = "get_order"
```

### Tool Description

```python
"""查询订单信息"""
```

这个非常重要。

它是在告诉 LLM：

> **这个 Tool 是干什么的？**

例如：

```python
@tool
def get_weather(city: str) -> str:
    """查询指定城市当前天气"""
```

LLM 看到这个描述，就更容易判断：

> 用户问天气的时候应该调用这个 Tool。

所以：

> **Tool Description 是帮助 LLM 选择 Tool 的重要信息。**



### Tool Input

例如：

```python
def get_order(order_id: str)
```

这里：

```python
order_id
```

就是 Tool 的输入参数。

LLM 可能产生：

```
AIMessage
└── tool_calls
      ├── name: get_order
      └── args:
            order_id: "123"
```

然后 Agent 执行：

```python
get_order(order_id="123")
```



### Tool Output

函数：

```python
return f"订单 {order_id} 已发货"
```

返回：

```python
订单 123 已发货
```

然后这个结果会被包装成：

```python
ToolMessage
```

再交给 LLM。

所以：

```python
Tool
 │
 ├── Input
 │      ↓
 │   执行
 │      ↓
 └── Output
        ↓
   ToolMessage
```





## 过程

例如用户：

```python
帮我查询订单 123
```

------

### 第一步：HumanMessage

```python
HumanMessage
"帮我查询订单123"
```

------

### 第二步：LLM

LLM 根据：

```python
System Prompt
+
HumanMessage
+
Tool 信息
```

判断：

> 我要查询订单。

------

### 第三步：AIMessage

产生：

```python
AIMessage
└── tool_calls
      └── name: get_order
          args:
              order_id: "123"
```

------

### 第四步：Agent 执行 Tool

```python
get_order(order_id="123")
```

------

### 第五步：Tool 返回

```python
订单 123 已发货
```

↓

包装成：

```python
ToolMessage
```

------

### 第六步：LLM 再次处理

LLM 看到：

```python
ToolMessage
"订单123已发货"
```

然后产生：

```python
AIMessage
"你的订单123已经发货了。"
```





## 一个非常重要的问题：Tool 是谁调用的

我们之前说：

> LLM 决定调用 Tool。

这句话容易让新手误解。

实际上可以拆成两步：

```
① LLM
   ↓
   产生 Tool Call 请求

② Agent
   ↓
   执行真正的 Tool
```

所以：

```
LLM
= 决策者

Agent
= 执行协调者

Tool
= 实际干活的人
```

例如：

```
LLM：
“我要查询订单123”

Agent：
“好的，我来执行 get_order。”

Tool：
“订单123已发货。”
```

这个模型非常重要。



## Tool 不一定是查询

Tool 可以执行真正的动作。

比如：

```python
@tool
def send_email(to: str, content: str) -> str:
    """发送邮件"""
    ...
```

那么 Agent 可以：

```
用户
 ↓
“帮我给张三发一封邮件”
 ↓
LLM
 ↓
Tool Calling
 ↓
send_email(...)
 ↓
Tool
 ↓
真正发送邮件
```

所以 Agent 不只是：

> **查询信息**

还可以：

> **采取行动。**



## Tool 和普通函数有什么区别？

这是非常重要的。

普通函数：

```python
def get_order(order_id):
    ...
```

程序员自己写：

```python
get_order("123")
```

谁调用它是程序员决定的。

------

Tool：

```python
@tool
def get_order(order_id: str):
    ...
```

它会被暴露给 Agent/LLM。

于是：

```
LLM
 ↓
决定调用 get_order
 ↓
Agent
 ↓
执行 get_order
```

所以 Tool 的关键不是：

> “它是一个特殊的 Python 函数。”

而是：

> **它被纳入了 Agent 的工具体系，并且可以被模型通过 Tool Calling 选择。**

## 现在再看 create_agent

你之前见过：

```python
agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_order],
    system_prompt="你是电商客服"
)
```

现在你应该能理解：

```
model
  ↓
LLM

tools=[get_order]
  ↓
告诉 Agent：
有哪些能力可以使用

system_prompt
  ↓
告诉 LLM：
你是谁、应该怎么做
```

整个关系：

```
                    Agent
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
      LLM            Tools       System Prompt
       │              │
       │              │
       └───────┬──────┘
               ↓
          Tool Calling
               ↓
          Agent 执行 Tool
```



### 非常重要的工程经验

### Tool 不应该把“思考”写进去

例如不推荐：

```python
@tool
def process_order(order_id):
    """
    查询订单，然后判断用户是否应该退款，
    然后判断是否需要人工审批，
    然后决定是否退款
    """
```

这种 Tool 责任太重。

更好的设计是：

```
Tool
 ↓
提供能力
```

例如：

```
query_order()
calculate_refund()
create_refund()
```

然后：

```
Agent / LLM
 ↓
决定什么时候调用
 ↓
决定调用哪个
 ↓
决定下一步
```

也就是：

> **Tool 提供能力，Agent 负责决策。**

这是以后设计复杂 Agent 非常重要的原则。



## 总结

确定一个知识点：

> **Tool 是 Agent 可以调用的外部能力。**

完整关系：

```
用户
 ↓
LLM
 ↓
AIMessage
 ↓
Tool Call
 ↓
Agent 执行 Tool
 ↓
Tool Output
 ↓
ToolMessage
 ↓
LLM
 ↓
最终 AIMessage
```

并且：

```
Tool Call ≠ Tool Output ≠ ToolMessage
```

最后记住一个工程原则：

> **Tool 负责“做事情”，Agent/LLM 负责“决定做什么”。**

# Tool Description

假设 Agent 有两个 Tool：

```python
@tool
def search_product(keyword: str):
    """搜索商品"""
    ...


@tool
def get_product_price(product_id: str):
    """查询指定商品的价格"""
    ...
```

LLM 并不是看到 Python 代码本身。

它拿到的更接近：

```python
Tool 1
name: search_product
description: 搜索商品
input:
  keyword: string

Tool 2
name: get_product_price
description: 查询指定商品的价格
input:
  product_id: string
```

然后用户：

```
帮我查一下 iPhone 17 的价格
```

LLM 会根据：

```python
用户意图
+
Tool Name
+
Tool Description
+
Tool Input Schema
```

来决定应该调用什么。

## 为什么 Description 很重要？

看：

```
search_product
“搜索商品”
```

和：

```
get_product_price
“查询指定商品的价格”
```

用户说：

> “查一下 iPhone 17 的价格。”

语义上：

```
用户意图
    ↓
查询价格
    ↓
get_product_price
```

所以 LLM 会倾向于：

```
get_product_price
```

但是有一个问题

`get_product_price` 需要：

```
product_id
```

可是用户只告诉了：

```
iPhone 17
```

没有告诉：

```
product_id
```

这时候 LLM 不能凭空知道 product_id。

所以它可能会发现：

```
search_product
需要：
keyword
```

而自己有：

```
iPhone 17
```

于是：

```
search_product("iPhone 17")
```

先查商品。

得到：

```
product_id = "ABC123"
```

然后：

```
get_product_price("ABC123")
```



所以可以回答一个问题：**LLM 是怎么知道调用哪个tool 的？**

> **LLM 会根据用户请求，以及 Tool 的 name、description 和 input schema，判断哪个 Tool 更适合当前任务，并生成符合 schema 的 Tool Call。**

其中：

```
Description
→ 这个 Tool 是干什么的？

Input Schema
→ 这个 Tool 需要什么参数？

Name
→ 我要调用哪个 Tool？
```



## 工程经验

### lool Description 不要随便写。

例如：

```python
@tool
def search_product(keyword: str):
    """搜索"""
```

太模糊了。

LLM 很难知道：

```
什么时候应该用？
搜索什么？
返回什么？
和其他 Tool 有什么区别？
```

更好的：

```python
@tool
def search_product(keyword: str):
    """
    搜索商品。
    
    当用户只提供商品名称、型号或关键词，
    但还没有商品 ID 时使用此工具。
    返回商品 ID、名称和基本信息。
    """
```

这时候 LLM 更容易判断：

```
没有 product_id
+
用户给了商品名称
↓
search_product
```



## 边界

**Description 不是程序化的 if/else。**

不是：

```python
if "价格" in user_input:
    get_product_price()
```

LLM 不是按照你写死的规则执行。

而是：

```
用户意图
   +
Tool 定义
   +
当前上下文
   ↓
LLM 判断
   ↓
Tool Call
```

所以 Tool Description 本质上是在**给 LLM 提供决策信息**。

三个问题：

| Tool 信息      | 告诉 LLM 什么？        |
| -------------- | ---------------------- |
| `name`         | 我叫什么               |
| `description`  | 我能干什么、什么时候用 |
| `input schema` | 我需要什么参数         |

最终：

```
用户问题
    ↓
LLM
    ↓
理解用户意图
    ↓
参考 Tool Definition
    ↓
选择 Tool
    ↓
按照 Input Schema 生成参数
    ↓
AIMessage.tool_calls
```

### 一个工程上的核心原则

> **Tool Description 本质上是给 LLM 的“使用说明书”。**

写得好，LLM 更容易正确选 Tool；写得差，Agent 就可能**选错 Tool、传错参数，甚至反复调用 Tool**。



# Tool Input Schema

需要什么参数，以及这些参数是什么类型。

LLM 调用 Tool 的时候，到底怎么知道应该传什么参数？

``` python
from langchain_core.tools import tool

@tool
def search_product(keyword: str):
    """根据商品关键词搜索商品。"""
    ...
```

工具：

```
Tool
├── name
├── description
└── input schema
```

那么这个 Tool 的 Input Schema 大概就是：

```
{
  "keyword": "string"
}
```

也就是说：

> 这个 Tool 需要一个叫 `keyword` 的字符串参数。

## 为什么需要 Schema？

假设没有 Schema。

我们只告诉 LLM：

```
有一个工具叫 search_product
```

那 LLM 怎么知道：

```python
search_product("iPhone")
```

还是：

```python
search_product({
    "keyword": "iPhone",
    "max_price": 1000
})
```

还是：

```python
search_product({
    "query": "iPhone"
})
```

？

它不知道。

所以 Tool 必须告诉 LLM：

> **“我需要什么参数，以及这些参数是什么类型。”**

这就是：Input Schema

## 特别重要的概念

答案是：

**主要是给 LLM 和程序运行时提供结构约束。**

但它们的作用不完全一样。

```
Schema
   │
   ├──→ LLM
   │     理解需要什么参数
   │     生成 Tool Call
   │
   └──→ Runtime
         校验 / 解析参数
         执行 Tool
```

所以不要简单理解成：

> “Schema 是为了让 Python 函数知道参数。”

它更重要的价值之一，就是让 **LLM 和 Tool 之间有一个明确的接口契约**。

## 工程类比

可以把 Tool Schema 理解成 **API 接口定义**。

比如一个 HTTP API：

```
POST /products/search

{
    "keyword": string,
    "max_price": number,
    "category": string
}
```

调用者必须知道：

```
需要什么
参数叫什么
参数是什么类型
```

Agent Tool 也是类似的：

```
LLM
 ↓
Tool Schema
 ↓
生成结构化 Tool Call
 ↓
Tool
```

所以你以后看到：

> **Tool Schema**

脑子里可以直接联想到：

> **“这是 LLM 调用 Tool 的接口契约。”**

这个理解非常有用。

# Tool 设计

让 LLM 能理解的设计；

Tool Name 设计

Input Schema 设计

Tool 参数不要过度复杂

Tool 返回值设计







# Agent Loop

Agent Loop 就是 Agent 不断“观察当前信息 → 让 LLM 决定下一步 → 执行动作 → 获得结果 → 再决定下一步”的循环。

``` python
用户
 ↓
LLM
 ↓
需要 Tool？
 ├── 否 → 最终回答 → END
 │
 └── 是
      ↓
    Tool
      ↓
   Tool Result
      ↓
     LLM
      ↓
   需要 Tool？
    ...
```

## 1. 第一次进入 Agent

用户：

> 帮我查一下 iPhone 17 的价格。

State / 消息里目前可能有：

```
HumanMessage
└── "帮我查一下 iPhone 17 的价格"
```

Agent 把当前信息交给 LLM。

## 2. LLM 做一次决策

LLM 发现：

> 我需要商品信息。

于是返回：

```
AIMessage
└── tool_calls
      └── search_product
            keyword="iPhone 17"
```

注意：

**这里 Agent 还没有执行 Tool。**

这是：

```
LLM → 决策
```



## 3. Agent Runtime 执行 Tool

Agent 看到：

```python
tool_call:
search_product
keyword="iPhone 17"
```

于是找到对应的 Tool：

```python
search_product("iPhone 17")
```

Tool 返回：

```python
{
    "product_id": "ABC123",
    "name": "iPhone 17"
}
```

这叫：

> **Tool Output**

## 4. Agent 把结果放回消息流

然后产生：

```
ToolMessage
└── product_id = ABC123
```

于是消息链现在变成：

```python
HumanMessage
    ↓
AIMessage
└── tool_call: search_product
    ↓
ToolMessage
└── product_id = ABC123
```

## 5. 再次调用 LLM

这时候非常关键：

**Agent 并不是看到 ToolMessage 后自己决定下一步。**

而是：

```
ToolMessage
     ↓
LLM
```

LLM 看到：

```
用户：
查 iPhone 17 的价格

我刚才：
调用 search_product

工具告诉我：
product_id = ABC123
```

于是 LLM 再做一次决策：

```
AIMessage
└── tool_call
      └── get_product_price
            product_id="ABC123"
```



## 6. 再执行 Tool

Agent Runtime：

```
get_product_price("ABC123")
```

得到：

```
$999
```

然后：

```
ToolMessage
└── "$999"
```

再次给 LLM。

## 7. 这次 LLM 不再调用 Tool

LLM 看到：

```
用户：
查 iPhone 17 的价格

Tool：
iPhone 17
product_id = ABC123

Tool：
价格 = $999
```

于是判断：

> 信息已经足够了。

它返回：

```
AIMessage
└── "iPhone 17 当前价格是 $999。"
```

这一次：

```
tool_calls = []
```

Agent 就知道：

> **LLM 没有要求继续调用 Tool。**

于是 Loop 结束。



## 所以真正的 Agent Loop 是这个

```
                         ┌──────────────┐
                         │     LLM      │
                         └──────┬───────┘
                                │
                         AIMessage
                                │
                         有 Tool Call？
                         ↙            ↘
                       是              否
                       ↓                ↓
                  Agent Runtime       END
                       ↓
                     Tool
                       ↓
                  Tool Output
                       ↓
                  ToolMessage
                       ↓
                 ┌──────────────┐
                 │     LLM      │
                 └──────┬───────┘
                        │
                       ...
                        ↺
```

这就是：Agent Loop

## 最重要的：谁在 Loop？

不要认为：

```
LLM 自己循环
```

也不要认为：

```
Tool 自己循环
```

而是：

```
Agent Runtime
     │
     ├── 调 LLM
     │
     ├── 看 LLM 有没有 Tool Call
     │
     ├── 有 → 执行 Tool
     │
     ├── 把 Tool Result 加回消息
     │
     └── 再调 LLM
```

所以可以粗略理解为：

> **Agent Runtime 负责驱动 Loop，LLM 负责在每一轮做决策。**



# State 状态(短期记忆)

State 是 Agent执行过程中维护的**动态结构化状态**，其中`messages` 是其中最常见、最重要的字段，并且可以通过自定义 state 解决需要额外的参数。

**最简单的 Agent**

假设用户说：

> 北京天气怎么样？

Agent：

```
用户
 ↓
LLM
 ↓
调用 get_weather
 ↓
Tool
 ↓
ToolMessage
 ↓
LLM
 ↓
最终回答
```

我们之前已经知道这些 Message：

```
HumanMessage
"北京天气怎么样？"

AIMessage
tool_call:
    get_weather("北京")

ToolMessage
"北京今天 25°C，晴天"

AIMessage
"北京今天 25°C，晴天。"
```

那么问题来了：

> **这些东西到底放在哪里？**

答案就是：**State**



可以先非常粗略地理解：

```python
state = {
    "messages": [...]
}
```

State 就是 Agent 在执行过程中维护的**当前状态**。



## State 不等于 messages

最重要的一点。

很多初学者会认为：State = messages 其实不是。

更准确：

```
State
├── messages
├── user_id
├── order_id
├── retry_count
├── current_step
└── 其他自定义状态
```

也就是说：

> **messages 只是 State 中的一个字段。**





## 简单的 State

例如：

```python
class AgentState:
    messages: list
```

这个 Agent 的 State 只有：

```
State
└── messages
```

更准确的说法是：

> **State 是 Agent 执行过程中维护的结构化状态，`messages` 是其中最常见、最重要的字段。**



## 自定义 State

假设我们做一个订单 Agent。

用户：

> 帮我查询订单 12345。

如果只有：

```python
state = {
    "messages": [...]
}
```

当然可以工作。

但是 Agent 可能还需要知道：

```python
order_id = "12345"
user_id = "张三"
retry_count = 0
is_authenticated = True
```

于是 State 可以设计成：

```python
class AgentState:
    messages: list
    order_id: str | None
    user_id: str | None
    retry_count: int
    is_authenticated: bool
```

那么运行过程中：

```
State
├── messages
├── order_id
├── user_id
├── retry_count
└── is_authenticated
```

这就是**自定义 State**。



## State 是动态变化

一个非常重要的理解。State 不是： 创建一次到永远不变，而是随着 Agent 执行不断更新。

例如刚开始：

``` python
state = {
    "messages": [
        HumanMessage("北京天气怎么样？")
    ]
}
```

LLM 决定调用工具：

```
state
└── messages
    ├── HumanMessage
    └── AIMessage(tool_call)
```

tool 执行：

```
state
└── messages
    ├── HumanMessage
    ├── AIMessage(tool_call)
    └── ToolMessage
```

最终 LLM 回复：

```
state
└── messages
    ├── HumanMessage
    ├── AIMessage(tool_call)
    ├── ToolMessage
    └── AIMessage(final answer)
```

所以可以把 State 理解成：

> **Agent 当前执行到这里时，整个任务的“现场”。**

```
执行开始
 ↓
State
 ↓
LLM
 ↓
更新 State
 ↓
Tool
 ↓
更新 State
 ↓
LLM
 ↓
更新 State
```





想象一下 Agent 正在执行：

```
用户
 ↓
LLM
 ↓
search_product
 ↓
Tool
 ↓
get_product_price
 ↓
Tool
 ↓
LLM
```

Agent 到第二个 Tool 的时候，它需要知道：

```
用户想买什么？
search_product 找到了什么？
商品 ID 是什么？
之前调用过哪些 Tool？
Tool 返回了什么？
```

这些信息都可以通过 State 保留下来。

所以：

```
State
=
Agent 当前执行任务的“上下文现场”
```





# State Update

Agent 执行过程中，State 会发生变化；最常见的变化就是 messages 的增加。

也就是：

```
HumanMessage
      ↓
AIMessage(tool_call)
      ↓
ToolMessage
      ↓
AIMessage(answer)
```

这些都会导致：

```python
State.messages
```

发生变化。

例如：

初始：

```python
{
    "messages":[]
}
```

用户输入：

```python
{
    "messages":[
        HumanMessage("北京天气怎么样")
    ]
}
```

LLM 请求工具：

```python
{
    "messages":[
        HumanMessage("北京天气怎么样"),

        AIMessage(
            tool_calls=[
                {
                    "name":"get_weather"
                }
            ]
        )
    ]
}
```

工具结果：

```python
{
    "messages":[
        HumanMessage("北京天气怎么样"),

        AIMessage(tool_call),

        ToolMessage(
            "北京晴天"
        )
    ]
}
```

这个就是最基础的 State Update。



## 非常重要的理解

**LLM 思考产生：**

```
AIMessage
```

**Tool 执行产生：**

```
Tool Output
```

**Agent Runtime负责转换：**

```
Tool Output

↓

ToolMessage

↓

messages 更新
```

**所以不是：**

```
Tool 修改 State
```

**而是：**

```
Runtime 根据 Agent Loop 规则更新 messages
```



## 总结

1. **messages 是 Agent 的核心 State**

   保存：

   - HumanMessage
   - AIMessage
   - ToolMessage

2. **Tool 不修改 State**

   Tool：

   ```
   输入
    ↓
   执行
    ↓
   返回结果
   ```

3. Runtime 负责把过程串起来

   包括：

   ```
   AIMessage(tool_call)
   
   ↓
   
   Tool执行
   
   ↓
   
   ToolMessage
   
   ↓
   
   messages更新
   ```

4. **Agent Loop = messages 持续增长**

   最终：

   ```
   HumanMessage
    ↓
   AIMessage
    ↓
   ToolMessage
    ↓
   AIMessage
   ```

   形成完整轨迹。



# State Update 中的 Reducer

Reducer 决定 State Update 时，新旧数据如何合并。

**普通字段：**

例如：

```
price
```

通常：

```
旧值 → 新值
```

覆盖。

**messages：**

特殊：

因为它是历史：

```
旧消息 + 新消息
```

追加。



# create_agent

langchain 框架中用来创建 agent 方法；

## Agent 的输入

``` python
result = agent.invoke(
    {
        "messages":[
            {
                "role":"user",
                "content":"北京天气怎么样？"
            }
        ]
    }
)
```

这里传入的不是文本的**"北京天气怎么样？"**而是：

``` python
{
    "messages":[...]
}
```

因为 Agent 的核心状态就是：**messages**



## dome

``` python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI


# 1. 创建模型
model = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0
)


# 2. 创建工具
@tool
def get_weather(city: str) -> str:
    """
    获取指定城市天气
    """

    return f"{city}今天晴天，25度"


# 3. 创建 Agent
agent = create_agent(
    model=model,
    tools=[
        get_weather
    ]
)


# 4. 调用 Agent
result = agent.invoke(
    {
        "messages":[
            {
                "role":"user",
                "content":"北京天气怎么样？"
            }
        ]
    }
)


print(result)
```

**运行后观察结果**

``` python
{
    "messages": [
        HumanMessage(
            content="北京天气怎么样？"
        ),

        AIMessage(
            content="",
            tool_calls=[
                {
                    "name":"get_weather",
                    "args":{
                        "city":"北京"
                    }
                }
            ]
        ),

        ToolMessage(
            content="北京今天晴天，25度"
        ),

        AIMessage(
            content="北京今天晴天，25度"
        )
    ]
}
```

**result["messages"]** 是一个 **messages**

``` python
HumanMessage # 用户提的问题

AIMessage(tool_call) # AI经过意图识别找到需要调用的 tool，并以 tool_call 返回

ToolMessage # 工具 agent runtime 执行 tool_call，并将结果包装成 ToolMessage

AIMessage(answer) # AI  agent runtime 将工具执行的结果加入到state.Messages 并一起给到 LLM，LLM 再根据state.Messages 回复用户；
```



## create_agent 做了什么？

``` python
agent = create_agent(
    model=model,
    tools=[get_weather]
)
```

实际上创建了一个：**Agent Runtime** 它帮你处理；

小知识点：agent 接收 Tools， 并转 Tool Schema，绑定到 LLM（加入提示词）

### 第一件事：调用 LLM

不用我们写： **model.invoke()**，**Agent Runtime** 会帮我们执行；



### 第二件事：检查 Tool Call

LLM 返回：

```python
AIMessage(
    tool_calls=[
        get_weather # 工具
    ]
)
```

Agent 发现：需要工具。



### 第三件事：执行 Tool

帮我们执行：

```python
get_weather(
    city="北京"
)
```



### 第四件事：生成 ToolMessage

Tool 返回：

```
"北京今天晴天"
```

Agent 包装：

```python
ToolMessage(
    content="北京今天晴天"
)
```



### 第五件事：继续调用 LLM

把：**用户问题 + 工具结果 , 重新给 LLM。**



## 这时候回看 State

整个 Agent 执行过程中：

**State：**

```python
{
    "messages":[]
}
```

不断变化。

**开始：**

```python
{
    "messages":[

        HumanMessage(
            "北京天气怎么样"
        )

    ]
}
```

LLM：

```python
{
    "messages":[

        HumanMessage(...),

        AIMessage(
            tool_call=get_weather
        )

    ]
}
```

**Tool：**

```python
{
    "messages":[

        HumanMessage(...),

        AIMessage(...),

        ToolMessage(
            "北京今天晴天"
        )

    ]
}
```

**最终：**

```python
{
    "messages":[

        HumanMessage(...),

        AIMessage(...),

        ToolMessage(...),

        AIMessage(
            "北京今天晴天"
        )

    ]
}
```



### 为什么 messages 能一直增长？

因为底层需要：

```
add_messages
```

类似：

```
old_messages + new_messages
```

而不是：

```
new_messages覆盖old_messages
```

否则：

第二轮 LLM 会丢失上下文。



## Debug 每一步 Agent Loop

``` python
from settings import app_settings
from langchain.agents import create_agent
from langchain_core.tools import tool

model = app_settings.get_qwen_client()


@tool
def search_product(keyword: str) -> str:
    """
    根据关键词搜索商品。
    """

    print("\n====== TOOL EXECUTE ======")

    print("keyword:", keyword)


    return """
    找到商品：

    MacBook Air M3
    价格：8999

    MacBook Pro M4
    价格：14999
    """

agent = create_agent(
    model=model,
    tools=[
        search_product
    ]
)

result = agent.invoke(
    {
        "messages":[
            {
                "role":"user",
                "content":"帮我找 MacBook"
            }
        ]
    }
)

for message in result["messages"]:
    message.pretty_print()


```

输出：

### 第一步：HumanMessage

输出：

```
================================

Human:

帮我找 MacBook
```

对应：

```python
HumanMessage(
    content="帮我找 MacBook"
)
```

State：

```python
{
 "messages":[

    HumanMessage(
        "帮我找 MacBook"
    )

 ]
}
```



### 第二步：AIMessage(tool_call)

输出类似：

```
================================

AI:

[tool_calls]

search_product

{
 keyword:"MacBook"
}
```

对应：

```python
AIMessage(
    tool_calls=[
        {
            "name":"search_product",
            "args":{
                "keyword":"MacBook"
            }
        }
    ]
)
```

此时：LLM 它没有搜索(执行工具)，它只是**请求 Runtime 调用 search_product**。

State：

```python
{
"messages":[
    HumanMessage(...),
    AIMessage(
     tool_call="search_product"
    )
  ]
}
```

### 第三步：Tool 执行

``` 
====== TOOL EXECUTE ======

keyword: MacBook
```

现在才真正执行：

```python
search_product(
    keyword="MacBook"
)
```

这个时候才是 agent runtime 执行工具；

### 第四步：ToolMessage

输出：

```
================================

Tool:

找到商品：

MacBook Air M3
价格：8999

MacBook Pro M4
价格：14999
```

对应：

```python
ToolMessage(
    content="找到商品..."
)
```

Tool 返回：

```
字符串
```

Runtime 包装：

```
ToolMessage
```

State：

```python
{
  "messages":[

    HumanMessage,

    AIMessage(tool_call),

    ToolMessage

  ]
}
```

### 第五步：最终 AIMessage

输出：

```
================================

AI:

找到两个 MacBook：

1. MacBook Air M3
价格8999

2. MacBook Pro M4
价格14999

如果预算有限推荐 Air。
```

对应：

```
AIMessage(
 content="..."
)
```



### 观察

做 Agent 开发时，不要第一时间看最终答案。

**① LLM 有没有正确选择 Tool**

**② 参数有没有正确生成**

**③ Tool 返回是否适合 LLM**



# Runtime

R**untime 是负责执行 Agent 生命周期的运行环境。**

**LLM 负责想。**

**Tool 负责做。**

**Runtime 负责组织整个过程。**

**Agent = LLM + Tools 是错的；**

**Agent = LLM + Tools  + Runtime**； Runtime 是控制层。



## 核心职责

### 工具注册表

Runtime 里面维护当前 agent 所需要的 tools 表；

``` python
@tool
def search_product(keyword:str):
    return "商品列表"


@tool
def get_price(product_id:str):
    return 8999
```

会别 runtime 注册

``` python
tools = {

    "search_product": search_product,

    "get_price": get_price

}
```

LLM 输出

``` python
{
    "name":"search_product",
    "arguments":{
        "keyword":"MacBook"
    }
}
```

Runtime 根据 LLM 意图识别需要执行的 tool_call 去工具表找到对应的工具并执行；

``` python
tools["search_product"](
    keyword="MacBook"
)
```





### 循环控制

Runtime 决定是否继续循环，如果有 tool_call 则执行，一直到 tool_call 是空的停止；**是 Agent 和普通 Chat 的区别。**

普通 Chat：

```
User

↓

LLM

↓

Answer
```

结束。

Agent：

```
User

↓

LLM

↓

需要 Tool?

↓

Tool

↓

继续 LLM

↓

需要 Tool?

↓

...

↓

结束
```

整个环节都是 Runtime 决定是否执行，也决定是否循环；



**例如：**

**第一次：**

**LLM：**

```
AIMessage(
 tool_call="search_product"
)
```

Runtime：

发现：

```
有 tool_call
```

**继续。**

------

**第二次：**

**LLM：**

```
AIMessage(
 content="找到商品"
)
```

**Runtime：**

**发现：**

```
没有 tool_call
```

结束。

------

所以：

循环逻辑属于 Runtime。

不是 LLM。

**LLM 只是意识识别当前节点需要执行哪个工具，真正决定是否执行工具是由 runtime 决定；**



### Message 管理

Runtime 负责把 LLM 输出的结果、工具输出、等加入到当前state.Messages 列表；



Tool 返回：

```
"MacBook Air"
```

但是 LLM 不能直接收到字符串。

Runtime：

包装：

```
ToolMessage(
    content="MacBook Air"
)
```

加入：

```
messages
```

然后重新调用 LLM。



### 错误处理





### Runtime 和 State 的关系（基础）

```python
create_agent(
    model=model,
    tools=[tool]
)
```

它不是简单封装：

```
LLM + Tool
```

它创建：

```
Agent Runtime

里面包含：

- Model调用逻辑
- Tool注册
- Tool执行
- Loop控制
- Message管理
```

**Runtime 核心职责**：

1. Tool Registry
2. 执行 Tool
3. 处理 Tool Call
4. 创建 ToolMessage
5. 控制 Agent Loop
6. 管理 State 更新





