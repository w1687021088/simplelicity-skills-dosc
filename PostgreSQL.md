# DDL

**数据库与模式**

``` sql
-- 创建数据库
CREATE DATABASE mydb
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TEMPLATE = template0;

-- 修改数据库名
ALTER DATABASE mydb RENAME TO newdb;

-- 删除数据库
DROP DATABASE IF EXISTS newdb;

-- 创建模式
CREATE SCHEMA sales AUTHORIZATION app_user;

-- 设置搜索路径
SET search_path TO sales, public;

-- 删除模式
DROP SCHEMA sales CASCADE;
```



## 删表

```sql
DROP TABLE products;
```

如果表不存在会报错，加 `IF EXISTS`：

```sql
DROP TABLE IF EXISTS products;
```

**删表会把数据一起删掉。**



## 修改表

**加一列：**

```sql
ALTER TABLE products ADD COLUMN description text;
```

**删一列：**

```sql
ALTER TABLE products DROP COLUMN description;
```

**改列类型：**

```sql
ALTER TABLE products ALTER COLUMN price TYPE bigint;
```



## 创建表

**语法**

``` sql
CREATE TABLE 表名 (
  列名 类型 约束,
  列名 类型 约束,
  列名 类型 约束
);
```

**常用类型**

| 类型            | 只能放什么 | 例子        |
| :-------------- | :--------- | :---------- |
| `text`          | 文字       | '鼠标'      |
| `integer`       | 整数       | 99          |
| `bigint`        | 更大的整数 | 99999999    |
| `numeric(10,2)` | 精确小数   | 99.00       |
| `timestamptz`   | 时间       | now()       |
| `boolean`       | 真假       | true、false |



约束 = 规则。

常用的有 5 个：

| 约束          | 意思                | 写法                               |
| :------------ | :------------------ | :--------------------------------- |
| `NOT NULL`    | 不能空              | `name text NOT NULL`               |
| `UNIQUE`      | 不能重复            | `email text UNIQUE`                |
| `DEFAULT`     | 不填时的默认值      | `stock integer DEFAULT 0`          |
| `CHECK`       | 必须满足的条件      | `price integer CHECK (price >= 0)` |
| `PRIMARY KEY` | 主键，唯一 + 不能空 | `id bigint PRIMARY KEY`            |

约束可以叠加：

```sql
列名 integer NOT NULL DEFAULT 0 CHECK (stock >= 0)
```

意思是：不能空，默认 0，不能是负数。



### 主键

主键是每一行的唯一编号。

```text
id  | name
1   | 鼠标
2   | 键盘
```

id 就是主键。

**两个规则：**

1. 不能重复
2. 不能为空

**标准写法：**

```sql
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

| 部分                           | 意思               |
| :----------------------------- | :----------------- |
| `bigint`                       | 大整数             |
| `GENERATED ALWAYS AS IDENTITY` | 自动生成 1、2、3…… |
| `PRIMARY KEY`                  | 主键               |

**记忆口诀：id bigint 自增 主键。**



### 时间列

每张表都应该有创建时间。

```sql
created_at timestamptz NOT NULL DEFAULT now()
```

翻译：带时区的时间，不能空，默认当前时间。



### CHECK

**行内（写在列后面）：**

```sql
CREATE TABLE products (
  price numeric(10,2) CHECK (price >= 0),
  stock integer CHECK (stock >= 0)
);
```

**尾部（写在所有列后面）：**

```sql
CREATE TABLE products (
  price numeric(10,2),
  stock integer,
  CHECK (price >= 0),
  CHECK (stock >= 0)
);
```

两种都能用，效果一样。



**多列用尾部**

比如“结束时间必须晚于开始时间”，涉及两列：

```sql
CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  CHECK (end_at > start_at)
);
```

`CHECK (end_at > start_at)` 涉及两列，写在尾部。



**如果你想给约束起名字，有时会统一写尾部。**

```sql
CREATE TABLE products (
  price numeric(10,2) NOT NULL,
  stock integer NOT NULL,
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT stock_positive CHECK (stock >= 0)
);
```

起名字的好处：报错信息清楚，删约束方便。



### 注意

#### 金额用 numeric 不用 float

```sql
price float          -- 错
price numeric(10,2)  -- 对
```

`float` 算 0.1 + 0.2 会得到 0.30000000000000004，会丢精度。

`numeric` 是精确小数，不会丢。

**金额一律用 numeric。**

`numeric(10,2)` 意思是：总共 10 位数字，2 位小数，最大 99999999.99。



#### 时间用 timestamptz

```sql
created_at timestamp    -- 错，不带时区
created_at timestamptz  -- 对，带时区
```

`timestamp` 不带时区，跨时区会出错。

`timestamptz` 带时区，自动转换。

**时间一律用 timestamptz。**



####  ID 用 bigint

```sql
id integer   -- 最大 21 亿，可能溢出
id bigint    -- 够用到天荒地老
```

用户量大的系统，ID 可能超过 21 亿。

**ID 一律用 bigint。**



#### 文字用 text 不用 varchar(50)

```sql
name varchar(50)   -- 只能放 50 个字符
name text          -- 不限长度
```

PostgreSQL 里 `text` 和 `varchar` 性能一样。

用 `varchar(50)` 的麻烦：万一名字超过 50 个字，报错。

**文字一律用 text。**

真想限制长度，用 CHECK：

```sql
name text CHECK (length(name) <= 50)
```

### **模板：**

```sql
CREATE TABLE 表名 (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  列名 类型 NOT NULL,
  列名 类型 DEFAULT 值,
  列名 类型 CHECK (条件),
  created_at timestamptz NOT NULL DEFAULT now()
);
```



# DQL



## SELECT

**SELECT 的完整结构**

```sql
SELECT 列
FROM 表
WHERE 条件
GROUP BY 分组列
HAVING 分组条件
ORDER BY 排序列
LIMIT 数量;
```

**这是 SELECT 的完整写法。**



**执行顺序不是从上到下，而是：**

```text
1. FROM        先找表
2. WHERE       过滤行
3. GROUP BY    分组
4. HAVING      过滤分组
5. SELECT      挑列、算列
6. ORDER BY    排序
7. LIMIT       限制条数
```

**查所有列：**

```sql
SELECT * FROM products;
```

**查指定列：**

```sql
SELECT name, price FROM products;
```

**算出来的列：**

```sql
SELECT name, price, price * 2 FROM products;
```

`price * 2`：把每一行的价格乘以 2，作为一个计算出来的新列，它**不会修改原表数据**，只是查询并显示结果。

**起别名：**

```sql
SELECT name AS 商品名, price AS 价格 FROM products;
```

别名不加 `AS` 也行：

```sql
SELECT name 商品名, price 价格 FROM products;
```



## WHERE 条件

``` sql
SELECT * FROM products WHERE price > 100;
```

| 写法 | 意思     | 例子                   |
| :--- | :------- | :--------------------- |
| `=`  | 等于     | `WHERE name = '鼠标'`  |
| `>`  | 大于     | `WHERE price > 100`    |
| `<`  | 小于     | `WHERE price < 100`    |
| `>=` | 大于等于 | `WHERE price >= 100`   |
| `<=` | 小于等于 | `WHERE price <= 100`   |
| `<>` | 不等于   | `WHERE name <> '鼠标'` |

```sql
-- 1. 等于
SELECT * FROM products WHERE name = '鼠标';

-- 2. 大于
SELECT * FROM products WHERE price > 100;

-- 3. 小于
SELECT * FROM products WHERE price < 100;

-- 4. 大于等于
SELECT * FROM products WHERE price >= 199;

-- 5. 小于等于
SELECT * FROM products WHERE price <= 199;

-- 6. 不等于
SELECT * FROM products WHERE name <> '鼠标';
```



## AND / OR / NOT 与或非

`AND / OR / NOT` 就是 SQL 里的逻辑运算符，用来把多个条件组合起来

```sql
-- 1. AND
SELECT * FROM products WHERE price > 100 AND name = '键盘';

-- 2. OR
SELECT * FROM products WHERE name = '鼠标' OR name = '键盘';

-- 3. NOT
SELECT * FROM products WHERE NOT (price > 100);

-- 4. 混用加括号
SELECT * FROM products WHERE price > 100 AND (name = '鼠标' OR name = '键盘');

-- 5. 不加括号，看看结果是不是你想的
SELECT * FROM products WHERE price > 100 AND name = '鼠标' OR name = '键盘';

-- 6. 对比一下 4 和 5 的结果

AND 并且，两个都要满足
OR  或者，满足一个就行
NOT 取反
混用 AND 和 OR，一律加括号

**NOT > AND > OR** 优先
```



## **IN 和 BETWEEN**范围

```sql
-- 1. IN
SELECT * FROM products WHERE name IN ('鼠标', '键盘');

-- 2. IN 数字
SELECT * FROM products WHERE price IN (19, 199);

-- 3. NOT IN
SELECT * FROM products WHERE name NOT IN ('鼠标', '键盘');

-- 4. BETWEEN
SELECT * FROM products WHERE price BETWEEN 100 AND 1000;

-- 5. NOT BETWEEN
SELECT * FROM products WHERE price NOT BETWEEN 100 AND 1000;

IN 是在列表里，等于多个 OR
BETWEEN 是范围，包含两端
NOT IN / NOT BETWEEN 是取反
```



## **LIKE 模糊匹配**

``` sql
-- 1. 以鼠开头
SELECT * FROM products WHERE name LIKE '鼠%';

-- 2. 以标结尾
SELECT * FROM products WHERE name LIKE '%标';

-- 3. 包含鼠
SELECT * FROM products WHERE name LIKE '%鼠%';

-- 4. 包含键盘
SELECT * FROM products WHERE name LIKE '%键盘%';

-- 5. NOT LIKE
SELECT * FROM products WHERE name NOT LIKE '%鼠%';

LIKE 模糊匹配
% 任意多字符，_ 一个字符
% 在开头会全表扫，慢
```



## NULL 空值

```sql
-- 1. 查 price 是 NULL
SELECT * FROM products WHERE price IS NULL;

-- 2. 查 price 不是 NULL
SELECT * FROM products WHERE price IS NOT NULL;

-- 3. 用 COALESCE
SELECT name, COALESCE(price, 0) FROM products;

-- 4. 算一列，NULL 参与运算
SELECT name, price * 2 FROM products;

-- 5. 用 COALESCE 兜底后再算
SELECT name, COALESCE(price, 0) * 2 FROM products;

-- 6. 对比聚合
SELECT COUNT(*), COUNT(price), AVG(price), SUM(price) FROM products;


NULL 是没有值
判断用 IS NULL / IS NOT NULL
不能用 = 判断
NULL 参与运算结果是 NULL
COALESCE 把 NULL 换成别的值
聚合函数忽略 NULL
```



## COALESCE 兜底

```sql
-- 用 COALESCE 兜底后再算
SELECT name, COALESCE(price, 0) * 2 FROM products;
```



## ORDER BY 排序

``` sql
-- 1. 按 price 升序
SELECT * FROM products ORDER BY price;

-- 2. 按 price 降序
SELECT * FROM products ORDER BY price DESC;

-- 3. 按 name 升序
SELECT * FROM products ORDER BY name;

-- 4. 多列排序
SELECT * FROM products ORDER BY price DESC, name ASC;

-- 5. NULL 排最前
SELECT * FROM products ORDER BY price NULLS FIRST;

-- 6. 按别名排序
SELECT name, price * 2 AS 双倍 FROM products ORDER BY 双倍 DESC;

ORDER BY 列名，默认升序
DESC 降序
多个列用逗号隔开，每列单独指定升降
```

## LIMIT 和 OFFSET

```sql
-- 1. 取前 5 条
SELECT * FROM products ORDER BY id LIMIT 5;

-- 2. 取 6 到 10 条
SELECT * FROM products ORDER BY id LIMIT 5 OFFSET 5;

-- 3. 第 3 页（每页 5 条）
SELECT * FROM products ORDER BY id LIMIT 5 OFFSET 10;

-- 4. 按价格降序取前 3
SELECT * FROM products ORDER BY price DESC LIMIT 3;

-- 5. 看总行数
SELECT COUNT(*) FROM products;

LIMIT 取几条，OFFSET 跳过几条
分页必须配合 ORDER BY
OFFSET 越大越慢
```



## DISTINCT 去重

```sql
-- 1. 查所有 name（有重复）
SELECT name FROM products;

-- 2. 去重后的 name
SELECT DISTINCT name FROM products;

-- 3. 去重后的 price
SELECT DISTINCT price FROM products;

-- 4. 多列去重
SELECT DISTINCT name, price FROM products;

-- 5. 数有几个不同的 name
SELECT COUNT(DISTINCT name) FROM products;

-- 6. DISTINCT + ORDER BY
SELECT DISTINCT name FROM products ORDER BY name;

DISTINCT 写在 SELECT 后面
去掉重复的行
多个列是组合去重
```



## **聚合函数（COUNT / SUM / AVG / MAX / MIN）**

```sql
-- 1. 数行数
SELECT COUNT(*) FROM products;

-- 2. 数非 NULL 的 price
SELECT COUNT(price) FROM products;

-- 3. 求和
SELECT SUM(price) FROM products;

-- 4. 平均
SELECT AVG(price) FROM products;

-- 5. 最大最小
SELECT MAX(price), MIN(price) FROM products;

-- 6. 一次查多个
SELECT COUNT(*) AS 总数, SUM(price) AS 总和, AVG(price) AS 平均 FROM products;

-- 7. 配 WHERE
SELECT COUNT(*) FROM products WHERE price > 100;

-- 8. 对比 COUNT(*) 和 COUNT(price)
SELECT COUNT(*) AS 全部行, COUNT(price) AS 有价格的 FROM products;

COUNT 数数，SUM 求和，AVG 平均，MAX 最大，MIN 最小
聚合函数忽略 NULL
COUNT(*) 数所有行，COUNT(列) 只数非 NULL
```



## **GROUP BY 分组**

**把数据按某个列分成组，每组单独统计**

也同时具有去重的效果

```sql
-- 1. 每个分类有几个商品
SELECT category, COUNT(*) FROM products GROUP BY category;

-- 2. 每个分类的总价、平均价
SELECT category, SUM(price), AVG(price) FROM products GROUP BY category;

-- 3. 每个分类的总库存
SELECT category, SUM(stock) FROM products GROUP BY category;

-- 4. 分组后排序
SELECT category, COUNT(*) AS 数量 FROM products GROUP BY category ORDER BY 数量 DESC;

-- 5. 分组前过滤
SELECT category, COUNT(*) FROM products WHERE price > 100 GROUP BY category;

-- 6. 对比 DISTINCT
SELECT DISTINCT category FROM products;

GROUP BY 按某列分组
SELECT 里的列要么在 GROUP BY 里，要么被聚合
WHERE 在分组前，HAVING 在分组后
```

## HAVING 过滤分组

```sql
-- 1. 只看商品数大于 2 的分类
SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 2;

-- 2. 只看平均价大于 100 的分类
SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 100;

-- 3. 只看总库存大于 100 的分类
SELECT category, SUM(stock) FROM products GROUP BY category HAVING SUM(stock) > 100;

-- 4. WHERE + HAVING 一起用
SELECT category, COUNT(*) AS 数量
FROM products
WHERE price > 50
GROUP BY category
HAVING COUNT(*) >= 2;

-- 5. 完整组合
SELECT category, COUNT(*) AS 数量, AVG(price) AS 平均价
FROM products
WHERE stock > 0
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY 数量 DESC;



WHERE 过滤行，HAVING 过滤组
WHERE 在分组前，HAVING 在分组后
能放 WHERE 的就别放 HAVING
```

### WHERE 和 HAVING 的区别

**这是本讲最重要的知识点。**

|                | WHERE         | HAVING        |
| :------------- | :------------ | :------------ |
| 执行时机       | 分组**之前**  | 分组**之后**  |
| 过滤对象       | 行            | 组            |
| 能用聚合函数吗 | 不能          | 能            |
| 能用别名吗     | 不能          | 不能          |
| 位置           | GROUP BY 之前 | GROUP BY 之后 |

**一句话：WHERE 过滤行，HAVING 过滤组。**

## 组合

```sql
-- 1. 简单组合
SELECT * FROM products WHERE price > 50 ORDER BY price DESC;

-- 2. 加 LIMIT
SELECT * FROM products WHERE price > 50 ORDER BY price DESC LIMIT 2;

-- 3. 多条件
SELECT * FROM products WHERE price > 50 AND active = true ORDER BY price DESC;

-- 4. 多行格式
SELECT id, name, price
FROM products
WHERE price > 50
  AND active = true
ORDER BY price DESC
LIMIT 5;

-- 5. 算一列 + 排序
SELECT name, price, price * 2 AS 双倍
FROM products
WHERE active = true
ORDER BY 双倍 DESC
LIMIT 3;
```



## CASE WHEN 条件判断

**在 SQL 里写 if-else**

``` sql
-- 1. 价格等级
SELECT name, price,
  CASE
    WHEN price > 1000 THEN '贵'
    WHEN price > 100 THEN '中等'
    ELSE '便宜'
  END AS 价格等级
FROM products;

-- 2. 库存状态
SELECT name, stock,
  CASE
    WHEN stock = 0 THEN '缺货'
    WHEN stock < 50 THEN '库存紧张'
    ELSE '库存充足'
  END AS 库存状态
FROM products;

-- 3. 简写形式
SELECT name,
  CASE name
    WHEN '鼠标' THEN '输入设备'
    WHEN '键盘' THEN '输入设备'
    WHEN '显示器' THEN '输出设备'
    ELSE '其他'
  END AS 设备类型
FROM products;

-- 4. 自定义排序
SELECT * FROM products
ORDER BY
  CASE name
    WHEN '显示器' THEN 1
    WHEN '键盘' THEN 2
    WHEN '鼠标' THEN 3
    ELSE 4
  END;

-- 5. 聚合里用 CASE
SELECT
  COUNT(*) AS 总数,
  COUNT(CASE WHEN price > 1000 THEN 1 END) AS 贵的,
  COUNT(CASE WHEN price > 100 AND price <= 1000 THEN 1 END) AS 中等的,
  COUNT(CASE WHEN price <= 100 THEN 1 END) AS 便宜的
FROM products;

-- 6. 分组统计
SELECT
  category,
  COUNT(*) AS 总数,
  COUNT(CASE WHEN price > 500 THEN 1 END) AS 贵商品数
FROM products
GROUP BY category;


CASE WHEN 就是 SQL 里的 if-else
从上到下判断，第一个成立就返回
范围条件从大到小写，别忘了 ELSE
```

## **子查询**

大查询套小查询；

**返回一个值**

``` sql
-- 1. 先看平均价
SELECT AVG(price) FROM products;

-- 2. 比平均价贵的
SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);

-- 3. 比平均价便宜的
SELECT * FROM products WHERE price < (SELECT AVG(price) FROM products);

-- 4. 最贵的商品
SELECT * FROM products WHERE price = (SELECT MAX(price) FROM products);
```

**返回多个值**

``` sql


子查询返回一列多个值 → 用 IN
返回多行不能用 =，会报错
NOT IN 遇到 NULL 会永远返回空，记得过滤

-- 如果user_id 可能为空，整个结构都是 null，所以记得加上非空过滤
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);
```





# DML

###  插入

**插入数据**

``` sql
INSERT INTO products (name, price) VALUES ('鼠标', 99);
```

往 products 表里加一行，name 填鼠标，price 填 99。

**逐个字拆开**

```sql
INSERT INTO products (name, price) VALUES ('鼠标', 99);
```

| 词              | 意思                         |
| :-------------- | :--------------------------- |
| `INSERT INTO`   | 插入到                       |
| `products`      | 表名                         |
| `(name, price)` | 要填哪几列                   |
| `VALUES`        | 后面是值                     |
| `('鼠标', 99)`  | 值：name 是鼠标，price 是 99 |



**插入多行**

```sql
INSERT INTO products (name, price) VALUES
('鼠标', 99),
('键盘', 199),
('显示器', 1299);
```

一个 `INSERT`，插入三行。逗号隔开。



**RETURNING：插入后马上看结果**

```sql
INSERT INTO products (name, price) VALUES ('耳机', 899) RETURNING *;
```

`RETURNING *` 的意思是：插入后，把刚插入的这行返回给我。



**插入 NULL**

``` sql
-- 假设 email 没有 NOT NULL
INSERT INTO users (name, email) VALUES ('张三', NULL);
```



### 更新

**场景：** 鼠标降价了，从 19 改成 9。

```sql
UPDATE products
SET price = 9
WHERE name = '鼠标';
```

**口诀：**

```text
UPDATE 表 SET 列 = 新值 WHERE 条件;
```



**警告：不写 WHERE，会改掉所有行！**

```sql
UPDATE products SET price = 0;
```



### 删除

**场景：** 把鼠标下架，删掉这一行。

```sql
DELETE FROM products
WHERE name = '鼠标';
```

从 products 表里删掉 name 是鼠标的那一行。

**口诀：**

```text
DELETE FROM 表 WHERE 条件;
```



**警告：不写 WHERE，会删光整张表！**

```sql
DELETE FROM products;
```

这句会删掉所有数据。