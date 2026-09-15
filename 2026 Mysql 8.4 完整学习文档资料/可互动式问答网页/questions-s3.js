var stage3Questions = [
{id:101,stage:3,type:"single",tags:["InnoDB架构","Buffer Pool"],question:"InnoDB Buffer Pool 的主要作用是什么？",options:[
{text:"缓存数据页和索引页，减少磁盘 I/O",correct:true,explanation:"Buffer Pool 是 InnoDB 最重要的内存结构，将频繁访问的数据页和索引页缓存在内存中，避免每次查询都读磁盘。"},
{text:"缓存 SQL 查询结果",correct:false,explanation:"缓存查询结果是 Query Cache 的功能（已在 8.0 中移除）。Buffer Pool 缓存的是数据页，不是查询结果。"},
{text:"存储临时表数据",correct:false,explanation:"临时表有独立的临时表空间，不是 Buffer Pool 的主要用途。"},
{text:"存储 Redo Log",correct:false,explanation:"Redo Log 有独立的 Log Buffer 和磁盘文件，不在 Buffer Pool 中。"}
]},
{id:102,stage:3,type:"single",tags:["Buffer Pool","LRU"],question:"InnoDB Buffer Pool 使用的 LRU 算法有什么特殊之处？",options:[
{text:"分为 young 区和 old 区，新读入的页先放 old 区",correct:true,explanation:"改良的 LRU 将链表分为 young（热数据）和 old（冷数据）区，新页先进 old 区，被再次访问后才晋升到 young 区，防止全表扫描冲刷热数据。"},
{text:"使用标准 LRU，最近最少使用的页直接淘汰",correct:false,explanation:"标准 LRU 会被全表扫描冲刷，InnoDB 使用改良版本分为两个区域。"},
{text:"使用 LFU（最不常用）算法",correct:false,explanation:"InnoDB Buffer Pool 使用的是改良的 LRU，不是 LFU 算法。"},
{text:"使用 FIFO（先进先出）算法",correct:false,explanation:"FIFO 不考虑访问频率，InnoDB 使用的是改良 LRU，更智能地管理缓存。"}
]},
{id:103,stage:3,type:"single",tags:["InnoDB架构","Redo Log"],question:"Redo Log 的核心作用是什么？",options:[
{text:"保证事务的持久性（Durability），崩溃后恢复已提交的数据",correct:true,explanation:"Redo Log 采用 WAL（Write-Ahead Logging）机制，事务提交时先写 Redo Log 再异步刷数据页。崩溃后通过重放 Redo Log 恢复数据。"},
{text:"回滚未提交的事务",correct:false,explanation:"回滚用 Undo Log，不是 Redo Log。Redo Log 是重做已提交事务的修改。"},
{text:"记录 SQL 语句用于复制",correct:false,explanation:"记录 SQL 用于复制的是 Binlog，Redo Log 是 InnoDB 引擎层的物理日志。"},
{text:"优化查询性能",correct:false,explanation:"Redo Log 不直接优化查询，它的作用是保证崩溃恢复时的数据持久性。"}
]},
{id:104,stage:3,type:"single",tags:["InnoDB架构","Undo Log"],question:"Undo Log 的作用不包括以下哪个？",options:[
{text:"记录 DDL 操作的回滚信息",correct:true,explanation:"Undo Log 记录 DML 操作（INSERT/UPDATE/DELETE）的逆操作。DDL 操作（如 CREATE TABLE）不通过 Undo Log 回滚。"},
{text:"支持事务回滚（ROLLBACK）",correct:false,explanation:"这是 Undo Log 的核心功能之一，保存修改前的数据用于回滚。"},
{text:"支持 MVCC 的多版本读取",correct:false,explanation:"MVCC 的版本链就是通过 Undo Log 中的旧版本数据实现的。"},
{text:"支持一致性非锁定读",correct:false,explanation:"快照读通过 ReadView + Undo Log 版本链实现一致性非锁定读。"}
]},
{id:105,stage:3,type:"truefalse",tags:["InnoDB架构","WAL"],question:"WAL（Write-Ahead Logging）的含义是数据修改前先写 Redo Log 到磁盘。",options:[
{text:"正确",correct:true,explanation:"WAL 机制要求在数据页写入磁盘之前，其对应的 Redo Log 必须先持久化到磁盘。这保证了即使崩溃也能通过 Redo Log 恢复。"},
{text:"错误",correct:false,explanation:"WAL 的核心含义就是日志先写（Write-Ahead），数据页后写。这是 InnoDB 崩溃恢复的基础。"}
]},
{id:106,stage:3,type:"single",tags:["InnoDB架构","innodb_redo_log_capacity"],question:"MySQL 8.4 中用哪个参数控制 Redo Log 的总容量？",options:[
{text:"innodb_redo_log_capacity",correct:true,explanation:"8.0.30+ 引入 innodb_redo_log_capacity 统一管理 Redo Log 容量，替代了旧的 innodb_log_file_size 和 innodb_log_files_in_group。"},
{text:"innodb_log_file_size",correct:false,explanation:"innodb_log_file_size 在 8.0.30 中废弃，8.4 中已移除。现在用 innodb_redo_log_capacity。"},
{text:"innodb_log_files_in_group",correct:false,explanation:"该参数已在 8.4 中移除，Redo Log 文件数量由 InnoDB 自动管理。"},
{text:"innodb_log_buffer_size",correct:false,explanation:"innodb_log_buffer_size 控制内存中 Log Buffer 的大小，不是 Redo Log 磁盘文件的容量。"}
]},
{id:107,stage:3,type:"single",tags:["InnoDB架构","数据页"],question:"InnoDB 的默认数据页大小是多少？",options:[
{text:"16KB",correct:true,explanation:"InnoDB 默认页大小为 16KB（innodb_page_size=16384）。这是读写磁盘的最小单位，一次 I/O 读写一个页。"},
{text:"4KB",correct:false,explanation:"4KB 是操作系统的常见块大小，InnoDB 默认页大小是 16KB。"},
{text:"8KB",correct:false,explanation:"8KB 是 SQL Server 的默认页大小，InnoDB 默认是 16KB。"},
{text:"64KB",correct:false,explanation:"64KB 是 InnoDB 支持的最大页大小（需建实例时设置），默认是 16KB。"}
]},
{id:108,stage:3,type:"single",tags:["InnoDB架构","Change Buffer"],question:"MySQL 8.4 中 innodb_change_buffering 参数的状态是什么？",options:[
{text:"已移除，Change Buffer 功能固定为 none",correct:true,explanation:"innodb_change_buffering 在 8.0.27 废弃，8.4 中已移除。Change Buffer 不再缓存二级索引的变更，所有修改直接写入。"},
{text:"默认值为 all，缓存所有类型的变更",correct:false,explanation:"这是 MySQL 5.7 的默认值。8.4 中该参数已不存在。"},
{text:"默认值为 inserts，只缓存插入操作",correct:false,explanation:"8.4 中该参数已被移除，不存在默认值的说法。"},
{text:"可以动态调整",correct:false,explanation:"该参数在 8.4 中已被完全移除，无法调整。"}
]},
{id:109,stage:3,type:"single",tags:["InnoDB架构","双写缓冲"],question:"InnoDB 的 Doublewrite Buffer（双写缓冲区）解决什么问题？",options:[
{text:"防止部分页写入（Partial Page Write）导致的数据页损坏",correct:true,explanation:"操作系统写 16KB 的数据页时可能只写了一部分就崩溃。Doublewrite 先将页写入连续的双写区域，再写到实际位置，崩溃后可从双写区域恢复完整页。"},
{text:"加速数据写入性能",correct:false,explanation:"Doublewrite 实际上会增加写入量（写两次），它的目的是数据安全而非性能。"},
{text:"实现事务回滚",correct:false,explanation:"事务回滚通过 Undo Log 实现，Doublewrite 解决的是页写入完整性问题。"},
{text:"缓存频繁修改的数据页",correct:false,explanation:"缓存数据页是 Buffer Pool 的功能，Doublewrite 是写入安全保障机制。"}
]},
{id:110,stage:3,type:"multiple",tags:["InnoDB架构","自适应哈希索引"],question:"关于 InnoDB 的自适应哈希索引（AHI），以下哪些说法正确？（多选）",options:[
{text:"InnoDB 自动为频繁访问的索引页构建哈希索引",correct:true,explanation:"AHI 是 InnoDB 根据访问模式自动创建的内存哈希索引，加速等值查询。"},
{text:"只对等值查询（=、IN）有效，对范围查询无效",correct:true,explanation:"哈希索引只能加速等值查找，范围查询（>、<、BETWEEN）无法利用哈希索引。"},
{text:"可以通过 CREATE INDEX 手动创建",correct:false,explanation:"AHI 完全由 InnoDB 内部自动管理，不能手动创建或指定。"},
{text:"在高并发场景下可能成为瓶颈需要关闭",correct:true,explanation:"AHI 使用分区锁，高并发时可能出现锁争用。可通过 innodb_adaptive_hash_index=OFF 关闭。"}
]},
{id:111,stage:3,type:"single",tags:["事务","ACID"],question:"事务的原子性（Atomicity）由 InnoDB 的哪个机制保证？",options:[
{text:"Undo Log",correct:true,explanation:"原子性要求事务要么全部成功要么全部回滚。Undo Log 记录了修改前的数据，回滚时通过 Undo Log 恢复到事务开始前的状态。"},
{text:"Redo Log",correct:false,explanation:"Redo Log 保证的是持久性（Durability），不是原子性。"},
{text:"Binlog",correct:false,explanation:"Binlog 是 Server 层的日志，用于复制和恢复，不是 InnoDB 原子性的保证机制。"},
{text:"锁机制",correct:false,explanation:"锁机制保证的是隔离性（Isolation），原子性由 Undo Log 保证。"}
]},
{id:112,stage:3,type:"single",tags:["事务","隔离级别"],question:"MySQL InnoDB 默认的事务隔离级别是什么？",options:[
{text:"REPEATABLE READ",correct:true,explanation:"InnoDB 默认使用 REPEATABLE READ（可重复读），通过 MVCC 和 Next-Key Lock 在大多数场景下也防止了幻读。"},
{text:"READ COMMITTED",correct:false,explanation:"READ COMMITTED 是 Oracle 和 PostgreSQL 的默认级别，MySQL 默认是 REPEATABLE READ。"},
{text:"SERIALIZABLE",correct:false,explanation:"SERIALIZABLE 是最高隔离级别但性能最差，MySQL 默认不使用。"},
{text:"READ UNCOMMITTED",correct:false,explanation:"READ UNCOMMITTED 允许脏读，几乎不在生产环境使用，不是默认级别。"}
]},
{id:113,stage:3,type:"single",tags:["MVCC","ReadView"],question:"在 REPEATABLE READ 隔离级别下，ReadView 在什么时候创建？",options:[
{text:"事务中第一次执行快照读（普通 SELECT）时创建，整个事务复用",correct:true,explanation:"RR 级别下 ReadView 只在第一次快照读时创建，后续复用同一个 ReadView，保证整个事务看到的数据一致。"},
{text:"每次 SELECT 都创建新的 ReadView",correct:false,explanation:"每次创建新 ReadView 是 READ COMMITTED 的行为，RR 级别复用第一次的 ReadView。"},
{text:"事务开始时（BEGIN）立即创建",correct:false,explanation:"BEGIN 只是标记事务开始，ReadView 在第一次快照读时才创建，不是 BEGIN 时。"},
{text:"事务提交时创建",correct:false,explanation:"提交时事务已结束，ReadView 在事务执行过程中创建用于读取。"}
]},
{id:114,stage:3,type:"single",tags:["MVCC","ReadView"],question:"ReadView 的 m_ids 列表记录的是什么？",options:[
{text:"创建 ReadView 时所有活跃（未提交）的事务 ID",correct:true,explanation:"m_ids 是活跃事务列表，用于判断某个数据版本的事务是否已提交。如果 trx_id 在 m_ids 中说明该事务还未提交，数据不可见。"},
{text:"所有已提交的事务 ID",correct:false,explanation:"m_ids 记录的是未提交（活跃）的事务 ID，不是已提交的。"},
{text:"当前事务修改过的行 ID",correct:false,explanation:"m_ids 不记录行 ID，而是记录活跃的事务 ID 列表。"},
{text:"所有曾经存在的事务 ID",correct:false,explanation:"m_ids 只记录创建 ReadView 那一刻正在活跃的事务 ID，不是历史所有的。"}
]},
{id:115,stage:3,type:"truefalse",tags:["MVCC","快照读","当前读"],question:"SELECT ... FOR UPDATE 是快照读，使用 MVCC 的 ReadView 判断可见性。",options:[
{text:"正确",correct:false,explanation:"SELECT ... FOR UPDATE 是当前读，会加排他锁读取最新已提交的数据，不使用 MVCC ReadView。"},
{text:"错误",correct:true,explanation:"当前读包括 SELECT ... FOR UPDATE/SHARE、INSERT、UPDATE、DELETE，走锁机制读最新数据。普通 SELECT 才是快照读走 MVCC。"}
]},
{id:116,stage:3,type:"single",tags:["锁","Record Lock"],question:"InnoDB 的记录锁（Record Lock）锁定的是什么？",options:[
{text:"索引记录",correct:true,explanation:"InnoDB 的行锁实际上是锁定索引记录，而非数据行本身。如果表没有索引，InnoDB 会使用隐藏的聚簇索引加锁。"},
{text:"数据页",correct:false,explanation:"锁定数据页是页级锁，InnoDB 使用的是行级锁，锁定的是索引记录。"},
{text:"整张表",correct:false,explanation:"锁定整张表是表级锁，Record Lock 是行级别的，只锁定特定的索引记录。"},
{text:"数据文件",correct:false,explanation:"InnoDB 不在文件级别加锁，Record Lock 锁定的是内存中的索引记录。"}
]},
{id:117,stage:3,type:"single",tags:["锁","Gap Lock"],question:"间隙锁（Gap Lock）的作用是什么？",options:[
{text:"锁定索引记录之间的间隙，防止其他事务在间隙中插入新行",correct:true,explanation:"Gap Lock 锁定两个索引记录之间的空间（不包含记录本身），阻止其他事务的 INSERT 操作，用于防止幻读。"},
{text:"锁定数据页之间的空间",correct:false,explanation:"Gap Lock 锁定的是索引记录之间的逻辑间隙，不是物理页之间的空间。"},
{text:"锁定表与表之间的关联",correct:false,explanation:"Gap Lock 是行级锁机制，与表间关联无关。"},
{text:"防止其他事务读取数据",correct:false,explanation:"Gap Lock 只阻止 INSERT，不阻止读取。其他事务仍然可以读取间隙范围内的数据。"}
]},
{id:118,stage:3,type:"single",tags:["锁","Next-Key Lock"],question:"Next-Key Lock 等于什么？",options:[
{text:"Record Lock + Gap Lock（记录锁 + 间隙锁）",correct:true,explanation:"Next-Key Lock 是 InnoDB 在 RR 级别下的默认行锁类型，同时锁定索引记录和记录前面的间隙。格式为左开右闭区间 (a, b]。"},
{text:"Record Lock + Table Lock",correct:false,explanation:"Next-Key Lock 不涉及表锁，它是 Record Lock 和 Gap Lock 的组合。"},
{text:"Gap Lock + Intent Lock",correct:false,explanation:"意向锁是表级锁标记，不是 Next-Key Lock 的组成部分。"},
{text:"两个 Record Lock",correct:false,explanation:"Next-Key Lock 是 Record Lock + Gap Lock，不是两个 Record Lock。"}
]},
{id:119,stage:3,type:"truefalse",tags:["锁","Gap Lock","RC"],question:"在 READ COMMITTED 隔离级别下，InnoDB 不使用间隙锁（Gap Lock）。",options:[
{text:"正确",correct:true,explanation:"RC 级别下 InnoDB 只使用记录锁（Record Lock），不使用间隙锁。这意味着 RC 级别下无法防止幻读。"},
{text:"错误",correct:false,explanation:"RC 级别确实不使用间隙锁，这是 RC 和 RR 的重要区别之一。"}
]},
{id:120,stage:3,type:"single",tags:["锁","死锁"],question:"InnoDB 检测到死锁时如何处理？",options:[
{text:"自动回滚持有最少锁资源的事务",correct:true,explanation:"InnoDB 的死锁检测器会选择回滚代价最小的事务（通常是持有/修改行数最少的），释放其锁资源让另一个事务继续。"},
{text:"回滚所有参与死锁的事务",correct:false,explanation:"InnoDB 只回滚一个事务（代价最小的），不会回滚所有事务。"},
{text:"等待 innodb_lock_wait_timeout 超时",correct:false,explanation:"死锁检测是立即响应的（毫秒级），不等待超时。锁等待超时是针对普通锁等待，不是死锁。"},
{text:"通知 DBA 手动处理",correct:false,explanation:"InnoDB 自动检测和处理死锁，不需要人工干预。"}
]},
{id:121,stage:3,type:"single",tags:["事务","脏读"],question:"脏读（Dirty Read）是什么？",options:[
{text:"一个事务读到了另一个未提交事务修改的数据",correct:true,explanation:"事务 A 修改了数据但未提交，事务 B 读到了这个未提交的修改。如果事务 A 回滚，事务 B 读到的就是无效数据。"},
{text:"一个事务读到了另一个已提交事务修改的数据",correct:false,explanation:"读到已提交数据是正常行为（READ COMMITTED 级别），不是脏读。脏读是读到未提交的修改。"},
{text:"两个事务同时读取同一行数据",correct:false,explanation:"两个事务同时读取是正常的并发读，不构成脏读。"},
{text:"事务读取了被删除的数据",correct:false,explanation:"读取被删除的数据可能是幻读或 MVCC 快照，不是脏读的定义。"}
]},
{id:122,stage:3,type:"single",tags:["事务","幻读"],question:"以下哪个场景描述的是幻读？",options:[
{text:"事务 A 执行同一个范围查询两次，第二次多出了事务 B 新插入的行",correct:true,explanation:"幻读是同一事务中两次相同的范围查询返回了不同数量的行（多出或少了），因为其他事务插入/删除了满足条件的行。"},
{text:"事务 A 读到了事务 B 未提交的修改",correct:false,explanation:"这是脏读，不是幻读。"},
{text:"事务 A 两次读同一行，值发生了变化",correct:false,explanation:"这是不可重复读，不是幻读。幻读强调的是行数变化，不可重复读强调的是同一行值变化。"},
{text:"事务 A 的查询被事务 B 阻塞",correct:false,explanation:"查询被阻塞是锁等待问题，不是幻读。"}
]},
{id:123,stage:3,type:"single",tags:["事务","innodb_flush_log_at_trx_commit"],question:"innodb_flush_log_at_trx_commit = 2 时，事务提交的写入行为是什么？",options:[
{text:"写入操作系统缓存，每秒刷盘一次",correct:true,explanation:"值为 2 时，提交时将 Redo Log 写入 OS 文件系统缓存（不 fsync），由 OS 约每秒刷一次盘。性能好但宕机可能丢 1 秒数据。"},
{text:"每次提交都 fsync 到磁盘",correct:false,explanation:"每次 fsync 是值为 1 时的行为，最安全但性能最差。值为 2 只写到 OS 缓存。"},
{text:"写入 Log Buffer，每秒刷盘一次",correct:false,explanation:"只写 Log Buffer 每秒刷盘是值为 0 的行为。值为 2 会写到 OS 缓存（比 Log Buffer 多一步）。"},
{text:"不写任何日志",correct:false,explanation:"值为 0、1、2 都会写日志，区别在于写到哪里以及刷盘时机。"}
]},
{id:124,stage:3,type:"single",tags:["锁","意向锁"],question:"意向锁（Intent Lock）的作用是什么？",options:[
{text:"快速判断表中是否有行级锁，避免逐行检查",correct:true,explanation:"当事务加行锁时会先在表级别加意向锁。其他事务要加表锁时只需检查意向锁即可判断是否有行锁冲突，不需要遍历每一行。"},
{text:"锁定事务准备修改的行",correct:false,explanation:"锁定行是 Record Lock 的功能，意向锁是表级标记，指示表中有行级锁存在。"},
{text:"防止并发 DDL 操作",correct:false,explanation:"防止并发 DDL 是元数据锁（MDL）的功能，意向锁用于行锁和表锁之间的协调。"},
{text:"实现事务排队",correct:false,explanation:"意向锁不是排队机制，它是行锁和表锁之间的快速冲突检测标记。"}
]},
{id:125,stage:3,type:"multiple",tags:["锁","MDL"],question:"以下关于元数据锁（Metadata Lock, MDL）的说法，哪些正确？（多选）",options:[
{text:"所有 DML 语句执行前会自动获取表的 MDL 读锁",correct:true,explanation:"SELECT/INSERT/UPDATE/DELETE 执行时自动获取 MDL 读锁，保证执行期间表结构不被修改。"},
{text:"DDL 语句执行时需要获取表的 MDL 写锁",correct:true,explanation:"ALTER TABLE 等 DDL 需要 MDL 写锁，与所有 DML 的 MDL 读锁互斥，这就是 DDL 可能阻塞 DML 的原因。"},
{text:"MDL 锁可以手动加或释放",correct:false,explanation:"MDL 是 MySQL 自动管理的，用户不能手动 LOCK/UNLOCK MDL。"},
{text:"MDL 锁在事务结束时才释放",correct:true,explanation:"MDL 锁的生命周期跟随事务。即使 SQL 执行完成，如果事务未提交，MDL 读锁仍然持有。长事务会阻塞 DDL。"}
]},
{id:126,stage:3,type:"single",tags:["InnoDB架构","聚簇索引"],question:"InnoDB 表如果没有定义主键，聚簇索引如何确定？",options:[
{text:"选择第一个非 NULL 的唯一索引；都没有则自动生成隐藏的 ROW_ID",correct:true,explanation:"InnoDB 按优先级选择：显式主键 > 第一个非 NULL 唯一索引 > 自动生成 6 字节的 ROW_ID 作为隐藏聚簇索引。"},
{text:"不创建聚簇索引",correct:false,explanation:"InnoDB 表必须有聚簇索引，如果没有合适的列，会自动生成隐藏的 ROW_ID。"},
{text:"使用第一个创建的普通索引",correct:false,explanation:"普通索引不能作为聚簇索引，必须是主键或非 NULL 唯一索引。"},
{text:"随机选择一个列",correct:false,explanation:"聚簇索引的选择有明确的优先级规则，不是随机的。"}
]},
{id:127,stage:3,type:"single",tags:["事务","隔离级别"],question:"哪个隔离级别允许脏读？",options:[
{text:"READ UNCOMMITTED",correct:true,explanation:"READ UNCOMMITTED 是最低的隔离级别，允许读取其他事务未提交的修改（脏读）。生产环境几乎不使用。"},
{text:"READ COMMITTED",correct:false,explanation:"READ COMMITTED 不允许脏读，只能读到其他事务已提交的数据。"},
{text:"REPEATABLE READ",correct:false,explanation:"RR 级别不允许脏读，也不允许不可重复读。"},
{text:"SERIALIZABLE",correct:false,explanation:"SERIALIZABLE 是最严格的级别，不允许任何并发异常。"}
]},
{id:128,stage:3,type:"single",tags:["锁","innodb_lock_wait_timeout"],question:"innodb_lock_wait_timeout 的默认值是多少秒？",options:[
{text:"50 秒",correct:true,explanation:"默认值 50 秒。事务等待行锁超过此时间会报错 1205（Lock wait timeout exceeded），默认只回滚当前语句不回滚事务。"},
{text:"30 秒",correct:false,explanation:"默认值是 50 秒，不是 30 秒。"},
{text:"120 秒",correct:false,explanation:"默认值是 50 秒，不是 120 秒。"},
{text:"无限制",correct:false,explanation:"有默认的 50 秒限制，超时会报错。不是无限等待。"}
]},
{id:129,stage:3,type:"truefalse",tags:["锁","死锁","1213"],question:"InnoDB 检测到死锁后，被回滚的事务收到的错误码是 1205（Lock wait timeout）。",options:[
{text:"正确",correct:false,explanation:"死锁回滚的错误码是 1213（Deadlock found），不是 1205。1205 是普通锁等待超时，1213 是死锁。"},
{text:"错误",correct:true,explanation:"死锁返回错误码 1213（ER_LOCK_DEADLOCK），1205（ER_LOCK_WAIT_TIMEOUT）是普通的锁等待超时。两者处理方式不同。"}
]},
{id:130,stage:3,type:"single",tags:["MVCC","版本链"],question:"InnoDB 行数据的隐藏列 DB_ROLL_PTR 指向什么？",options:[
{text:"Undo Log 中该行的上一个版本",correct:true,explanation:"DB_ROLL_PTR 是回滚指针，指向 Undo Log 中该行的旧版本数据。多个版本通过此指针形成版本链，MVCC 沿链查找可见版本。"},
{text:"Redo Log 中的对应记录",correct:false,explanation:"DB_ROLL_PTR 指向 Undo Log 不是 Redo Log。Redo Log 用于崩溃恢复，Undo Log 用于回滚和 MVCC。"},
{text:"下一行数据",correct:false,explanation:"DB_ROLL_PTR 指向该行在 Undo Log 中的旧版本，不是下一行。"},
{text:"聚簇索引的根节点",correct:false,explanation:"DB_ROLL_PTR 与索引结构无关，它是版本链的指针。"}
]},
{id:131,stage:3,type:"single",tags:["InnoDB架构","Buffer Pool","命中率"],question:"如何计算 InnoDB Buffer Pool 的命中率？",options:[
{text:"(1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests) * 100",correct:true,explanation:"read_requests 是总请求数，reads 是需要从磁盘读的次数。命中率 = (总请求-磁盘读) / 总请求。低于 99% 说明 Buffer Pool 偏小。"},
{text:"Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests * 100",correct:false,explanation:"这个公式计算的是「未命中率」，命中率应该用 1 减去这个值。"},
{text:"Innodb_buffer_pool_size / total_memory * 100",correct:false,explanation:"这是 Buffer Pool 占系统内存的比例，不是命中率。"},
{text:"通过 EXPLAIN 查看",correct:false,explanation:"EXPLAIN 查看的是查询执行计划，不是 Buffer Pool 命中率。"}
]},
{id:132,stage:3,type:"single",tags:["事务","两阶段提交"],question:"InnoDB 事务的两阶段提交（2PC）涉及哪两个日志？",options:[
{text:"Redo Log 和 Binlog",correct:true,explanation:"2PC 保证 Redo Log 和 Binlog 的一致性：Prepare 阶段写 Redo Log 标记为 prepared，Commit 阶段写 Binlog 并将 Redo Log 标记为 committed。"},
{text:"Redo Log 和 Undo Log",correct:false,explanation:"2PC 是 Redo Log 和 Binlog 之间的协调机制，不涉及 Undo Log。"},
{text:"Binlog 和 Relay Log",correct:false,explanation:"Relay Log 是从库上的日志，2PC 发生在主库的 Redo Log 和 Binlog 之间。"},
{text:"Undo Log 和 Binlog",correct:false,explanation:"2PC 涉及的是 Redo Log（InnoDB 引擎层）和 Binlog（Server 层）。"}
]},
{id:133,stage:3,type:"multiple",tags:["锁","INSERT"],question:"以下关于 INSERT 操作加锁的说法，哪些正确？（多选）",options:[
{text:"INSERT 成功后对新插入的行持有排他记录锁",correct:true,explanation:"INSERT 完成后在新行上加排他的 Record Lock，防止其他事务在提交前修改该行。"},
{text:"INSERT 等待间隙锁时使用插入意向锁",correct:true,explanation:"当 INSERT 的目标间隙被其他事务的 Gap Lock 锁定时，INSERT 会申请插入意向锁等待。多个不同位置的 INSERT 意向锁互不冲突。"},
{text:"INSERT 会对整张表加表锁",correct:false,explanation:"InnoDB 的 INSERT 使用行级锁，不会加表锁。只有在特殊情况（如无索引的批量操作）才可能退化。"},
{text:"INSERT 不需要任何锁",correct:false,explanation:"INSERT 需要锁来保证并发安全：排他记录锁保护新行，可能还需要插入意向锁。"}
]},
{id:134,stage:3,type:"single",tags:["事务","SAVEPOINT"],question:"SAVEPOINT 的作用是什么？",options:[
{text:"在事务中创建保存点，可以回滚到该点而不回滚整个事务",correct:true,explanation:"SAVEPOINT name 创建保存点，ROLLBACK TO name 回滚到该点，之后的操作被撤销但之前的保留。整个事务仍然有效。"},
{text:"自动保存事务进度",correct:false,explanation:"SAVEPOINT 需要手动创建，不是自动保存。"},
{text:"将当前事务的修改持久化到磁盘",correct:false,explanation:"持久化到磁盘是 COMMIT 的功能，SAVEPOINT 只是事务内的回滚点标记。"},
{text:"创建事务备份",correct:false,explanation:"SAVEPOINT 不是备份机制，它是事务内部的部分回滚功能。"}
]},
{id:135,stage:3,type:"single",tags:["InnoDB架构","表空间"],question:"InnoDB 的系统表空间（ibdata1）存储哪些内容？",options:[
{text:"数据字典、Undo Log（默认）、Change Buffer、Doublewrite Buffer",correct:true,explanation:"ibdata1 是系统表空间，存储数据字典、Undo 表空间（默认前两个）、Change Buffer 位图、Doublewrite Buffer 等系统数据。"},
{text:"所有用户表的数据",correct:false,explanation:"innodb_file_per_table=ON 时用户表数据在独立的 .ibd 文件中，不在 ibdata1。"},
{text:"Redo Log 文件",correct:false,explanation:"Redo Log 有独立的文件（ib_logfile0/1 或 #innodb_redo 目录），不在 ibdata1 中。"},
{text:"Binlog 文件",correct:false,explanation:"Binlog 是 Server 层的文件，与 InnoDB 的系统表空间无关。"}
]},
{id:136,stage:3,type:"truefalse",tags:["锁","autocommit"],question:"在 autocommit=ON 的情况下，单条 UPDATE 语句执行完成后其行锁会立即释放。",options:[
{text:"正确",correct:true,explanation:"autocommit=ON 时每条 DML 自动构成独立事务，执行完成后自动提交，锁随事务提交而释放。"},
{text:"错误",correct:false,explanation:"autocommit=ON 时单条语句自动提交，事务结束锁就释放。只有在显式事务（BEGIN）中锁才会持有到 COMMIT/ROLLBACK。"}
]},
{id:137,stage:3,type:"single",tags:["InnoDB架构","innodb_buffer_pool_size"],question:"生产环境中 innodb_buffer_pool_size 通常建议设置为物理内存的多少？",options:[
{text:"50%~70%（专用服务器可达 80%）",correct:true,explanation:"Buffer Pool 是 InnoDB 性能的关键。专用数据库服务器建议 60%~80%，共享服务器建议 50%~60%，要为 OS 和其他进程预留内存。"},
{text:"10%~20%",correct:false,explanation:"10%~20% 太小，大量数据页需要从磁盘读取，I/O 会成为严重瓶颈。"},
{text:"90%~100%",correct:false,explanation:"设得太高会导致操作系统和其他进程内存不足，可能触发 OOM Killer 杀掉 MySQL 进程。"},
{text:"固定 128MB 不需要调整",correct:false,explanation:"128MB 是默认值，只适合开发测试环境。生产环境必须根据物理内存调大。"}
]},
{id:138,stage:3,type:"single",tags:["锁","SELECT FOR UPDATE"],question:"SELECT ... FOR UPDATE 和 SELECT ... FOR SHARE 的区别是什么？",options:[
{text:"FOR UPDATE 加排他锁，FOR SHARE 加共享锁",correct:true,explanation:"FOR UPDATE 对读取的行加 X 锁（排他），阻塞其他事务的读写。FOR SHARE 加 S 锁（共享），允许其他事务读但阻塞写。"},
{text:"FOR UPDATE 锁表，FOR SHARE 锁行",correct:false,explanation:"两者都是行级锁，区别在于锁的类型（排他 vs 共享），不是锁的粒度。"},
{text:"FOR UPDATE 可以修改数据，FOR SHARE 不可以",correct:false,explanation:"两者都是 SELECT 语句，本身不修改数据。区别在于加的锁类型不同。"},
{text:"两者功能相同",correct:false,explanation:"X 锁和 S 锁的兼容性不同：多个 S 锁可以共存，X 锁与任何锁互斥。"}
]},
{id:139,stage:3,type:"single",tags:["InnoDB架构","innodb_flush_method"],question:"在 Linux 生产环境中，innodb_flush_method 建议设置为什么？",options:[
{text:"O_DIRECT",correct:true,explanation:"O_DIRECT 绕过操作系统的文件系统缓存，避免双重缓存（Buffer Pool + OS Cache），减少内存浪费和刷盘开销。"},
{text:"fsync（默认值）",correct:false,explanation:"fsync 是默认值，会经过 OS 缓存。生产环境建议 O_DIRECT 避免双重缓存。"},
{text:"O_DSYNC",correct:false,explanation:"O_DSYNC 用于 Redo Log 的写入方式，对数据文件通常用 O_DIRECT。"},
{text:"async_unbuffered",correct:false,explanation:"async_unbuffered 是 Windows 上的选项，Linux 推荐 O_DIRECT。"}
]},
{id:140,stage:3,type:"single",tags:["事务","XA事务"],question:"MySQL 的 XA 事务用于什么场景？",options:[
{text:"分布式事务，协调多个数据库实例之间的事务一致性",correct:true,explanation:"XA 事务是两阶段提交协议（2PC）的实现，用于跨多个数据库/资源管理器的分布式事务，保证全局的原子性。"},
{text:"长事务优化",correct:false,explanation:"XA 事务不是用来优化长事务的，它解决的是跨资源的分布式一致性问题。"},
{text:"替代普通事务提高性能",correct:false,explanation:"XA 事务比普通事务更复杂、开销更大，不是性能优化手段。"},
{text:"自动重试失败的事务",correct:false,explanation:"XA 事务不提供自动重试功能，它是分布式事务协调协议。"}
]},
{id:141,stage:3,type:"single",tags:["InnoDB架构","Checkpoint"],question:"InnoDB Checkpoint 的作用是什么？",options:[
{text:"将 Buffer Pool 中的脏页刷新到磁盘，推进 Redo Log 的可回收位置",correct:true,explanation:"Checkpoint 将内存中已修改但未写盘的脏页刷到磁盘。刷完后对应的 Redo Log 空间可以被重用，防止 Redo Log 写满。"},
{text:"创建数据备份",correct:false,explanation:"Checkpoint 不是备份机制，是内存脏页持久化到磁盘的过程。"},
{text:"回滚未提交的事务",correct:false,explanation:"回滚用 Undo Log，Checkpoint 是脏页刷盘操作。"},
{text:"锁定数据防止修改",correct:false,explanation:"Checkpoint 刷脏页时不需要锁定数据（使用 fuzzy checkpoint 机制）。"}
]},
{id:142,stage:3,type:"truefalse",tags:["锁","死锁","innodb_deadlock_detect"],question:"可以通过设置 innodb_deadlock_detect=OFF 关闭死锁检测以提高高并发场景下的性能。",options:[
{text:"正确",correct:true,explanation:"死锁检测需要遍历等待图，高并发时开销大。关闭后靠 innodb_lock_wait_timeout 超时发现死锁，适合热点行更新场景。但需要应用层做好重试。"},
{text:"错误",correct:false,explanation:"确实可以关闭。关闭后死锁不再被立即检测，而是通过锁等待超时来处理，在某些场景下能提升吞吐。"}
]},
{id:143,stage:3,type:"single",tags:["MVCC","DB_TRX_ID"],question:"InnoDB 行数据的隐藏列 DB_TRX_ID 记录的是什么？",options:[
{text:"最后修改该行的事务 ID",correct:true,explanation:"每次 INSERT/UPDATE/DELETE 操作都会将执行该操作的事务 ID 写入 DB_TRX_ID，MVCC 用它判断该版本对当前事务是否可见。"},
{text:"创建该行的事务 ID",correct:false,explanation:"DB_TRX_ID 记录的是最后一次修改的事务 ID，不是创建时的。每次 UPDATE 都会更新此值。"},
{text:"当前正在读取该行的事务 ID",correct:false,explanation:"DB_TRX_ID 记录的是写入者，不是读取者。读操作不会修改 DB_TRX_ID。"},
{text:"该行所在数据页的 ID",correct:false,explanation:"DB_TRX_ID 是事务 ID，与数据页 ID 无关。"}
]},
{id:144,stage:3,type:"single",tags:["锁","插入意向锁"],question:"插入意向锁（Insert Intention Lock）有什么特点？",options:[
{text:"多个事务在同一间隙的不同位置插入时互不阻塞",correct:true,explanation:"插入意向锁是特殊的间隙锁，表示将在间隙中某个位置插入。不同位置的插入意向锁互相兼容，提高并发插入性能。"},
{text:"插入操作不需要任何锁",correct:false,explanation:"INSERT 在等待间隙锁释放时需要插入意向锁，成功后还有排他记录锁。"},
{text:"会阻塞同一间隙的所有操作",correct:false,explanation:"插入意向锁之间互相兼容。它被普通间隙锁阻塞，但不阻塞其他插入意向锁。"},
{text:"是表级锁",correct:false,explanation:"插入意向锁是行级别的间隙锁，不是表级锁。"}
]},
{id:145,stage:3,type:"single",tags:["InnoDB架构","innodb_buffer_pool_instances"],question:"innodb_buffer_pool_instances 参数的作用是什么？",options:[
{text:"将 Buffer Pool 分成多个实例减少并发访问时的锁争用",correct:true,explanation:"多个实例各自有独立的 LRU 链表和互斥锁，高并发时减少单一锁的竞争。建议 Buffer Pool >= 1GB 时设置，每个实例不小于 1GB。"},
{text:"创建多个 MySQL 服务实例",correct:false,explanation:"这不是多实例部署，而是将一个 Buffer Pool 分成多个内部实例减少锁竞争。"},
{text:"设置备份 Buffer Pool 的副本数",correct:false,explanation:"Buffer Pool instances 不是副本，而是将内存池分区以减少竞争。"},
{text:"控制最大连接数",correct:false,explanation:"最大连接数由 max_connections 控制，与 Buffer Pool 实例数无关。"}
]},
{id:146,stage:3,type:"multiple",tags:["事务","隔离级别"],question:"以下哪些是 REPEATABLE READ 级别下 InnoDB 防止幻读的机制？（多选）",options:[
{text:"快照读通过 MVCC ReadView 避免看到新插入的行",correct:true,explanation:"RR 级别下 ReadView 在第一次快照读时创建并复用，后续快照读看不到其他事务新插入的行。"},
{text:"当前读通过 Next-Key Lock 锁定间隙防止插入",correct:true,explanation:"SELECT FOR UPDATE 等当前读使用 Next-Key Lock 锁住记录和间隙，阻止其他事务在范围内插入新行。"},
{text:"使用表锁锁定整张表",correct:false,explanation:"InnoDB 使用行级锁和间隙锁，不需要表锁来防止幻读。"},
{text:"通过 Binlog 记录防止幻读",correct:false,explanation:"Binlog 是复制和恢复用的日志，与防止幻读无关。"}
]},
{id:147,stage:3,type:"single",tags:["InnoDB架构","sync_binlog"],question:"sync_binlog = 1 的含义是什么？",options:[
{text:"每个事务提交时将 Binlog 刷盘一次（fsync）",correct:true,explanation:"sync_binlog=1 保证每次事务提交都将 Binlog 从 OS 缓存写入磁盘，配合 innodb_flush_log_at_trx_commit=1 构成\"双一配置\"，最大程度保证数据不丢失。"},
{text:"每秒刷盘一次",correct:false,explanation:"每秒刷盘是 sync_binlog=0 时由 OS 控制的行为。sync_binlog=1 是每次提交都刷盘。"},
{text:"Binlog 只写内存不刷盘",correct:false,explanation:"只写内存是 sync_binlog=0 的行为，1 表示每次提交都强制刷盘。"},
{text:"只在关闭 MySQL 时刷盘",correct:false,explanation:"sync_binlog=1 是每次事务提交都刷盘，不是只在关闭时。"}
]},
{id:148,stage:3,type:"single",tags:["锁","AUTO-INC Lock"],question:"MySQL 8.0+ 默认的 innodb_autoinc_lock_mode 值是多少？",options:[
{text:"2（交叉模式）",correct:true,explanation:"值 2 允许并发插入时交叉分配自增值，不使用表级 AUTO-INC 锁。性能最好但批量插入的自增值可能不连续。"},
{text:"0（传统模式）",correct:false,explanation:"传统模式使用表级锁，性能最差。8.0 默认已改为 2。"},
{text:"1（连续模式）",correct:false,explanation:"连续模式是 5.7 的默认值，8.0 改为了 2。"},
{text:"3",correct:false,explanation:"innodb_autoinc_lock_mode 只有 0、1、2 三个有效值。"}
]},
{id:149,stage:3,type:"truefalse",tags:["事务","1205","回滚"],question:"错误码 1205（Lock wait timeout exceeded）发生时，InnoDB 默认回滚整个事务。",options:[
{text:"正确",correct:false,explanation:"1205 默认只回滚当前超时的那条语句，不回滚整个事务。事务中之前的操作仍然有效。建议应用收到 1205 后显式 ROLLBACK 再重试。"},
{text:"错误",correct:true,explanation:"1205 只回滚当前语句。1213（死锁）才回滚整个事务。这个区别很重要，1205 后不 ROLLBACK 可能导致数据不一致。"}
]},
{id:150,stage:3,type:"single",tags:["InnoDB架构","innodb_io_capacity"],question:"innodb_io_capacity 参数代表什么？",options:[
{text:"InnoDB 后台任务（刷脏页等）每秒可用的 I/O 操作数（IOPS）",correct:true,explanation:"此参数告诉 InnoDB 磁盘的 I/O 能力，影响脏页刷新速度。HDD 建议 200-400，SSD 建议 2000-10000。"},
{text:"Buffer Pool 的最大 I/O 吞吐量",correct:false,explanation:"innodb_io_capacity 控制的是后台刷脏页的 IOPS，不是 Buffer Pool 的吞吐量。"},
{text:"最大并发 I/O 线程数",correct:false,explanation:"并发 I/O 线程数由 innodb_read_io_threads 和 innodb_write_io_threads 控制。"},
{text:"每个查询最大可用的 I/O 次数",correct:false,explanation:"innodb_io_capacity 限制的是后台任务的 I/O，不是单个查询的 I/O。"}
]}
];
