> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 场景算法与 SQL 编写（对应第1、6章）

本文收录 2026 年大厂 MySQL 面试中关于实际场景 SQL 编写和算法应用的高频题目，涵盖复杂查询、窗口函数、递归 CTE、数据处理等知识点，对应本资料第 1 章和第 6 章的内容。这类题目直接考察候选人的 SQL 编写能力和问题解决思维。

---

## 排名与 TopN 查询

**查询每个部门薪资排名前 3 的员工**

```sql
-- 使用窗口函数（MySQL 8.0+）：
SELECT department_id, employee_name, salary, rk
FROM (
    SELECT
        department_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rk
    FROM employees
) ranked
WHERE rk <= 3;

-- 三种排名函数的区别：
-- ROW_NUMBER()：连续编号，相同值不并列（1, 2, 3, 4）
-- RANK()：相同值并列，跳号（1, 1, 3, 4）
-- DENSE_RANK()：相同值并列，不跳号（1, 1, 2, 3）

-- 面试追问：如果不用窗口函数怎么实现？
-- 使用相关子查询（MySQL 5.7 兼容）：
SELECT e1.department_id, e1.employee_name, e1.salary
FROM employees e1
WHERE (
    SELECT COUNT(DISTINCT e2.salary)
    FROM employees e2
    WHERE e2.department_id = e1.department_id
      AND e2.salary > e1.salary
) < 3
ORDER BY e1.department_id, e1.salary DESC;
```

面试官关注点：ROW_NUMBER/RANK/DENSE_RANK 的区别、是否能用非窗口函数方式实现。

---

## 连续问题

**查找连续登录 3 天及以上的用户**

```sql
-- 表结构：login_log(user_id, login_date)
-- login_date 已去重（每天每用户一条记录）

-- 方法1：使用 ROW_NUMBER 构造分组标识
SELECT DISTINCT user_id
FROM (
    SELECT
        user_id,
        login_date,
        DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (
            PARTITION BY user_id ORDER BY login_date
        ) DAY) AS grp
    FROM login_log
) t
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;

-- 原理：如果日期连续，login_date 减去行号得到的结果相同
-- 例如：2024-06-01 - 1 = 2024-05-31
--       2024-06-02 - 2 = 2024-05-31
--       2024-06-03 - 3 = 2024-05-31
-- 三行的 grp 都是 2024-05-31，说明连续 3 天

-- 方法2：使用 LEAD/LAG 窗口函数
SELECT DISTINCT user_id
FROM (
    SELECT
        user_id,
        login_date,
        LEAD(login_date, 2) OVER (PARTITION BY user_id ORDER BY login_date) AS day_after_2
    FROM login_log
) t
WHERE DATEDIFF(day_after_2, login_date) = 2;
-- LEAD(login_date, 2) 取后面第 2 行的日期
-- 如果差值刚好是 2 天，说明连续 3 天
```

面试官关注点：ROW_NUMBER + DATE_SUB 构造分组的技巧（连续问题的经典解法）。

---

## 累计与移动计算

**计算每月销售额和累计销售额**

```sql
-- 表结构：orders(order_id, order_date, amount)

SELECT
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    SUM(amount) AS monthly_sales,
    SUM(SUM(amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m')) AS cumulative_sales
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;

-- SUM(SUM(amount)) OVER (...) 解释：
-- 内层 SUM(amount) 是 GROUP BY 的聚合（每月销售额）
-- 外层 SUM(...) OVER (...) 是窗口函数的累计求和
```

**计算 7 天移动平均销售额**

```sql
SELECT
    sale_date,
    daily_amount,
    AVG(daily_amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d
FROM (
    SELECT
        DATE(order_date) AS sale_date,
        SUM(amount) AS daily_amount
    FROM orders
    GROUP BY DATE(order_date)
) daily_sales
ORDER BY sale_date;

-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
-- 当前行和前面 6 行，共 7 行
-- 这就是 7 天移动平均
```

面试官关注点：窗口函数中 ROWS BETWEEN 的用法、累计求和与移动平均的写法。

---

## 行列转换

**行转列（Pivot）**

```sql
-- 表结构：scores(student_id, subject, score)
-- 需求：每个学生一行，各科成绩作为列

SELECT
    student_id,
    MAX(CASE WHEN subject = '语文' THEN score END) AS chinese,
    MAX(CASE WHEN subject = '数学' THEN score END) AS math,
    MAX(CASE WHEN subject = '英语' THEN score END) AS english
FROM scores
GROUP BY student_id;

-- MySQL 没有原生的 PIVOT 语法
-- 使用 CASE WHEN + 聚合函数实现
-- MAX/SUM 都可以（每个学生每科只有一个成绩时效果一样）
```

**列转行（Unpivot）**

```sql
-- 表结构：student_scores(student_id, chinese, math, english)
-- 需求：转为 (student_id, subject, score) 格式

SELECT student_id, '语文' AS subject, chinese AS score FROM student_scores
UNION ALL
SELECT student_id, '数学', math FROM student_scores
UNION ALL
SELECT student_id, '英语', english FROM student_scores
ORDER BY student_id, subject;
```

面试官关注点：行转列用 CASE WHEN + 聚合、列转行用 UNION ALL。

---

## 递归 CTE

**查询组织架构树（递归查询上下级关系）**

```sql
-- 表结构：employees(id, name, manager_id)
-- manager_id 指向上级的 id

-- 查询某个员工的所有下属（包括间接下属）：
WITH RECURSIVE subordinates AS (
    -- 锚点：起始员工
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE id = 1  -- 从 CEO（id=1）开始

    UNION ALL

    -- 递归：找出直接下属
    SELECT e.id, e.name, e.manager_id, s.level + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates ORDER BY level, id;

-- 查询某个员工的所有上级（向上追溯管理链）：
WITH RECURSIVE managers AS (
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE id = 100  -- 从某个员工开始

    UNION ALL

    SELECT e.id, e.name, e.manager_id, m.level + 1
    FROM employees e
    JOIN managers m ON e.id = m.manager_id
)
SELECT * FROM managers ORDER BY level;
```

面试官关注点：递归 CTE 的锚点和递归部分、UNION ALL 连接、递归终止条件。

---

## 数据去重与清洗

**删除表中的重复数据（保留 id 最小的一条）**

```sql
-- 表结构：users(id, email, name)
-- email 有重复，需要删除重复行，保留 id 最小的

-- 方法1：使用子查询
DELETE FROM users
WHERE id NOT IN (
    SELECT min_id FROM (
        SELECT MIN(id) AS min_id FROM users GROUP BY email
    ) tmp
);
-- 注意：MySQL 不允许在 DELETE 的 WHERE 子查询中直接引用目标表
-- 需要套一层子查询（派生表）绕过限制

-- 方法2：使用 JOIN
DELETE u1
FROM users u1
JOIN users u2
ON u1.email = u2.email AND u1.id > u2.id;
-- 删除 email 相同但 id 更大的行

-- 方法3：使用窗口函数（先查后删）
DELETE FROM users WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
        FROM users
    ) t WHERE rn > 1
);
```

面试官关注点：MySQL 的 DELETE 子查询限制（不能直接引用目标表）、三种方法的性能差异。

---

## 间隔与缺失数据

**找出缺失的日期（数据中哪些天没有记录）**

```sql
-- 使用递归 CTE 生成日期序列，与实际数据做 LEFT JOIN
WITH RECURSIVE date_series AS (
    SELECT DATE('2024-01-01') AS dt
    UNION ALL
    SELECT DATE_ADD(dt, INTERVAL 1 DAY)
    FROM date_series
    WHERE dt < '2024-12-31'
)
SELECT ds.dt AS missing_date
FROM date_series ds
LEFT JOIN orders o ON DATE(o.order_date) = ds.dt
WHERE o.order_id IS NULL
ORDER BY ds.dt;

-- 这个方法在 MySQL 8.0+ 中可用
-- date_series 生成 2024 年全部 366 天
-- LEFT JOIN 找出没有订单的日期
```

面试官关注点：递归 CTE 生成连续日期序列的技巧、LEFT JOIN + IS NULL 找缺失。

---

## 复杂业务场景

**计算用户留存率（第 N 日留存）**

```sql
-- 表结构：user_actions(user_id, action_date)
-- 计算次日留存率、7 日留存率

-- 首先找到每个用户的首次活跃日期：
WITH first_active AS (
    SELECT user_id, MIN(action_date) AS first_date
    FROM user_actions
    GROUP BY user_id
),
-- 然后统计每个首次活跃日期的新用户数和留存数：
retention AS (
    SELECT
        fa.first_date,
        COUNT(DISTINCT fa.user_id) AS new_users,
        COUNT(DISTINCT CASE
            WHEN DATEDIFF(ua.action_date, fa.first_date) = 1
            THEN ua.user_id END) AS day1_retained,
        COUNT(DISTINCT CASE
            WHEN DATEDIFF(ua.action_date, fa.first_date) = 7
            THEN ua.user_id END) AS day7_retained
    FROM first_active fa
    LEFT JOIN user_actions ua ON fa.user_id = ua.user_id
    GROUP BY fa.first_date
)
SELECT
    first_date,
    new_users,
    day1_retained,
    ROUND(day1_retained / new_users * 100, 2) AS day1_retention_rate,
    day7_retained,
    ROUND(day7_retained / new_users * 100, 2) AS day7_retention_rate
FROM retention
ORDER BY first_date;
```

面试官关注点：留存率的定义和计算逻辑、CTE 的使用让查询更可读。

---

**查询订单中同时购买了商品 A 和商品 B 的客户**

```sql
-- 表结构：order_items(order_id, customer_id, product_name)

-- 方法1：使用 HAVING
SELECT customer_id
FROM order_items
WHERE product_name IN ('A', 'B')
GROUP BY customer_id
HAVING COUNT(DISTINCT product_name) = 2;

-- 方法2：使用 JOIN
SELECT DISTINCT a.customer_id
FROM order_items a
JOIN order_items b ON a.customer_id = b.customer_id
WHERE a.product_name = 'A' AND b.product_name = 'B';

-- 方法3：使用 EXISTS
SELECT DISTINCT customer_id
FROM order_items oi1
WHERE product_name = 'A'
  AND EXISTS (
      SELECT 1 FROM order_items oi2
      WHERE oi2.customer_id = oi1.customer_id
        AND oi2.product_name = 'B'
  );
```

面试官关注点：多种实现方式、HAVING COUNT(DISTINCT) 的经典用法。

---

## SQL 优化技巧

**大分页查询如何优化？**

```sql
-- 原始写法（offset 很大时极慢）：
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;
-- MySQL 需要扫描 1000020 行，丢弃前 100 万行

-- 优化方法1：延迟关联（Deferred Join）
SELECT o.*
FROM orders o
JOIN (
    SELECT id FROM orders ORDER BY id LIMIT 1000000, 20
) tmp ON o.id = tmp.id;
-- 子查询只扫描索引（覆盖索引），不读取完整行
-- 再通过主键 JOIN 获取完整数据

-- 优化方法2：游标分页（Keyset Pagination）
-- 记录上一页最后一条记录的 id
SELECT * FROM orders WHERE id > 上一页最后的id ORDER BY id LIMIT 20;
-- 直接从上次位置继续，不需要跳过前面的行
-- 性能恒定，不受页码影响
-- 但不支持跳页（只能上一页/下一页）

-- 优化方法3：业务层限制
-- 限制最大翻页深度（如只允许前 100 页）
-- 引导用户使用搜索而非翻页
```

面试官关注点：LIMIT offset 大时为什么慢、延迟关联的原理、游标分页的局限性。

---

## 适用场景

- **数据分析师 / 后端工程师面试的 SQL 手写题**：面试官要求现场手写 SQL 解决实际业务问题
- **在线编程测试（OJ）中的 SQL 题**：LeetCode、HackerRank 等平台的 SQL 题目练习

---

## 常见问题

**面试中写 SQL 时间不够怎么办？**

先说思路再写代码。告诉面试官你打算用什么方法（如"我用窗口函数 DENSE_RANK 做分组排名，然后在外层过滤 rk<=3"），然后再写具体的 SQL。即使没写完，面试官也能看到你的思路是正确的。另外，复杂查询建议用 CTE（WITH 子句）分步骤写，每一步的逻辑清晰，比嵌套多层子查询更容易写对也更容易让面试官理解。

---

## 注意事项

- 手写 SQL 时注意边界情况：NULL 值的处理（IS NULL 而非 = NULL）、GROUP BY 后的列是否正确、DISTINCT 是否必要、JOIN 条件是否会产生笛卡尔积。这些细节错误在面试中很容易被发现。
- 窗口函数是 MySQL 8.0+ 的功能。如果面试中不确定目标版本是否支持窗口函数，可以先问面试官"可以使用窗口函数吗？"或者提供两种方案（窗口函数版和传统版）。

---

## 总结

本文涵盖了 SQL 编写面试的高频场景：TopN 查询（ROW_NUMBER/RANK/DENSE_RANK）、连续问题（ROW_NUMBER + DATE_SUB 分组法）、累计和移动平均（SUM/AVG OVER）、行列转换（CASE WHEN + 聚合 / UNION ALL）、递归 CTE（组织架构树、日期序列生成）、数据去重（DELETE + JOIN / 窗口函数）、留存率计算、大分页优化（延迟关联 / 游标分页）。写 SQL 先说思路再写代码，使用 CTE 分步骤提高可读性。注意 NULL 处理和边界情况。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
