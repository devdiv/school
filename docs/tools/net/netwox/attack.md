# netwox攻击

## 利用分片实施洪水攻击

IP协议在传输数据包时，经常会进行分片传输。例如，当一个设备准备传输一个IP数据包时，它将首先获取这个数据包的大小，然后获取发送数据包所使用的网络接口的**最大传输单元值（MTU）**。如果数据包的大小大于MTU，则该数据包将被分片。将一个数据包分片包括下面几步：

（1）设备将数据包分为若干个可成功进行传输的数据包。

（2）每个IP数据包的首部的总长度域会被设置为每个分片的片段长度。

（3）更多分片标志将会在数据流的所有数据包中设置为1，除了最后一个数据包。

（4）IP数据包头中分片部分的分片偏移将会被设置。

（5）数据包被发送出去。

目标主机收到分片包后，会根据分片信息重组报文。如果发送大量的无效IP分片包，会造成洪水攻击。用户可以使用netwox工具中编号为74的模块实施洪水攻击。

::: tip 提示
执行命令后没有任何输出信息，但是会向目标主机发送大量的IP分片数据包。如果使用Wireshark工具抓包，可以捕获到大量的IP分片数据包，如下图所示。图中显示了大量的IPv4数据包，Info列中的Fragmented IP protocol信息表示数据包为IP分片数据包。
:::

![image](./assets/attack-1.png)