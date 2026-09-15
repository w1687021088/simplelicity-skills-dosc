# FastAPI

## 进程，线程，协程

-  **进程（Process）**：**资源分配的最小单位内存、文件句柄；**

- **线程（Thread）**：**CPU 调度的最小单位，共享进程的内存**。

- **协程（Coroutine）**：**用户态的轻量级执行流**。



## 同步和异步

- 同步：一个线程只能同时处理一个请求（遇到 io 就会阻塞），多进程和多线程效果会受限于进程*线程数；
- 异步：一个线程同时处理多个请求，因为有协程，如果多进程+多线程，并发效果会很高；

##  核心

### 路由创建

``` python
@user_router.get("/info")
async def get_user_info():
    """获取用户信息。"""
    return {"message": "获取用户列表成功", "code": 0, "data": None}
```

### 动态路由

```python
# 动态路由
@app.get("/user/{user_id}")
async def main(user_id: int) -> dict:
  return {
      "data": f'请求 ID{user_id}'
  }
```

### 查询参数

```python
# 查询参数
@app.post("/items")
async def read_items(item: ItemQuery) -> dict:
    print(f'{item.name} {item.age}')
    return {
        "data": "This is a test"
    }


@app.get("/query")
async def read_query(name_1: str = Query(None, title="名称", max_length=10),
                     age: int = Query(None, title="The age", gt=0)) -> dict:
    return {
        "name": name_1,
        "age": age
    }
```



### Path

| 分类           | 参数名              | 类型          | 描述                                    | 示例                             |
| :------------- | :------------------ | :------------ | :-------------------------------------- | :------------------------------- |
| **基础配置**   | `default`           | `Any`         | 路径参数始终是必需的，设置此参数无效。  | `...`（通常写 `...`）            |
|                | `alias`             | `str`         | 不推荐使用，路径参数无法通过别名传值。  | -                                |
|                | `title`             | `str`         | OpenAPI 文档中的参数标题。              | `title="商品ID"`                 |
|                | `description`       | `str`         | OpenAPI 文档中的参数详细描述。          | `description="商品的唯一标识符"` |
| **数值校验**   | `gt`                | `int`/`float` | 值必须 **大于** 此数值。                | `gt=0`                           |
|                | `ge`                | `int`/`float` | 值必须 **大于或等于** 此数值。          | `ge=1`                           |
|                | `lt`                | `int`/`float` | 值必须 **小于** 此数值。                | `lt=100`                         |
|                | `le`                | `int`/`float` | 值必须 **小于或等于** 此数值。          | `le=50`                          |
|                | `multiple_of`       | `int`/`float` | 值必须是此数值的 **倍数**。             | `multiple_of=2`                  |
| **字符串校验** | `min_length`        | `int`         | 字符串的 **最小长度**。                 | `min_length=3`                   |
|                | `max_length`        | `int`         | 字符串的 **最大长度**。                 | `max_length=30`                  |
|                | `pattern`           | `str`         | 字符串必须匹配的 **正则表达式**。       | `pattern="^[a-zA-Z0-9]+$"`       |
| **其他**       | `examples`          | `list`        | 在文档中提供 **多个示例值**。           | `examples=["123", "456"]`        |
|                | `deprecated`        | `bool`        | 在文档中标记该参数为 **已弃用**。       | `deprecated=True`                |
|                | `include_in_schema` | `bool`        | 是否在 OpenAPI 文档中 **包含** 此参数。 | `include_in_schema=False`        |

> **说明**：  
> - `Path` 参数始终是必需的（路径的一部分），因此 `default` 参数实际上无效，通常写 `...`。  
> - 路径参数**不推荐使用 `alias`**，因为 URL 路径位置固定，别名无法生效。  
> - 推荐使用 `Annotated` 模式，例如：  
>   `item_id: Annotated[int, Path(ge=1, description="商品ID")]`



### Query

`Query` 用于为**查询参数**（URL 中 `?` 后面的键值对，例如 `?page=1&size=10`）添加校验规则和元数据。

| 分类           | 参数名              | 类型          | 描述                                                         | 示例                                           |
| :------------- | :------------------ | :------------ | :----------------------------------------------------------- | :--------------------------------------------- |
| **基础配置**   | `default`           | `Any`         | **查询参数的默认值**。若未传入，则使用此值。<br>• 如果设为 `...`，则表示该参数**必需**。<br>• 如果设为 `None`，则表示可选，且默认 `None`。 | `default=1`<br>`default=...`<br>`default=None` |
|                | `alias`             | `str`         | 参数在 URL 中的**别名**。若前端使用不同名称（如 `user-id`），可映射到 Python 变量名（如 `user_id`）。 | `alias="user-id"`                              |
|                | `title`             | `str`         | 在 OpenAPI 文档中显示的参数标题。                            | `title="页码"`                                 |
|                | `description`       | `str`         | 在 OpenAPI 文档中显示的参数详细描述。                        | `description="当前页数，从1开始"`              |
| **数值校验**   | `gt`                | `int`/`float` | 值必须 **大于** 此数值。                                     | `gt=0`                                         |
|                | `ge`                | `int`/`float` | 值必须 **大于或等于** 此数值。                               | `ge=1`                                         |
|                | `lt`                | `int`/`float` | 值必须 **小于** 此数值。                                     | `lt=100`                                       |
|                | `le`                | `int`/`float` | 值必须 **小于或等于** 此数值。                               | `le=50`                                        |
|                | `multiple_of`       | `int`/`float` | 值必须是此数值的 **倍数**。                                  | `multiple_of=2`                                |
| **字符串校验** | `min_length`        | `int`         | 字符串的 **最小长度**。                                      | `min_length=3`                                 |
|                | `max_length`        | `int`         | 字符串的 **最大长度**。                                      | `max_length=30`                                |
|                | `pattern`           | `str`         | 字符串必须匹配的 **正则表达式**。                            | `pattern="^[a-zA-Z0-9]+$"`                     |
| **列表/多值**  | `min_items`         | `int`         | 列表参数（如 `?tags=a&tags=b`）的**最小元素数量**。          | `min_items=1`                                  |
|                | `max_items`         | `int`         | 列表参数的**最大元素数量**。                                 | `max_items=5`                                  |
| **其他**       | `examples`          | `list`        | 在文档中提供 **多个示例值**。                                | `examples=[1, 2, 3]`                           |
|                | `deprecated`        | `bool`        | 在文档中标记该参数为 **已弃用**。                            | `deprecated=True`                              |
|                | `include_in_schema` | `bool`        | 是否在 OpenAPI 文档中 **包含** 此参数。                      | `include_in_schema=False`                      |

#### 基础用法

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
async def read_items(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页条数"),
):
    return {"page": page, "size": size}
```

#### 推荐用法

```python
from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
async def read_items(
    page: Annotated[int, Query(ge=1, description="页码")] = 1,
    size: Annotated[int, Query(ge=1, le=100, description="每页条数")] = 10,
):
    return {"page": page, "size": size}
```



### 配置文件

pydantic_settings

```python
# settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    """应用程序设置

       Attributes:
           APP_HOST (str): 应用主机
           APP_PORT (str): 应用端口
           DB_HOST (str): 数据库主机
           DB_PORT (int): 数据库端口
           DB_NAME (str): 数据库名称
           DB_USER (str): 数据库用户
           DB_PASSWORD (str): 数据库密码
       """
    # 基础配置
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "py_dome_001"
    DB_USER: str = "root"
    DB_PASSWORD: str = "123456"

    model_config = SettingsConfigDict(
        env_file=".env",  # 指定文件（相对于当前文件路径）
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 里多余的变量
        case_sensitive=True,  # 推荐保持默认 True，让字段名和 .env 完全一致
    )

app_settings = AppSettings()

```

会把env的配置信息映射到`AppSettings` 中。

### 路由分发

```python
# 1 之前一直把项目放在一个py文件中，做大型项目肯定不这样
# 2 大型项目：多个文件及目录的划分，也要见名知意
# 3 FastApi提供的 APIRouter 做目录划分，路由划分--》django --》include


# 4 使用步骤：
    # 4.1 实例化得到APIRouter对象
    view_router = APIRouter()
    # 4.2 在app中注册
    from src.views import view_router
	app.include_router(view_router,prefix='/api/v1',tags=['主路由'])
    # 4.3 以后写路径，都用APIRouter对象装饰
    @view_router.get('/')
    async def index():
        return '这是首页'
```



### 中间件

#### http

```python
async def add_process_time_header(request: Request, call_next):
    print(f"收到请求: {request.url.path}")
    start_time = time.time()

    # 2. 【关键动作】放行请求，去执行真正的路由函数
    response = await call_next(request)

    # 3. 【响应返回时】后处理阶段
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)  # 给响应加个自定义头
    print(f"请求处理耗时: {process_time}秒")

    return response

app.middleware("http")(add_process_time_header)
```

#### CORS

同源策略处理

```python
# 添加 CORS middleware
app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)
```

如果不在中间件里面处理的话，那么就得在路由单出处理

```python
@user_router.post("/")
async def get_user(res: Response):
    res.headers["Access-Control-Allow-Origin"] = "*"
    res.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE"
    res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    """查看。"""
    return {"message": "查看", "code": 0, "data": None}
```

### 模板语法

FastAPI兼容`jinjia2`

### ORM

对象关系映射，使用python 中的类，对应数据库的表；

**同步**：django-orm django 框架专用，pewee 轻量级；

**中间态**：sqlalchemy 企业级 orm 框架，早期支持同步，后期支持异步，用法非常复杂，笨重，兼容老语法；

**Tortoise**：只支持异步，上升快，异步框架非常贴合；

#### 配置

``` python
"""
# 1. 改完模型后，生成迁移文件
aerich migrate --name 描述本次改动

# 2. 检查本地版本（可选）
aerich heads

# 3. 提交给数据库执行
aerich upgrade

如果发现 upgrade 错了，立刻执行 aerich downgrade -1 回滚
"""


"""
init 
tortoise init 
为已配置的应用创建迁移包。这确保了每个应用都有一个 migrations 模块

makemigrations
tortoise makemigrations 检测 所有已注册的应用（apps） 的模型变化。自动生成包含模型变化的迁移文件（如新增字段、删除表等）
tortoise makemigrations --name add_posts_table 生成名为 add_posts_table 的迁移文件
tortoise makemigrations users 为 users 应用生成迁移文件
tortoise makemigrations --empty users 为 users 应用生成空迁移文件


tortoise migrate 或 tortoise upgrade
应用迁移。migrate 可以根据目标向前或向后迁移。upgrade 仅限向前迁移，拒绝回滚

tortoise history
显示当前数据库已执行的迁移历史记录。

tortoise heads
列出当前所有已生成的迁移文件版本号（即代码里的最新文件列表）。

tortoise downgrade
取消特定应用的已应用迁移。downgrade 仅限向后迁移，拒绝应用新的迁移。如果未提供迁移名称，它将针对该应用的第一个迁移。
"""
```

配置连接数据库

``` python
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class AppSettings(BaseSettings):
    """应用程序设置

       Attributes:
           APP_HOST (str): 应用主机
           APP_PORT (str): 应用端口
           DB_HOST (str): 数据库主机
           DB_PORT (int): 数据库端口
           DB_NAME (str): 数据库名称
           DB_USER (str): 数据库用户
           DB_PASSWORD (str): 数据库密码

       """
    # 基础配置
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8080

    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "py_dome_001"
    DB_USER: str = "root"
    DB_PASSWORD: str = "123456"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent / ".env",  # 指定文件（相对于当前文件路径）
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 里多余的变量
        case_sensitive=True,  # 推荐保持默认 True，让字段名和 .env 完全一致
    )


app_settings = AppSettings()

# 数据库配置
TORTOISE_ORM = {
    # 数据库连接配置
    "connections": {
        "default": {
            "engine": "tortoise.backends.mysql",  # 使用 mysql 驱动
            "credentials": {
                "host": app_settings.DB_HOST,  # 数据库主机
                "port": app_settings.DB_PORT,  # 数据库端口
                "user": app_settings.DB_USER,  # 数据库用户
                "password": app_settings.DB_PASSWORD,  # 数据库密码
                "database": app_settings.DB_NAME,  # 数据库名称
                "charset": "utf8mb4",  # 支持完整 Unicode
            },
            # 连接池参数
            "minsize": 1,  # 最小连接数
            "maxsize": 10,  # 最大连接数
            "echo": False,  # 生产环境关闭
        }
    },
    # 应用模型映射
    "apps": {
        "models": {
            "models": ["apps.models"],
            "default_connection": "default",
            "migrations": "apps.migrations",  # 新增：指定迁移文件存放路径
        },
    },
    # 全局配置（可选）
    "use_tz": False,  # 使用本地时区，关闭时区转换
    "timezone": "Asia/Shanghai",  # 时区配置
}
```

``` python
from settings import app_settings, TORTOISE_ORM
from tortoise.contrib.fastapi import register_tortoise

app = FastAPI()

register_tortoise(app, config=TORTOISE_ORM)
```



#### 🔢 数值类型

| 字段类          | Python 类型       | 数据库类型 (MySQL) | 说明                   | 必填参数                       |
| :-------------- | :---------------- | :----------------- | :--------------------- | :----------------------------- |
| `IntField`      | `int`             | `INT`              | 32位整数，通常用作主键 | -                              |
| `BigIntField`   | `int`             | `BIGINT`           | 64位整数，适合大数值   | -                              |
| `SmallIntField` | `int`             | `SMALLINT`         | 16位整数               | -                              |
| `FloatField`    | `float`           | `DOUBLE`           | 双精度浮点数           | -                              |
| `DecimalField`  | `decimal.Decimal` | `DECIMAL(10,2)`    | 高精度十进制数         | `max_digits`, `decimal_places` |

```python
class Product(Model):
    id = fields.IntField(pk=True)
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    stock = fields.IntField(default=0)
    weight = fields.FloatField(null=True)
```



#### 📝 字符串与文本类型

| 字段类             | Python 类型 | 数据库类型 (MySQL) | 说明       | 必填参数     |
| :----------------- | :---------- | :----------------- | :--------- | :----------- |
| `fields.CharField` | `str`       | `VARCHAR(N)`       | 定长字符串 | `max_length` |
| `fields.TextField` | `str`       | `TEXT`             | 长文本     | -            |

```python
class Article(Model):
    title = fields.CharField(max_length=200)
    content = fields.TextField()
```



#### ⏰ 日期与时间类型

| 字段类                 | Python 类型         | 数据库类型 (MySQL) | 说明     | 常用参数                   |
| :--------------------- | :------------------ | :----------------- | :------- | :------------------------- |
| `fields.DatetimeField` | `datetime.datetime` | `DATETIME(6)`      | 日期时间 | `auto_now`, `auto_now_add` |
| `fields.DateField`     | `datetime.date`     | `DATE`             | 日期     | -                          |
| `fields.TimeField`     | `datetime.time`     | `TIME(6)`          | 时间     | -                          |

```python
class User(Model):
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    birthday = fields.DateField(null=True)
```

`auto_now` 和 `auto_now_add` 是互斥的。你可以选择都不设置，或者只设置其中一个

- `auto_now` (布尔值)

  在保存时总是设置为 `datetime.utcnow()`。

- `auto_now_add` (布尔值)

  仅在第一次保存时设置为 `datetime.utcnow()`。

#### ✅ 布尔与状态类型

| 字段类                | Python 类型 | 数据库类型 (MySQL) | 说明   | 默认值  |
| :-------------------- | :---------- | :----------------- | :----- | :------ |
| `fields.BooleanField` | `bool`      | `TINYINT(1)`       | 布尔值 | `False` |

``` python
class User(Model):
    is_active = fields.BooleanField(default=True)
    is_superuser = fields.BooleanField(default=False)
```



#### 🗂️其他类型

| 字段类               | Python 类型     | 数据库类型 (MySQL) | 说明             |
| :------------------- | :-------------- | :----------------- | :--------------- |
| `fields.UUIDField`   | `uuid.UUID`     | `CHAR(36)`         | UUID，可自动生成 |
| `fields.JSONField`   | `dict` / `list` | `JSON`             | JSON 数据        |
| `fields.BinaryField` | `bytes`         | `BLOB`             | 二进制数据       |

```python
import uuid

class Config(Model):
    uid = fields.UUIDField(pk=True, default=uuid.uuid4)
    metadata = fields.JSONField(default=dict)
```



#### ⚙️ 通用字段参数

| 参数            | 说明                             | 示例                                                         |
| :-------------- | :------------------------------- | :----------------------------------------------------------- |
| `pk=True`       | 设置为主键                       | `id = fields.IntField(pk=True)`                              |
| `null=True`     | 允许数据库为 NULL                | `email = fields.CharField(max_length=100, null=True)`        |
| `default`       | Python 层面默认值                | `status = fields.CharField(max_length=20, default="active")` |
| `db_default`    | 数据库层面默认值（SQL 表达式）   | `status = fields.CharField(max_length=20, db_default="'active'")` |
| `unique=True`   | 唯一约束                         | `username = fields.CharField(max_length=50, unique=True)`    |
| `db_index=True` | 创建索引                         | `email = fields.CharField(max_length=100, db_index=True)`    |
| `description`   | 字段注释（文档用）               | `id = fields.IntField(pk=True, description="用户ID")`        |
| `source_field`  | 数据库列名（与 Python 属性不同） | `name = fields.CharField(max_length=50, source_field="user_name")` |



#### 🔗 关系字段

| 字段类                   | 数据库实现               | 说明   | 必填参数 |
| :----------------------- | :----------------------- | :----- | :------- |
| `fields.ForeignKeyField` | `FOREIGN KEY`            | 多对一 | `to`     |
| `fields.OneToOneField`   | `FOREIGN KEY` + `UNIQUE` | 一对一 | `to`     |
| `fields.ManyToManyField` | 中间表                   | 多对多 | `to`     |

``` python
class User(Model):
    id = fields.IntField(pk=True)

class Post(Model):
    author = fields.ForeignKeyField("models.User", related_name="posts")
    content = fields.TextField()

class UserProfile(Model):
    user = fields.OneToOneField("models.User", related_name="profile")
    bio = fields.TextField()

class Tag(Model):
    name = fields.CharField(max_length=50)
    posts = fields.ManyToManyField("models.Post", related_name="tags")
```

**外键（ForeignKey）默认永远指向目标表的主键（Primary Key）, **通过 **`to_field`** 参数指定关联到目标表的其他唯一字段。

- `to`:

  相关模型，或以 `'*app*.*model*'` 格式表示的相关模型名称。

以下是可选的

- `through`:

  表示中间表的数据库表名。使用默认值通常是安全的。

- `forward_key`:

  中间表上的正向查找键。使用默认值通常是安全的。

- `backward_key`:

  中间表上的反向查找键。使用默认值通常是安全的。

- `related_name`:

  相关模型上的属性名称，用于反向解析多对多关系。

- `db_constraint`:

  控制是否应在数据库中为此外键创建约束。默认为 True，这几乎肯定是你想要的；将其设置为 False 对数据完整性可能非常不利。

- `unique`:

  控制是否应在数据库中创建唯一索引以加速查询。默认为 True。如果你想允许重复记录，请将其设置为 False。



## Depends

在 FastAPI 中，`Depends` 是一个核心功能，用于实现**依赖注入（Dependency Injection）**。简单来说，它允许你声明你的代码（比如一个API接口）运行时需要什么（比如数据库会话、当前用户），然后由 FastAPI 框架自动为你准备好并“注入”进来。



# 基础与核心概念

FastAPI 的成功并非偶然，它巧妙地站在了“巨人”的肩膀上。理解下面这两个“巨人”，你就理解了 FastAPI 的设计灵魂：

- **Starlette（ASGI 框架）**：负责处理网络请求和响应。你可以把它看作 FastAPI 的 **“Web 服务器引擎”**。
- **Pydantic（数据验证库）**：负责定义数据结构、验证和序列化。它是 FastAPI 的 **“数据质检员”**。



## **框架基础与哲学**

**关键概念：ASGI vs WSGI**

- **WSGI**（如 Flask/Django）是同步的。每个请求处理完，才能处理下一个，适合 I/O 密集型但并发量不高的场景。
- **ASGI**（如 FastAPI）是异步的。它支持 `async/await`，在处理 I/O 等待时（如查数据库、调外部 API）可以切换去做别的事，**并发能力极强**。

## **环境搭建与起步**

#  请求与响应处理

## **路由与参数**

## **响应处理**

# 核心功能与进阶

## **Pydantic 数据验证（核心）**

## **依赖注入系统 (Dependency Injection)**

## **异步编程 (Asynchronous Programming)**

## **中间件 (Middleware)**

# 安全、数据库与生产部署

## **安全与认证**

- **OAuth2**：FastAPI 内置对 **OAuth2** 协议的支持。
- **JWT**：常与 OAuth2 的密码流配合，实现基于 **JWT（JSON Web Token）** 的用户认证。
- **工具**：使用 `OAuth2PasswordBearer`、`HTTPBearer` 等安全工具

## **数据库集成**

- **ORM**：常与 **SQLAlchemy** 或 **Tortoise-ORM** 集成。
- **操作**：在依赖项中获取数据库会话，执行 CRUD（增删改查）操作。
- **迁移**：使用 **Alembic** 管理数据库 schema 的变更。

## **API 文档**

- **自动生成**：访问 `/docs` 查看 Swagger UI，访问 `/redoc` 查看 ReDoc 文档。
- **配置**：可在 `FastAPI()` 初始化时自定义文档标题、描述等。

# **测试与部署**

**WebSocket**：FastAPI 支持 WebSocket，可用于构建实时应用

**后台任务**：使用 `BackgroundTasks` 处理如发送邮件等轻量级后台任务

**APIRouter**：使用 `APIRouter` 对路由进行模块化管理，构建大型应用

**事件处理**：使用 `@app.on_event("startup")` 和 `@app.on_event("shutdown")` 处理应用启动和关闭时的逻辑





# 路径参数

使用 Python 字符串格式化相同的语法声明路径“**参数**”或“**变量**”

``` python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}
```

路径参数 `item_id` 的值会作为参数 `item_id` 传递给你的函数。



## 声明路径参数的类型

``` python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```



## 预设值

路径参数有时候需要固定值，防止调用者过于分散；采用枚举 Enum；

``` python
from enum import Enum

from fastapi import FastAPI


class ModelName(str, Enum):
    s_1 = "1"
    s_2 = "2"
    s_3 = "3"


@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
  if model_name is ModelName.s_1:
      return {"model_name": model_name, "message": "深度学习！"}

  if model_name.value == "s_3":
      return {"model_name": model_name, "message": "所有的图片"}

  return {"model_name": model_name, "message": "有一些残差"}
```



## 小结

直观的 Python 标准类型声明，**FastAPI** 可以获得：编辑器支持：错误检查，代码自动补全等,数据校验,API 注解和自动文档;



# 查询参数

声明的参数不是路径参数时，路径操作函数会把该参数自动解释为“查询”参数。

``` python
from fastapi import FastAPI

app = FastAPI()

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```



## 可选参数

把默认值设为 `None` 即可声明可选的查询参数

``` python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}
```

**FastAPI** 可以识别出 `item_id` 是路径参数，`q` 不是路径参数，而是查询参数。



## 多个路径和查询参数

**FastAPI** 可以识别同时声明的多个路径参数和查询参数。

而且声明查询参数的顺序并不重要。

``` python
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int, item_id: str, q: str | None = None, short: bool = False
):
    item = {"item_id": item_id, "user_id": user_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update(
            {"description": "这是一个令人惊奇的项目，有很长的描述"}
        )
    return item
```



# 请求体

**请求体**是客户端发送给你的 API 的数据。**响应体**是你的 API 发送给客户端的数据。

API 几乎总是需要发送**响应体**。但客户端不一定总是要发送**请求体**，有时它们只请求某个路径，可能带一些查询参数，但不会发送请求体。

使用 [Pydantic](https://pydantic.dev/docs/) 模型来声明**请求体**，能充分利用它的功能和优点。

发送数据应使用以下之一：`POST`（最常见）、`PUT`、`DELETE` 或 `PATCH`。

规范中没有定义用 `GET` 请求发送请求体的行为，但 FastAPI 仍支持这种方式，只用于非常复杂/极端的用例。

由于不推荐，在使用 `GET` 时，Swagger UI 的交互式文档不会显示请求体的文档，而且中间的代理可能也不支持它。



## 创建数据模型

把数据模型声明为继承 `BaseModel` 的类。

``` python
from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


@app.post("/items/")
async def create_item(item: Item):
    return item
```



## 请求体 + 路径参数

可以同时声明路径参数和请求体

``` python
from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.model_dump()}
```



## 请求体 + 路径 + 查询参数

可以同时声明**请求体**、**路径**和**查询**参数。

``` python
from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item, q: str | None = None):
    result = {"item_id": item_id, **item.model_dump()}
    if q:
        result.update({"q": q})
    return result
```



# 查询参数和字符串校验

**FastAPI** 允许你为参数声明额外的信息和校验。

## 额外校验

``` python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items/")
async def read_items(q: Annotated[str | None, Query(max_length=50)] = None):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```

在 `Annotated` 中添加 `Query`，并把参数 `max_length` 设为 `50`：

注意默认值依然是 `None`，所以该参数仍是可选的。

但现在把 `Query(max_length=50)` 放到 `Annotated` 里，我们就在告诉 FastAPI，这个值需要**额外校验**，最大长度为 50 个字符。



## 自定义校验

有些情况下你需要做一些无法通过上述参数完成的**自定义校验**。

``` python
import random
from typing import Annotated

from fastapi import FastAPI
from pydantic import AfterValidator

app = FastAPI()

data = {
    "isbn-9781529046137": "The Hitchhiker's Guide to the Galaxy",
    "imdb-tt0371724": "The Hitchhiker's Guide to the Galaxy",
    "isbn-9781439512982": "Isaac Asimov: The Complete Stories, Vol. 2",
}


def check_valid_id(id: str):
    if not id.startswith(("isbn-", "imdb-")):
        raise ValueError('Invalid ID format, it must start with "isbn-" or "imdb-"')
    return id


@app.get("/items/")
async def read_items(
    id: Annotated[str | None, AfterValidator(check_valid_id)] = None,
):
    if id:
        item = data.get(id)
    else:
        id, item = random.choice(list(data.items()))
    return {"id": id, "name": item}
```



## 路径参数和数值校验

与使用 `Query` 为查询参数声明更多的校验和元数据的方式相同，你也可以使用 `Path` 为路径参数声明相同类型的校验和元数据。

``` python
from typing import Annotated

from fastapi import FastAPI, Path, Query

app = FastAPI()


@app.get("/items/{item_id}")
async def read_items(
    item_id: Annotated[int, Path(description="这是要获取的项目的ID")],
    q: Annotated[str | None, Query(alias="item-query")] = None,
):
    results = {"item_id": item_id}
    if q:
        results.update({"q": q})
    return results
```



# 查询参数模型

如果你有一组具有相关性的**查询参数**，你可以创建一个 **Pydantic 模型**来声明它们。

这将允许你在**多个地方**去**复用模型**，并且一次性为所有参数声明验证和元数据



## 使用 Pydantic 模型的查询参数

在一个 **Pydantic 模型**中声明你需要的**查询参数**，然后将参数声明为 `Query`：

``` python
from typing import Annotated, Literal

from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI()


class FilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)
    order_by: Literal["created_at", "updated_at"] = "created_at"
    tags: list[str] = []


# http://127.0.0.1:8001/items/?limit=50&offset=1&tags=%271%27,%20%272%27&order_by=created_at
@app.get("/items/")
async def read_items(filter_query: Annotated[FilterParams, Query()]):
    return filter_query

if __name__ == '__main__':
    import uvicorn

    uvicorn.run('demo:app', host="127.0.0.1", port=8001, reload=True)

```



# 请求体 - 多个参数

``` python
from typing import Annotated

from fastapi import FastAPI, Path, Query, Body
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


@app.put("/items/{item_id}")
async def update_item(
    item_id: Annotated[int, Path(description="路径参数", ge=0, le=1000)],
    q: Annotated[str | None, Query(description="p查询参数", max_length=32, min_length=1)],
    item: Annotated[Item | None, Body(description="请求体参数")],
):
    results = {"item_id": item_id}
    if q:
        results.update({"q": q})
    if item:
        results.update({"item": item})
    return results
```



## 请求体中的单一值

与使用 `Query` 和 `Path` 为查询参数和路径参数定义额外数据的方式相同，**FastAPI** 提供了一个同等的 `Body`。

``` python
from typing import Annotated

from fastapi import Body, FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


class User(BaseModel):
    username: str
    full_name: str | None = None


@app.put("/items/{item_id}")
async def update_item(
        item_id: int,
        item: Annotated[Item, Body()],
        user: Annotated[User, Body()],
        importance: Annotated[int, Body()]
):
    results = {"item_id": item_id, "item": item, "user": user, "importance": importance}
    return results

```

`Body` 同样具有与 `Query`、`Path` 以及其他后面将看到的类完全相同的额外校验和元数据参数。



## 嵌入单个请求体参数

假设你只有一个来自 Pydantic 模型 `Item` 的请求体参数 `item`。

默认情况下，**FastAPI** 将直接期望这样的请求体。

但是，如果你希望它期望一个拥有 `item` 键并在值中包含模型内容的 JSON，就像在声明额外的请求体参数时所做的那样，则可以使用一个特殊的 `Body` 参数 `embed`：

``` python
item: Annotated[Item, Body(embed=True)]

```

``` python
from typing import Annotated

from fastapi import Body, FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Annotated[Item, Body(embed=True)]):
    results = {"item_id": item_id, "item": item}
    return results
```

在这种情况下，**FastAPI** 将期望像这样的请求体：

``` json
{
    "item": {
        "name": "Foo",
        "description": "The pretender",
        "price": 42.0,
        "tax": 3.2
    }
}
```

而不是：

``` json
{
    "name": "Foo",
    "description": "The pretender",
    "price": 42.0,
    "tax": 3.2
}
```



# 请求体 - 字段

与在*路径操作函数*中使用 `Query`、`Path` 、`Body` 声明校验与元数据的方式一样，可以使用 Pydantic 的 `Field` 在 Pydantic 模型内部声明校验和元数据。

``` python
from typing import Annotated

from fastapi import Body, FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = Field(
        default=None, title="The description of the item", max_length=300
    )
    price: float = Field(gt=0, description="The price must be greater than zero")
    tax: float | None = None


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Annotated[Item, Body(embed=True)]):
    results = {"item_id": item_id, "item": item}
    return results
```



# 请求体 - 嵌套模型

可以定义、校验、记录文档并使用任意深度嵌套的模型

``` python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Image(BaseModel):
    url: str
    name: str


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: set[str] = set()
    image: Image | None = None


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    results = {"item_id": item_id, "item": item}
    return results
```



## 特殊的类型和校验

除了普通的单一值类型（如 `str`、`int`、`float` 等）外，你还可以使用从 `str` 继承的更复杂的单一值类型。

要了解所有的可用选项，请查看 [Pydantic 的类型概览](https://pydantic.dev/docs/validation/latest/concepts/types/)。你将在下一章节中看到一些示例。

例如，在 `Image` 模型中我们有一个 `url` 字段，我们可以把它声明为 Pydantic 的 `HttpUrl`，而不是 `str`：

``` python
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()


class Image(BaseModel):
    url: HttpUrl
    name: str


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: set[str] = set()
    image: Image | None = None


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    results = {"item_id": item_id, "item": item}
    return results
```



## 深度嵌套模型

可以定义任意深度的嵌套模型：

``` python
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()


class Image(BaseModel):
    url: HttpUrl
    name: str


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: set[str] = set()
    images: list[Image] | None = None


class Offer(BaseModel):
    name: str
    description: str | None = None
    price: float
    items: list[Item]


@app.post("/offers/")
async def create_offer(offer: Offer):
    return offer
```



# 示例数据

通过示例让对接者更直观的知道请求体内容

``` python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

    model_config = ConfigDict(json_schema_extra={
        "examples": [
            {
                "name": "Foo",
                "description": "一个非常好的项目",
                "price": 35.4,
                "tax": 3.2,
            }
        ]
    })


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    results = {"item_id": item_id, "item": item}
    return results

```

![image-20260822134107949](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260822134107949.png)

## `Field` 的附加examples

``` python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    name: str = Field(examples=["Foo"])
    description: str | None = Field(default=None, examples=["A very nice Item"])
    price: float = Field(examples=[35.4])
    tax: float | None = Field(default=None, examples=[3.2])


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    results = {"item_id": item_id, "item": item}
    return results
```



## 带有多个 `examples`

``` python
from typing import Annotated

from fastapi import Body, FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


@app.put("/items/{item_id}")
async def update_item(
    *,
    item_id: int,
    item: Annotated[
        Item,
        Body(
            openapi_examples={
                "a1_随便写": {
                    "summary": "一个正常的例子",
                    "description": "一个**正常的**项目工作正常。",
                    "value": {
                        "name": "Foo",
                        "description": "一个非常好的项目",
                        "price": 35.4,
                        "tax": 3.2,
                    },
                },
                "a2_随便写": {
                    "summary": "一个转换数据的示例",
                    "description": "FastAPI可以自动将价格“字符串”转换为实际的“数字”",
                    "value": {
                        "name": "Bar",
                        "price": "35.4",
                    },
                },
                "a3_随便写": {
                    "summary": "无效数据被拒绝，并出现错误",
                    "value": {
                        "name": "Baz",
                        "price": "三十五分四",
                    },
                },
                "a4_随便写": {
                    "summary": "z1z1z1z1z1z1z1",
                    "description": "这个z1z1z1示例将被忽略",
                    "value": {
                        "name": "Z",
                        "price": 10.0,
                    },
                },
            },
        ),
    ],
):
    results = {"item_id": item_id, "item": item}
    return results
```

`examples` 中每个具体示例的 `dict` 可以包含：

- `summary`：该示例的简短描述。
- `description`：较长描述，可以包含 Markdown 文本。
- `value`：实际展示的示例，例如一个 `dict`。
- `externalValue`：`value` 的替代项，指向该示例的 URL。不过它的工具支持度可能不如 `value`。

![image-20260822134903697](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260822134903697.png)

# Cookie

``` python
from typing import Annotated

from fastapi import Cookie, FastAPI

app = FastAPI()


@app.get("/items/")
async def read_items(ads_id: Annotated[str | None, Cookie()] = None):
    return {"ads_id": ads_id}
```

![image-20260822141705597](/Users/zhangjiewu/Library/Application Support/typora-user-images/image-20260822141705597.png)



## 参数模型

如果你有一组相关的 **cookie**，你可以创建一个 **Pydantic 模型**来声明它们

``` python
from typing import Annotated

from fastapi import Cookie, FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Cookies(BaseModel):
    session_id: Annotated[str, Field(description="会话ID cookie")]
    fatebook_tracker: Annotated[str | None, Field(description="Fatebook追踪器 cookie")] = None
    googall_tracker: Annotated[str | None, Field(description="Googall追踪器 cookie")] = None


@app.get("/items/")
async def read_items(cookies: Annotated[Cookies, Cookie()]):
    return cookies
```



# Header

``` python
from typing import Annotated

from fastapi import FastAPI, Header

app = FastAPI()


@app.get("/items/")
async def read_items(
    strange_header: Annotated[str | None, Header(convert_underscores=False)] = None,
):
    return {"strange_header": strange_header}
```

##  使用 Pydantic 模型的 Header 参数

``` python
from typing import Annotated

from fastapi import FastAPI, Header
from pydantic import BaseModel

app = FastAPI()


class CommonHeaders(BaseModel):
    token: str


@app.get("/items/")
async def read_items(headers: Annotated[CommonHeaders, Header()]):
    print(headers.token)
    return {
        "data": headers
    }
```



# 响应模型 - 返回类型

 通过为*路径操作函数*的**返回类型**添加注解来声明用于响应的类型。和为输入数据在函数**参数**里做类型注解的方式相同，你可以使用 Pydantic 模型、`list`、`dict`、以及整数、布尔值等标量类型。

``` python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: list[str] = []


@app.post("/items/")
async def create_item(item: Item) -> Item:
    return item
```

## `response_model` 参数

在一些情况下，你需要或希望返回的数据与声明的类型不完全一致。

例如，你可能希望**返回一个字典**或数据库对象，但**将其声明为一个 Pydantic 模型**。这样 Pydantic 模型就会为你返回的对象（例如字典或数据库对象）完成文档、校验等工作。

如果你添加了返回类型注解，工具和编辑器会（正确地）报错，提示你的函数返回的类型（例如 `dict`）与声明的类型（例如一个 Pydantic 模型）不同。

在这些情况下，你可以使用*路径操作装饰器*参数 `response_model`，而不是返回类型。

你可以在任意*路径操作*中使用 `response_model` 参数：

- `@app.get()`
- `@app.post()`
- `@app.put()`
- `@app.delete()`
- 等等。

``` python


from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: list[str] = []


@app.post("/items/", response_model=Item)
async def create_item(item: Item) -> Any:
    return item
```

`response_model` 会具有优先级并由 FastAPI 使用。

# 响应状态码

``` python
from fastapi import FastAPI, status

app = FastAPI()


@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}
```



# 处理错误

``` python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from enum import IntEnum
from typing import Optional, Any
import datetime

app = FastAPI()


# ==================== 0. 定义数字错误码枚举 ====================
class BizCode(IntEnum):
    """业务错误码（纯数字）"""
    SUCCESS = 0

    # 通用错误 1000-1999
    UNKNOWN_ERROR = 1000
    VALIDATION_ERROR = 1001
    NOT_FOUND = 1002
    BAD_REQUEST = 1003
    UNAUTHORIZED = 1004
    FORBIDDEN = 1005

    # 用户模块 2000-2999
    USER_NOT_FOUND = 2001
    USER_ALREADY_EXISTS = 2002
    USER_PASSWORD_ERROR = 2003
    USER_NOT_LOGIN = 2004
    USER_PERMISSION_DENIED = 2005

    # 订单模块 3000-3999
    ORDER_NOT_FOUND = 3001
    ORDER_STATUS_ERROR = 3002
    INSUFFICIENT_BALANCE = 3003

    # 系统级错误 9000-9999
    DB_ERROR = 9001
    REDIS_ERROR = 9002
    THIRD_PARTY_ERROR = 9003
    SERVER_ERROR = 9999


# ==================== 1. 通用业务异常 ====================
class AppException(Exception):
    """
    通用业务异常
    使用示例：
        raise AppException(BizCode.USER_NOT_FOUND, "用户不存在")
        raise AppException(BizCode.VALIDATION_ERROR, "参数校验失败", data={"field": "email"})
    """

    def __init__(
            self,
            code: BizCode = BizCode.UNKNOWN_ERROR,
            message: Optional[str] = None,
            data: Optional[Any] = None,
            http_status_code: int = status.HTTP_200_OK,  # 默认固定为 200
    ):
        # 如果没传 message，自动从错误码枚举中获取默认消息
        if message is None:
            message = self._get_default_message(code)
        self.code = code
        self.message = message
        self.data = data
        self.http_status_code = http_status_code
        super().__init__(self.message)

    @staticmethod
    def _get_default_message(code: BizCode) -> str:
        """为常见错误码提供默认文案"""
        default_messages = {
            BizCode.SUCCESS: "操作成功",
            BizCode.VALIDATION_ERROR: "请求参数校验失败",
            BizCode.NOT_FOUND: "请求的资源不存在",
            BizCode.USER_NOT_FOUND: "用户不存在",
            BizCode.USER_ALREADY_EXISTS: "用户已存在",
            BizCode.USER_PASSWORD_ERROR: "密码错误",
            BizCode.USER_NOT_LOGIN: "请先登录",
            BizCode.USER_PERMISSION_DENIED: "权限不足",
            BizCode.ORDER_NOT_FOUND: "订单不存在",
            BizCode.INSUFFICIENT_BALANCE: "余额不足",
            BizCode.SERVER_ERROR: "服务器内部错误，请稍后重试",
        }
        return default_messages.get(code, "未知错误")


# ==================== 2. 快捷函数（可选，让代码更简洁） ====================
def raise_biz_error(code: BizCode, message: Optional[str] = None, data: Optional[Any] = None):
    """快捷抛出业务异常"""
    raise AppException(code=code, message=message, data=data)


# ==================== 3. 注册全局异常处理器 ====================

# 3.1 处理所有自定义的业务异常
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.http_status_code,
        content={
            "success": False,
            "code": exc.code,
            "message": exc.message,
            "data": exc.data,
            "path": request.url.path
        }
    )


# 3.2 处理 FastAPI 内置的 HTTP 异常
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    message = exc.detail or "请求处理失败"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": exc.status_code,
            "message": message,
            "data": None,
            "path": request.url.path,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    )


# 3.3 处理 Pydantic 参数校验失败异常 (RequestValidationError)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(l) for l in e["loc"]), "msg": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=200,
        content={
            "success": False,
            "code": BizCode.VALIDATION_ERROR,
            "message": "请求参数校验失败",
            "data": errors,
            "path": request.url.path,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    )


# 3.4 兜底处理所有未被捕获的系统异常
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # ⚠️ 生产环境务必记录完整的堆栈日志，方便排查 Bug
    # logger.error(f"Unhandled system exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,  # 改为 500
        content={
            "success": False,
            "code": BizCode.SERVER_ERROR,  # 9999
            "message": "服务器内部错误，请稍后重试",
            "data": None,
            "path": request.url.path,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    )


# ==================== 4. 在业务代码中使用 ====================

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    # 方式一：直接抛异常
    if user_id != 1:
        raise AppException(BizCode.USER_NOT_FOUND, f"用户 {user_id} 不存在")

    # 方式二：使用快捷函数（更简洁）
    # if user_id != 1:
    #     raise_biz_error(BizCode.USER_NOT_FOUND, f"用户 {user_id} 不存在")

    return {"user_id": user_id, "name": "FastAPI User"}


@app.post("/users")
async def create_user(username: str, password: str):
    if username == "admin":
        raise AppException(BizCode.USER_ALREADY_EXISTS, "用户名 admin 已被占用")

    if len(password) < 6:
        # 带附加数据
        raise AppException(
            BizCode.VALIDATION_ERROR,
            "密码长度不能少于6位",
            data={"min_length": 6}
        )

    return {"username": username, "message": "用户创建成功"}


@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    if order_id != 100:
        # 可以带附加数据
        raise AppException(
            BizCode.ORDER_NOT_FOUND,
            f"订单 {order_id} 不存在",
            data={"order_id": order_id, "status": "deleted"}
        )
    return {"order_id": order_id, "status": "paid"}

# ==================== 6. 模拟未定义路由（测试 404） ====================
# 访问 /not-exist 会触发 StarletteHTTPException，被统一转换为 200+错误码

```

# 路径操作配置



# 依赖注入

本质就是对重复性的代码进行复用封装；

``` python
from fastapi import FastAPI, Depends

app = FastAPI()


def get_current_user():
    return {"user": "3333"}


app.get('/user')


async def get_user_info(current_user: dict[str, str] = Depends(get_current_user)):
    # current_user = {"user": "3333"}, Depends 自动调用 get_current_user 函数
    return {"current_user": current_user.get("user", "default_user")}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

```

**有参数的形式**

``` python
from fastapi import FastAPI, Depends

app = FastAPI()


def get_current_user(a: str):
    return {"user": "3333", "a": a}


app.get('/user')
async def get_user_info(current_user: dict[str, str] = Depends(lambda: get_current_user("1234"))):
    # current_user = {"user": "3333"}, Depends 自动调用 get_current_user 函数
    return {"current_user": current_user.get("user", "default_user"), "a": current_user.get("a", "default_a")}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

```

**class**

``` python
from fastapi import FastAPI, Depends, Query
from typing import Annotated

app = FastAPI()

class Demo001:
    def __init__(self, a: Annotated[str, Query(max_length=10, description="这是一个查询参数")]):
        self.a = a

    def __str__(self):
        return f"Demo001(a={self.a})"


@app.get('/user')
async def get_user_info(cc: Demo001 = Depends()): # http://127.0.0.1:8001/user?a=xxx 自动转为查询参数
    print(cc)

    return {"current_user": "2", "a": cc.a}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('demo:app', host="127.0.0.1", port=8001, reload=True)

```





