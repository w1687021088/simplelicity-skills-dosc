> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# SQL 模式 SQL_MODE 详解

SQL_MODE 是 MySQL 中控制 SQL 语法严格程度和数据验证行为的系统变量。不同的 SQL_MODE 设置会影响 MySQL 如何处理无效数据、语法差异和查询行为。理解 SQL_MODE 对于避免数据质量问题、应用迁移兼容性问题至关重要。MySQL 8.4 的默认 SQL_MODE 与 8.0 一致。

---

## 查看和设置 SQL_MODE

```sql
-- 查看当前会话的 SQL_MODE：
SELECT @@sql_mode;
-- 或
SELECT @@SESSION.sql_mode;

-- 查看全局 SQL_MODE：
SELECT @@GLOBAL.sql_mode;

-- MySQL 8.0/8.4 默认值：
-- ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,
-- NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- 设置当前会话的 SQL_MODE：
SET SESSION sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 设置全局 SQL_MODE（影响新连接）：
SET GLOBAL sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES';

-- 持久化设置（重启后生效）：
SET PERSIST sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 在 my.cnf 中配置：
-- [mysqld]
-- sql_mode = ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- 添加某个模式（不覆盖现有设置）：
SET SESSION sql_mode = CONCAT(@@sql_mode, ',PIPES_AS_CONCAT');

-- 移除某个模式：
SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '');

-- 清空所有模式（最宽松）：
SET SESSION sql_mode = '';
```

---

## 默认 SQL_MODE 详解

### STRICT_TRANS_TABLES

```sql
-- 严格模式（针对事务型存储引擎如 InnoDB）
-- 开启时：插入无效数据会报错（而非截断或转换）

-- 开启 STRICT_TRANS_TABLES 时：
INSERT INTO t (int_col) VALUES ('abc');
-- ERROR 1366: Incorrect integer value: 'abc' for column 'int_col'

INSERT INTO t (varchar10_col) VALUES ('this string is longer than 10 characters');
-- ERROR 1406: Data too long for column 'varchar10_col'

-- 关闭 STRICT_TRANS_TABLES 时：
INSERT INTO t (int_col) VALUES ('abc');
-- 成功，int_col 被设为 0，产生 WARNING

INSERT INTO t (varchar10_col) VALUES ('this string is longer than 10 characters');
-- 成功，数据被截断为 10 个字符，产生 WARNING

-- 建议：生产环境始终开启
-- 原因：关闭时无效数据会被静默接受，导致数据质量问题
```

### ONLY_FULL_GROUP_BY

```sql
-- 要求 SELECT 列表中的非聚合列必须出现在 GROUP BY 中
-- 或者在功能上依赖于 GROUP BY 列

-- 开启时：
SELECT name, age, COUNT(*)
FROM users
GROUP BY name;
-- ERROR 1055: 'age' is not in GROUP BY clause and is not aggregated
-- 因为 age 没有在 GROUP BY 中，也没有用聚合函数包装

-- 正确写法：
SELECT name, MAX(age), COUNT(*)
FROM users
GROUP BY name;
-- 或
SELECT name, age, COUNT(*)
FROM users
GROUP BY name, age;

-- 关闭时：
SELECT name, age, COUNT(*)
FROM users
GROUP BY name;
-- 成功，但 age 的值是不确定的（从组中随机选一行）
-- 这在 MySQL 5.7 之前是默认行为

-- 特殊情况：如果 name 是主键或唯一键
-- 则 age 在功能上依赖于 name，即使开启也不报错
SELECT name, age, COUNT(*)
FROM users
GROUP BY name;  -- name 是主键时不报错

-- 使用 ANY_VALUE() 函数明确表示接受任意值：
SELECT name, ANY_VALUE(age), COUNT(*)
FROM users
GROUP BY name;
-- 开启 ONLY_FULL_GROUP_BY 时也不报错
```

### NO_ZERO_DATE

```sql
-- 禁止 '0000-00-00' 作为有效日期

-- 开启时（配合严格模式）：
INSERT INTO t (date_col) VALUES ('0000-00-00');
-- ERROR 1292: Incorrect date value: '0000-00-00'

-- 关闭时：
INSERT INTO t (date_col) VALUES ('0000-00-00');
-- 成功，但这个日期在业务中通常无意义
```

### NO_ZERO_IN_DATE

```sql
-- 禁止日期中的月份或日期为 0

-- 开启时（配合严格模式）：
INSERT INTO t (date_col) VALUES ('2024-00-15');
-- ERROR：月份为 0 不合法
INSERT INTO t (date_col) VALUES ('2024-06-00');
-- ERROR：日期为 0 不合法

-- 关闭时：
INSERT INTO t (date_col) VALUES ('2024-00-15');
-- 成功，但这个日期无实际意义
```

### ERROR_FOR_DIVISION_BY_ZERO

```sql
-- 除以零时产生错误（而非返回 NULL）

-- 开启时（配合严格模式）：
INSERT INTO t (result) VALUES (10 / 0);
-- ERROR：Division by zero（在 INSERT/UPDATE 语境中报错）

-- 在 SELECT 中除以零：
SELECT 10 / 0;
-- 返回 NULL，产生 WARNING（SELECT 不受严格模式影响）

-- 关闭时：
INSERT INTO t (result) VALUES (10 / 0);
-- 成功，result 设为 NULL，产生 WARNING
```

### NO_ENGINE_SUBSTITUTION

```sql
-- 禁止引擎替换

-- 开启时：
CREATE TABLE t (id INT) ENGINE=NotExistEngine;
-- ERROR 1286: Unknown storage engine 'NotExistEngine'

-- 关闭时：
CREATE TABLE t (id INT) ENGINE=NotExistEngine;
-- 成功，使用默认引擎（InnoDB）代替，产生 WARNING
```

---

## 其他常用 SQL_MODE

### PIPES_AS_CONCAT

```sql
-- 将 || 运算符视为字符串连接（而非逻辑 OR）

-- 开启时：
SELECT 'Hello' || ' ' || 'World';
-- 返回：'Hello World'

-- 关闭时：
SELECT 'Hello' || ' ' || 'World';
-- 返回：0（逻辑 OR 运算）

-- Oracle 迁移到 MySQL 时经常需要开启此模式
```

### ANSI_QUOTES

```sql
-- 将双引号视为标识符引用（而非字符串引用）

-- 开启时：
SELECT "column_name" FROM t;
-- "column_name" 被视为列名（标识符）

-- 关闭时（默认）：
SELECT "column_name" FROM t;
-- "column_name" 被视为字符串 'column_name'

-- 开启后字符串只能用单引号：
SELECT 'string value';
-- 符合 SQL 标准
```

### NO_AUTO_VALUE_ON_ZERO

```sql
-- 默认行为：INSERT 时给 AUTO_INCREMENT 列传 0 会生成新的自增值
-- 开启此模式后：传 0 就是插入 0（不触发自增）

-- 默认行为（关闭时）：
INSERT INTO t (id, name) VALUES (0, 'test');
-- id 会被设为下一个自增值（如 1、2、3...）

-- 开启时：
INSERT INTO t (id, name) VALUES (0, 'test');
-- id 就是 0

-- 使用场景：从 mysqldump 导入数据时
-- mysqldump 的输出中会设置此模式
-- 确保导入的 id=0 的行不会被改变
```

### PAD_CHAR_TO_FULL_LENGTH

```sql
-- MySQL 8.0.13+ 已废弃
-- 查询 CHAR 类型列时保留末尾空格（填充到定义长度）

-- 关闭时（默认）：
-- CHAR(10) 存储 'abc' 后查询返回 'abc'（末尾空格被去掉）

-- 开启时：
-- CHAR(10) 存储 'abc' 后查询返回 'abc       '（填充到 10 个字符）

-- 注意：此模式在 MySQL 8.0.13 中已废弃
-- MySQL 8.4 中可能已移除
-- 如果需要固定长度输出，使用 RPAD() 函数
```

---

## 组合模式

```sql
-- MySQL 提供了几个组合模式，等价于多个单独模式的集合：

-- ANSI 模式：
-- 等价于：REAL_AS_FLOAT, PIPES_AS_CONCAT, ANSI_QUOTES,
--         IGNORE_SPACE, ONLY_FULL_GROUP_BY
SET SESSION sql_mode = 'ANSI';

-- TRADITIONAL 模式（最严格）：
-- 等价于：STRICT_TRANS_TABLES, STRICT_ALL_TABLES,
--         NO_ZERO_IN_DATE, NO_ZERO_DATE,
--         ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION
SET SESSION sql_mode = 'TRADITIONAL';
-- 这个模式最接近传统 SQL 数据库的行为
-- 无效数据一律报错，不会静默处理
```

---

## 不同场景的推荐配置

| 场景 | 推荐 SQL_MODE | 说明 |
|-----|-------------|------|
| 生产环境（默认）| ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION | MySQL 8.0/8.4 默认值，平衡严格性和兼容性 |
| 高数据质量要求 | TRADITIONAL | 最严格模式，任何无效数据都报错 |
| Oracle 迁移 | 默认 + PIPES_AS_CONCAT,ANSI_QUOTES | 兼容 Oracle 的字符串拼接和标识符引用 |
| 旧系统兼容 | 去掉 ONLY_FULL_GROUP_BY | 兼容 MySQL 5.6 之前的 GROUP BY 行为 |
| 完全宽松（不推荐）| （空字符串）| 接受所有无效数据，不建议生产使用 |

---

## 适用场景

- **应用从 MySQL 5.6/5.7 迁移到 8.0/8.4**：旧应用可能依赖宽松的 SQL_MODE，升级后需要调整 SQL_MODE 或修改应用代码以适配默认的严格模式
- **从 Oracle/PostgreSQL 迁移到 MySQL**：开启 PIPES_AS_CONCAT 和 ANSI_QUOTES 提高 SQL 兼容性

---

## 常见问题

**升级到 MySQL 8.0/8.4 后大量 SQL 报 ONLY_FULL_GROUP_BY 错误，怎么处理？**

有两种处理方式：①修改 SQL 使其符合 ONLY_FULL_GROUP_BY 要求（推荐）。SELECT 列表中的非聚合列要么出现在 GROUP BY 中，要么用聚合函数包装（如 MAX、MIN、ANY_VALUE）。②临时关闭 ONLY_FULL_GROUP_BY（不推荐长期使用）。在 my.cnf 中从 sql_mode 中去掉 ONLY_FULL_GROUP_BY。关闭后 MySQL 不再检查 GROUP BY 的完整性，非聚合列会返回不确定的值，可能导致查询结果不符合预期。

---

## 注意事项

- SQL_MODE 的修改分为全局和会话两个级别。`SET GLOBAL sql_mode` 只影响修改后新建的连接，已有连接的 sql_mode 不变。`SET SESSION sql_mode` 只影响当前连接。如果应用使用连接池，连接池中已有的连接不会受 SET GLOBAL 影响，需要断开并重新建立连接，或在获取连接后用 SET SESSION 设置。
- 严格模式（STRICT_TRANS_TABLES）影响 INSERT、UPDATE、DELETE 操作中的数据验证，但不影响 SELECT。SELECT 中的类型转换错误（如 `SELECT 'abc' + 1`）无论是否开启严格模式都只产生 WARNING，不会报错。

---

## 总结

SQL_MODE 控制 MySQL 的 SQL 语法严格程度和数据验证行为。MySQL 8.0/8.4 默认包含 6 个模式：ONLY_FULL_GROUP_BY、STRICT_TRANS_TABLES、NO_ZERO_IN_DATE、NO_ZERO_DATE、ERROR_FOR_DIVISION_BY_ZERO、NO_ENGINE_SUBSTITUTION。STRICT_TRANS_TABLES 是最重要的，确保无效数据报错而非静默接受。ONLY_FULL_GROUP_BY 要求 SELECT 列与 GROUP BY 一致。PIPES_AS_CONCAT 和 ANSI_QUOTES 用于 Oracle 迁移兼容。SET GLOBAL 只影响新连接，SET SESSION 只影响当前连接。生产环境建议保持默认值或使用 TRADITIONAL。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
