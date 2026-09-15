> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 错误代码与解决方案速查

MySQL 在运行过程中遇到问题时会返回错误代码和错误信息。错误代码由数字和 SQLSTATE 两部分组成，数字编号用于程序处理，SQLSTATE 是 5 位的标准化代码。本文整理了 MySQL 8.4 中最常见的错误代码、产生原因和解决方案，便于在遇到问题时快速定位和处理。

---

## 错误代码查询方法

```bash
# 使用 perror 工具查询错误代码含义：
perror 1045
# 输出：MySQL error code MY-001045 (ER_ACCESS_DENIED_ERROR):
# Access denied for user '%-.48s'@'%-.64s' (using password: %s)

# 在 MySQL 客户端中查看最近的错误：
SHOW WARNINGS;
SHOW ERRORS;

# 查看详细错误信息（含 SQLSTATE）：
SHOW WARNINGS\G
```

---

## 连接与认证类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1040 | ER_CON_COUNT_ERROR | Too many connections | 连接数达到 max_connections 上限。临时：用管理员账号登录后 KILL 空闲连接。根本：增大 max_connections 或优化应用连接池。 |
| 1045 | ER_ACCESS_DENIED_ERROR | Access denied for user 'user'@'host' | 用户名、密码或来源主机不匹配。检查：SELECT User, Host FROM mysql.user WHERE User='xxx'; 确认账号存在且密码正确。 |
| 1129 | ER_HOST_IS_BLOCKED | Host 'xxx' is blocked | 该主机连续多次连接失败被封禁。解决：FLUSH HOSTS; 或 mysqladmin flush-hosts。调大 max_connect_errors。 |
| 1130 | ER_HOST_NOT_PRIVILEGED | Host 'xxx' is not allowed to connect | 用户的 Host 字段不允许从该地址连接。创建允许该地址的用户：CREATE USER 'user'@'客户端IP' IDENTIFIED BY 'password'; |
| 1135 | ER_CANT_CREATE_THREAD | Can't create a new thread | 系统资源不足（线程数或内存限制）。检查 ulimit -u（最大进程数）和内存使用。 |
| 2002 | CR_CONNECTION_ERROR | Can't connect to local MySQL server through socket | MySQL 未启动或 socket 文件路径错误。检查 mysqld 是否运行，确认 socket 路径与客户端配置一致。 |
| 2003 | CR_CONN_HOST_ERROR | Can't connect to MySQL server on 'host' | 无法通过 TCP 连接到 MySQL。检查：MySQL 是否监听该端口、防火墙规则、bind-address 配置。 |
| 2013 | CR_SERVER_LOST | Lost connection to MySQL server during query | 查询过程中连接断开。可能原因：查询超时（net_read_timeout/net_write_timeout）、数据包过大（max_allowed_packet）、网络不稳定。 |

---

## 语法与查询类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1054 | ER_BAD_FIELD_ERROR | Unknown column 'xxx' in 'field list' | 列名不存在或拼写错误。使用 DESCRIBE table_name 确认列名。 |
| 1064 | ER_PARSE_ERROR | You have an error in your SQL syntax | SQL 语法错误。检查 near 'xxx' 提示的位置附近的语法，注意关键字冲突（用反引号转义）。 |
| 1093 | ER_UPDATE_TABLE_USED | You can't specify target table for update in FROM clause | UPDATE/DELETE 的目标表出现在子查询的 FROM 中。使用派生表（子查询外套一层 SELECT）或 JOIN 改写。 |
| 1111 | ER_INVALID_GROUP_FUNC_USE | Invalid use of group function | 聚合函数（SUM/COUNT 等）用在了 WHERE 子句中。聚合条件应该放在 HAVING 中。 |
| 1140 | ER_MIX_OF_GROUP_FUNC_AND_FIELDS | Mixing of GROUP columns with no GROUP columns | SELECT 中同时有聚合列和非聚合列但没有 GROUP BY。添加 GROUP BY 或去掉 ONLY_FULL_GROUP_BY 模式（不推荐）。 |
| 1242 | ER_SUBQUERY_NO_1_ROW | Subquery returns more than 1 row | 子查询返回多行但使用在期望单值的位置。将 = 改为 IN，或加 LIMIT 1。 |
| 1292 | ER_TRUNCATED_WRONG_VALUE | Truncated incorrect xxx value | 数据类型不匹配或值超出范围。检查参与比较或赋值的数据类型是否一致。 |

---

## 数据操作类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1062 | ER_DUP_ENTRY | Duplicate entry 'xxx' for key 'PRIMARY' | 插入/更新的数据违反唯一约束。检查主键或唯一索引是否重复。使用 INSERT ... ON DUPLICATE KEY UPDATE 或 INSERT IGNORE。 |
| 1048 | ER_BAD_NULL_ERROR | Column 'xxx' cannot be null | 向 NOT NULL 列插入 NULL 值。提供有效值或修改列允许 NULL。 |
| 1136 | ER_WRONG_VALUE_COUNT_ON_ROW | Column count doesn't match value count | INSERT 的列数与值的个数不匹配。检查 VALUES 中的值个数是否与列数一致。 |
| 1146 | ER_NO_SUCH_TABLE | Table 'db.table' doesn't exist | 表不存在。检查表名拼写、数据库名是否正确、表是否被删除。 |
| 1216 | ER_NO_REFERENCED_ROW | Cannot add or update a child row: a foreign key constraint fails | 外键约束失败，引用的父表中不存在对应的值。先在父表中插入对应数据。 |
| 1217 | ER_ROW_IS_REFERENCED | Cannot delete or update a parent row: a foreign key constraint fails | 删除/更新父表记录时，子表有引用。先删除子表中的关联记录，或设置 ON DELETE CASCADE。 |
| 1364 | ER_NO_DEFAULT_FOR_FIELD | Field 'xxx' doesn't have a default value | INSERT 时未给没有默认值的 NOT NULL 列赋值。提供值或给列设置默认值。 |
| 1406 | ER_DATA_TOO_LONG | Data too long for column 'xxx' | 插入的字符串超过列定义的长度。截断数据或增大列的长度（ALTER TABLE ... MODIFY COLUMN）。 |

---

## 锁与事务类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1205 | ER_LOCK_WAIT_TIMEOUT | Lock wait timeout exceeded; try restarting transaction | 等待行锁超过 innodb_lock_wait_timeout（默认 50 秒）。找到阻塞事务（sys.innodb_lock_waits），终止或等待其完成后重试。 |
| 1213 | ER_LOCK_DEADLOCK | Deadlock found when trying to get lock; try restarting transaction | 发生死锁，当前事务被回滚。应用层捕获此错误后重试事务即可。调整事务访问顺序减少死锁。 |
| 1223 | ER_CANT_EXECUTE_WITH_BACKUP_LOCK | Can't execute the query because you have a conflicting backup lock | 备份锁阻止了 DDL 操作。等待备份完成或 UNLOCK INSTANCE FOR BACKUP。 |

---

## DDL 与表结构类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1050 | ER_TABLE_EXISTS_ERROR | Table 'xxx' already exists | CREATE TABLE 时表已存在。使用 CREATE TABLE IF NOT EXISTS 或先 DROP TABLE。 |
| 1051 | ER_BAD_TABLE_ERROR | Unknown table 'xxx' | DROP TABLE 时表不存在。使用 DROP TABLE IF EXISTS。 |
| 1060 | ER_DUP_FIELDNAME | Duplicate column name 'xxx' | ALTER TABLE ADD COLUMN 时列已存在。 |
| 1068 | ER_MULTIPLE_PRI_KEY | Multiple primary key defined | 已有主键，不能再添加。先 DROP PRIMARY KEY 再添加新的。 |
| 1091 | ER_CANT_DROP_FIELD_OR_KEY | Can't DROP 'xxx'; check that column/key exists | 要删除的列或索引不存在。用 SHOW INDEX FROM table 确认。 |
| 1118 | ER_TOO_BIG_ROWSIZE | Row size too large (> 8126) | 行大小超过限制。将大字段改为 TEXT/BLOB 类型，或启用 innodb_page_size=32K/64K（需重建实例）。 |
| 1709 | ER_TOO_LONG_INDEX_COMMENT | Comment for index 'xxx' is too long | 索引注释超过 1024 字节限制。缩短注释。 |

---

## 复制类错误

| 错误代码 | 错误名称 | 错误信息 | 原因与解决方案 |
|---------|---------|---------|--------------|
| 1032 | ER_KEY_NOT_FOUND | Can't find record in 'table' | 从库回放 UPDATE/DELETE 时找不到对应行（主从数据不一致）。用 pt-table-checksum 检查一致性，pt-table-sync 修复。 |
| 1062 | ER_DUP_ENTRY（复制场景）| Duplicate entry for key | 从库回放 INSERT 时主键冲突（可能是从库被手动写入了数据）。跳过错误或用 pt-table-sync 修复。 |
| 1236 | ER_MASTER_FATAL_ERROR_READING_BINLOG | Got fatal error reading binary log from master | 主库的 Binlog 文件损坏或被清理。如果是被清理，需要重建从库。 |
| 1593 | ER_SLAVE_FATAL_ERROR | Fatal error: ... | 从库遇到致命复制错误。检查错误详情，可能需要重建从库。 |
| 1872 | ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER | Slave has more GTIDs than the master | 从库的 GTID 集合比主库多（可能误操作在从库写入了数据）。需要重置从库或注入缺失的 GTID。 |

---

## 适用场景

- **开发和运维中遇到错误时的快速参考**：根据错误代码查找原因和解决方案，缩短故障排查时间
- **应用代码中的错误处理**：根据错误代码做针对性的异常处理（如 1213 死锁重试、1062 重复键处理）

---

## 常见问题

**如何在应用代码中区分不同的 MySQL 错误？**

MySQL 返回的错误包含三部分信息：错误代码（数字，如 1062）、SQLSTATE（5 位标准码，如 23000）和错误消息（文本描述）。大部分编程语言的 MySQL 驱动都能获取这三部分。建议使用数字错误代码做判断（最精确），SQLSTATE 用于跨数据库兼容的场景。例如 Python 中：`except MySQLdb.IntegrityError as e: if e.args[0] == 1062: handle_duplicate()`。

---

## 注意事项

- 错误代码 1205（锁等待超时）和 1213（死锁）的处理方式不同。1213 死锁时 InnoDB 会自动回滚整个事务，应用只需重试即可。1205 锁等待超时默认只回滚当前语句（不是整个事务），如果不显式 ROLLBACK，之前的语句仍然有效，可能导致数据不一致。建议应用在收到 1205 后显式 ROLLBACK 再重试。
- 错误代码 2002 和 2003 是客户端连接错误（以 CR_ 开头），不是服务器端错误。2002 是 socket 连接失败（本地连接），2003 是 TCP 连接失败（远程连接）。排查方向不同：2002 检查 MySQL 是否启动和 socket 路径；2003 检查网络、防火墙和 bind-address。

---

## 总结

MySQL 错误代码分为服务器端错误（1xxx~3xxx）和客户端错误（2xxx，CR_ 前缀）。最常见的错误：1040（连接数满）、1045（访问拒绝）、1062（主键重复）、1064（语法错误）、1205（锁等待超时）、1213（死锁）、2002/2003（连接失败）。1213 死锁自动回滚整个事务，1205 只回滚当前语句。使用 `perror` 工具查询错误代码含义。应用代码中根据数字错误代码做针对性处理。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
