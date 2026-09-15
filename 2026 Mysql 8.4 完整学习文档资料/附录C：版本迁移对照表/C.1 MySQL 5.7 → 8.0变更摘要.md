> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# MySQL 5.7 → 8.0 变更摘要

MySQL 8.0 是一个重大版本更新，引入了大量新功能，同时移除和废弃了许多旧特性。从 5.7 升级到 8.0 需要充分了解这些变更，评估对现有应用和架构的影响。本文梳理 MySQL 5.7 到 8.0 的核心变更，帮助制定升级方案。

---

## 认证与安全

```
变更1：默认认证插件变更
  5.7：默认 mysql_native_password
  8.0：默认 caching_sha2_password

  影响：
  旧版客户端/驱动可能不支持 caching_sha2_password
  连接时报错 Authentication plugin 'caching_sha2_password' cannot be loaded

  解决方案：
  方案A：升级客户端驱动到支持 caching_sha2_password 的版本
  方案B：在 my.cnf 中设置 default_authentication_plugin=mysql_native_password
  方案C：为特定用户指定旧插件
    ALTER USER 'user'@'host' IDENTIFIED WITH mysql_native_password BY 'password';

变更2：密码管理增强
  8.0 新增：
  密码历史策略（password_history）
  密码重用间隔（password_reuse_interval）
  密码过期策略（default_password_lifetime）
  双密码支持（ALTER USER ... RETAIN CURRENT PASSWORD）

变更3：角色（Role）支持
  5.7：不支持角色
  8.0：支持 CREATE ROLE / GRANT role TO user / SET DEFAULT ROLE
  可以将一组权限打包为角色，批量授予用户
```

---

## 数据字典与元数据

```
变更：数据字典从文件系统迁移到 InnoDB 事务表
  5.7：表结构信息存储在 .frm 文件中（每表一个）
  8.0：所有元数据存储在 InnoDB 的数据字典表中

  影响：
  .frm 文件不再存在
  INFORMATION_SCHEMA 查询性能大幅提升（直接读 InnoDB 表而非打开文件）
  DDL 操作变为原子性（不会出现 .frm 和实际表结构不一致的问题）
  升级过程中 .frm 文件自动迁移到数据字典

  注意：
  依赖 .frm 文件的第三方工具需要更新
  不能再通过复制 .frm 文件来恢复表结构
```

---

## 字符集

```
变更：默认字符集从 latin1 改为 utf8mb4
  5.7：默认 character_set_server = latin1，collation_server = latin1_swedish_ci
  8.0：默认 character_set_server = utf8mb4，collation_server = utf8mb4_0900_ai_ci

  影响：
  新建的数据库和表默认使用 utf8mb4
  utf8mb4_0900_ai_ci 是基于 Unicode 9.0 的排序规则
  旧的 utf8（utf8mb3）被标记为废弃，未来会被移除

  注意：
  5.7 中使用 utf8mb4_general_ci 的表升级后排序规则不会自动改变
  utf8mb4_0900_ai_ci 和 utf8mb4_general_ci 的排序结果可能不同
  如果两个表的字符集/排序规则不同，JOIN 时可能无法使用索引
```

---

## SQL 语法变更

```
变更1：GROUP BY 不再隐式排序
  5.7：GROUP BY col 会隐式按 col 排序
  8.0：GROUP BY 不保证排序，需要排序必须显式加 ORDER BY

  影响：
  依赖 GROUP BY 隐式排序的查询可能返回不同顺序的结果

变更2：窗口函数
  5.7：不支持
  8.0：支持 ROW_NUMBER()、RANK()、DENSE_RANK()、LEAD()、LAG()、
       SUM() OVER()、AVG() OVER() 等

变更3：通用表表达式（CTE）
  5.7：不支持
  8.0：支持 WITH 子句和递归 CTE（WITH RECURSIVE）

变更4：JSON 增强
  5.7：基本的 JSON 类型和函数
  8.0：新增 JSON_TABLE()（将 JSON 转为关系表）、
       JSON_ARRAYAGG()、JSON_OBJECTAGG()、
       JSON 路径表达式增强、多值索引（Multi-Valued Index）

变更5：原子 DDL
  5.7：DDL 操作不是原子的（中断可能导致不一致）
  8.0：DDL 操作是原子的（要么完全成功，要么完全回滚）
       包括 DROP TABLE、DROP DATABASE、CREATE TABLE 等

变更6：EXPLAIN ANALYZE
  5.7：不支持
  8.0.18+：支持 EXPLAIN ANALYZE（实际执行查询并返回每个操作的真实时间）
```

---

## InnoDB 存储引擎

```
变更1：自增列持久化
  5.7：AUTO_INCREMENT 计数器保存在内存中，重启后从表中最大值重新计算
       可能导致自增值"回溯"
  8.0：AUTO_INCREMENT 计数器持久化到 Redo Log，重启后恢复到上次的值

变更2：即时 DDL（Instant DDL）
  5.7：ALTER TABLE ADD COLUMN 需要重建表（耗时长）
  8.0：ALTER TABLE ADD COLUMN ... ALGORITHM=INSTANT
       在表的末尾添加列时几乎瞬间完成（只修改元数据）

变更3：不可见索引（Invisible Index）
  5.7：不支持
  8.0：ALTER TABLE t ALTER INDEX idx INVISIBLE;
       优化器不使用该索引，但索引仍然维护
       用于测试删除索引的影响

变更4：降序索引
  5.7：语法支持 DESC 但实际忽略（都是升序）
  8.0：真正支持降序索引
       对于 ORDER BY a ASC, b DESC 类查询不再需要 filesort

变更5：临时表空间
  5.7：临时表使用共享临时表空间（ibtmp1）
  8.0：每个会话使用独立的临时表空间，会话结束后自动回收
```

---

## 复制

```
变更1：默认 Binlog 格式
  5.7：默认 ROW（从 5.7.7 开始）
  8.0：默认 ROW，且 STATEMENT/MIXED 在后续版本中逐步废弃

变更2：GTID 增强
  8.0 可以在线开启 GTID（5.7 需要重启）
  SET GLOBAL gtid_mode = ON_PERMISSIVE;
  SET GLOBAL enforce_gtid_consistency = ON;
  SET GLOBAL gtid_mode = ON;

变更3：复制命令语法更新
  5.7：CHANGE MASTER TO / SHOW SLAVE STATUS / START SLAVE
  8.0.22+：CHANGE REPLICATION SOURCE TO / SHOW REPLICA STATUS / START REPLICA
  旧语法仍可用但标记为废弃

变更4：多线程复制增强
  8.0.27+：
  replica_parallel_type 默认 LOGICAL_CLOCK（5.7 默认 DATABASE）
  replica_parallel_workers 默认 4（5.7 默认 0/单线程）
  replica_preserve_commit_order 默认 ON

变更5：组复制（Group Replication）
  5.7.17：引入 Group Replication 插件
  8.0：成熟稳定，集成到 InnoDB Cluster 方案中
```

---

## 移除的功能

| 被移除的功能 | 替代方案 |
|------------|---------|
| Query Cache（查询缓存） | 使用 ProxySQL 或应用层缓存（Redis/Memcached） |
| .frm 文件 | InnoDB 数据字典 |
| ENCRYPT()、ENCODE()、DES_ENCRYPT() 函数 | AES_ENCRYPT()、SHA2() |
| \N 作为 NULL 的同义词（LOAD DATA） | 使用 NULL |
| PROCEDURE ANALYSE() | 手动分析 |
| SQL_CALC_FOUND_ROWS + FOUND_ROWS() | 使用 COUNT(*) 单独查询（8.0.17 废弃） |
| mysql_install_db | mysqld --initialize |

---

## 升级路径

```
MySQL 5.7 → 8.0 的升级方式：

方式1：原地升级（In-Place Upgrade）
  1. 备份所有数据
  2. 停止 MySQL 5.7
  3. 安装 MySQL 8.0 二进制文件（替换旧版本）
  4. 启动 MySQL 8.0（自动执行数据字典升级）
  5. 运行 mysql_upgrade（8.0.16+ 自动执行，无需手动）

方式2：逻辑升级（Logical Upgrade）
  1. 使用 mysqldump 从 5.7 导出所有数据
  2. 安装新的 MySQL 8.0 实例
  3. 将数据导入 8.0 实例
  适用于跨平台或需要重新组织数据的场景

方式3：复制升级（Replication Upgrade）
  1. 搭建 5.7 → 8.0 的主从复制
  2. 等待从库追平主库
  3. 将应用切换到 8.0 从库（提升为新主库）
  停机时间最短
```

---

## 适用场景

- **规划 MySQL 5.7 → 8.0 升级项目**：逐项评估变更对现有应用的影响，制定升级方案和回滚计划
- **面试中被问到 MySQL 版本差异**：5.7 到 8.0 的变更是常见面试考点

---

## 常见问题

**升级到 8.0 后能否回退到 5.7？**

不支持直接回退。MySQL 8.0 的数据字典格式与 5.7 完全不同（InnoDB 事务表 vs .frm 文件），8.0 的数据文件无法被 5.7 直接使用。如果升级后发现问题需要回退，只能从升级前的备份恢复到 5.7。因此升级前必须做完整的数据备份，并在测试环境充分验证后再升级生产环境。

---

## 注意事项

- MySQL 5.7 到 8.0 不能跨大版本直接升级。必须先升级到 5.7 的最新小版本（如 5.7.44），然后再升级到 8.0。如果当前是 5.6 或更早版本，需要先升级到 5.7，再升级到 8.0。
- 升级前使用 MySQL Shell 的 `util.checkForServerUpgrade()` 函数检查兼容性问题。它会检测废弃的 SQL 语法、不兼容的字符集、无效的数据类型等，并给出修复建议。

---

## 总结

MySQL 5.7 → 8.0 的核心变更：默认认证插件改为 caching_sha2_password、数据字典从 .frm 文件迁移到 InnoDB 表、默认字符集改为 utf8mb4、GROUP BY 不再隐式排序、新增窗口函数和 CTE、AUTO_INCREMENT 持久化、Instant DDL、不可见索引、Query Cache 被移除、复制命令语法更新。升级方式：原地升级、逻辑升级、复制升级。升级前必须备份，不支持回退到 5.7。使用 `util.checkForServerUpgrade()` 检查兼容性。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
