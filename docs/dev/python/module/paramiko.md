# Paramiko

- ssh 是一个协议，OpenSSH 是其中一个开源实现，paramiko 是 Python 的一个库，实现了 SSHv2 协议(底层使用 cryptography)。
- 有了 Paramiko 以后，我们就可以在 Python 代码中直接使用 SSH 协议对远程服务器执行操作，而不是通过 ssh 命令对远程服务器进行操作。

安装 ：`$ pip install paramiko`

文档：<https://docs.paramiko.org/>

Github：<https://github.com/paramiko/paramiko>

## API 文档

The high-level client API starts with creation of an SSHClient object. For more direct control, pass a socket (or socket-like object) to a Transport, and use start_server or start_client to negotiate with the remote host as either a server or client.

As a client, you are responsible for authenticating using a password or private key, and checking the server’s host key. (Key signature and verification is done by paramiko, but you will need to provide private keys and check that the content of a public key matches what you expected to see.)

As a server, you are responsible for deciding which users, passwords, and keys to allow, and what kind of channels to allow.

Once you have finished, either side may request flow-controlled channels to the other side, which are Python objects that act like sockets, but send and receive data over the encrypted session.

For details, please see the following tables of contents (which are organized by area of interest.)

## Core SSH protocol classes

- Channel
- Client
- Message
- Packetizer
- Transport

## Authentication & keys

- SSH agents
- Host keys / known_hosts files
- Key handling
  - Parent key class
  - DSA (DSS)
  - RSA
  - ECDSA
  - Ed25519
- GSS-API authentication
- GSS-API key exchange

## Other primary functions

- Configuration
- Keywords currently supported
- Expansion tokens
- config module API documentation
- ProxyCommand support
- Server implementation
- SFTP

## Miscellany

- Buffered pipes
- Buffered files
- Cross-platform pipe implementations
- Exceptions

## Examples

通过`channel.send`发送命令:

```python
import paramiko
import time
import re


class SSH:
    def __init__(self, host, username, password, port=22):
        self.__ssh = paramiko.SSHClient()
        self.__ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.__ssh.connect(host, username=username,
                           password=password, port=port)
        self.channel = self.__ssh.invoke_shell(width=1000, height=100)
        time.sleep(2)

    def cmd(self, cmd, keywords=r'\[.*\]\#$\s*', times=60):
        self.channel.send(cmd + "\n")
        count = 0
        while count < times:
            time.sleep(0.5)
            recv = self.channel.recv(1000000).decode('utf-8')
            recv = re.sub(r'\x1b\[0m', '', recv)
            recv = re.sub(r'\x1b\[0134m', '', recv)
            print(recv)
            if re.search(keywords, recv):
                break
        return recv

    def telent(self, m, n, keywords=r'\[.*\]\#|.*\>', times=30):
        flag = False
        count = 0
        while count < times:
            res = self.cmd('telent %s %s' % (m, n), keywords=keywords)
            if re.search('Connected|welcome to telent!',res):
                flag = True
                break
            else:
                count = count + 1
                print('waitting for telnet … \t\ttime cost%s'%(2*count))
                time.sleep(2)
        return flag

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.__ssh.close()


    def __enter__(self):
        return self

if __name__ == "__main__":
    with SSH("ip", "user", "pwd") as ssh:
        res = ssh.cmd("ls /etc")
        print(res)

```

通过`client.exec_command`发送命令：

```python
import paramiko

# 实例化SSHClient
client = paramiko.SSHClient()

# 自动添加策略，保存服务器的主机名和密钥信息，如果不添加，那么不再本地know_hosts文件中记录的主机将无法连接
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# 连接SSH服务端，以用户名和密码进行认证
client.connect(hostname='192.168.1.105', port=22,
               username='root', password='123456')

# 打开一个Channel并执行命令
stdin, stdout, stderr = client.exec_command(
    'df -h ')  # stdout 为正确输出，stderr为错误输出，同时是有1个变量有值

# 打印执行结果
print(stdout.read().decode('utf-8'))

# 关闭SSHClient
client.close()

```

密钥连接方式：

```python
# 配置私人密钥文件位置
private = paramiko.RSAKey.from_private_key_file('/Users/ch/.ssh/id_rsa')

#实例化SSHClient
client = paramiko.SSHClient()

#自动添加策略，保存服务器的主机名和密钥信息，如果不添加，那么不再本地know_hosts文件中记录的主机将无法连接
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

#连接SSH服务端，以用户名和密码进行认证
client.connect(hostname='10.0.0.1',port=22,username='root',pkey=private)
```

SSHClient 封装 Transport:

```python
import paramiko

# 创建一个通道
transport = paramiko.Transport(('hostname', 22))
transport.connect(username='root', password='123')

ssh = paramiko.SSHClient()
ssh._transport = transport

stdin, stdout, stderr = ssh.exec_command('df -h')
print(stdout.read().decode('utf-8'))

transport.close()

```

SFTPClient 常用方法举例:

```python
import paramiko

# 获取Transport实例
tran = paramiko.Transport(('10.0.0.3', 22))

# 连接SSH服务端，使用password
tran.connect(username="root", password='123456')
# 或使用
# 配置私人密钥文件位置
private = paramiko.RSAKey.from_private_key_file('/Users/root/.ssh/id_rsa')
# 连接SSH服务端，使用pkey指定私钥
tran.connect(username="root", pkey=private)

# 获取SFTP实例
sftp = paramiko.SFTPClient.from_transport(tran)

# 设置上传的本地/远程文件路径
localpath = "/Users/root/Downloads/1.txt"
remotepath = "/tmp/1.txt"

# 执行上传动作
sftp.put(localpath, remotepath)
# 执行下载动作
sftp.get(remotepath, localpath)

tran.close()
```
