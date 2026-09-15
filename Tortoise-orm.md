# DDL创建

## 最简单的表

#### Python 模型定义

```python
from tortoise import fields
from tortoise.models import Model

class User(Model):
    id = fields.IntField(pk=True)          # 主键
    name = fields.CharField(max_length=50) # 字符串
    age = fields.IntField()                # 整数
```

#### 迁移后生成的 SQL

```sql
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `age` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 对应规则

| Python 写法                | SQL 生成结果                                     |
| :------------------------- | :----------------------------------------------- |
| `pk=True`                  | `PRIMARY KEY` + `AUTO_INCREMENT`（MySQL 自动加） |
| `CharField(max_length=50)` | `VARCHAR(50) NOT NULL`                           |
| `IntField()`               | `INT NOT NULL`                                   |
| 未指定 `null`              | 默认 `NOT NULL`（强制必填）                      |

#### ⚠️ 关键理解

- **你不写 `null=True`，数据库默认就是 `NOT NULL`**，意味着插入时这个字段必须有值。
- **`pk=True`** 自动包含了“唯一”和“自增”两个特性（MySQL 中）。

## 字段类型与 SQL 完整映射表

#### Python 模型定义（一个包含所有常用字段的示例模型）

```python
from tortoise import fields, models

class Product(Model):
    # 1. 数值类
    id = fields.IntField(pk=True)
    big_number = fields.BigIntField()
    small_number = fields.SmallIntField()
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    weight = fields.FloatField()

    # 2. 字符串类
    name = fields.CharField(max_length=100)
    description = fields.TextField()

    # 3. 布尔与时间类
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    release_date = fields.DateField()

    # 4. 特殊类型
    extra_data = fields.JSONField()
    # uid = fields.UUIDField()  # 暂不展开

    class Meta:
        table = "products"
```

#### 迁移后生成的 SQL（MySQL 方言）

```sql
CREATE TABLE `products` (
    -- 数值类
    `id` INT NOT NULL AUTO_INCREMENT,
    `big_number` BIGINT NOT NULL,
    `small_number` SMALLINT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `weight` DOUBLE NOT NULL,

    -- 字符串类
    `name` VARCHAR(100) NOT NULL,
    `description` LONGTEXT NOT NULL,

    -- 布尔与时间类
    `is_active` BOOL NOT NULL,
    `created_at` DATETIME(6) NOT NULL,
    `release_date` DATE NOT NULL,

    -- 特殊类型
    `extra_data` JSON NOT NULL,

    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 完整映射对照表（必记）

| Tortoise 字段                              | Python 类型 | MySQL 数据类型              | 说明                                     |
| :----------------------------------------- | :---------- | :-------------------------- | :--------------------------------------- |
| `IntField()`                               | `int`       | `INT`                       | 32位整数，范围 ±21亿                     |
| `BigIntField()`                            | `int`       | `BIGINT`                    | 64位整数，范围 ±922亿亿                  |
| `SmallIntField()`                          | `int`       | `SMALLINT`                  | 16位整数，范围 ±32767                    |
| `DecimalField(max_digits, decimal_places)` | `Decimal`   | `DECIMAL(M,D)`              | **精确小数**（适合金额）                 |
| `FloatField()`                             | `float`     | `DOUBLE`                    | 双精度浮点（**有精度误差，不适合金额**） |
| `CharField(max_length=N)`                  | `str`       | `VARCHAR(N)`                | **定长字符串**（必须指定 `max_length`）  |
| `TextField()`                              | `str`       | `LONGTEXT`                  | **长文本**（适合文章、JSON 字符串）      |
| `BooleanField()`                           | `bool`      | `BOOL`（实际存 TINYINT(1)） | 布尔值                                   |
| `DatetimeField()`                          | `datetime`  | `DATETIME(6)`               | 日期+时间（微秒精度）                    |
| `DateField()`                              | `date`      | `DATE`                      | 仅日期                                   |
| `JSONField()`                              | `dict/list` | `JSON`                      | 原生 JSON 类型（MySQL 5.7+）             |





#### ⚠️ 核心避坑指南（重要）

1. **`CharField` 必须带 `max_length`**：

   python

   ```
   # ❌ 错误
   name = fields.CharField()  
   # ✅ 正确
   name = fields.CharField(max_length=50)
   ```

   

   如果字符串长度不确定，请直接用 `TextField`。

2. **金钱永远用 `DecimalField`，绝不用 `FloatField`**：
   `FloatField` 有精度误差（0.1 + 0.2 = 0.30000000000000004），存金额会出大问题。`DecimalField` 是精确的字符串存储。

3. **`DatetimeField` 必须配合 `auto_now` 或 `auto_now_add`**（或者手动传值）：

   - `auto_now_add=True`：**仅在第一次创建时**自动填入当前时间（适合 `created_at`）。
   - `auto_now=True`：**每次更新记录时**自动更新为当前时间（适合 `updated_at`）。

4. **`JSONField` 依赖数据库版本**：
   MySQL 5.7+ 支持原生 JSON，低于此版本会报错。

5. **默认值（`default`）的作用域**：
   `default` 是在 **Python 层面** 赋予的默认值（ORM 插入时使用），不会在数据库表结构（DDL）中体现为 `DEFAULT` 关键字（除非你使用 `db_default`）

#### 💡 一张表看懂“我应该选哪个”

| 你要存的数据               | 用什么字段                                           |
| :------------------------- | :--------------------------------------------------- |
| 用户ID、数量               | `IntField`                                           |
| 金额、价格                 | `DecimalField`                                       |
| 用户名、标题（<255字符）   | `CharField(max_length=...)`                          |
| 文章正文、描述（>255字符） | `TextField`                                          |
| 创建时间、更新时间         | `DatetimeField(auto_now_add=True)` / `auto_now=True` |
| 开关、是否删除             | `BooleanField(default=False)`                        |
| 配置项、灵活 JSON          | `JSONField`                                          |

## 字段约束（`null`、`unique`、`default`、`db_index`）

#### Python 模型定义（含所有常见约束

```python
from tortoise import fields, models

class User(Model):
    # 主键（自带唯一 + 非空约束）
    id = fields.IntField(pk=True)

    # 1. null（是否允许为空）
    name = fields.CharField(max_length=50, null=False)        # 不允许为空（默认）
    email = fields.CharField(max_length=100, null=True)       # 允许为空

    # 2. unique（唯一约束）
    username = fields.CharField(max_length=50, unique=True)   # 不允许重复

    # 3. default（默认值）
    age = fields.IntField(default=18)                         # 不传时自动填 18
    status = fields.CharField(max_length=20, default="active")

    # 4. db_index（创建索引，加速查询）
    created_at = fields.DatetimeField(auto_now_add=True, db_index=True)

    class Meta:
        table = "users"
```



#### 🗄️ 迁移后生成的 SQL（重点看约束部分）

```sql
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,                    -- ⬅️ null=False → NOT NULL
    `email` VARCHAR(100) NULL,                      -- ⬅️ null=True → NULL
    `username` VARCHAR(50) NOT NULL UNIQUE,         -- ⬅️ unique=True → UNIQUE 约束
    `age` INT NOT NULL DEFAULT 18,                  -- ⬅️ default=18 → DEFAULT 18
    `status` VARCHAR(20) NOT NULL DEFAULT 'active', -- ⬅️ default="active"
    `created_at` DATETIME(6) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_users_username` (`username`), -- ⬅️ unique → 自动创建唯一索引
    INDEX `idx_users_created_at` (`created_at`)     -- ⬅️ db_index=True → 创建普通索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 📊 四个约束参数详解

| 参数           | Python 写法          | SQL 生成效果                   | 作用                                                      |
| :------------- | :------------------- | :----------------------------- | :-------------------------------------------------------- |
| **`null`**     | `null=True`          | `NULL`                         | 字段可以存空值（无数据）                                  |
|                | `null=False`（默认） | `NOT NULL`                     | 字段必须填值，插入时必须有数据                            |
| **`unique`**   | `unique=True`        | `UNIQUE` 约束 + 自动建唯一索引 | 字段值不能重复（如手机号、邮箱）                          |
| **`default`**  | `default=18`         | `DEFAULT 18`                   | 插入时如果没传这个字段，数据库自动填入默认值              |
| **`db_index`** | `db_index=True`      | `INDEX`                        | 建普通索引，加速 `WHERE 字段 = ?` 和 `ORDER BY 字段` 查询 |

#### ⚠️ 核心避坑指南（新手必看）

1. **`null=True` ≠ 有默认值**
   `null=True` 允许插入时传 `None`，但如果你既没传值，也没设 `default`，插入时仍然会报错（因为 NOT NULL 约束）。

   ```python
   # ❌ 错误理解：写了 null=True，以为可以不传这个字段
   email = fields.CharField(max_length=100, null=True)
   # 如果插入时不传 email，也不设 default，数据库会报错：
   # ERROR: Field 'email' doesn't have a default value
   
   # ✅ 正确做法：既要允许为空，也要给它一个默认值
   email = fields.CharField(max_length=100, null=True, default=None)
   # 插入时如果不传 email，ORM 会用 default=None 填充，数据库存 NULL
   ```

   

2. **`unique` 自动建索引，不需要额外加 `db_index`**
   带 `unique=True` 的字段，数据库会**自动创建一个唯一索引**用于加速查询。你可以认为它自带 `db_index=True`，无需重复声明。

   ```python
   # ✅ 推荐写法：unique 自动建索引
   username = fields.CharField(max_length=50, unique=True)
   # 不需要再写 db_index=True（画蛇添足）
   ```

3. **`db_index` 不会自动去重**
   索引只用于加速查询，不阻止重复值。要阻止重复，必须用 `unique=True`。

4. **索引的代价**
   每个索引都会占用额外磁盘空间，并让插入/更新/删除操作变慢（因为要同步维护索引）。**不要对所有字段都加索引**，只对频繁出现在 `WHERE`、`ORDER BY`、`JOIN` 条件中的字段加索引。

#### 💡 四个约束的实用组合

| 业务场景                   | Python 写法                                                  | SQL 效果             | 说明                       |
| :------------------------- | :----------------------------------------------------------- | :------------------- | :------------------------- |
| **用户名必填且唯一**       | `name = fields.CharField(max_length=50, unique=True, null=False)` | `NOT NULL UNIQUE`    | 最常用                     |
| **手机号可选，但必须唯一** | `phone = fields.CharField(max_length=20, unique=True, null=True, default=None)` | `NULL UNIQUE`        | MySQL 允许多个 NULL 共存   |
| **年龄默认 0（可选）**     | `age = fields.IntField(default=0)`                           | `NOT NULL DEFAULT 0` | 有默认值不需要 `null=True` |
| **创建时间带索引**         | `created_at = fields.DatetimeField(auto_now_add=True, db_index=True)` | `INDEX`              | 加速按时间倒序排序         |

#### ✅ 记住这条铁律

> **有默认值（`default=...`）的字段不需要 `null=True`**，因为数据库会自动用默认值填充。
> **只有真正的“可选字段”**（允许用户不填且没有默认值）才需要 `null=True`。

## `Meta` 表级配置（表名、联合索引、联合唯一、排序）

有些配置无法写在单个字段上，必须提升到表级别。`class Meta` 就是用来控制 **“整张表的行为”** 的。

#### 📦 Python 模型定义（包含所有常用 Meta 配置）

```python
from tortoise import fields, models

class Order(Model):
    id = fields.IntField(pk=True)
    user_id = fields.IntField()
    product_id = fields.IntField()
    status = fields.CharField(max_length=20, default="pending")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        # 1. 指定数据库表名（默认是模型名小写，如 "order"）
        table = "order_records"

        # 2. 联合索引（多字段组合查询加速）
        indexes = [
            ("user_id", "status"),          # 经常查：WHERE user_id=1 AND status='active'
            ("created_at", "user_id"),      # 经常查：ORDER BY created_at WHERE user_id=1
        ]

        # 3. 联合唯一约束（组合字段不能重复）
        unique_together = [
            ("user_id", "product_id"),      # 同一个用户不能重复下单同一个商品
        ]

        # 4. 默认排序（ORM 查询时不加 order_by 的默认行为）
        ordering = ["-created_at"]          # 默认按创建时间降序排
```

#### 🗄️ 迁移后生成的 SQL（重点看额外的索引和约束）

```sql
CREATE TABLE `order_records` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(6) NOT NULL,

    PRIMARY KEY (`id`),

    -- ⬇️ 来自 indexes = [("user_id", "status")]
    INDEX `idx_order_records_user_id_status` (`user_id`, `status`),

    -- ⬇️ 来自 indexes = [("created_at", "user_id")]
    INDEX `idx_order_records_created_at_user_id` (`created_at`, `user_id`),

    -- ⬇️ 来自 unique_together = [("user_id", "product_id")]
    UNIQUE INDEX `idx_order_records_user_id_product_id` (`user_id`, `product_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 📊 四个 Meta 配置详解

| 配置项                | Python 写法                                     | SQL 生成效果                         | 使用场景                                                     |
| :-------------------- | :---------------------------------------------- | :----------------------------------- | :----------------------------------------------------------- |
| **`table`**           | `table = "order_records"`                       | `CREATE TABLE order_records`         | 自定义表名（默认是模型类名小写）                             |
| **`indexes`**         | `indexes = [("user_id", "status")]`             | `INDEX (user_id, status)`            | 加速 **组合查询**（如 `WHERE user_id=1 AND status='active'`） |
| **`unique_together`** | `unique_together = [("user_id", "product_id")]` | `UNIQUE INDEX (user_id, product_id)` | 防止组合重复（如“用户-商品”不能重复下单）                    |
| **`ordering`**        | `ordering = ["-created_at"]`                    | **不生成 SQL**（仅 ORM 层生效）      | 查询时默认排序（避免每次写 `.order_by()`）                   |

#### ⚠️ 核心避坑指南（重点看联合索引）

1. **联合索引的字段顺序 = 查询条件的顺序**

   ```python
   # 索引定义为 ("user_id", "status")
   indexes = [("user_id", "status")]
   
   # ✅ 能命中索引
   Order.filter(user_id=1, status="active")  
   # ✅ 也能命中索引（只要 user_id 在最左边）
   Order.filter(user_id=1)                    
   
   # ❌ 不能命中索引（跳过了 user_id）
   Order.filter(status="active")              
   ```

   **规则**：联合索引遵循“最左前缀匹配”原则。查询条件必须包含索引的最左边字段，否则索引失效。

2. **`unique_together` 与 `unique=True` 的区别**

   - `unique=True`：限制**单列**不能重复（如用户名）。
   - `unique_together`：限制**多列组合**不能重复（如“用户+商品”组合唯一）。

3. **`ordering` 只是“默认值”，不是“强制排序”**
   如果你在代码里写了 `.order_by("-id")`，就会覆盖 `ordering` 的设置。`ordering` 只在你不指定排序时生效。

4. **不要过度建联合索引**
   每个索引都会占用磁盘空间，并拖慢插入/更新速度。只给**高频查询的组合条件**加索引。

#### 💡 实际项目中的标准组合写法

```python
class Order(Model):
    # ... 字段定义 ...

    class Meta:
        table = "orders"
        indexes = [
            ("user_id", "status"),          # 查用户的订单状态
            ("user_id", "created_at"),      # 查用户订单按时间排序
        ]
        unique_together = [
            ("user_id", "product_id"),      # 防止重复下单
        ]
        ordering = ["-created_at"]          # 默认最新在前
```



## 外键（一对多）

外键是关系型数据库的**核心连接机制**。Tortoise ORM 的 `ForeignKeyField` 会在数据库层面生成一个带有 `FOREIGN KEY` 约束的整数列。

#### 📦 Python 模型定义（User 主表 + Post 外键表）

```python
from tortoise import fields, models

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50)

    class Meta:
        table = "users"

class Post(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    content = fields.TextField()

    # ⬇️ 外键定义（关键行）
    author = fields.ForeignKeyField(
        "models.User",              # 指向哪个模型
        related_name="posts",       # 反向查询名（不生成 SQL）
        on_delete=fields.CASCADE,   # 删除策略
        db_constraint=True          # 是否创建物理外键约束
    )

    class Meta:
        table = "posts"
```

#### 🗄️ 迁移后生成的 SQL（重点看 `FOREIGN KEY` 部分）

```sql
-- 主表（users）
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 从表（posts）
CREATE TABLE `posts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `content` LONGTEXT NOT NULL,

    -- ⬇️ 外键列（ORM 自动将 `author` 转换为 `author_id`）
    `author_id` INT NOT NULL,

    PRIMARY KEY (`id`),

    -- ⬇️ 物理外键约束（关键）
    CONSTRAINT `fk_posts_users` 
        FOREIGN KEY (`author_id`) 
        REFERENCES `users` (`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHCHARSET=utf8mb4;
```



#### 🔍 参数与 SQL 的精确对照

| Python 参数                  | 作用               | 在 SQL 中的体现                                             |
| :--------------------------- | :----------------- | :---------------------------------------------------------- |
| `"models.User"`              | 指向目标模型       | `REFERENCES users (id)`（自动读取 `User` 表的主键列）       |
| `related_name="posts"`       | 反向查询属性名     | **不生成任何 SQL**（仅 ORM 内存层有效）                     |
| `on_delete=fields.CASCADE`   | 删除主表时同步删除 | `ON DELETE CASCADE`                                         |
| `db_constraint=True`（默认） | 是否创建物理外键   | **生成** `CONSTRAINT ... FOREIGN KEY ...` 语句              |
| `db_constraint=False`        | 不建物理外键       | **仅生成** `author_id INT` 列，**不生成** `CONSTRAINT` 语句 |

#### 📌 `on_delete` 四种策略对比（非常重要）

| 策略             | Python 写法                         | SQL 效果              | 适用场景                                                     |
| :--------------- | :---------------------------------- | :-------------------- | :----------------------------------------------------------- |
| **级联删除**     | `on_delete=fields.CASCADE`          | `ON DELETE CASCADE`   | 删除用户时，他的文章自动全删（强关联）                       |
| **置空**         | `on_delete=fields.SET_NULL`         | `ON DELETE SET NULL`  | 删除用户后，文章保留但 `author_id` 变为 `NULL`（**字段必须设置 `null=True`**） |
| **限制删除**     | `on_delete=fields.RESTRICT`（默认） | `ON DELETE RESTRICT`  | 如果用户还有文章，**禁止删除**该用户                         |
| **不做任何操作** | `on_delete=fields.NO_ACTION`        | `ON DELETE NO ACTION` | 类似 RESTRICT，MySQL 中通常等同于 RESTRICT                   |

#### ⚠️ 核心避坑指南（硬核知识）

1. **`related_name` 不生成 SQL，但必须写**
   它只在 Python 代码中生效（反向查询时用 `user.posts`），不在数据库留下任何痕迹。但**不写会导致默认名难记**，永远要显式指定。

2. **`db_constraint=False` 的代价（物理外键 vs 逻辑外键）**

   - **开启（默认 `True`）**：数据库帮你保证数据完整性（不会出现“孤儿数据”）。写入性能略有下降（每次插入需检查主表是否存在）。
   - **关闭（`False`）**：数据库**只存整数**，不检查关联是否存在。性能更高，但**应用层必须自己维护一致性**（否则会出现 `author_id=999` 但 `users` 表里没有 `id=999` 的脏数据）。
     **新手强烈建议保留 `True`**，直到你明确遇到性能瓶颈再考虑关闭。

3. **外键列名自动加 `_id`**
   你写的是 `author`，数据库里存的是 `author_id`。你在 Python 中既可以用 `post.author`（拿对象），也可以用 `post.author_id`（直接拿整数）。

4. **`SET_NULL` 必须配合 `null=True`**
   如果你写 `on_delete=fields.SET_NULL`，但字段定义是 `author = fields.ForeignKeyField(..., null=False)`（默认），迁移会报错。

   ```python
   # ✅ 正确写法（允许外键为空）
   author = fields.ForeignKeyField(
       "models.User", 
       null=True,               # 必须加这行
       on_delete=fields.SET_NULL
   )
   ```

   

5. **外键字段默认是 `NOT NULL`**
   如果 `null` 参数没写，默认就是 `NOT NULL`。所以上面的 SQL 中生成了 `author_id INT NOT NULL`。

#### 💡 实战决策：我该用哪种 `on_delete`？

| 业务场景                               | 推荐策略   | 原因                           |
| :------------------------------------- | :--------- | :----------------------------- |
| 用户注销时，评论必须全删               | `CASCADE`  | 数据强依赖，用户没了评论没意义 |
| 用户注销时，历史订单保留但置空用户信息 | `SET_NULL` | 保留交易记录，但不泄露隐私     |
| 部门删除时，如果还有员工则禁止删除     | `RESTRICT` | 防止误删导致数据孤儿           |
| 用户注销时，日志保留但置空             | `SET_NULL` | 保留操作记录                   |

## 中间表（多对多）

### 1. 中间表是什么？

**中间表**就是一张**普通的数据库表**,它只有三个组成部分：

1. 一个**自增主键**（`id`）。
2. 至少两个**外键列**,分别指向两张主表。
3. 其他可选字段（如有需要）。

**关键点**：中间表的**每一行**都表示“主表 A 的某一行”与“主表 B 的某一行”之间的**一个关联关系**。

### 2. 为什么需要中间表？

```sql
-- 这是你必须记住的对比

-- ❌ 多对一（一对多）的实现方式：
-- 在从表里加 1 个外键列，存 1 个主键 ID。
ALTER TABLE posts ADD COLUMN author_id INT;

-- ✅ 多对多的实现方式：
-- 两张主表不变，额外新建一张表，用来存“配对关系”。
CREATE TABLE post_tag_relation (
    post_id INT,
    tag_id INT
);
```



**核心矛盾**：当“多”的那一方需要存多个 ID 时（比如一篇文章有 10 个标签）,单个列装不下,所以把“配对信息”拆成**行**,而不是塞进**列**。

### 3. 中间表里的数据长什么样？（看数据）

假设你有 3 篇文章（posts 表）和 3 个标签（tags 表）：

**posts 表：**

| id   | title            |
| :--- | :--------------- |
| 1    | 如何学习 Python  |
| 2    | FastAPI 入门教程 |
| 3    | 数据库设计基础   |

**tags 表：**

| id   | name     |
| :--- | :------- |
| 10   | Python   |
| 11   | Web 开发 |
| 12   | 数据库   |

**中间表 `post_tag_relation`：**

| id   | post_id | tag_id |
| :--- | :------ | :----- |
| 1    | 1       | 10     |
| 2    | 1       | 11     |
| 3    | 2       | 10     |
| 4    | 2       | 11     |
| 5    | 3       | 12     |

**解读：**

- 文章 1（如何学习 Python）→ 标签 10（Python）和 11（Web 开发）。
- 文章 2（FastAPI 入门教程）→ 标签 10（Python）和 11（Web 开发）。
- 文章 3（数据库设计基础）→ 标签 12（数据库）

### 4. 中间表如何回答业务问题？（两种查询方向）

**正向查询（文章 → 标签）：**
“文章 1 有哪些标签？”

```sql
SELECT t.* 
FROM tags t
JOIN post_tag_relation pt ON t.id = pt.tag_id
WHERE pt.post_id = 1;
```



结果返回标签 10（Python）和 11（Web 开发）。

**反向查询（标签 → 文章）：**
“标签 10（Python）属于哪些文章？”

```sql
SELECT p.* 
FROM posts p
JOIN post_tag_relation pt ON p.id = pt.post_id
WHERE pt.tag_id = 10;
```



结果返回文章 1 和 2。

### 5. 中间表为什么必须有联合唯一约束？

当你的文章 1 已经关联了标签 10,如果再试图插入 `(post_id=1, tag_id=10)` 这条重复的配对,没有联合唯一约束时,数据库会允许插入第二行一模一样的数据,导致同一篇文章同一个标签出现多次,业务上毫无意义且会造成查询混乱。

```sql
-- 关键 SQL（防止重复配对）
UNIQUE INDEX `uidx_pt_post_tag` (`post_id`, `tag_id`);

-- 如果没有这行约束,你可能会插入两条完全相同的配对：
-- (1, 10) 和 (1, 10) → ❌ 这不应该发生
-- 加了约束后,第二次插入会直接报错,阻止你这样做。
```



### 6. 中间表在 Tortoise ORM 的 `ManyToManyField` 中如何体现？

```python
class Post(Model):
    tags = fields.ManyToManyField("models.Tag", related_name="posts")

# 添加关联（ORM 自动插入中间表）
post = await Post.get(id=1)
tag = await Tag.get(id=10)
await post.tags.add(tag)
# 这条操作对应 SQL：INSERT INTO post_tag_relation (post_id, tag_id) VALUES (1, 10);

# 移除关联
await post.tags.remove(tag)
# 这条操作对应 SQL：DELETE FROM post_tag_relation WHERE post_id = 1 AND tag_id = 10;

# 查询文章的所有标签
tags = await post.tags.all()
# 这条操作对应 SQL：SELECT t.* FROM tags t JOIN post_tag_relation pt ON t.id = pt.tag_id WHERE pt.post_id = 1;

# 反向查询（标签属于哪些文章）
tag = await Tag.get(id=10)
posts = await tag.posts.all()
# 这条操作对应 SQL：SELECT p.* FROM posts p JOIN post_tag_relation pt ON p.id = pt.post_id WHERE pt.tag_id = 10;
```



### 7. 一张表彻底总结三种关系

| 关系       | 数据库实现方式                | 当前表新增内容                      | 举例                            |
| :--------- | :---------------------------- | :---------------------------------- | :------------------------------ |
| **一对多** | 在“多”的表里加一个外键列      | `author_id INT`（1 列）             | `posts` 表新增 `author_id`      |
| **一对一** | 在“从”的表里加外键 + `UNIQUE` | `user_id INT UNIQUE`（1 列 + 约束） | `profiles` 表新增 `user_id`     |
| **多对多** | **新建一张独立的中间表**      | 一张新表,包含两个外键列             | `post_tag_relation`（2 个外键） |

### 8. 核心记忆点

1. **中间表是独立存在的**：它不是两张主表中的任何一张,而是一张独立的表。
2. **中间表里的每一行都是一个配对**：代表“文章 A 和标签 B 之间存在关系”。
3. **联合唯一约束防止重复配对**：确保同一对关系只能存在一次。
4. **ORM 帮你自动生成和管理中间表**：你只需要定义 `ManyToManyField`,迁移时会自动创建中间表,增删改查也由 ORM 自动处理 SQL。



## 字段

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





# MQL查询

## 查询所有记录`all()`

```python
users = await User.all()
```

**作用：** 获取该表中**所有**的记录。

**返回结果：** `QuerySet` 对象（类似于列表，可遍历）。如果表里没有数据，返回空列表 `[]`，**不会报错**。

**对应的 SQL 语句**

```sql
SELECT * FROM users;
```



## 条件过滤（WHERE）

```python
users = await User.filter(字段名__运算符=值)
```

**作用：** 根据指定条件筛选数据，返回**所有匹配的记录**。

**返回结果：** `QuerySet` 对象（列表）。如果没匹配到任何数据，返回空列表 `[]`，**不会报错**。

**对应的 SQL 结构**

```sql
SELECT * FROM users WHERE 条件表达式;
```



### 精确匹配（`=`）

```python
users = await User.filter(age=25)

```

```sql
SELECT * FROM users WHERE age = 25;
```

查询年龄等于 25 的用户。

**注意**：即使只有一条结果，`users` 依然是列表（`[User实例]`），不是单个对象。



### 大于（`__gt`）

```python
users = await User.filter(age__gt=20)
```

```sql
SELECT * FROM users WHERE age > 20;
```

查询年龄大于 20 的用户。



### 包含（`__contains`）

```python
users = await User.filter(name__contains="三")
```

```sql
SELECT * FROM users WHERE name LIKE '%三%';
```

查询名字里包含“三”的用户。



### 多个条件（AND）

```python
users = await User.filter(age__gt=20, name__contains="张")
```

```sql
SELECT * FROM users WHERE age > 20 AND name LIKE '%张%';
```

查询年龄大于 20，**并且**名字里包含“张”的用户。



### 🧰 常用运算符速查表

| Python 写法             | 含义      | SQL 符号      |
| :---------------------- | :-------- | :------------ |
| `age=25`                | 等于      | `=`           |
| `age__gt=25`            | 大于      | `>`           |
| `age__gte=25`           | 大于等于  | `>=`          |
| `age__lt=25`            | 小于      | `<`           |
| `age__lte=25`           | 小于等于  | `<=`          |
| `age__in=[20, 30]`      | 在列表中  | `IN (20, 30)` |
| `name__contains="三"`   | 包含      | `LIKE '%三%'` |
| `name__startswith="张"` | 以...开头 | `LIKE '张%'`  |
| `name__endswith="三"`   | 以...结尾 | `LIKE '%三'`  |



### 小结

1. **`filter` 永远返回列表，即使只有一条**：
   如果你想取匹配的第一条，不能直接 `users`，要用 `users[0]` 或遍历。**如果数据库为空或没匹配到，`users` 是 `[]`，此时 `users[0]` 会报错 `IndexError`**。
   *安全做法*：先判断 `if users:` 再取 `users[0]`，或直接使用 `get_or_none()`。
2. **多个条件默认是 AND**：
   如果你需要 **OR**（或）条件，请不要用 `filter` 的逗号（那是 AND）
3. **区分 `filter` 和 `get`**：
   `filter` 返回列表（多条），`get` 返回单个对象（如果查不到会报错）。



## 查询单条记录

**🔍 方法定义（两种）**

| 方法                           | 查不到时                 | 返回结果           |
| :----------------------------- | :----------------------- | :----------------- |
| `await User.get(id=1)`         | **抛出异常**（程序崩溃） | 单个模型实例       |
| `await User.get_or_none(id=1)` | **返回 `None`**（安全）  | 模型实例 或 `None` |

**作用：** 根据条件查询**一条且仅一条**记录。如果满足条件的数据超过一条，**也会报错**。

**对应的 SQL 结构：**

```sql
SELECT * FROM users WHERE 条件 LIMIT 1;
```



### `get()`

**存在时正常，不存在时崩溃**

```python
# 查询 id=1 的用户（存在）
user = await User.get(id=1)
print(user.name)  # 输出：张三

# 查询 id=999 的用户（不存在）
user = await User.get(id=999)  # ❌ 抛出 DoesNotExist 异常，程序终止
print(user.name)  # 这行不会执行
```

```sql
-- 第一次（存在）
SELECT * FROM users WHERE id = 1 LIMIT 1;

-- 第二次（不存在）
SELECT * FROM users WHERE id = 999 LIMIT 1;
```



**安全用法（捕获异常）：**

```python
from tortoise.exceptions import DoesNotExist

try:
    user = await User.get(id=999)
    print(user.name)
except DoesNotExist:
    print("用户不存在，安全处理")
```



### `get_or_none()` （推荐）

**存在时正常，不存在返回 `None`**

```python
# 查询 id=1 的用户（存在）
user = await User.get_or_none(id=1)
if user:
    print(user.name)  # 输出：张三

# 查询 id=999 的用户（不存在）
user = await User.get_or_none(id=999)
if user is None:
    print("用户不存在，安全处理")  # 执行这一行
```

**对应 SQL：**

```sql
SELECT * FROM users WHERE id = 1 LIMIT 1;
SELECT * FROM users WHERE id = 999 LIMIT 1;
```

数据库查不到时，**Tortoise** 返回 `None`，不会抛出任何异常。



### 顺序执行

**先 `filter` 再 `get_or_none`**

```python
user = await User.filter(name="张三", age__gt=20).get_or_none()
```

**对应 SQL：**

```sql
SELECT * FROM users WHERE name = '张三' AND age > 20 LIMIT 1;
```

- `filter()` 返回的是一个 **QuerySet**（查询集），它拥有 `get_or_none()` 方法。
- 先筛出符合条件的范围，再从范围中取一条。

**⚠️ 重要警告（极易踩坑）**

**当 `filter` 筛出的结果不止一条时，`get_or_none` 会抛异常！**

```python
# 假设数据库里有 2 个叫"张三"的用户
user = await User.filter(name="张三").get_or_none()
# ❌ 抛出 MultipleObjectsReturned 异常
```

**原因**：`get_or_none` 语义是“我只拿一条”，如果查到多条，它无法决定返回哪一条，干脆报错让你处理。

**解决方案**：如果你确实想取多条中的第一条，应该用 `first()`，而不是 `get_or_none`。

``` python
user = await User.filter(name="张三").first()
```



### 小节

1. **优先使用 `get_or_none`，只在确定数据一定存在时才用 `get`**：
   `get()` 查不到就抛异常，如果不捕获，整个请求会返回 500 错误。对外部输入（如 URL 中的 `user_id`），**永远用 `get_or_none`**。
2. **`get` 要求结果必须唯一**：
   如果条件匹配了多条数据（例如 `User.filter(age=25)` 有 2 条），`get` 和 `get_or_none` 都会抛出 `MultipleObjectsReturned` 异常。如果你确实想查多条，必须用 `filter`。
3. **判断 `get_or_none` 的结果时，用 `if user is None` 而不是 `if not user`**：
   虽然大多数情况下 `if not user` 也能用，但为了严谨（避免模型自定义了 `__bool__` 方法导致判断失误），推荐使用 `if user is None`。

## 排序

### 🔍 方法定义

```python
users = await User.all().order_by("字段名")
users = await User.all().order_by("-字段名")
```

**作用：** 对查询结果进行排序。

**返回结果：** `QuerySet` 对象（列表）。如果没数据，返回空列表 `[]`，**不会报错**。

**对应的 SQL 结构：**

```sql
SELECT * FROM users ORDER BY 字段 [ASC|DESC];
```

### 升序

按年龄从小到大排序（最年轻在前）。

**Python 代码：**

```python
users = await User.all().order_by("age")
for user in users:
    print(user.name, user.age)
```

**控制台输出：**

```text
王五 20
张三 25
李四 30
```

**对应 SQL：**

```sql
SELECT * FROM users ORDER BY age ASC;
```

`ASC` 是默认值，可以不写。数字越小越靠前，字符串按字母顺序排。

### 降序

**需求：** 按年龄从大到小排序（最年长在前）。

**Python 代码：**

```python
users = await User.all().order_by("-age")
for user in users:
    print(user.name, user.age)
```

**控制台输出：**

```text
李四 30
张三 25
王五 20
```

**对应 SQL：**

```sql
SELECT * FROM users ORDER BY age DESC;
```

字段名前加 `-`（减号）表示降序。

### 多字段排序

**需求：** 先按年龄降序排，年龄相同的再按名字升序排。

```python
users = await User.all().order_by("-age", "name")
for user in users:
    print(user.name, user.age)
```

**当前数据输出：**（没有同龄人，效果等同于只按 age 降序）

```sql
SELECT * FROM users ORDER BY age DESC, name ASC;
```

多字段时，先排第一个条件，如果相同，再排第二个条件。

### 与 `filter` 组合使用

**需求：** 查询年龄大于 20 的用户，并按年龄降序排列。

**Python 代码：**

```python
users = await User.filter(age__gt=20).order_by("-age")
for user in users:
    print(user.name, user.age)
```

**控制台输出：**

```text
李四 30
张三 25
```

**对应 SQL：**

```sql
SELECT * FROM users WHERE age > 20 ORDER BY age DESC;
```

### 小节

1. **如果不加 `order_by`，顺序是不确定的**：
   数据库默认按主键（`id`）排序，但这不是 SQL 标准保证的。如果你的业务依赖顺序（如“最新一条”），**必须显式写 `order_by`**。

2. **链式调用的顺序**：
   正确的顺序是：`filter` → `order_by` → `limit`/`offset`。

   ```python
   # ✅ 正确
   users = await User.filter(age__gt=18).order_by("-age").limit(10)
   
   # ❌ 错误（order_by 必须在 limit 之前）
   users = await User.filter(age__gt=18).limit(10).order_by("-age")
   ```

3. **字符串排序是字典序（按字母/拼音顺序）**：
   `order_by("name")` 会按字母排序（英文）或拼音排序（中文，取决于数据库字符集）。如果你需要按中文笔画或自定义规则，需要数据库层面额外配置。

## 限制返回数量和分页

### 🔍 方法定义

```python
# 取前 N 条
users = await User.all().limit(N)

# 跳过前 N 条
users = await User.all().offset(N)

# 组合使用（跳过 M 条，取 N 条）
users = await User.all().offset(M).limit(N)
```

**作用：**

- `limit(N)`：限制返回结果的数量，最多 N 条。
- `offset(N)`：跳过前 N 条记录，从第 N+1 条开始返回。

**返回结果：** `QuerySet` 对象（列表）。

**对应的 SQL 结构：**

```sql
-- 仅 limit
SELECT * FROM users LIMIT N;

-- 仅 offset
SELECT * FROM users OFFSET M;

-- 组合（分页）
SELECT * FROM users LIMIT N OFFSET M;
```

### `limit`

只取前 N 条

**需求：** 只取前 3 个用户。

**Python 代码：**

```python
users = await User.all().limit(3)
for user in users:
    print(user.name)
```

**控制台输出：**

```text
张三
李四
王五
```

**对应 SQL：**

```sql
SELECT * FROM users LIMIT 3;
```

### 分页

**offset** + **limit** —— 分页（最常用）

**需求：** 每页 2 条数据，取第 2 页（跳过前 2 条，取 2 条）。

**Python 代码：**

```python
# 第 2 页：跳过前 2 条，取 2 条
page_2 = await User.all().offset(2).limit(2)
for user in page_2:
    print(user.name)
```

**控制台输出：**

```text
王五  （第 3 条）
赵六  （第 4 条）
```

**对应 SQL：**

```sql
SELECT * FROM users LIMIT 2 OFFSET 2;
```

### 与 filter 和 order_by 组合（实际项目标准写法）

**需求：** 查询年龄大于 20 的用户，按年龄降序排列，每页 2 条，取第 1 页。

**Python 代码：**

```python
page = 1
page_size = 2
offset_val = (page - 1) * page_size  # 公式：0

users = await User.filter(age__gt=20).order_by("-age").offset(offset_val).limit(page_size)
for user in users:
    print(user.name, user.age)
```

过滤age大于20并降序，跳过offset_val条，取page_size条数据；

**控制台输出：**

```text
李四 30
赵六 28
```

**对应 SQL：**

```sql
SELECT * FROM users WHERE age > 20 ORDER BY age DESC LIMIT 2 OFFSET 0;
```

### 覆盖索引 + 延迟连接

这是传统 `offset` 分页的唯一性能优化手段，且**前端不需要传 `last_id`，后端依然用 `page` 和 `size`**。

**核心思想：** 不要先查 `SELECT *`（全字段），而是**先在索引上查出 ID 列表，再用 ID 去查完整数据**。这样数据库扫描的只是索引（快速），而不是整行数据（慢）。

```python
async def get_users(page: int, size: int):
    offset = (page - 1) * size

    # 第 1 步：只在索引上查 ID（快速，不查整行）
    ids = await User.all().order_by("-id").offset(offset).limit(size).values_list("id", flat=True)

    # 如果已经到底了，直接返回空
    if not ids:
        return {"data": [], "total": await User.all().count()}

    # 第 2 步：根据 ID 列表批量查完整数据（走主键索引，极快）
    users = await User.filter(id__in=list(ids)).order_by("-id")
    total = await User.all().count()

    return {"data": users, "total": total}
```

**对应的 SQL（MySQL 示例）：**

```sql
-- 第 1 步（只扫描索引）
SELECT id FROM users ORDER BY id LIMIT 10 OFFSET 10000;

-- 第 2 步（用主键直接定位）
SELECT * FROM users WHERE id IN (10001, 10002, ...) ORDER BY id DESC;
```

**性能对比（数据量 100 万行，第 1000 页）：**

| 方式                             | 扫描行数                            | 耗时   |
| :------------------------------- | :---------------------------------- | :----- |
| 直接 `SELECT * ... OFFSET 10000` | **约 10010 行**（扫描全行数据）     | 200ms+ |
| 延迟连接（先查 ID）              | 仅扫描 **10010 个索引**（不查整行） | 20ms   |

**优点**：

- 前端完全无感知，依然传 `page` 和 `size`。
- 性能大幅提升（尤其字段多、表宽时）。

**缺点**：

- 需要两次查询（但总耗时仍然远低于一次全字段扫描）。
- 只对“排序字段有索引”的情况有效（`id` 或 `created_at` 通常都有**索引**）。

### 小节

1. **链式调用的顺序是固定的**：
   `filter` → `order_by` → `offset` → `limit`

   ```python
   # ✅ 正确
   await User.filter(age__gt=20).order_by("-age").offset(0).limit(10)
   
   # ❌ 错误（limit 必须在最后）
   await User.filter(age__gt=20).limit(10).order_by("-age")
   ```

2. **页码计算公式**：
   `offset = (page - 1) * page_size`

   - 第 1 页：`offset=0, limit=10`
   - 第 2 页：`offset=10, limit=10`
   - 第 3 页：`offset=20, limit=10`

3. **永远配合 `order_by` 使用，否则分页结果不可重现**：
   如果没有排序，每次查询返回的“第一页”可能不同（因为数据库默认顺序不稳定）。**分页查询必须带 `order_by`**，否则用户翻页时可能看到重复或遗漏的数据。（一般如果没有明确排序的字段，建议一开始就使用 created_at）

4. **`limit` 不能为负数**：
   传入负数会抛出 `OperationalError`（数据库驱动不识别负数）。

5. **`offset` 过大时性能会下降**：
   当你翻到第 1000 页时（`offset=10000`），数据库仍然需要扫描前 10000 条记录才能跳过它们。解决方案：对于大偏移量，使用“游标分页”（基于 `id > 上次最后一条的 id`），但这属于进阶内容，目前先用 `offset`/`limit` 即可。

## 计数

### 🔍 方法定义

```python
total = await User.all().count()
```

**作用：** 统计当前查询结果集中的**记录总数**。

**返回结果：** 一个**整数（`int`）**。如果表为空，返回 `0`，不会报错。

**对应的 SQL 结构：**

```sql
SELECT COUNT(*) FROM users;
```

### 📝 示例 1：统计所有用户数

**需求：** 统计 `users` 表一共有多少用户。

**Python 代码：**

```python
total = await User.all().count()
print(total)  # 输出：5
```

**对应 SQL：**

```sql
SELECT COUNT(*) FROM users;
```

### 📝 示例 2：按条件统计

**需求：** 统计年龄大于 25 岁的用户有多少个。

**Python 代码：**

```python
count = await User.filter(age__gt=25).count()
print(count)  # 输出：2（李四 30岁，赵六 28岁）
```

**对应 SQL：**

```sql
SELECT COUNT(*) FROM users WHERE age > 25;
```

### 📝 示例 3：组合多个条件

**需求：** 统计年龄大于 20 且名字包含“三”的用户。

**Python 代码：**

```python
count = await User.filter(age__gt=20, name__contains="三").count()
print(count)  # 输出：1（张三）
```

**对应 SQL：**

```sql
SELECT COUNT(*) FROM users WHERE age > 20 AND name LIKE '%三%';
```



### 小节

1. **`count()` 忽略 `limit` 和 `offset`（这是标准分页套路）**
   如果你写：

   ```python
   # 先取前 2 条，再数数
   count = await User.all().limit(2).count()
   print(count)  # 输出：5（而不是 2！）
   ```

   **原因**：`count()` 计数的是 **“满足筛选条件（`filter`）的全部记录数”**，而不是分页后的条数。
   **为什么要这么设计？** 前端分页需要知道“总条数”（比如数据库有 100 条，当前只取了第 1 页的 10 条，但分页控件要显示“共 100 条”）。所以正确的做法是：

   ```python
   # 总条数（用于分页控件）
   total = await User.filter(age__gt=20).count()
   # 当前页数据
   page_data = await User.filter(age__gt=20).offset(0).limit(10)
   ```

2. **`count()` 忽略 `order_by`**
   排序对计数没有影响，`order_by` 在 `count()` 前会被优化掉，不会产生性能开销。你可以放心写。

3. **性能注意**：`COUNT(*)` 在大表（百万级）上可能较慢。如果只是判断“是否有数据”，使用 `exists()`，它比 `count() > 0` 快得多。



## 判断是否存在

### 🔍 方法定义

```python
exists = await User.filter(条件).exists()
```

**作用：** 判断当前查询条件是否**至少有一条**匹配的记录。

**返回结果：** 一个**布尔值（`bool`）**。

- 有匹配记录 → `True`
- 无匹配记录 → `False`

**对应的 SQL 结构：**

```sql
SELECT EXISTS(SELECT 1 FROM users WHERE 条件) AS "exists";
```

### 📝 示例 1：判断是否存在指定 ID 的用户

**需求：** 判断 ID 为 1 的用户是否存在。

**Python 代码：**

```python
exists = await User.filter(id=1).exists()
print(exists)  # 输出：True

exists = await User.filter(id=999).exists()
print(exists)  # 输出：False
```

**对应 SQL：**

```sql
SELECT EXISTS(SELECT 1 FROM users WHERE id = 1) AS "exists";
SELECT EXISTS(SELECT 1 FROM users WHERE id = 999) AS "exists";
```

### 📝 示例 2：按条件判断

**需求：** 判断是否存在年龄大于 40 的用户。

**Python 代码：**

```python
exists = await User.filter(age__gt=40).exists()
print(exists)  # 输出：False（数据库没有 40 岁以上的用户）
```

**对应 SQL：**

```sql
SELECT EXISTS(SELECT 1 FROM users WHERE age > 40) AS "exists";
```

### 📝 示例 3：组合条件

**需求：** 判断是否存在名字叫“张三”且年龄为 25 的用户。

**Python 代码：**

```python
exists = await User.filter(name="张三", age=25).exists()
print(exists)  # 输出：True
```

**对应 SQL：**

```sql
SELECT EXISTS(SELECT 1 FROM users WHERE name = '张三' AND age = 25) AS "exists";
```

### 小节

1. **性能优化：`exists()` 比 `count() > 0` 快得多！**

   - `count()`：数据库必须扫描所有匹配的记录来统计总数（例如匹配了 10 万条，就要数完 10 万条）。
   - `exists()`：数据库只要找到**第一条**匹配记录就立即停止扫描，返回 `True`。
     **所以，当你的目的仅仅是“判断有没有”时，永远用 `exists()`，不要用 `count() > 0`。**

2. **`exists()` 忽略 `limit`、`offset` 和 `order_by`**
   既然它只看“有没有”，排序和分页对它没有意义。

   ```python
   # ❌ 多余：加 limit 对 exists 没有意义
   exists = await User.filter(age__gt=20).limit(10).exists()
   # ✅ 等价于
   exists = await User.filter(age__gt=20).exists()
   ```

   

3. **典型使用场景（防重复检查）**

   ```python
   # 创建用户前，检查用户名是否已被占用
   username = "张三"
   if await User.filter(name=username).exists():
       print("该用户名已被注册，请更换")
   else:
       await User.create(name=username, age=25)
   ```

   

4. **千万不要在循环里频繁调用 `exists()`（N+1 问题）**
   如果 `for` 循环里每次都查一次数据库判断是否存在，性能会急剧下降。这种情况下，应该用 `prefetch_related` 或一次性查询全部数据到内存里判断。



## 取指定字段

### 🔍 方法定义（三种）

当一张表有几十个字段，而你只需要其中 2~3 个时，这三种方法可以**大幅减少数据传输量**和**提升查询性能**。

| 方法                             | 返回类型                                      | 说明                                                         |
| :------------------------------- | :-------------------------------------------- | :----------------------------------------------------------- |
| `values("字段1", "字段2")`       | **字典列表** `[{"id":1, "name":"张三"}, ...]` | 最常用，适合直接返回给 API（因为 FastAPI 可以直接序列化字典） |
| `values_list("字段1", "字段2")`  | **元组列表** `[(1, "张三"), (2, "李四")]`     | 内存更省，适合批量处理数据                                   |
| `values_list("字段", flat=True)` | **单值列表** `[1, 2, 3]`                      | 只取一个字段时使用                                           |
| `only("字段1", "字段2")`         | **模型实例列表**（未取的字段延迟加载）        | 仍返回 `User` 对象，但只预加载指定字段，支持后续按需加载     |

**对应的 SQL 结构（三者完全相同）：**

```sql
SELECT 字段1, 字段2 FROM users;
```

三者的 SQL 完全一样，区别在于 **ORM 如何把查到的数据“包装”给你**。

### 📝 示例 1：`values()` —— 返回字典列表（最推荐）

**需求：** 只取所有用户的 `id` 和 `name`。

**Python 代码：**

```python
data = await User.all().values("id", "name")
print(data)
```

**控制台输出：**

```
[{'id': 1, 'name': '张三'}, {'id': 2, 'name': '李四'}, {'id': 3, 'name': '王五'}]
```

**对应 SQL：**

```sql
SELECT id, name FROM users;
```

**适用场景**：最常用。FastAPI 可以直接返回这个列表（`return data`），无需再做转换。

### 📝 示例 2：`values_list()` —— 返回元组列表

**需求：** 只取所有用户的 `id` 和 `name`，但想要元组格式（省内存）。

**Python 代码：**

```python
data = await User.all().values_list("id", "name")
print(data)
```

**控制台输出：**

```
[(1, '张三'), (2, '李四'), (3, '王五')]
```

**对应 SQL：**

```sql
SELECT id, name FROM users;
```

**适用场景**：当你需要遍历处理数据，并且不关心字段名（只关心位置顺序）时，元组列表比字典列表更省内存。

### 📝 示例 3：`values_list("字段", flat=True)` —— 只取一个字段的值

**需求：** 只取所有用户的 `id` 列表。

**Python 代码：**

```python
ids = await User.all().values_list("id", flat=True)
print(ids)
```

**控制台输出：**

```text
[1, 2, 3]
```

**对应 SQL：**

```sql
SELECT id FROM users;
```

**适用场景**：提取 ID 列表用于后续批量查询（如 `User.filter(id__in=ids)`），或传给前端做下拉选项。

### 📝 示例 4：`only()` —— 返回模型实例（延迟加载）

**需求：** 只预加载 `id` 和 `name`，但仍然希望使用模型实例（而不是字典）。

**Python 代码：**

```python
users = await User.all().only("id", "name")
print(users[0].name)     # 直接可用，不查库
print(users[0].age)      # ⚠️ 因为 age 没取，访问它时会再发一条 SQL 查询
```

**初始 SQL（取出数据时）：**

```sql
SELECT id, name FROM users;
```

**当你访问 `users[0].age` 时，额外触发：**

```sql
SELECT * FROM users WHERE id = 1;
```

**适用场景**：你大部分时候只需要 `name` 和 `id`，但极个别情况下需要访问其他字段（且你能接受偶尔的额外查询）。**新手不建议用，容易踩 N+1 的坑，直接用 `values()` 更安全。**

### 🆚 三个方法的核心区别

| 方法            | 返回格式         | 是否仍为模型实例 | 访问未取的字段           | 推荐度             |
| :-------------- | :--------------- | :--------------- | :----------------------- | :----------------- |
| `values()`      | **字典列表**     | ❌ 不是           | 无法访问（没有该键）     | ⭐⭐⭐⭐⭐（最推荐）    |
| `values_list()` | **元组列表**     | ❌ 不是           | 无法访问                 | ⭐⭐⭐⭐（内存敏感时） |
| `only()`        | **模型实例列表** | ✅ 是             | **触发额外 SQL**（风险） | ⭐⭐（不推荐新手）   |

### 小节

1. **优先用 `values()`，不要纠结**：
   它是三者中最安全、最直观的。返回的字典能直接被 FastAPI 序列化为 JSON，且不会触发任何额外查询。

2. **`only()` 是“懒加载”，不是“只取这些字段并丢弃其他”**：
   很多人误以为 `only("id", "name")` 会永久丢弃其他字段。实际上，ORM 只是“延迟加载”——当你访问未取字段时，它会默默发一条新 SQL 去补查。**在生产环境中，这极易引发 N+1 查询**，建议新手只把它理解为“高级优化手段”，而非日常工具。

3. **在 `filter` 之后使用**：
   所有字段选择方法都写在 `filter`/`order_by` 之后、`limit` 之前。

   ```python
   # ✅ 正确
   data = await User.filter(age__gt=20).order_by("-age").values("id", "name")
   
   # ❌ 错误（values 必须在 limit 之前）
   data = await User.filter(age__gt=20).limit(10).values("id", "name")  # SQL 语法错误
   ```

## 反向关系查询

**数据结构**

```python
# models/user.py
from tortoise import fields, models

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50)
    age = fields.IntField()

    class Meta:
        table = "users"

class Post(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    content = fields.TextField()
    # 外键：多对一，一个用户有多篇文章
    author = fields.ForeignKeyField("models.User", related_name="posts")

    class Meta:
        table = "posts"
```

**当前数据库 `users` 表数据：**

| id   | name | age  |
| :--- | :--- | :--- |
| 1    | 张三 | 25   |
| 2    | 李四 | 30   |

**当前数据库 `posts` 表数据：**

| id   | title | author_id |
| :--- | :---- | :-------- |
| 1    | 标题A | 1         |
| 2    | 标题B | 1         |
| 3    | 标题C | 2         |

### 🔍 概念定义（理解什么是“反向查询”）

- **正向查询**：从“多”的一方查“一”的一方（`Post` → `User`）。
  例如：`await post.author` —— 通过文章实例直接拿作者。
- **反向查询**：从“一”的一方查“多”的一方（`User` → `Post`）。
  例如：`await user.posts.all()` —— 通过用户实例拿他写的所有文章。

**`related_name`** 就是你在 `ForeignKeyField` 中给“一”的一方（`User`）安装的“反向遥控器”，它决定了你在 `User` 实例上用什么名字去查关联的 `Post` 列表。

**对应的 SQL 结构（反向查询本质）：**

```sql
SELECT * FROM posts WHERE author_id = ?;
```

### 📝 示例 1：基础反向查询（`.all()`）

**需求：** 查询 ID 为 1 的用户（张三）写的所有文章。

**Python 代码：**

```python
# 先拿到用户
user = await User.get(id=1)

# 通过 related_name="posts" 反向查询他的所有文章
posts = await user.posts.all()

for post in posts:
    print(post.title)
```

**控制台输出：**

```text
标题A
标题B
```

**对应 SQL（实际执行了两条）：**

```sql
-- 第 1 条：拿用户
SELECT * FROM users WHERE id = 1 LIMIT 1;

-- 第 2 条：拿他的文章
SELECT * FROM posts WHERE author_id = 1;
```

### 📝 示例 2：反向过滤（`.filter()`）

**需求：** 查询 ID 为 1 的用户（张三）写的、标题包含“标题”的文章。

**Python 代码：**

```python
user = await User.get(id=1)
posts = await user.posts.filter(title__contains="标题")

for post in posts:
    print(post.title)
```

**控制台输出：**

```text
标题A
标题B
```

**对应 SQL：**

```sql
SELECT * FROM posts WHERE author_id = 1 AND title LIKE '%标题%';
```

### 📝 示例 3：反向计数（`.count()`）

**需求：** 统计 ID 为 2 的用户（李四）一共写了多少篇文章。

**Python 代码：**

```python
user = await User.get(id=2)
count = await user.posts.count()
print(count)  # 输出：1
```

**对应 SQL：**

```sql
SELECT COUNT(*) FROM posts WHERE author_id = 2;
```

### 📝 示例 4：反向排序与分页

**需求：** 查询 ID 为 1 的用户（张三）的文章，按 ID 降序排列，取前 1 条。

**Python 代码：**

```python
user = await User.get(id=1)
post = await user.posts.order_by("-id").first()
print(post.title)  # 输出：标题B（因为 id=2 > id=1）
```

**对应 SQL：**

```sql
SELECT * FROM posts WHERE author_id = 1 ORDER BY id DESC LIMIT 1;
```



### 小节

1. **一定要写 `related_name`，不要依赖默认值！**
   如果你不写 `related_name`，Tortoise 会生成一个默认名字（例如 `post_set`）。

   ```python
   # 不写 related_name
   author = fields.ForeignKeyField("models.User")  
   # 反向查询时就必须用难记的默认名：
   posts = await user.post_set.all()  
   ```

   **工程化铁律**：永远显式指定 `related_name`，哪怕你暂时用不到，也要起一个有意义的名字（如 `posts`、`comments`），避免后期维护时遗忘。

2. **反向查询也会触发 N+1 问题（性能大坑）**
   如果你在循环里做反向查询，会发 N+1 条 SQL：

   ```python
   # ❌ 错误写法（N+1 问题）
   users = await User.all()
   for user in users:
       posts = await user.posts.all()  # 每次循环都查一次数据库
       print(len(posts))
   ```

   这段代码会发 `1（查用户） + N（查每个用户的文章）` 条 SQL。
   **解决方案**： `prefetch_related` 一次性预加载。

3. **反向查询返回的是 `QuerySet`**
   `user.posts` 是一个 `QuerySet` 对象，你可以对它使用 `.filter()`、`.order_by()`、`.limit()`、`.count()`、`.exists()` 等所有前面学过的方法。

## 预加载

### 🔍 什么是 N+1 查询？（先看错误写法）

**❌ 错误写法（性能杀手）：**

```python
# 需求：打印所有帖子的标题和作者名字
posts = await Post.all()
for post in posts:
    # 每循环一次，都去数据库查一次作者
    author = await post.author
    print(post.title, author.name)
```



**实际执行的 SQL 数量 = 1（查帖子） + N（查作者）**

```sql
-- 第 1 条（查帖子）
SELECT * FROM posts;

-- 第 2 条（查帖子1的作者）
SELECT * FROM users WHERE id = 1;

-- 第 3 条（查帖子2的作者）
SELECT * FROM users WHERE id = 1;

-- 第 4 条（查帖子3的作者）
SELECT * FROM users WHERE id = 2;
```

如果帖子有 100 条，就会执行 101 条 SQL，速度极慢。这就是经典的 **N+1 查询问题**。

#### ✅ `prefetch_related()` 的解决方案

**正确写法：**

```python
# 一次性把作者也预加载好
posts = await Post.all().prefetch_related("author")

# 遍历时直接拿，不再查库
for post in posts:
    print(post.title, post.author.name)  # ✅ 不再触发额外 SQL
```

**实际执行的 SQL（只有 2 条）：**

```sql
-- 第 1 条：查帖子
SELECT * FROM posts;

-- 第 2 条：查所有涉及的用户（一次性全部取回）
SELECT * FROM users WHERE id IN (1, 2);
```

100 条帖子，SQL 总数从 **101 条** 降为 **2 条**，性能提升巨大。

### 📝 示例 1：预加载单层关系（最常用）

**需求：** 查询所有帖子，并显示作者名字。

```python
posts = await Post.all().prefetch_related("author")
for post in posts:
    print(post.title, post.author.name)
```

**SQL 执行：**

```sql
SELECT * FROM users;
SELECT * FROM posts WHERE author_id IN (1, 2);
```

### 📝 示例 3：预加载多级关系（跨表链）

**需求：** 如果 `Post` 还有 `comments` 关系，你要一次预加载作者和评论。

```python
# 假设 Post 有 comments 反向关系
posts = await Post.all().prefetch_related("author", "comments")
# 或连写：
posts = await Post.all().prefetch_related("author__comments")
```

`"author__comments"` 中的 `__` 表示“两级”：先去拿 `Post` 的作者，再拿该作者的评论。

### 小节

1. **预加载在 `filter` 之后、`limit` 之前调用**

   ```python
   # ✅ 正确顺序
   posts = await Post.filter(title__contains="A").prefetch_related("author").limit(10)
   ```

2. **`prefetch_related` 不是越多越好**
   每次 `prefetch_related` 都会增加一条额外的 SQL。如果你预加载了 3 个关系，总 SQL 数 = 1（主表）+ 3（子表）。**只预加载你真正会用到的关系**，不要为了“以防万一”全部加载。

3. **预加载不会自动生效于 `.values()`**
   如果你用了 `.values()`，ORM 返回的是字典，不再有对象关联的概念，`prefetch_related` 会被忽略。

   ```python
   # ❌ prefetch_related 在这里无效
   data = await Post.all().prefetch_related("author").values("id", "title")
   ```

   因为 `values()` 返回字典，没有 `post.author` 这个对象属性了。

## 聚合与注解

### 🔍 概念定义

- **聚合（Aggregation）**：对一组数据做数学计算，例如：总和（`Sum`）、平均值（`Avg`）、最大值（`Max`）、最小值（`Min`）、计数（`Count`）。
- **注解（Annotation）**：在查询结果的**每一行**上，动态添加一个计算出来的“临时字段”。这个字段不是数据库里真实存在的列，而是计算出来的。

**数据结构**

```python
# models/user.py
from tortoise import fields, models

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50)

    class Meta:
        table = "users"

class Post(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    view_count = fields.IntField(default=0)          # 新增：浏览量
    author = fields.ForeignKeyField("models.User", related_name="posts")

    class Meta:
        table = "posts"
```

**当前数据库数据：**

`users` 表：

| id   | name |
| :--- | :--- |
| 1    | 张三 |
| 2    | 李四 |

`posts` 表：

| id   | title | view_count | author_id |
| :--- | :---- | :--------- | :-------- |
| 1    | 标题A | 10         | 1         |
| 2    | 标题B | 20         | 1         |
| 3    | 标题C | 5          | 2         |

### 🔍 概念定义

- **聚合（Aggregation）**：对一组数据做数学计算，例如：总和（`Sum`）、平均值（`Avg`）、最大值（`Max`）、最小值（`Min`）、计数（`Count`）。
- **注解（Annotation）**：在查询结果的**每一行**上，动态添加一个计算出来的“临时字段”。这个字段不是数据库里真实存在的列，而是计算出来的。

**对应的 SQL 结构（核心）：**

```sql
SELECT 
    主表字段, 
    COUNT(关联表.id) AS 临时字段名   -- 这就是注解
FROM 主表
GROUP BY 主表.id;                   -- 分组（按主表每一条记录分组）
```

### 📝 示例 1：`Count` —— 统计每个用户写了多少篇文章

**需求：** 查所有用户，并统计每个人的文章总数。

**Python 代码：**

```python
from tortoise.functions import Count

# 查询所有用户，并注解一个叫 "post_count" 的字段
users = await User.all().annotate(post_count=Count("posts"))

for user in users:
    print(user.name, user.post_count)  # post_count 是临时加上的属性
```

**控制台输出：**

```text
张三 2
李四 1
```

**对应 SQL：**

```sql
SELECT 
    users.id, 
    users.name, 
    COUNT(posts.id) AS post_count 
FROM users 
LEFT JOIN posts ON users.id = posts.author_id 
GROUP BY users.id;
```

### 📝 示例 2：`Sum` —— 统计每个用户文章的总浏览量

**需求：** 统计每个用户所有文章的浏览量总和。

**Python 代码：**

```python
from tortoise.functions import Sum

users = await User.all().annotate(total_views=Sum("posts__view_count"))

for user in users:
    print(user.name, user.total_views)
```

**控制台输出：**

```text
张三 30   (10 + 20)
李四 5
```

**对应 SQL：**

```sql
SELECT 
    users.id, 
    users.name, 
    SUM(posts.view_count) AS total_views 
FROM users 
LEFT JOIN posts ON users.id = posts.author_id 
GROUP BY users.id;
```

### 📝 示例 3：`Avg` —— 统计每个用户文章的平均浏览量

**需求：** 统计每个用户所有文章的平均浏览量。

**Python 代码：**

```python
from tortoise.functions import Avg

users = await User.all().annotate(avg_views=Avg("posts__view_count"))

for user in users:
    print(user.name, user.avg_views)
```

**控制台输出：**

```text
张三 15.0   ( (10+20)/2 )
李四 5.0
```

### 📝 示例 4：配合 `filter` 使用（对注解结果过滤 —— `HAVING`）

**需求：** 查出那些**文章总数大于 1** 的用户。

```python
from tortoise.functions import Count

users = await User.all().annotate(post_count=Count("posts")).filter(post_count__gt=1)

for user in users:
    print(user.name, user.post_count)
```

**控制台输出：**

```text
张三 2
```

**对应的 SQL（注意多了一个 `HAVING`）：**

```sql
SELECT 
    users.id, 
    users.name, 
    COUNT(posts.id) AS post_count 
FROM users 
LEFT JOIN posts ON users.id = posts.author_id 
GROUP BY users.id 
HAVING post_count > 1;   -- 对分组后的结果进行过滤
```

### 小节

1. **`annotate` 必须放在 `filter` 和 `order_by` 之后**：
   正确顺序：`.filter(...).annotate(...).order_by(...).limit(...)`。先筛选数据，再计算注解，最后排序分页。
2. **注解生成的字段名必须是唯一的**：
   `post_count=Count("posts")` 中的 `post_count` 是你自定义的临时属性名，不能与模型中已有的字段名重复。
3. **`annotate` 会在查询中自动添加 `GROUP BY`**：
   如果你没有显式写 `group_by`，Tortoise 会默认按主表的主键分组。
4. **使用 `filter` 过滤注解结果时，会生成 `HAVING` 子句**：
   `.filter(post_count__gt=1)` 会被翻译成 SQL 的 `HAVING`，而不是 `WHERE`。这意味着它是在分组**之后**才进行过滤。
5. **`annotate` 返回的依然是模型实例**：
   与 `values()` 不同，`annotate` 仍然返回 `User` 对象，只是多了一个临时的 `post_count` 属性。你可以继续使用 `user.name`、`user.id` 等原有字段。

## 开发注意事项

### 铁律 1：永远不要“裸查”全表

- **错误**：`await Model.all()`（无 `limit`、无 `filter`、无 `values`）
- **正确**：`await Model.all().limit(20)` 或 `await Model.filter(...)`
- **原因**：数据量超过 1000 条时，内存和响应时间都会失控。

### 铁律 2：只拿你需要的字段（拒绝 `SELECT *`）

- **错误**：`await User.all()`（取 20 个字段）
- **正确**：`await User.all().values("id", "name")` 或 `only("id", "name")`
- **原因**：减少数据库 I/O、网络传输和内存占用。如果模型有 `TextField` 或 `JSONField`，影响更明显。

### 铁律 3：判断“有没有”用 `exists()`，不要用 `count() > 0`

- **错误**：`if await User.filter(age=18).count() > 0:`
- **正确**：`if await User.filter(age=18).exists():`
- **原因**：`exists()` 查到第一条就停，`count()` 必须数完所有匹配记录才返回。

### 铁律 4：循环里绝对禁止查数据库（N+1 必须用 `prefetch_related`）

- **错误**：

  ```python
  for post in posts:
      user = await post.author  # 每次循环都发 SQL 或者是post.author.name 这样也会触发 SQL
  ```

- **正确**：

  ```python
  posts = await Post.all().prefetch_related("author")
  for post in posts:
      user = post.author  # 已预加载，不触发新 SQL
  ```

- **原因**：`N+1` 是性能黑洞，100 条数据就是 101 次 SQL。

### 铁律 5：深分页（大偏移量）必须用“游标分页”替代 `offset`

- **问题**：`offset 10000 limit 10`，数据库必须扫描并跳过前 10000 条，越往后越慢。

- **解决方案**：改用“游标分页”（基于排序字段）

  ```python
  # ❌ 深分页（第 1000 页）
  users = await User.all().offset(10000).limit(10)
  
  # ✅ 游标分页（基于 id）
  last_id = 10000
  users = await User.filter(id__gt=last_id).order_by("id").limit(10)
  ```

  或基于时间：

  ```python
  last_time = "2025-01-01 00:00:00"
  users = await User.filter(created_at__gt=last_time).order_by("created_at").limit(10)
  ```

### 铁律 6：高频查询字段必须加索引

- **问题**：`User.filter(email="xxx")` 每次都要全表扫描。

- **解决方案**：在模型定义中明确添加 `db_index=True`：

  ```python
  email = fields.CharField(max_length=100, db_index=True)
  ```

- **复合索引**（多个字段组合查询）：

  ```python
  class Meta:
      indexes = [("email", "age")]
  ```

### 铁律 7：打开 SQL 日志，时刻监控真实 SQL

- 开发环境：`TORTOISE_ORM` 配置中添加 `"echo": True`，每次请求都能看到 ORM 发了什么 SQL。
- 生产环境：关闭 `echo`，改用 `logging` 记录慢查询日志。

# DML操作

## 插入数据 

#### 1. `create()` —— 插入单条记录

**作用**：创建一条新记录并插入数据库。插入后返回包含新数据（含自增 `id`）的模型实例。

**Python 代码：**

```python
# 创建并插入一条用户数据
user = await User.create(
    name="赵六", 
    age=28, 
    email="zhao@example.com"
)

print(user.id)      # 输出：1（自动生成的主键）
print(user.name)    # 输出：赵六
```

**对应的 SQL：**

```sql
INSERT INTO users (name, age, email) 
VALUES ('赵六', 28, 'zhao@example.com');

-- 执行后，数据库自动生成 id=1
```



**执行的流程：**

1. 执行 `INSERT` 语句。
2. 数据库返回新插入行的主键 `id`。
3. ORM 将主键赋值给 `user.id`。
4. 返回完整的 `User` 实例。

------

#### 2. `bulk_create()` —— 批量插入（高性能）

**作用**：一次性插入多条记录，只执行 **1 条 SQL**，大幅提升插入性能。

**Python 代码：**

```python
# 准备多个 User 实例（注意：此时它们还没有 id）
users_data = [
    User(name="A", age=18, email="a@example.com"),
    User(name="B", age=19, email="b@example.com"),
    User(name="C", age=20, email="c@example.com"),
]

# 批量插入
await User.bulk_create(users_data)
```



**执行后的结果：**

- 数据库新增 3 条记录，`id` 被自动分配为 2、3、4（假设之前已有 id=1）。
- **注意**：`bulk_create()` **不会返回插入后的实例**（即 `users_data` 中的对象的 `id` 属性不会自动更新）。如果后续代码需要使用这些对象的 `id`，请改用循环 `create()`。

**对应的 SQL：**

```sql
INSERT INTO users (name, age, email) VALUES 
('A', 18, 'a@example.com'),
('B', 19, 'b@example.com'),
('C', 20, 'c@example.com');
```



------

#### ⚠️ 避坑指南（少走弯路）

1. **`bulk_create()` 不返回实例，也不填充 `id`**
   - 批量插入后，`users_data[0].id` 依然是 `None`（没有自动赋值）。
   - 如果后续代码需要用到这些对象的 `id`，请使用循环 `create()`，或手动查询。
2. **批量插入的数据量建议控制在 1000 条以内**
   - 单条 SQL 过大可能导致数据库报错（如 `max_allowed_packet` 限制）。如果数据量更大，建议分批插入。
3. **插入前要确保数据合法**
   - 如果 `email` 字段有 `unique=True` 约束，重复插入会抛出 `IntegrityError` 异常。
   - 建议插入前先用 `exists()` 检查。
4. **`create()` 和 `bulk_create()` 在事务中的行为**
   - 如果在事务中执行批量插入，发生异常时整个事务回滚，所有插入都会撤销。
   - 这通常是期望的行为。

## 更新数据

