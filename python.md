# Python基础

## 字符串对象

### 用法

``` python
s = "hello world"
print(s) # hello world
print(f'{s = }') # s = 'hello world'
```

拼接

``` python
print('12' + '0') # 120
```

复制

``` py
print('12' * 3) # 121212
```

索引

``` py
s = "hello world"
print(s[0]) # h
print(s[1]) # e
print(s[2]) # l
print(s[3]) # l
print(s[4]) # o
```

反向索引

``` python
s = "hello world"
print(s[-1]) # d
print(s[-2]) # l
print(s[-3]) # r
print(s[-4]) # o
print(s[-5]) # w
```

切片

``` python
s = "0123456789"
print(s[0]) # 0 从 0 开始切取到 1（不包含 1）
print(s[0:5]) # 01234 从 0 开始切取到 5（不包含 5）
print(s[5:10]) # 56789 从 5 开始切取到 10（不包含 10）
print(s[0:10]) # 0123456789 从 0 开始切取到 10（不包含 10）
print(s[0:]) # 0123456789 从 0 开始切取到末尾
print(s[0:10:2]) # 02468 从 0 开始切取到 10（不包含 10），步长为 2
print(s[::2]) # 02468 反向切片
print(s[::-1]) # 9876543210 反向切片
```

### 方法

#### replace

`replace` 方法用于替换字符串中的指定字符，返回替换后的字符串(`不会修改原字符串，会返回一个新的字符串副本`)。

`old` -- 指定要被替换的字符。

`new` -- 指定替换后的字符。

`count` -- 指定替换的次数，可选参数。

``` python
s = "hello world"

print(s.replace("world", "python")) # hello python

print(s.replace('l', 'w', 1)) # hewlo world 替换第一个 l 为 w
```

#### find

`find` 方法用于查找字符串中指定字符的索引，返回指定字符的索引(`如果找到多个指定字符，返回第一个指定字符的索引`)，如果未找到则返回 -1。

`value` -- 指定要查找的字符。

`start` -- 指定开始查找的索引，可选参数。

`end` -- 指定结束查找的索引，可选参数。

``` python
s = "0123456789"
print(s.find("0")) # 0
print(s.find("1")) # 1
print(s.find("2")) # 2
print(s.find("3")) # 3
print(s.find("4")) # 4
print(s.find("5")) # 5
print(s.find("6")) # 6
print(s.find("7")) # 7
print(s.find("8")) # 8
print(s.find("9")) # 9
print(s.find("10")) # -1 未找到返回 -1

print(s.find('8', 7, 9)) # 8 查找 8，从索引 7 开始，到索引 9 结束
```

#### count

`count` 方法用于统计字符串中指定字符的个数，返回指定字符的个数。

`count` 方法的语法如下：

`s.count(value, start, end)` -- `value` -- 指定要统计的字符，`start` -- 指定开始统计的索引，`end` -- 指定结束统计的索引。

``` python
s = "0123456789"

print(s.count("0")) # 1
print(s.count("1")) # 1
print(s.count("2")) # 1
print(s.count("3")) # 1
print(s.count("4")) # 1
print(s.count("5")) # 1
print(s.count("6")) # 1
print(s.count("7")) # 1
print(s.count("8")) # 1
print(s.count("9")) # 1
```

#### split

`split` 方法用于将字符串按照指定字符切分成一个列表。

`s.split(value, count)` -- `value` -- 指定分隔符，`count` -- 指定切分次数。

``` python
s = "01223"
print(s.split("0")) # ['', '1223'] 按照 0 切分成一个列表 首位切割后会为空字符串
print(s.split("3")) # ['0122', ''] 按照 3 切分成一个列表 末尾切割后会为空字符串
print(s.split("1")) # ['0', '223'] 按照 1 切分成一个列表 
print(s.split("2")) # ['01', '', '3'] 按照 2 切分成一个列表
print(s.split("2", 1)) # ['01', '23']

```

#### partition

`partition` 方法用于将字符串按照指定字符切分成一个元组，元组包含三个元素，分别是指定字符之前的部分、指定字符、指定字符之后的部分。

`s.partition(value)` -- `value` -- 指定分隔符。

用法和 split 类似，但 partition 会返回一个元组，包含三个元素，分别是指定字符之前的部分、指定字符、指定字符之后的部分。

``` py
s = "0123456789"
print(s.partition("0")) # ('', '0', '123456789') 按照 0 切分成一个元组
print(s.partition("9")) # ('012345678', '9', '') 按照 9 切分成一个元组
print(s.partition("1")) # ('0', '1', '23456789') 按照 1 切分成一个元组
```

#### upper和lower

`upper` 方法用于将字符串中的所有小写字母转换为大写字母，返回转换后的字符串(`不会修改原字符串，会返回一个新的字符串副本`)。

`lower` 方法用于将字符串中的所有大写字母转换为小写字母，返回转换后的字符串(`不会修改原字符串，会返回一个新的字符串副本`)。

``` python
s = "hello world"

print(s.upper()) # HELLO WORLD
print(s.lower()) # hello world
```

#### strip和lstrip和rstrip

`strip` 方法用于去除字符串两端的指定字符，默认去除空格。也可以用来删除字符串两端的指定字符。

`lstrip` 方法用于去除字符串左端的指定字符，默认去除空格。

`rstrip` 方法用于去除字符串右端的指定字符，默认去除空格。

``` py
s = "   hello world   "

print(s.strip()) # 'hello world' 去除两端空格
print(s.strip(" ")) # 'hello world' 去除两端空格
print(s.strip("h")) # '  ello world   ' 去除两端 h
print(s.strip("he")) # 'llo world   ' 去除两端

print(s.lstrip()) # 'hello world   ' 去除左端空格
print(s.lstrip(" ")) # 'hello world   ' 去除左端空格
print(s.lstrip("h")) # 'ello world   ' 去除左端 h

print(s.rstrip()) # '   hello world' 去除右端空格
print(s.rstrip(" ")) # '   hello world' 去除右端空格
print(s.rstrip("d")) # '   hello worl' 去除右端 d

```

#### join

`join` 方法用于将一个可迭代对象中的元素连接成一个字符串。返回连接后的字符串(`不会修改原字符串，会返回一个新的字符串副本`)。

`join` 方法的语法如下：
`s.join(iterable)` -- `s` -- 指定连接符，`iterable` -- 指定可迭代对象。

``` py
s = " "

print(s.join("abc")) # 'a b c' 连接字符串

print(s.join(["a", "b", "c"])) # 'a b c' 连接列表

print(s.join(("a", "b", "c"))) # 'a b c' 连接元组   

print(s.join({"a", "b", "c"})) # 'a b c' 连接集合   

print(s.join({"a", "b", "c"})) # 'a b c' 或者 'b a c' 或者 'c a b' 集合是无序的
```

#### format

`format` 方法用于格式化字符串，返回格式化后的字符串(`不会修改原字符串，会返回一个新的字符串副本`)。  

`s.format(*args, **kwargs)` -- `*args` -- 可变参数，`**kwargs` -- 关键字参数。

``` py
url = 'https://{}.{}.{}'
print(url.format('www','baidu', 'com')) # https://www.baidu.com
print(url.format('h5','baidu', 'com')) # https://h5.baidu.com
print(url.format('m','baidu', 'com')) # https://m.baidu.com

# 通过索引
url1 = '亲爱的{2}，祝您{1}，{0}'
print(url1.format(1,2,3)) # 亲爱的3，祝您2，1

# 通过关键字
url2 = '亲爱的{name}，祝您{s2}，{s3}'
print(url2.format(name = '李',s2 = '新年快乐',s3 = '身体健康')) # 亲爱的李，祝您新年快乐，身体健康

```

## 数字

### int整数

``` py
a = 1

print(a) # 1

print(type(a)) # <class 'int'>

print(type(a) == int) # True

print(int(1.1)) # 1 浮点数转整数，舍弃小数部分
```

### float浮点小数

``` py
a = 1.0

print(a) # 1.0

print(type(a)) # <class 'float'>

print(type(a) == float) # True

print(float(1)) # 1.0 整数转浮点数

```

### 复数对象complex

``` py
a = 1 + 2j

print(a) # 1+2j

print(type(a)) # <class 'complex'>

print(type(a) == complex) # True
```

### 数值型的科学运算

Python 中的数值型对象（`int`、`float`、`complex`）支持科学运算，如指数、对数、三角函数等。

#### 基础运算符

 `(+, -, *, /, //, %, **)`

``` py
# 加
a = 1
b = 2

print(a + b) # 3

c = 1.0
d = 2.0
print(c + d) # 3.0

# a + c 整数 + 浮点数 = 浮点数
print(a + c) # 3.0


# 减，结果为减法的整数或者浮点数
print(a - b) # -1

# 乘，结果为乘积的整数或者浮点数
print(a * b) # 2

# 除，结果为浮点数或者整数
print(a / b) # 0.5

# 整除，结果为整数
print(a // b) # 0

# 取模，结果为取模
print(a % b) # 1

# 幂，结果为幂
print(a ** b) # 1
```

数值型的科学运算的返回值有可能是浮点数，也有可能是整数。

#### math

常用的科学运算函数

``` python
import math 

# 平方根
print(math.sqrt(4)) # 2.0

print(math.fabs(-1)) # 1.0

```

#### 其他

##### abs

``` python
abs(-1) # 1

abs(-1.1) # 1.1

#  abs 和 math.fabs 的区别
# abs 是内置函数，math.fabs 是 math 模块中的函数，返回值类型不同 math.fabs 返回 float， abs 返回 int或者 float；
```

###### max 和 min 函数

最大值和最小值

``` py
max(1, 2, 3) # 3

min(1, 2, 3) # 1

min(1.1, 2.2, 3.3, 1) # 1
```

##### round

四舍五入

``` py
round(1.1) # 1
round(1.5) # 2
# 四舍五入到小数点后5位
round(1.123456789, 5) # 1.12346
```

#### 复合赋值运算符

用于解决运算符和赋值运算符连用时的问题，使表达式更加简洁

``` python
a = 1
a += 1 # a = a + 1
print(a) # 2

b = 10
b -= 1 # b = b - 1
print(b) # 9

c = 2
c *= 2 # c = c * 2
print(c) # 4

b = 10
b /= 2 # b = b / 2
print(b) # 5

e = 7
e //= 2 # e = e // 2
print(e) # 3

f = 9
f %= 2 # f = f % 2
print(f) # 1

g = 5
g **= 2 # g = g ** 2
print(g) # 25

```

#### 比较运算符

``` python
a = 1
b = 2

print(a > b) # False
print(a < b) # True
print(a >= b) # False
print(a <= b) # True
print(a == b) # False
print(a != b) # True
```

## 逻辑运算

逻辑运算符用于对布尔值进行逻辑运算，并返回一个布尔值，表示逻辑运算结果。

### and与

``` python
a = True
b = False
print(a and b) # False
```

### or 或

``` python
a = True
b = False
print(a or b) # True
```

### not 非

``` python
a = True
print(not a) # False
```

### 海象运算符

海象运算符允许边赋值边判断

**注意**：使用海象运算符时，**务必加上括号** `()`，因为它的优先级较低，容易引发歧义。

``` python
# 错误：普通赋值不能直接放在条件中
# if data = get_data():  # SyntaxError
#     pass

# 正确：海象运算符允许边赋值边判断
if (data := get_data()) is not None:
    print(data)
```

**推荐使用**：读取文件、正则匹配、复杂条件判断且需要重用结果时。

**避免使用**：简单的布尔判断、为了“炫技”而强行使用。**代码是给人看的，可读性优先于简洁性。**



## 列表

列表对象是可变对象，即`列表`可以被修改。因此，`列表`的元素可以被修改、添加或删除。 和字符串相比，`字符串`是不可变对象，即`字符串`不能被修改。

### 用法

``` python
print(type([]) == list) # True
print(type([]) ) # <class 'list'>

print(list('hello')) # ['h', 'e', 'l', 'l', 'o']

a = [1, 2, 3]
print(a) # [1, 2, 3]

s = ['a', 'b', 'c']
print(s) # ['a', 'b', 'c']

f = [1, 'a', 3.14]
print(f) # [1, 'a', 3.14]

c = [print, len, abs]
print(c) # [print, len, abs]


v = [1, [1], [[[1]]]] # 嵌套列表
```

列表转元组

``` python
s = [1, 2, 3]
print(tuple(s)) # (1, 2, 3)
```

列表转集合

``` python
s = [1, 2, 3]
print(set(s)) # {1, 2, 3}

s1 = [1, 2, 3, 4, 5, 1,2,3,4,5]
print(set(s1)) # {1, 2, 3, 4, 5} 自动去重
```

### 索引

通过下标访问列表元素，如果下标超出范围，会`报错`。下标从 0 开始。

负数下标表示从末尾开始访问，-1 表示最后一个元素

``` python
s = [1, 2, 3]
print(s[0]) # 1
print(s[1]) # 2
print(s[2]) # 3

# 负数下标表示从末尾开始访问，-1 表示最后一个元素

print(s[-1]) # 3
print(s[-2]) # 2
print(s[-3]) # 1

```

### 切片

范围

``` python
l = [1, 2, 3, 4, 5, 6]

print(l[0:2]) # [1, 2] 切片操作，从索引 0 开始，到索引 2 结束，不包含索引 2 的元素
```

间隔

``` python
array = [1, 2, 3, 4, 5, 6]

print(array[0:2:1]) # [1, 2] 切片操作，从索引 0 开始，到索引 2 结束，不包含索引 2 的元素，步长为 1
print(array[0:5:2]) # [1, 3] 切片操作，从索引 0 开始，到索引 5 结束，不包含索引 5 的元素，步长为 2
```

反向

``` py 
array = [1, 2, 3, 4, 5, 6]

print(array[::-1]) # [6, 5, 4, 3, 2, 1] 反向切片
print(array[::-2]) # [6, 4, 2] 反向切片
print(array[::-3]) # [6, 3] 反向切片
```

间隔反向

``` py
array = [1, 2, 3, 4, 5, 6]
print(array[5:0:-1]) # [6, 5, 4, 3, 2, 1] 切片操作，从索引 5 开始，到索引 0 结束，不包含索引 0 的元素，步长为 -1
print(array[5:0:-2]) # [6, 4, 2] 切片操作，从索引 5 开始，到索引 0 结束，不包含索引 0 的元素，步长为 -2
```

### 索引修改

``` python
array = [1, 2, 3]
array[0] = 0
print(array) # [0, 2, 3] 修改原列表
```

_**小知识：列表是可变对象，即`列表`可以被修改。因此，`列表`的元素可以被修改、添加或删除。 和字符串相比，`字符串`是不可变对象，即`字符串`不能被修改。_**

### 方法

##### 合并

`list` 函数用于将一个可迭代对象转换为列表。返回转换后的列表(`不会修改原对象，会返回一个新的列表副本`)。

加法

``` python
array1 = [1, 2, 3]
array2 = [4, 5, 6]
print(array1) # [1, 2, 3]
print(array2) # [4, 5, 6]

print(array1 + array2) # [1, 2, 3, 4, 5, 6] 合并两个列表
```

乘法

``` python
array1 = [1, 2, 3]
print(array1) # [1, 2, 3]
print(array1 * 2) # [1, 2, 3, 1, 2, 3] 重复两个列表
```

##### append

`参数`: `value`

`返回`: `None`

`append` 方法用于在列表末尾添加`一个`元素。(`修改原对象列表`)

`append` 方法的语法如下：
`a.append(element)` -- `element` -- 添加的元素。

``` python
a = [1, 2, 3]
a.append(4)
print(a) # [1, 2, 3, 4]
```

##### extend

`参数`: `iterable`

`返回`: `None`

`extend` 方法用于在列表末尾添加多个元素。(`修改原对象列表`)

`extend` 方法的语法如下：
`a.extend(iterable)` -- `iterable` -- 可迭代对象。

``` python
a = [1, 2, 3]
a.extend([4, 5, 6])
print(a) # [1, 2, 3, 4, 5, 6]

```

##### insert

`insert` 方法用于在列表指定位置插入一个元素。(`修改原对象列表`)

`insert` 方法的语法如下：
`a.insert(index, element)` -- `index` -- 插入位置的索引，`element` -- 插入的元素。

``` python
a = [1, 2, 3]
a.insert(0, 0)
print(a) # [0, 1, 2, 3]

```

##### pop

`pop` 方法用于移除列表中指定位置的元素，并返回该元素。(`修改原对象列表`)

`pop` 方法的语法如下：
`a.pop(index)` -- `index` -- 移除元素的索引。

``` python
a = [1, 2, 3]
a.pop(1)
print(a) # [1, 3]

array = [1, 2, 3]
array.pop()
print(array) # [1, 2]

```

##### remove

`remove` 方法用于移除列表中`第一个匹配`的元素, 如果列表中不存在该元素则`报错`， (`修改原对象列表`)

`pop` 通过`索引`删除，`remove` 通过`对象`删除；

``` python
a = [1, 2, 3]
a.remove(2)
print(a) # [1, 3]
```

##### clear

`clear` 方法用于移除列表中所有元素。(`修改原对象列表`)

``` python
a = [1, 2, 3]
a.clear()
print(a) # []
```

##### del

`del` 函数用于删除列表中指定位置的元素。(`修改原对象列表`)
`del` 函数的语法如下：
`del a[index]` -- `a` -- 列表，`index` -- 删除位置的索引。

``` python
a = [1, 2, 3]
del a[0]
print(a) # [2, 3]

```

删除对象

`del` 语句用于删除对象，`del` 语句的语法如下：
`del object` -- `object` -- 要删除的对象。

``` python
a = [1, 2, 3]
del a
print(a) # NameError: name 'a' is not defined
```

`reverse` 方法用于反转列表中元素的顺序。(`修改原对象列表`)

##### sort

`sort` 方法用于对列表中元素进行排序。(`修改原对象列表`)

`sort` 方法的语法如下：
`a.sort(key=None, reverse=False)` -- `key` -- 排序的依据，`reverse` -- 是否反转。

``` python
a = [1, 2, 3]
a.sort()
print(a) # [1, 2, 3]

# key
a = [(1,2), (0,3), (5, 4)]
a.sort(key=lambda x:x[0])
print(a)  # [(0, 3), (1, 2), (5, 4)]

# reverse

a = [1, 2, 3]
a.sort(reverse=True)
print(a) # [3, 2, 1]

# reverse + key

a = [(1,2), (0,3), (5, 4)]
a.sort(key=lambda x:x[0], reverse=True)
print(a)  # [(5, 4), (1, 2), (0, 3)]



```



##### index

`index` 方法用于返回列表中第一个匹配的元素的索引，如果列表中不存在该元素则`报错`。

`index` 方法的语法如下：
`a.index(element, start, end)` -- `element` -- 要查找的元素，`start` -- 开始查找的位置，`end` -- 结束查找的位置。

``` python
a = [1, 2, 3]
print(a.index(2)) # 1
print(a.index(4)) # ValueError: 4 is not in list
print(a.index(2, 0, 2)) # 1
print(a.index(2, 1, 2)) # 1
print(a.index(2, 2, 3)) # ValueError: 2 is not in list
```



##### count

`count` 方法用于返回列表中某个元素出现的次数。

`count` 方法的语法如下：
`a.count(element)` -- `element` -- 要查找的元素。

``` python
a = [1, 2, 3]
print(a.count(2)) # 1
print(a.count(4)) # 0
```



##### 知识点总结

知识点总结：列表对象 `list` 的常用方法：

1. `append` -- 在列表末尾添加一个元素。`修改原对象列表`
2. `extend` -- 在列表末尾添加多个元素。`修改原对象列表`
3. `insert` -- 在列表指定位置插入一个元素。`修改原对象列表`
4. `pop` -- 移除列表中指定位置的元素，并返回该元素。`修改原对象列表`
5. `remove` -- 移除列表中第一个匹配的元素。`修改原对象列表`
6. `clear` -- 移除列表中所有元素。`修改原对象列表`
7. `reverse` -- 反转列表中元素的顺序。`修改原对象列表`
8. `sort` -- 对列表中元素进行排序。`修改原对象列表`
9. `index` -- 返回列表中第一个匹配的元素的索引。
10. `count` -- 返回列表中某个元素出现的次数。 

* 创建：`list`、 `+` 、 `*` 运算符 -- 创建列表
* 增：`append`、`extend`、`insert` -- 增加元素
* 删：`pop`、`remove`、`clear` -- 删除元素
* 改：`reverse`、`sort` 、 `索引` -- 修改元素
* 查：`index`、`count`、`索引` -- 查找元素



## 元组

## 字典

### 创建字典

``` python
# 方式1：花括号（最常用）
d1 = {"name": "张三", "age": 25}

# 方式2：dict() 构造器
d2 = dict(name="李四", age=30)  # 注意：key 不需要加引号

# 方式3：zip 打包（动态生成）
keys = ["a", "b", "c"]
values = [1, 2, 3]
d3 = dict(zip(keys, values))  # {'a': 1, 'b': 2, 'c': 3}
```

### 访问与取值

``` python
d = {"name": "王五", "age": 28}

# 1. 直接访问（key 不存在会报错 KeyError）
print(d["name"])   # 王五
# print(d["gender"])  # ❌ KeyError

# 2. get() —— 安全访问（推荐）
print(d.get("gender"))          # None（不会报错）
print(d.get("gender", "未知"))   # 未知（指定默认值）

# 3. setdefault() —— 获取并设置默认值（巧妙用法）
# 如果 key 存在，返回其值；如果不存在，设置默认值并返回
d.setdefault("city", "北京")    # 设置 city=北京
print(d)  # {'name': '王五', 'age': 28, 'city': '北京'}

# 4. 视图：keys(), values(), items()
print(d.keys())   # dict_keys(['name', 'age', 'city'])
print(d.values()) # dict_values(['王五', 28, '北京'])
print(d.items())  # dict_items([('name', '王五'), ('age', 28), ('city', '北京')])

# 最常用：解包遍历
for key, value in d.items():
    print(f"{key}: {value}")
```

### 修改与删除

``` python
d = {"a": 1, "b": 2}

# 1. 添加/更新（直接赋值）
d["c"] = 3      # 添加新键
d["a"] = 99     # 更新已有键

# 2. update() —— 批量合并/更新
d.update({"b": 88, "d": 4})  # {'a': 99, 'b': 88, 'c': 3, 'd': 4}

# 3. 删除
del d["a"]          # 删除 key，不存在会报 KeyError
value = d.pop("b")  # 删除并返回值，不存在会报 KeyError
value = d.pop("x", None)  # 安全删除，不存在返回 None
last = d.popitem()  # 删除并返回最后一个键值对（Python 3.7+ 有序）

# 4. 清空
d.clear()
```



### 字典推导式（生成动态字典）

``` python
# 反转键值
original = {"a": 1, "b": 2, "c": 3}
reversed_dict = {v: k for k, v in original.items()}  # {1: 'a', 2: 'b', 3: 'c'}

# 过滤：只保留值大于10的项
scores = {"张三": 85, "李四": 92, "王五": 78}
filtered = {k: v for k, v in scores.items() if v >= 80}
```



### 合并字典

``` python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

# Python 3.9+：使用 | 操作符（最推荐）
merged = d1 | d2  # {'a': 1, 'b': 3, 'c': 4}（d2 覆盖 d1）

# Python 3.5+：解包方式
merged = {**d1, **d2}

# 旧方式：update（会修改原字典）
d1.update(d2)  # d1 被修改了，注意副作用
```



### 字典作为“计数器”与“分组器”

``` python
# 1. 统计频次（用 get 或 defaultdict）
text = "hello world"
count = {}
for char in text:
    count[char] = count.get(char, 0) + 1
# 最简方式：from collections import Counter; Counter(text)

# 2. 分组（用 defaultdict(list)）
from collections import defaultdict

students = [("A班", "张三"), ("B班", "李四"), ("A班", "王五")]
groups = defaultdict(list)
for cls, name in students:
    groups[cls].append(name)
# groups: {'A班': ['张三', '王五'], 'B班': ['李四']}
```



### 使用 `defaultdict` 和 `OrderedDict`

``` python
from collections import defaultdict, OrderedDict

# defaultdict：当 key 不存在时，自动生成默认值
d = defaultdict(int)   # 默认值为 0
d["count"] += 1         # 不会报错，自动初始化为 0 再加 1

d = defaultdict(list)  # 默认值为空列表
d["names"].append("张三")  # 不会报错，自动创建列表

# OrderedDict：在 Python 3.7 之前用于记住插入顺序（现在普通 dict 已有序）
# 但 OrderedDict 还有一些额外方法，如 move_to_end()
od = OrderedDict([("a", 1), ("b", 2)])
od.move_to_end("a")  # 把 a 移到最后
```



### 性能与复杂度

| 操作                     | 平均时间复杂度 | 说明                   |
| :----------------------- | :------------- | :--------------------- |
| 查找 `d[key]`            | O(1)           | 哈希表直接定位         |
| 插入/更新 `d[key] = val` | O(1)           | 哈希计算 + 可能 rehash |
| 删除 `del d[key]`        | O(1)           | 删除操作               |
| 遍历 `for key in d`      | O(n)           | 遍历所有键             |
| 键是否存在 `key in d`    | O(1)           | 哈希查找               |

 **性能注意点**：

- 字典的查找速度极快，但如果字典的**哈希碰撞**很严重（如大量整数键），性能会退化。
- **不要用字典做超大数据的排序**，排序需要 O(n log n)，应该用 `sorted(d.items())` 然后处理。
- 字典的内存开销比列表大（存储哈希表），如果需要存储大量简单结构，考虑用列表或 `array`





## 集合与冻集合



## 判别、条件、循环



## class

简单写法

``` python
# 1. 定义类（蓝图）
class Dog:
    # __init__ 是初始化方法，造对象时自动执行
    def __init__(self, name, age):
        self.name = name  # 把传进来的 name 存到对象自己身上
        self.age = age    # 把传进来的 age 存到对象自己身上

    # 行为（方法），必须带 self
    def bark(self):
        print(f"{self.name} 汪汪叫！")

# 2. 根据蓝图造出两只具体的狗（实例化）
dog1 = Dog("旺财", 2)   # 此时，Python 自动调用 __init__
dog2 = Dog("来福", 3)

# 3. 使用它们
print(dog1.name)   # 直接取数据，输出：旺财
dog2.bark()        # 直接调用行为，输出：来福 汪汪叫！
```

### 类属性、类方法、静态方法

类属性 —— 所有对象“共用”的变量

写在 `class` 下面、`__init__` **外面**的变量。所有实例都共享它，**一个改，全变**。

```python
class Dog:
    # 1. 类属性（所有狗共用）
    species = "犬科动物"  
    total_dogs = 0        # 用来数一共造了多少只狗

    def __init__(self, name):
        self.name = name  # 2. 实例属性（每只狗独有）
        Dog.total_dogs += 1  # 每造一只狗，总数加1

# 使用：
dog1 = Dog("旺财")
dog2 = Dog("来福")

# 通过实例能访问类属性（但本质是类的东西）
print(dog1.species)   # 输出：犬科动物
print(dog2.species)   # 输出：犬科动物

# 通过类名直接访问（最正统）
print(Dog.total_dogs) # 输出：2
```

#### `@classmethod` —— 跟“类蓝图”打交道的方法

- 第一个参数叫 `cls`（代表类本身）。
- **经典用法**：充当“备选构造函数”，帮你用不同方式造对象。

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    # 类方法：从 "2026-08-23" 这种字符串里拆出年月日来造对象
    @classmethod
    def from_string(cls, date_str):
        year, month, day = map(int, date_str.split("-"))
        return cls(year, month, day)  # 等价于 Date(year, month, day)

# 调用时不用 Date(...)，而是 Date.from_string(...)
d1 = Date(2026, 8, 23)                # 普通构造
d2 = Date.from_string("2026-08-23")   # 类方法构造（更直观）
print(d2.year)  # 2026
```

#### `@staticmethod` —— 放在类里的“普通工具函数”

- 没有 `self` 也没有 `cls`，就是个**普通函数**，只是放在类里便于归类。
- **经典用法**：跟类强相关、但不需要类数据的校验函数。

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    # 静态方法：只是验证月份是否合法（用不到 self 或 cls）
    @staticmethod
    def is_valid_month(m):
        return 1 <= m <= 12

# 直接通过类名调用，不需要造对象
print(Date.is_valid_month(8))   # True
print(Date.is_valid_month(13))  # False
```

### 继承

#### 继承的直观好处（代码复用）

子类自动拥有父类所有的属性和方法。

```python
class Animal:
    def eat(self):
        print("吃东西")

class Dog(Animal):  # Dog 继承 Animal
    pass            # 什么都不写

d = Dog()
d.eat()  # 输出：吃东西 （爹的方法，儿子自动有）
```

#### 致命陷阱

如果子类有自己的 `__init__`（出生档案），**父类的 `__init__` 不会自动执行**！

```python
class Animal:
    def __init__(self, name):
        print("【Animal】初始化")
        self.name = name

class Dog(Animal):
    def __init__(self, breed):  # 子类有自己的初始化
        print("【Dog】初始化")
        self.breed = breed

# 造一只狗
d = Dog("金毛")  

# 打印结果：
# 【Dog】初始化   （只打印了儿子的，爹的没打印！）

# 尝试取名字：
print(d.name)  
# 💥 报错！AttributeError: 'Dog' object has no attribute 'name'
```

**原因**：父类的 `__init__`（里面写了 `self.name = name`）根本没运行，所以 `name` 压根没贴到狗身上。

#### `super().__init__()`

在子类的 `__init__` 里加上 `super().__init__(...)`，就是**明确喊父类先把公共属性初始化好**。

```python
class Animal:
    def __init__(self, name):
        print("【Animal】初始化")
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):  # 儿子的参数要包含爹需要的 name
        print("【Dog】初始化")
        super().__init__(name)  # 👈 把 name 传给爹去处理
        self.breed = breed      # 自己只处理独有的 breed

# 造狗
d = Dog("旺财", "金毛")

# 打印结果：
# 【Dog】初始化
# 【Animal】初始化  （爹的被执行了！）

# 测试：
print(d.name)   # 旺财 （爹贴的标签，有了）
print(d.breed)  # 金毛 （自己贴的标签，也有了）
```

多继承

``` python
class Father:
    def __init__(self, last_name):
        self.last_name = last_name
        print(f"Father 初始化，姓：{last_name}")

class Mother:
    def __init__(self, hobby):
        self.hobby = hobby
        print(f"Mother 初始化，爱好：{hobby}")

class Child(Father, Mother):
    def __init__(self, last_name, hobby, pet):
        super().__init__(last_name)   # 调用 Father
        super(Child, self).__init__(hobby)  # 调完 Father 再调 Mother（演示）
        # 实际上，如果 Father 和 Mother 都用了 super，顺序由 MRO 决定
        self.pet = pet

c = Child("张", "画画", "猫")
print(c.last_name)  # 张
print(c.hobby)      # 画画
print(c.pet)        # 猫
```

### 魔法方法

#### `__repr__` 和 `__str__` —— 控制“打印/显示”的样子

你在调试时，`print(obj)` 出来一串 `<__main__.User object at 0x...>`，瞬间烦躁。用这两个方法解决：

- **`__repr__`**：给**程序员**看的（调试时，在交互环境直接敲变量名显示）。要求**精确、无歧义**，最好能直接复制回去重建对象。
- **`__str__`**：给**用户**看的（`print(obj)` 时调用）。要求**好看、易读**。
- 如果只定义 `__repr__`，`print` 时会自动拿它当备胎。

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # 给程序员看（交互环境敲 user，显示这个）
    def __repr__(self):
        return f"User(name='{self.name}', age={self.age})"

    # 给用户看（print(user) 时显示这个）
    def __str__(self):
        return f"用户：{self.name}，年龄：{self.age}"

u = User("小明", 18)

# 交互环境直接敲 u，会调用 __repr__（如果你在脚本里，用 print(repr(u))）
print(repr(u))  # 输出：User(name='小明', age=18)

# 直接 print
print(u)        # 输出：用户：小明，年龄：18
```

#### `__call__` —— 让对象“装”成函数（可调用对象）

你看到别人代码里写 `model(x)`（比如 PyTorch 的神经网络层），而不是 `model.forward(x)`，就是因为它实现了 `__call__`。

```python
class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

# 造一个“乘以2”的工具
double = Multiplier(2)

# 像函数一样调用它！
print(double(5))   # 输出：10
print(double(10))  # 输出：20
```

**现实意义**：你写一个计时器、缓存工具、深度学习层，都可以把核心逻辑写在 `__call__` 里，让对象用起来和函数一样自然。

**带记忆”的函数**

``` python
class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

c = Counter()       # 造一个计数器
print(c())          # 输出 1 （像函数一样加括号调用！）
print(c())          # 输出 2
print(c())          # 输出 3
# 状态藏在对象内部，互不影响
c2 = Counter()
print(c2())         # 输出 1 （新计数器，独立）
```

**深度学习框架（PyTorch / TensorFlow）的“层” —— 最“大厂”**

``` python
# 模拟 PyTorch 的线性层（全连接层）
class LinearLayer:
    def __init__(self, in_features, out_features):
        # 模拟初始化权重（随机数）
        self.weights = [[0.5] * in_features for _ in range(out_features)]
        
    def forward(self, x):
        # 模拟前向计算（矩阵乘法简化版）
        return [sum(a * b for a, b in zip(row, x)) for row in self.weights]

    def __call__(self, x):
        # 调用 forward，还可以加钩子、记录日志等
        print(f"输入的维度: {len(x)}")
        return self.forward(x)

layer = LinearLayer(3, 2)  # 输入3个特征，输出2个特征
data = [1.0, 2.0, 3.0]
output = layer(data)       # 👈 像函数一样调用！
print(output)              # 输出计算结果（例：[3.0, 3.0]）
```



**类装饰器**

``` python
import time

class Timer:
    def __init__(self, func):
        self.func = func

    def __call__(self, *args, **kwargs):
        start = time.time()
        result = self.func(*args, **kwargs)
        print(f"耗时: {time.time() - start:.4f}s")
        return result

# 使用（经典的装饰器语法糖）
@Timer
def long_task():
    time.sleep(1)
    return "完成"

long_task()  # 输出：耗时: 1.0002s
```



#### `__len__` 和 `__getitem__`

你想让自己写的类支持 `len(obj)` 获取长度，或者 `obj[0]` 切片取值，就实现这两个方法。

```python
class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

    # 可选：支持切片赋值或删除（__setitem__, __delitem__）

my_list = Playlist(["七里香", "晴天", "夜曲"])

print(len(my_list))   # 输出：3 （调用 __len__）
print(my_list[0])     # 输出：七里香 （调用 __getitem__）
print(my_list[1:3])   # 输出：['晴天', '夜曲'] （切片也支持！）
```



### @dataclass

你在看新代码时，经常看到类头顶着 `@dataclass`，里面**只有类型注解，没有 `__init__`**。它自动帮你生成了 `__init__`、`__repr__`、`__eq__`。

```python
from dataclasses import dataclass

# 以前你要写：
# class Student:
#     def __init__(self, name, score):
#         self.name = name
#         self.score = score

@dataclass
class Student:
    name: str
    score: int
    # 不用写任何 __init__ 和 __repr__！

s1 = Student("张三", 95)
s2 = Student("张三", 95)

print(s1)           # 输出：Student(name='张三', score=95) （自动有好看格式）
print(s1 == s2)     # 输出：True （自动按属性值比较，而不是内存地址）

# 进阶用法：冻结（不可变）、设置默认值
@dataclass(frozen=True)  # 冻结后不能修改属性
class Config:
    host: str = "localhost"
    port: int = 8080

c = Config()
# c.port = 9000  # 如果取消注释会报错，因为 frozen=True
```

> **你在开源代码（FastAPI、Django Ninja）里频繁看到的 `@dataclass`，就是为了替代写冗长的 `__init__` 和 `__repr__`。看到它就当普通数据盒子，不用慌。**

`frozen=True` 只是禁止**原地修改**，但你可以用 `dataclasses.replace()` 创建一个**新的、修改了某个字段的副本**（就像字符串的 `replace` 一样）。

```python
from dataclasses import dataclass, replace

@dataclass(frozen=True)
class User:
    name: str
    age: int

u1 = User("小明", 18)
# 想改年龄？不是去改 u1，而是造一个新的：
u2 = replace(u1, age=19)  

print(u1)  # User(name='小明', age=18)  （原对象没变）
print(u2)  # User(name='小明', age=19)  （新对象）
```

`order=True` —— 让你的对象自动支持排序（`>`、`<`、`sort`）

默认情况下，两个数据类对象用 `>` 或 `<` 比较，会报错（因为 Python 不知道按什么规则比）。

加上 `order=True`，Python 会自动按照**字段定义的顺序**（先比第一个字段，如果相同再比第二个，以此类推）生成 `>`、`<`、`>=`、`<=` 全套比较方法。

```python
from dataclasses import dataclass

# 不加 order（默认不可比较）
@dataclass
class StudentNoOrder:
    score: int
    name: str

s1 = StudentNoOrder(90, "张三")
s2 = StudentNoOrder(85, "李四")
# print(s1 > s2)  # 💥 报错：TypeError: '>' not supported


# 加上 order=True（自动支持比较和排序）
@dataclass(order=True)
class Student:
    score: int   # 第一优先级：按分数排
    name: str    # 第二优先级：分数一样时按名字排

s1 = Student(90, "张三")
s2 = Student(85, "李四")
s3 = Student(90, "阿强")  # 跟 s1 同分，但名字不同

print(s1 > s2)   # 输出：True （因为 90 > 85）
print(s1 > s3)   # 输出：False （分数一样 90==90，比名字："张三" > "阿强"? False，因为 '张' > '阿'）

# 直接对列表排序，爽翻天！
students = [s1, s2, s3]
sorted_students = sorted(students)
print(sorted_students)
# 输出：[Student(score=85, name='李四'), Student(score=90, name='阿强'), Student(score=90, name='张三')]
# 按 85 -> 90 -> 90，且同分的按名字字母/拼音排好了！
```



### @property @属性.setter

**把方法“伪装”成属性**

``` python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score  # 触发 setter

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if not 0 <= value <= 100:
            raise ValueError("分数必须在 0~100 之间")
        self._score = value

# 测试
s1 = Student("小红", 95)  # 正常
print(s1.score)           # 95

s1.score = 80  # 正常

s1.score = 101  # 报错：ValueError: 分数必须在 0~100 之间


s2 = Student("小黑", 101) # 报错：ValueError: 分数必须在 0~100 之间
```

``` python
self.score = score  # score

@property
def score(self): # score

@score.setter # score
def score(self, value): # score 

# 上面四个 score 都得一致，不能写错；
```



### @staticmethod

**`@staticmethod`（静态方法）**：**“类里的普通工具函数”**。它跟类没半毛钱关系，只是恰好放在类里面归类而已。它**不需要 `self`**，也**不需要 `cls`**。

**参数校验**

``` python
class User:
    def __init__(self, username, email):
        # 在 init 里调用静态方法来校验，保证进来的数据是干净的
        if not User._is_valid_email(email):
            raise ValueError("邮箱格式不对！")
        self.username = username
        self.email = email

    @staticmethod
    def _is_valid_email(email):
        """校验邮箱：必须包含 @ 和 ."""
        return "@" in email and "." in email

# ---------- 外部调用 ----------
# 外部代码在传参前，也可以先单独调用校验一下（不需要造对象！）
email = "test@@gmail.com"  # 故意写错的
if User._is_valid_email(email):
    u = User("张三", email)
else:
    print("邮箱无效，请重新输入")
```

**纯工具**

``` python
class Geometry:
    @staticmethod
    def _circle_area(radius):
        return 3.14159 * radius ** 2

    @staticmethod
    def _celsius_to_fahrenheit(c):
        return (c * 9/5) + 32

# 调用（完全不需要造对象！）
print(Geometry._circle_area(5))           # 78.53975
print(Geometry._celsius_to_fahrenheit(0)) # 32.0
```





### **@classmethod**

**“类自己的亲儿子”**。它**需要 `cls`**（代表类本身），它能操作类属性，也能造出这个类的对象（工厂模式）。

**多态构造器**

这是 `@classmethod` **最伟大、最不可替代**的用途。当数据格式不匹配时，用它来提供**多种创建对象的方式**。

#### **经典案例：从字典/字符串/CSV 创建对象**

``` python
class User:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

    @classmethod
    def from_dict(cls, data):
        """从字典造用户（自动处理缺失字段）"""
        return cls(
            name=data.get('name', '匿名'),
            age=data.get('age', 0),
            email=data.get('email', 'no@email.com')
        )

    @classmethod
    def from_csv_line(cls, line):
        """从 CSV 行字符串造用户"""
        name, age, email = line.strip().split(',')
        return cls(name, int(age), email)

# 外部调用时极度舒适：
raw_data = {'name': '张三', 'age': 18}
user1 = User.from_dict(raw_data)   # 一行搞定，不用手动拆字典

csv_line = "李四,20,li@qq.com"
user2 = User.from_csv_line(csv_line)
```

**为什么不用 `__init__`？** `__init__` 只能接受固定的参数列表。外部数据源千奇百怪（JSON、CSV、数据库行），用 `@classmethod` 把“脏活”封装在类内部，外部只负责丢数据进来。

#### **继承场景下的“自适应工厂”**

这是 `@classmethod` 碾压 `@staticmethod` 的**必杀技**。当父类方法被 `cls` 调用时，它返回的是**调用者自己的类型**，而不是写死的父类。

``` python
class Animal:
    def __init__(self, name):
        self.name = name

    @classmethod
    def create(cls, name):
        return cls(name)  # 👈 cls 是动态的

class Dog(Animal):
    def bark(self):
        return "汪汪"

class Cat(Animal):
    def meow(self):
        return "喵喵"

# 测试：子类调用父类的类方法
dog = Dog.create("旺财")
cat = Cat.create("咪咪")

print(type(dog))  # <class '__main__.Dog'>  ✅ 正确！造出来的是狗
print(type(cat))  # <class '__main__.Cat'>  ✅ 正确！造出来的是猫
print(dog.bark()) # 汪汪（完美运行）
```

**如果这里用 `@staticmethod` 写死 `return Animal(name)`，`dog` 就会变成 `Animal`，永远调不出 `bark()`。** 这就是 `@classmethod` 的核心价值：**让父类的工厂方法，在子类调用时依然返回子类对象**。

#### **修改“类级别”的全局默认配置**

当你想修改一个**所有实例共享**的默认值时，用 `@classmethod` 最优雅。

``` python
class Database:
    # 类属性（所有连接共享的默认超时时间）
    default_timeout = 30

    def __init__(self, host):
        self.host = host
        self.timeout = self.default_timeout

    @classmethod
    def set_timeout(cls, seconds):
        """修改全局默认超时时间（影响后续所有新创建的实例）"""
        cls.default_timeout = seconds

# 初期：所有连接默认超时 30 秒
db1 = Database("localhost")
print(db1.timeout)  # 30

# 运维发现网络慢，要改全局默认值（不用重启程序）
Database.set_timeout(60)  

db2 = Database("192.168.1.1")
print(db2.timeout)  # 60 （新连接生效）
print(db1.timeout)  # 30 （老连接保持原样，保护历史数据）
```







## **上下文管理器**

#### 场景：你手动管理文件（反面教材）

新手常这么写：

```python
f = open("test.txt", "w")
f.write("Hello")
f.close()  # 万一这行忘了写，文件句柄就一直占着内存
```



**如果写入时报错呢？**

```python
f = open("test.txt", "w")
f.write(123)  # 💥 报错！（写入字符串以外的类型）
f.close()     # ❌ 这行根本执行不到，文件没关，资源泄露！
```



你当然可以用 `try...finally` 保证必关，但每次写太啰嗦：

```python
f = open("test.txt", "w")
try:
    f.write("Hello")
finally:
    f.close()  # 无论报不报错，都执行关闭
```

**`with` 就是这套 `try...finally` 的“语法糖”**，帮你自动收尾。

```python
with open("test.txt", "w") as f:
    f.write("Hello")
# 缩进结束，文件自动关闭（哪怕中间报错，也关！）
```

### 底层黑盒：类如何实现 `with`？（`__enter__` 和 `__exit__`）

当你写 `with 对象 as 变量:` 时，Python 底层执行了：

1. 调用对象的 `__enter__()`，返回值赋给 `as` 后面的变量。
2. 执行缩进里的代码。
3. 无论代码是否报错，**退出缩进时**必调用 `__exit__()`。

我们手写一个**自动计时器**，让你感受它的魔力：

```python
import time

class Timer:
    def __enter__(self):
        """进入 with 块时执行"""
        self.start = time.time()
        return self  # 返回自身，让 as 后面的变量拿到

    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出 with 块时执行（无论报不报错）"""
        self.end = time.time()
        print(f"⏱️ 耗时: {self.end - self.start:.4f} 秒")
        # 如果返回 False（默认），报错会正常抛出；返回 True 则吞掉报错

# 使用它！
with Timer() as t:
    sum(i for i in range(10000000))  # 模拟耗时计算
# 缩进结束，自动打印：⏱️ 耗时: 0.2345 秒
```



------

### 🔥 `__exit__` 的三个神秘参数（异常处理的核心）

`__exit__(self, exc_type, exc_val, exc_tb)` 接收的这三个参数，分别代表**异常类型、异常值、异常堆栈**。

- 如果没有报错，三个参数全是 `None`。
- 如果有报错，传进来，你可以选择**处理它，甚至“吞掉”它**。

**经典场景：数据库事务回滚（报错就撤销操作）**

```python
class DatabaseTransaction:
    def __enter__(self):
        print("开启事务")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print(f"❗ 发生异常 {exc_val}，执行回滚 (Rollback)")
            return True  # 👈 返回 True 表示：异常我处理了，外面不要报错了
        else:
            print("✅ 无异常，提交事务 (Commit)")
        # 返回 False（或没有 return），异常会继续向上抛出

# 场景1：正常执行
with DatabaseTransaction():
    print("执行 SQL 操作...")
# 输出：开启事务 -> 执行 SQL 操作... -> ✅ 无异常，提交事务

# 场景2：出错回滚
with DatabaseTransaction():
    print("执行 SQL 操作...")
    raise ValueError("磁盘满了！")
# 输出：开启事务 -> 执行 SQL 操作... -> ❗ 发生异常 磁盘满了！，执行回滚
# 注意：因为返回了 True，程序不会因 ValueError 崩溃（如果不想吞掉，就返回 False）
```

### 🚀 偷懒大法：用 `@contextmanager` 装饰器（不用写类）

写一个完整的类实现 `with` 有时候太啰嗦。Python 提供了 `contextlib` 模块，让你**用生成器（yield）** 更简洁地实现。

```python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    try:
        yield  # 这里的代码就是 with 块里的内容
    finally:
        # 无论 with 块里是否报错，都会执行这里（相当于 __exit__）
        print(f"⏱️ 耗时: {time.time() - start:.4f} 秒")

# 使用时跟类版本一模一样！
with timer():
    sum(i for i in range(10000000))
# 输出：⏱️ 耗时: 0.2134 秒
```

> **你在开源代码里，会大量看到 `@contextmanager` 这种写法，因为它比写一个完整的类轻便得多。**





## 推导式

推导式（Comprehension）是 Python 提供的一种**“用一行代码生成新数据结构”**的语法。它本质上是 **“循环 + 过滤 + 处理”** 的简写形式

```python
[ 新元素表达式 for 迭代变量 in 可迭代对象 if 条件筛选 ]
```

- **执行顺序**：先从 `in` 右边开始循环，再执行左边的表达式。
- **结果**：生成一个新的列表。

**简单映射（等价于 JS 的 `map`）**

```python
# Python 推导式
squares = [x * x for x in [1, 2, 3, 4]]
print(squares)  # 输出：[1, 4, 9, 16]

# 等价于 JS 的写法
# const squares = [1, 2, 3, 4].map(x => x * x);
```

**带过滤（等价于 JS 的 `filter` + `map`）**

```python
# 只取偶数并乘方
even_squares = [x * x for x in range(10) if x % 2 == 0]
print(even_squares)  # 输出：[0, 4, 16, 36, 64]

# 等价于 JS 的写法
# const result = [0,1,2,3,4,5,6,7,8,9].filter(x => x%2===0).map(x => x*x);
```

**嵌套循环（两重 for）**

```python
# 生成坐标对
pairs = [(a, b) for a in [1, 2] for b in ['A', 'B']]
# 输出：[(1, 'A'), (1, 'B'), (2, 'A'), (2, 'B')]
# 执行顺序：外层循环先走，内层循环后走。
```

**字典推导式**

```python
original = {"a": 1, "b": 2, "c": 3}
# 交换 key 和 value
swapped = {value: key for key, value in original.items()}
print(swapped)  # 输出：{1: 'a', 2: 'b', 3: 'c'}

# 等价于 JS 的 Object.entries 操作
```

**集合推导式**

```python
# 注意用的是花括号 {}
text = "hello"
unique_chars = {char for char in text}
print(unique_chars)  # 输出：{'h', 'e', 'l', 'o'} (注意 l 只出现一次)
```

## lambda函数

**Lambda 函数**是 Python 中用于创建**匿名函数（没有函数名的函数）**的语法结构。它的核心定义是：一个**只能包含单行表达式**的微型函数。

```python
lambda 参数列表: 返回的表达式
```

- **执行逻辑**：计算冒号右侧表达式的值，并自动将其作为返回值。**不需要 `return` 关键字**。

**与 TypeScript 的精确对标**

| TypeScript        | Python（Lambda）     |
| :---------------- | :------------------- |
| `(a, b) => a + b` | `lambda a, b: a + b` |
| `(x) => x * 2`    | `lambda x: x * 2`    |
| `() => "Hello"`   | `lambda: "Hello"`    |

**它与普通函数（`def`）的本质区别**

| 维度       | 普通函数（`def`）                                           | Lambda 函数                                                  |
| :--------- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| **名称**   | 必须有名。                                                  | **匿名**（存储在变量中时看似有名，但本质无名）。             |
| **主体**   | 支持**多行**语句（包含循环、`try...except`、`return` 等）。 | **只能包含单行表达式**（不能包含 `return`、`=` 赋值、`print` 等语句）。 |
| **返回值** | 必须用 `return` 显式返回。                                  | **自动返回**表达式的计算结果。                               |
| **用途**   | 大型业务逻辑。                                              | **临时、单次使用**的回调或转换逻辑。                         |

**实际开发中的典型使用场景（必看）**

Lambda 在 Python 中**绝不用于**替代 `def` 编写业务逻辑。它的真正价值在于**作为高阶函数（如 `sorted`、`map`、`filter`）的参数**。

**对字典列表进行排序（`sorted`）**

```python
users = [{"name": "Bob", "age": 25}, {"name": "Alice", "age": 30}]
# 按 age 字段排序
sorted_users = sorted(users, key=lambda user: user["age"])
print(sorted_users)  # Bob 在前，Alice 在后
```

**快速数据转换（与 `map` 配合）**

```python
numbers = [1, 2, 3]
# 所有元素乘以 2
result = list(map(lambda x: x * 2, numbers))
print(result)  # 输出：[2, 4, 6]
# 注意：在 Python 中，列表推导式 [x * 2 for x in numbers] 通常比 map+lambda 更推荐（更易读）。
```

**Lambda 是 Python 为“一次性过滤/转换”场景提供的语法糖。它的存在是为了让你不必为简单的排序规则或映射逻辑去定义一个繁琐的具名函数。**



## 解包操作符

```python
# 1. 元组 (Tuple)
a, b, c = * (1, 2, 3)  # 也是合法的
print(* (1, 2, 3))     # 输出：1 2 3

# 2. 集合 (Set) - 注意顺序不保证
print(* {"A", "B", "C"})  # 输出：A B C (可能乱序)

# 3. 字符串 (String) - 会拆成单个字符
print(* "ABC")  # 输出：A B C

# 4. 生成器 (Generator)
gen = (x for x in range(3))
print(*gen)  # 输出：0 1 2

# 5. 字典 (Dict) - 默认只解包键（keys）
print(* {"name": "Alice", "age": 18})  # 输出：name age
# 如果想解包值，需要显式调用 .values()
print(* {"name": "Alice", "age": 18}.values())  # 输出：Alice 18
```

**关键区分：* 与 ****

- **`\*`（单星号）**：用于解包 **可迭代对象**（列表、元组、集合、字符串等），结果作为 **位置参数（Positional Arguments）** 传入。
- **`\**`（双星号）**：专门用于解包 **字典（Dict）**，结果作为 **关键字参数（Keyword Arguments）** 传入。

```python
def demo(a, b, c):
    print(a, b, c)

# 单星号解包列表（位置参数）
demo(*[1, 2, 3])  # 等价于 demo(1, 2, 3)

# 双星号解包字典（关键字参数）
demo(**{"a": 10, "b": 20, "c": 30})  # 等价于 demo(a=10, b=20, c=30)
```

| 操作符 | 适用对象                                                     | 在函数调用中转化为 | 例子                     |
| :----- | :----------------------------------------------------------- | :----------------- | :----------------------- |
| `*`    | **任何可迭代对象**（list, tuple, set, str, generator, dict keys） | **位置参数**       | `func(*[1,2,3])`         |
| `**`   | **仅字典（dict）**                                           | **关键字参数**     | `func(**{"a":1, "b":2})` |

`*` 解包的重心是“**依次取值**”，只要能被 `for` 循环遍历的对象，都能被 `*` 解包；而字典因为需要显式指定键名，所以由 `**` 专门处理。

**函数**

用于**收集多个参数**，并打包成一个 `tuple`（元组）或 `dict`（字典）。

- **`\*args`（收集位置参数）**：
  把传进来的所有**多余的位置参数**打包成一个元组。

  ```python
  def log(*args):
      print(args)  # args 是一个元组
  
  log(1, 2, 3, "hello")  # 输出：(1, 2, 3, 'hello')
  ```

- **`\**kwargs`（收集关键字参数）**：
  把传进来的所有**多余的关键字参数**打包成一个字典。

  ```python
  def info(**kwargs):
      print(kwargs)  # kwargs 是一个字典
  
  info(name="Alice", age=25)  # 输出：{'name': 'Alice', 'age': 25}
  ```

- **标准组合写法（日常开发极高频）**：
  如果你想写一个**通用的包装函数**（比如装饰器、日志拦截器），这是最标准的写法。

  ```python
  def wrapper(*args, **kwargs):
      print("拦截到了参数:", args, kwargs)
      # 把这些参数原封不动转给另一个函数
      real_function(*args, **kwargs)
  ```

| 出现位置                             | 作用             | 名称           | 结果                               |
| :----------------------------------- | :--------------- | :------------- | :--------------------------------- |
| **函数定义时**：`def func(*args)`    | **打包**（收集） | 可变位置参数   | `args` 变成一个 `tuple`。          |
| **函数定义时**：`def func(**kwargs)` | **打包**（收集） | 可变关键字参数 | `kwargs` 变成一个 `dict`。         |
| **函数调用时**：`func(*list)`        | **解包**（展开） | 拆解可迭代对象 | 把列表拆成独立的位置参数传进去。   |
| **函数调用时**：`func(**dict)`       | **解包**（展开） | 拆解字典       | 把字典拆成独立的关键字参数传进去。 |



## 自定义装饰器

### 最简单的装饰器

装饰器本质上是一个嵌套函数：

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("在函数调用前执行")
        result = func(*args, **kwargs)
        print("在函数调用后执行")
        return result
    return wrapper

# 使用 @ 语法糖
@my_decorator
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("Alice")
```

装饰器会“掩盖”原函数的 `__name__`、`__doc__` 等属性，导致调试困难。用 `@wraps` 修复：

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)          # 关键：将 func 的元数据复制给 wrapper
    def wrapper(*args, **kwargs):
        """这是 wrapper 的文档"""
        print("调用前")
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """这是 greet 的文档"""
    print(f"Hi, {name}")

print(greet.__name__)   # 输出: greet (若不加 wraps，则为 wrapper)
print(greet.__doc__)    # 输出: 这是 greet 的文档
```

**最佳实践**：编写任何装饰器都应使用 `@wraps`。



### 带参数的装饰器

如果需要向装饰器传递参数（例如指定重复次数、日志级别等），需要再增加一层嵌套：

```python
from functools import wraps

def repeat(times):                     # 外层接收参数
    def decorator(func):               # 中层接收被装饰函数
        @wraps(func)
        def wrapper(*args, **kwargs):  # 内层接收实际调用参数
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def say_hello(name):
    print(f"Hello, {name}")

say_hello("Bob")
# 输出三次 "Hello, Bob"
```

**调用链**：`@repeat(times=3)` → 先执行 `repeat(3)` 返回 `decorator`，然后 `@decorator` 再装饰函数。



### 装饰器接收任意参数（通用模式）

如果你希望装饰器既能**不带参数**使用，又能**带参数**使用，可以设计一个智能装饰器（但日常开发中通常分开写，避免复杂）。这里展示一种常见做法：

```python
from functools import wraps

def optional_decorator(func=None, *, prefix="[LOG]"):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            print(f"{prefix} 调用 {f.__name__}")
            return f(*args, **kwargs)
        return wrapper

    if func is None:
        # 带参数调用：@optional_decorator(prefix=">>>")
        return decorator
    else:
        # 无参数调用：@optional_decorator
        return decorator(func)

# 用法1：无参数
@optional_decorator
def f1(): pass

# 用法2：带参数
@optional_decorator(prefix=">>>")
def f2(): pass
```



### 类装饰器

装饰器不仅可以是函数，也可以是类。类装饰器利用 `__call__` 方法：

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"调用次数: {self.count}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hi():
    print("Hi!")

say_hi()  # 调用次数: 1
say_hi()  # 调用次数: 2
```

类装饰器适合需要维护状态的场景。



## **创建异步上下文管理器**

`@asynccontextmanager` 用于将 **异步生成器（async generator）** 快速转换为一个 **异步上下文管理器**，以便你使用 `async with` 语句。

- **典型用途**：管理数据库连接池、网络会话（aiohttp）、文件锁等需要“打开→使用→关闭”的资源。

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_connection():
    # 相当于 __aenter__：建立连接
    conn = await create_connection()
    print("获取连接")
    try:
        yield conn  # 把连接传给 async with 的 as 变量
    finally:
        # 相当于 __aexit__：确保关闭连接
        await conn.close()
        print("释放连接")

# 使用方式（注意是 async with，不是 @ 装饰函数）
async def main():
    async with get_db_connection() as conn:
        await conn.execute("SELECT ...")
```



# 内置

### 数学与数字运算

- **`abs(x)`**: 返回一个数的绝对值。
- **`sum(iterable, start=0)`**: 对一个可迭代对象（如列表）中的所有元素求和。
- **`max(iterable)` / `min(iterable)`**: 返回可迭代对象中的最大值或最小值。
- **`pow(x, y)`**: 计算 `x` 的 `y` 次方。
- **`round(x)`**: 对浮点数进行四舍五入。
- **`divmod(a, b)`**: 返回一个包含商和余数的元组



### 类型转换

- **`int(x)`**, **`float(x)`**, **`str(x)`**, **`bool(x)`**, **`list(x)`**, **`tuple(x)`**, **`dict(x)`**, **`set(x)`**: 用于将对象转换为相应的数据类型。
- **`bin(x)`**: 将一个整数转换为二进制字符串。
- **`chr(i)`**: 将一个整数（Unicode码点）转换为对应的字符。
- **`ord(c)`**: 将一个字符转换为其对应的 Unicode 码点整数。



### 序列与迭代器操作

- **`len(s)`**: 返回序列或集合的长度。
- **`enumerate(iterable, start=0)`**: 返回一个枚举对象，可以同时获取元素索引和值。
- **`range(start, stop, step)`**: 生成一个不可变的数字序列，常用于 `for` 循环。
- **`zip(\*iterables)`**: 将多个可迭代对象“压缩”成一个元组迭代器。
- **`reversed(seq)`**: 返回一个反向迭代器。
- **`sorted(iterable)`**: 返回一个新的已排序列表。
- **`all(iterable)`**: 如果可迭代对象中**所有**元素都为 `True`，则返回 `True`。
- **`any(iterable)`**: 如果可迭代对象中**至少一个**元素为 `True`，则返回 `True`。



### 对象与属性操作

- **`type(object)`**: 返回对象的类型。
- **`isinstance(object, classinfo)`**: 检查一个对象是否是某个类的实例。
- **`hasattr(object, name)`**: 检查对象是否有指定的属性。
- **`setattr(object, name, value)`** /: 用于设置对象的属性。
-  **`delattr(object, name)`**: 用于删除对象的属性。
- **`getattr(object, name)`** `**: 用于获取对象的属性。

  ```python
  getattr(object, name[, default])
  ```

  - **object**：要操作的对象
  - **name**：属性名的**字符串**（如 `'age'`）
  - **default**（可选）：如果属性不存在，返回该默认值；若不提供，则抛出 `AttributeError`

  **示例**

  ```python
  class User:
      name = "张三"
      age = 25
  
  user = User()
  
  # 普通写法（写代码时就知道属性名）
  print(user.name)          # 输出：张三
  
  # getattr 写法（属性名是字符串，可以动态变化）
  attr_name = "age"
  print(getattr(user, attr_name))  # 输出：25
  ```

  核心区别在于 **`attr` 是硬编码还是变量**：

  | 写法                    | 特点                                                         |
  | :---------------------- | :----------------------------------------------------------- |
  | `user.name`             | 属性名必须在写代码时确定，无法改变                           |
  | `getattr(user, 'name')` | 属性名是字符串，可以从变量、配置文件、数据库、用户输入中获取 |

  **典型场景**：你从配置文件中读到了字段名 `"email"`，想从对象中取这个字段，但不确定用户对象是否有这个属性。

  ```python
  # 假设从外部配置读取
  field_name = input("请输入你要查询的字段：")  # 用户输入 'age'
  value = getattr(user, field_name, "该字段不存在")
  print(value)
  ```

  **动态调用方法（非常实用）**

  `getattr` 不仅能取属性，还能取方法，然后直接调用：

  ```python
  class Calculator:
      def add(self, a, b):
          return a + b
      def sub(self, a, b):
          return a - b
  
  calc = Calculator()
  # 根据字符串动态决定调用哪个方法
  method_name = "add"   # 运行时可以是 "sub"
  func = getattr(calc, method_name)
  result = func(10, 5)  # 相当于 calc.add(10, 5)
  print(result)         # 15
  ```

  这在**插件系统、策略模式、命令分发**中非常常见。

  **与 `hasattr`、`setattr` 配合使用**

  这三个函数通常一起出现，用于属性的动态管理：

  ```python
  class Dog:
      name = "旺财"
  
  # 先检查有没有该属性
  if hasattr(dog, "name"):
      print(getattr(dog, "name"))  # 旺财
  
  # 动态设置新属性
  setattr(dog, "age", 3)
  print(getattr(dog, "age"))       # 3
  ```
- **`dir([object])`**: 返回对象的所有属性和方法列表。
- **`id(object)`**: 返回对象的唯一标识符（内存地址）。
- **`callable(object)`**: 检查一个对象是否可调用（如函数或类）。



### 输入/输出与执行

- **`print(\*objects)`**: 将对象打印到控制台。
- **`input([prompt])`**: 从控制台读取用户输入。
- **`open(file, mode='r')`**: 打开一个文件，返回文件对象。
- **`help([object])`**: 启动内置的帮助系统。
- **`dir([object])`**: 在没有参数时，返回当前作用域内的变量、方法和定义的类型列表。
- **`eval(expression)`**: 执行一个字符串表达式，并返回结果。
- **`exec(object)`**: 执行更复杂的 Python 代码字符串或编译对象。



### 其他重要函数

- **`super()`**: 用于调用父类的方法。

- **`property()`**: 用于在类中创建属性（getter/setter）。

- **`classmethod()`** / **`staticmethod()`**: 用于定义类方法和静态方法。

- **`breakpoint()`**: 在代码中设置一个断点，进入调试器。

  

# 标准库

Python 内置的一些常用的库；

## enum

``` python
from enum import Enum

# 1. 定义一个类，继承 Enum
class Color(Enum):
    # 2. 定义成员：变量名 = 值
    RED = 1
    GREEN = 2
    BLUE = 3
```

访问枚举成员

``` python
# 方法1：通过属性（最推荐，像对象一样）
print(Color.RED)           # 输出：Color.RED
print(Color.RED.name)      # 输出：'RED'（获取标签名）
print(Color.RED.value)     # 输出：1（获取对应的值）

# 方法2：通过字典键名（字符串）
print(Color['GREEN'])      # 输出：Color.GREEN

# 方法3：通过值反向查找（把值转成枚举）
print(Color(3))            # 输出：Color.BLUE
```

自动赋值

``` python
from enum import Enum, auto

class Status(Enum):
    PENDING = auto()  # 自动赋值为 1
    RUNNING = auto()  # 自动赋值为 2
    DONE = auto()     # 自动赋值为 3

print(Status.RUNNING.value)  # 输出：2
```

遍历枚举

``` python
class Weekday(Enum):
    MON = 1
    TUE = 2
    WED = 3

# 列出所有成员
for member in Weekday:
    print(f"标签: {member.name}, 值: {member.value}")

# 输出：
# 标签: MON, 值: 1
# 标签: TUE, 值: 2
# 标签: WED, 值: 3

# 获取所有成员的数量
print(len(Weekday))  # 输出：3
```

枚举对比

``` python
color1 = Color.RED
color2 = Color.RED
color3 = Color(1)  # 通过值 1 获取，本质上也是 RED

print(color1 is color2)   # 输出：True（同一个对象）
print(color1 == color3)   # 输出：True（值相等）
print(color1 is color3)   # 输出：True（其实也是同一个，枚举是单例）

# 注意：枚举不能直接和数字比较！
print(Color.RED == 1)     # 输出：False（哪怕值是1，但类型不同）
```

**强制要求枚举类中的所有成员值唯一值**

``` python
from enum import Enum, unique

# 加上 @unique 装饰器
@unique
class Status(Enum):
    PENDING = 1
    RUNNING = 2
    DONE = 3
    # 这样写没问题，值 1, 2, 3 都不重复，程序正常跑
    
    DONE = 1  # 哎哟，DONE 和 PENDING 值重复了，都是 1 ValueError: duplicate values found in <enum 'Status'>: DONE -> PENDING
```

### **IntEnum**

值必须是整数，且能直接和数字比大小，可以拿它直接和数字做 `==`、`<`、`>` 运算，甚至做加减法

``` python
from enum import Enum, IntEnum

# 1. 普通 Enum（值虽然是数字，但类型是 Enum）
class StatusEnum(Enum):
    PENDING = 1
    DONE = 2

# 2. IntEnum（值既是数字，类型也是 int 的子类）
class StatusIntEnum(IntEnum):
    PENDING = 1
    DONE = 2

# ---- 测试比较 ----
print(StatusEnum.PENDING == 1)   # 输出：False（类型不同，Enum 对象不等于 int）
print(StatusIntEnum.PENDING == 1) # 输出：True（类型兼容，直接相等）

# ---- 测试排序/运算 ----
print(StatusIntEnum.DONE > StatusIntEnum.PENDING) # 输出：True（可以比大小）
print(StatusIntEnum.PENDING + 1)  # 输出：2（可以直接当数字用）
```

### **StrEnum**

值必须是字符串，且处处表现得像字符串

**核心特性**：继承自 `str`，它的每个成员**本身就是个字符串**。你可以直接把它传给只接受字符串参数的函数，或者直接拼接到 URL、SQL 语句里。

``` python
from enum import Enum, StrEnum

# 1. 普通 Enum（值虽然是字符串，但类型是 Enum）
class ColorEnum(Enum):
    RED = "红色"
    BLUE = "蓝色"

# 2. StrEnum（值既是字符串，类型也是 str 的子类）
class ColorStrEnum(StrEnum):
    RED = "红色"
    BLUE = "蓝色"

# ---- 测试字符串拼接 ----
# 普通 Enum 报错！因为不能把 Enum 对象直接拼接到字符串里
# print("颜色是：" + ColorEnum.RED)  # TypeError: unsupported operand type(s)

# StrEnum 完美运行！因为它本身就是字符串
print("颜色是：" + ColorStrEnum.RED)  # 输出：颜色是：红色

# ---- 测试直接传给函数 ----
def show_color(color: str):
    print(f"当前颜色：{color}")

show_color(ColorStrEnum.RED)  # 完美通过，不需要写 .value
```

**Web 开发（Pydantic/FastAPI）的最佳实践**

因为 Pydantic 在验证时，如果收到字符串 `"红色"`，会自动帮你转成 `ColorStrEnum.RED`；当你 `model_dump()` 时，它会自动吐出字符串 `"红色"`。**你全程不用手动调用 `.value`，前后端交互丝滑无比**

### **ReprEnum**

**核心特性**：它**不改变**枚举的比较和行为，只改变 **`repr()`**（开发调试时的显示方式）。

**默认情况下**，`Enum` 的 `repr()` 会显示类名和值：

``` python
class Status(Enum):
    PENDING = 1
print(repr(Status.PENDING))  # 输出：<Status.PENDING: 1>


# 用了 ReprEnum（或者继承自它的 IntEnum/StrEnum），repr() 会直接显示原始值本身，看起来就像在打印一个普通数字或字符串，更清爽。

from enum import ReprEnum

class StatusRepr(ReprEnum):
    PENDING = 1
    DONE = 2

print(repr(StatusRepr.PENDING))  # 输出：1 （不再是 <StatusRepr.PENDING: 1>）
```

###  小结

**Web 后端 + Pydantic**： **无脑首选 `StrEnum`**、**`IntEnum`**（Python 3.11+）。它让枚举和字符串互转零成本，代码最干净。



### Flag

**核心特性**：它的成员值必须是 2 的幂次方（1, 2, 4, 8, 16...），这样才能通过二进制位进行无冲突的组合。

- 使用 `auto()` 时，它会自动从 1 开始翻倍（1, 2, 4, 8...），不用你手动算。
- 支持位运算符：`|`（或，组合）、`&`（与，包含判断）、`~`（非，排除）、`^`（异或，切换）。

``` python
from enum import Flag, auto

class Permission(Flag):
    READ = auto()   # 1  (二进制 0001)
    WRITE = auto()  # 2  (二进制 0010)
    EXEC = auto()   # 4  (二进制 0100)
    DELETE = auto() # 8  (二进制 1000)

# 1. 组合权限：给一个用户赋予 读 + 写 + 执行
user_perm = Permission.READ | Permission.WRITE | Permission.EXEC
print(user_perm)  
# 输出：<Permission.READ|WRITE|EXEC: 7>  (因为 1+2+4=7)

# 2. 判断权限：用户是否有 写 权限？
if user_perm & Permission.WRITE:
    print("有写权限")  # 输出：有写权限

# 3. 判断权限：用户是否有 删除 权限？
if user_perm & Permission.DELETE:
    print("有删除权限")  # 输出：(无输出，因为没有)

# 4. 剔除某个权限（去掉 执行 权限）
user_perm = user_perm & ~Permission.EXEC
print(user_perm)  # 输出：<Permission.READ|WRITE: 3>

# 5. 切换权限（如果有就删掉，如果没有就加上）
user_perm = user_perm ^ Permission.EXEC  # 加上 EXEC
user_perm = user_perm ^ Permission.EXEC  # 再点一下，又去掉 EXEC
```

### IntFlag

**核心特性**：它同时继承了 `Flag` 和 `int`。除了拥有上述所有组合能力外，它**可以直接和整数做 `==` 比较**，并且 `repr()` 显示的是数字。

**适用场景**：当你需要把组合后的结果存入数据库的整数字段，或者读取数据库里的整数直接还原成权限组合时。

``` python
from enum import IntFlag, auto

class Permission(IntFlag):
    READ = auto()   # 1
    WRITE = auto()  # 2
    EXEC = auto()   # 4

# 组合后，它可以直接当整数用
user_perm = Permission.READ | Permission.WRITE
print(user_perm)          # 输出：<Permission.READ|WRITE: 3>
print(user_perm == 3)     # 输出：True (IntFlag 可以直接和 int 比)
print(int(user_perm))     # 输出：3 (存数据库时直接转 int)

# 从数据库读出来整数 3，可以完美还原成枚举组合
db_value = 3
restored_perm = Permission(db_value)
print(restored_perm)      # 输出：<Permission.READ|WRITE: 3>
print(restored_perm & Permission.READ)  # 输出：Permission.READ (说明包含读)
```

### property

可以在枚举类内部定义 `@property`，给每个枚举成员附加一个动态计算出来的属性或方法。这在业务中非常实用。

**比如**：根据订单状态，动态返回“是否可编辑”和“显示颜色”。

``` python
from enum import Enum

class OrderStatus(Enum):
    PENDING = '待支付'
    PAID = '已支付'
    SHIPPED = '已发货'

    @property
    def is_editable(self) -> bool:
        """只有待支付状态才允许编辑"""
        return self == OrderStatus.PENDING

    @property
    def display_color(self) -> str:
        """给前端返回对应的UI颜色"""
        if self == OrderStatus.PENDING:
            return 'orange'
        elif self == OrderStatus.PAID:
            return 'blue'
        else:
            return 'green'

# --- 使用效果 ---
status = OrderStatus.PENDING
print(status.is_editable)    # 输出：True
print(status.display_color)  # 输出：orange
```



## re

正则





## dataclasses

`dataclasses` 是 Python 3.7 引入的**标准库模块**（内置，无需安装）。它提供了一个 `@dataclass` 装饰器，用于自动生成类中常见的特殊方法（如 `__init__`、`__repr__`、`__eq__`）。

它与 Pydantic 的核心区别在于：**`dataclasses` 只做“代码生成”，不做“数据校验”。**

### 场景 1：服务层

### （`services/`）的内部数据传输对象（DTO）

当一个 HTTP 请求进来，你已经通过 Pydantic 校验过数据（在 `endpoints` 层），然后要把它传给 `services` 层处理。

- 此时数据**来源可靠**（已经被校验过），不需要再次校验。
- 如果你继续用 Pydantic 去包装它，会额外消耗 CPU 进行重复校验。
- 使用 `dataclass` 作为轻量级容器，只负责“装数据”，避免二次校验开销。

```python
from dataclasses import dataclass

# 服务层内部使用的数据容器（无需校验）
@dataclass
class OrderItemDTO:
    product_id: int
    quantity: int
    price: float

class OrderService:
    def calculate_total(self, items: list[OrderItemDTO]) -> float:
        return sum(item.price * item.quantity for item in items)
```

### 高频创建对象的性能敏感路径

如果你需要在一秒钟内创建数十万乃至百万级的数据对象（例如批量数据处理、日志解析、机器学习特征工程），Pydantic 的校验开销会非常明显。

`dataclass` 在实例化时**不执行任何类型检查**，速度接近原生 Python 类，但提供了简洁的语法。此时使用 `dataclass` 可以显著降低 CPU 占用。

```python
from dataclasses import dataclass

# 极简数据容器，无校验，适用于高频创建
@dataclass
class Point:
    x: float
    y: float

# 循环中创建百万个 Point，速度远快于 Pydantic
points = [Point(i * 0.1, i * 0.2) for i in range(1000000)]
```

### 需要可变（Mutable）数据模型

`dataclass` 默认是**可变（mutable）**的，你可以直接修改实例的属性值（`obj.attr = new_value`）。

虽然 Pydantic 也可以通过 `ConfigDict(frozen=False)` 实现可变，但 `dataclass` 在语法上更自然、更轻量，且不需要导入第三方库。

```python
from dataclasses import dataclass

@dataclass
class ProcessingContext:
    current_step: int
    total_steps: int
    status: str

# 直接修改属性
ctx = ProcessingContext(0, 10, "idle")
ctx.current_step += 1  # 无需重新构造整个对象
```

### 附注（实际项目中的现状）

在真实的 FastAPI 代码库中，由于 Pydantic V2 的性能已经足够好（比 V1 快很多），许多开发者为了保持代码风格统一，会在 `services` 层**继续使用 Pydantic**，而不切换到 `dataclass`，只有在压测发现性能瓶颈时才会替换。



## typing

`typing` 是 Python 标准库，用于为变量、函数和类提供静态类型注解（Type Hints），其核心价值在于供 IDE 和静态检查工具（如 mypy）进行类型推断与错误提示；**Python 解释器默认完全忽略这些注解，不对运行时行为产生任何约束**，但第三方库（如 Pydantic）可在运行时主动读取 `__annotations__` 元数据以驱动校验逻辑。

### 高级用法

#### Annotated

**`Annotated` 就是一个“附加信息贴纸”。你不贴它，功能照样能写；贴了它，FastAPI/Pydantic 就能读懂额外的校验要求，让你的代码更清晰、更易复用。**

``` python
from typing import Annotated
from fastapi import Path

# 定义一次，多处复用
UserId = Annotated[int, Path(ge=1, description="用户唯一标识")]

@app.get("/user/{user_id}")
def get_user(user_id: UserId): ...   # 干净到爆

@app.delete("/user/{user_id}")
def delete_user(user_id: UserId): ...
```

#### Optional```旧语法```

可空类型（等价 `T | None`，Python 3.10+ 推荐用 `|`）

```python
name: Optional[str] = None
```

推荐新写法

``` python
name: str | None = None

name = 'hello'
```



#### Union```旧语法```

联合类型（等价 `T1 | T2`）

```python
age: Union[int, float] = 1
age = 1.2
```

推荐新写法

``` python
age: int | float = 1

age = 1.2
```



#### Literal限制输入字面量

限制为特定字面量值

```python
name: Literal["admin", "user"] = "admin"
```

#### Any任意类型

任意类型（跳过类型检查）

``` python
data: Any = 123
```

#### Callable函数

用于表示**一个可调用对象（通常是函数）的类型签名**

- **`Callable`**：表示“这是一个函数/可调用对象”。
- **`[ArgType]`**：方括号内是**参数类型列表**，按顺序列出所有参数的类型。
- **`ReturnType`**：最后一个元素是**返回类型**。

``` python
from typing import Callable

# 定义一个函数，接收另一个函数作为参数
def execute(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# 使用
def add(x: int, y: int) -> int:
    return x + y

result = execute(add, 3, 5)   # result = 8
```

#### Sequence

- **含义**：表示一个**有序、可索引、支持长度查询**的集合（如 `list`、`tuple`、`str`）。
- **特性**：支持 `[i]` 索引和 `len()`，但**不保证可变**（比 `list` 更抽象）。
- **对比 TypeScript**：`ReadonlyArray<T>` 或 `T[]`。

``` python
from typing import Sequence

def get_first(items: Sequence[int]) -> int | None:
    return items[0] if items else None

get_first([1, 2, 3])   # ✅
get_first((1, 2, 3))   # ✅
```

#### Iterable

- **含义**：表示**可被 `for` 循环遍历**的对象（实现了 `__iter__`）。
- **特性**：比 `Sequence` 更宽泛（生成器、集合、文件流都算）。**不保证有 `len()` 或支持 `[i]`**。

- **对比 TypeScript**：`Iterable<T>`。

``` python
from typing import Iterable

def log_all(items: Iterable[str]) -> None:
    for item in items:
        print(item)

log_all(["a", "b"])        # ✅
log_all(iter(["a", "b"]))  # ✅
```

#### TypeVar泛型

- **含义**：定义**泛型变量**，用于表示“某个类型，但不具体指明”，保证函数签名中多个参数/返回值的类型一致。
- **对比 TypeScript**：`T = TypeVar('T')` 相当于 `<T>` 或 `T` 泛型参数。

``` python
from typing import TypeVar, list

T = TypeVar('T')

def first(items: list[T]) -> T | None:
    return items[0] if items else None

# 调用时类型推断：
a: int | None = first([1, 2, 3])   # T 被推断为 int
b: str | None = first(["a", "b"])  # T 被推断为 str
```

#### Generic泛型类

`Generic` 是 `typing` 模块中的一个**标记类（Marker Class）**。它的唯一作用就是告诉静态类型检查器（如 mypy）和 IDE（如 PyCharm）：“**我这个类是一个泛型类，里面有一个占位符类型，具体是什么等你实例化的时候再定。**”

从技术上讲，它等同于 TypeScript 中在类名后面写的 **`<T>`**。

```python
from typing import TypeVar, Generic

T = TypeVar('T')

# ✅ 正确写法：继承 Generic[T]，将 T 绑定到该类
class GoodBox(Generic[T]):
    def __init__(self, content: T):
        self.content: T = content
    
    def get(self) -> T:
        return self.content

# 实例化时指定类型
box_int: GoodBox[int] = GoodBox(123)
result = box_int.get()  # mypy/IDE 知道 result 是 int，提供 int 的方法补全

# 如果试图传字符串给期望 int 的引用
# box_str: GoodBox[int] = GoodBox("hello")  # ❌ mypy 报错：类型不匹配
```

#### TypedDict

- **含义**：定义**字典的精确结构**（键名和值类型）。
- **特性**：运行时只是一个普通字典，仅用于静态检查。适合解析 JSON 或非 Pydantic 场景。
- **对比 TypeScript**：`interface` 或 `type` 定义对象形状。

``` python
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int

def process(user: User) -> None:
    print(user["name"])

process({"name": "张三", "age": 25})   # ✅ 类型检查通过
```

## json

`json` 是 Python 的**内置标准库**，用来在 **Python 对象** 和 **JSON 字符串** 之间互相转换。

**JS 理解**：JSON 在 Python 里长得很像字典（`dict`），但 Python 的 `dict` 是内存里的对象，JSON 是用于传输或存储的**文本字符串**。

### 用法

#### dumps

Python → JSON 字符串

``` py
import json

data = {
    "name": "张三",
    "age": 25,
    "is_active": True,
    "scores": [90, 85, 95],
    "address": None
}

json_str = json.dumps(data)
print(json_str)
# 输出：{"name": "\u5f20\u4e09", "age": 25, "is_active": true, "scores": [90, 85, 95], "address": null}
```

#### loads

JSON 字符串 → Python

``` python
json_str = '{"name": "李四", "age": 30}'
data = json.loads(json_str)
print(data["name"])   # 李四
print(type(data))     # <class 'dict'>
```

#### dump

Python → JSON 文件

``` python
data = {"name": "王五", "age": 28}
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
# 直接写入文件，不需要手动转字符串
```

#### load

从 JSON 文件 → Python

``` python
with open("user.json", "r", encoding="utf-8") as f:
    data = json.load(f)
print(data)   # {'name': '王五', 'age': 28}
```

### 类型对照表

| Python 类型      | JSON 类型 | 举例            |
| :--------------- | :-------- | :-------------- |
| `dict`           | `object`  | `{"name": "A"}` |
| `list` / `tuple` | `array`   | `[1, 2, 3]`     |
| `str`            | `string`  | `"hello"`       |
| `int` / `float`  | `number`  | `123` / `3.14`  |
| `True`           | `true`    | **注意大小写**  |
| `False`          | `false`   | **注意大小写**  |
| `None`           | `null`    | **注意写法**    |

### 常用参数

#### indent

美化缩进

``` python
print(json.dumps(data, indent=2))
# 输出带缩进的 JSON，方便阅读
```

#### ensure_ascii

ensure_ascii=False：显示中文（重要！）

``` py
json.dumps({"name": "张三"}, ensure_ascii=False)
# 输出：{"name": "张三"}（而不是 \u5f20\u4e09）
```

#### default

处理自定义对象（如 Pydantic 模型）

``` python
def custom_encoder(obj):
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    raise TypeError

json.dumps(data, default=custom_encoder)
```



## operator

operator 是 Python 的一个内置模块，把常见的运算符（如 +、-、==、getitem 等）变成了函数，方便函数式编程和高阶函数使用。

### 三大核心功能分类

对应算术、比较和位运算，注意名称带下划线的是为了规避关键字（如 `and`、`or`）。

```python
from operator import add, mul, lt, and_, or_

# 替代 lambda x, y: x + y
print(add(10, 20))        # 30
print(mul(3, 5))          # 15

# 比较运算
print(lt(2, 5))           # True (less than)
print(and_(True, False))  # False (注意是 and_)
```



### 其他待补充



# pydantic

Pydantic 是一个 Python 库，它利用 Python 的类型注解（Type Hints）在**程序运行时（Runtime）**对数据进行**解析**（Parsing）和**校验**（Validation）。

pydantic是 **“运行时”** 的类型增强引擎。它接管了 `typing` 的注解，在**程序实际运行**的时候，强制保证数据必须符合你定义的类型，如果不符则报错，如果可转换则自动转换。

Pydantic 模型 = **TypeScript 的 Interface（定义形状）+ Zod 的运行时验证（自动检查/转换）+ 内置的 toJSON/toObject 方法。**

**普通 Python 函数（只有 `typing`，无 Pydantic）**

``` python
def greet(name: str) -> str:
    return f"Hello {name}"

# 运行时不报错，但返回了错误的结果
greet(123)  # 返回 "Hello 123"（字符串拼接了整数，没触发任何类型保护）
```

**使用 Pydantic 后（类型被“增强”了）**

``` python
from pydantic import BaseModel

class User(BaseModel):
    name: str

# 运行时会被拦截或自动转换
User(name=123)  # ✅ 自动把 123 转成字符串 "123"
User(name=None) # ❌ 抛出 ValidationError，因为 None 无法转为 str
```

### 用法

``` python
class User(BaseModel):
    name: str
    age: int
    is_active: bool = True  # 带默认值，实例化时可省略

"""实例化"""
# 正常传入
user_1 = User(name="Alice", age=30)
print(user_1.name)  # 输出：Alice
print(user_1.age)   # 输出：30

"""自动类型转换（这是 Pydantic 的核心能力）"""
# 即使 age 传入了字符串 "30"，Pydantic 也会自动转换为整数 30
user_2 = User(name="Bob", age="30")  
print(type(user_2.age))  # 输出：<class 'int'>

"""自动类型转换（这是 Pydantic 的核心能力）"""
# 即使 age 传入了字符串 "30"，Pydantic 也会尝试自动转换为整数 30
user_2 = User(name="Bob", age="30")  
print(type(user_2.age))  # 输出：<class 'int'>

"""校验失败（对应 Zod 的 .parse 报错）"""
try:
    user_3 = User(name="Charlie", age="not a number")
except Exception as e:
    print(e)  # 输出详细的校验错误信息

    
from pydantic import BaseModel, Field

class CalculateInput(BaseModel):
    """计算输入"""
    a: float = Field(description="第一个参数")
    b: float = Field(description="第二个参数")

def calculate(input_args: CalculateInput):
    print(input_args.a)
    print(input_args.b)

calculate(CalculateInput(a=1.2, b=2.3))
```

### Field

`Field` 是一个函数，它返回一个 `FieldInfo` 对象，用于存储字段的校验规则和元数据。

``` python
from pydantic import Field
```

#### **基本用法**

`Field` 作为类属性的默认值（在 `=` 号右边）使用。它的**第一个位置参数**是 `default`，表示默认值。

使用 `...`（三个点，Python 的 Ellipsis 对象）表示 **该字段是必填的，没有默认值**（类似于 Zod 的 `z.string()` 默认必填）。

也可以直接传入具体的值作为默认值。

``` python
from pydantic import BaseModel, Field

class Product(BaseModel):
    # 必填，且字符串长度必须在 1 到 50 之间
    name: str = Field(..., min_length=1, max_length=50)
    
    # 必填，数值必须大于 0
    price: float = Field(..., gt=0)
    
    # 可选字段（有默认值），且长度不超过 100
    description: str = Field(default="", max_length=100)
```

#### **常用校验参数列表**

| 参数名        | 类型          | 说明                                   | 对应 Zod 方法              |
| :------------ | :------------ | :------------------------------------- | :------------------------- |
| `min_length`  | `int`         | 字符串最小长度                         | `z.string().min()`         |
| `max_length`  | `int`         | 字符串最大长度                         | `z.string().max()`         |
| `pattern`     | `str`         | 正则表达式                             | `z.string().regex()`       |
| `gt`          | `int`/`float` | 数值必须大于（Greater Than）           | `z.number().gt()`          |
| `ge`          | `int`/`float` | 数值必须大于或等于（Greater or Equal） | `z.number().gte()`         |
| `lt`          | `int`/`float` | 数值必须小于（Less Than）              | `z.number().lt()`          |
| `le`          | `int`/`float` | 数值必须小于或等于（Less or Equal）    | `z.number().lte()`         |
| `multiple_of` | `int`/`float` | 数值必须是该值的倍数                   | `z.number().multipleOf()`  |
| `description` | `str`         | 字段描述（用于生成 OpenAPI 文档）      | 无直接对应（可类比 JSDoc） |
| `examples`    | `list`        | 示例值列表（用于文档）                 | 无直接对应                 |

**关于 `Annotated` 的说明（重要）**

在 FastAPI 和 Pydantic V2 中，推荐使用 `Annotated` 语法。它把类型和校验规则分开了，但功能上与直接 `= Field(...)` 完全等价。

- 直接写法：`name: str = Field(..., min_length=1)`
- `Annotated` 写法：`name: Annotated[str, Field(min_length=1)] = ...`

**特别注意（常见错误）**
`Field` **只能用在 Pydantic 模型的类属性中**，不能用在普通函数参数上。

``` python
# ❌ 错误写法（Field 在普通函数中无效）
def get_user(user_id: int = Field(..., gt=0)):
    pass

# ✅ 正确写法（Field 在 Pydantic 模型内部）
class UserRequest(BaseModel):
    user_id: int = Field(..., gt=0)
```

### 高级类型

**可选字段与 `None`**
在 TypeScript 中，如果你定义一个字段为 `name?: string`，它表示该字段可以不传，传了就必须是字符串。
在 Python 中，**是否可选由“是否有默认值”决定**，而不是由类型注解决定。

- `name: str`：必填。
- `name: str = "default"`：可选，有默认值。
- `name: str | None`：**必填，但允许传入 `null`（Python 中的 `None`）**。
- `name: str | None = None`：**可选，不传则默认为 `None`**。

``` python
from pydantic import BaseModel

class User(BaseModel):
    # 必填，且不能为 None
    id: int
    
    # 必填，但可以为 None（前端必须传这个键，但值可以是 null）
    nickname: str | None  
    
    # 可选，不传则默认为 None
    email: str | None = None
```

对比 TS

``` typescript
interface User {
    id: number;                    // 必填
    nickname: string | null;       // 必填，但值可为 null
    email?: string | null;         // 可选，不传或传 null 都行
}
```

**联合类型（`Union`）**
在 TypeScript 中，如果一个字段可以是数字或字符串，你写 `age: number | string`。
在 Python 中，使用 `|` 操作符（Python 3.10+）来实现。

``` python
from pydantic import BaseModel

class Item(BaseModel):
    # 可以是整数，也可以是浮点数
    score: int | float
    
    # 可以是字符串，也可以是 None（Python 3.10+ 语法）
    tag: str | None = None
```

**字面量限制（`Literal`）**
在 TypeScript 中，你经常使用字符串字面量联合类型：`status: "pending" | "approved" | "rejected"`。
在 Python 中，从 `typing` 模块导入 `Literal` 实现完全相同的功能。

``` python
from typing import Literal
from pydantic import BaseModel

class Order(BaseModel):
    # status 只能是这三个字符串之一
    status: Literal["pending", "approved", "rejected"] = "pending"
```

### 嵌套模型与列表

实际 API 数据通常是嵌套结构，例如 `{"user": {"name": "Alice", "age": 30}, "tags": ["a", "b"]}`。

****
一个 Pydantic 模型的字段类型可以是另一个 Pydantic 模型。这与 TypeScript 的 `interface` 嵌套完全一致。

``` python
from pydantic import BaseModel

"""
定义子模型
"""
class Address(BaseModel):
    street: str
    city: str
    zip_code: int

"""
在父模型中使用子模型
将 Address 类作为 User 的一个字段类型。
"""
class User(BaseModel):
    name: str
    address: Address  # 嵌套模型

user = User(
    name="Alice",
    address={"street": "Main St", "city": "Metropolis", "zip_code": 12345}
)

print(user.address.city)  # 输出：Metropolis
print(type(user.address)) # 输出：<class '__main__.Address'>
```

**列表（数组）类型**
使用 Python 的 `list[类型]` 语法来定义数组。元素类型可以是基础类型，也可以是嵌套模型。

``` python
user = User(
    name="Bob",
    tags=["admin", "vip"],
    addresses=[
        {"street": "1st Ave", "city": "NYC", "zip_code": 10001},
        {"street": "2nd Ave", "city": "LA", "zip_code": 90001}
    ]
)

print(user.tags[0])          # 输出：admin
print(user.addresses[0].city) # 输出：NYC
```

如果传入的 `addresses` 列表中某个字典缺少字段，或包含无效类型，Pydantic 会抛出 `ValidationError`。

### 数据序列化

Pydantic 模型实例在内存中是一个 Python 对象，包含了所有字段数据。在将其输出给前端（如 API 响应）、存入缓存或写入日志时，必须将其转换为 **JSON 字符串**或**普通字典**。

Pydantic V2 中，序列化使用以下两个方法：

| 方法                | 返回类型             | 对应 JS/TS 操作                                              |
| :------------------ | :------------------- | :----------------------------------------------------------- |
| `model_dump()`      | Python 字典 (`dict`) | `{ ...user }` 或 `JSON.parse(JSON.stringify(user))` 的中间步骤 |
| `model_dump_json()` | JSON 字符串 (`str`)  | `JSON.stringify(user)`                                       |

**使用 `model_dump()` 转为字典**
将模型实例转换为纯 Python 字典，适合用于写入数据库或进一步处理。

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

user = User(name="Alice", age=30)

# 转为字典
data_dict = user.model_dump()
print(data_dict)        # 输出：{'name': 'Alice', 'age': 30}
print(type(data_dict))  # 输出：<class 'dict'>
```

**使用 `model_dump_json()` 转为 JSON 字符串**
直接生成符合 JSON 标准的字符串，适合用于 HTTP 响应体。

``` python
# 转为 JSON 字符串
json_str = user.model_dump_json()
print(json_str)        # 输出：{"name":"Alice","age":30}
print(type(json_str))  # 输出：<class 'str'>
```

如果字段包含中文，默认会被转义为 Unicode 编码（如 `\u5f20`）。要保留原始中文，可使用 `ensure_ascii=False` 参数：

``` python
user_cn = User(name="张三", age=25)
print(user_cn.model_dump_json(ensure_ascii=False))
# 输出：{"name":"张三","age":25}
```

**排除未设置默认值的字段**
在 API 响应中，有时你希望不返回值为 `None` 或不存在的字段。你可以使用 `exclude_unset=True` 选项：

``` python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str
    nickname: str | None = None   # 有默认值，意味着可选

user = User(name="Bob")  # 未传入 nickname，使用默认值 None

# 默认序列化会包含 nickname: None
print(user.model_dump())  # 输出：{'name': 'Bob', 'nickname': None}

# 排除未显式设置的字段
print(user.model_dump(exclude_unset=True))  # 输出：{'name': 'Bob'}
```

**框架中的自动序列化**
在 FastAPI 中，当你直接返回一个 Pydantic 模型实例时，框架会在后台自动调用 `model_dump()` 将其转换为字典，再进一步序列化为 JSON。因此，在路由中你通常不需要手动调用序列化方法，但理解这一过程有助于调试。

### 配置模型全局行为

Pydantic 模型除了字段定义外，还可以通过一个名为 `model_config` 的类属性，设置**作用于整个模型的全局行为**。这类似于 TypeScript 中 ESLint 的全局规则，或 Zod 中 `.strict()` / `.strip()` 的设置。

**基础语法**
在模型类内部，直接赋值 `model_config = ConfigDict(参数=值, ...)`。

``` python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(extra="forbid")  # 禁止额外字段
    
    name: str
```

**核心配置参数**

**`extra`：控制额外字段的处理**
当实例化模型时，如果传入了模型中没有定义的字段，此参数决定如何处理。

| 取值       | 行为                                                 | 对应 TS 类比                                     |
| :--------- | :--------------------------------------------------- | :----------------------------------------------- |
| `"forbid"` | **禁止**。遇到未定义字段直接抛出 `ValidationError`。 | 类似 TS 对对象字面量的严格检查（`exact` 模式）。 |
| `"ignore"` | **忽略**。静默丢弃未定义字段，不报错。               | 类似 Zod 的 `.strip()`。                         |
| `"allow"`  | **允许**。接受未定义字段，并存储在模型内部。         | 类似 Zod 的 `.passthrough()`。                   |

``` python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str

# 传入额外字段 "age"，触发错误
try:
    User(name="Alice", age=30)
except Exception as e:
    print(e)  # 抛出 ValidationError
```

**`str_strip_whitespace`：自动去除字符串首尾空格**
当设为 `True` 时，所有字符串字段在解析时会自动执行 `.strip()`。

``` python
class User(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str

user = User(name="  Alice  ")
print(user.name)  # 输出：Alice（前后空格已被去除）
```

**`frozen`：将模型设为不可变**
当设为 `True` 时，实例化后属性不可修改，类似于 TypeScript 的 `readonly` 或 `const` 断言。

``` python
class User(BaseModel):
    model_config = ConfigDict(frozen=True)
    name: str

user = User(name="Alice")
# user.name = "Bob"  # ❌ 这行会抛出异常，因为 frozen=True
```

**其他常用配置参数（速查）**

| 参数名                 | 类型   | 说明                                                         |
| :--------------------- | :----- | :----------------------------------------------------------- |
| `populate_by_name`     | `bool` | 是否允许使用字段的别名（`alias`）来填充数据（默认 `False`）。 |
| `validate_assignment`  | `bool` | 设置为 `True` 时，修改属性也会触发校验（默认只有创建时校验）。 |
| `extra`                | `str`  | 上述的额外字段处理。                                         |
| `str_strip_whitespace` | `bool` | 自动去除字符串首尾空格。                                     |
| `frozen`               | `bool` | 模型实例是否不可变。                                         |

###  自定义校验器

`Field` 函数提供了基础的规则（如 `min_length`、`gt`）。当校验逻辑涉及跨字段比较、外部 API 调用或正则匹配时，你需要编写自定义校验函数。

在 Pydantic 中，通过 **`@field_validator`** 装饰器为单个字段添加自定义校验逻辑。

**导入装饰器**

```python
from pydantic import BaseModel, field_validator
```

**基本语法与要求**

- 装饰器参数：`@field_validator("字段名")`，可以同时指定多个字段，如 `@field_validator("name", "nickname")`。
- 方法必须定义为 **类方法（`@classmethod`）**。
- 第一个参数为 `cls`（类本身），第二个参数为待校验的值 `v`。
- 方法必须返回校验后的值（通常是原值，或经过清洗的值）。
- 如果校验失败，抛出 `ValueError` 或 `AssertionError`，Pydantic 会自动将其转换为 `ValidationError`。

**对标 JS/TS（Zod）**

- Zod：`z.string().refine((val) => val.length > 0, { message: "不能为空" })`
- Pydantic：通过 `@field_validator` 实现等价的 `refine`。

**示例：禁止字符串包含数字**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        # 如果包含数字，抛出错误
        if any(char.isdigit() for char in v):
            raise ValueError("name 字段不能包含数字")
        return v  # 必须返回清洗后的值

# 测试
try:
    user = User(name="Alice123")
except Exception as e:
    print(e)  # 抛出 ValidationError，提示 name 字段不能包含数字
```

**多个字段使用同一个校验器**

```python
class User(BaseModel):
    name: str
    nickname: str

    @field_validator("name", "nickname")
    @classmethod
    def validate_no_numbers(cls, v: str) -> str:
        if any(char.isdigit() for char in v):
            raise ValueError("不能包含数字")
        return v
```

**访问其他字段的值（`info` 参数）**
如果校验逻辑需要依赖其他字段的值，可以声明 `info` 参数（类型为 `ValidationInfo`）。

```python
from pydantic import BaseModel, field_validator, ValidationInfo

class User(BaseModel):
    password: str
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm(cls, v: str, info: ValidationInfo) -> str:
        # info.data 包含所有已校验字段的字典
        password = info.data.get("password")
        if v != password:
            raise ValueError("两次输入的密码不匹配")
        return v
```

默认情况下，如果字段值为 `None`，`@field_validator` **不会被调用**。

#### 强制校验 `None`（使用 `mode="before"`）

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v: str | None) -> str:
        if v is None:
            raise ValueError("name 字段不能为 None")
        return v

try:
    user = User(name=None)
except Exception as e:
    print(e)  # 抛出 ValidationError，提示不能为 None
```

#### 跨字段校验

当校验逻辑需要同时访问**多个字段**的值时，无法使用 `@field_validator`（它只能访问当前字段）。此时需要使用 **`@model_validator`**，它在整个模型实例化完成后执行。

虽然 `@field_validator` 使用 `info`参数也能获取到，但是使用 **`@model_validator`**获取的时机

补充：`@model_validator` **默认是实例方法**，因此**不需要**加 `@classmethod` 装饰器

``` python
from pydantic import BaseModel, model_validator

class UserRegister(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserRegister":
        if self.password != self.confirm_password:
            raise ValueError("两次输入的密码不匹配")
        return self
```

### Pydantic 项目开发最佳实践

**使用 `extra="forbid"` 阻止未定义字段**

在 API 入口处，默认应阻止客户端传入未定义的字段，以避免数据模型与业务逻辑不一致。

```python
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    email: str
```

如果客户端传入 `{"name": "a", "email": "b", "unknown": "x"}`，Pydantic 会直接抛出 `ValidationError`。

**为 `Field` 添加 `description` 以自动生成文档**

Pydantic 模型的 `Field` 中的 `description`、`example`、`title` 会被 FastAPI 自动提取并生成 OpenAPI 文档（即 `/docs` 中的 Swagger UI）。对于团队协作，这是提高沟通效率的强制性实践。

```python
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, description="用户名，至少 1 个字符")
```



### 示例

``` python
class Item(BaseModel):
    # 禁止额外的字段，字符串字段去前导和尾随空格
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    # 必填，没有额外的元数据
    name_0: str
    # 可选，有额外的元数据
    name_1: Annotated[str, Field(description="项目的名称")]
    # 必填，但是可以输入为 null
    name_2: Annotated[str | None, Field(description="项目的名称")]
    # 可选, 有默认值 None(推荐)
    name_3: Annotated[str | None, Field(description="项目的名称")] = None
    # 可选, 有默认值 None(不推荐)
    name_4: Annotated[str | None, Field(default=None, description="项目的名称")]
    # 可选，有默认值
    name_5: Annotated[str | None, Field(description="项目的名称")] = "名称
    # 必填
    name_6: Annotated[str, Field(..., description="项目的名称")]
    # 可选，有默认值
    name_7: Annotated[str, Field(description="项目的名称")] = '名称'
```





# uv

创建uv环境

```shell
uv init --name 项目名称 --bare # --bare 精简模式 uv init 完整模式 项目名称不能包含中文

# 或者

uv init 项目名称 # 创建一个项目文件夹
```

设置虚拟环境门口

```shell
uv venv --python 3.13
```

安装项目全部依赖

```shell
uv sync 
```

添加依赖

```shell
uv add 依赖包名称
```

锁定

``` shell
uv lock
```



# 异步

**Python 的异步（asyncio）是一种基于协程的单线程并发编程模型。它通过事件循环（Event Loop）在等待 I/O 操作时主动让出控制权，从而实现高并发。它主要解决的是 I/O 密集型任务的性能问题，而非 CPU 密集型。**



### 核心三要素

1. **事件循环（Event Loop）**：总调度中心。它维护一个任务列表，不断地轮询哪些任务处于“可执行”状态，并调度它们运行。
2. **协程（Coroutine）**：通过 `async def` 定义的函数。调用时不会立即执行，而是返回一个协程对象。
3. **任务（Task）**：协程对象被包装成 `Task` 后，才真正被事件循环调度执行（通过 `create_task` 或 `ensure_future`）。



### 执行流程

“`asyncio.run(main())` 背后发生了什么？”

1. 创建一个新的事件循环。
2. 将 `main()` 协程包装成一个 `Task`。
3. 运行事件循环，直到 Task 执行完毕或遇到异常。
4. 关闭事件循环。

**关键点**：`await` 会**暂停当前协程**，并将控制权**交还给事件循环**，让事件循环去执行其他 Task。当等待的 I/O 操作完成后，事件循环会恢复这个协程。



### 并发与并行（容易踩坑）

- **并发（Concurrency）**：Python 异步实现的是并发，**不是并行**。它只有一个线程，靠快速切换任务来实现“同时”处理多个请求。
- **并行（Parallelism）**：需要多核 CPU，Python 由于 GIL 的存在，多线程并行受限（CPU 密集型任务需用 `multiprocessing`）。

**金句**：*Python 的 `asyncio` 让一个单线程拥有了处理成千上万连接的能力，但如果你在协程里做大量纯计算，它会阻塞整个事件循环。*



### Python vs Node.js

| 维度           | Node.js                                               | Python (asyncio)                                             |
| :------------- | :---------------------------------------------------- | :----------------------------------------------------------- |
| **默认生态**   | 标准库和主流 npm 包**默认都是异步**（回调/Promise）。 | 标准库**默认都是同步**（如 `time.sleep`、`open`、`requests`）。 |
| **调用即执行** | 调用异步函数，**立刻执行**（返回 Promise）。          | 调用异步函数，**只生成协程对象**，代码不跑。必须 `await` 或 `asyncio.run()` 驱动。 |
| **阻塞风险**   | 低（因为几乎没有同步标准库）。                        | **极高**（新手容易在 `async def` 里混入 `time.sleep` 或 `requests.get`，导致服务器卡死）。 |
| **语法区分**   | `await` 可以接任何值（自动包装）。                    | `await` **只能**接 `Awaitable` 对象（协程、Task、Future），否则报 `TypeError`。 |

**必背结论**：*Node.js 是“强制异步”，你不用 `async` 就拿不到结果；Python 是“主动选择异步”，你需要自己确保调用的库支持异步，否则 `async/await` 只是穿了件华丽的外衣，依然会阻塞。*











