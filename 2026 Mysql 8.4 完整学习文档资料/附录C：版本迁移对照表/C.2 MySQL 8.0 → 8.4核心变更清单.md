> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# MySQL 8.0 → 8.4 核心变更清单

MySQL 8.4 是 MySQL 的首个 LTS（Long Term Support，长期支持）版本，在 MySQL 新的发布模型下，8.4 将获得至少 8 年的支持周期（Bug 修复 5 年 + 扩展支持 3 年），适合作为生产环境的长期稳定版本。本文梳理从 MySQL 8.0（特别是 8.0.34~8.0.40）到 8.4 的核心变更。

---

## 发布模型变更

```
MySQL 从 8.0 开始采用新的发布模型：
  Innovation Release（创新版本）：8.1、8.2、8.3
    快速迭代，引入新功能
    支持周期短，不适合生产长期使用
    
  LTS Release（长期支持版本）：8.4
    稳定性优先
    支持周期 8 年以上
    只接收 Bug 修复和安全更新，不引入新功能
    
  8.4 的定位：
    从 8.0 的各个 Innovation Release 中合并稳定的新功能
    移除 8.0 中已标记为废弃的特性
    作为从 8.0 升级的推荐目标版本
```

---

## 认证与安全变更

| 变更项 | MySQL 8.0 | MySQL 8.4 |
|-------|:---------:|:---------:|
| mysql_native_password 插件 | 默认可用（8.0.34 起废弃） | 默认禁用，需手动启用 |
| default_authentication_plugin | 存在（默认 caching_sha2_password） | 已移除，替换为 authentication_policy |
| authentication_policy | 不存在 | 新增，控制认证插件策略 |
| FIDO/WebAuthn 认证 | 8.0.27+ 引入 FIDO | 替换为 WebAuthn（authentication_webauthn） |
| OpenSSL 要求 | 支持较旧版本 | 要求 OpenSSL 1.1.1 或更高 |

```sql
-- 8.4 中启用 mysql_native_password（如果旧客户端需要）：
-- [mysqld]
-- mysql_native_password=ON
-- 或启动参数：--mysql-native-password=ON

-- 8.4 的认证策略配置：
-- authentication_policy = 'caching_sha2_password,,'
-- 第一个位置：第一因素认证插件
-- 第二个位置：第二因素（多因素认证，MFA）
-- 第三个位置：第三因素
```

---

## InnoDB 存储引擎变更

| 变更项 | MySQL 8.0 | MySQL 8.4 |
|-------|:---------:|:---------:|
| innodb_log_file_size | 存在（8.0.30 起废弃） | 已移除 |
| innodb_log_files_in_group | 存在（8.0.30 起废弃） | 已移除 |
| innodb_redo_log_capacity | 8.0.30+ 引入 | 唯一管理 Redo Log 容量的参数 |
| innodb_change_buffering | 存在（8.0.27 起废弃） | 已移除（固定为 none） |
| innodb_log_writer_threads | 存在 | 已移除 |
| innodb_numa_interleave | 存在 | 已移除（使用系统级 NUMA 策略） |
| Redo Log 动态开关 | 8.0.21+ 支持 ALTER INSTANCE DISABLE INNODB REDO_LOG | 保留 |
| 并行扫描 | 8.0.14+ 部分支持 | 增强优化 |

```
Redo Log 配置迁移：
  8.0（旧方式）：
    innodb_log_file_size = 256M
    innodb_log_files_in_group = 4
    总容量 = 256M × 4 = 1024M

  8.4（新方式）：
    innodb_redo_log_capacity = 1G
    不再指定文件数量和单个文件大小
    InnoDB 自动管理 Redo Log 文件
```

---

## 复制变更

| 变更项 | MySQL 8.0 | MySQL 8.4 |
|-------|:---------:|:---------:|
| binlog_format | 存在（ROW/STATEMENT/MIXED） | 已移除（固定为 ROW） |
| log_bin_use_v1_row_events | 存在 | 已移除 |
| binlog_transaction_dependency_tracking | 存在 | 已移除（固定为 WRITESET） |
| replica_parallel_type | 存在（DATABASE/LOGICAL_CLOCK） | 已移除（固定为 LOGICAL_CLOCK） |
| slave_ 开头的变量/命令 | 废弃但可用 | 大部分已移除 |
| CHANGE MASTER TO | 废弃但可用 | 已移除，使用 CHANGE REPLICATION SOURCE TO |
| SHOW SLAVE STATUS | 废弃但可用 | 已移除，使用 SHOW REPLICA STATUS |
| START/STOP SLAVE | 废弃但可用 | 已移除，使用 START/STOP REPLICA |
| source_verify_checksum | 默认 OFF | 默认 ON |
| SHOW MASTER STATUS | 废弃 | 已移除，使用 SHOW BINARY LOG STATUS |
| RESET MASTER | 废弃 | 已移除，使用 RESET BINARY LOGS AND GTIDS |

```
复制配置迁移注意：
  8.0 的 my.cnf：
    binlog_format = ROW
    replica_parallel_type = LOGICAL_CLOCK
    binlog_transaction_dependency_tracking = WRITESET

  8.4 的 my.cnf：
    # 以上三个参数都不需要设置（已移除/固定）
    # 直接删除即可
```

---

## SQL 语法与函数变更

```
变更1：移除 SQL_CALC_FOUND_ROWS 和 FOUND_ROWS()
  8.0：废弃但仍可用
  8.4：已移除
  替代：使用单独的 COUNT(*) 查询

  8.0（旧方式）：
    SELECT SQL_CALC_FOUND_ROWS * FROM t LIMIT 10;
    SELECT FOUND_ROWS();

  8.4（新方式）：
    SELECT * FROM t LIMIT 10;
    SELECT COUNT(*) FROM t;  -- 单独查询总数

变更2：BINARY 运算符废弃
  8.0.28+：BINARY 运算符废弃
  8.4：可能仍可用但产生警告
  替代：使用 CAST(expr AS BINARY) 或指定二进制排序规则

变更3：utf8mb3 进一步废弃
  8.4 中 utf8mb3（旧 utf8）产生更多废弃警告
  建议所有新表使用 utf8mb4
```

---

## 系统变量变更汇总

### 已移除的系统变量

| 系统变量 | 说明 |
|---------|------|
| binlog_format | 固定为 ROW |
| default_authentication_plugin | 替换为 authentication_policy |
| innodb_log_file_size | 替换为 innodb_redo_log_capacity |
| innodb_log_files_in_group | 替换为 innodb_redo_log_capacity |
| innodb_change_buffering | 固定为 none |
| innodb_log_writer_threads | 移除 |
| innodb_numa_interleave | 移除 |
| replica_parallel_type | 固定为 LOGICAL_CLOCK |
| binlog_transaction_dependency_tracking | 固定为 WRITESET |
| log_bin_use_v1_row_events | 移除 |
| old_alter_table | 移除 |
| avoid_temporal_upgrade | 移除 |
| show_old_temporals | 移除 |
| group_replication_recovery_complete_at | 移除 |
| slave_ 前缀的系统变量 | 替换为 replica_ 前缀 |

### 新增的系统变量

| 系统变量 | 说明 |
|---------|------|
| authentication_policy | 认证策略（替代 default_authentication_plugin） |
| explain_format | EXPLAIN 的默认输出格式 |
| innodb_buffer_pool_in_core_file | 控制 core dump 是否包含 Buffer Pool |
| connection_memory_limit | 单个连接的内存使用上限 |
| global_connection_memory_limit | 所有连接的总内存使用上限 |
| global_connection_memory_tracking | 是否追踪全局连接内存 |

---

## 升级路径

```
从 MySQL 8.0 升级到 8.4 的推荐路径：

步骤1：升级到 8.0 的最新版本（如 8.0.40）
  确保处于 8.0 系列的最新稳定版

步骤2：检查兼容性
  使用 MySQL Shell 的 util.checkForServerUpgrade() 检查
  或使用 mysqld --validate-config 验证配置文件
  
  重点检查：
  my.cnf 中是否有已移除的参数
  应用代码中是否使用了已移除的 SQL 语法
  是否依赖 mysql_native_password 认证
  是否使用 binlog_format=STATEMENT 或 MIXED
  是否使用 CHANGE MASTER TO 等旧语法

步骤3：清理 my.cnf
  移除所有已废弃/移除的参数
  将 slave_ 前缀的参数改为 replica_ 前缀

步骤4：测试环境升级验证
  在测试环境执行升级
  验证应用功能和性能
  关注复制是否正常

步骤5：生产环境升级
  建议使用复制升级方式（停机时间最短）：
  搭建 8.0 → 8.4 的主从复制
  验证从库数据一致性
  切换应用到 8.4 实例
```

---

## 适用场景

- **MySQL 8.0 → 8.4 LTS 升级项目**：系统性地评估变更影响，清理废弃参数和语法
- **新项目技术选型**：8.4 LTS 是 2026 年后新项目的推荐版本

---

## 常见问题

**8.0 和 8.4 之间的 Innovation Release（8.1/8.2/8.3）需要经过吗？**

不需要。MySQL 8.0 可以直接升级到 8.4，不需要经过 8.1/8.2/8.3。Innovation Release 是独立的功能预览版本，8.4 LTS 已经包含了从 8.1~8.3 中筛选出的稳定功能。升级路径是 8.0 → 8.4（直接跳过中间的 Innovation 版本）。

---

## 注意事项

- `binlog_format` 在 8.4 中被移除且固定为 ROW。如果你的应用依赖 STATEMENT 格式的 Binlog（如使用了不确定函数的复制场景），需要在升级前修改应用逻辑。ROW 格式记录的是行数据的变化而非 SQL 语句，对于大批量操作（如 DELETE 百万行）会产生更大的 Binlog。
- `mysql_native_password` 在 8.4 中默认被禁用。升级前需要确认所有客户端和连接器都支持 `caching_sha2_password`。如果无法升级客户端，可以在 my.cnf 中添加 `mysql_native_password=ON` 临时启用旧插件，但这只是过渡方案。

---

## 总结

MySQL 8.4 LTS 是从 8.0 升级的推荐目标版本，支持周期 8 年以上。核心变更：移除 binlog_format（固定 ROW）、移除 innodb_log_file_size 和 innodb_log_files_in_group（统一为 innodb_redo_log_capacity）、移除 innodb_change_buffering、mysql_native_password 默认禁用、移除 slave_ 前缀命令和变量、移除 CHANGE MASTER TO 等旧语法、固定 replica_parallel_type=LOGICAL_CLOCK。新增 authentication_policy、connection_memory_limit 等变量。升级前使用 util.checkForServerUpgrade() 检查兼容性，清理 my.cnf 中的废弃参数。

> 本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。
