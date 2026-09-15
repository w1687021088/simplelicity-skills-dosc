> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# MySQL 8.4 常用命令速查

本文汇总 MySQL 8.4 日常运维和开发中最常用的命令，涵盖连接管理、数据库操作、用户权限、备份恢复、复制管理、状态监控等方面，方便快速查阅。

---

## 连接与登录

```bash
# 本地连接（默认 socket）：
mysql -u root -p

# 指定主机和端口：
mysql -u root -p -h 192.168.1.100 -P 3306

# 指定数据库：
mysql -u root -p mydb

# 使用默认配置文件中的凭证：
mysql --defaults-file=/root/.my.cnf

# 通过管理端口连接：
mysql -u root -p --host=127.0.0.1 --port=33062

# 执行单条 SQL 并退出：
mysql -u root -p -e "SHOW DATABASES"

# 执行 SQL 文件：
mysql -u root -p mydb < /path/to/script.sql

# 指定字符集连接：
mysql -u root -p --default-character-set=utf8mb4
```

---

## 数据库操作

```sql
-- 查看所有数据库：
SHOW DATABASES;

-- 创建数据库：
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 切换数据库：
USE mydb;

-- 删除数据库：
DROP DATABASE mydb;

-- 查看当前数据库：
SELECT DATABASE();

-- 查看数据库的建库语句：
SHOW CREATE DATABASE mydb;

-- 修改数据库字符集：
ALTER DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

---

## 表操作

```sql
-- 查看当前数据库的所有表：
SHOW TABLES;

-- 查看表结构：
DESCRIBE mydb.orders;
-- 或
SHOW COLUMNS FROM mydb.orders;

-- 查看建表语句：
SHOW CREATE TABLE mydb.orders\G

-- 查看表状态（行数、大小、引擎等）：
SHOW TABLE STATUS FROM mydb LIKE 'orders'\G

-- 查看表的索引：
SHOW INDEX FROM mydb.orders;

-- 分析表（更新统计信息）：
ANALYZE TABLE mydb.orders;

-- 优化表（回收碎片空间）：
OPTIMIZE TABLE mydb.orders;
-- InnoDB 等效于 ALTER TABLE ... ENGINE=InnoDB

-- 检查表完整性：
CHECK TABLE mydb.orders;

-- 修复表（仅 MyISAM）：
REPAIR TABLE mydb.legacy_table;

-- 截断表（清空数据，重置自增）：
TRUNCATE TABLE mydb.orders;
```

---

## 用户与权限管理

```sql
-- 查看当前用户：
SELECT CURRENT_USER();

-- 查看所有用户：
SELECT User, Host, account_locked FROM mysql.user;

-- 创建用户：
CREATE USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'StrongP@ss123!';

-- 修改密码：
ALTER USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'NewP@ss456!';

-- 授权：
GRANT SELECT, INSERT, UPDATE, DELETE ON mydb.* TO 'app_user'@'192.168.1.%';

-- 查看用户权限：
SHOW GRANTS FOR 'app_user'@'192.168.1.%';

-- 撤销权限：
REVOKE DELETE ON mydb.* FROM 'app_user'@'192.168.1.%';

-- 刷新权限（通常不需要，GRANT/REVOKE 会自动生效）：
FLUSH PRIVILEGES;

-- 删除用户：
DROP USER 'app_user'@'192.168.1.%';

-- 锁定/解锁用户：
ALTER USER 'app_user'@'192.168.1.%' ACCOUNT LOCK;
ALTER USER 'app_user'@'192.168.1.%' ACCOUNT UNLOCK;

-- 角色管理：
CREATE ROLE 'app_read', 'app_write';
GRANT SELECT ON mydb.* TO 'app_read';
GRANT INSERT, UPDATE, DELETE ON mydb.* TO 'app_write';
GRANT 'app_read', 'app_write' TO 'app_user'@'192.168.1.%';
SET DEFAULT ROLE ALL TO 'app_user'@'192.168.1.%';
```

---

## 备份与恢复

```bash
# mysqldump 逻辑备份：

# 备份单个数据库：
mysqldump -u root -p mydb > mydb_backup.sql

# 备份所有数据库：
mysqldump -u root -p --all-databases > all_backup.sql

# 备份指定表：
mysqldump -u root -p mydb orders users > tables_backup.sql

# 备份时加锁保证一致性（InnoDB 推荐 --single-transaction）：
mysqldump -u root -p --single-transaction --routines --triggers --events mydb > mydb_backup.sql

# 只导出表结构（不含数据）：
mysqldump -u root -p --no-data mydb > schema_only.sql

# 只导出数据（不含建表语句）：
mysqldump -u root -p --no-create-info mydb > data_only.sql

# 压缩备份：
mysqldump -u root -p --single-transaction mydb | gzip > mydb_backup.sql.gz

# 恢复备份：
mysql -u root -p mydb < mydb_backup.sql

# 恢复压缩备份：
gunzip < mydb_backup.sql.gz | mysql -u root -p mydb
```

---

## 复制管理

```sql
-- 查看主库状态：
SHOW BINARY LOG STATUS;  -- MySQL 8.2+
-- 或 SHOW MASTER STATUS;（旧版兼容）

-- 查看从库状态：
SHOW REPLICA STATUS\G

-- 启动/停止复制：
START REPLICA;
STOP REPLICA;

-- 跳过一条复制错误（基于位置的复制）：
SET GLOBAL sql_replica_skip_counter = 1;
START REPLICA;

-- 跳过一条复制错误（GTID 复制）：
SET GTID_NEXT = 'uuid:N';
BEGIN; COMMIT;
SET GTID_NEXT = 'AUTOMATIC';
START REPLICA;

-- 查看 Binlog 文件列表：
SHOW BINARY LOGS;

-- 查看 Binlog 事件：
SHOW BINLOG EVENTS IN 'mysql-bin.000001' LIMIT 20;

-- 清理 Binlog：
PURGE BINARY LOGS TO 'mysql-bin.000050';
PURGE BINARY LOGS BEFORE '2024-06-01 00:00:00';
```

---

## 状态监控

```sql
-- 查看进程列表：
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- 终止连接：
KILL <processlist_id>;
KILL QUERY <processlist_id>;  -- 只终止查询，不断开连接

-- 查看全局状态：
SHOW GLOBAL STATUS;
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool%';

-- 查看全局变量：
SHOW GLOBAL VARIABLES;
SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';

-- 动态修改变量：
SET GLOBAL max_connections = 500;
SET GLOBAL innodb_buffer_pool_size = 8 * 1024 * 1024 * 1024;

-- 持久化变量（重启后仍生效，MySQL 8.0+）：
SET PERSIST max_connections = 500;
-- 持久化但当前不生效（重启后生效）：
SET PERSIST_ONLY innodb_buffer_pool_instances = 8;

-- InnoDB 引擎状态（详细）：
SHOW ENGINE INNODB STATUS\G

-- 查看表锁等待：
SELECT * FROM sys.innodb_lock_waits\G

-- 查看正在运行的事务：
SELECT * FROM information_schema.INNODB_TRX;
```

---

## 日志管理

```sql
-- 刷新日志：
FLUSH LOGS;
FLUSH BINARY LOGS;   -- 只刷新 Binlog
FLUSH ERROR LOGS;    -- 只刷新错误日志
FLUSH SLOW LOGS;     -- 只刷新慢查询日志

-- 慢查询日志开关：
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;

-- 通用查询日志开关：
SET GLOBAL general_log = ON;
SET GLOBAL general_log = OFF;
```

---

## mysqladmin 常用命令

```bash
# 查看服务器状态：
mysqladmin -u root -p status

# 扩展状态（类似 SHOW GLOBAL STATUS）：
mysqladmin -u root -p extended-status

# 查看变量：
mysqladmin -u root -p variables

# 查看进程列表：
mysqladmin -u root -p processlist

# 刷新权限：
mysqladmin -u root -p flush-privileges

# 刷新日志：
mysqladmin -u root -p flush-logs

# 关闭 MySQL：
mysqladmin -u root -p shutdown

# 测试连接（ping）：
mysqladmin -u root -p ping

# 修改 root 密码：
mysqladmin -u root -p password 'NewPassword'
```

---

## 适用场景

- **日常运维的快速参考**：遇到需要执行的操作时，快速查找对应的命令语法
- **新手学习的命令速查表**：系统性地了解 MySQL 的常用操作命令

---

## 常见问题

**SET GLOBAL 和 SET PERSIST 有什么区别？**

`SET GLOBAL` 修改全局变量，立即生效但 MySQL 重启后失效。`SET PERSIST` 修改全局变量并将修改持久化到 `mysqld-auto.cnf` 文件中，重启后仍然生效。`SET PERSIST_ONLY` 只写入持久化文件，当前不生效，下次重启时才生效（适用于只能在启动时设置的参数）。

---

## 注意事项

- `KILL` 命令使用的是 `PROCESSLIST_ID`（不是 `THREAD_ID`）。可以通过 `SHOW PROCESSLIST` 或 `SELECT * FROM information_schema.PROCESSLIST` 获取。`KILL <id>` 终止整个连接，`KILL QUERY <id>` 只终止当前查询但保持连接。
- `mysqldump --single-transaction` 只对 InnoDB 表有效（使用一致性快照）。如果数据库中混合了 MyISAM 表，需要加 `--lock-tables` 或 `--lock-all-tables` 来保证 MyISAM 表的一致性，但这会阻塞写操作。

---

## 总结

本文涵盖了 MySQL 8.4 日常使用中最核心的命令：连接登录、数据库和表操作、用户权限管理、备份恢复（mysqldump）、复制管理、状态监控、日志管理和 mysqladmin 工具。`SET PERSIST` 可以持久化变量修改。`KILL QUERY` 只终止查询不断开连接。`mysqldump --single-transaction` 保证 InnoDB 备份一致性。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
