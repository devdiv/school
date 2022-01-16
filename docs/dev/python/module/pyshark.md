# pyshark网络数据包解析

## 简介

- PyShark 是利用 tshark 和 dumpcap 进行网络数据包解析的 Python 数据包解析器
- 本身并不会解析任何数据包，它只会使用 tshark 功能完成包解析；
- 提供从文件中读取（FileCapture）内容、从活动接口读取内容（LiveCapture）、使用环状缓冲区从活动接口读取内容（LiveRingCapture）、从远程活动接口读取内容（RemoteCapture）等方式；
- github 地址：<https://github.com/KimiNewt/pyshark.git>
- 扩展文档：<http://kiminewt.github.io/pyshark/>

## 安装

pip 安装：

```batch
pip install pyshark
```

离线安装：

```batch
git clone https://github.com/KimiNewt/pyshark.git
cd pyshark/src
python setup.py install
```

## 内容处理

Pyshark 具有一些“捕获”对象（Live、Remote、File、InMem）。 这些文件中的每一个都从它们各自的源中读取，然后可以用作迭代器来获取它们的数据包。 每个捕获对象还可以接收各种过滤器，以便只保存一些传入的数据包。

### FileCapture：从文件中读取

示例：

```python
import pyshark
cap = pyshark.FileCapture('/tmp/mycapture.cap')
cap
>>> <FileCapture /tmp/mycapture.cap>
print cap[0]
Packet (Length: 698)
Layer ETH:
        Destination: aa:bb:cc:dd:ee:ff
        Source: 00:de:ad:be:ef:00
        Type: IP (0x0800)
Layer IP:
        Version: 4
        Header Length: 20 bytes
        Differentiated Services Field: 0x00 (DSCP 0x00: Default; ECN: 0x00: Not-ECT (Not ECN-Capable Transport))
        Total Length: 684
        Identification: 0x254f (9551)
        Flags: 0x00
        Fragment offset: 0
        Time to live: 1
        Protocol: UDP (17)
        Header checksum: 0xe148 [correct]
        Source: 192.168.0.1
        Destination: 192.168.0.2
  ...
```

参数说明：

```python
:param keep_packets: Whether to keep packets after reading them via next(). Used to conserve memory when reading
large caps (can only be used along with the "lazy" option!)
:param input_file: File path of the capture (PCAP, PCAPNG)
:param display_filter: A display (wireshark) filter to apply on the cap before reading it.
:param only_summaries: Only produce packet summaries, much faster but includes very little information.
:param decryption_key: Optional key used to encrypt and decrypt captured traffic.
:param encryption_type: Standard of encryption used in captured traffic (must be either 'WEP', 'WPA-PWD', or
'WPA-PWK'. Defaults to WPA-PWK).
:param decode_as: A dictionary of {decode_criterion_string: decode_as_protocol} that are used to tell tshark
to decode protocols in situations it wouldn't usually, for instance {'tcp.port==8888': 'http'} would make
it attempt to decode any port 8888 traffic as HTTP. See tshark documentation for details.
:param tshark_path: Path of the tshark binary
:param override_prefs: A dictionary of tshark preferences to override, {PREFERENCE_NAME: PREFERENCE_VALUE, ...}.
:param disable_protocol: Tells tshark to remove a dissector for a specific protocol.
:param use_json: Uses tshark in JSON mode (EXPERIMENTAL). It is a good deal faster than XML
but also has less information. Available from Wireshark 2.2.0.
:param output_file: A string of a file to write every read packet into (useful when filtering).
:param custom_parameters: A dict of custom parameters to pass to tshark, i.e. {"--param": "value"}
```

### LiveCapture：从活动接口读取

示例：

```python
capture = pyshark.LiveCapture(interface='eth0')
capture.sniff(timeout=50)
capture
>>> <LiveCapture (5 packets)>
capture[3]
<UDP/HTTP Packet>

for packet in capture.sniff_continuously(packet_count=5):
    print 'Just arrived:', packet
```

从实时接口捕获可以通过两种方式完成：使用 sniff() 方法捕获给定数量的数据包（或给定时间），然后从捕获对象中读取数据包作为列表，或者使用 sniff_continously() 方法作为生成器并在每个数据包到达时对其进行处理。 另一种选择是为每个接收到的数据包定义一个回调：

```python
def print_callback(pkt):
    print 'Just arrived:', pkt
capture.apply_on_packets(print_callback, timeout=5)
```

如果提供了接口列表，捕获也可以在多个接口上运行，如果没有提供接口，则捕获也可以在所有接口上运行。 它甚至可以使用 RemoteCapture 通过远程接口运行。

### LiveRingCapture：使用环状缓冲区从活动接口读取

示例：

```python
>>>capture = pyshark.LiveRingCapture(interface='eth0')
>>>capture.sniff(timeout=50)
>>>capture
<LiveCapture(5 packets)>
>>>capture[3]
<UDP/HTTPPacket>
for packet in capture.sniff_continuously(packet_count=5):
print 'Just arrived:', packet
```

### RemoteCapture：从远程活动接口读取

示例：

```python
>>>capture = pyshark.RemoteCapture('192.168.1.101', 'eth0')
>>>capture.sniff(timeout=50)
>>>capture
```

## 过滤包数据

可以使用任何捕获对象来过滤数据包，如下所示：

```python
filtered_cap = pyshark.FileCapture(path_to_file, display_filter='http')
filtered_cap2 = pyshark.LiveCapture('eth0', bpf_filter='tcp port 80')
```

> There are two types of filters, BPF filters and display filters. Generally, bpf filters are more limited but are faster while display filters can be used on pretty much any attribute of the packet but are much slower. (Note: there is currently an issue with BPF filters on FileCapture and it is not recommended it be used).

BPF Filters 语法帮助：<https://biot.com/capstats/bpf.html>
DisplayFilters 语法帮助 <https://wiki.wireshark.org/DisplayFilters>

## 访问包数据

我们可以通过多种方式访问数据，Python 包被划分成到了多个层，首先我们需要访问特定的层，然后选择相应的数据区域。

```python
>>>packet['ip'].dst
192.168.0.1
>>>packet.ip.src
192.168.0.100
>>>packet[2].src
192.168.0.100
```

判断数据包中是否包含某一层，我们可以使用下列命令：

```python
>>>'IP' in packet
True
```

如需查看所有的数据区域，可以使用“packet.layer.field_names”属性，例如“packet.ip.field_names”。当然了，我们还可以直接获取到数据区域的原始代码数据以及注释信息：

```python
>>>p.ip.addr.showname
Sourceor Destination Address: 10.0.0.10 (10.0.0.10)
# Andsome new attributes as well:
>>>p.ip.addr.int_value
167772170
>>>p.ip.addr.binary_value
'\n\x00\x00\n'
```

## 解密数据包

Pyshark 支持自动化解密，支持的加密标准有 WEP、WPA-PWD 和 WPA-PSK，默认为 WPA-PWD：

```python
>>>cap1 = pyshark.FileCapture('/tmp/capture1.cap', decryption_key='password')
>>>cap2 = pyshark.LiveCapture(interface='wi0', decryption_key='password',encryption_type='wpa-psk')
```

除此之外，Pyshark 还支持以元组的形式传递支持的加密标准：

```python
>>>pyshark.FileCapture.SUPPORTED_ENCRYPTION_STANDARDS
('wep','wpa-pwd', 'wpa-psk')
>>>pyshark.LiveCapture.SUPPORTED_ENCRYPTION_STANDARDS
('wep','wpa-pwd', 'wpa-psk')
```
