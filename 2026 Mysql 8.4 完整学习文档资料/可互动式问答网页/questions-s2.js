var stage2Questions = [
{id:51,stage:2,type:"single",tags:["视图","VIEW"],question:"在 MySQL 中，视图（VIEW）本质上是什么？",options:[
{text:"一条存储的 SELECT 查询语句",correct:true,explanation:"视图不存储数据，它是一条命名的 SELECT 语句。每次查询视图时实际上是执行其定义的 SELECT。"},
{text:"一张物理表的副本",correct:false,explanation:"视图不复制数据，它只是查询的别名。修改基表数据后视图也会反映变化。"},
{text:"一种索引类型",correct:false,explanation:"视图和索引是完全不同的概念，视图是虚拟表，索引是加速查询的数据结构。"},
{text:"临时表的别名",correct:false,explanation:"视图是持久化的数据库对象（定义存储在数据字典中），不是临时表。"}
]},
{id:52,stage:2,type:"truefalse",tags:["视图","可更新视图"],question:"所有视图都可以执行 INSERT、UPDATE、DELETE 操作。",options:[
{text:"正确",correct:false,explanation:"只有满足特定条件的简单视图才可更新。包含 GROUP BY、DISTINCT、聚合函数、UNION、子查询等的视图不可更新。"},
{text:"错误",correct:true,explanation:"可更新视图要求：不含聚合函数、DISTINCT、GROUP BY、HAVING、UNION，且 FROM 中只有一个表等条件。"}
]},
{id:53,stage:2,type:"single",tags:["存储过程","PROCEDURE"],question:"存储过程和函数的主要区别是什么？",options:[
{text:"函数必须有返回值，存储过程不需要",correct:true,explanation:"函数使用 RETURNS 声明返回类型并用 RETURN 返回值，可在 SQL 中调用。存储过程通过 OUT 参数输出，用 CALL 调用。"},
{text:"存储过程性能更好",correct:false,explanation:"两者的性能差异不在于类型，而在于具体的 SQL 逻辑。区别在于调用方式和返回值。"},
{text:"函数不能修改数据",correct:false,explanation:"虽然确定性函数不建议修改数据，但 MySQL 并不严格禁止函数中执行 DML。区别主要是返回值机制。"},
{text:"存储过程不能接受参数",correct:false,explanation:"存储过程可以接受 IN、OUT、INOUT 三种参数，参数功能比函数更灵活。"}
]},
{id:54,stage:2,type:"single",tags:["存储过程","参数类型"],question:"存储过程中 INOUT 参数的含义是什么？",options:[
{text:"既作为输入参数又作为输出参数",correct:true,explanation:"INOUT 参数在调用时传入值，过程执行中可以修改，修改后的值会返回给调用者。同时具备 IN 和 OUT 的功能。"},
{text:"只能输入不能输出",correct:false,explanation:"只能输入是 IN 参数的特点，INOUT 是双向的。"},
{text:"只能输出不能输入",correct:false,explanation:"只能输出是 OUT 参数的特点，INOUT 既可输入也可输出。"},
{text:"参数值不可修改",correct:false,explanation:"INOUT 参数的值在过程内部可以修改，且修改后的值会传回调用者。"}
]},
{id:55,stage:2,type:"single",tags:["触发器","TRIGGER"],question:"以下哪个不是 MySQL 触发器支持的触发时机？",options:[
{text:"INSTEAD OF",correct:true,explanation:"MySQL 不支持 INSTEAD OF 触发器（SQL Server 和 PostgreSQL 支持）。MySQL 只支持 BEFORE 和 AFTER。"},
{text:"BEFORE INSERT",correct:false,explanation:"BEFORE INSERT 是 MySQL 支持的触发时机，在插入操作之前执行。"},
{text:"AFTER UPDATE",correct:false,explanation:"AFTER UPDATE 是 MySQL 支持的触发时机，在更新操作之后执行。"},
{text:"BEFORE DELETE",correct:false,explanation:"BEFORE DELETE 是 MySQL 支持的触发时机，在删除操作之前执行。"}
]},
{id:56,stage:2,type:"truefalse",tags:["触发器","NEW","OLD"],question:"在 BEFORE INSERT 触发器中，可以使用 OLD 关键字引用旧行数据。",options:[
{text:"正确",correct:false,explanation:"INSERT 操作没有旧行，所以 INSERT 触发器中只有 NEW（新插入的行），没有 OLD。"},
{text:"错误",correct:true,explanation:"INSERT 是新增行操作，不存在旧行。OLD 只在 UPDATE 和 DELETE 触发器中可用。NEW 只在 INSERT 和 UPDATE 中可用。"}
]},
{id:57,stage:2,type:"single",tags:["事件","EVENT"],question:"MySQL 的 EVENT（事件调度器）用于什么场景？",options:[
{text:"定时自动执行 SQL 任务",correct:true,explanation:"EVENT 是 MySQL 内置的定时任务调度器，可以按指定时间或间隔自动执行 SQL，如定期清理过期数据。"},
{text:"监听表数据变化",correct:false,explanation:"监听数据变化是触发器的功能，EVENT 是按时间调度执行。"},
{text:"异步执行查询",correct:false,explanation:"EVENT 是定时执行，不是异步执行。MySQL 本身不提供异步查询机制。"},
{text:"发送邮件通知",correct:false,explanation:"MySQL EVENT 只能执行 SQL 语句，不能直接发送邮件。"}
]},
{id:58,stage:2,type:"single",tags:["事件","event_scheduler"],question:"如何启用 MySQL 的事件调度器？",options:[
{text:"SET GLOBAL event_scheduler = ON",correct:true,explanation:"event_scheduler 默认为 OFF，需要手动开启。可以动态设置 SET GLOBAL event_scheduler = ON 或在 my.cnf 中配置。"},
{text:"ENABLE EVENTS",correct:false,explanation:"MySQL 没有 ENABLE EVENTS 命令，启用事件调度器用 SET GLOBAL event_scheduler = ON。"},
{text:"事件调度器默认就是开启的",correct:false,explanation:"event_scheduler 默认为 OFF，需要手动开启。"},
{text:"CREATE SCHEDULER",correct:false,explanation:"MySQL 没有 CREATE SCHEDULER 命令，事件调度器通过系统变量控制开关。"}
]},
{id:59,stage:2,type:"single",tags:["外键","FOREIGN KEY"],question:"外键约束中 ON DELETE CASCADE 的含义是什么？",options:[
{text:"删除父表记录时自动删除子表中关联的记录",correct:true,explanation:"CASCADE 表示级联操作，父表删除时子表中引用该父键的行也会被自动删除。"},
{text:"删除子表记录时自动删除父表记录",correct:false,explanation:"外键约束是子表引用父表，CASCADE 是父表操作级联到子表，不是反过来。"},
{text:"禁止删除有关联记录的父表行",correct:false,explanation:"禁止删除是 RESTRICT 或 NO ACTION 的行为，CASCADE 是自动级联删除。"},
{text:"将子表的外键列设为 NULL",correct:false,explanation:"将外键列设为 NULL 是 SET NULL 的行为，CASCADE 是直接删除子表记录。"}
]},
{id:60,stage:2,type:"multiple",tags:["约束","CHECK"],question:"以下关于 MySQL 8.0+ CHECK 约束的说法，哪些是正确的？（多选）",options:[
{text:"CHECK 约束在 MySQL 8.0.16+ 中才真正生效",correct:true,explanation:"MySQL 5.7 及之前虽然能写 CHECK 语法但会被忽略，8.0.16 开始才真正执行检查。"},
{text:"CHECK 约束可以引用其他表的列",correct:false,explanation:"CHECK 约束只能引用当前表的列，不能引用其他表。跨表约束需要用触发器实现。"},
{text:"违反 CHECK 约束时 INSERT/UPDATE 会报错",correct:true,explanation:"当插入或更新的数据违反 CHECK 条件时，MySQL 会拒绝操作并返回错误。"},
{text:"CHECK 约束可以使用子查询",correct:false,explanation:"CHECK 约束表达式不能包含子查询、存储函数、变量等，只能是简单的列表达式。"}
]},
{id:61,stage:2,type:"single",tags:["索引","CREATE INDEX"],question:"以下哪种方式不能在 MySQL 中创建索引？",options:[
{text:"INSERT INDEX",correct:true,explanation:"MySQL 没有 INSERT INDEX 语法。创建索引用 CREATE INDEX 或 ALTER TABLE ... ADD INDEX。"},
{text:"CREATE INDEX idx ON t(col)",correct:false,explanation:"CREATE INDEX 是标准的索引创建语法，可以正常使用。"},
{text:"ALTER TABLE t ADD INDEX idx(col)",correct:false,explanation:"ALTER TABLE ... ADD INDEX 也是创建索引的有效方式。"},
{text:"CREATE TABLE 时在列定义中加 INDEX",correct:false,explanation:"建表时可以在 CREATE TABLE 语句中直接定义索引。"}
]},
{id:62,stage:2,type:"single",tags:["临时表","TEMPORARY"],question:"MySQL 临时表（TEMPORARY TABLE）的特点是什么？",options:[
{text:"仅当前会话可见，会话结束后自动删除",correct:true,explanation:"临时表只在创建它的会话中可见，其他会话无法看到。会话断开后临时表自动删除。"},
{text:"所有会话共享，服务器重启后删除",correct:false,explanation:"临时表是会话级别的，不是全局共享的。每个会话的临时表互不干扰。"},
{text:"数据存储在内存中，比普通表快",correct:false,explanation:"临时表默认使用 InnoDB 引擎存储在磁盘上（8.0+）。MEMORY 引擎的临时表才在内存中。"},
{text:"不能有索引",correct:false,explanation:"临时表可以创建索引，和普通表一样支持各种索引类型。"}
]},
{id:63,stage:2,type:"single",tags:["生成列","GENERATED COLUMN"],question:"MySQL 的生成列（Generated Column）VIRTUAL 和 STORED 的区别是什么？",options:[
{text:"VIRTUAL 不占磁盘空间实时计算，STORED 物理存储在磁盘上",correct:true,explanation:"VIRTUAL 列不占存储空间，查询时实时计算。STORED 列将计算结果写入磁盘，占用空间但读取更快。"},
{text:"VIRTUAL 存在内存中，STORED 存在磁盘上",correct:false,explanation:"VIRTUAL 不存储在任何地方（每次查询时计算），不是存在内存中。"},
{text:"两者功能完全相同",correct:false,explanation:"VIRTUAL 不占空间但每次查询需计算，STORED 占空间但读取时不需要计算。性能和存储有差异。"},
{text:"VIRTUAL 不能建索引，STORED 可以",correct:false,explanation:"MySQL 8.0+ 中 VIRTUAL 列也可以建二级索引（InnoDB），不是只有 STORED 可以。"}
]},
{id:64,stage:2,type:"single",tags:["分区表","PARTITION"],question:"MySQL 支持的分区类型不包括以下哪个？",options:[
{text:"MERGE 分区",correct:true,explanation:"MySQL 支持 RANGE、LIST、HASH、KEY 分区，不支持 MERGE 分区。MERGE 是一种存储引擎，不是分区类型。"},
{text:"RANGE 分区",correct:false,explanation:"RANGE 分区按值范围划分，是 MySQL 支持的分区类型。"},
{text:"HASH 分区",correct:false,explanation:"HASH 分区按哈希值分配数据，是 MySQL 支持的分区类型。"},
{text:"LIST 分区",correct:false,explanation:"LIST 分区按离散值列表划分，是 MySQL 支持的分区类型。"}
]},
{id:65,stage:2,type:"truefalse",tags:["用户管理","CREATE USER"],question:"MySQL 8.4 中创建用户和授权必须分开执行，不能在 GRANT 中隐式创建用户。",options:[
{text:"正确",correct:true,explanation:"从 MySQL 8.0 开始，GRANT 不再隐式创建用户。必须先 CREATE USER 再 GRANT 授权，职责分离更安全。"},
{text:"错误",correct:false,explanation:"MySQL 5.7 中 GRANT 可以隐式创建用户，但 8.0+ 已取消此行为，必须先 CREATE USER。"}
]},
{id:66,stage:2,type:"single",tags:["权限","GRANT"],question:"GRANT SELECT, INSERT ON mydb.* TO 'user'@'host' 中的 mydb.* 表示什么？",options:[
{text:"mydb 数据库下的所有表",correct:true,explanation:"db.* 表示指定数据库下的所有表。这是数据库级别的授权，user 对 mydb 中所有表有 SELECT 和 INSERT 权限。"},
{text:"所有数据库的 mydb 表",correct:false,explanation:"mydb.* 中 mydb 是数据库名，* 是所有表。不是所有数据库的某个表。"},
{text:"mydb 数据库本身",correct:false,explanation:"mydb.* 是数据库中所有表的权限，不是对数据库对象本身的权限（如 CREATE/DROP DATABASE）。"},
{text:"mydb 数据库下名字以 my 开头的表",correct:false,explanation:"* 是通配符表示所有表，不是正则匹配。要指定特定表用 mydb.tablename。"}
]},
{id:67,stage:2,type:"single",tags:["权限","REVOKE"],question:"如何撤销用户 'app'@'%' 对 mydb 数据库的 DELETE 权限？",options:[
{text:"REVOKE DELETE ON mydb.* FROM 'app'@'%'",correct:true,explanation:"REVOKE 语法与 GRANT 对应，指定要撤销的权限、作用范围和目标用户。"},
{text:"DELETE GRANT ON mydb.* FROM 'app'@'%'",correct:false,explanation:"没有 DELETE GRANT 语法，撤销权限使用 REVOKE 关键字。"},
{text:"REMOVE DELETE ON mydb.* FROM 'app'@'%'",correct:false,explanation:"没有 REMOVE 权限的语法，MySQL 使用 REVOKE 撤销权限。"},
{text:"DROP PRIVILEGE DELETE ON mydb.* FROM 'app'@'%'",correct:false,explanation:"没有 DROP PRIVILEGE 语法，撤销权限的标准关键字是 REVOKE。"}
]},
{id:68,stage:2,type:"single",tags:["角色","ROLE"],question:"MySQL 8.0+ 中如何激活用户的角色？",options:[
{text:"SET DEFAULT ROLE ALL TO 'user'@'host'",correct:true,explanation:"SET DEFAULT ROLE 设置用户登录时自动激活的角色。ALL 表示激活授予给该用户的所有角色。"},
{text:"ENABLE ROLE 'rolename'",correct:false,explanation:"MySQL 没有 ENABLE ROLE 语法，激活角色用 SET DEFAULT ROLE 或 SET ROLE。"},
{text:"GRANT ACTIVATE 'rolename' TO 'user'@'host'",correct:false,explanation:"没有 GRANT ACTIVATE 语法，角色授予用 GRANT role TO user，激活用 SET DEFAULT ROLE。"},
{text:"角色授予后自动激活",correct:false,explanation:"MySQL 中角色授予后默认不激活，需要用 SET DEFAULT ROLE 设置自动激活或用 SET ROLE 手动激活。"}
]},
{id:69,stage:2,type:"multiple",tags:["密码策略","validate_password"],question:"以下关于 MySQL validate_password 组件的说法，哪些是正确的？（多选）",options:[
{text:"可以设置密码最小长度要求",correct:true,explanation:"validate_password.length 参数控制密码最小长度，默认为 8。"},
{text:"可以要求密码包含大写、小写、数字、特殊字符",correct:true,explanation:"validate_password.policy 设为 MEDIUM 或 STRONG 时要求混合字符类型。"},
{text:"该组件默认已安装并启用",correct:false,explanation:"validate_password 组件需要手动安装（INSTALL COMPONENT 'file://component_validate_password'），不是默认启用的。"},
{text:"可以设置密码历史策略防止重复使用",correct:true,explanation:"password_history 和 password_reuse_interval 可以防止用户重复使用旧密码。"}
]},
{id:70,stage:2,type:"single",tags:["用户管理","账号锁定"],question:"如何锁定一个 MySQL 用户账号使其无法登录？",options:[
{text:"ALTER USER 'user'@'host' ACCOUNT LOCK",correct:true,explanation:"ACCOUNT LOCK 锁定账号，该用户尝试登录时会收到 Account is locked 错误。解锁用 ACCOUNT UNLOCK。"},
{text:"DELETE FROM mysql.user WHERE User='user'",correct:false,explanation:"直接删除 mysql.user 表中的记录是删除用户，不是锁定。且这种方式不安全，应用 DROP USER。"},
{text:"SET PASSWORD FOR 'user'@'host' = ''",correct:false,explanation:"设置空密码不等于锁定，如果允许空密码登录则仍可连接。锁定应用 ACCOUNT LOCK。"},
{text:"REVOKE ALL ON *.* FROM 'user'@'host'",correct:false,explanation:"撤销权限后用户仍能登录（只是没有操作权限），ACCOUNT LOCK 才是禁止登录。"}
]},
{id:71,stage:2,type:"single",tags:["权限","FLUSH PRIVILEGES"],question:"什么情况下需要执行 FLUSH PRIVILEGES？",options:[
{text:"直接修改了 mysql 系统表（如 mysql.user）后",correct:true,explanation:"使用 INSERT/UPDATE 直接修改权限表后需要 FLUSH PRIVILEGES 重新加载。GRANT/REVOKE/CREATE USER 等命令会自动刷新，不需要。"},
{text:"每次 GRANT 之后",correct:false,explanation:"GRANT 命令会自动通知服务器重新加载权限表，不需要手动 FLUSH PRIVILEGES。"},
{text:"MySQL 重启之后",correct:false,explanation:"MySQL 启动时会自动加载权限表，不需要手动 FLUSH。"},
{text:"创建新数据库之后",correct:false,explanation:"创建数据库不影响权限缓存，不需要 FLUSH PRIVILEGES。"}
]},
{id:72,stage:2,type:"single",tags:["SSL","安全连接"],question:"MySQL 中 require_secure_transport 参数的作用是什么？",options:[
{text:"强制所有客户端连接必须使用 SSL/TLS 加密",correct:true,explanation:"设置 require_secure_transport=ON 后，非加密的连接请求会被拒绝，保障传输安全。"},
{text:"启用 SSL 证书验证",correct:false,explanation:"SSL 证书验证由 ssl_ca 等参数控制，require_secure_transport 只是强制要求加密连接。"},
{text:"自动生成 SSL 证书",correct:false,explanation:"MySQL 启动时自动生成证书，require_secure_transport 只控制是否强制使用加密连接。"},
{text:"加密存储在磁盘上的数据",correct:false,explanation:"磁盘数据加密是 InnoDB 表空间加密（TDE）的功能，require_secure_transport 只管传输加密。"}
]},
{id:73,stage:2,type:"truefalse",tags:["权限","CONNECTION_ADMIN"],question:"拥有 CONNECTION_ADMIN 权限的用户可以在连接数达到 max_connections 上限后仍然登录。",options:[
{text:"正确",correct:true,explanation:"CONNECTION_ADMIN 是 MySQL 8.0 新增的动态权限，持有者可以超过 max_connections 限制登录，用于紧急运维。"},
{text:"错误",correct:false,explanation:"CONNECTION_ADMIN 权限确实允许超过连接数限制登录，这是该权限的核心功能之一。"}
]},
{id:74,stage:2,type:"single",tags:["存储过程","游标"],question:"MySQL 存储过程中游标（CURSOR）的作用是什么？",options:[
{text:"逐行遍历查询结果集",correct:true,explanation:"游标允许在存储过程中逐行处理 SELECT 查询的结果集，适用于需要对每行做不同处理的场景。"},
{text:"加速查询性能",correct:false,explanation:"游标实际上比集合操作更慢，因为是逐行处理。它的作用是灵活处理，不是加速。"},
{text:"锁定查询结果防止修改",correct:false,explanation:"游标不锁定数据（除非显式加锁），它的作用是遍历结果集。"},
{text:"缓存查询结果",correct:false,explanation:"游标不缓存结果，每次 FETCH 都从结果集中取下一行。"}
]},
{id:75,stage:2,type:"single",tags:["存储过程","异常处理"],question:"MySQL 存储过程中 DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 的作用是什么？",options:[
{text:"捕获 SQL 异常后继续执行后续语句",correct:true,explanation:"CONTINUE HANDLER 在遇到异常时执行处理逻辑后继续执行后续代码，不中断存储过程。"},
{text:"发生异常时立即退出存储过程",correct:false,explanation:"立即退出用 EXIT HANDLER，CONTINUE HANDLER 是处理后继续执行。"},
{text:"忽略所有错误",correct:false,explanation:"CONTINUE HANDLER 会执行定义的处理逻辑（如设置变量），不是简单忽略错误。"},
{text:"重试失败的语句",correct:false,explanation:"Handler 不会重试语句，它只是在异常发生后执行指定的处理逻辑。"}
]},
{id:76,stage:2,type:"single",tags:["视图","WITH CHECK OPTION"],question:"视图定义中 WITH CHECK OPTION 的作用是什么？",options:[
{text:"确保通过视图的 INSERT/UPDATE 操作满足视图的 WHERE 条件",correct:true,explanation:"WITH CHECK OPTION 阻止通过视图插入或更新不满足视图 WHERE 条件的数据，保证数据始终在视图可见范围内。"},
{text:"对视图加读锁防止并发修改",correct:false,explanation:"WITH CHECK OPTION 不涉及锁，它是数据验证机制。"},
{text:"检查视图定义的语法正确性",correct:false,explanation:"语法检查在 CREATE VIEW 时就已完成，WITH CHECK OPTION 是运行时的数据验证。"},
{text:"验证视图查询的性能",correct:false,explanation:"WITH CHECK OPTION 与性能无关，它确保 DML 操作的数据符合视图条件。"}
]},
{id:77,stage:2,type:"multiple",tags:["权限","全局权限"],question:"以下哪些属于 MySQL 的全局级别权限？（多选）",options:[
{text:"SUPER",correct:true,explanation:"SUPER 是全局权限，控制多种管理操作。MySQL 8.0 中被拆分为多个细粒度的动态权限。"},
{text:"PROCESS",correct:true,explanation:"PROCESS 是全局权限，允许查看所有线程（SHOW PROCESSLIST）和访问 INFORMATION_SCHEMA 中的进程信息。"},
{text:"SELECT",correct:false,explanation:"SELECT 可以在全局、数据库、表、列多个级别授予，不是纯全局权限。"},
{text:"RELOAD",correct:true,explanation:"RELOAD 是全局权限，允许执行 FLUSH 操作（如 FLUSH TABLES、FLUSH LOGS）。"}
]},
{id:78,stage:2,type:"single",tags:["用户管理","Host"],question:"CREATE USER 'app'@'192.168.1.%' 中 Host 部分 '192.168.1.%' 表示什么？",options:[
{text:"允许 192.168.1.0/24 网段的任何 IP 连接",correct:true,explanation:"% 是通配符匹配任意字符。192.168.1.% 匹配 192.168.1.0 到 192.168.1.255 的所有 IP 地址。"},
{text:"只允许 192.168.1.1 连接",correct:false,explanation:"只允许一个 IP 应该写 '192.168.1.1'，% 通配符表示匹配该网段所有地址。"},
{text:"允许所有 IP 连接",correct:false,explanation:"允许所有 IP 用 '%'。192.168.1.% 限定了前三段必须是 192.168.1。"},
{text:"这是无效的 Host 格式",correct:false,explanation:"% 通配符在 Host 字段中是有效的，192.168.1.% 是常见的网段授权方式。"}
]},
{id:79,stage:2,type:"single",tags:["触发器","限制"],question:"MySQL 中一个表最多可以有多少个同类型的触发器（如 BEFORE INSERT）？",options:[
{text:"多个（MySQL 5.7.2+ 支持同一事件多个触发器）",correct:true,explanation:"MySQL 5.7.2 开始支持同一个表的同一个事件有多个触发器，通过 FOLLOWS/PRECEDES 指定执行顺序。"},
{text:"只能有 1 个",correct:false,explanation:"MySQL 5.7.2 之前确实只能有 1 个，但 5.7.2+ 和 8.0 支持多个同类型触发器。"},
{text:"最多 3 个",correct:false,explanation:"MySQL 没有限制为 3 个，5.7.2+ 理论上可以创建任意多个同类型触发器。"},
{text:"取决于 max_triggers 参数",correct:false,explanation:"MySQL 没有 max_triggers 参数，同类型触发器数量没有固定上限。"}
]},
{id:80,stage:2,type:"single",tags:["视图","算法"],question:"CREATE VIEW 中 ALGORITHM = MERGE 和 ALGORITHM = TEMPTABLE 的区别是什么？",options:[
{text:"MERGE 将视图查询合并到外层查询中，TEMPTABLE 先执行视图查询到临时表",correct:true,explanation:"MERGE 更高效，将视图定义直接嵌入外层 SQL 一起优化。TEMPTABLE 先物化视图结果到临时表再查询，不支持更新。"},
{text:"MERGE 使用更多内存，TEMPTABLE 使用更少内存",correct:false,explanation:"通常 TEMPTABLE 需要额外内存存储临时结果，MERGE 直接合并查询不需要额外空间。"},
{text:"两者性能完全相同",correct:false,explanation:"MERGE 通常性能更好，因为优化器可以整体优化。TEMPTABLE 需要两步执行。"},
{text:"MERGE 只支持简单查询，TEMPTABLE 支持所有查询",correct:false,explanation:"MERGE 确实有限制（不支持聚合等），但说 TEMPTABLE 支持所有查询也不准确。"}
]},
{id:81,stage:2,type:"truefalse",tags:["存储过程","动态SQL"],question:"MySQL 存储过程中可以使用 PREPARE 和 EXECUTE 执行动态 SQL。",options:[
{text:"正确",correct:true,explanation:"PREPARE stmt FROM @sql_text; EXECUTE stmt; DEALLOCATE PREPARE stmt; 这组语法允许在存储过程中执行动态构建的 SQL。"},
{text:"错误",correct:false,explanation:"MySQL 的 Prepared Statement 语法可以在存储过程中使用，实现动态 SQL 执行。"}
]},
{id:82,stage:2,type:"single",tags:["权限","动态权限"],question:"MySQL 8.0 引入的动态权限（Dynamic Privileges）解决了什么问题？",options:[
{text:"将 SUPER 权限拆分为多个细粒度权限，实现最小权限原则",correct:true,explanation:"SUPER 权限过于宽泛，8.0 将其拆分为 CONNECTION_ADMIN、SYSTEM_VARIABLES_ADMIN 等细粒度动态权限。"},
{text:"提高查询性能",correct:false,explanation:"动态权限与性能无关，它解决的是权限粒度过粗的安全问题。"},
{text:"支持跨数据库授权",correct:false,explanation:"跨数据库授权一直都支持（使用 *.*），动态权限解决的是 SUPER 权限拆分问题。"},
{text:"自动同步权限到从库",correct:false,explanation:"权限通过复制 Binlog 同步到从库，与动态权限机制无关。"}
]},
{id:83,stage:2,type:"single",tags:["索引","前缀索引"],question:"对 VARCHAR(500) 列创建前缀索引 INDEX(col(20)) 是什么意思？",options:[
{text:"只对列的前 20 个字符建索引",correct:true,explanation:"前缀索引只索引字符串的前 N 个字符，减小索引体积。但不能用于 ORDER BY 和覆盖索引。"},
{text:"索引最多存 20 行数据",correct:false,explanation:"(20) 指的是字符数前缀长度，不是行数限制。"},
{text:"索引占用 20 字节",correct:false,explanation:"(20) 是前缀字符数，实际字节数取决于字符集（utf8mb4 下最多 80 字节）。"},
{text:"只在前 20 行数据上建索引",correct:false,explanation:"前缀索引对所有行的前 20 个字符建索引，不是只索引前 20 行。"}
]},
{id:84,stage:2,type:"single",tags:["约束","唯一约束"],question:"UNIQUE 约束允许多个 NULL 值存在吗？",options:[
{text:"允许，NULL 不等于 NULL 所以多个 NULL 不算重复",correct:true,explanation:"在 MySQL 中，UNIQUE 约束认为 NULL != NULL，所以同一个唯一列可以有多个 NULL 值。"},
{text:"不允许，只能有一个 NULL",correct:false,explanation:"这是 SQL Server 的行为。MySQL 中 UNIQUE 列允许多个 NULL，因为 NULL 之间的比较结果是 NULL（不是 TRUE）。"},
{text:"NULL 值不能出现在 UNIQUE 列中",correct:false,explanation:"UNIQUE 列可以有 NULL 值（除非同时定义了 NOT NULL），而且可以有多个 NULL。"},
{text:"取决于 sql_mode 设置",correct:false,explanation:"MySQL 允许 UNIQUE 列多个 NULL 是固定行为，不受 sql_mode 影响。"}
]},
{id:85,stage:2,type:"single",tags:["AUTO_INCREMENT","自增"],question:"MySQL 8.0+ 中 AUTO_INCREMENT 计数器持久化的意义是什么？",options:[
{text:"重启后自增值不会回溯，避免主键重复",correct:true,explanation:"8.0 之前自增计数器在内存中，重启后从表中最大值重新计算，DELETE 后重启可能复用旧 ID。8.0 持久化到 Redo Log 避免此问题。"},
{text:"提高自增 ID 的生成速度",correct:false,explanation:"持久化不影响速度，它解决的是重启后自增值回溯导致的潜在问题。"},
{text:"支持分布式自增",correct:false,explanation:"分布式自增需要 Snowflake 等算法，AUTO_INCREMENT 持久化只解决单实例重启问题。"},
{text:"减少磁盘占用",correct:false,explanation:"持久化自增值到 Redo Log 反而多了一点写入，但解决了数据安全性问题。"}
]},
{id:86,stage:2,type:"multiple",tags:["表操作","ALTER TABLE"],question:"以下哪些 ALTER TABLE 操作在 MySQL 8.0+ 中可以使用 ALGORITHM=INSTANT 几乎瞬间完成？（多选）",options:[
{text:"在表末尾添加新列",correct:true,explanation:"INSTANT DDL 在表末尾加列只修改元数据，不需要重建表，几乎瞬间完成。"},
{text:"修改列的默认值",correct:true,explanation:"修改默认值只影响元数据，不需要修改已有数据，可以用 INSTANT 算法。"},
{text:"修改列的数据类型（如 INT 改 BIGINT）",correct:false,explanation:"改数据类型需要修改每一行的数据，必须重建表，不能用 INSTANT 算法。"},
{text:"删除列",correct:false,explanation:"MySQL 8.0 的 INSTANT ADD COLUMN 不支持删除列（8.0.29+ 部分支持，但有限制）。"}
]},
{id:87,stage:2,type:"single",tags:["信息查询","INFORMATION_SCHEMA"],question:"INFORMATION_SCHEMA 是什么？",options:[
{text:"MySQL 的元数据数据库，存储所有库表列索引等结构信息",correct:true,explanation:"INFORMATION_SCHEMA 是虚拟数据库，提供对数据字典的只读访问，包含表结构、列定义、索引信息、权限等元数据。"},
{text:"存储用户数据的系统表",correct:false,explanation:"INFORMATION_SCHEMA 不存储用户数据，它只包含数据库结构和元数据信息。"},
{text:"性能监控专用数据库",correct:false,explanation:"性能监控用 performance_schema，INFORMATION_SCHEMA 主要提供元数据查询。"},
{text:"MySQL 的配置文件",correct:false,explanation:"配置文件是 my.cnf/my.ini，INFORMATION_SCHEMA 是数据库对象。"}
]},
{id:88,stage:2,type:"single",tags:["存储过程","变量"],question:"MySQL 存储过程中 @var 和 DECLARE var 的区别是什么？",options:[
{text:"@var 是会话变量，DECLARE var 是局部变量只在 BEGIN...END 块内有效",correct:true,explanation:"@var 是用户定义的会话变量，整个连接生命周期内有效。DECLARE 定义的是存储过程内的局部变量，块结束后消失。"},
{text:"两者功能完全相同",correct:false,explanation:"作用域不同。@var 在整个会话中持续存在，DECLARE 变量只在定义它的 BEGIN...END 块内有效。"},
{text:"@var 是全局变量，DECLARE var 是会话变量",correct:false,explanation:"@var 是会话变量（不是全局）。全局变量用 @@global.var_name 访问。DECLARE 是局部变量。"},
{text:"DECLARE var 性能更好",correct:false,explanation:"两者的性能差异可以忽略，核心区别是作用域不同。"}
]},
{id:89,stage:2,type:"truefalse",tags:["外键","InnoDB"],question:"MyISAM 存储引擎支持外键约束。",options:[
{text:"正确",correct:false,explanation:"MyISAM 不支持外键约束。外键约束只有 InnoDB 引擎支持。MyISAM 可以写 FOREIGN KEY 语法但会被忽略。"},
{text:"错误",correct:true,explanation:"外键约束是 InnoDB 特有的功能，MyISAM 不支持事务也不支持外键。"}
]},
{id:90,stage:2,type:"single",tags:["权限","SHOW GRANTS"],question:"如何查看用户 'app'@'localhost' 拥有的所有权限？",options:[
{text:"SHOW GRANTS FOR 'app'@'localhost'",correct:true,explanation:"SHOW GRANTS 显示指定用户的所有授权语句，包括全局、数据库、表级别的权限和角色。"},
{text:"SELECT * FROM mysql.user WHERE User='app'",correct:false,explanation:"mysql.user 表只显示全局权限的原始数据，不如 SHOW GRANTS 直观完整。"},
{text:"SHOW PRIVILEGES FOR 'app'@'localhost'",correct:false,explanation:"SHOW PRIVILEGES 显示的是 MySQL 支持的所有权限类型列表，不是特定用户的权限。"},
{text:"DESCRIBE USER 'app'@'localhost'",correct:false,explanation:"MySQL 没有 DESCRIBE USER 语法，查看用户权限用 SHOW GRANTS。"}
]},
{id:91,stage:2,type:"single",tags:["分区表","分区裁剪"],question:"分区裁剪（Partition Pruning）的含义是什么？",options:[
{text:"查询时只扫描包含目标数据的分区，跳过不相关分区",correct:true,explanation:"当 WHERE 条件包含分区键时，优化器只需扫描相关分区而非全部分区，大幅减少数据扫描量。"},
{text:"自动删除空的分区",correct:false,explanation:"分区裁剪是查询优化概念，不是删除分区。删除分区用 ALTER TABLE ... DROP PARTITION。"},
{text:"减少分区的数量",correct:false,explanation:"裁剪不改变分区数量，只是在查询时跳过不相关分区以提高效率。"},
{text:"压缩分区数据",correct:false,explanation:"分区裁剪与数据压缩无关，它是查询执行阶段的优化。"}
]},
{id:92,stage:2,type:"single",tags:["安全","SQL注入"],question:"防止 SQL 注入的最有效方法是什么？",options:[
{text:"使用参数化查询（Prepared Statements）",correct:true,explanation:"参数化查询将 SQL 结构和数据分离，数据库将参数作为值处理而非 SQL 代码，从根本上防止注入。"},
{text:"过滤单引号",correct:false,explanation:"过滤单引号容易被绕过（如使用编码、双字节字符等），不是可靠的防护方案。"},
{text:"限制输入长度",correct:false,explanation:"限制长度可以减少攻击面但不能防止注入，短字符串也能构造注入攻击。"},
{text:"使用存储过程",correct:false,explanation:"存储过程中如果拼接了用户输入的字符串同样有注入风险，不是根本解决方案。"}
]},
{id:93,stage:2,type:"truefalse",tags:["触发器","性能"],question:"触发器中的操作是在同一个事务中执行的，触发器失败会导致原始操作也回滚。",options:[
{text:"正确",correct:true,explanation:"触发器和触发它的 DML 操作在同一个事务中。如果触发器执行失败（如报错），整个事务包括原始操作都会回滚。"},
{text:"错误",correct:false,explanation:"触发器确实在同一事务中执行。InnoDB 下触发器失败会导致原始操作回滚。"}
]},
{id:94,stage:2,type:"single",tags:["表空间","innodb_file_per_table"],question:"innodb_file_per_table = ON 时每个 InnoDB 表的数据存储在哪里？",options:[
{text:"独立的 .ibd 文件中",correct:true,explanation:"每个表一个 .ibd 文件存储数据和索引。MySQL 8.0 默认 ON，便于单独管理表空间（如 OPTIMIZE TABLE 回收空间）。"},
{text:"共享的 ibdata1 文件中",correct:false,explanation:"innodb_file_per_table=OFF 时数据存储在共享的 ibdata1 中。ON 时使用独立文件。"},
{text:".frm 文件中",correct:false,explanation:".frm 文件在 MySQL 8.0 中已不存在（被数据字典取代）。数据存储在 .ibd 文件中。"},
{text:".MYD 文件中",correct:false,explanation:".MYD 是 MyISAM 引擎的数据文件。InnoDB 使用 .ibd 文件。"}
]},
{id:95,stage:2,type:"single",tags:["权限","admin_address"],question:"MySQL 8.0 的 admin_address 和 admin_port 参数的作用是什么？",options:[
{text:"配置管理专用连接地址和端口，连接数满时仍可登录管理",correct:true,explanation:"admin_address 和 admin_port 定义独立的管理接口，不受 max_connections 限制，确保紧急情况下 DBA 可以连接。"},
{text:"配置集群管理节点的地址",correct:false,explanation:"这两个参数是单实例的管理接口配置，与集群管理无关。"},
{text:"设置远程管理白名单",correct:false,explanation:"这不是白名单功能，而是一个独立的管理连接通道。"},
{text:"配置 MySQL Shell 的连接地址",correct:false,explanation:"MySQL Shell 可以连接任何地址和端口，admin_address/port 不是专门为 Shell 设计的。"}
]},
{id:96,stage:2,type:"multiple",tags:["存储过程","流程控制"],question:"以下哪些是 MySQL 存储过程中支持的流程控制语句？（多选）",options:[
{text:"IF ... THEN ... ELSEIF ... ELSE ... END IF",correct:true,explanation:"IF 语句是存储过程中最常用的条件判断语句。"},
{text:"CASE ... WHEN ... THEN ... END CASE",correct:true,explanation:"CASE 语句支持多分支条件判断，可以基于值匹配或条件表达式。"},
{text:"WHILE ... DO ... END WHILE",correct:true,explanation:"WHILE 循环在条件为 TRUE 时重复执行循环体。"},
{text:"FOR ... IN ... LOOP",correct:false,explanation:"MySQL 存储过程不支持 FOR...IN 语法。循环用 WHILE、REPEAT 或 LOOP 实现。"}
]},
{id:97,stage:2,type:"single",tags:["安全","数据脱敏"],question:"以下哪种方式可以在 MySQL 中实现查询结果的数据脱敏？",options:[
{text:"使用视图配合 CONCAT/SUBSTR 等函数对敏感列做遮挡",correct:true,explanation:"创建脱敏视图，用 CONCAT(LEFT(phone,3),'****',RIGHT(phone,4)) 等方式遮挡敏感数据，只授权用户访问视图。"},
{text:"MySQL 内置 MASK() 函数",correct:false,explanation:"MySQL 社区版没有内置 MASK 函数。企业版有数据脱敏组件，社区版需要用视图+函数实现。"},
{text:"设置列级别的加密属性",correct:false,explanation:"列级加密（TDE）加密的是存储层数据，查询结果仍是明文。脱敏需要在查询层处理。"},
{text:"使用 INVISIBLE 列属性",correct:false,explanation:"INVISIBLE 列只是 SELECT * 时不返回，显式指定列名仍可查到原始数据，不是脱敏。"}
]},
{id:98,stage:2,type:"truefalse",tags:["视图","performance"],question:"频繁查询的复杂视图会导致性能问题，因为视图每次被查询时都会重新执行其定义的 SQL。",options:[
{text:"正确",correct:true,explanation:"MySQL 的视图不缓存结果（非物化视图），每次查询视图都会执行底层 SELECT。复杂视图涉及多表 JOIN、子查询时会影响性能。"},
{text:"错误",correct:false,explanation:"MySQL 不支持物化视图（自动缓存结果），每次查询视图确实会重新执行 SQL。"}
]},
{id:99,stage:2,type:"single",tags:["用户管理","双密码"],question:"MySQL 8.0 的双密码（Dual Password）功能的应用场景是什么？",options:[
{text:"在不中断服务的情况下轮换密码（新旧密码同时有效）",correct:true,explanation:"ALTER USER ... RETAIN CURRENT PASSWORD 使旧密码暂时仍有效。应用逐步切换到新密码后再废弃旧密码，实现零停机密码轮换。"},
{text:"两个用户共享一个账号",correct:false,explanation:"双密码不是给多人共享账号用的，而是用于平滑的密码轮换过渡期。"},
{text:"主密码用于读写，备用密码用于只读",correct:false,explanation:"双密码不区分读写权限，两个密码都具有完全相同的权限。"},
{text:"自动在两个密码之间切换",correct:false,explanation:"MySQL 不会自动切换密码，双密码是过渡期两个都能用，轮换完成后手动废弃旧密码。"}
]},
{id:100,stage:2,type:"single",tags:["约束","DEFAULT"],question:"MySQL 8.0+ 中 DEFAULT 子句支持表达式吗？",options:[
{text:"支持，如 DEFAULT (UUID()) 或 DEFAULT (CURRENT_TIMESTAMP + INTERVAL 7 DAY)",correct:true,explanation:"MySQL 8.0.13+ DEFAULT 支持表达式（用括号包裹），可以使用函数和运算符，不再限于常量值。"},
{text:"不支持，DEFAULT 只能是常量值",correct:false,explanation:"MySQL 5.7 中 DEFAULT 确实只支持常量（TIMESTAMP 除外），但 8.0.13+ 已支持表达式。"},
{text:"只支持日期函数",correct:false,explanation:"8.0.13+ 支持任意表达式，不限于日期函数。"},
{text:"只有 STORED 生成列支持表达式",correct:false,explanation:"DEFAULT 表达式和生成列是不同的功能，8.0.13+ DEFAULT 本身就支持表达式。"}
]}
];
