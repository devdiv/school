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

#示例
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

## 类、对象、方法

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

## 模块

## 块

## 运算符

## 迭代器

## File

## Dir

## 异常

## 正则表达式

## 多线程

## RubyGems

## Socket 编程

## JSON

## 数据库访问
