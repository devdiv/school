# Python特性

## 迭代

如果给定一个`list`或`tuple`，我们可以通过`for`循环来**遍历**这个`list`或`tuple`，这种**遍历**我们称为**迭代（Iteration）**。

在Python中，迭代是通过`for ... in`来完成的，而很多语言比如C语言，迭代`list`是通过下标完成的，比如C代码：

```python
for (i=0; i<length; i++) {
    n = list[i];
}
```

`list`或`tuple`这种数据类型虽然有下标，但很多其他数据类型是没有下标的，但是，只要是可迭代对象，无论有无下标，都可以迭代，比如`dict`、`str`等：

### 字典迭代

`list`这种数据类型虽然有下标，但很多其他数据类型是没有下标的，但是，只要是可迭代对象，无论有无下标，都可以迭代，比如`dict`就可以迭代：

```python
# 迭代 key
>>> d = {'a': 1, 'b': 2, 'c': 3}
>>> for key in d:
...     print(key)
...
a
b
c
```

::: warning 注意
因为`dict`的存储不是按照`list`的方式顺序排列，所以，迭代出的结果顺序很可能不一样。

默认情况下，`dict`迭代的是`key`。如果要迭代`value`，可以用**for value in d.values()**，如果要同时迭代`key`和`value`，可以用**for k, v in d.items()**。
:::

```python
# 迭代 value
>>> a = {'a':1,'b':2,'c':3}
>>> a
{'a': 1, 'b': 2, 'c': 3}
>>> for value in a.values():
...     print(value)
...
1
2
3
```

```python
# 迭代 key,value
>>> for k,v in a.items():
...     print("%s:%s"%(k,v))
...
a:1
b:2
c:3
>>>
```

### 字符串迭代

```python
# 迭代字符串
>>> for i in "12345":
...     print(i)
...
1
2
3
4
5
>>>
```

可以看出，**Python的for循环抽象程度要高于C的for循环**，因为Python的`for`循环不仅可以用在`list`或`tuple`上，还可以作用在其他可迭代对象上。只要作用于一个可迭代对象，`for`循环就可以正常运行，而我们不太关心该对象究竟的数据类型。

### 判断对象是否可迭代

如何判断一个对象是可迭代对象呢？方法是通过`collections.abc`模块的`Iterable`类型判断：

```python
# 判断对象是否可迭代
>>> from collections.abc import Iterable
>>> isinstance(123,Iterable)
False
>>> isinstance("123",Iterable) # str是否可迭代
True
>>> isinstance([1,2,3],Iterable) # list是否可迭代
True
>>> isinstance((1,2,3),Iterable) # tuple是否可迭代
True
>>> isinstance(range(3),Iterable) # set是否可迭代
True
>>> isinstance({'a':1,'b':2,'c':3},Iterable) # dict是否可迭代
True
>>>
```

:::info 提示
Python内置的**enumerate**函数可以把一个`list`变成k,v键值对，这样就可以在for循环中同时迭代索引和元素本身：

```python
# 使用 enumerate() 函数把一个 list 变成 v,v 键值对
>>> for i, value in enumerate(['A', 'B', 'C']):
...     print(i, value)
...
0 A
1 B
2 C
```

:::

上面的for循环里，同时引用了两个变量，在Python里是很常见的，比如下面的代码：

```python
# 同时引用两个变量
>>> for x, y in [(1, 1), (2, 4), (3, 9)]:
...     print(x, y)
...
1 1
2 4
3 9

```

## 列表生成式

列表生成式即List Comprehensions，是Python内置的非常简单却强大的可以用来创建`list`的生成式。

【例】生成`list` `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`可以用`list(range(1, 11))`：

```python
>>> list(range(1,11))
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
>>>
```

但如果要生成[1x1, 2x2, 3x3, ..., 10x10]怎么做？方法一是循环：

```python
>>> l=[]
>>> for x in range(1,11):
...     l.append(x*x)
...
>>> l
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
>>>
>>>
```

此处可以使用**列表生成式**简化以上过程：

```python
>>> [x * x for x in range(1,11)]
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
>>>
```

`for`循环后面还可以加上`if`判断，这样我们就可以筛选出仅偶数的平方：

```python
>>> [x * x for x in range(1,11) if x % 2 == 0]
[4, 16, 36, 64, 100]
>>>
```

还可以使用两层循环，可以**生成全排列**：

```python
>>> [m + n for m in 'ABC' for n in 'XYZ']
['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
>>>
```

三层和三层以上的循环就很少用到了。

**运用列表生成式，可以写出非常简洁的代码。** 例如，列出当前目录下的所有文件和目录名，可以通过一行代码实现：

```python
>>> import os # 导入os模块，模块的概念后面讲到
>>> [a for a in os.listdir('.')] # os.listdir可以列出文件和目录
['.emacs.d', '.ssh', '.Trash', 'Adlm', 'Applications', 'Desktop', 'Documents', 'Downloads', 'Library', 'Movies', 'Music', 'Pictures', 'Public', 'VirtualBox VMs', 'Workspace', 'XCode']
```

`for`循环其实可以同时使用两个甚至多个变量，比如`dict`的`items()`可以同时迭代`key`和`value`：

```python
>>> a = {'x': 'A', 'y': 'B', 'z': 'C' }
>>> for k, v in a.items():
...     print(k, '=', v)
...
y = B
x = A
z = C
```

因此，列表生成式也可以使用两个变量来生成`list`：

```python
>>> d = {'x': 'A', 'y': 'B', 'z': 'C' }
>>> [k + '=' + v for k, v in d.items()]
['y=B', 'x=A', 'z=C']
```

最后把一个`list`中所有的字符串变成小写：

```python
>>> l = ['Hello', 'World', 'IBM', 'Apple']
>>> [s.lower() for s in l]
['hello', 'world', 'ibm', 'apple']
```

### `if...else`生成表达式

（1）`if`写在`for`后面，不能加`else`。这是因为跟在`for`后面的`if`是一个筛选条件，不能带`else`，否则如何筛选？

```python
>>> [x for x in range(1,11) if x % 2 ==0]
[2, 4, 6, 8, 10]
>>> [x for x in range(1,11) if x % 2 ==0 else 0]
  File "<stdin>", line 1
    [x for x in range(1,11) if x % 2 ==0 else 0]
                                         ^^^^
SyntaxError: invalid syntax
>>>
```

（2）`if`写在`for`前面，必须加`else`。这是因为`for`前面的部分是一个表达式，它必须根据x计算出一个结果。因此，考察表达式：`x if x % 2 == 0`，它无法根据x计算出结果，因为缺少`else`，必须加上`else`：

```python
>>> [x if x % 2 == 0 for x in range(1,11)]
  File "<stdin>", line 1
    [x if x % 2 == 0 for x in range(1,11)]
     ^^^^^^^^^^^^^^^
SyntaxError: expected 'else' after 'if' expression
>>> [x if x % 2 == 0 else -x for x in range(1,11)]
[-1, 2, -3, 4, -5, 6, -7, 8, -9, 10]
>>>
```

上述for前面的表达式`x if x % 2 == 0 else -x`才能根据`x`计算出确定的结果。

可见，在一个列表生成式中，**`for`前面的`if ... else`是表达式，而`for`后面的`if`是过滤条件，不能带`else`**。

## 生成器

通过列表生成式，我们可以直接创建一个列表。但是，受到内存限制，列表容量肯定是有限的。而且，创建一个包含100万个元素的列表，不仅占用很大的存储空间，如果我们仅仅需要访问前面几个元素，那后面绝大多数元素占用的空间都白白浪费了。

所以，如果列表元素可以按照某种算法推算出来，那我们是否可以在循环的过程中不断推算出后续的元素呢？这样就不必创建完整的`list`，从而节省大量的空间。在Python中，这种一边循环一边计算的机制，称为生成器：`generator`。

要创建一个`generator`，有很多种方法。第一种方法很简单，只要把一个列表生成式的`[]`改成`()`，就创建了一个`generator`：

```python
>>> l = [x * x for x in range(10)]
>>> l
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
>>> g = (x * x for x in range(10))
>>> g
<generator object <genexpr> at 0x000002A5678FA110>
>>>
```

创建l和g的区别仅在于最外层的[]和()，l是一个`list`，而g是一个`generator`。

我们可以直接打印出`list`的每一个元素，但我们怎么打印出`generator`的每一个元素呢？

如果要一个一个打印出来，可以通过`next()`函数获得`generator`的下一个返回值：

```python
>>> next(g)
0
>>> next(g)
1
>>> next(g)
4
>>> next(g)
9
>>> next(g)
16
>>> next(g)
25
>>> next(g)
36
>>> next(g)
49
>>> next(g)
64
>>> next(g)
81
>>> next(g)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

`generator`保存的是算法，每次调用`next(g)`，就计算出g的下一个元素的值，直到计算到最后一个元素，没有更多的元素时，抛出`StopIteration`的错误。

当然，上面这种不断调用`next(g)`实在是太变态了，正确的方法是使用`for`循环，因为`generator`也是可迭代对象：

```python
>>> g = (x * x for x in range(10))
>>> for n in g:
...     print(n)
... 
0
1
4
9
16
25
36
49
64
81

```

创建了一个`generator`后，基本上永远不会调用`next()`，而是通过`for`循环来迭代它，并且不需要关心`StopIteration`的错误。

`generator`非常强大。如果推算的算法比较复杂，用类似列表生成式的`for`循环无法实现的时候，还可以用函数来实现。

【例】著名的斐波拉契数列（`Fibonacci`），除第一个和第二个数外，任意一个数都可由前两个数相加得到：

1, 1, 2, 3, 5, 8, 13, 21, 34, ...

斐波拉契数列用列表生成式写不出来，但是，用函数把它打印出来却很容易：

```python
def fib(max):
    n, a, b = 0, 0, 1
    while n < max:
        print(b)
        a, b = b, a + b
        n = n + 1
    return 'done'
```

:::danger 注意
赋值语句：

```python
a, b = b, a + b
```

相当于：

```python
t = (b, a + b) # t是一个tuple
a = t[0]
b = t[1]
```

:::

但不必显式写出临时变量t就可以赋值。

上面的函数可以输出斐波那契数列的前N个数：

```python
>>> fib(6)
1
1
2
3
5
8
'done'

```

仔细观察，可以看出，`fib`函数实际上是定义了斐波拉契数列的推算规则，可以从第一个元素开始，推算出后续任意的元素，这种逻辑其实非常类似`generator`。

也就是说，上面的函数和`generator`仅一步之遥。要把`fib`函数变成`generator`函数，只需要把`print(b)`改为`yield b`就可以了：

```python
def fib(max):
    n, a, b = 0, 0, 1
    while n < max:
        yield b
        a, b = b, a + b
        n = n + 1
    return 'done'

```

这就是定义`generator`的另一种方法。如果一个函数定义中包含`yield`关键字，那么这个函数就不再是一个普通函数，而是一个`generator`函数，调用一个`generator`函数将返回一个`generator`：

```python
>>> f = fib(6)
>>> f
<generator object fib at 0x104feaaa0>
```

这里，最难理解的就是`generator`函数和普通函数的执行流程不一样。普通函数是顺序执行，遇到`return`语句或者最后一行函数语句就返回。而变成`generator`的函数，在每次调用`next()`的时候执行，遇到`yield`语句返回，再次执行时从上次返回的`yield`语句处继续执行。

举个简单的例子，定义一个`generator`函数，依次返回数字1，3，5：

```python
def odd():
    print('step 1')
    yield 1
    print('step 2')
    yield(3)
    print('step 3')
    yield(5)
```

调用该`generator`函数时，首先要生成一个`generator`对象，然后用`next()`函数不断获得下一个返回值：

```python
>>> o = odd()
>>> next(o)
step 1
1
>>> next(o)
step 2
3
>>> next(o)
step 3
5
>>> next(o)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

可以看到，`odd`不是普通函数，而是`generator`函数，在执行过程中，遇到`yield`就中断，下次又继续执行。执行3次`yield`后，已经没有`yield`可以执行了，所以，第4次调用`next(o)`就报错。

:::danger 注意
调用`generator`函数会创建一个`generator`对象，多次调用`generator`函数会创建多个相互独立的`generator`。
:::

同样的，把函数改成`generator`函数后，我们基本上从来不会用`next()`来获取下一个返回值，而是直接使用`for`循环来迭代：

```python
>>> for n in fib(6):
...     print(n)
...
1
1
2
3
5
8

```

但是用`for`循环调用`generator`时，发现拿不到`generator`的`return`语句的返回值。如果想要拿到返回值，必须捕获`StopIteration`错误，返回值包含在`StopIteration`的`value`中：

```python
>>> g = fib(6)
>>> while True:
...     try:
...         x = next(g)
...         print('g:', x)
...     except StopIteration as e:
...         print('Generator return value:', e.value)
...         break
...
g: 1
g: 1
g: 2
g: 3
g: 5
g: 8
Generator return value: done
```

## 迭代器

我们已经知道，可以直接作用于`for`循环的数据类型有以下几种：

- (1)集合数据类型，如`list`、`tuple`、`dict`、`set`、`str`等。

- (2)`generator`，包括生成器和带`yield`的`generator function`。

这些可以直接作用于`for`循环的对象统称为可迭代对象：`Iterable`。

可以使用`isinstance()`判断一个对象是否是`Iterable`对象：

```python
>>> from collections.abc import Iterable
>>> isinstance([], Iterable)
True
>>> isinstance({}, Iterable)
True
>>> isinstance('abc', Iterable)
True
>>> isinstance((x for x in range(10)), Iterable)
True
>>> isinstance(100, Iterable)
False

```

而生成器不但可以作用于`for`循环，还可以被`next()`函数不断调用并返回下一个值，直到最后抛出`StopIteration`错误表示无法继续返回下一个值了。

可以被`next()`函数调用并不断返回下一个值的对象称为迭代器：`Iterator`。

可以使用`isinstance()`判断一个对象是否是`Iterator`对象：

```python
>>> from collections.abc import Iterator
>>> isinstance((x for x in range(10)), Iterator)
True
>>> isinstance([], Iterator)
False
>>> isinstance({}, Iterator)
False
>>> isinstance('abc', Iterator)
False

```

生成器都是`Iterator`对象，但`list`、`dict`、`str`虽然是`Iterable`，却不是`Iterator`。

把`list`、`dict`、`str`等`Iterable`变成`Iterator`可以使用`iter()`函数：

```python
>>> isinstance(iter([]), Iterator)
True
>>> isinstance(iter('abc'), Iterator)
True

```

为什么`list`、`dict`、`str`等数据类型不是`Iterator`？

这是因为Python的`Iterator`对象表示的是一个数据流，`Iterator`对象可以被`next()`函数调用并不断返回下一个数据，直到没有数据时抛出`StopIteration`错误。可以把这个数据流看做是一个有序序列，但我们却不能提前知道序列的长度，只能不断通过`next()`函数实现按需计算下一个数据，所以`Iterator`的计算是惰性的，只有在需要返回下一个数据时它才会计算。

`Iterator`甚至可以表示一个无限大的数据流，例如全体自然数。而使用`list`是永远不可能存储全体自然数的。

凡是可作用于for循环的对象都是Iterable类型；

凡是可作用于next()函数的对象都是Iterator类型，它们表示一个惰性计算的序列；

集合数据类型如list、dict、str等是Iterable但不是Iterator，不过可以通过iter()函数获得一个Iterator对象。

Python的for循环本质上就是通过不断调用next()函数实现的，例如：

```python
for x in [1, 2, 3, 4, 5]:
    pass
```

实际上完全等价于：

```python
# 首先获得Iterator对象:
it = iter([1, 2, 3, 4, 5])
# 循环:
while True:
    try:
        # 获得下一个值:
        x = next(it)
    except StopIteration:
        # 遇到StopIteration就退出循环
        break

```

参考源码:

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from collections.abc import Iterable, Iterator

def g():
    yield 1
    yield 2
    yield 3

print('Iterable? [1, 2, 3]:', isinstance([1, 2, 3], Iterable))
print('Iterable? \'abc\':', isinstance('abc', Iterable))
print('Iterable? 123:', isinstance(123, Iterable))
print('Iterable? g():', isinstance(g(), Iterable))

print('Iterator? [1, 2, 3]:', isinstance([1, 2, 3], Iterator))
print('Iterator? iter([1, 2, 3]):', isinstance(iter([1, 2, 3]), Iterator))
print('Iterator? \'abc\':', isinstance('abc', Iterator))
print('Iterator? 123:', isinstance(123, Iterator))
print('Iterator? g():', isinstance(g(), Iterator))

# iter list:
print('for x in [1, 2, 3, 4, 5]:')
for x in [1, 2, 3, 4, 5]:
    print(x)

print('for x in iter([1, 2, 3, 4, 5]):')
for x in iter([1, 2, 3, 4, 5]):
    print(x)

print('next():')
it = iter([1, 2, 3, 4, 5])
print(next(it))
print(next(it))
print(next(it))
print(next(it))
print(next(it))

d = {'a': 1, 'b': 2, 'c': 3}

# iter each key:
print('iter key:', d)
for k in d.keys():
    print('key:', k)

# iter each value:
print('iter value:', d)
for v in d.values():
    print('value:', v)

# iter both key and value:
print('iter item:', d)
for k, v in d.items():
    print('item:', k, v)

# iter list with index:
print('iter enumerate([\'A\', \'B\', \'C\']')
for i, value in enumerate(['A', 'B', 'C']):
    print(i, value)

# iter complex list:
print('iter [(1, 1), (2, 4), (3, 9)]:')
for x, y in [(1, 1), (2, 4), (3, 9)]:
    print(x, y)
```
