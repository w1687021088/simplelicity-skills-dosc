> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 废弃特性完整清单

MySQL 在版本迭代过程中会标记某些功能为"废弃"（Deprecated），意味着该功能在当前版本仍然可用但不建议使用，将在未来的版本中移除。到了 MySQL 8.4 LTS，很多在 8.0 中标记为废弃的功能已经被正式移除。本文整理从 MySQL 8.0 到 8.4 中所有废弃和已移除的特性，帮助升级前全面排查。

---

## 已移除的系统变量（MySQL 8.4）

| 系统变量 | 废弃版本 | 移除版本 | 替代方案 |
|---------|:-------:|:-------:|---------|
| innodb_log_file_size | 8.0.30 | 8.4 | innodb_redo_log_capacity |
| innodb_log_files_in_group | 8.0.30 | 8.4 | innodb_redo_log_capacity |
| innodb_change_buffering | 8.0.27 | 8.4 | 无（固定为 none） |
| innodb_change_buffer_max_size | 8.0.27 | 8.4 | 无 |
| innodb_log_writer_threads | 8.0.30 | 8.4 | 无 |
| innodb_numa_interleave | 8.0.28 | 8.4 | 使用系统级 numactl |
| binlog_format | 8.0.34 | 8.4 | 固定为 ROW |
| log_bin_use_v1_row_events | 8.0.18 | 8.4 | 无 |
| binlog_transaction_dependency_tracking | 8.0.35 | 8.4 | 固定为 WRITESET |
| default_authentication_plugin | 8.0.27 | 8.4 | authentication_policy |
| replica_parallel_type | 8.0.29 | 8.4 | 固定为 LOGICAL_CLOCK |
| old_alter_table | 8.0.35 | 8.4 | 无 |
| avoid_temporal_upgrade | 8.0.13 | 8.4 | 无 |
| show_old_temporals | 8.0.13 | 8.4 | 无 |
| group_replication_recovery_complete_at | 8.0.34 | 8.4 | 无 |
| relay_log_info_file | 8.0.28 | 8.4 | TABLE 方式（relay_log_info_repository=TABLE） |
| master_info_file | 8.0.28 | 8.4 | TABLE 方式 |
| relay_log_info_repository | 8.0.28 | 8.4 | 固定为 TABLE |
| master_info_repository | 8.0.28 | 8.4 | 固定为 TABLE |

---

## 已移除的 SQL 语法和命令（MySQL 8.4）

| SQL 语法/命令 | 废弃版本 | 移除版本 | 替代方案 |
|-------------|:-------:|:-------:|---------|
| CHANGE MASTER TO | 8.0.23 | 8.4 | CHANGE REPLICATION SOURCE TO |
| SHOW SLAVE STATUS | 8.0.22 | 8.4 | SHOW REPLICA STATUS |
| START SLAVE / STOP SLAVE | 8.0.22 | 8.4 | START REPLICA / STOP REPLICA |
| RESET SLAVE | 8.0.22 | 8.4 | RESET REPLICA |
| SHOW MASTER STATUS | 8.0.22 | 8.4 | SHOW BINARY LOG STATUS |
| RESET MASTER | 8.0.22 | 8.4 | RESET BINARY LOGS AND GTIDS |
| SQL_CALC_FOUND_ROWS | 8.0.17 | 8.4 | 使用 COUNT(*) 单独查询 |
| FOUND_ROWS() | 8.0.17 | 8.4 | 使用 COUNT(*) 单独查询 |
| GROUP BY ... ASC/DESC | 8.0.13 | 8.4 | 使用 ORDER BY 排序 |

---

## 已移除的认证插件（MySQL 8.4）

| 认证插件 | 废弃版本 | 移除版本 | 替代方案 |
|---------|:-------:|:-------:|---------|
| mysql_native_password | 8.0.34 | 8.4 默认禁用 | caching_sha2_password |
| authentication_fido | 8.0.35 | 8.4 | authentication_webauthn |
| sha256_password | 8.0.16 | 后续版本 | caching_sha2_password |

```
mysql_native_password 的特殊处理：
  8.4 中该插件默认被禁用（不是移除）
  可以通过启动参数或配置文件重新启用：
  [mysqld]
  mysql_native_password = ON
  
  但这只是过渡方案，建议尽快迁移到 caching_sha2_password
  MySQL 9.0 中该插件已被完全移除
```

---

## 已移除的功能（MySQL 8.0 已移除）

以下功能在 MySQL 8.0 中已经被移除（从 5.7 升级时需要注意）：

| 功能 | 移除版本 | 替代方案 |
|------|:-------:|---------|
| Query Cache（查询缓存） | 8.0 | 应用层缓存（Redis/Memcached）或 ProxySQL |
| .frm 文件 | 8.0 | InnoDB 数据字典 |
| ENCRYPT() 函数 | 8.0 | SHA2() 或 AES_ENCRYPT() |
| ENCODE() / DECODE() 函数 | 8.0 | AES_ENCRYPT() / AES_DECRYPT() |
| DES_ENCRYPT() / DES_DECRYPT() 函数 | 8.0 | AES_ENCRYPT() / AES_DECRYPT() |
| PASSWORD() 函数 | 8.0 | SHA2() 或认证插件 |
| mysql_install_db | 8.0 | mysqld --initialize |
| PROCEDURE ANALYSE() | 8.0 | 手动分析数据分布 |
| -- 单行注释（无空格） | 8.0 | 使用 -- （双减号加空格）或 # |
| \N 作为 LOAD DATA 中 NULL 的同义词 | 8.0 | 使用 NULL |

---

## 废弃但仍可用的特性（MySQL 8.4 中可能产生警告）

| 特性 | 废弃版本 | 说明 |
|-----|:-------:|------|
| utf8mb3（旧 utf8） | 8.0 | 使用 utf8mb4 替代 |
| NATIONAL CHAR / NCHAR / NVARCHAR | 8.0 | 隐含 utf8mb3，使用 CHAR ... CHARACTER SET utf8mb4 |
| BINARY 运算符 | 8.0.28 | 使用 CAST(expr AS BINARY) |
| CHARACTER SET utf8 | 8.0 | 使用 CHARACTER SET utf8mb4 |
| ENGINE=MyISAM 用于系统表 | 8.0 | 系统表已自动转为 InnoDB |
| @@global.general_log_file 等带 @@ 前缀的 SHOW 语法 | 8.0 | 使用 SHOW VARIABLES LIKE 或 SELECT @@variable |
| INFORMATION_SCHEMA 的某些表 | 持续 | 使用 Performance Schema 替代 |
| COM_FIELD_LIST 协议命令 | 8.0.24 | 使用 SHOW COLUMNS |
| mysql_real_escape_string_quote() | 8.0.27 | 使用 mysql_real_escape_string() |

---

## 废弃的命令行工具

| 工具 | 废弃版本 | 替代方案 |
|------|:-------:|---------|
| mysqlpump | 8.0.34 | mysqldump 或 MySQL Shell 的 util.dumpInstance() |
| mysql_upgrade | 8.0.16 起自动执行 | 启动时自动升级 |
| resolve_stack_dump | 8.0.30 | 无 |
| mysql_ssl_rsa_setup | 8.0.34 | MySQL 自动生成 SSL 证书 |

---

## 检查废弃特性的方法

```sql
-- 方法1：查看启动时的警告
-- MySQL 启动时如果配置文件中有废弃参数，会在错误日志中记录 WARNING

-- 方法2：使用 MySQL Shell 检查（推荐）
-- 在 MySQL Shell 中执行：
-- mysqlsh> util.checkForServerUpgrade('root@localhost:3306')
-- 会输出所有废弃特性的检查报告

-- 方法3：使用 --validate-config 检查配置文件
-- mysqld --validate-config
-- 检查 my.cnf 中是否有无效或废弃的参数

-- 方法4：查看运行时的废弃警告
SHOW WARNINGS;
-- 使用废弃特性时会产生 WARNING

-- 方法5：检查错误日志
-- grep -i "deprecated" /var/log/mysql/error.log
-- 启动和运行过程中的废弃警告都会记录在这里
```

---

## 适用场景

- **版本升级前的全面排查**：逐项检查当前系统是否使用了已废弃或已移除的特性，提前做好迁移
- **代码审查中的兼容性检查**：确保应用代码中没有使用已移除的 SQL 语法或函数

---

## 常见问题

**如果 my.cnf 中包含已移除的参数，MySQL 8.4 能启动吗？**

如果参数已被完全移除（如 `innodb_log_file_size`），MySQL 8.4 启动时会报错并拒绝启动，错误信息类似 `unknown variable 'innodb_log_file_size=256M'`。如果参数被标记为废弃但未移除，MySQL 会启动但在错误日志中记录警告。因此升级前必须清理 my.cnf 中所有已移除的参数，可以先用 `mysqld --validate-config` 验证。

---

## 注意事项

- 废弃（Deprecated）和移除（Removed）是两个不同的阶段。废弃意味着功能仍然可用但会产生警告，移除意味着功能完全不可用。MySQL 的惯例是先在一个版本中标记为废弃，在后续版本中移除。升级时不仅要处理已移除的特性，还要关注已废弃的特性，提前做好迁移准备。
- 复制相关的命令变更（如 CHANGE MASTER TO → CHANGE REPLICATION SOURCE TO）不仅影响手动操作，也影响自动化脚本和监控工具。升级前需要排查所有运维脚本、监控配置、备份脚本中的旧语法。

---

## 总结

MySQL 8.4 LTS 移除了大量在 8.0 中标记为废弃的特性。系统变量方面：移除了 innodb_log_file_size、binlog_format、default_authentication_plugin、replica_parallel_type 等。SQL 语法方面：移除了 CHANGE MASTER TO、SHOW SLAVE STATUS、SQL_CALC_FOUND_ROWS 等。认证方面：mysql_native_password 默认禁用。功能方面：innodb_change_buffering 移除、binlog_format 固定为 ROW。升级前使用 `util.checkForServerUpgrade()` 和 `mysqld --validate-config` 检查兼容性，清理 my.cnf 和应用代码中的废弃语法。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
