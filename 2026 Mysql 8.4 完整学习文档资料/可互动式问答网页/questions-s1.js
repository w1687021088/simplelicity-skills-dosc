var stage1Questions = [
{id:1,stage:1,type:"single",tags:["MySQL安装","端口配置"],question:"MySQL 8.4 默认监听的 TCP 端口号是多少？",options:[
{text:"3306",correct:true,explanation:"MySQL 所有版本的默认 TCP 端口均为 3306，这是安装时的默认配置。"},
{text:"3307",correct:false,explanation:"3307 不是默认端口，通常用于同一台机器上部署第二个 MySQL 实例时手动指定。"},
{text:"5432",correct:false,explanation:"5432 是 PostgreSQL 数据库的默认端口，不是 MySQL 的。"},
{text:"1433",correct:false,explanation:"1433 是 Microsoft SQL Server 的默认端口，与 MySQL 无关。"}
]},
{id:2,stage:1,type:"single",tags:["MySQL版本","LTS"],question:"MySQL 8.4 属于哪种发布类型？",options:[
{text:"LTS（长期支持版本）",correct:true,explanation:"MySQL 8.4 是 MySQL 首个 LTS 版本，提供至少 8 年的支持周期，适合生产环境长期使用。"},
{text:"Innovation Release（创新版本）",correct:false,explanation:"8.1、8.2、8.3 属于 Innovation Release，8.4 是 LTS 版本。"},
{text:"Beta 测试版",correct:false,explanation:"8.4 是正式发布的稳定版本，不是测试版。"},
{text:"Community Preview",correct:false,explanation:"MySQL 没有 Community Preview 这个发布类型，8.4 是正式的 LTS 版本。"}
]},
{id:3,stage:1,type:"truefalse",tags:["配置文件","my.cnf"],question:"在 Linux 系统中，MySQL 的主配置文件通常是 /etc/my.cnf 或 /etc/mysql/my.cnf。",options:[
{text:"正确",correct:true,explanation:"Linux 下 MySQL 默认读取 /etc/my.cnf 或 /etc/mysql/my.cnf 作为主配置文件，具体取决于发行版。"},
{text:"错误",correct:false,explanation:"这个说法是正确的。MySQL 在 Linux 下的配置文件路径确实是 /etc/my.cnf 或 /etc/mysql/my.cnf。"}
]},
{id:4,stage:1,type:"single",tags:["数据目录","初始化"],question:"MySQL 8.4 使用哪个命令初始化数据目录？",options:[
{text:"mysqld --initialize",correct:true,explanation:"MySQL 8.0+ 使用 mysqld --initialize 初始化数据目录，会生成临时 root 密码。"},
{text:"mysql_install_db",correct:false,explanation:"mysql_install_db 是 MySQL 5.7 及之前版本使用的初始化工具，在 8.0 中已被移除。"},
{text:"mysql --init",correct:false,explanation:"mysql 是客户端程序，没有 --init 参数，初始化用的是 mysqld 服务端程序。"},
{text:"mysqladmin create",correct:false,explanation:"mysqladmin create 用于创建数据库，不是初始化数据目录。"}
]},
{id:5,stage:1,type:"single",tags:["认证插件","caching_sha2_password"],question:"MySQL 8.4 默认使用的认证插件是什么？",options:[
{text:"caching_sha2_password",correct:true,explanation:"从 MySQL 8.0 开始默认使用 caching_sha2_password，8.4 延续此设置，安全性更高。"},
{text:"mysql_native_password",correct:false,explanation:"mysql_native_password 是 5.7 的默认认证插件，在 8.4 中已默认禁用。"},
{text:"sha256_password",correct:false,explanation:"sha256_password 已被废弃，其功能被 caching_sha2_password 取代。"},
{text:"auth_socket",correct:false,explanation:"auth_socket 仅在 Linux 下通过 socket 认证使用，不是默认的通用认证插件。"}
]},
{id:6,stage:1,type:"truefalse",tags:["字符集","utf8mb4"],question:"MySQL 8.4 的默认字符集是 utf8mb3（旧的 utf8）。",options:[
{text:"正确",correct:false,explanation:"MySQL 8.0 开始默认字符集已改为 utf8mb4，而不是 utf8mb3。utf8mb3 已被标记为废弃。"},
{text:"错误",correct:true,explanation:"MySQL 8.0+ 默认字符集是 utf8mb4（支持完整的 Unicode 包括 emoji），不再是 utf8mb3。"}
]},
{id:7,stage:1,type:"single",tags:["数据类型","整数类型"],question:"MySQL 中 INT 类型占用多少字节的存储空间？",options:[
{text:"4 字节",correct:true,explanation:"INT 类型固定占用 4 字节，有符号范围约 -21 亿到 21 亿，无符号范围 0 到约 42 亿。"},
{text:"2 字节",correct:false,explanation:"2 字节是 SMALLINT 的存储空间，不是 INT。"},
{text:"8 字节",correct:false,explanation:"8 字节是 BIGINT 的存储空间，INT 只需要 4 字节。"},
{text:"取决于存储的值大小",correct:false,explanation:"INT 是固定长度类型，始终占用 4 字节，不会随存储值的大小变化。"}
]},
{id:8,stage:1,type:"single",tags:["数据类型","BIGINT"],question:"如果需要存储超过 21 亿的数值（如全局唯一 ID），应该选择哪种数据类型？",options:[
{text:"BIGINT",correct:true,explanation:"BIGINT 占 8 字节，有符号范围约 -9.2×10^18 到 9.2×10^18，足以存储超大数值。"},
{text:"INT UNSIGNED",correct:false,explanation:"INT UNSIGNED 最大约 42 亿，对于雪花算法等 64 位 ID 仍然不够。"},
{text:"DECIMAL(20,0)",correct:false,explanation:"DECIMAL 虽然可以存储大数值，但性能和存储效率不如 BIGINT，且不适合做主键自增。"},
{text:"VARCHAR(20)",correct:false,explanation:"用字符串存储数字会导致排序和比较时按字典序而非数值序，性能也更差。"}
]},
{id:9,stage:1,type:"single",tags:["数据类型","VARCHAR","CHAR"],question:"VARCHAR(100) 和 CHAR(100) 存储字符串 'abc' 时，哪个占用的磁盘空间更小？",options:[
{text:"VARCHAR(100)",correct:true,explanation:"VARCHAR 是可变长度类型，存储 'abc' 只需 3 字节数据 + 1 字节长度前缀 = 4 字节。"},
{text:"CHAR(100)",correct:false,explanation:"CHAR 是固定长度类型，始终占用 100 个字符的空间（UTF8MB4 下最多 400 字节），存储短字符串时浪费空间。"},
{text:"两者相同",correct:false,explanation:"CHAR 固定长度会填充空格到定义长度，VARCHAR 只存实际数据长度，所以 VARCHAR 更省空间。"},
{text:"取决于字符集",correct:false,explanation:"虽然字符集影响每个字符的字节数，但 VARCHAR 的可变长度特性在任何字符集下都比 CHAR 更节省短字符串的存储。"}
]},
{id:10,stage:1,type:"multiple",tags:["数据类型","DECIMAL","FLOAT"],question:"以下关于 DECIMAL 和 FLOAT 类型的说法，哪些是正确的？（多选）",options:[
{text:"DECIMAL 是精确数值类型，不存在精度丢失",correct:true,explanation:"DECIMAL 使用字符串方式存储数字，是精确类型，适合金融场景。"},
{text:"FLOAT 存储 0.1+0.2 的结果可能不等于 0.3",correct:true,explanation:"FLOAT 是浮点数类型，存在二进制表示的精度问题，0.1+0.2 可能得到 0.30000000000000004。"},
{text:"FLOAT 比 DECIMAL 占用更多的存储空间",correct:false,explanation:"FLOAT 只占 4 字节，DECIMAL 的存储空间取决于精度定义，通常比 FLOAT 更大。"},
{text:"金额字段应使用 DECIMAL 而非 FLOAT",correct:true,explanation:"金额需要精确计算，DECIMAL 不会丢失精度，FLOAT 的精度丢失在金融场景下不可接受。"}
]},
{id:11,stage:1,type:"single",tags:["数据类型","DATETIME","TIMESTAMP"],question:"TIMESTAMP 类型在 MySQL 中最大能表示到哪一年？",options:[
{text:"2038 年",correct:true,explanation:"TIMESTAMP 使用 4 字节存储 UTC 时间戳，32 位限制导致最大只能到 2038-01-19 03:14:07 UTC。"},
{text:"9999 年",correct:false,explanation:"9999 年是 DATETIME 类型的最大范围，不是 TIMESTAMP 的。"},
{text:"2099 年",correct:false,explanation:"TIMESTAMP 的上限是 2038 年（32 位整数限制），不是 2099 年。"},
{text:"2100 年",correct:false,explanation:"TIMESTAMP 受 32 位 Unix 时间戳限制，最大到 2038 年 1 月 19 日。"}
]},
{id:12,stage:1,type:"truefalse",tags:["数据类型","TIMESTAMP","时区"],question:"TIMESTAMP 类型存储数据时会自动转换为 UTC，读取时再转换为当前会话的时区。",options:[
{text:"正确",correct:true,explanation:"TIMESTAMP 内部以 UTC 存储，读取时根据 session 的 time_zone 变量转换为当前时区时间。"},
{text:"错误",correct:false,explanation:"这是 TIMESTAMP 的核心特性。DATETIME 才是存什么读什么，不做时区转换。"}
]},
{id:13,stage:1,type:"single",tags:["数据类型","TEXT","BLOB"],question:"TEXT 和 BLOB 类型的主要区别是什么？",options:[
{text:"TEXT 存储字符数据有字符集，BLOB 存储二进制数据无字符集",correct:true,explanation:"TEXT 按字符集存储和比较文本，BLOB 按二进制字节存储，不关心字符集和排序规则。"},
{text:"TEXT 最大 64KB，BLOB 没有限制",correct:false,explanation:"TEXT 和 BLOB 都有相同的大小限制，LONGTEXT 和 LONGBLOB 都最大约 4GB。"},
{text:"TEXT 可以作为索引的全部长度，BLOB 不可以",correct:false,explanation:"TEXT 和 BLOB 都不能直接用全部长度做索引，都需要指定前缀长度。"},
{text:"BLOB 性能比 TEXT 好",correct:false,explanation:"两者的存储和性能特性基本相同，区别在于字符集处理，不在于性能。"}
]},
{id:14,stage:1,type:"single",tags:["数据类型","JSON"],question:"MySQL 8.0+ 的 JSON 类型以什么格式存储数据？",options:[
{text:"内部二进制格式",correct:true,explanation:"MySQL 将 JSON 数据以优化的二进制格式存储，不是纯文本，这样可以快速访问 JSON 元素而无需解析整个文档。"},
{text:"纯文本字符串",correct:false,explanation:"虽然写入时是 JSON 文本，但 MySQL 内部将其转换为二进制格式存储以提高访问效率。"},
{text:"BSON 格式",correct:false,explanation:"BSON 是 MongoDB 使用的格式，MySQL 使用自己的二进制 JSON 格式。"},
{text:"压缩的文本格式",correct:false,explanation:"MySQL 不是简单压缩 JSON 文本，而是将其转换为结构化的二进制格式。"}
]},
{id:15,stage:1,type:"single",tags:["SQL基础","SELECT"],question:"以下 SQL 语句中，执行顺序最先的子句是哪个？\nSELECT name, COUNT(*) FROM users WHERE age>18 GROUP BY name HAVING COUNT(*)>1 ORDER BY name LIMIT 10",options:[
{text:"FROM",correct:true,explanation:"SQL 的逻辑执行顺序是：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT。FROM 最先执行。"},
{text:"SELECT",correct:false,explanation:"虽然 SELECT 写在最前面，但逻辑执行顺序中 SELECT 排在 HAVING 之后、ORDER BY 之前。"},
{text:"WHERE",correct:false,explanation:"WHERE 在 FROM 之后执行，先确定数据源再过滤行。"},
{text:"GROUP BY",correct:false,explanation:"GROUP BY 在 WHERE 之后执行，先过滤再分组。"}
]},
{id:16,stage:1,type:"multiple",tags:["SQL基础","WHERE","HAVING"],question:"以下关于 WHERE 和 HAVING 的说法，哪些是正确的？（多选）",options:[
{text:"WHERE 在 GROUP BY 之前执行",correct:true,explanation:"WHERE 过滤原始行数据，在分组之前执行。"},
{text:"HAVING 可以使用聚合函数",correct:true,explanation:"HAVING 用于过滤分组后的结果，可以对聚合函数（如 SUM、COUNT）设置条件。"},
{text:"WHERE 中可以使用聚合函数",correct:false,explanation:"WHERE 在分组之前执行，此时还没有聚合结果，所以不能使用聚合函数。"},
{text:"HAVING 只能跟在 GROUP BY 之后使用",correct:true,explanation:"HAVING 是对分组结果的过滤，必须配合 GROUP BY 使用才有意义。"}
]},
{id:17,stage:1,type:"single",tags:["SQL基础","JOIN"],question:"LEFT JOIN 的特点是什么？",options:[
{text:"返回左表所有行，右表无匹配时用 NULL 填充",correct:true,explanation:"LEFT JOIN 保证左表的所有行都出现在结果中，右表找不到匹配行时，右表的列全部为 NULL。"},
{text:"只返回两表都能匹配的行",correct:false,explanation:"这是 INNER JOIN 的行为，LEFT JOIN 会保留左表的所有行。"},
{text:"返回右表所有行，左表无匹配时用 NULL 填充",correct:false,explanation:"这是 RIGHT JOIN 的行为，不是 LEFT JOIN。"},
{text:"返回两表所有行的笛卡尔积",correct:false,explanation:"这是 CROSS JOIN 的行为，LEFT JOIN 有 ON 条件进行匹配。"}
]},
{id:18,stage:1,type:"single",tags:["SQL基础","UNION"],question:"UNION 和 UNION ALL 的区别是什么？",options:[
{text:"UNION 去重，UNION ALL 不去重",correct:true,explanation:"UNION 会对合并后的结果集进行去重（需要排序操作），UNION ALL 直接合并不去重，性能更好。"},
{text:"UNION ALL 去重，UNION 不去重",correct:false,explanation:"正好相反。UNION 去重，UNION ALL 保留所有行不去重。"},
{text:"UNION 只能合并两个查询，UNION ALL 可以合并多个",correct:false,explanation:"两者都可以合并多个查询，数量上没有区别。"},
{text:"UNION ALL 的列数可以不同",correct:false,explanation:"UNION 和 UNION ALL 都要求合并的查询列数相同且类型兼容。"}
]},
{id:19,stage:1,type:"single",tags:["SQL基础","子查询"],question:"以下哪种写法能避免 MySQL 中 'You can't specify target table for update in FROM clause' 的错误？",options:[
{text:"使用派生表（子查询外套一层 SELECT）",correct:true,explanation:"MySQL 不允许在 UPDATE/DELETE 的子查询中直接引用目标表，但套一层派生表可以绕过这个限制。"},
{text:"使用 WITH 子句",correct:false,explanation:"CTE（WITH 子句）在 MySQL 的 UPDATE/DELETE 中也可能遇到同样的限制，派生表是最可靠的方案。"},
{text:"改用存储过程",correct:false,explanation:"存储过程内部执行同样的 SQL 也会遇到这个限制，问题在于 SQL 写法而非执行方式。"},
{text:"添加 IGNORE 关键字",correct:false,explanation:"IGNORE 用于忽略重复键等错误，与目标表引用限制无关。"}
]},
{id:20,stage:1,type:"truefalse",tags:["SQL基础","GROUP BY"],question:"在 MySQL 8.0/8.4 中，GROUP BY 子句会自动对结果进行排序。",options:[
{text:"正确",correct:false,explanation:"MySQL 8.0 开始 GROUP BY 不再隐式排序。如果需要排序必须显式添加 ORDER BY 子句。"},
{text:"错误",correct:true,explanation:"MySQL 5.7 中 GROUP BY 会隐式排序，但 8.0+ 移除了这个行为，需要排序必须写 ORDER BY。"}
]},
{id:21,stage:1,type:"single",tags:["SQL基础","INSERT"],question:"INSERT INTO t VALUES (1,'a'), (2,'b'), (3,'c') 这种写法叫什么？",options:[
{text:"批量插入（Batch Insert）",correct:true,explanation:"一条 INSERT 语句包含多个 VALUES 子句，称为批量插入，比逐行插入性能高很多。"},
{text:"事务插入",correct:false,explanation:"事务插入是指在事务中执行 INSERT，与这种多值语法无关。"},
{text:"并行插入",correct:false,explanation:"并行插入是指多个线程同时插入，这里是单条语句包含多行数据。"},
{text:"替换插入",correct:false,explanation:"替换插入是 REPLACE INTO 语法，不是多值 INSERT。"}
]},
{id:22,stage:1,type:"single",tags:["SQL基础","UPDATE","DELETE"],question:"执行 UPDATE 或 DELETE 时不加 WHERE 条件会怎样？",options:[
{text:"修改或删除表中所有行",correct:true,explanation:"不加 WHERE 条件意味着对所有行生效，这是非常危险的操作，生产环境应开启 safe-updates 模式。"},
{text:"MySQL 会报错阻止执行",correct:false,explanation:"默认情况下 MySQL 不会阻止无 WHERE 的 UPDATE/DELETE，除非开启了 --safe-updates 选项。"},
{text:"只影响第一行",correct:false,explanation:"没有 WHERE 条件时会影响所有行，不是只有第一行。"},
{text:"自动回滚不生效",correct:false,explanation:"如果开启了 autocommit，操作会立即生效且无法自动回滚。"}
]},
{id:23,stage:1,type:"single",tags:["SQL基础","LIMIT"],question:"SELECT * FROM orders ORDER BY id LIMIT 1000000, 20 这条 SQL 为什么慢？",options:[
{text:"MySQL 需要先扫描前 1000020 行再丢弃前 100 万行",correct:true,explanation:"LIMIT offset, count 方式下，MySQL 必须读取 offset+count 行数据，然后丢弃前 offset 行，offset 越大越慢。"},
{text:"ORDER BY 导致全表排序",correct:false,explanation:"如果 id 是主键，ORDER BY id 可以利用主键索引，不需要全表排序。慢的原因是大偏移量。"},
{text:"LIMIT 关键字本身有性能问题",correct:false,explanation:"LIMIT 本身没有性能问题，问题在于大的 offset 值导致需要跳过大量行。"},
{text:"SELECT * 返回了所有列",correct:false,explanation:"虽然 SELECT * 不推荐，但主要性能瓶颈是大偏移量的 LIMIT，不是 SELECT *。"}
]},
{id:24,stage:1,type:"single",tags:["函数","字符串函数"],question:"MySQL 中 CONCAT(NULL, 'abc') 的结果是什么？",options:[
{text:"NULL",correct:true,explanation:"在 MySQL 中，CONCAT 函数的任何参数为 NULL 时，结果就是 NULL。可以用 CONCAT_WS 或 IFNULL 处理。"},
{text:"'abc'",correct:false,explanation:"CONCAT 不会跳过 NULL 参数，只要有一个 NULL 整个结果就是 NULL。"},
{text:"'NULLabc'",correct:false,explanation:"NULL 不会被转换为字符串 'NULL'，CONCAT 遇到 NULL 直接返回 NULL。"},
{text:"空字符串",correct:false,explanation:"NULL 和空字符串不同，CONCAT 遇到 NULL 返回 NULL 而不是空字符串。"}
]},
{id:25,stage:1,type:"single",tags:["函数","日期函数"],question:"获取当前日期和时间的 MySQL 函数是哪个？",options:[
{text:"NOW()",correct:true,explanation:"NOW() 返回当前日期和时间（DATETIME 类型），如 '2024-06-15 14:30:00'。"},
{text:"CURDATE()",correct:false,explanation:"CURDATE() 只返回当前日期（DATE 类型），不包含时间部分。"},
{text:"CURTIME()",correct:false,explanation:"CURTIME() 只返回当前时间（TIME 类型），不包含日期部分。"},
{text:"GETDATE()",correct:false,explanation:"GETDATE() 是 SQL Server 的函数，MySQL 中不存在此函数。"}
]},
{id:26,stage:1,type:"truefalse",tags:["函数","聚合函数"],question:"COUNT(*) 和 COUNT(column) 的结果总是相同的。",options:[
{text:"正确",correct:false,explanation:"当 column 中有 NULL 值时结果不同。COUNT(*) 统计所有行，COUNT(column) 只统计该列非 NULL 的行数。"},
{text:"错误",correct:true,explanation:"COUNT(*) 统计全部行数包括 NULL，COUNT(column) 跳过 NULL 值。如果列中有 NULL，两者结果会不同。"}
]},
{id:27,stage:1,type:"single",tags:["函数","条件函数"],question:"以下哪个函数可以实现类似 if-else 的条件逻辑？",options:[
{text:"CASE WHEN ... THEN ... ELSE ... END",correct:true,explanation:"CASE WHEN 是 SQL 中的标准条件表达式，可以实现多分支条件逻辑，类似编程语言的 if-else。"},
{text:"SWITCH()",correct:false,explanation:"MySQL 中没有 SWITCH 函数，条件逻辑使用 CASE WHEN 或 IF()。"},
{text:"DECODE()",correct:false,explanation:"DECODE 是 Oracle 数据库的函数，MySQL 中不存在（MySQL 的 DECODE 用于解密）。"},
{text:"IIF()",correct:false,explanation:"IIF 是 SQL Server 2012+ 引入的函数，MySQL 中不存在，MySQL 使用 IF() 函数。"}
]},
{id:28,stage:1,type:"multiple",tags:["SQL基础","窗口函数"],question:"以下哪些是 MySQL 8.0+ 支持的窗口函数？（多选）",options:[
{text:"ROW_NUMBER()",correct:true,explanation:"ROW_NUMBER() 为每行分配连续唯一的行号，是最常用的窗口函数之一。"},
{text:"RANK()",correct:true,explanation:"RANK() 用于排名，相同值并列且跳号（如 1,1,3）。"},
{text:"DENSE_RANK()",correct:true,explanation:"DENSE_RANK() 用于排名，相同值并列但不跳号（如 1,1,2）。"},
{text:"ROWNUM",correct:false,explanation:"ROWNUM 是 Oracle 的伪列，MySQL 中不存在，应使用 ROW_NUMBER() 窗口函数。"}
]},
{id:29,stage:1,type:"single",tags:["SQL基础","窗口函数"],question:"窗口函数中 PARTITION BY 的作用是什么？",options:[
{text:"将结果集分成多个分区，在每个分区内独立计算",correct:true,explanation:"PARTITION BY 类似于 GROUP BY 的分组，但不会折叠行，而是在每个分区内独立执行窗口计算。"},
{text:"对结果进行物理分区存储",correct:false,explanation:"PARTITION BY 是逻辑分区用于窗口计算，与表的物理分区（PARTITION 表）无关。"},
{text:"限制返回的行数",correct:false,explanation:"限制行数用 LIMIT，PARTITION BY 用于窗口函数的分组计算。"},
{text:"替代 GROUP BY 的功能",correct:false,explanation:"PARTITION BY 不会折叠行，GROUP BY 会将多行合并为一行，两者行为不同。"}
]},
{id:30,stage:1,type:"single",tags:["数据类型","ENUM"],question:"ENUM 类型在 MySQL 内部以什么方式存储？",options:[
{text:"整数索引",correct:true,explanation:"ENUM 在内部以 1、2、3... 的整数存储每个枚举值，查询时再转换为字符串，存储效率高。"},
{text:"完整的字符串",correct:false,explanation:"ENUM 不是存储完整字符串，而是存储对应的整数索引，节省存储空间。"},
{text:"哈希值",correct:false,explanation:"ENUM 不使用哈希，而是简单的整数编号对应每个枚举值。"},
{text:"二进制位图",correct:false,explanation:"二进制位图是 SET 类型的存储方式（可多选），ENUM 使用整数索引（单选）。"}
]},
{id:31,stage:1,type:"truefalse",tags:["SQL基础","NULL"],question:"在 MySQL 中，NULL = NULL 的结果是 TRUE。",options:[
{text:"正确",correct:false,explanation:"NULL = NULL 的结果是 NULL（未知），不是 TRUE。判断 NULL 应使用 IS NULL 或 IS NOT NULL。"},
{text:"错误",correct:true,explanation:"NULL 代表未知值，任何与 NULL 的比较（包括 NULL = NULL）结果都是 NULL，不是 TRUE 或 FALSE。"}
]},
{id:32,stage:1,type:"single",tags:["数据类型","BIT"],question:"BIT(8) 类型最多能存储多少个二进制位？",options:[
{text:"8 位",correct:true,explanation:"BIT(M) 存储 M 个二进制位，BIT(8) 可存储 8 位即一个字节的二进制数据，值范围 0~255。"},
{text:"8 字节",correct:false,explanation:"BIT(8) 是 8 个二进制位（1 字节），不是 8 字节。8 字节需要 BIT(64)。"},
{text:"256 位",correct:false,explanation:"BIT(M) 的 M 就是位数，BIT(8) 就是 8 位，最大值为 2^8-1=255。"},
{text:"8 个十六进制字符",correct:false,explanation:"BIT(8) 存储的是二进制位，不是十六进制字符。"}
]},
{id:33,stage:1,type:"single",tags:["SQL基础","排序"],question:"ORDER BY 中 NULL 值默认排在什么位置？",options:[
{text:"最前面（ASC 时）",correct:true,explanation:"MySQL 中 NULL 在升序排序时排在最前面（被视为最小值），降序时排在最后面。"},
{text:"最后面（ASC 时）",correct:false,explanation:"在 MySQL 中 NULL 被视为最小值，升序时排在最前面，不是最后面。"},
{text:"被排除在结果之外",correct:false,explanation:"NULL 值不会被 ORDER BY 排除，它会参与排序，在升序时排在最前。"},
{text:"随机位置",correct:false,explanation:"NULL 的排序位置是确定的：升序最前，降序最后。不是随机的。"}
]},
{id:34,stage:1,type:"single",tags:["SQL基础","DISTINCT"],question:"SELECT DISTINCT 的作用是什么？",options:[
{text:"去除结果集中的重复行",correct:true,explanation:"DISTINCT 对 SELECT 的结果集进行去重，比较所有列的值组合，完全相同的行只保留一行。"},
{text:"只返回第一行",correct:false,explanation:"DISTINCT 去除重复行但保留所有不同的行，不是只返回一行，那是 LIMIT 1 的效果。"},
{text:"按唯一索引过滤",correct:false,explanation:"DISTINCT 与索引无关，它是对结果集的后处理操作，任何查询都可以使用。"},
{text:"优化查询性能",correct:false,explanation:"DISTINCT 实际上需要额外的去重操作（排序或哈希），可能降低性能而非优化。"}
]},
{id:35,stage:1,type:"single",tags:["数据类型","YEAR"],question:"YEAR 类型在 MySQL 中占用多少字节？",options:[
{text:"1 字节",correct:true,explanation:"YEAR 类型仅占用 1 字节，可以存储 1901 到 2155 的年份值。"},
{text:"2 字节",correct:false,explanation:"YEAR 只需 1 字节即可表示范围内的年份，不需要 2 字节。"},
{text:"4 字节",correct:false,explanation:"4 字节是 INT 或 TIMESTAMP 的大小，YEAR 只需 1 字节。"},
{text:"8 字节",correct:false,explanation:"8 字节是 BIGINT 或 DATETIME 的大小，YEAR 只需 1 字节。"}
]},
{id:36,stage:1,type:"truefalse",tags:["SQL基础","事务","autocommit"],question:"MySQL 默认开启 autocommit，每条 SQL 语句自动作为一个独立事务提交。",options:[
{text:"正确",correct:true,explanation:"MySQL 默认 autocommit=ON，每条 DML 语句执行后自动提交。显式使用 BEGIN/START TRANSACTION 才会关闭当前会话的自动提交。"},
{text:"错误",correct:false,explanation:"MySQL 确实默认开启 autocommit=ON，这是正确的说法。"}
]},
{id:37,stage:1,type:"single",tags:["SQL基础","LIKE"],question:"LIKE 'abc%' 和 LIKE '%abc%' 在索引使用上有什么区别？",options:[
{text:"'abc%' 可以使用索引，'%abc%' 不能使用索引",correct:true,explanation:"前缀匹配 'abc%' 可以利用 B+ 树索引的有序性。'%abc%' 是中间匹配，无法利用索引，会导致全表扫描。"},
{text:"两者都可以使用索引",correct:false,explanation:"'%abc%' 前面有通配符，B+ 树索引无法确定扫描起点，不能使用索引。"},
{text:"两者都不能使用索引",correct:false,explanation:"'abc%' 是前缀匹配，可以确定索引扫描的起始位置，能使用索引。"},
{text:"取决于表的大小",correct:false,explanation:"与表大小无关，'%abc%' 的前导通配符在逻辑上就无法利用 B+ 树索引的有序性。"}
]},
{id:38,stage:1,type:"single",tags:["SQL基础","EXISTS","IN"],question:"当外表很大、子查询结果集很小时，哪种写法通常更优？",options:[
{text:"IN",correct:true,explanation:"IN 先执行子查询得到较小的结果集，再用结果集过滤大的外表。子查询结果小时 IN 更高效。"},
{text:"EXISTS",correct:false,explanation:"EXISTS 对外表每一行都执行一次子查询检查。外表很大时循环次数多，不如 IN 先获取小结果集。"},
{text:"两者性能完全相同",correct:false,explanation:"在 MySQL 8.0 的优化器中很多情况会自动转换，但特定场景下仍有差异。外大内小时 IN 更优。"},
{text:"都不好，应该用 JOIN",correct:false,explanation:"JOIN 也是一种方案，但题目问的是 IN 和 EXISTS 的比较。外大内小时 IN 通常更优。"}
]},
{id:39,stage:1,type:"single",tags:["数据类型","隐式转换"],question:"以下 SQL 中 WHERE varchar_col = 123 可能导致什么问题？",options:[
{text:"索引失效，因为发生了隐式类型转换",correct:true,explanation:"varchar_col 是字符串类型，与数字 123 比较时 MySQL 会将列值转为数字，导致对每行做函数转换，索引失效。"},
{text:"语法错误",correct:false,explanation:"MySQL 不会报语法错误，它会自动做隐式类型转换，但这会影响索引使用。"},
{text:"返回空结果",correct:false,explanation:"如果有匹配的值（如 '123'），仍然能返回结果，只是不能走索引了。"},
{text:"没有问题，MySQL 会自动处理",correct:false,explanation:"虽然 MySQL 能正确执行，但隐式类型转换会导致索引失效，引起性能问题。"}
]},
{id:40,stage:1,type:"multiple",tags:["SQL基础","DDL"],question:"以下哪些属于 DDL（数据定义语言）语句？（多选）",options:[
{text:"CREATE TABLE",correct:true,explanation:"CREATE TABLE 定义表结构，是典型的 DDL 语句。"},
{text:"ALTER TABLE",correct:true,explanation:"ALTER TABLE 修改表结构（增删列、改类型等），属于 DDL。"},
{text:"INSERT INTO",correct:false,explanation:"INSERT INTO 是 DML（数据操纵语言），用于插入数据而非定义结构。"},
{text:"DROP INDEX",correct:true,explanation:"DROP INDEX 删除索引定义，属于 DDL 语句。"}
]},
{id:41,stage:1,type:"single",tags:["配置","max_connections"],question:"MySQL 默认的最大连接数（max_connections）是多少？",options:[
{text:"151",correct:true,explanation:"MySQL 默认 max_connections=151，生产环境通常需要根据业务负载调大，常见设置为 500~2000。"},
{text:"100",correct:false,explanation:"默认值是 151，不是 100。100 对大多数生产环境来说太小。"},
{text:"1000",correct:false,explanation:"默认值是 151，不是 1000。1000 通常需要手动配置。"},
{text:"无限制",correct:false,explanation:"MySQL 有连接数限制，默认 151，受操作系统文件描述符等资源限制。"}
]},
{id:42,stage:1,type:"truefalse",tags:["SQL基础","TRUNCATE","DELETE"],question:"TRUNCATE TABLE 和 DELETE FROM table（不带 WHERE）的效果完全相同。",options:[
{text:"正确",correct:false,explanation:"虽然都能清空表数据，但 TRUNCATE 是 DDL 操作（重建表），不可回滚，会重置自增计数器。DELETE 是 DML 操作，可回滚，不重置自增。"},
{text:"错误",correct:true,explanation:"TRUNCATE 是 DDL 不可回滚、重置自增、不触发触发器。DELETE 是 DML 可回滚、保留自增值、触发触发器。"}
]},
{id:43,stage:1,type:"single",tags:["函数","IFNULL","COALESCE"],question:"COALESCE(NULL, NULL, 'default', 'other') 的返回值是什么？",options:[
{text:"'default'",correct:true,explanation:"COALESCE 返回参数列表中第一个非 NULL 的值。前两个是 NULL，第三个 'default' 是第一个非 NULL 值。"},
{text:"NULL",correct:false,explanation:"COALESCE 会跳过 NULL 值，返回第一个非 NULL 参数，这里返回 'default'。"},
{text:"'other'",correct:false,explanation:"COALESCE 返回第一个非 NULL 值，'default' 排在 'other' 前面，所以返回 'default'。"},
{text:"空字符串",correct:false,explanation:"COALESCE 返回第一个非 NULL 值 'default'，不是空字符串。"}
]},
{id:44,stage:1,type:"single",tags:["SQL基础","CTE"],question:"MySQL 8.0+ 中 WITH RECURSIVE 用于什么场景？",options:[
{text:"递归查询，如组织架构树、层级数据遍历",correct:true,explanation:"WITH RECURSIVE 定义递归 CTE，通过锚点和递归部分的 UNION ALL 实现层级数据的遍历，如员工上下级关系。"},
{text:"优化查询性能",correct:false,explanation:"WITH RECURSIVE 的主要目的是实现递归逻辑，不是性能优化。"},
{text:"替代子查询",correct:false,explanation:"普通 CTE（WITH 不带 RECURSIVE）可以替代子查询提高可读性，但 RECURSIVE 专门用于递归场景。"},
{text:"创建临时表",correct:false,explanation:"CTE 是查询级别的临时结果集，不是真正的临时表，查询结束后自动消失。"}
]},
{id:45,stage:1,type:"single",tags:["数据类型","SET"],question:"SET 类型和 ENUM 类型的主要区别是什么？",options:[
{text:"SET 可以选多个值，ENUM 只能选一个值",correct:true,explanation:"ENUM 是单选（只能存一个枚举值），SET 是多选（可以存多个值的组合），SET 内部用位图存储。"},
{text:"SET 存储数字，ENUM 存储字符串",correct:false,explanation:"两者都可以存储预定义的字符串值，区别在于单选还是多选。"},
{text:"SET 没有长度限制，ENUM 最多 65535 个值",correct:false,explanation:"SET 最多 64 个成员（因为使用 64 位位图），ENUM 最多 65535 个值。"},
{text:"两者没有区别",correct:false,explanation:"ENUM 是单选，SET 是多选，这是核心区别。"}
]},
{id:46,stage:1,type:"single",tags:["SQL基础","INSERT","ON DUPLICATE KEY"],question:"INSERT ... ON DUPLICATE KEY UPDATE 的作用是什么？",options:[
{text:"插入时如果主键或唯一键冲突则执行更新",correct:true,explanation:"当 INSERT 遇到主键或唯一索引重复时，不报错而是执行 UPDATE 子句更新已有行。实现了 UPSERT 功能。"},
{text:"忽略重复键错误",correct:false,explanation:"忽略重复键错误是 INSERT IGNORE 的功能，ON DUPLICATE KEY UPDATE 是遇到重复时执行更新。"},
{text:"替换已有行",correct:false,explanation:"REPLACE INTO 是删除旧行再插入新行，ON DUPLICATE KEY UPDATE 是更新已有行的指定列。"},
{text:"回滚当前事务",correct:false,explanation:"ON DUPLICATE KEY UPDATE 不会回滚事务，它会正常执行更新操作。"}
]},
{id:47,stage:1,type:"truefalse",tags:["排序规则","utf8mb4_0900_ai_ci"],question:"utf8mb4_0900_ai_ci 排序规则中 ai 表示大小写不敏感，ci 表示重音不敏感。",options:[
{text:"正确",correct:false,explanation:"正好相反。ai 表示 Accent Insensitive（重音不敏感），ci 表示 Case Insensitive（大小写不敏感）。"},
{text:"错误",correct:true,explanation:"ai = Accent Insensitive（重音不敏感），ci = Case Insensitive（大小写不敏感）。两个缩写的含义不能搞混。"}
]},
{id:48,stage:1,type:"single",tags:["函数","窗口函数","LAG","LEAD"],question:"窗口函数 LAG(salary, 1) OVER (ORDER BY id) 的作用是什么？",options:[
{text:"获取当前行的前一行的 salary 值",correct:true,explanation:"LAG(column, N) 获取当前行之前第 N 行的值。LAG(salary,1) 就是前一行的 salary。"},
{text:"获取当前行的后一行的 salary 值",correct:false,explanation:"获取后一行用 LEAD 函数，LAG 是获取前面的行。"},
{text:"对 salary 列求和",correct:false,explanation:"求和用 SUM() OVER()，LAG 是取偏移行的值。"},
{text:"对 salary 列排名",correct:false,explanation:"排名用 RANK() 或 ROW_NUMBER()，LAG 是获取指定偏移位置的行值。"}
]},
{id:49,stage:1,type:"multiple",tags:["配置","mysqld"],question:"以下哪些是 MySQL 服务端程序？（多选）",options:[
{text:"mysqld",correct:true,explanation:"mysqld 是 MySQL 服务器守护进程，是核心服务端程序。"},
{text:"mysqld_safe",correct:true,explanation:"mysqld_safe 是 mysqld 的守护包装脚本，负责启动 mysqld 并在崩溃时自动重启。"},
{text:"mysql",correct:false,explanation:"mysql 是命令行客户端程序，不是服务端程序。"},
{text:"mysqldump",correct:false,explanation:"mysqldump 是备份工具（客户端程序），不是服务端程序。"}
]},
{id:50,stage:1,type:"single",tags:["SQL基础","REPLACE INTO"],question:"REPLACE INTO 在遇到主键冲突时的行为是什么？",options:[
{text:"删除旧行，插入新行",correct:true,explanation:"REPLACE INTO 遇到主键或唯一键冲突时，先删除已存在的行，再插入新行。会触发 DELETE 和 INSERT 的触发器。"},
{text:"更新旧行的列值",correct:false,explanation:"更新旧行是 ON DUPLICATE KEY UPDATE 的行为，REPLACE 是删除再插入。"},
{text:"忽略冲突行",correct:false,explanation:"忽略冲突是 INSERT IGNORE 的行为，REPLACE 会删除旧行再插入新行。"},
{text:"报错回滚",correct:false,explanation:"REPLACE 不会报错，它会自动处理冲突（删除旧行+插入新行）。"}
]}
];
