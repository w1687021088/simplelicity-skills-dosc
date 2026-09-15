var stage4Questions = [
{id:151,stage:4,type:"single",tags:["B+树","索引结构"],question:"InnoDB 使用 B+ 树而不是 B 树作为索引结构的主要原因是什么？",options:[
{text:"B+ 树叶子节点形成有序链表，范围查询效率高",correct:true,explanation:"B+ 树所有数据在叶子节点，叶子通过双向链表连接，范围查询只需遍历链表。B 树数据分布在所有节点，范围查询需中序遍历。"},
{text:"B+ 树的插入删除更简单",correct:false,explanation:"两者插入删除复杂度相似，B+ 树核心优势在于范围查询和磁盘 I/O 效率。"},
{text:"B+ 树占用磁盘空间更小",correct:false,explanation:"B+ 树非叶节点不存数据能容纳更多键使树更矮，但总空间不一定更小。"},
{text:"B+ 树支持并发访问",correct:false,explanation:"并发访问由锁机制控制，不是 B+ 树本身的特性。"}]},
{id:152,stage:4,type:"single",tags:["聚簇索引","二级索引"],question:"InnoDB 二级索引的叶子节点存储的是什么？",options:[
{text:"索引列的值 + 对应行的主键值",correct:true,explanation:"二级索引存储索引列值和主键值，通过主键值再到聚簇索引查找完整行数据（回表）。"},
{text:"索引列的值 + 行数据的物理地址",correct:false,explanation:"存储物理地址是 MyISAM 的做法，InnoDB 二级索引存储主键值。"},
{text:"完整的行数据",correct:false,explanation:"完整行数据只在聚簇索引的叶子节点中。"},
{text:"指向聚簇索引节点的指针",correct:false,explanation:"存储的是主键值（逻辑指针），不是内存/磁盘指针。"}]},
{id:153,stage:4,type:"single",tags:["回表","覆盖索引"],question:"什么是回表查询？如何避免？",options:[
{text:"通过二级索引找到主键后再到聚簇索引查完整行；用覆盖索引避免",correct:true,explanation:"如果查询的列都在二级索引中（覆盖索引），就不需要回表到聚簇索引取数据。"},
{text:"查询结果返回到客户端的过程；用缓存避免",correct:false,explanation:"回表特指索引查询后回到聚簇索引取数据的过程。"},
{text:"多次查询同一张表；用 JOIN 避免",correct:false,explanation:"回表是单次查询内部的索引操作。"},
{text:"全表扫描后回到索引查找；用强制索引避免",correct:false,explanation:"回表方向是二级索引到聚簇索引，不是全表扫描到索引。"}]},
{id:154,stage:4,type:"single",tags:["联合索引","最左前缀"],question:"联合索引 INDEX(a, b, c) 对以下哪个查询无法使用索引？",options:[
{text:"WHERE b = 1 AND c = 2",correct:true,explanation:"联合索引遵循最左前缀原则，必须从最左列 a 开始匹配。跳过 a 直接用 b 和 c 无法利用索引。"},
{text:"WHERE a = 1",correct:false,explanation:"只用最左列 a 可以使用索引。"},
{text:"WHERE a = 1 AND b = 2",correct:false,explanation:"用 a 和 b 可以使用索引前两列。"},
{text:"WHERE a = 1 AND b = 2 AND c = 3",correct:false,explanation:"三列全用，完全匹配联合索引。"}]},
{id:155,stage:4,type:"truefalse",tags:["联合索引","最左前缀"],question:"联合索引 INDEX(a, b, c) 在 WHERE a = 1 AND c = 3（跳过 b）时完全无法使用索引。",options:[
{text:"正确",correct:false,explanation:"a=1 可以利用索引第一列。MySQL 8.0+ 的 Index Skip Scan 还可能进一步利用 c=3。"},
{text:"错误",correct:true,explanation:"至少 a=1 部分可以走索引，不是完全无法使用。"}]},
{id:156,stage:4,type:"single",tags:["索引","索引失效"],question:"以下哪种写法会导致索引失效？",options:[
{text:"WHERE LEFT(name, 3) = 'abc'",correct:true,explanation:"对索引列使用函数会导致索引失效。应改为 WHERE name LIKE 'abc%'。"},
{text:"WHERE name = 'abc'",correct:false,explanation:"直接等值比较可以正常使用索引。"},
{text:"WHERE name LIKE 'abc%'",correct:false,explanation:"前缀 LIKE 可以使用索引。"},
{text:"WHERE name IN ('abc', 'def')",correct:false,explanation:"IN 查询可以使用索引。"}]},
{id:157,stage:4,type:"multiple",tags:["索引","索引失效"],question:"以下哪些情况会导致索引失效？（多选）",options:[
{text:"对索引列进行隐式类型转换",correct:true,explanation:"隐式类型转换导致 MySQL 对列值做函数转换，无法利用索引有序性。"},
{text:"对索引列使用 OR 连接非索引列",correct:true,explanation:"OR 的非索引条件可能导致整体退化为全表扫描。"},
{text:"在索引列上使用 != 或 NOT IN",correct:true,explanation:"不等于条件需扫描大部分索引，优化器通常选择全表扫描。"},
{text:"对索引列使用 IS NULL",correct:false,explanation:"IS NULL 可以使用索引，InnoDB 索引中 NULL 值存储在 B+ 树最前面。"}]},
{id:158,stage:4,type:"single",tags:["EXPLAIN","type"],question:"EXPLAIN 输出中 type 列的值从好到差的排序是什么？",options:[
{text:"system > const > eq_ref > ref > range > index > ALL",correct:true,explanation:"system（一行）、const（主键等值）、eq_ref（JOIN主键）、ref（非唯一索引）、range（范围扫描）、index（全索引扫描）、ALL（全表扫描）。"},
{text:"ALL > index > range > ref > eq_ref > const > system",correct:false,explanation:"这是从差到好的顺序，与题目要求相反。"},
{text:"const > eq_ref > ALL > ref > range > index > system",correct:false,explanation:"顺序错误，ALL 是最差的。"},
{text:"ref > range > index > ALL > const > eq_ref > system",correct:false,explanation:"顺序完全错误。"}]},
{id:159,stage:4,type:"single",tags:["EXPLAIN","Extra"],question:"EXPLAIN 的 Extra 列显示 Using filesort 表示什么？",options:[
{text:"MySQL 需要额外排序操作，无法通过索引获得有序结果",correct:true,explanation:"说明 ORDER BY 的列没有合适索引，需要额外排序。可通过创建覆盖 ORDER BY 的索引消除。"},
{text:"查询结果被写入文件",correct:false,explanation:"filesort 是排序算法名称，不是指写入文件。"},
{text:"查询使用了临时文件",correct:false,explanation:"临时文件是 Using temporary 的含义。"},
{text:"查询性能很好",correct:false,explanation:"Using filesort 通常是需要优化的信号。"}]},
{id:160,stage:4,type:"single",tags:["EXPLAIN","Extra"],question:"EXPLAIN 中 Extra 显示 Using index 表示什么？",options:[
{text:"查询使用了覆盖索引，不需要回表",correct:true,explanation:"所有需要的列都在索引中，直接从索引读取数据，不需要回到聚簇索引。"},
{text:"查询使用了索引",correct:false,explanation:"使用索引但回表时不会显示 Using index，这特指覆盖索引。"},
{text:"查询使用了全索引扫描",correct:false,explanation:"全索引扫描在 type 列显示为 index。"},
{text:"MySQL 自动创建了索引",correct:false,explanation:"MySQL 不会自动创建索引。"}]},
{id:161,stage:4,type:"single",tags:["索引","前缀索引"],question:"对长字符串列创建前缀索引时，如何确定合适的前缀长度？",options:[
{text:"计算不同前缀长度的选择性，选择接近完整列选择性的最短前缀",correct:true,explanation:"选择性 = COUNT(DISTINCT LEFT(col, N)) / COUNT(*)，找到选择性达到 90% 以上的最小 N。"},
{text:"固定使用 10 个字符",correct:false,explanation:"合适的前缀长度取决于数据分布，不能一刀切。"},
{text:"使用列定义长度的一半",correct:false,explanation:"前缀长度与列定义长度没有固定比例关系。"},
{text:"越长越好",correct:false,explanation:"前缀太长降低空间效率，需要找平衡点。"}]},
{id:162,stage:4,type:"single",tags:["索引","索引下推"],question:"索引下推（ICP）的作用是什么？",options:[
{text:"在存储引擎层用索引中的列过滤数据，减少回表次数",correct:true,explanation:"有 ICP 后存储引擎直接用索引中的列做过滤，不满足条件的行不回表，减少 I/O。"},
{text:"将查询条件下推到数据库服务器执行",correct:false,explanation:"ICP 是 Server 层到存储引擎层的条件下推。"},
{text:"将 JOIN 条件下推到子查询中",correct:false,explanation:"这是另一种优化，与 ICP 不同。"},
{text:"自动创建缺失的索引",correct:false,explanation:"ICP 不创建索引，优化的是现有索引的使用方式。"}]},
{id:163,stage:4,type:"truefalse",tags:["索引","不可见索引"],question:"MySQL 8.0 的不可见索引设置为 INVISIBLE 后会被自动删除。",options:[
{text:"正确",correct:false,explanation:"INVISIBLE 只让优化器忽略该索引，索引仍然存在并随数据变更维护。"},
{text:"错误",correct:true,explanation:"不可见索引不会被删除，仍占空间且持续维护。目的是安全测试删除索引的影响。"}]},
{id:164,stage:4,type:"single",tags:["索引","降序索引"],question:"MySQL 8.0 真正支持降序索引的意义是什么？",options:[
{text:"对于 ORDER BY a ASC, b DESC 的混合排序可以避免 filesort",correct:true,explanation:"8.0 真正支持后，联合索引(a ASC, b DESC)可以直接匹配混合排序。"},
{text:"降序索引查询更快",correct:false,explanation:"不是说查询速度更快，而是在混合排序场景下避免 filesort。"},
{text:"节省存储空间",correct:false,explanation:"降序索引不节省空间。"},
{text:"支持逆序扫描",correct:false,explanation:"B+ 树本身就支持正反两个方向扫描。"}]},
{id:165,stage:4,type:"single",tags:["查询优化","慢查询"],question:"如何找到 MySQL 中执行较慢的 SQL？",options:[
{text:"开启慢查询日志，设置 long_query_time 阈值",correct:true,explanation:"slow_query_log=ON 开启，long_query_time 设阈值（建议 1-2 秒），超过阈值的 SQL 记录到日志。"},
{text:"查看 Binlog",correct:false,explanation:"Binlog 记录数据变更，不包含查询执行时间信息。"},
{text:"查看错误日志",correct:false,explanation:"错误日志记录错误和警告，不记录慢查询。"},
{text:"使用 SHOW DATABASES",correct:false,explanation:"SHOW DATABASES 只显示数据库列表。"}]},
{id:166,stage:4,type:"single",tags:["查询优化","优化器提示"],question:"MySQL 8.0 优化器提示的正确语法是什么？",options:[
{text:"SELECT /*+ NO_INDEX(t idx) */ ... 放在 SELECT 后的注释中",correct:true,explanation:"优化器提示使用 /*+ hint */ 语法，放在 SELECT 关键字之后。"},
{text:"SELECT ... FORCE INDEX (idx)",correct:false,explanation:"FORCE INDEX 是旧式索引提示，优化器提示用 /*+ ... */ 格式。"},
{text:"SET optimizer_hint = 'NO_INDEX'",correct:false,explanation:"优化器提示不是通过 SET 变量设置的。"},
{text:"SELECT ... WITH HINT NO_INDEX",correct:false,explanation:"MySQL 不支持 WITH HINT 语法。"}]},
{id:167,stage:4,type:"multiple",tags:["EXPLAIN","EXPLAIN ANALYZE"],question:"关于 EXPLAIN ANALYZE（8.0.18+），哪些说法正确？（多选）",options:[
{text:"实际执行查询并返回每个操作的真实耗时",correct:true,explanation:"EXPLAIN ANALYZE 真正执行查询并测量每个步骤的实际时间和行数。"},
{text:"输出中包含预估行数和实际行数的对比",correct:true,explanation:"可以对比 estimated rows 和 actual rows，差距大说明统计信息不准。"},
{text:"不会修改数据，对 UPDATE/DELETE 也安全",correct:false,explanation:"EXPLAIN ANALYZE 会真正执行 SQL，对 DML 使用时要小心。"},
{text:"可以用于分析查询性能瓶颈",correct:true,explanation:"查看每个操作节点的实际耗时，精确定位最耗时的步骤。"}]},
{id:168,stage:4,type:"single",tags:["索引","多值索引"],question:"MySQL 8.0 的多值索引（Multi-Valued Index）用于什么场景？",options:[
{text:"对 JSON 数组中的元素建索引，加速 MEMBER OF 查询",correct:true,explanation:"多值索引对 JSON 列中的数组元素建索引，使 MEMBER OF()、JSON_CONTAINS() 等查询走索引。"},
{text:"一个索引覆盖多个列",correct:false,explanation:"覆盖多列是联合索引。"},
{text:"一个列同时建多种类型的索引",correct:false,explanation:"多值索引是对数组中每个元素都建索引条目。"},
{text:"支持模糊匹配的索引",correct:false,explanation:"模糊匹配用全文索引。"}]},
{id:169,stage:4,type:"single",tags:["查询优化","子查询优化"],question:"MySQL 优化器对 IN 子查询的常见优化策略是什么？",options:[
{text:"将 IN 子查询转换为 semi-join（半连接）",correct:true,explanation:"MySQL 8.0 会将 WHERE col IN (SELECT ...) 转换为 semi-join，使用 FirstMatch 等策略优化。"},
{text:"将子查询结果缓存到临时表",correct:false,explanation:"物化是 semi-join 的一种策略，但不是唯一的。"},
{text:"将 IN 转换为 EXISTS",correct:false,explanation:"8.0 优化器更倾向于 semi-join 优化。"},
{text:"忽略子查询直接全表扫描",correct:false,explanation:"优化器不会忽略子查询。"}]},
{id:170,stage:4,type:"single",tags:["索引","函数索引"],question:"MySQL 8.0 的函数索引如何创建？",options:[
{text:"CREATE INDEX idx ON t((UPPER(name)))",correct:true,explanation:"函数索引表达式用双括号包裹：((expression))。之后 WHERE UPPER(name)='ABC' 可走索引。"},
{text:"CREATE INDEX idx ON t(UPPER(name))",correct:false,explanation:"缺少外层括号，函数索引的表达式必须用双括号。"},
{text:"CREATE FUNCTION INDEX idx ON t(name)",correct:false,explanation:"没有 CREATE FUNCTION INDEX 语法。"},
{text:"ALTER TABLE t ADD FUNCTIONAL INDEX(name)",correct:false,explanation:"没有 FUNCTIONAL INDEX 语法。"}]},
{id:171,stage:4,type:"single",tags:["MySQL 8.4","binlog_format"],question:"MySQL 8.4 中 binlog_format 参数的状态是什么？",options:[
{text:"已移除，Binlog 格式固定为 ROW",correct:true,explanation:"binlog_format 在 8.4 中完全移除，所有 Binlog 固定使用 ROW 格式。"},
{text:"默认 ROW，可以改为 STATEMENT",correct:false,explanation:"8.4 中该参数已被移除，不能修改。"},
{text:"默认 MIXED",correct:false,explanation:"8.4 没有 binlog_format 参数了。"},
{text:"新增了 JSON 格式选项",correct:false,explanation:"MySQL 没有 JSON 格式的 Binlog。"}]},
{id:172,stage:4,type:"single",tags:["MySQL 8.4","mysql_native_password"],question:"MySQL 8.4 中 mysql_native_password 认证插件的状态是什么？",options:[
{text:"默认禁用，需手动启用",correct:true,explanation:"8.4 中默认禁用。如需使用，在 my.cnf 中添加 mysql_native_password=ON。"},
{text:"完全移除，无法使用",correct:false,explanation:"8.4 是默认禁用不是完全移除，9.0 才完全移除。"},
{text:"仍然是默认认证插件",correct:false,explanation:"默认从 8.0 起就是 caching_sha2_password。"},
{text:"改名为 mysql_password",correct:false,explanation:"插件没有改名。"}]},
{id:173,stage:4,type:"multiple",tags:["MySQL 8.4","移除特性"],question:"以下哪些参数在 MySQL 8.4 中已被移除？（多选）",options:[
{text:"innodb_log_file_size",correct:true,explanation:"已移除，被 innodb_redo_log_capacity 取代。"},
{text:"binlog_format",correct:true,explanation:"已移除，固定为 ROW。"},
{text:"innodb_buffer_pool_size",correct:false,explanation:"仍然存在且非常重要。"},
{text:"innodb_change_buffering",correct:true,explanation:"已移除，固定为 none。"}]},
{id:174,stage:4,type:"single",tags:["MySQL 8.4","复制语法"],question:"MySQL 8.4 中查看主库 Binlog 位置用什么命令？",options:[
{text:"SHOW BINARY LOG STATUS",correct:true,explanation:"SHOW MASTER STATUS 在 8.4 中已移除，替换为 SHOW BINARY LOG STATUS。"},
{text:"SHOW MASTER STATUS",correct:false,explanation:"在 8.4 中已移除。"},
{text:"SELECT @@binlog_position",correct:false,explanation:"没有此系统变量。"},
{text:"SHOW BINLOG EVENTS",correct:false,explanation:"显示的是 Binlog 事件内容，不是当前写入位置。"}]},
{id:175,stage:4,type:"single",tags:["MySQL 8.4","Instant DDL"],question:"MySQL 8.0 的 INSTANT DDL 主要优化了哪种操作？",options:[
{text:"在表末尾添加新列",correct:true,explanation:"INSTANT DDL 使在表末尾添加列时只修改元数据，不重建表，几乎瞬间完成。"},
{text:"修改列的数据类型",correct:false,explanation:"修改数据类型需要逐行转换，不能用 INSTANT。"},
{text:"删除索引",correct:false,explanation:"删除索引不属于 INSTANT DDL 范畴。"},
{text:"重命名表",correct:false,explanation:"RENAME TABLE 本身就很快。"}]},
{id:176,stage:4,type:"truefalse",tags:["MySQL 8.4","LTS"],question:"MySQL 8.4 LTS 的支持周期为至少 8 年。",options:[
{text:"正确",correct:true,explanation:"LTS 版本提供 5 年 Premier Support + 3 年 Extended Support，总计 8 年以上。"},
{text:"错误",correct:false,explanation:"MySQL 8.4 LTS 确实有 8 年以上支持周期。"}]},
{id:177,stage:4,type:"single",tags:["查询优化","ORDER BY"],question:"如何让 ORDER BY 直接利用索引而不需要 filesort？",options:[
{text:"ORDER BY 的列和方向与索引完全匹配",correct:true,explanation:"如果 ORDER BY 列是索引前缀且方向一致，MySQL 可以直接沿索引顺序读取。"},
{text:"ORDER BY 使用主键",correct:false,explanation:"如果有 WHERE 条件走了其他索引，ORDER BY 主键仍可能 filesort。"},
{text:"只要表上有索引就行",correct:false,explanation:"索引必须与 ORDER BY 的列和方向匹配。"},
{text:"使用 LIMIT 限制结果数量",correct:false,explanation:"LIMIT 不能消除 filesort。"}]},
{id:178,stage:4,type:"single",tags:["查询优化","延迟关联"],question:"深度分页 LIMIT 1000000, 20 的推荐优化方式是什么？",options:[
{text:"延迟关联：先查主键再 JOIN 获取完整数据",correct:true,explanation:"子查询只扫描索引取主键（覆盖索引），再 JOIN 取全部列，避免跳过百万行完整数据。"},
{text:"增加 innodb_buffer_pool_size",correct:false,explanation:"增大 Buffer Pool 不能解决大 offset 需要跳过大量行的问题。"},
{text:"给所有列建索引",correct:false,explanation:"全列索引浪费空间且不实际。"},
{text:"使用 SQL_NO_CACHE",correct:false,explanation:"已在 8.0 废弃，且与分页性能无关。"}]},
{id:179,stage:4,type:"single",tags:["索引","索引设计"],question:"频繁更新的列是否适合建索引？",options:[
{text:"不太适合，每次更新都需同步维护索引增加写入开销",correct:true,explanation:"索引列更新时 B+ 树需要调整，写入性能下降。需权衡读写比。"},
{text:"非常适合，更新操作会更快",correct:false,explanation:"索引加速查询但增加更新开销。"},
{text:"完全不影响",correct:false,explanation:"索引对写入性能有明显影响。"},
{text:"索引只影响 SELECT，不影响 UPDATE",correct:false,explanation:"UPDATE 修改索引列值时索引必须同步更新。"}]},
{id:180,stage:4,type:"single",tags:["查询优化","ANALYZE TABLE"],question:"ANALYZE TABLE 的作用是什么？",options:[
{text:"更新表的统计信息帮助优化器选择更好的执行计划",correct:true,explanation:"重新计算索引基数等统计信息，统计不准会导致执行计划差。"},
{text:"分析表结构并给出优化建议",correct:false,explanation:"ANALYZE TABLE 只更新统计信息，不给优化建议。"},
{text:"检查表数据的完整性",correct:false,explanation:"检查完整性用 CHECK TABLE。"},
{text:"优化表的物理存储",correct:false,explanation:"碎片整理用 OPTIMIZE TABLE。"}]},
{id:181,stage:4,type:"single",tags:["窗口函数","LAG"],question:"窗口函数 LAG(salary, 1) OVER (ORDER BY id) 的作用是什么？",options:[
{text:"获取当前行的前一行的 salary 值",correct:true,explanation:"LAG(column, N) 获取当前行之前第 N 行的值，常用于计算环比。"},
{text:"获取后一行的 salary 值",correct:false,explanation:"获取后一行用 LEAD 函数。"},
{text:"对 salary 列求和",correct:false,explanation:"求和用 SUM() OVER()。"},
{text:"对 salary 列排名",correct:false,explanation:"排名用 RANK()。"}]},
{id:182,stage:4,type:"truefalse",tags:["MySQL 8.4","CTE"],question:"MySQL 8.0+ 的 CTE 在被多次引用时会自动物化（只执行一次）。",options:[
{text:"正确",correct:false,explanation:"MySQL 的 CTE 默认不保证物化，优化器可能将 CTE 合并到外层查询中。"},
{text:"错误",correct:true,explanation:"MySQL 优化器可能选择合并或物化，不保证物化。可用提示强制物化。"}]},
{id:183,stage:4,type:"single",tags:["索引","哈希索引"],question:"MEMORY 引擎默认使用什么索引类型？",options:[
{text:"Hash 索引",correct:true,explanation:"MEMORY 引擎默认 Hash 索引，等值查询 O(1)，但不支持范围查询。"},
{text:"B+ 树索引",correct:false,explanation:"MEMORY 默认是 Hash，但也支持指定 USING BTREE。"},
{text:"全文索引",correct:false,explanation:"MEMORY 引擎不支持全文索引。"},
{text:"空间索引",correct:false,explanation:"MEMORY 引擎不支持空间索引。"}]},
{id:184,stage:4,type:"single",tags:["索引","全文索引"],question:"MySQL 全文搜索的正确语法是什么？",options:[
{text:"MATCH(col) AGAINST('keyword' IN NATURAL LANGUAGE MODE)",correct:true,explanation:"NATURAL LANGUAGE MODE 是默认模式，按关键词相关性排序。"},
{text:"WHERE col CONTAINS 'keyword'",correct:false,explanation:"CONTAINS 是 SQL Server 语法。"},
{text:"WHERE FULLTEXT(col, 'keyword')",correct:false,explanation:"没有 FULLTEXT() 函数。"},
{text:"SELECT SEARCH(col, 'keyword')",correct:false,explanation:"没有 SEARCH 函数。"}]},
{id:185,stage:4,type:"single",tags:["MySQL 8.4","JSON_TABLE"],question:"JSON_TABLE() 函数的作用是什么？",options:[
{text:"将 JSON 数据转换为关系型表格",correct:true,explanation:"JSON_TABLE 将 JSON 数组/对象展开为虚拟表，在 FROM 子句中使用。"},
{text:"将表数据导出为 JSON 格式",correct:false,explanation:"导出 JSON 用 JSON_ARRAYAGG/JSON_OBJECTAGG。"},
{text:"创建存储 JSON 数据的表",correct:false,explanation:"创建表用 CREATE TABLE。"},
{text:"验证 JSON 数据的格式",correct:false,explanation:"验证用 JSON_VALID()。"}]},
{id:186,stage:4,type:"single",tags:["查询优化","OPTIMIZE TABLE"],question:"OPTIMIZE TABLE 的主要作用是什么？",options:[
{text:"回收删除操作留下的碎片空间，重建表和索引",correct:true,explanation:"DELETE 后空间不会立即归还 OS，OPTIMIZE TABLE 重建表回收碎片空间。"},
{text:"优化查询性能",correct:false,explanation:"查询优化用索引和 EXPLAIN 分析。"},
{text:"更新统计信息",correct:false,explanation:"更新统计信息用 ANALYZE TABLE。"},
{text:"检查表的完整性",correct:false,explanation:"检查完整性用 CHECK TABLE。"}]},
{id:187,stage:4,type:"single",tags:["MySQL 8.4","authentication_policy"],question:"MySQL 8.4 中 authentication_policy 替代了哪个旧参数？",options:[
{text:"default_authentication_plugin",correct:true,explanation:"default_authentication_plugin 在 8.4 中被移除，替换为 authentication_policy。"},
{text:"caching_sha2_password",correct:false,explanation:"这是认证插件名称，不是参数名。"},
{text:"validate_password",correct:false,explanation:"这是密码验证组件。"},
{text:"mysql_native_password",correct:false,explanation:"这是认证插件名称。"}]},
{id:188,stage:4,type:"truefalse",tags:["索引","索引合并"],question:"MySQL 优化器可以在单表查询中同时使用多个索引（索引合并）。",options:[
{text:"正确",correct:true,explanation:"Index Merge 允许对单表使用多个索引后合并结果。"},
{text:"错误",correct:false,explanation:"MySQL 确实支持 Index Merge，在 EXPLAIN 中显示为 index_merge。"}]},
{id:189,stage:4,type:"single",tags:["查询优化","Hash Join"],question:"MySQL 8.0.18+ 的 Hash Join 适用于什么场景？",options:[
{text:"没有索引可用的等值 JOIN",correct:true,explanation:"无索引 JOIN 时 Hash Join 比 Nested Loop 更高效，先将小表构建哈希表再用大表探测。"},
{text:"所有 JOIN 查询",correct:false,explanation:"有索引的 JOIN 仍用 Nested Loop + 索引查找。"},
{text:"只有子查询",correct:false,explanation:"不限于子查询。"},
{text:"只有 LEFT JOIN",correct:false,explanation:"适用于多种连接类型。"}]},
{id:190,stage:4,type:"single",tags:["MySQL 8.4","复制命令"],question:"MySQL 8.4 中配置复制源的正确命令是什么？",options:[
{text:"CHANGE REPLICATION SOURCE TO SOURCE_HOST='...'",correct:true,explanation:"CHANGE MASTER TO 在 8.4 已移除，必须使用 CHANGE REPLICATION SOURCE TO。"},
{text:"CHANGE MASTER TO MASTER_HOST='...'",correct:false,explanation:"在 8.4 中已移除。"},
{text:"SET REPLICATION SOURCE '...'",correct:false,explanation:"没有此语法。"},
{text:"ALTER REPLICATION SOURCE_HOST='...'",correct:false,explanation:"没有此语法。"}]},
{id:191,stage:4,type:"single",tags:["索引","索引选择性"],question:"什么是索引的选择性？",options:[
{text:"不同值数量/总行数，越接近1区分度越高",correct:true,explanation:"接近1表示几乎每行不同（如主键），索引效果好。接近0表示区分度低。"},
{text:"索引大小/表大小",correct:false,explanation:"这是索引占比。"},
{text:"使用索引的查询数/总查询数",correct:false,explanation:"这是索引使用率。"},
{text:"索引列的数量",correct:false,explanation:"这是联合索引的宽度。"}]},
{id:192,stage:4,type:"single",tags:["MySQL 8.4","explain_format"],question:"explain_format 系统变量的作用是什么？",options:[
{text:"设置 EXPLAIN 的默认输出格式（TRADITIONAL/JSON/TREE）",correct:true,explanation:"设置后 EXPLAIN 不需要每次指定 FORMAT，默认使用设定格式。"},
{text:"格式化 SQL 语句",correct:false,explanation:"explain_format 控制 EXPLAIN 输出格式。"},
{text:"控制慢查询日志格式",correct:false,explanation:"慢查询日志格式由 log_output 控制。"},
{text:"设置 Binlog 记录格式",correct:false,explanation:"Binlog 格式在 8.4 中固定为 ROW。"}]},
{id:193,stage:4,type:"single",tags:["查询优化","sort_buffer_size"],question:"sort_buffer_size 参数的作用是什么？",options:[
{text:"为每个需要排序的会话分配的排序缓冲区大小",correct:true,explanation:"每个需要 filesort 的会话独立分配此大小的内存进行排序。"},
{text:"全局排序缓存的总大小",correct:false,explanation:"sort_buffer_size 是每个会话独立分配的。"},
{text:"Buffer Pool 中用于排序的区域",correct:false,explanation:"与 Buffer Pool 无关。"},
{text:"ORDER BY 结果集的最大行数",correct:false,explanation:"这是内存大小（字节），不限制行数。"}]},
{id:194,stage:4,type:"multiple",tags:["MySQL 8.4","内存管理"],question:"以下哪些是 MySQL 8.0.28+ 新增的内存管理参数？（多选）",options:[
{text:"connection_memory_limit",correct:true,explanation:"限制单个连接的内存使用上限。"},
{text:"global_connection_memory_limit",correct:true,explanation:"限制所有连接的总内存使用上限。"},
{text:"innodb_buffer_pool_size",correct:false,explanation:"很早就存在了。"},
{text:"global_connection_memory_tracking",correct:true,explanation:"控制是否启用全局连接内存追踪。"}]},
{id:195,stage:4,type:"single",tags:["查询优化","join_buffer_size"],question:"join_buffer_size 在什么情况下被使用？",options:[
{text:"JOIN 操作无法使用索引时用于 Block Nested Loop 或 Hash Join",correct:true,explanation:"无索引 JOIN 时用 join_buffer 缓存外表行块，批量与内表匹配。"},
{text:"所有 JOIN 查询都使用",correct:false,explanation:"有索引的 JOIN 直接走索引查找。"},
{text:"存储 JOIN 结果集",correct:false,explanation:"join_buffer 用于缓存参与 JOIN 的行数据。"},
{text:"替代 Buffer Pool",correct:false,explanation:"两者是不同的内存区域。"}]},
{id:196,stage:4,type:"single",tags:["索引","索引设计"],question:"对于 WHERE a=? AND b>? ORDER BY b，最优联合索引是什么？",options:[
{text:"INDEX(a, b)",correct:true,explanation:"a 等值放前面精确定位，b 在 a 确定后有序，既满足范围查询又满足 ORDER BY。"},
{text:"INDEX(b, a)",correct:false,explanation:"b 放前面时范围查询后 a 等值条件无法有效利用。"},
{text:"INDEX(a) + INDEX(b)",correct:false,explanation:"两个单列索引不如一个联合索引高效。"},
{text:"INDEX(a, b, c)",correct:false,explanation:"查询中没有 c 列，加入 c 无意义。"}]},
{id:197,stage:4,type:"truefalse",tags:["MySQL 8.4","replica_parallel_type"],question:"MySQL 8.4 中 replica_parallel_type 仍然可以设置为 DATABASE。",options:[
{text:"正确",correct:false,explanation:"该参数在 8.4 中已移除，固定为 LOGICAL_CLOCK。"},
{text:"错误",correct:true,explanation:"已被完全移除，多线程复制固定使用 LOGICAL_CLOCK。"}]},
{id:198,stage:4,type:"single",tags:["索引","ANALYZE TABLE"],question:"什么时候应该使用 ANALYZE TABLE？",options:[
{text:"表数据发生大量变化后（如大批量导入或删除）",correct:true,explanation:"大批量数据变更后统计信息可能不准，手动 ANALYZE TABLE 立即更新。"},
{text:"每次查询前都执行一次",correct:false,explanation:"有一定开销，不应频繁执行。"},
{text:"只在创建索引时执行一次",correct:false,explanation:"数据变化后需要重新更新。"},
{text:"永远不需要手动执行",correct:false,explanation:"某些场景需要手动执行确保准确。"}]},
{id:199,stage:4,type:"single",tags:["窗口函数","CUME_DIST"],question:"窗口函数 CUME_DIST() 返回什么？",options:[
{text:"当前行在分区中的累计分布比例",correct:true,explanation:"CUME_DIST = 排名<=当前行的行数/分区总行数，结果范围 0~1。"},
{text:"当前行的行号",correct:false,explanation:"行号用 ROW_NUMBER()。"},
{text:"当前行的排名",correct:false,explanation:"排名用 RANK()。"},
{text:"窗口内的行数",correct:false,explanation:"行数用 COUNT() OVER()。"}]},
{id:200,stage:4,type:"single",tags:["查询优化","慢查询分析"],question:"mysqldumpslow 工具的作用是什么？",options:[
{text:"汇总分析慢查询日志，找出最频繁和最慢的 SQL",correct:true,explanation:"解析慢查询日志，按执行次数、平均耗时等排序，快速定位需要优化的 SQL。"},
{text:"导出 MySQL 数据库",correct:false,explanation:"导出数据用 mysqldump。"},
{text:"清理慢查询日志",correct:false,explanation:"清理日志用 FLUSH SLOW LOGS。"},
{text:"自动优化慢查询",correct:false,explanation:"只分析定位问题，不自动优化。"}]}
];
