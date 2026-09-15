# 字符串设置(set)

``` python
r.set("name", "小明")
```

**`SET ... EX`存值 + 倒计时，一步完成**

``` python
r.set("name", "小明", ex=10)
```



# 获取(get)

``` python
r.get("name")
```



# 过期时间(expire)

`EXPIRE` 的作用是**给一个已经存在的 key 设置过期时间**，时间到了 key 会自动删除。

```python
r.set("name", "小明")
r.expire("name", 10)   # 10秒后自动删除
```



# TTL(剩余存活时间)

`TTL` 命令返回一个 key **还有多少秒会被删除**。

```python
r.set("name", "小明", ex=30) # 设置  name 过期时间 30 秒
r.ttl("name")   # 返回剩余秒数，比如 28
```

**返回值的含义**

| 返回值          | 含义                           |
| :-------------- | :----------------------------- |
| 正数（比如 25） | 还有 25 秒删除                 |
| `-1`            | 永远不过期（没有设置过期时间） |
| `-2`            | key 已经不存在了               |



# 取消过期-设为永久(persist)

``` python
r.persist("user:1")   # 移除过期时间，变成永久
```



# 删除(delete)

```python
r.set("name", "小明")
r.delete("name")   # 或 r.delete("name", "age") 删除多个

r.delete("name", "age")
```

**返回值的含义**返回一个整数：**成功删除了多少个 key**。如果删除不存在的key 则返回0；



**和过期删除的区别**

| 方式         | 触发条件         | 命令                    |
| :----------- | :--------------- | :---------------------- |
| **过期删除** | 时间到了自动删除 | `EXPIRE` / `SET ... EX` |
| **手动删除** | 你主动执行       | `DEL key`               |



# 检查(exists)

```python
r.set("name", "小明")
r.exists("name")   # 返回 1（存在）
r.delete("name")
r.exists("name")   # 返回 0（不存在）
```

**返回值的含义**

| 返回值          | 含义       |
| :-------------- | :--------- |
| `1`（或大于 1） | key 存在   |
| `0`             | key 不存在 |

**一次检查多个 key**

``` python
r.exists("a", "b", "c")
```



# 数字

## 自增(incr)

```python
r.set("count", 0)
r.incr("count")   # 返回 1
r.incr("count")   # 返回 2
r.get("count")    # 返回 "2"
```

**如果 key 不存在怎么办？**

`INCR` 会自动**先创建 key，初始值为 0，然后加 1**：

```bash
INCR new_counter   # 返回 1（自动创建并加 1）
```



## 自减(decr)

`DECR` 是 `INCR` 的反向操作：**把 key 中存储的数字减 1**。

```python
r.set("count", 10)
r.decr("count")   # 返回 9
r.decr("count")   # 返回 8
```

## 增加指定数值(incrby)

```python
r.set("score", 100)
r.incrby("score", 5)    # 返回 105
r.incrby("score", 10)   # 返回 115
```



## 减少指定数值(decrby)

`DECRBY` 可以**一次性减少任意整数**。

```python
r.set("stock", 50)
r.decrby("stock", 3)    # 返回 47
r.decrby("stock", 10)   # 返回 37
```



# 字符串

## 追加内容(append)

`APPEND` 可以在**已有字符串的末尾**拼接新内容。

```python
r.set("greeting", "Hello")
r.append("greeting", " World")   # 返回 11
r.get("greeting")                # 返回 "Hello World"
```

如果 key 不存在，`APPEND` 会**自动创建**这个 key，相当于执行 `SET`。

## 获取长度(strlen)

`STRLEN` 返回 key 中字符串值的**字节长度**（通常等于字符个数）。

```python
r.set("name", "小明")
r.strlen("name")   # 返回 6
```

## 存在则不发送

``` python
locked = await r.set(lock_key, "locked", ex=10, nx=True)
```

用于锁，如果内存中有  “lock_key” ，则不会设置；不管调用执行多少次，只有在失效时间之内；





# 哈希

可以把它理解成 Python 里的 **字典（dict）**，或者前端里的 **对象（Object）**。



## 设置获取(hset单个存值，hget单个获取)

```python
# 存
r.hset(name="user:1", key="name", value="小明") # 建议用 `业务:ID:字段` 的格式

# 取
r.hget(name="user:1", key="name")   # 返回 "小明"
```

**对比一下**

| 数据类型   | 存                        | 取                 | 适合存什么       |
| :--------- | :------------------------ | :----------------- | :--------------- |
| **字符串** | `SET user:1:name "小明"`  | `GET user:1:name`  | 单个值           |
| **哈希**   | `HSET user:1 name "小明"` | `HGET user:1 name` | 一组字段（对象） |

哈希的好处是：**一个 key 里可以存多个字段**，方便管理。

另外 **起名是自由的，但建议用 `业务:ID:字段` 的格式，方便自己和别人看。**



## 存值(hset)

不用一个一个 `HSET`，可以**一次存多个字段**。

```python
r.hset("user:1", mapping={"name": "小明", "age": 18, "city": "北京"})
```

和之前 `HSET user:1 name "小明"` 一样，但这一条命令存了三个字段，更高效。



## 批量-取值(hmget)

不用一个一个 `HGET`，可以**一次取多个字段**。

```python
r.hmget("user:1", ["name", "age", "city"])
# 返回 ["小明", "18", "北京"]

name, age = await r.hmget("user:1", ["name", "age"])
```



## 取值-键值对(hgetall)

如果你**想取出所有字段和值**，用 `HGETALL`。

```python
r.hgetall("user:1")
# 返回 {"name": "小明", "age": "18", "city": "北京"}
```



## 删除字段(hdel)

**删除一个字段**

``` python
r.hdel("user:1", "age")   # 删除 age 字段
```

**一次删除多个字段**

``` python
r.hdel("user:1", "name", "city")
```

**返回值**

- 返回**成功删除了多少个字段**。

## 检查(hexists)

```python
r.hexists(name="user:1", key="name")   # 返回 True
r.hexists(name="user:1", key="city")   # 返回 False
```

| 返回值        | 含义       |
| :------------ | :--------- |
| `1` / `True`  | 字段存在   |
| `0` / `False` | 字段不存在 |

**返回值：布尔值**



## 获取所有字段名(hkeys)

```python
r.hkeys("user:1")   # 返回 ["name", "age", "city"]
```

**返回值：列表**



## 获取出所有值(hvals)

``` python
r.hvals("user:1")   # 返回 ["小明", "18", "北京"]
```

**返回值：列表**



## **数值自增**自减(hincrby)

`HINCRBY` 用于**对哈希中某个字段的值进行加减**（必须是数字）。

**命令行：**

```bash
HSET user:1 name "小明" age 18
HINCRBY user:1 age 1    # age 从 18 变成 19，返回 19
HINCRBY user:1 age 5    # age 从 19 变成 24，返回 24
HINCRBY user:1 age -3   # age 从 24 变成 21，返回 21（减 3）
```



**Python：**

```python
r.hset("user:1", mapping={"name": "小明", "age": 18})
r.hincrby("user:1", "age", 1)    # 返回 19
r.hincrby("user:1", "age", 5)    # 返回 24
r.hincrby("user:1", "age", -3)   # 返回 21 
```



# 列表

列表是一个**有序的字符串列表**，你可以从**左边**或**右边**插入元素。

可以把它理解成 Python 里的 **列表（list）**，或者前端里的 **数组（Array）**。



## 插入(lpush)

**命令行：**

```bash
LPUSH queue "task1"   # 从左边插入 "task1"
RPUSH queue "task2"   # 从右边插入 "task2"
```



**Python：**

```python
r.lpush("queue", "task1")   # 从左边插入
r.rpush("queue", "task2")   # 从右边插入
```



## **取值**(lrange)

``` python
r.lrange(name="mylist", start=0, end=10) # start=下标开始包含下标， end=下标结束包含下标；  
```

**取所有**

```python
r.lrange(name="mylist", start=0, end=-1)
```



## **出栈**(lpop, rpop)

``` python
await r.lpop("queue")
await r.rpush("queue", "A", "B", "C")
await r.lpop("queue")  # 返回 "A"
await r.lpop("queue")  # 返回 "B"
await r.lrange("queue", 0, -1) # ['C']


r.rpush("queue", "A", "B", "C")
r.rpop("queue")   # 返回 "C"
r.rpop("queue")   # 返回 "B"
await r.lrange("queue", 0, -1) # ['A']
```



## 获取列表长度(llen)

返回列表中**元素的总个数**。

``` python
r.rpush("mylist", "a", "b", "c")
r.llen("mylist")   # 返回 3

r.lpop("mylist")
r.llen("mylist")   # 返回 2
```



## 阻塞弹出(blpop, brpop)

`LPOP` 和 `RPOP` 是**立刻返回**，如果列表为空，返回 `None`。
`BLPOP` 和 `BRPOP` 是**阻塞等待**，如果列表为空，它会**一直等**，直到有元素进来。

``` python
# 等待 30 秒，如果 30 秒内没有元素进来，返回 None
result = r.blpop("queue", timeout=30)
# result 是一个元组 (key, value)，比如 ("queue", "task1")
```



# **集合**

可以把它理解成 Python 里的 **`set`**，或者前端里的 **`Set`**。



##  添加(sadd)

``` python
    s = await r.sadd("colors", "red") # 1
    print(s) # 1
    s = await r.sadd("colors", "blue") # 1
    print(s) # 1
    s = await r.sadd("colors", "red")  # 重复添加，返回 0（表示没有新元素加入）
    print(s) # 0 
    s = await r.smembers("colors")  # 返回 {"red", "blue"}（集合，顺序不固定）
    print(s) # {'blue', 'red'}
    
    s = await r.sadd("colors", "red", "pink") # 交集
    
```



## 交集(sinter)

交集就是**找出多个集合中共同存在的元素**。

``` python

r.sadd("set1", "a", "b", "c")
r.sadd("set2", "b", "c", "d")
r.sinter("set1", "set2")   # 返回 ["b", "c"]
```



## 并集(sunion)

合并所有元素，自动去重

``` python
r.sadd("set1", "a", "b", "c")
r.sadd("set2", "b", "c", "d")
r.sunion("set1", "set2")   # 返回 ["a", "b", "c", "d"]
```



## 差集(sdiff)

在第一个集合里，但不在其他集合里

``` python
r.sadd("set1", "a", "b", "c")
r.sadd("set2", "b", "c", "d")

r.sdiff("set1", "set2")   # 返回 ["a"]
r.sdiff("set2", "set1")   # 返回 ["d"]
```





## 查看(smembers)

``` python
s = await r.smembers("colors")  # {'blue', 'red', 'pink'}
print(s)  # {'red', 'blue', 'pink'}
```



## **删除**(srem)

``` python
r.sadd("tags", "python", "redis", "fastapi")
r.srem("tags", "redis")   # 返回 1
r.smembers("tags")        # 返回 {"python", "fastapi"}
```



## 检查(sismember)

``` python
r.sismember("tags", "python")   # 返回 True
r.sismember("tags", "java")     # 返回 False
```



# **有序集合**



# **Streams**





# **发布/订阅**





# **Lua 脚本** 





# 管道（Pipeline）：批量操作

### 场景

你需要一次性设置 100 个缓存 key。如果逐个发送命令：

- 每次都要等待网络往返（客户端 → 服务器 → 客户端）
- 100 次操作 → 100 次网络延迟

用管道：

- 一次性发送 100 个命令
- 服务器一次性执行，一次性返回结果
- **1 次网络延迟**

------

### 没有管道（逐个发送）

```python
import redis
r = redis.Redis(decode_responses=True)

for i in range(100):
    r.set(f"key:{i}", f"value:{i}")   # 每个命令都等一次网络往返
```



------

### 有管道（批量发送）

```python
import redis
r = redis.Redis(decode_responses=True)

# 创建管道
pipe = r.pipeline()

# 把命令添加到管道（不立即执行）
for i in range(100):
    pipe.set(f"key:{i}", f"value:{i}")

# 一次性执行所有命令
results = pipe.execute()

# results 是一个列表，包含每个命令的返回值
print(f"成功执行 {len(results)} 个命令")
```



------

### 管道返回值的顺序

`pipe.execute()` 返回一个列表，顺序和添加命令的顺序一致。

```python
pipe = r.pipeline()
pipe.set("name", "小明")        # 返回 True
pipe.set("age", 18)            # 返回 True
pipe.get("name")               # 返回 "小明"
pipe.get("age")                # 返回 "18"

results = pipe.execute()
print(results)  # 输出 [True, True, "小明", "18"]
```



### 存储

``` python
    # 批量设置 5 个 key
    pipe = await r.pipeline()
    for i in range(5):
        pipe.set(f"test:{i}", f"value:{i}")
    await pipe.execute()
```



### 获取

``` python
pipe = r.pipeline()
for i in range(5):
    pipe.get(f"test:{i}")
results = pipe.execute()
print(results)  # 输出 ['value:0', 'value:1', ...]
```





------

### 什么时候用管道？

| 场景                                         | 是否用管道   |
| :------------------------------------------- | :----------- |
| 批量设置缓存                                 | ✅ 强烈推荐   |
| 批量删除 key                                 | ✅ 强烈推荐   |
| 批量读取数据                                 | ✅ 强烈推荐   |
| 只执行 1-2 个命令                            | ❌ 没必要     |
| 命令之间有依赖（后面命令需要前面命令的结果） | ❌ 不能用管道 |

------

### 注意

管道**不保证原子性**。如果管道中间某个命令失败，前面的已经执行了，后面的可能继续执行。如果需要原子性，要用**事务**。



# **事务**

管道是为了**快**，事务是为了**不被插队**。

### 概念

事务把多个命令打包，保证：

- **按顺序执行**（和管道一样）
- **中间不会被其他客户端的命令打断**（管道的命令执行过程中，可能被别的客户端的命令插进来，事务不会）

------

### 一个场景

用户 A 给用户 B 转账 100 元。需要执行两步：

1. A 的余额减 100
2. B 的余额加 100

这两步**必须连着执行**，中间不能被其他命令打断（否则可能出现 A 钱扣了，B 还没加上，中间被查账看到不一致）。

------

### 代码示例

```python
import redis
r = redis.Redis(decode_responses=True)

# 初始化账户
r.set("account:A", 500)
r.set("account:B", 300)

# 事务：A 减 100，B 加 100
pipe = r.pipeline(transaction=True)  # transaction=True 开启事务

pipe.decrby("account:A", 100)   # A 减 100
pipe.incrby("account:B", 100)   # B 加 100

# 执行事务
results = pipe.execute()
print(results)  # 输出 [400, 400]（两个命令的返回值）

print(r.get("account:A"))  # "400"
print(r.get("account:B"))  # "400"
```



------

### 事务和管道的区别

|            | 管道（Pipeline）           | 事务（Transaction）          |
| :--------- | :------------------------- | :--------------------------- |
| 目的       | 减少网络往返，提升性能     | 保证命令按顺序、不间断执行   |
| 是否被打断 | 可能被其他客户端命令插进来 | 不会被打断                   |
| 用法       | `pipeline()`               | `pipeline(transaction=True)` |

------

### ⚠️ 重要：Redis 事务不支持回滚

如果事务里某个命令执行失败（比如你对字符串做了 `incrby`），**其他命令仍然会执行**，不会撤回。

```python
r.set("key1", 100)
r.set("key2", 200)

pipe = r.pipeline(transaction=True)
pipe.incrby("key1", 10)     # 成功，key1 变成 110
pipe.lpush("key1", "abc")   # 失败，因为 key1 是字符串，不是列表
pipe.incrby("key2", 10)     # 成功，key2 变成 210

results = pipe.execute()
# 返回 [110, 错误, 210]
# 注意：虽然中间失败了，但前后命令都执行了，没有回滚
```



所以在业务层，你需要自己判断是否要回滚（比如记录日志、手动修正）。

------

### 🧪 什么时候用事务？

- **转账**：A 减钱，B 加钱
- **库存扣减**：检查库存 → 扣库存 → 记录订单（这三步要连着执行）
- **计数器更新**：同时更新多个统计指标



# 规范



## Key 命名规范

用冒号 : 分隔层级，做到见名知义。

```python
r.set("cache:user:info:1001", "{...}")       # 用户信息缓存
r.set("session:user:1001", "{...}")          # 用户会话
r.set("ratelimit:login:192.168.1.1", 5)      # 登录限流
r.set("lock:order:20240901", "locked")       # 分布式锁
r.set("counter:article:views:888", 100)      # 文章阅读数
```



## 过期时间（TTL）必须设置

**几乎所有 key 都要设置过期时间。**

``` python
# 缓存类：1 小时
r.set("cache:product:1001", "data", ex=3600)

# Session：2 小时
r.set("session:user:1001", "data", ex=7200)

# 限流：1 分钟
r.set("ratelimit:login:192.168.1.1", 5, ex=60)

# 分布式锁：10 秒
r.set("lock:order:123", "locked", ex=10, nx=True)

# 验证码：5 分钟
r.set("sms:code:13800138000", "123456", ex=300)
```

Redis 是内存数据库，不设过期时间会撑爆内存

防止业务异常导致 key 残留



## 连接池配置

**生产环境必须配置连接池。**

``` python
import redis

r = redis.Redis(
    host='localhost',
    port=6379,
    password='123456',
    db=0,
    decode_responses=True,
    max_connections=20,              # 连接池大小
    socket_timeout=5,                # 命令超时（秒）
    socket_connect_timeout=3,        # 连接超时（秒）
    retry_on_timeout=True,           # 超时自动重试
    health_check_interval=30,        # 空闲连接健康检查（秒）
    socket_keepalive=True,           # TCP Keepalive
)
```



## 禁用 `KEYS`，使用 `SCAN`

**`KEYS` 会阻塞 Redis，生产环境禁用。用 `SCAN` 代替。**

``` python
def scan_keys(pattern: str, count: int = 100):
    """安全的 key 扫描"""
    cursor = 0
    keys = []
    while True:
        cursor, batch = r.scan(cursor, match=pattern, count=count)
        keys.extend(batch)
        if cursor == 0:
            break
    return keys

# 用法
keys = scan_keys("cache:user:*")
print(keys)
```

`KEYS` 一次性返回所有匹配的 key，数据量大时阻塞 Redis 几秒甚至几十秒

`SCAN` 分批返回，每次只返回一小批，不阻塞



## 大 Key 拆分

``` python
# 基础信息
r.hset("user:1001:profile", mapping={
    "name": "小明",
    "email": "xiao@example.com",
    "address": "..."
})

# 订单用列表或独立 key
r.lpush("user:1001:orders", "order_1", "order_2")

# 收藏用集合
r.sadd("user:1001:favorites", "product_1", "product_2")

# 浏览历史用列表（限制长度）
r.lpush("user:1001:history", "page_1", "page_2")
r.ltrim("user:1001:history", 0, 99)  # 只保留最近 100 条
```





# **运维与管理**



## **持久化**



## **主从复制与哨兵**



## **Redis 集群 (Cluster)**



## **性能监控**





# 实际场景



## 短信限流场景

``` python
# 写法1：用 nx=True（推荐，更直观）
result = await r.set(f"sms:limit:1min:{phone}", 1, ex=60, nx=True)
if result is None:
    # key 已存在，说明60秒内发过了
    return {"code": 429, "msg": "发送过于频繁"}
```



## 加锁

``` python
import uuid

lock_key = "lock:order:888"
client_id = str(uuid.uuid4())  # 比如 "abc-123"

# 加锁：把 client_id 存进去
locked = await r.set(lock_key, client_id, ex=10, nx=True)
```



## 解锁

``` python
# 解锁脚本（安全版本）
unlock_script = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""

async def safe_unlock(lock_key, client_id):
    result = await r.eval(unlock_script, 1, lock_key, client_id)
    return bool(result)
```



## 锁续期

``` python
import asyncio

async def process_with_lock(lock_key, client_id):
    # 加锁
    locked = await r.set(lock_key, client_id, ex=10, nx=True)
    if not locked:
        return

    try:
        # 启动续期任务（每 5 秒续一次）
        extend_task = asyncio.create_task(auto_extend(lock_key, client_id, interval=5))

        # 执行业务逻辑
        await do_business()

        # 取消续期任务
        extend_task.cancel()
    finally:
        await safe_unlock(lock_key, client_id)


async def auto_extend(lock_key, client_id, interval):
    while True:
        await asyncio.sleep(interval)
        # 续期
        stored = await r.get(lock_key)
        if stored == client_id:
            await r.expire(lock_key, 10)
```

