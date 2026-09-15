> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 系统变量默认值速查表（8.4 vs 8.0）

MySQL 8.4 LTS 作为长期支持版本，对部分系统变量的默认值做了调整，同时移除或废弃了一些旧变量。本文以表格形式对比 MySQL 8.0 和 8.4 的关键系统变量默认值差异，帮助从 8.0 迁移到 8.4 时快速了解变化。

---

## InnoDB 存储引擎相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| innodb_buffer_pool_size | 128MB | 128MB | 无变化，生产环境需手动调大 |
| innodb_buffer_pool_instances | 8（或 1，取决于 pool_size）| 同 8.0 | pool_size < 1GB 时为 1 |
| innodb_log_file_size | 48MB（8.0.30 前）| 已移除 | 被 innodb_redo_log_capacity 替代 |
| innodb_log_files_in_group | 2（8.0.30 前）| 已移除 | 被 innodb_redo_log_capacity 替代 |
| innodb_redo_log_capacity | 100MB（8.0.30+）| 100MB | 统一管理 Redo Log 容量 |
| innodb_flush_log_at_trx_commit | 1 | 1 | 无变化 |
| innodb_flush_method | fsync | fsync | Linux 生产环境建议改 O_DIRECT |
| innodb_io_capacity | 200 | 200 | 无变化，SSD 建议调大 |
| innodb_io_capacity_max | 2000 | 2000 | 无变化 |
| innodb_read_io_threads | 4 | 4 | 无变化 |
| innodb_write_io_threads | 4 | 4 | 无变化 |
| innodb_thread_concurrency | 0（不限制）| 0 | 无变化 |
| innodb_lock_wait_timeout | 50 | 50 | 无变化，单位秒 |
| innodb_deadlock_detect | ON | ON | 无变化 |
| innodb_print_all_deadlocks | OFF | OFF | 生产建议开启 |
| innodb_undo_log_truncate | ON（8.0.2+）| ON | 无变化 |
| innodb_max_undo_log_size | 1GB | 1GB | 无变化 |
| innodb_adaptive_flushing | ON | ON | 无变化 |
| innodb_max_dirty_pages_pct | 90 | 90 | 无变化 |
| innodb_change_buffering | all（8.0 早期）| none | 8.0.27+ 废弃，8.4 移除 |
| innodb_buffer_pool_dump_at_shutdown | ON | ON | 无变化 |
| innodb_buffer_pool_load_at_startup | ON | ON | 无变化 |

---

## 连接与线程相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| max_connections | 151 | 151 | 无变化，生产需调大 |
| thread_cache_size | -1（自动）| -1（自动）| 自动 = 8 + max_connections/100 |
| thread_stack | 1MB（Linux 64位）| 1MB | 无变化 |
| wait_timeout | 28800（8小时）| 28800 | 无变化 |
| interactive_timeout | 28800 | 28800 | 无变化 |
| connect_timeout | 10 | 10 | 无变化，单位秒 |
| net_read_timeout | 30 | 30 | 无变化 |
| net_write_timeout | 60 | 60 | 无变化 |
| max_allowed_packet | 64MB | 64MB | 无变化 |

---

## 复制相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| binlog_format | ROW | 已移除 | 8.4 只支持 ROW 格式 |
| sync_binlog | 1 | 1 | 无变化 |
| binlog_expire_logs_seconds | 2592000（30天）| 2592000 | 无变化 |
| max_binlog_size | 1GB | 1GB | 无变化 |
| binlog_row_image | full | full | 无变化 |
| gtid_mode | OFF | OFF | 生产建议开启 |
| enforce_gtid_consistency | OFF | OFF | 开启 GTID 时需设为 ON |
| replica_parallel_workers | 4（8.0.27+）| 4 | 无变化 |
| replica_parallel_type | LOGICAL_CLOCK（8.0.27+）| LOGICAL_CLOCK | 8.4 移除了 DATABASE 类型 |
| replica_preserve_commit_order | ON（8.0.27+）| ON | 无变化 |
| relay_log_purge | ON | ON | 无变化 |
| relay_log_recovery | OFF | OFF | 生产建议开启 |
| source_verify_checksum | OFF | ON | 8.4 默认开启校验 |
| replica_type_conversions | （空）| （空）| 无变化 |
| log_replica_updates | ON（8.0.3+）| ON | 无变化 |

---

## 日志相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| log_error_verbosity | 2 | 2 | 1=错误,2=+警告,3=+信息 |
| slow_query_log | OFF | OFF | 生产建议开启 |
| long_query_time | 10 | 10 | 单位秒，生产建议设为 1 |
| log_queries_not_using_indexes | OFF | OFF | 无变化 |
| general_log | OFF | OFF | 默认关闭，调试时临时开启 |
| log_output | FILE | FILE | 可选 TABLE |
| log_timestamps | UTC | UTC | 无变化 |

---

## 字符集与排序规则

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| character_set_server | utf8mb4 | utf8mb4 | 无变化 |
| collation_server | utf8mb4_0900_ai_ci | utf8mb4_0900_ai_ci | 无变化 |
| character_set_client | utf8mb4 | utf8mb4 | 无变化 |
| character_set_connection | utf8mb4 | utf8mb4 | 无变化 |
| character_set_results | utf8mb4 | utf8mb4 | 无变化 |

---

## 安全相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| default_authentication_plugin | caching_sha2_password（8.0）| 已移除 | 8.4 使用 authentication_policy |
| authentication_policy | 未引入 | caching_sha2_password,, | 8.4 新增，替代旧参数 |
| require_secure_transport | OFF | OFF | 无变化 |
| ssl_ca | （空）| （空）| 无变化 |
| password_history | 0 | 0 | 无变化 |
| password_reuse_interval | 0 | 0 | 无变化 |
| default_password_lifetime | 0 | 0 | 0=永不过期 |

---

## Performance Schema 相关

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| performance_schema | ON | ON | 无变化 |
| performance_schema_digests_size | 10000 | 10000 | 无变化 |
| performance_schema_max_sql_text_length | 1024 | 1024 | 无变化 |
| performance_schema_events_statements_history_size | 10 | 10 | 无变化 |
| performance_schema_events_statements_history_long_size | 10000 | 10000 | 无变化 |

---

## 其他重要变量

| 系统变量 | MySQL 8.0 默认值 | MySQL 8.4 默认值 | 说明 |
|---------|:---------------:|:---------------:|------|
| sql_mode | 包含 ONLY_FULL_GROUP_BY 等 | 同 8.0 | 无变化 |
| sort_buffer_size | 256KB | 256KB | 无变化 |
| join_buffer_size | 256KB | 256KB | 无变化 |
| tmp_table_size | 16MB | 16MB | 无变化 |
| max_heap_table_size | 16MB | 16MB | 无变化 |
| table_open_cache | 4000 | 4000 | 无变化 |
| table_definition_cache | -1（自动）| -1（自动）| 自动 = 400 + table_open_cache/2 |
| open_files_limit | 自动 | 自动 | 无变化 |
| innodb_dedicated_server | OFF | OFF | ON 时自动配置 InnoDB 参数 |

---

## 适用场景

- **MySQL 8.0 → 8.4 升级前的配置评估**：逐项对比当前 8.0 的配置与 8.4 的默认值，确认是否需要调整
- **新安装 MySQL 8.4 时的初始配置参考**：了解哪些参数需要从默认值修改以适应生产环境

---

## 常见问题

**从 8.0 升级到 8.4 后 my.cnf 中的旧参数会怎样？**

已被移除的参数（如 `innodb_log_file_size`、`innodb_log_files_in_group`、`binlog_format`）如果仍在 my.cnf 中，MySQL 8.4 启动时可能报错或忽略。建议升级前先清理 my.cnf 中的废弃参数。可以使用 `mysql_upgrade` 或 `mysqld --validate-config` 在升级前检查配置文件的兼容性。

---

## 注意事项

- MySQL 8.4 移除了 `binlog_format` 参数，只支持 ROW 格式的 Binlog。如果你的应用依赖 STATEMENT 或 MIXED 格式（如使用不确定函数的批量操作），升级前需要验证应用兼容性。
- `innodb_change_buffering` 在 8.4 中已被移除（固定为 none）。如果你的 8.0 配置中设置了这个参数，升级到 8.4 前需要从 my.cnf 中删除。

---

## 总结

MySQL 8.4 相比 8.0，大部分系统变量的默认值保持一致。主要变化：移除了 `innodb_log_file_size` 和 `innodb_log_files_in_group`（统一为 `innodb_redo_log_capacity`）；移除了 `binlog_format`（固定 ROW）；移除了 `innodb_change_buffering`；移除了 `default_authentication_plugin`（替换为 `authentication_policy`）；移除了 `replica_parallel_type` 的 DATABASE 选项。升级前清理 my.cnf 中的废弃参数，使用 `mysqld --validate-config` 检查配置兼容性。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
