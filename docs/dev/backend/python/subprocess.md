# subprocess

subprocess 模块允许我们启动一个新进程，并连接到它们的输入/输出/错误管道，从而获取返回值。
Python3官方文档：<https://docs.python.org/zh-cn/3/library/subprocess.html>

subprocess 模块首先推荐使用的是它的`run`方法，更高级的用法可以直接使用 `Popen` 接口。

## run()方法

```python
subprocess.run(args, *, stdin=None, input=None, stdout=None, stderr=None, capture_output=False, shell=False, cwd=None, timeout=None, check=False, encoding=None, errors=None, text=None, env=None, universal_newlines=None)
```

- args：被用作启动进程的参数. 可能是一个列表或字符串。
- stdin、stdout 和 stderr：子进程的标准输入、输出和错误。其值可以是 subprocess.PIPE、subprocess.DEVNULL、一个已经存在的文件描述符、已经打开的文件对象或者 None。subprocess.PIPE 表示为子进程创建新的管道。subprocess.DEVNULL 表示使用 os.devnull。默认使用的是 None，表示什么都不做。另外，stderr 可以合并到 stdout 里一起输出。
- timeout：设置命令超时时间。如果命令执行时间超时，子进程将被杀死，并弹出 TimeoutExpired 异常。
- check：如果该参数设置为 True，并且进程退出状态码不是 0，则弹 出 CalledProcessError 异常。
- encoding: 如果指定了该参数，则 stdin、stdout 和 stderr 可以接收字符串数据，并以该编码方式编码。否则只接收 bytes 类型的数据。
- shell：如果该参数为 True，将通过操作系统的 shell 执行指定的命令。

run 方法调用方式返回 CompletedProcess 实例，和直接 Popen 差不多，实现是一样的，实际也是调用 Popen，与 Popen 构造函数大致相同，例如:

```python
#执行ls -l /dev/null 命令
>>> subprocess.run(["ls", "-l", "/dev/null"])
crw-rw-rw-  1 root  wheel    3,   2  5  4 13:34 /dev/null
CompletedProcess(args=['ls', '-l', '/dev/null'], returncode=0)
```

returncode: 执行完子进程状态，通常返回状态为0则表明它已经运行完毕，若值为负值 "-N",表明子进程被终。

```python
import subprocess
def runcmd(command):
    ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=1)
    if ret.returncode == 0:
        print("success:",ret)
    else:
        print("error:",ret)


runcmd(["dir","/b"])#序列参数
runcmd("exit 1")#字符串参数
```

输出结果如下：

```python
success: CompletedProcess(args=['dir', '/b'], returncode=0, stdout='test.py\n', stderr='')
error: CompletedProcess(args='exit 1', returncode=1, stdout='', stderr='')
```

## Popen() 方法

Popen 是 subprocess的核心，子进程的创建和管理都靠它处理。

构造函数：

```python
class subprocess.Popen(args, bufsize=-1, executable=None, stdin=None, stdout=None, stderr=None, 
preexec_fn=None, close_fds=True, shell=False, cwd=None, env=None, universal_newlines=False, 
startupinfo=None, creationflags=0,restore_signals=True, start_new_session=False, pass_fds=(),
*, encoding=None, errors=None)
```

常用参数：

- args：shell命令，可以是字符串或者序列类型（如：list，元组）
- bufsize：缓冲区大小。当创建标准流的管道对象时使用，默认-1。
    0：不使用缓冲区
    1：表示行缓冲，仅当universal_newlines=True时可用，也就是文本模式
    正数：表示缓冲区大小
    负数：表示使用系统默认的缓冲区大小。
- stdin, stdout, stderr：分别表示程序的标准输入、输出、错误句柄
- preexec_fn：只在 Unix 平台下有效，用于指定一个可执行对象（callable object），它将在子进程运行之前被调用
- shell：如果该参数为 True，将通过操作系统的 shell 执行指定的命令。
- cwd：用于设置子进程的当前目录。
- env：用于指定子进程的环境变量。如果 env = None，子进程的环境变量将从父进程中继承。

创建一个子进程，然后执行一个简单的命令:

```python
>>> import subprocess
>>> p = subprocess.Popen('ls -l', shell=True)
>>> total 164
-rw-r--r--  1 root root   133 Jul  4 16:25 admin-openrc.sh
-rw-r--r--  1 root root   268 Jul 10 15:55 admin-openrc-v3.sh
...
>>> p.returncode
>>> p.wait()
0
>>> p.returncode
```

### Popen 对象方法

- poll(): 检查进程是否终止，如果终止返回 returncode，否则返回 None。
- wait(timeout): 等待子进程终止。
- communicate(input,timeout): 和子进程交互，发送和读取数据。
- send_signal(singnal): 发送信号到子进程 。
- terminate(): 停止子进程,也就是发送SIGTERM信号到子进程。
- kill(): 杀死子进程。发送 SIGKILL 信号到子进程。

```python
import time
import subprocess

def cmd(command):
    subp = subprocess.Popen(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8")
    subp.wait(2)
    if subp.poll() == 0:
        print(subp.communicate()[1])
    else:
        print("失败")

cmd("java -version")
cmd("exit 1")
```

输出结果如下：

```python
java version "1.8.0_31"
Java(TM) SE Runtime Environment (build 1.8.0_31-b13)
Java HotSpot(TM) 64-Bit Server VM (build 25.31-b07, mixed mode)

失败
```

## 示例

- ping:

```python
# 需要导入模块: import subprocess [as 别名]
# 或者: from subprocess import run [as 别名]
def ping(ns_name, source_lo_addr, dest_lo_addr):
    try:
        result = subprocess.run(['ip', 'netns', 'exec', ns_name, 'ping', '-f', '-W1',
                                 '-c{}'.format(PING_PACKTES),
                                 '-I', source_lo_addr, dest_lo_addr],
                                stdout=subprocess.PIPE)
    except FileNotFoundError:
        fatal_error('"ping" command not found')
    output = result.stdout.decode('ascii')
    lines = output.splitlines()
    for line in lines:
        if "packets transmitted" in line:
            split_line = line.split()
            packets_transmitted = int(split_line[0])
            packets_received = int(split_line[3])
            return (packets_transmitted, packets_received)
    fatal_error('Could not determine ping statistics for namespace "{}"'.format(ns_name))
    return None  # Never reached
```

- popen:

```python
# 需要导入模块: import subprocess [as 别名]
# 或者: from subprocess import Popen [as 别名]
def popen(cls, cmd, cwd=None, raises=False):
        '''
            Execute the given command string in a new process. Send data to stdin and
        read data from stdout and stderr, until end-of-file is reached.

        :param cls     : The class as implicit first argument.
        :param cwd     : If it is set, then the child's current directory will be change
                         to `cwd` before it is executed.
        :param raises  : If ``True`` and stderr has data, it raises an ``OSError`` exception.
        :returns       : The output of the given command; pair of (stdout, stderr).
        :rtype         : ``tuple``
        :raises OSError: If `raises` and stderr has data.
        '''
        parser   = lambda x: [] if x == '' else [y.strip() for y in x.strip().split('\n')]
        process  = subprocess.Popen(cmd, shell=True, universal_newlines=True,
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = process.communicate()

        # .............................trim lines and remove the empty ones
        _stdout  = [x for x in parser(out) if bool(x)]
        _stderr  = [x for x in parser(err) if bool(x)]

        if _stderr and raises:
            raise OSError('\n'.join(_stderr))

        return _stdout, _stderr
```

- runcmd:

```python
import subprocess

'''
Runs a command, waits for it to complete, then returns a CompletedProcess instance.
'''

def runcmd(args,cwd=''):
    ret = subprocess.run(
        args=args,
        cwd=cwd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding='gbk',
        timeout=1
    )
    if ret.returncode == 0:
        print("success:", ret.stdout)
    else:
        print("error:", ret.stderr)


if __name__ == "__main__":
    runcmd(args=["dir"],cwd=r'F:\test')

Result:
# success:  驱动器 F 中的卷是 数据
#  卷的序列号是 DCBE-C50C

#  F:\test 的目录

# 2021/12/27  19:01    <DIR>          .
# 2021/12/27  19:01    <DIR>          ..
# 2021/08/26  22:25            15,593 AutoComplete.cs
# 2021/08/26  22:25               706 ColorRandom.cs
# 2021/08/26  22:25             6,146 DataGridViewRender.cs
# 2021/08/26  22:25             2,840 ExcelDataReader.cs
# 2021/08/26  22:25            28,050 FTPClient.cs
# 2021/08/26  22:25               404 GUID.cs
# 2021/08/26  22:25               927 ListItem.cs
# 2021/08/26  22:25             1,360 LoadXml.cs
# 2021/08/26  22:25            35,700 ManageDB.cs
# 2021/08/26  22:25               428 RadomNamed.cs
# 2021/08/26  22:25             7,380 RegexInfo.cs
# 2021/08/26  22:25             4,111 SendMail.cs
# 2021/08/26  22:25             4,250 TextAndImageColumn.cs
# 2021/08/26  22:25             1,944 TimeDelay.cs
#               14 个文件        109,839 字节
#                2 个目录 56,677,851,136 可用字节
```

- start:

```python
# 需要导入模块: import subprocess [as 别名]
# 或者: from subprocess import Popen [as 别名]
def start(self):
        self.command = "%s %s -%c -R %s -s %d" % \
                (
                    INJECTOR,
                    " ".join(self.settings.args),
                    self.settings.synth_mode,
                    "-0" if self.settings.root else "",
                    self.settings.seed
                )
        self.process = subprocess.Popen(
            "exec %s" % self.command,
            shell=True,
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            preexec_fn=os.setsid
            ) 
```

_run_command:

```python
# 需要导入模块: import subprocess [as 别名]
# 或者: from subprocess import Popen [as 别名]
def _run_command(command):
    p = subprocess.Popen(command,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'') 
```
