# 基础知识

## LLM

## Token

## 向量

## 相识度

## 提示词



# llamaIndex

## 索引

### 文档处理

### 文档分割（节点创建）

### 存储体系

## 检索

## 生成

### 响应合成

### 查询引擎

### 聊天引擎

### 记忆

## 高级RAG

### 摄取管道

### 查询优化

### 优化检索

### 后处理器





# 检索增强生成

- 幻觉: 是指模型生成的内容看似合理，但实际与事实不符、逻辑错误或缺乏真实依据的现象

  - 形成原因:
    - **训练数据噪声**：模型从海量文本中学习，但数据本身包含错误、偏见或虚构内容（例如网络谣言、小说情节），模型可能误将其视为真实知识。
    - **概率优先而非真实性**：模型目标是生成“最符合上下文概率分布”的文本，而非追求事实正确性。当缺乏明确答案时，模型倾向于用高频词汇或合理句式“填补空白”(做填词游戏)。

- LLM知识更新缓慢

- ##### LLM对领域知识的理解有限

  - 在一些较为浅显的领域，大型语言模型可能通过之前的大量训练数据获得了相应的能力。但当涉及到更深层次的专业领域时，这些模型往往会出现所谓的“幻觉”问题，即生成的信息可能偏离事实或专业知识的真实性。
  - 形成原因:
    - 训练数据的覆盖广度与深度矛盾(**广度优先** ):LLM的训练数据覆盖全网公开文本（书籍、网页、论文等），但**领域知识往往分布稀疏**



 **RAG的初衷是为了增强大模型的事实性，时效性，减少幻觉，引入专业知识优化生成回复**



## RAG的概念

- RAG（Retrieval Augmented Generation）顾名思义，通过检索外部数据，增强大模型的生成效果。
- 最早提及RAG论文:https://arxiv.org/pdf/2005.11401
- 类比:你可以把这个过程想象成开卷考试。让LLM先翻书，再回答问题。
- 举例: 我想询问LLM有关于我公司内部的请假流程它肯定不知道,但是我把公司的员工手册先给它看,当我在询问的时候他就会知道

![RAG_01](./image/RAG_01.png)



RAG**系统工作流程图解**

![RAG_02](./image/RAG_02.png)

可以看出，它主要包括三个步骤：

1. **索引化：**将文档切分成片段，再编码为向量，存储在向量数据库里。
2. **检索：**检索到与问题相似度最高的top k 的片段。
3. **生成：**将原始问题和检索得到的“块”都作为LLM的输入，令其生成最终的回答。



RAG的研究范式一直在持续演进，我们将其发展过程分为三个阶段：朴素RAG（Naive RAG）、高级RAG（Advanced RAG）和模块化RAG（Modular RAG），如图所示 

![RAG_03](./image/RAG_03.png)



# Naive RAG

Naive RAG遵循一个传统的处理流程，包括索引、检索和生成三个阶段



![RAG_04](./image/RAG_04.png)



### 文档分块

![RAG_05](./image/RAG_05.png)

**分块策略:**

- 按照句子来切分
- 按照字符数来切分
- 按固定字符数 结合overlapping window

##### 1.1 **按照句子来切分**

```Python
# -*- encoding:utf-8 -*-
import re

text = "自然语言处理（NLP），作为计算机科学、人工智能与语言学的交融之地，致力于赋予计算机解析和处理人类语言的能力。在这个领域，机器学习发挥着至关重要的作用。利用多样的算法，机器得以分析、领会乃至创造我们所理解的语言。从机器翻译到情感分析，从自动摘要到实体识别，NLP的应用已遍布各个领域。随着深度学习技术的飞速进步，NLP的精确度与效能均实现了巨大飞跃。如今，部分尖端的NLP系统甚至能够处理复杂的语言理解任务，如问答系统、语音识别和对话系统等。NLP的研究推进不仅优化了人机交流，也对提升机器的自主性和智能水平起到了关键作用。"

# 正则表达式匹配中文句子结束的标点符号
sentences = re.split(r'(。|？|！|\..\..)', text)

# 重新组合句子和结尾的标点符号
chunks = []
for sentence, punctuation in zip(sentences[::2], sentences[1::2]):
    chunks.append(sentence + (punctuation if punctuation else ''))

print(chunks)
for i, chunk in enumerate(chunks):
    print(f"块 {i + 1}: {len(chunk)}: {chunk}")
```

##### 1.2 **按照固定字符数切分**

```Python
# -*- encoding:utf-8 -*-

def split_by_fixed_char_count(text, count):
    chunks = []
    for i in range(0, len(text), count):
         chunks.append(text[i:i + count])
    return chunks


text = "自然语言处理（NLP），作为计算机科学、人工智能与语言学的交融之地，致力于赋予计算机解析和处理人类语言的能力。在这个领域，机器学习发挥着至关重要的作用。利用多样的算法，机器得以分析、领会乃至创造我们所理解的语言。从机器翻译到情感分析，从自动摘要到实体识别，NLP的应用已遍布各个领域。随着深度学习技术的飞速进步，NLP的精确度与效能均实现了巨大飞跃。如今，部分尖端的NLP系统甚至能够处理复杂的语言理解任务，如问答系统、语音识别和对话系统等。NLP的研究推进不仅优化了人机交流，也对提升机器的自主性和智能水平起到了关键作用。"

# 假设我们按照每100个字符来切分文本
chunks = split_by_fixed_char_count(text, 100)
for i, chunk in enumerate(chunks):
    print(f"块 {i + 1}: {len(chunk)}: {chunk}")
```

##### 1.3 **按固定字符数 结合overlapping window**

```python
# -*- encoding:utf-8 -*-
def sliding_window_chunks(text, chunk_size, stride):
    chunks = []
    for i in range(0, len(text), stride):
        chunks.append(text[i:i + chunk_size])
    return chunks


text = "自然语言处理（NLP），作为计算机科学、人工智能与语言学的交融之地，致力于赋予计算机解析和处理人类语言的能力。在这个领域，机器学习发挥着至关重要的作用。利用多样的算法，机器得以分析、领会乃至创造我们所理解的语言。从机器翻译到情感分析，从自动摘要到实体识别，NLP的应用已遍布各个领域。随着深度学习技术的飞速进步，NLP的精确度与效能均实现了巨大飞跃。如今，部分尖端的NLP系统甚至能够处理复杂的语言理解任务，如问答系统、语音识别和对话系统等。NLP的研究推进不仅优化了人机交流，也对提升机器的自主性和智能水平起到了关键作用。"

chunks = sliding_window_chunks(text, 100, 50)  # 100个字符的块，步长为50

for i, chunk in enumerate(chunks):
    print(f"块 {i + 1}: {len(chunk)}: {chunk}")
```

# 向量与Embedding

#### 向量

在数学中，向量（也称为欧几里得向量、几何向量），指具有大小（magnitude）和方向的量。它可以形象化地表示为带箭头的线段。箭头所指：代表向量的方向；线段长度：代表向量的大小。

1. 将文本转成一组浮点数：每个下标 `i`，对应一个维度
2. 整个数组对应一个 `n` 维空间的一个点，即**文本向量**又叫 Embeddings
3. 向量之间可以计算距离，距离远近对应**语义相似度**大小

- 在计算机中我们用数组来表述向量

```python
import numpy as np

v = np.array([3, 4])  # 数组表示向量
magnitude = np.linalg.norm(v)  # 计算大小
unit_vector = v / magnitude    # 计算单位向量（方向）
angle = np.arctan2(v[1], v[0]) * 180 / np.pi  # 角度（度）

print(f"大小: {magnitude}")
print(f"单位向量 (方向): {unit_vector}")
print(f"与x轴角度: {angle:.1f}°")
```

#### AI中数据的本质

> 在计算机当中所有数据的存储都是二进制,不管是图片还是文字,都是以二进制的内容进行存储的



#### 表示学习

**表示学习**:通过学习算法自动地从原始数据中学习到一种表示形式或特征表示，该表示形式能够更好地表达数据的重要特征和结构。表示学习的目标是将输人数据转换为具有良好表示能力的特征空间，使得在该空间中的数据具有更好的可分性、可解释性或推理能力

- 将数据转换成低维的内容,并且向量直接的关系非常清晰





#### Embedding

- 嵌入:表示学习的一种形式，通常用于将高维数据映射到低维空间中的表示形式。嵌入可以是词嵌入、图像嵌入、图嵌入等。例如，在自然语言处理中，词嵌入将词语映射到低维向量空间，以捕捉词语之间的语义和句法关系。在图像处理中，图像嵌入将图像映射到低维向量空间，以表示图像的视觉特征。
- 可以理解为表示学习是成为翻译官的过程, 嵌入是成为翻译官之后把内容翻译成正确的结果

##### 4.1 转换代码

- 如何才能把字符转换成向量?
- 我们在使用的时候不需要过多关注我们都是使用现成的转换工具

```Python
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("api_key"), base_url=os.getenv("base_url"))


def get_embeddings(texts, model="text-embedding-v1"):
    #  texts 是一个包含要获取嵌入表示的文本的列表，
    #  model 则是用来指定要使用的模型的名称
    #  生成文本的嵌入表示。结果存储在data中。
    data = client.embeddings.create(input=texts, model=model).data
    # print(data)
    # 返回了一个包含所有嵌入表示的列表
    return [x.embedding for x in data]


test_query = ["我爱你"]

vec = get_embeddings(test_query)
print(vec)
#  "我爱你" 文本嵌入表示的列表。
print(len(vec))
#  "我爱你" 文本的嵌入表示。
print(vec[0])
#  "我爱你" 文本的嵌入表示的维度。3072
print(len(vec[0]))
```

##### 4.2 向量模型本地部署

- Huggingface：https://huggingface.co/
- Hugging Face 是一个专注于 **机器学习**（尤其是自然语言处理，NLP）的**开源平台和社区**，提供从模型开发、训练、部署到共享的一站式工具和资源
- 国内的镜像地址：https://hf-mirror.com/
- 魔搭社区：https://www.modelscope.cn/my/overview
- 在网址中找到自己需要的文本向量模型

```python
# 模型下载
from modelscope import snapshot_download
# pip install modelscope
model_dir = snapshot_download("BAAI/bge-large-zh-v1.5", cache_dir="D:\LLM\Local_model")
```

- 使用本地的向量模型进行向量化

```Python
# pip install sentence-transformers
# 用来加载模型,并使用模型生成向量
from sentence_transformers import SentenceTransformer

model_path = r"D:\LLM\Local_model\BAAI\bge-large-zh-v1___5"  # 替换为实际路径
model = SentenceTransformer(model_path)

sentences = [
    "你好",
    '你'
]

# 生成向量（默认返回numpy数组）
embeddings = model.encode(sentences)
print(embeddings)
print(embeddings.shape)  # 输出: (2, 1024)  （维度取决于模型）
```



# llamaindex

## 嵌入模型

### 在线模型

``` python
pip install llama-index-embeddings-dashscope # 下载对应的标准接口


embed_model = DashScopeEmbedding(
    model_name="text-embedding-v3",
    api_key=os.getenv("DASHSCOPE_API_KEY")
)
```

### 离线模型

安装模块

``` shell
pip install sentence_transformers

from modelscope import snapshot_download

model_dir = snapshot_download('BAAI/bge-m3', cache_dir=r"D:\LLM\Local_model")
```

示例

``` python
from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings, SettingsConfigDict

from llama_index.embeddings.dashscope import DashScopeEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding


class AppConfigSettings(BaseSettings):
    """应用配置"""
    # 基础目录
    BASE_DIR: ClassVar[Path] = Path(__file__).resolve().parent

    # 阿里百炼 key
    BAILIAN_OPEN_AI_KEY: str
    # 阿里百炼 base url
    BAILIAN_OPEN_AI_BASE_URL: str

    # 本地嵌入模型路径
    LOCAL_EMB_BAILIAN_LLN_URL: str # 维度 1024
    # 重排嵌入模型路径
    LOCAL_EMB_BAILIAN_LLN_RERANKER_URL: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent / ".env",  # 指定文件（相对于当前文件路径）
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 里多余的变量
        case_sensitive=True,  # 推荐保持默认 True，让字段名和 .env 完全一致
    )

    def get_embedding_model(self, model: str | None = None, **model_kwargs) -> DashScopeEmbedding:
        """获取DashScope嵌入模型"""
        # qwen3.7-text-embedding-flash qwen3.7-text-embedding
        # qwen3.7-text-rerank qwen3-vl-embedding
        embed_model = DashScopeEmbedding(model=model or "qwen3.7-text-embedding-flash", api_key=self.BAILIAN_OPEN_AI_KEY,
                                         **model_kwargs)
        return embed_model

    def get_local_embedding_model(self, **model_kwargs) -> HuggingFaceEmbedding:
        """获取本地嵌入模型"""
        embed_model = HuggingFaceEmbedding(model_name=self.LOCAL_EMB_BAILIAN_LLN_URL, **model_kwargs)
        return embed_model


app_settings = AppConfigSettings()

```



## 文档处理

#### 文档加载

- 文档加载是 LlamaIndex 构建 RAG 应用的第一步，其核心是将外部数据转换为 LlamaIndex 可处理的 Document 对象。

##### 1. 核心概念

- **Document:** LlamaIndex 中的基本数据容器。包含 text（主要文本内容）和 metadata（元数据，如文件名、页码、创建时间、自定义标签等）。 Document 可以从加载器自动生成，也可以手动构造。
- **Node**（节点）：Document 被切分后的“原子块”。后续索引（Index）实际上是对 Node 进行 Embedding 和存储。Node 继承自 Document，并额外带有 relationships（父子、上下级关系等）。
- **Reader**（加载器）：负责从不同数据源读取并解析成 Document 的类。所有 Reader 都继承自 BaseReader。
  - 各个加载器地址:https://developers.llamaindex.ai/python/framework-api-reference/readers/



### **创建文档**

手动创建文档

``` python
from llama_index.core import Document

document = Document(
    text="This is a test document.",  # type: ignore
    metadata={"author": "test", "header": "header_01", "category": "test_category"}
)
print(document.id_) # 一个随机 UUID，可以显示的传递，不传递的话，会每次创建都自动创建一个
print(document.text) # 文档文本
print(document.metadata) # 文档自定义的元信息
```



### 纯文本

目前RAG最好处理的格式



### Markdown



### PDF

最恶心的处理格式



### CSV / Excel



### HTML



### 图像





## 节点分割







## 存储



## 检索器





## 响应器



## 查询引擎



## 记忆



## 评估

