var stage5Questions = [
{id:201,stage:5,type:"single",tags:["备份","mysqldump"],question:"mysqldump 属于哪种备份方式？",options:[
{text:"逻辑备份",correct:true,explanation:"mysqldump 导出的是 SQL 语句（CREATE TABLE + INSERT），属于逻辑备份。恢复时通过执行 SQL 重建数据。"},
{text:"物理备份",correct:false,explanation:"物理备份直接复制数据文件，如 Percona XtraBackup。mysqldump 导出的是 SQL 语句。"},
{text:"增量备份",correct:false,explanation:"mysqldump 默认做全量备份。增量备份通常用 Binlog 或 XtraBackup 实现。"},
{text:"快照备份",correct:false,explanation:"快照备份基于文件系统或存储快照，mysqldump 是逻辑导出。"}]},
{id:202,stage:5,type:"single",tags:["备份","mysqldump","一致性"],question:"mysqldump --single-transaction 参数的作用是什么？",options:[
{text:"在一个事务中导出 InnoDB 表，保证数据一致性且不锁表",correct:true,explanation:"利用 MVCC 快照读在一个事务中导出所有数据，不阻塞其他 DML 操作。仅适用于 InnoDB 表。"},
{text:"每张表单独一个事务导出",correct:false,explanation:"--single-transaction 是整个导出过程在一个事务中，不是每表一个事务。"},
{text:"导出时自动开启事务并提交",correct:false,explanation:"该参数的核心是利用一致性快照保证导出数据一致，不是简单的开启和提交事务。"},
{text:"禁止事务日志写入",correct:false,explanation:"不会禁止日志写入，只是利用 MVCC 快照读。"}]},
{id:203,stage:5,type:"single",tags:["备份","XtraBackup"],question:"Percona XtraBackup 属于哪种备份方式？",options:[
{text:"物理备份（热备份）",correct:true,explanation:"XtraBackup 直接复制 InnoDB 数据文件和 Redo Log，在不停止 MySQL 服务的情况下完成备份（热备份）。"},
{text:"逻辑备份",correct:false,explanation:"逻辑备份导出 SQL 语句，XtraBackup 直接复制物理文件。"},
{text:"冷备份",correct:false,explanation:"冷备份需要停止 MySQL 服务，XtraBackup 是热备份，不停服务。"},
{text:"云备份",correct:false,explanation:"XtraBackup 是本地物理备份工具，不是云备份方案。"}]},
{id:204,stage:5,type:"truefalse",tags:["备份","Binlog"],question:"通过 Binlog 可以实现 MySQL 的增量备份和时间点恢复（PITR）。",options:[
{text:"正确",correct:true,explanation:"Binlog 记录所有数据变更，配合全量备份可以重放 Binlog 恢复到任意时间点。这是 PITR 的核心机制。"},
{text:"错误",correct:false,explanation:"Binlog 确实是增量备份和 PITR 的基础，记录了全量备份之后的所有数据变更。"}]},
{id:205,stage:5,type:"single",tags:["备份","mysqlbinlog"],question:"使用 mysqlbinlog 恢复 Binlog 到指定时间点的正确参数是什么？",options:[
{text:"--stop-datetime='2024-06-15 14:30:00'",correct:true,explanation:"--stop-datetime 指定恢复到的时间点，--start-datetime 指定起始时间。也可以用 --stop-position 按位置恢复。"},
{text:"--end-time='2024-06-15 14:30:00'",correct:false,explanation:"正确参数名是 --stop-datetime，不是 --end-time。"},
{text:"--until='2024-06-15 14:30:00'",correct:false,explanation:"没有 --until 参数，正确的是 --stop-datetime。"},
{text:"--restore-to='2024-06-15 14:30:00'",correct:false,explanation:"没有 --restore-to 参数。"}]},
{id:206,stage:5,type:"single",tags:["复制","主从复制"],question:"MySQL 主从复制中，从库用哪个线程将 Binlog 写入 Relay Log？",options:[
{text:"I/O Thread（复制 I/O 线程）",correct:true,explanation:"I/O Thread 连接主库读取 Binlog 事件并写入本地 Relay Log。SQL Thread 再读取 Relay Log 并重放执行。"},
{text:"SQL Thread",correct:false,explanation:"SQL Thread 负责读取 Relay Log 并执行 SQL，不是从主库拉取 Binlog。"},
{text:"Dump Thread",correct:false,explanation:"Dump Thread 运行在主库上，负责读取 Binlog 发送给从库。不是从库的线程。"},
{text:"Relay Thread",correct:false,explanation:"MySQL 中没有叫 Relay Thread 的线程，从库接收 Binlog 的是 I/O Thread。"}]},
{id:207,stage:5,type:"single",tags:["复制","GTID"],question:"GTID 复制相比传统基于 Binlog 位置的复制的主要优势是什么？",options:[
{text:"每个事务有全局唯一标识，故障转移时自动定位复制位置",correct:true,explanation:"GTID 为每个事务分配唯一 ID（server_uuid:transaction_id），从库切换主库时自动跳过已执行的事务，无需手动指定 Binlog 文件和位置。"},
{text:"复制速度更快",correct:false,explanation:"GTID 不直接影响复制速度，它的优势在于管理便利性和故障转移的可靠性。"},
{text:"减少网络传输量",correct:false,explanation:"GTID 不减少传输量，传输的仍然是相同的 Binlog 事件。"},
{text:"支持跨版本复制",correct:false,explanation:"跨版本复制与 GTID 无关，取决于 Binlog 格式兼容性。"}]},
{id:208,stage:5,type:"multiple",tags:["复制","半同步复制"],question:"关于 MySQL 半同步复制（Semi-Synchronous Replication），以下哪些说法正确？（多选）",options:[
{text:"主库等待至少一个从库确认收到 Binlog 后才向客户端返回提交成功",correct:true,explanation:"半同步确保事务的 Binlog 至少被一个从库接收，减少主库故障时的数据丢失风险。"},
{text:"如果从库超时未确认，半同步会退化为异步复制",correct:true,explanation:"超过 rpl_semi_sync_source_timeout（默认10秒）无响应时自动退化为异步，保证可用性。"},
{text:"半同步保证从库已执行（重放）了事务",correct:false,explanation:"半同步只保证从库接收并写入 Relay Log，不保证已重放执行。从库可能有延迟。"},
{text:"MySQL 8.4 中半同步复制功能已被移除",correct:false,explanation:"半同步复制仍然可用。8.4 移除的是旧的插件安装方式，功能本身还在。"}]},
{id:209,stage:5,type:"single",tags:["MGR","Group Replication"],question:"MySQL Group Replication（MGR）的单主模式下，有多少个节点可以执行写操作？",options:[
{text:"只有 1 个主节点可以写",correct:true,explanation:"单主模式下只有一个 Primary 节点接受读写，其他 Secondary 节点只读。Primary 故障时自动选举新 Primary。"},
{text:"所有节点都可以写",correct:false,explanation:"所有节点可写是多主模式。单主模式只有 Primary 可写。"},
{text:"由 DBA 手动指定写节点数量",correct:false,explanation:"单主模式固定只有一个写节点，由 MGR 自动管理。"},
{text:"取决于节点数量",correct:false,explanation:"单主模式不管有多少节点，始终只有一个可写。"}]},
{id:210,stage:5,type:"single",tags:["MGR","Paxos"],question:"MGR 使用什么协议保证节点间的数据一致性？",options:[
{text:"Paxos 协议的变体（组通信协议 GCS）",correct:true,explanation:"MGR 基于 Paxos 协议实现的组通信系统（GCS），保证事务在集群中达成多数派共识后才提交。"},
{text:"Raft 协议",correct:false,explanation:"Raft 是另一种共识协议，用于 etcd 等系统。MGR 使用的是 Paxos 变体。"},
{text:"两阶段提交（2PC）",correct:false,explanation:"2PC 用于 InnoDB 内部的 Redo Log 和 Binlog 一致性，MGR 使用 Paxos。"},
{text:"ZAB 协议",correct:false,explanation:"ZAB 是 ZooKeeper 使用的协议，MGR 使用 Paxos。"}]},
{id:211,stage:5,type:"truefalse",tags:["MGR","节点数量"],question:"MGR 集群建议使用偶数个节点（如 4 个）以获得最佳容错能力。",options:[
{text:"正确",correct:false,explanation:"MGR 建议奇数个节点（如 3、5、7）。偶数节点在脑裂时无法确定多数派。3 节点容忍 1 个故障，5 节点容忍 2 个。"},
{text:"错误",correct:true,explanation:"应使用奇数个节点。4 节点和 3 节点的容错能力相同（都只能容忍 1 个故障），但 4 节点浪费资源。"}]},
{id:212,stage:5,type:"single",tags:["备份","备份策略"],question:"生产环境推荐的备份策略是什么？",options:[
{text:"定期全量备份 + 连续 Binlog 归档（增量备份）",correct:true,explanation:"如每周一次全量备份（XtraBackup/mysqldump）+ 持续归档 Binlog。恢复时先恢复全量再重放 Binlog 到目标时间点。"},
{text:"只做全量备份即可",correct:false,explanation:"只有全量备份无法恢复到备份之后的时间点，会丢失两次备份间的数据。"},
{text:"只保留 Binlog 不需要全量备份",correct:false,explanation:"只有 Binlog 没有基础全量，无法从零恢复完整数据库。"},
{text:"每次操作前手动备份",correct:false,explanation:"手动备份不可靠，应该使用自动化的定期备份策略。"}]},
{id:213,stage:5,type:"single",tags:["复制","复制延迟"],question:"从库复制延迟（Replication Lag）的常见原因不包括以下哪个？",options:[
{text:"从库的 innodb_buffer_pool_size 设置过大",correct:true,explanation:"Buffer Pool 过大不是延迟原因（反而可能帮助性能）。延迟常见原因有：从库单线程重放、主库大事务、从库硬件弱、从库有额外查询负载等。"},
{text:"主库执行了大事务",correct:false,explanation:"大事务在从库重放时需要较长时间，是延迟的常见原因。"},
{text:"从库硬件配置低于主库",correct:false,explanation:"从库性能不足会导致重放速度跟不上主库写入速度。"},
{text:"从库上有大量查询负载",correct:false,explanation:"从库的查询负载与重放线程竞争资源，会加剧延迟。"}]},
{id:214,stage:5,type:"single",tags:["复制","多线程复制"],question:"MySQL 8.0+ 的多线程复制（MTS）基于什么并行？",options:[
{text:"LOGICAL_CLOCK（逻辑时钟，同一组提交的事务并行重放）",correct:true,explanation:"LOGICAL_CLOCK 基于主库的 Binlog Group Commit 分组，同一组提交的事务在从库可以并行重放，大幅减少延迟。"},
{text:"DATABASE（按数据库并行）",correct:false,explanation:"DATABASE 模式在 8.4 中已移除，且只有操作不同数据库的事务才能并行，局限性大。"},
{text:"TABLE（按表并行）",correct:false,explanation:"MySQL 不支持按表并行的复制模式。"},
{text:"ROW（按行并行）",correct:false,explanation:"MySQL 不支持行级别的并行复制。"}]},
{id:215,stage:5,type:"single",tags:["高可用","InnoDB Cluster"],question:"MySQL InnoDB Cluster 由哪三个组件组成？",options:[
{text:"Group Replication + MySQL Shell + MySQL Router",correct:true,explanation:"MGR 提供高可用数据同步，MySQL Shell 管理集群，MySQL Router 提供应用层透明的读写分离和故障转移。"},
{text:"主从复制 + HAProxy + Keepalived",correct:false,explanation:"这是传统的高可用方案，不是 InnoDB Cluster 的官方组件。"},
{text:"MGR + ProxySQL + Orchestrator",correct:false,explanation:"ProxySQL 和 Orchestrator 是第三方工具，不是 InnoDB Cluster 的组件。"},
{text:"NDB Cluster + MySQL Proxy + Management Server",correct:false,explanation:"这是 MySQL NDB Cluster 的组件，不是 InnoDB Cluster。"}]},
{id:216,stage:5,type:"single",tags:["高可用","MySQL Router"],question:"MySQL Router 在 InnoDB Cluster 中的作用是什么？",options:[
{text:"应用层透明路由，自动读写分离和故障转移",correct:true,explanation:"MySQL Router 作为中间件代理，将写请求路由到 Primary，读请求分发到 Secondary，Primary 故障时自动切换。"},
{text:"数据同步",correct:false,explanation:"数据同步是 Group Replication 的职责，不是 Router 的。"},
{text:"集群管理和监控",correct:false,explanation:"集群管理用 MySQL Shell，Router 负责连接路由。"},
{text:"数据备份",correct:false,explanation:"Router 不做备份，它是连接路由层。"}]},
{id:217,stage:5,type:"single",tags:["Performance Schema","监控"],question:"performance_schema 的主要用途是什么？",options:[
{text:"监控 MySQL 服务器内部的运行状态和性能指标",correct:true,explanation:"performance_schema 提供详细的服务器内部事件数据：等待事件、锁信息、SQL 执行统计、内存使用、文件 I/O 等。"},
{text:"存储用户数据",correct:false,explanation:"performance_schema 不存储用户数据，只存储性能监控数据。"},
{text:"管理数据库权限",correct:false,explanation:"权限管理在 mysql 系统库中，performance_schema 是监控库。"},
{text:"记录 Binlog",correct:false,explanation:"Binlog 是独立的日志系统，与 performance_schema 无关。"}]},
{id:218,stage:5,type:"multiple",tags:["Performance Schema","sys"],question:"以下关于 sys 库的说法，哪些正确？（多选）",options:[
{text:"sys 库是对 performance_schema 和 information_schema 的视图封装",correct:true,explanation:"sys 库提供更易读的视图和函数，简化了 performance_schema 的复杂查询。"},
{text:"可以通过 sys.statement_analysis 查看最耗时的 SQL",correct:true,explanation:"statement_analysis 视图按总执行时间排序显示 SQL 统计，快速找到性能瓶颈。"},
{text:"sys 库中的数据可以手动修改",correct:false,explanation:"sys 库的视图是只读的，数据来源于 performance_schema。"},
{text:"sys 库需要额外安装",correct:false,explanation:"MySQL 8.0+ 默认包含 sys 库，不需要额外安装。"}]},
{id:219,stage:5,type:"single",tags:["监控","SHOW PROCESSLIST"],question:"如何查看当前所有连接和正在执行的 SQL？",options:[
{text:"SHOW PROCESSLIST 或查询 performance_schema.processlist",correct:true,explanation:"SHOW PROCESSLIST 显示所有活跃连接及其状态。8.0+ 建议查询 performance_schema.processlist，信息更完整且不截断 SQL。"},
{text:"SHOW CONNECTIONS",correct:false,explanation:"MySQL 没有 SHOW CONNECTIONS 命令。"},
{text:"SELECT * FROM mysql.connections",correct:false,explanation:"mysql 库中没有 connections 表。"},
{text:"SHOW STATUS LIKE 'connections'",correct:false,explanation:"这只显示连接数统计，不显示具体连接信息和正在执行的 SQL。"}]},
{id:220,stage:5,type:"single",tags:["参数调优","innodb_buffer_pool_size"],question:"如何判断 innodb_buffer_pool_size 是否设置得足够大？",options:[
{text:"查看 Buffer Pool 命中率，低于 99% 说明可能偏小",correct:true,explanation:"SHOW STATUS LIKE 'Innodb_buffer_pool_read%' 计算命中率。低于 99% 意味着频繁磁盘读取，应考虑增大 Buffer Pool。"},
{text:"Buffer Pool 大小等于表数据大小即可",correct:false,explanation:"Buffer Pool 还需要缓存索引页、Undo 页等，大小通常应大于纯数据量。"},
{text:"看 MySQL 是否报错",correct:false,explanation:"Buffer Pool 不够不会报错，只是性能下降（更多磁盘 I/O）。"},
{text:"固定设为物理内存的 100%",correct:false,explanation:"设为 100% 会导致操作系统和其他进程没有内存可用。"}]},
{id:221,stage:5,type:"single",tags:["参数调优","双一配置"],question:"什么是 MySQL 的\"双一配置\"？",options:[
{text:"innodb_flush_log_at_trx_commit=1 + sync_binlog=1",correct:true,explanation:"双一配置保证每次事务提交都将 Redo Log 和 Binlog 同步刷盘，最大程度防止数据丢失，但对性能有一定影响。"},
{text:"innodb_buffer_pool_instances=1 + innodb_io_capacity=1",correct:false,explanation:"这不是双一配置，这些参数设为 1 也没有特殊意义。"},
{text:"max_connections=1 + max_user_connections=1",correct:false,explanation:"这会限制只能有一个连接，不是双一配置的含义。"},
{text:"read_only=1 + super_read_only=1",correct:false,explanation:"这是设置只读模式，不是双一配置。"}]},
{id:222,stage:5,type:"truefalse",tags:["备份","mysqldump","MyISAM"],question:"mysqldump --single-transaction 对 MyISAM 表也能保证一致性快照。",options:[
{text:"正确",correct:false,explanation:"--single-transaction 利用 InnoDB 的 MVCC 实现一致性快照，MyISAM 不支持事务和 MVCC。对 MyISAM 表需要 --lock-tables 加锁。"},
{text:"错误",correct:true,explanation:"MyISAM 不支持事务，--single-transaction 只对 InnoDB 表有效。混合引擎时需要额外考虑。"}]},
{id:223,stage:5,type:"single",tags:["复制","GTID","purged"],question:"gtid_purged 变量的含义是什么？",options:[
{text:"已经执行但 Binlog 已被清理的 GTID 集合",correct:true,explanation:"当旧的 Binlog 被 purge 后，这些已执行事务的 GTID 记录在 gtid_purged 中，防止从库重复请求已清理的事务。"},
{text:"当前正在执行的 GTID",correct:false,explanation:"当前正在执行的在 gtid_owned 中，gtid_purged 是已清理的。"},
{text:"从库尚未执行的 GTID",correct:false,explanation:"从库未执行的是 gtid_executed 的差集，不是 gtid_purged。"},
{text:"被跳过的 GTID",correct:false,explanation:"gtid_purged 不是跳过的事务，而是已执行但 Binlog 文件已被删除的。"}]},
{id:224,stage:5,type:"single",tags:["监控","innodb_status"],question:"SHOW ENGINE INNODB STATUS 可以查看哪些信息？",options:[
{text:"InnoDB 内部状态：事务、锁等待、死锁、Buffer Pool、I/O 等",correct:true,explanation:"这是 InnoDB 最详细的诊断命令，包含最近的死锁信息、活跃事务、锁等待、Buffer Pool 使用率、I/O 统计等。"},
{text:"InnoDB 引擎的源代码",correct:false,explanation:"不显示源代码，显示的是运行时状态信息。"},
{text:"InnoDB 表的数据内容",correct:false,explanation:"不显示表数据，只显示引擎内部运行状态。"},
{text:"InnoDB 的配置文件内容",correct:false,explanation:"配置文件内容通过 SHOW VARIABLES 查看，不是 SHOW ENGINE INNODB STATUS。"}]},
{id:225,stage:5,type:"single",tags:["参数调优","tmp_table_size"],question:"tmp_table_size 和 max_heap_table_size 的关系是什么？",options:[
{text:"内存临时表的大小限制取两者的较小值",correct:true,explanation:"内部临时表先在内存中创建，大小限制为 MIN(tmp_table_size, max_heap_table_size)。超过此值时转换为磁盘临时表。"},
{text:"tmp_table_size 控制磁盘临时表，max_heap_table_size 控制内存临时表",correct:false,explanation:"两者都影响内存临时表的上限，取较小值。"},
{text:"两个参数功能相同",correct:false,explanation:"虽然都影响内存临时表大小，但 max_heap_table_size 还限制用户创建的 MEMORY 表。"},
{text:"两者无关",correct:false,explanation:"内存临时表的大小限制取两者中较小的值，密切相关。"}]},
{id:226,stage:5,type:"single",tags:["高可用","读写分离"],question:"读写分离架构中，以下哪种查询应该路由到主库？",options:[
{text:"对数据实时性要求极高的读查询（如支付后立即查询订单状态）",correct:true,explanation:"写后读（Read-After-Write）场景如果路由到从库，由于复制延迟可能读到旧数据。对一致性要求高的读应该走主库。"},
{text:"所有 SELECT 查询",correct:false,explanation:"大部分 SELECT 可以路由到从库，只有对实时性要求极高的才需要走主库。"},
{text:"报表统计查询",correct:false,explanation:"报表查询通常对实时性要求不高，适合路由到从库，减轻主库压力。"},
{text:"全文搜索查询",correct:false,explanation:"全文搜索是读操作，如果不要求实时性可以路由到从库。"}]},
{id:227,stage:5,type:"single",tags:["监控","慢查询","Performance Schema"],question:"performance_schema.events_statements_summary_by_digest 表的作用是什么？",options:[
{text:"按 SQL 模板（digest）聚合统计执行次数、平均耗时等指标",correct:true,explanation:"将参数不同但结构相同的 SQL 归为一类（digest），统计总执行时间、次数、平均延迟等，是分析 SQL 性能的重要数据源。"},
{text:"存储所有执行过的 SQL 语句原文",correct:false,explanation:"该表存储的是 SQL 模板（参数被替换为?）和统计数据，不是每条 SQL 的原文。"},
{text:"记录 SQL 语法错误",correct:false,explanation:"语法错误在错误日志中，该表统计的是成功执行的 SQL。"},
{text:"存储查询执行计划",correct:false,explanation:"执行计划用 EXPLAIN 查看，该表只统计执行指标。"}]},
{id:228,stage:5,type:"truefalse",tags:["复制","延迟复制"],question:"MySQL 支持有意延迟从库的复制（Delayed Replication），可用于误操作恢复。",options:[
{text:"正确",correct:true,explanation:"CHANGE REPLICATION SOURCE TO SOURCE_DELAY=3600 设置从库延迟 1 小时重放。误操作后可在从库尚未重放错误操作前停止复制并恢复数据。"},
{text:"错误",correct:false,explanation:"延迟复制是 MySQL 内置功能，通过 SOURCE_DELAY 参数控制。"}]},
{id:229,stage:5,type:"single",tags:["参数调优","table_open_cache"],question:"table_open_cache 参数的作用是什么？",options:[
{text:"控制 MySQL 可以同时打开的表缓存数量",correct:true,explanation:"每个连接使用表时需要打开表描述符，table_open_cache 控制缓存的数量。如果频繁看到 Opened_tables 增长，说明缓存太小。"},
{text:"控制 InnoDB Buffer Pool 中缓存的表数量",correct:false,explanation:"Buffer Pool 缓存的是数据页，不是表。table_open_cache 是表描述符缓存。"},
{text:"控制最大建表数量",correct:false,explanation:"table_open_cache 不限制建表数量，只控制同时打开的表缓存。"},
{text:"控制临时表的数量",correct:false,explanation:"临时表不受 table_open_cache 限制。"}]},
{id:230,stage:5,type:"single",tags:["监控","SHOW STATUS"],question:"SHOW GLOBAL STATUS LIKE 'Threads_running' 显示的是什么？",options:[
{text:"当前正在执行查询的线程数（不包括空闲连接）",correct:true,explanation:"Threads_running 是当前活跃执行 SQL 的线程数。如果持续偏高，说明系统负载大或有慢查询。Threads_connected 是总连接数包含空闲。"},
{text:"MySQL 服务器的总线程数",correct:false,explanation:"总线程数看 Threads_connected，Threads_running 只统计活跃的。"},
{text:"线程池中可用的线程数",correct:false,explanation:"这是线程池的可用线程，Threads_running 是正在执行查询的线程。"},
{text:"历史上运行过的总线程数",correct:false,explanation:"历史总数看 Threads_created，Threads_running 是当前时刻的活跃数。"}]},
{id:231,stage:5,type:"single",tags:["备份","克隆插件"],question:"MySQL 8.0 引入的 Clone Plugin 的主要用途是什么？",options:[
{text:"在线克隆 MySQL 实例数据，快速搭建从库或 MGR 新节点",correct:true,explanation:"Clone Plugin 可以从运行中的实例在线复制所有 InnoDB 数据到新实例，比传统备份恢复快得多，特别适合快速扩容。"},
{text:"克隆数据库结构（不含数据）",correct:false,explanation:"Clone Plugin 复制的是完整数据（含数据和结构），不只是结构。"},
{text:"克隆 MySQL 配置文件",correct:false,explanation:"Clone Plugin 不复制配置文件，只复制数据。"},
{text:"创建数据库快照用于开发测试",correct:false,explanation:"Clone Plugin 的主要用途是搭建复制/MGR 节点，虽然也可用于测试但不是主要目的。"}]},
{id:232,stage:5,type:"multiple",tags:["日志","MySQL日志"],question:"以下哪些属于 MySQL 的核心日志？（多选）",options:[
{text:"Error Log（错误日志）",correct:true,explanation:"记录 MySQL 的启动、关闭、错误和警告信息。"},
{text:"Binary Log（二进制日志）",correct:true,explanation:"记录所有数据变更，用于复制和 PITR 恢复。"},
{text:"Slow Query Log（慢查询日志）",correct:true,explanation:"记录执行时间超过阈值的 SQL，用于性能优化。"},
{text:"Access Log（访问日志）",correct:false,explanation:"MySQL 没有 Access Log 概念，那是 Web 服务器的日志。MySQL 有 General Log 记录所有操作。"}]},
{id:233,stage:5,type:"single",tags:["参数调优","innodb_io_capacity"],question:"SSD 磁盘上 innodb_io_capacity 建议设为多少？",options:[
{text:"2000 ~ 10000",correct:true,explanation:"SSD 的 IOPS 远高于 HDD。innodb_io_capacity 应匹配磁盘实际能力。HDD 建议 200-400，SSD 建议 2000-10000，高端 NVMe SSD 可更高。"},
{text:"100 ~ 200",correct:false,explanation:"100-200 适合传统 HDD，SSD 的 IOPS 远高于此。"},
{text:"50000 ~ 100000",correct:false,explanation:"即使是高端 NVMe SSD 也很少需要设这么高。设太高可能导致 InnoDB 过度刷脏。"},
{text:"使用默认值 200 即可",correct:false,explanation:"默认值 200 是为 HDD 设计的，SSD 上应该调高。"}]},
{id:234,stage:5,type:"single",tags:["高可用","故障转移"],question:"在 InnoDB Cluster 中 Primary 节点故障后会发生什么？",options:[
{text:"MGR 自动选举新的 Primary，Router 自动将写请求路由到新 Primary",correct:true,explanation:"MGR 的自动故障转移在秒级完成选举，MySQL Router 检测到拓扑变化后自动切换路由，应用层无需修改。"},
{text:"集群完全停止，需要手动恢复",correct:false,explanation:"MGR 设计为自动故障转移，不需要手动干预（只要多数派节点存活）。"},
{text:"所有从库提升为主库",correct:false,explanation:"只有一个 Secondary 被选举为新 Primary，不是所有都提升。"},
{text:"数据丢失后重建集群",correct:false,explanation:"MGR 的 Paxos 协议保证已共识的事务不丢失，自动选举不涉及数据丢失。"}]},
{id:235,stage:5,type:"single",tags:["参数调优","max_connections"],question:"如何计算合适的 max_connections 值？",options:[
{text:"根据应用连接池大小、并发量和可用内存综合评估",correct:true,explanation:"每个连接占用一定内存（sort_buffer、join_buffer 等）。max_connections = 可用内存 / 每连接内存开销，同时不能超过应用实际需要。"},
{text:"设置为尽可能大的值",correct:false,explanation:"每个连接都消耗内存，设太大可能导致内存不足。空闲连接也占用资源。"},
{text:"固定设为 1000",correct:false,explanation:"应根据实际业务负载和硬件资源评估，不能一刀切。"},
{text:"等于服务器 CPU 核心数",correct:false,explanation:"max_connections 与 CPU 核心数没有直接对应关系。"}]},
{id:236,stage:5,type:"truefalse",tags:["备份","XtraBackup","增量"],question:"Percona XtraBackup 支持增量备份，只备份自上次备份以来变化的数据页。",options:[
{text:"正确",correct:true,explanation:"XtraBackup 通过比较数据页的 LSN（Log Sequence Number），只备份 LSN 大于上次备份的页，大幅减少备份数据量和时间。"},
{text:"错误",correct:false,explanation:"XtraBackup 确实支持增量备份，基于 LSN 比较实现。"}]},
{id:237,stage:5,type:"single",tags:["监控","锁分析"],question:"如何查看当前正在等待锁的事务？",options:[
{text:"查询 performance_schema.data_lock_waits 和 data_locks",correct:true,explanation:"data_lock_waits 显示锁等待关系（谁在等谁），data_locks 显示所有当前持有和等待的锁。8.0+ 推荐用此方式。"},
{text:"SHOW LOCKS",correct:false,explanation:"MySQL 没有 SHOW LOCKS 命令。"},
{text:"查询 information_schema.INNODB_LOCKS",correct:false,explanation:"INNODB_LOCKS 和 INNODB_LOCK_WAITS 在 8.0 中已被移除，用 performance_schema 替代。"},
{text:"SHOW ENGINE MYISAM STATUS",correct:false,explanation:"MyISAM 没有行级锁，且没有 SHOW ENGINE MYISAM STATUS 命令。"}]},
{id:238,stage:5,type:"single",tags:["参数调优","thread_pool"],question:"MySQL 企业版的线程池（Thread Pool）解决什么问题？",options:[
{text:"高并发连接时避免线程过多导致的上下文切换开销",correct:true,explanation:"默认的一连接一线程模型在数千并发时线程过多，上下文切换严重。线程池复用少量线程处理大量连接，降低开销。"},
{text:"自动创建数据库连接",correct:false,explanation:"创建数据库连接是应用层连接池的功能，不是 MySQL 线程池。"},
{text:"并行执行单个查询",correct:false,explanation:"MySQL 目前不支持单查询并行执行。线程池管理的是多个连接的调度。"},
{text:"缓存查询结果",correct:false,explanation:"查询缓存（Query Cache）已在 8.0 中移除，与线程池无关。"}]},
{id:239,stage:5,type:"single",tags:["复制","Binlog过期"],question:"MySQL 8.0+ 中用哪个参数控制 Binlog 的自动过期时间？",options:[
{text:"binlog_expire_logs_seconds",correct:true,explanation:"8.0 引入 binlog_expire_logs_seconds 以秒为单位精确控制过期时间。旧的 expire_logs_days 已废弃。默认 2592000（30天）。"},
{text:"expire_logs_days",correct:false,explanation:"expire_logs_days 在 8.0 中已被废弃，替换为 binlog_expire_logs_seconds。"},
{text:"binlog_retention_period",correct:false,explanation:"没有此参数名，正确的是 binlog_expire_logs_seconds。"},
{text:"log_bin_expiration",correct:false,explanation:"没有此参数名。"}]},
{id:240,stage:5,type:"single",tags:["高可用","ProxySQL"],question:"ProxySQL 在 MySQL 架构中扮演什么角色？",options:[
{text:"SQL 感知的数据库中间件代理，实现读写分离、查询路由和连接池",correct:true,explanation:"ProxySQL 可以解析 SQL 语句并根据规则路由到不同后端，支持读写分离、查询缓存、查询重写等功能。"},
{text:"MySQL 的备份工具",correct:false,explanation:"ProxySQL 不做备份，它是数据库代理层。"},
{text:"MySQL 的监控平台",correct:false,explanation:"ProxySQL 主要是代理和路由，虽然有简单的监控能力但不是监控平台。"},
{text:"MySQL 的复制管理工具",correct:false,explanation:"复制管理用 MySQL Shell 或 Orchestrator，ProxySQL 主要做查询路由。"}]},
{id:241,stage:5,type:"multiple",tags:["参数调优","连接管理"],question:"以下哪些方法可以减少 MySQL 连接数消耗？（多选）",options:[
{text:"应用层使用连接池",correct:true,explanation:"连接池复用连接，避免每次请求都创建新连接，大幅减少 MySQL 的连接数。"},
{text:"使用 ProxySQL 等代理层的连接复用",correct:true,explanation:"ProxySQL 的连接复用可以将前端大量连接映射到少量后端连接。"},
{text:"增大 max_connections",correct:false,explanation:"增大 max_connections 只是允许更多连接，不减少消耗。根本方案是减少实际连接需求。"},
{text:"设置合理的 wait_timeout 回收空闲连接",correct:true,explanation:"wait_timeout 控制空闲连接的存活时间，及时回收长时间空闲的连接释放资源。"}]},
{id:242,stage:5,type:"single",tags:["监控","sys库"],question:"sys.innodb_lock_waits 视图提供什么信息？",options:[
{text:"以人类可读格式显示当前的锁等待关系，包括等待和阻塞的 SQL",correct:true,explanation:"sys.innodb_lock_waits 封装了 performance_schema 的锁等待数据，直接显示谁在等谁、等待的 SQL 和阻塞的 SQL，方便快速诊断锁问题。"},
{text:"InnoDB 的所有锁列表",correct:false,explanation:"所有锁在 performance_schema.data_locks 中，sys.innodb_lock_waits 只显示等待关系。"},
{text:"历史死锁记录",correct:false,explanation:"历史死锁在 SHOW ENGINE INNODB STATUS 的 LATEST DETECTED DEADLOCK 部分。"},
{text:"锁的配置参数",correct:false,explanation:"配置参数用 SHOW VARIABLES 查看。"}]},
{id:243,stage:5,type:"single",tags:["备份","恢复验证"],question:"为什么备份后必须做恢复验证？",options:[
{text:"确保备份文件完整可用，避免真正需要恢复时才发现备份损坏",correct:true,explanation:"备份文件可能因磁盘故障、传输错误等原因损坏。定期恢复验证（在测试环境中恢复并检查数据）是备份策略的必要环节。"},
{text:"为了测试数据库性能",correct:false,explanation:"恢复验证的目的是验证备份可用性，不是测试性能。"},
{text:"为了更新统计信息",correct:false,explanation:"恢复验证与统计信息无关。"},
{text:"MySQL 强制要求必须做恢复验证",correct:false,explanation:"MySQL 不强制要求，但这是运维最佳实践。"}]},
{id:244,stage:5,type:"truefalse",tags:["复制","级联复制"],question:"MySQL 支持级联复制（A→B→C），从库 B 可以同时作为 C 的主库。",options:[
{text:"正确",correct:true,explanation:"通过在 B 上开启 log_replica_updates（记录重放的事务到自己的 Binlog），B 可以将数据继续复制给 C，实现级联复制。"},
{text:"错误",correct:false,explanation:"MySQL 支持级联复制，需要在中间节点开启 log_replica_updates。"}]},
{id:245,stage:5,type:"single",tags:["参数调优","general_log"],question:"General Log 在生产环境通常是什么状态？为什么？",options:[
{text:"关闭，因为记录所有 SQL 对性能影响很大",correct:true,explanation:"General Log 记录每一条 SQL（包括 SELECT），I/O 开销巨大。生产环境只在排查问题时临时开启，问题定位后立即关闭。"},
{text:"始终开启用于审计",correct:false,explanation:"审计用审计插件（Audit Plugin），不用 General Log。General Log 的性能开销在生产环境不可接受。"},
{text:"开启但只记录 DML",correct:false,explanation:"General Log 不能选择只记录特定类型的 SQL。"},
{text:"默认开启无需关心",correct:false,explanation:"默认是关闭的，因为对性能影响大。"}]},
{id:246,stage:5,type:"single",tags:["高可用","分库分表"],question:"数据库分库分表后面临的最大挑战是什么？",options:[
{text:"跨分片查询和分布式事务的复杂性",correct:true,explanation:"分库分表后 JOIN、聚合、排序可能跨多个分片，需要在中间件层合并。分布式事务需要 XA 或 Saga 等模式保证一致性。"},
{text:"单表查询变慢",correct:false,explanation:"分库分表后单表数据量减少，单表查询通常更快。"},
{text:"备份更简单",correct:false,explanation:"分库分表后备份更复杂，需要协调多个实例的一致性。"},
{text:"不需要索引了",correct:false,explanation:"每个分片仍然需要合适的索引。"}]},
{id:247,stage:5,type:"single",tags:["监控","Performance Schema"],question:"如何通过 Performance Schema 查看最近的死锁信息？",options:[
{text:"SHOW ENGINE INNODB STATUS 中的 LATEST DETECTED DEADLOCK 部分",correct:true,explanation:"最详细的死锁信息在 SHOW ENGINE INNODB STATUS 输出中。也可以开启 innodb_print_all_deadlocks 将所有死锁记录到错误日志。"},
{text:"查询 performance_schema.deadlocks 表",correct:false,explanation:"performance_schema 中没有 deadlocks 表。"},
{text:"SHOW DEADLOCKS",correct:false,explanation:"MySQL 没有 SHOW DEADLOCKS 命令。"},
{text:"查询 sys.deadlock_history",correct:false,explanation:"sys 库中没有 deadlock_history 视图。"}]},
{id:248,stage:5,type:"single",tags:["参数调优","open_files_limit"],question:"MySQL 报错 Too many open files 应该调整什么？",options:[
{text:"增大操作系统的文件描述符限制和 MySQL 的 open_files_limit",correct:true,explanation:"MySQL 的 open_files_limit 受操作系统 ulimit -n 限制。需要同时调大 OS 层的 nofile 和 MySQL 的 open_files_limit。"},
{text:"减少数据库表的数量",correct:false,explanation:"减少表数量治标不治本，应该调大文件描述符限制。"},
{text:"重启 MySQL 服务",correct:false,explanation:"重启不能解决根本问题，需要调大限制。"},
{text:"增大 innodb_buffer_pool_size",correct:false,explanation:"Buffer Pool 大小与文件描述符限制无关。"}]},
{id:249,stage:5,type:"single",tags:["复制","从库只读"],question:"如何确保 MySQL 从库不被误写入数据？",options:[
{text:"设置 super_read_only=ON 禁止所有用户（包括 SUPER 权限用户）写入",correct:true,explanation:"read_only=ON 只阻止普通用户写入，SUPER 权限用户仍可写。super_read_only=ON 连 SUPER 用户也禁止，更安全。"},
{text:"设置 read_only=ON 即可",correct:false,explanation:"read_only=ON 不阻止 SUPER 权限用户的写操作，不够安全。应该用 super_read_only=ON。"},
{text:"不给用户 INSERT/UPDATE 权限",correct:false,explanation:"权限管理只针对特定用户，super_read_only 是全局的更可靠。"},
{text:"在应用层控制不写从库",correct:false,explanation:"应用层控制不可靠，数据库层面的 super_read_only 是最安全的保障。"}]},
{id:250,stage:5,type:"single",tags:["监控","QPS","TPS"],question:"如何计算 MySQL 的 QPS（每秒查询数）？",options:[
{text:"两次采样 SHOW GLOBAL STATUS 的 Questions 值相减再除以时间差",correct:true,explanation:"QPS = (Questions_t2 - Questions_t1) / (t2 - t1)。Questions 统计所有客户端发送的语句数。也可以用 Com_select 等单独统计各类操作。"},
{text:"直接查看 SHOW STATUS LIKE 'QPS'",correct:false,explanation:"MySQL 没有直接的 QPS 状态变量，需要通过 Questions 或 Com_* 的差值计算。"},
{text:"查看 slow_query_log",correct:false,explanation:"慢查询日志只记录慢SQL，不能用于计算 QPS。"},
{text:"使用 EXPLAIN",correct:false,explanation:"EXPLAIN 分析单条 SQL 的执行计划，不是统计 QPS。"}]}
];
