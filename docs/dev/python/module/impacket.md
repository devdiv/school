# Impacket

Impacket 是一组用于处理网络协议的 Python 类。 Impacket 专注于提供对数据包的低级编程访问，并为某些协议（例如 SMB1-3 和 MSRPC）提供协议实现本身。

数据包可以从头开始构建，也可以从原始数据中解析出来，面向对象的 API 使得使用深层次的协议变得简单。 该库提供了一组工具作为可以在该库的上下文中完成的操作的示例。

官方文档：<https://www.secureauth.com/labs/open-source-tools/impacket/>
GitHub 地址：<https://github.com/SecureAuthCorp/impacket>

## 协议

Impacket 中包含以下协议:

- 以太网、Linux“Cooked”捕获。
- IP、TCP、UDP、ICMP、IGMP、ARP。
- IPv4 和 IPv6 支持。
- NMB 和 SMB1、SMB2 和 SMB3（高级实现）。
- MSRPC 版本 5，通过不同的传输：TCP、SMB/TCP、SMB/NetBIOS 和 HTTP。
- 使用密码/哈希/票证/密钥的普通、NTLM 和 Kerberos 身份验证。
- 以下 MSRPC 接口的部分/完整实现：EPM、DTYPES、LSAD、LSAT、NRPC、RRP、SAMR、SRVS、WKST、SCMR、DCOM、WMI
- TDS (MSSQL) 和 LDAP 协议实现的一部分。

## 工具

### 远程执行

- psexec.py：使用 RemComSvc (<https://github.com/kavika13/RemCom>) 的类似 PSEXEC 的功能示例。
- smbexec.py：一种与 PSEXEC 类似的方法，不使用 RemComSvc。此处描述了该技术。我们的实现更进一步，实例化本地 smbserver 以接收命令的输出。这在目标机器没有可用的可写共享的情况下很有用。
- atexec.py：本示例通过 Task Scheduler 服务在目标机器上执行命令，并返回执行命令的输出。
- wmiexec.py：半交互式 shell，通过 Windows Management Instrumentation 使用。它不需要在目标服务器上安装任何服务/代理。以管理员身份运行。高度隐蔽。
- dcomexec.py：一个类似于 wmiexec.py 的半交互式 shell，但使用不同的 DCOM 端点。目前支持 MMC20.Application、ShellWindows 和 ShellBrowserWindow 对象。

### Kerberos

- GetTGT.py：给定密码、hash 或 aesKey，此脚本将请求 TGT 并将其保存为 ccache。
- GetST.py：给定 ccache 中的密码、哈希值、aesKey 或 TGT，此脚本将请求 Service Ticket 并将其保存为 ccache。如果帐户具有约束委派（具有协议转换）权限，您将能够使用 -impersonate 开关代表另一个用户请求票证。
- GetPac.py：此脚本将获取指定目标用户的 PAC（特权属性证书）结构，该用户仅具有正常的经过身份验证的用户凭据。它通过混合使用 [MS-SFU] 的 S4USelf + 用户到用户 Kerberos 身份验证来实现。
- GetUserSPNs.py：此示例将尝试查找和获取与普通用户帐户关联的服务主体名称。输出与 JtR 和 HashCat 兼容。
- GetNPUsers.py：此示例将尝试列出和获取具有“不需要 Kerberos 预身份验证”属性集 (UF_DONT_REQUIRE_PREAUTH) 的用户的 TGT。输出与 JtR 兼容。
- rbcd.py：用于处理目标计算机的 msDS-AllowedToActOnBehalfOfOtherIdentity 属性的示例脚本。
- ticketConverter.py：该脚本将 mimikatz 常用的 kirbi 文件转换为 Impacket 使用的 ccache 文件，反之亦然。
- ticketer.py：此脚本将从头开始或基于模板（合法地从 KDC 请求）创建黄金/白银票证，允许您自定义 PAC_LOGON_INFO 结构内设置的一些参数，特别是组、ExtraSids、持续时间等.
- raiseChild.py：此脚本通过 (ab) 使用 Golden Tickets 和 ExtraSids 的概念来实现子域到林权限的提升。

### Windows Secrets

- secretsdump.py：执行各种技术以从远程机器转储机密，而无需在那里执行任何代理。 对于 SAM 和 LSA 机密（包括缓存的凭据），我们尝试从注册表中读取尽可能多的信息，然后将配置单元保存在目标系统（%SYSTEMROOT%\Temp 目录）中，并从那里读取其余数据。 对于 DIT 文件，我们使用 DL_DRSGetNCChanges() 方法转储 NTLM 哈希、纯文本凭据（如果可用）和 Kerberos 密钥。 它还可以通过使用 smbexec/wmiexec 方法执行的 vssadmin 转储 NTDS.dit。 如果服务不可用，脚本会启动其工作所需的服务（例如远程注册表，即使它被禁用）。 工作完成后，事情恢复到原来的状态。
- mimikatz.py：用于控制由@gentilkiwi 开发的远程 mimikatz RPC 服务器的迷你 shell。

### Server Tools/MiTM Attacks

- ntlmrelayx.py：此脚本执行 NTLM 中继攻击，设置 SMB 和 HTTP 服务器并将凭据中继到许多不同的协议（SMB、HTTP、MSSQL、LDAP、IMAP、POP3 等）。该脚本可以与预定义的攻击一起使用，这些攻击可以在中继连接时触发（例如通过 LDAP 创建用户），或者可以在 SOCKS 模式下执行。在这种模式下，对于中继的每个连接，稍后可以通过 SOCKS 代理多次使用。
- karmaSMB.py：一个 SMB 服务器，无论指定的 SMB 共享和路径名如何，它都会回答特定的文件内容。
- smbserver.py：SMB 服务器的 Python 实现。允许快速设置共享和用户帐户。

### WMI

- wmiquery.py：它允许发出 WQL 查询并获取目标系统上 WMI 对象的描述（例如，从 win32_account 中选择名称）。
- wmipersist.py：此脚本创建/删除 WMI 事件使用者/过滤器和两者之间的链接，以根据指定的 WQL 过滤器或计时器执行 Visual Basic。

### Known Vulnerabilities

- GoldenPac.py：利用 MS14-068。保存金票并在目标上启动 PSEXEC 会话。
- sambaPipe.py：该脚本将利用 CVE-2017-7494，上传并执行用户通过-so 参数指定的共享库。
- smbrelayx.py：利用 SMB 中继攻击利用 CVE-2015-0005。如果目标系统正在强制执行签名并且提供了机器帐户，则该模块将尝试通过 NETLOGON 收集 SMB 会话密钥。

### SMB/MSRPC

- smbclient.py：一个通用的 SMB 客户端，可让您列出共享和文件、重命名、上传和下载文件以及创建和删除目录，所有这些都使用用户名和密码或用户名和哈希组合。这是一个很好的例子，可以了解如何在实际中使用 impacket.smb。
- addcomputer.py：允许使用 LDAP 或 SAMR (SMB) 将计算机添加到域。
- getArch.py​​：此脚本将连接到目标（或目标列表）机器并收集由（ab）使用记录的 MSRPC 功能安装的操作系统架构类型。
- exchange.py：通过 RPC over HTTP v2 连接到 MS Exchange 的工具。
- lookupsid.py：通过 [MS-LSAT] MSRPC 接口的 Windows SID 暴力破解示例，旨在查找远程用户/组。
- netview.py：获取在远程主机上打开的会话列表并跟踪它们在找到的主机上循环并跟踪谁从远程服务器登录/退出
- reg.py：通过 [MS-RRP] MSRPC 接口的远程注册表操作工具。其想法是提供与 REG.EXE Windows 实用程序类似的功能。
- rpcdump.py：此脚本将转储在目标上注册的 RPC 端点和字符串绑定列表。它还将尝试将它们与众所周知的端点列表相匹配。
- rpcmap.py：扫描监听 DCE/RPC 接口。这将绑定到 MGMT 接口并获取接口 UUID 列表。如果 MGMT 接口不可用，它会获取在野外看到的接口 UUID 列表，并尝试绑定到每个接口。
- samrdump.py：一个与 MSRPC 套件中的安全帐户管理器远程接口通信的应用程序。它列出了通过此服务导出的系统用户帐户、可用资源共享和其他敏感信息。
- services.py：此脚本可用于通过 [MS-SCMR] MSRPC 接口操作 Windows 服务。它支持启动、停止、删除、状态、配置、列表、创建和更改。
- smbpasswd.py：此脚本是 smbpasswd 工具的替代品，旨在用于通过 SMB (MSRPC-SAMR) 远程更改过期密码

### MSSQL/TDS

- mssqlinstance.py：从目标主机检索 MSSQL 实例名称。
- mssqlclient.py：一个 MSSQL 客户端，支持 SQL 和 Windows 身份验证（也是散列）。它还支持 TLS。

### File Formats

- esentutl.py：一个扩展存储引擎格式实现。允许转储 ESE 数据库的目录、页面和表（例如 NTDS.dit）
- ntfs-read.py：NTFS 格式实现。该脚本提供了一个迷你外壳，用于浏览和提取 NTFS 卷，包括隐藏/锁定的内容。
- registry-read.py：一种 Windows 注册表文件格式实现。它允许解析离线注册表配置单元。

### Other

- findDelegation.py：简单的脚本，用于快速列出 AD 环境中的所有委托关系（无约束、有约束、基于资源的约束）。
- GetADUsers.py：此脚本将收集有关域用户及其相应电子邮件地址的数据。它还包括一些关于上次登录和上次密码设置属性的额外信息。
- Get-GPPPassword.py：此示例使用流来提取和解密组策略首选项密码以处理文件而不是安装共享。此外，它还可以离线解析 GPP XML 文件。
- mqtt_check.py：简单的 MQTT 示例，旨在使用不同的登录选项。可以很容易地转换为帐户/密码暴力破解。
- rdp_check.py: [MS-RDPBCGR] 和 [MS-CREDSSP] 部分实现只是为了达到 CredSSP 身份验证。此示例测试帐户在目标主机上是否有效。
- sniff.py：简单的数据包嗅探器，它使用 pcapy 库来侦听通过指定接口传输的数据包。
- sniffer.py：简单的数据包嗅探器，它使用原始套接字来侦听与指定协议相对应的传输中的数据包。
- ping.py：简单的 ICMP ping，它使用 ICMP 回显和回显回复数据包来检查主机的状态。如果远程主机启动，它应该用一个 echo-r​​eply 数据包回复 echo 探测器。
- ping6.py：简单的 IPv6 ICMP ping，它使用 ICMP 回显和回显回复数据包来检查主机的状态。
