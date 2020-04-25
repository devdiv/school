# Ruby

Ruby 是一种纯粹的面向对象编程语言。它由日本的松本行弘创建于 1993 年。

> Ruby 中文官网：[http://www.ruby-lang.org/zh_cn/](http://www.ruby-lang.org/zh_cn/)

## 中文编码

```ruby
#!/usr/bin/ruby -w
# -*- coding: UTF-8 -*-

puts "你好，世界！";
```

**注**：Ruby2.0~2.6 版本中文注释有可能需要使用: `# -*- coding: GBK -*-`

## 命令行选项

Ruby 一般是从命令行运行，方式如下：

```bash
$ruby [ options ] [.] [ programfile ] [ arguments ... ]
```

| 选项        | 描述                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| -a          | 与 -n 或 -p 一起使用时，可以打开自动拆分模式(auto split mode)。请查看 -n 和 -p 选项。                                                    |
| -c          | 只检查语法，不执行程序。                                                                                                                 |
| -C dir      | 在执行前改变目录（等价于 -X）。                                                                                                          |
| -d          | 启用调试模式（等价于 -debug）。                                                                                                          |
| -F pat      | 指定 pat 作为默认的分离模式（\$;）。                                                                                                     |
| -e prog     | 指定 prog 作为程序在命令行中执行。可以指定多个 -e 选项，用来执行多个程序。                                                               |
| -h          | 显示命令行选项的一个概览。                                                                                                               |
| -i [ ext]   | 把文件内容重写为程序输出。原始文件会被加上扩展名 ext 保存下来。如果未指定 ext，原始文件会被删除。                                        |
| -I dir      | 添加 dir 作为加载库的目录。                                                                                                              |
| -K [ kcode] | 指定多字节字符集编码。e 或 E 对应 EUC（extended Unix code），s 或 S 对应 SJIS（Shift-JIS），u 或 U 对应 UTF-8，a、A、n 或 N 对应 ASCII。 |
| -l          | 启用自动行尾处理。从输入行取消一个换行符，并向输出行追加一个换行符。                                                                     |
| -n          | 把代码放置在一个输入循环中（就像在 while gets; ... end 中一样）。                                                                        |
| -0[ octal]  | 设置默认的记录分隔符（\$/）为八进制。如果未指定 octal 则默认为 \0。                                                                      |
| -p          | 把代码放置在一个输入循环中。在每次迭代后输出变量 \$\_ 的值。                                                                             |
| -r lib      | 使用 require 来加载 lib 作为执行前的库。                                                                                                 |
| -s          | 解读程序名称和文件名参数之间的匹配模式 -xxx 的任何参数作为开关，并定义相应的变量。                                                       |
| -T [level]  | 设置安全级别，执行不纯度测试（如果未指定 level，则默认值为 1）。                                                                         |
| -v          | 显示版本，并启用冗余模式。                                                                                                               |
| -w          | 启用冗余模式。如果未指定程序文件，则从 STDIN 读取。                                                                                      |
| -x [dir]    | 删除 #!ruby 行之前的文本。如果指定了 dir，则把目录改变为 dir。                                                                           |
| -X dir      | 在执行前改变目录（等价于 -C）。                                                                                                          |
| -y          | 启用解析器调试模式。                                                                                                                     |
| --copyright | 显示版权声明。                                                                                                                           |
| --debug     | 启用调试模式（等价于 -d）。                                                                                                              |
| --help      | 显示命令行选项的一个概览（等价于 -h）。                                                                                                  |
| --version   | 显示版本。                                                                                                                               |
| --verbose   | 启用冗余模式（等价于 -v）。设置 \$VERBOSE 为 true。                                                                                      |
| --yydebug   | 启用解析器调试模式（等价于 -y）。                                                                                                        |

单字符的命令行选项可以组合使用。下面两行表达了同样的意思：

```bash
$ruby -ne 'print if /Ruby/' /usr/share/bin
$ruby -n -e 'print if /Ruby/' /usr/share/bin
```

## 环境变量

Ruby 解释器使用下列环境变量来控制它的行为。ENV 对象包含了所有当前设置的环境变量列表。
变量|描述
---|---
DLN_LIBRARY_PATH|动态加载模块搜索的路径。
HOME|当没有参数传递给 Dir::chdir 时，要移动到的目录。也用于 File::expand_path 来扩展 "~"。
LOGDIR|当没有参数传递给 Dir::chdir 且未设置环境变量 HOME 时，要移动到的目录。
PATH|执行子进程的搜索路径，以及在指定 -S 选项后，Ruby 程序的搜索路径。每个路径用冒号分隔（在 DOS 和 Windows 中用分号分隔）。
RUBYLIB|库的搜索路径。每个路径用冒号分隔（在 DOS 和 Windows 中用分号分隔）。
RUBYLIB_PREFIX|用于修改 RUBYLIB 搜索路径，通过使用格式 path1;path2 或 path1path2，把库的前缀 path1 替换为 path2。
RUBYOPT|传给 Ruby 解释器的命令行选项。在 taint 模式时被忽略（其中，$SAFE 大于 0）。
RUBYPATH|指定 -S 选项后，Ruby 程序的搜索路径。优先级高于 PATH。在 taint 模式时被忽略（其中，$SAFE 大于 0）。
RUBYSHELL|指定执行命令时所使用的 shell。如果未设置该环境变量，则使用 SHELL 或 COMSPEC。
对于 Unix，使用 `env` 命令来查看所有环境变量的列表。

## 保留字

下表列出了 Ruby 中的保留字。这些保留字不能作为常量或变量的名称。但是，它们可以作为方法名。

| BEGIN    | do     | next   | then     |
| -------- | ------ | ------ | -------- |
| END      | else   | nil    | true     |
| alias    | elsif  | not    | undef    |
| and      | end    | or     | unless   |
| begin    | ensure | redo   | until    |
| break    | false  | rescue | when     |
| case     | for    | retry  | while    |
| class    | if     | return | while    |
| def      | in     | self   | **FILE** |
| defined? | module | super  | **LINE** |

## 注释

```ruby
#!/usr/bin/ruby -w
# -*- coding: UTF-8 -*-

#这是一个单行注释
#a = 3

#这是一个多行注释
=begin
a = [0,1,2,3]
hashPara = {:name=>"name1",:number=>"num1"}
=end
```

## 数据类型

### 值类型

- String
- Number
- Boolean
- nil
- Ranges
- Symbols

### 引用类型

- Object
- Array
- Hash

## 变量

Ruby 提供了四种类型的变量：

- 局部变量：局部变量是在方法中定义的变量。局部变量在方法外是不可用的。局部变量以小写字母或 `_` 开始。
- 实例变量：实例变量可以跨任何特定的实例或对象中的方法使用。这意味着，实例变量可以从对象到对象的改变。实例变量在变量名之前放置符号（`@`）。
- 类变量：类变量可以跨不同的对象使用。类变量属于类，且是类的一个属性。类变量在变量名之前放置符号（`@@`）。
- 全局变量：类变量不能跨类使用。如果您想要有一个可以跨类使用的变量，您需要定义全局变量。全局变量总是以美元符号（`$`）开始。

## 语句

### 判断

- if

```ruby
code if condition
```

- if...else

```ruby
if conditional [then]
      code...
[elsif conditional [then]
      code...]...
[else
      code...]
end
```

- unless

```ruby
unless conditional [then]
   code
[else
   code ]
end
```

- case

```ruby
case expression
[when expression [, expression ...] [then]
   code ]...
[else
   code ]
end
```

### 循环

- whlie

```ruby
while conditional [do]
   code
end
#或者
while conditional [:]
   code
end

# 示例
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
$i = 0
$num = 5
while $i < $num  do
   puts("在循环语句中 i = #$i" )
   $i +=1
end
```

- until

```ruby
until conditional [do]
   code
end

#示例
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
$i = 0
$num = 5
until $i > $num  do
   puts("在循环语句中 i = #$i" )
   $i +=1;
end
```

- for

```ruby
for variable [, variable ...] in expression [do]
   code

# 示例
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
end

for i in 0..5
   puts "局部变量的值为 #{i}"
end
```

- break

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
for i in 0..5
   if i > 2 then
      break
   end
   puts "局部变量的值为 #{i}"
end
```

- next

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
for i in 0..5
   if i < 2 then
      next
   end
   puts "局部变量的值为 #{i}"
end
```

- redo

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
for i in 0..5
   if i < 2 then
      puts "局部变量的值为 #{i}"
      redo
   end
end
```

- retry

如果 retry 出现在 begin 表达式的 rescue 子句中，则从 begin 主体的开头重新开始。

```ruby
begin
   do_something   # 抛出的异常
rescue
   # 处理错误
   retry          # 重新从 begin 开始
end
```

如果 retry 出现在迭代内、块内或者 for 表达式的主体内，则重新开始迭代调用。

```ruby
for i in 1..5
   retry if some_condition # 重新从 i == 1 开始
end
```

### require 与 include

```ruby
# require语法
require filename
```

```ruby
# 示例
# 使用 $LOAD_PATH << '.' 让 Ruby 知道必须在当前目录中搜索被引用的文件。如果您不想使用 $LOAD_PATH，那么您可以使用 require_relative 来从一个相对目录引用文件。
$LOAD_PATH << '.'

# 文件扩展名 .rb 不是必需的。
require 'trig.rb'
require 'moral'

y = Trig.sin(Trig::PI/4)
x = Moral.sin(Moral::VERY_BAD)
```

**注意：** 文件包含相同的函数名称时，会在引用调用程序时导致代码模糊，但是模块避免了这种代码模糊，而且我们可以使用模块的名称调用适当的函数。

```ruby
# include 语法
include modulename
```

如果模块是定义在一个单独的文件中，那么在嵌入模块之前就需要使用 `require` 语句引用该文件。

假设下面的模块写在 session.rb 文件中。

```ruby
module Session
   DEFAULT_SESSION = Ne
   def Session.get_last_session
      puts "the last session is:"
   end
   def Session.get_current_sesion
      puts "the current session is:"
   end
end
```

```ruby
#!/usr/bin/ruby
$LOAD_PATH << '.'
require "Session"

class SessionHandle
include Session
   default_session_count = 0
   def get_session_count
      puts Session::DEFAULT_SESSION
      number=10*12
      puts number
   end
end
sh = SessionHandle.new
puts Week::FIRST_DAY
Week.get_current_sesion
Week.get_last_session
sh.get_session_count
```

### alias 与 undef

`alias`用于为方法或全局变量起别名。别名不能在方法主体内定义。即使方法被重写，方法的别名也保持方法的当前定义。

为编号的全局变量（$1, $2,...）起别名是被禁止的。重写内置的全局变量可能会导致严重的问题。

```ruby
alias 方法名 方法名
alias 全局变量 全局变量
```

```ruby
# 示例
alias foo bar #为 bar 定义了别名为 foo
alias $MATCH $& #为 $& 定义了别名为 $MATCH
```

`undef`用于取消方法定义。`undef`不能出现在方法主体内。

```ruby
undef 方法名
```

```ruby
#示例
undef bar #取消名为 bar的方法定义
```

通过使用 `undef` 和 `alias`，类的接口可以从父类独立修改，但请注意，在自身内部方法调用时，它可能会破坏程序。

### yield

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def test
   puts "在 test 方法内"
   yield
   puts "你又回到了 test 方法内"
   yield
end
test {puts "你在块内"}
#执行结果为：

# 在 test 方法内
# 你在块内
# 你又回到了 test 方法内
# 你在块内
```

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def test
   yield 5
   puts "在 test 方法内"
   yield 100 # yield 语句后跟着参数
end
test {|i| puts "你在块 #{i} 内"}
# 执行结果为：
# 你在块 5 内
# 在 test 方法内
# 你在块 100 内
```

如果您想使用 `yield` 语句传递多个参数，使用逗号分隔。如下所示：

```ruby
#yield后面跟两个参数
yield a, b
# 此时块如下所示：
test {|a, b| statement}
```

## 类、对象

对象是类的实例。Ruby 是一种完美的面向对象编程语言。面向对象编程语言的特性包括：

- 数据封装
- 数据抽象
- 多态性
- 继承

在 Ruby 中，类总是以关键字 `class` 开始，后跟类的名称。类名的首字母应该大写。类 User 如下所示：

```ruby
class User
end
```

在 Ruby 中，您可以使用类的方法 `new` 创建对象。该方法属于类方法，在 Ruby 库中预定义。您可以给方法 `new` 传递参数，这些参数可用于初始化类变量。当您想要声明带参数的 `new` 方法时，您需要在创建类的同时声明方法 `initialize`。

`initialize` 方法是一种特殊类型的方法，将在调用带参数的类的 new 方法时执行。

下面的实例创建了 `initialize` 方法：

```ruby
class User
   @@no_of_users=0
   def initialize(id, name, addr)
      @user_id=id
      @user_name=name
      @user_addr=addr
   end
end
```

在本实例中，您可以声明带有 id、name、addr 作为局部变量的 `initialize`方法。在这里，`def`和 `end` 用于定义 Ruby 方法 `initialize`。

在 `initialize` 方法中，把这些局部变量的值传给实例变量 @cust_id、@cust_name 和 @cust_addr。在这里，局部变量的值是随着 new 方法进行传递的。

现在，您可以创建对象，如下所示：

```ruby
user1=User.new("1", "张三", "陕西西安")
user2=User.new("2", "李四", "浙江杭州")
```

## 方法

方法名应以小写字母开头。如果您以大写字母作为方法名的开头，Ruby 可能会把它当作常量，从而导致不正确地解析调用。

方法应在调用之前定义，否则 Ruby 会产生未定义的方法调用异常。

```ruby
def method_name [( [arg [= default]]...[, * arg [, &expr ]])]
   expr..
end
```

Ruby 中的每个方法默认都会返回一个值。这个返回的值是最后一个语句的值。

```ruby
def test
   i = 1
   j = 2
   k = 3
end
```

在调用这个方法时，将返回最后一个声明的变量 k。
Ruby 允许您声明参数数量可变的方法:

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def sample (*test)
   puts "参数个数为 #{test.length}"
   for i in 0...test.length
      puts "参数值为 #{test[i]}"
   end
end
sample "Allen", "55", "M"
sample "Master", "35", "K", "User"
```

当方法定义在类的外部，方法默认标记为 private。另一方面，如果方法定义在类中的，则默认标记为 public。

方法默认的可见性和 private 标记可通过模块（Module）的 public 或 private 改变。

当你想要访问类的方法时，您首先需要实例化类。然后，使用对象，您可以访问类的任何成员。

Ruby 提供了一种不用实例化即可访问方法的方式。

```ruby
# 方法 return_date 是通过在类名后跟着一个点号，点号后跟着方法名来声明的。
class User
   def get_name
   end
   def User.return_date
   end
end
```

## 块

- 块由大量的代码组成。
- 您需要给块取个名称。
- 块中的代码总是包含在大括号 {} 内。
- 块总是从与其具有相同名称的函数调用。这意味着如果您的块名称为 test，那么您要使用函数 test 来调用这个块。
- 您可以使用 `yield` 语句来调用块。

```ruby
block_name{
   statement1
   statement2
   ..........
}
```

```ruby
#!/usr/bin/ruby

def test
  yield
end
test{ puts "Hello world"}
```

如果方法的最后一个参数前带有 &，那么您可以向该方法传递一个块，且这个块可被赋给最后一个参数。如果 \* 和 & 同时出现在参数列表中，& 应放在后面。

```ruby
#!/usr/bin/ruby

def test(*&block)
   block.call
end
test { puts "Hello World!"}
```

每个 Ruby 源文件可以声明当文件被加载时要运行的代码块（BEGIN 块），以及程序完成执行后要运行的代码块（END 块）。

```ruby
#!/usr/bin/ruby

BEGIN {
  # BEGIN 代码块
  puts "BEGIN 代码块"
}

END {
  # END 代码块
  puts "END 代码块"
}
  # MAIN 代码块
puts "MAIN 代码块"

# 输出以下结果:
# BEGIN 代码块
# MAIN 代码块
# END 代码块
```

一个程序可以包含多个 BEGIN 和 END 块。BEGIN 块按照它们出现的顺序执行。END 块按照它们出现的相反顺序执行。

## 运算符

### Ruby 算术运算符

| 运算符 | 描述                                    | 实例                        |
| ------ | --------------------------------------- | --------------------------- |
| +      | 加法 - 把运算符两边的操作数相加         | a + b 将得到 30             |
| -      | 减法 - 把左操作数减去右操作数           | a - b 将得到 -10            |
| \*     | 乘法 - 把运算符两边的操作数相乘         | a \* b 将得到 200           |
| /      | 除法 - 把左操作数除以右操作数           | b / a 将得到 2              |
| %      | 求模 - 把左操作数除以右操作数，返回余数 | b % a 将得到 0              |
| \*\*   | 指数 - 执行指数计算                     | a\*\*b 将得到 10 的 20 次方 |

### Ruby 比较运算符

| 运算符 | 描述                                                                                                                                            | 实例                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ==     | 检查两个操作数的值是否相等，如果相等则条件为真。                                                                                                | (a == b) 不为真。                                                                                             |
| !=     | 检查两个操作数的值是否相等，如果不相等则条件为真。                                                                                              | (a != b) 为真。                                                                                               |
| >      | 检查左操作数的值是否大于右操作数的值，如果是则条件为真。                                                                                        | (a > b) 不为真。                                                                                              |
| <      | 检查左操作数的值是否小于右操作数的值，如果是则条件为真。                                                                                        | (a < b) 为真。                                                                                                |
| >=     | 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。                                                                                  | (a >= b) 不为真。                                                                                             |
| <=     | 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。                                                                                  | (a <= b) 为真。                                                                                               |
| <=>    | 联合比较运算符。如果第一个操作数等于第二个操作数则返回 0，如果第一个操作数大于第二个操作数则返回 1，如果第一个操作数小于第二个操作数则返回 -1。 | (a <=> b) 返回 -1。                                                                                           |
| ===    | 用于测试 case 语句的 when 子句内的相等。                                                                                                        | (1...10) === 5 返回 true。                                                                                    |
| .eql?  | 如果接收器和参数具有相同的类型和相等的值，则返回 true。                                                                                         | 1 == 1.0 返回 true，但是 1.eql?(1.0) 返回 false。                                                             |
| equal? | 如果接收器和参数具有相同的对象 id，则返回 true。                                                                                                | 如果 aObj 是 bObj 的副本，那么 aObj == bObj 返回 true，a.equal?bObj 返回 false，但是 a.equal?aObj 返回 true。 |

### Ruby 赋值运算符

| 运算符 | 描述                                                       | 实例                            |
| ------ | ---------------------------------------------------------- | ------------------------------- |
| =      | 简单的赋值运算符，把右操作数的值赋给左操作数               | c = a + b 将把 a + b 的值赋给 c |
| +=     | 加且赋值运算符，把右操作数加上左操作数的结果赋值给左操作数 | c += a 相当于 c = c + a         |
| -=     | 减且赋值运算符，把左操作数减去右操作数的结果赋值给左操作数 | c -= a 相当于 c = c - a         |
| \*=    | 乘且赋值运算符，把右操作数乘以左操作数的结果赋值给左操作数 | c _= a 相当于 c = c _ a         |
| /=     | 除且赋值运算符，把左操作数除以右操作数的结果赋值给左操作数 | c /= a 相当于 c = c / a         |
| %=     | 求模且赋值运算符，求两个操作数的模赋值给左操作数           | c %= a 相当于 c = c % a         |
| \*\*=  | 指数且赋值运算符，执行指数计算，并赋值给左操作数           | c **= a 相当于 c = c ** a       |

Ruby 也支持变量的并行赋值。这使得多个变量可以通过一行的 Ruby 代码进行初始化。例如：

```ruby
a, b, c = 10, 20, 30
```

并行赋值在交换两个变量的值时也很有用：

```ruby
a, b = b, c
```

### Ruby 位运算符

| 运算符 | 描述                                                                                     | 实例                                                             |
| ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| &      | 如果同时存在于两个操作数中，二进制 AND 运算符复制一位到结果中。                          | (a & b) 将得到 12，即为 0000 1100                                |
|        | 如果存在于任一操作数中，二进制 OR 运算符复制一位到结果中。                               | (a                                                               | b) 将得到 61，即为 0011 1101 |
| ^      | 如果存在于其中一个操作数中但不同时存在于两个操作数中，二进制异或运算符复制一位到结果中。 | (a ^ b) 将得到 49，即为 0011 0001                                |
| ~      | 二进制补码运算符是一元运算符，具有"翻转"位效果，即 0 变成 1，1 变成 0。                  | (~a ) 将得到 -61，即为 1100 0011，一个有符号二进制数的补码形式。 |
| <<     | 二进制左移运算符。左操作数的值向左移动右操作数指定的位数。                               | a << 2 将得到 240，即为 1111 0000                                |
| >>     | 二进制右移运算符。左操作数的值向右移动右操作数指定的位数。                               | a >> 2 将得到 15，即为 0000 1111                                 |

### Ruby 逻辑运算符

| 运算符 | 描述                                                                               | 实例               |
| ------ | ---------------------------------------------------------------------------------- | ------------------ |
| and    | 称为逻辑与运算符。如果两个操作数都为真，则条件为真。                               | (a and b) 为真。   |
| or     | 称为逻辑或运算符。如果两个操作数中有任意一个非零，则条件为真。                     | (a or b) 为真。    |
| &&     | 称为逻辑与运算符。如果两个操作数都非零，则条件为真。                               | (a && b) 为真。    |
| `||`   | 称为逻辑或运算符。如果两个操作数中有任意一个非零，则条件为真。                     | (a                 |  | b) 为真。 |
| !      | 称为逻辑非运算符。用来逆转操作数的逻辑状态。如果条件为真则逻辑非运算符将使其为假。 | !(a && b) 为假。   |
| not    | 称为逻辑非运算符。用来逆转操作数的逻辑状态。如果条件为真则逻辑非运算符将使其为假。 | not(a && b) 为假。 |

### Ruby 三元运算符

| 运算符 | 描述       | 实例                                 |
| ------ | ---------- | ------------------------------------ |
| ? :    | 条件表达式 | 如果条件为真 ? 则值为 X : 否则值为 Y |

### Ruby 范围运算符

| 运算符 | 描述                                           | 实例                        |
| ------ | ---------------------------------------------- | --------------------------- |
| ..     | 创建一个从开始点到结束点的范围（包含结束点）   | 1..10 创建从 1 到 10 的范围 |
| ...    | 创建一个从开始点到结束点的范围（不包含结束点） | 1...10 创建从 1 到 9 的范围 |

### Ruby defined? 运算符

defined? 是一个特殊的运算符，以方法调用的形式来判断传递的表达式是否已定义。它返回表达式的描述字符串，如果表达式未定义则返回 nil。

下面是 defined? 运算符的各种用法：

```ruby
foo = 42
defined? foo    # => "local-variable"
defined? $_     # => "global-variable"
defined? bar    # => nil（未定义）

defined? method_call # 如果方法已经定义，则为 True

defined? puts        # => "method"
defined? puts(bar)   # => nil（在这里 bar 未定义）
defined? unpack      # => nil（在这里未定义）

# 如果存在可被 super 用户调用的方法，则为 True
defined? super
defined? super     # => "super"（如果可被调用）
defined? super     # => nil（如果不可被调用）

defined? yield   # 如果已传递代码块，则为 True
defined? yield    # => "yield"（如果已传递块）
defined? yield    # => nil（如果未传递块）
```

### Ruby 点运算符 "." 和双冒号运算符 "::"

- . 来调用类或模块中的方法
- :: 来引用类或模块中的常量

**注意** ：在 Ruby 中，类和方法也可以被当作常量。

你只需要在表达式的常量名前加上 :: 前缀，即可返回适当的类或模块对象。

如果 :: 前的表达式为类或模块名称，则返回该类或模块内对应的常量值；如果 :: 前未没有前缀表达式，则返回主 Object 类中对应的常量值。

### Ruby 运算符的优先级

| 方法 | 运算符              | 描述                                                  |
| ---- | ------------------- | ----------------------------------------------------- |
| 是   | ::                  | 常量解析运算符                                        |
| 是   | [ ][ ]=             | 元素引用、元素集合                                    |
| 是   | \*\*                | 指数                                                  |
| 是   | ! ~ + -             | 非、补、一元加、一元减（最后两个的方法名为 +@ 和 -@） |
| 是   | \* / %              | 乘法、除法、求模                                      |
| 是   | + -                 | 加法和减法                                            |
| 是   | >> <<               | 位右移、位左移                                        |
| 是   | &                   | 位与                                                  |
| 是   | ^                   |                                                       | 位异或、位或 |
| 是   | <= < > >=           | 比较运算符                                            |
| 是   | <=> == === != =~ !~ | 相等和模式匹配运算符（!= 和 !~ 不能被定义为方法）     |
| -    | &&                  | 逻辑与                                                |
| -    | `||`                | 逻辑或                                                |
| -    | .. ...              | 范围（包含、不包含）                                  |
| -    | ? :                 | 三元 if-then-else                                     |
| -    | = %= { /= -= +=     | = &= >>= <<= \*= &&=                                  |  | = \*\*= | 赋值 |
| -    | defined?            | 检查指定符号是否已定义                                |
| -    | not                 | 逻辑否定                                              |
| -    | or and              | 逻辑组成                                              |

**注**：在方法列标识为 是 的运算符实际上是方法，因此可以被重载。

## 迭代器

## 模块

模块（Module）是一种把方法、类和常量组合在一起的方式。模块（Module）为您提供了两大好处:

- 模块提供了一个命名空间和避免名字冲突。

- 模块实现了 mixin 装置。

模块（Module）定义了一个命名空间，相当于一个沙盒，在里边您的方法和常量不会与其他地方的方法常量冲突。

模块类似与类，但有以下不同：

- 模块不能实例化
- 模块没有子类
- 模块只能被另一个模块定义

```ruby
module MoudleName
   statement1
   statement2
   ...........
end
```

模块常量命名与类常量命名类似，以大写字母开头

您可以在类方法名称前面放置模块名称和一个点号来调用模块方法，您可以使用模块名称和变量引用符（两个冒号）来引用一个常量。

```ruby
#!/usr/bin/ruby

# 定义在 trig.rb 文件中的模块

module Trig
   PI = 3.141592654
   def Trig.sin(x)
   # ..
   end
   def Trig.cos(x)
   # ..
   end
end
```

```ruby
#!/usr/bin/ruby

# 定义在 moral.rb 文件中的模块
# 就像类方法，当您在模块中定义一个方法时，您可以指定在模块名称后跟着一个点号，点号后跟着方法名
module Moral
   VERY_BAD = 0
   BAD = 1
   def Moral.sin(badness)
   # ...
   end
end
```

当一个类可以从多个父类继承类的特性时，该类显示为多重继承。

Ruby 不直接支持多重继承，但是 Ruby 的模块（Module）有另一个神奇的功能。它几乎消除了多重继承的需要，提供了一种名为 `mixin` 的装置。将模块 include 到类定义中，模块中的方法就 mix 进了类中。

```ruby
module A
   def a1
   end
   def a2
   end
end
module B
   def b1
   end
   def b2
   end
end

class Sample
include A
include B
   def s1
   end
end

samp=Sample.new
samp.a1
samp.a2
samp.b1
samp.b2
samp.s1
#可以看到类 Sample 继承了两个模块，您可以说类 Sample 使用了多重继承或 mixin
```

## File

## Dir

## 异常

## 正则表达式

## 多线程

## RubyGems

## Socket 编程

## JSON

## 数据库访问
