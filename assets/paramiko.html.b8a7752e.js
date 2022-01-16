import{r as p,o,c as e,a as n,b as t,F as c,d as s,e as l}from"./app.a770902d.js";import{_ as u}from"./plugin-vue_export-helper.21dcd24c.js";const i={},r=n("h1",{id:"paramiko",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#paramiko","aria-hidden":"true"},"#"),s(" Paramiko")],-1),k=n("ul",null,[n("li",null,"ssh \u662F\u4E00\u4E2A\u534F\u8BAE\uFF0COpenSSH \u662F\u5176\u4E2D\u4E00\u4E2A\u5F00\u6E90\u5B9E\u73B0\uFF0Cparamiko \u662F Python \u7684\u4E00\u4E2A\u5E93\uFF0C\u5B9E\u73B0\u4E86 SSHv2 \u534F\u8BAE(\u5E95\u5C42\u4F7F\u7528 cryptography)\u3002"),n("li",null,"\u6709\u4E86 Paramiko \u4EE5\u540E\uFF0C\u6211\u4EEC\u5C31\u53EF\u4EE5\u5728 Python \u4EE3\u7801\u4E2D\u76F4\u63A5\u4F7F\u7528 SSH \u534F\u8BAE\u5BF9\u8FDC\u7A0B\u670D\u52A1\u5668\u6267\u884C\u64CD\u4F5C\uFF0C\u800C\u4E0D\u662F\u901A\u8FC7 ssh \u547D\u4EE4\u5BF9\u8FDC\u7A0B\u670D\u52A1\u5668\u8FDB\u884C\u64CD\u4F5C\u3002")],-1),d=n("p",null,[s("\u5B89\u88C5 \uFF1A"),n("code",null,"$ pip install paramiko")],-1),m=s("\u6587\u6863\uFF1A"),h={href:"https://docs.paramiko.org/",target:"_blank",rel:"noopener noreferrer"},y=s("https://docs.paramiko.org/"),_=s("Github\uFF1A"),g={href:"https://github.com/paramiko/paramiko",target:"_blank",rel:"noopener noreferrer"},f=s("https://github.com/paramiko/paramiko"),w=l(`<h2 id="api-\u6587\u6863" tabindex="-1"><a class="header-anchor" href="#api-\u6587\u6863" aria-hidden="true">#</a> API \u6587\u6863</h2><p>The high-level client API starts with creation of an SSHClient object. For more direct control, pass a socket (or socket-like object) to a Transport, and use start_server or start_client to negotiate with the remote host as either a server or client.</p><p>As a client, you are responsible for authenticating using a password or private key, and checking the server\u2019s host key. (Key signature and verification is done by paramiko, but you will need to provide private keys and check that the content of a public key matches what you expected to see.)</p><p>As a server, you are responsible for deciding which users, passwords, and keys to allow, and what kind of channels to allow.</p><p>Once you have finished, either side may request flow-controlled channels to the other side, which are Python objects that act like sockets, but send and receive data over the encrypted session.</p><p>For details, please see the following tables of contents (which are organized by area of interest.)</p><h2 id="core-ssh-protocol-classes" tabindex="-1"><a class="header-anchor" href="#core-ssh-protocol-classes" aria-hidden="true">#</a> Core SSH protocol classes</h2><ul><li>Channel</li><li>Client</li><li>Message</li><li>Packetizer</li><li>Transport</li></ul><h2 id="authentication-keys" tabindex="-1"><a class="header-anchor" href="#authentication-keys" aria-hidden="true">#</a> Authentication &amp; keys</h2><ul><li>SSH agents</li><li>Host keys / known_hosts files</li><li>Key handling <ul><li>Parent key class</li><li>DSA (DSS)</li><li>RSA</li><li>ECDSA</li><li>Ed25519</li></ul></li><li>GSS-API authentication</li><li>GSS-API key exchange</li></ul><h2 id="other-primary-functions" tabindex="-1"><a class="header-anchor" href="#other-primary-functions" aria-hidden="true">#</a> Other primary functions</h2><ul><li>Configuration</li><li>Keywords currently supported</li><li>Expansion tokens</li><li>config module API documentation</li><li>ProxyCommand support</li><li>Server implementation</li><li>SFTP</li></ul><h2 id="miscellany" tabindex="-1"><a class="header-anchor" href="#miscellany" aria-hidden="true">#</a> Miscellany</h2><ul><li>Buffered pipes</li><li>Buffered files</li><li>Cross-platform pipe implementations</li><li>Exceptions</li></ul><h2 id="examples" tabindex="-1"><a class="header-anchor" href="#examples" aria-hidden="true">#</a> Examples</h2><p>\u901A\u8FC7<code>channel.send</code>\u53D1\u9001\u547D\u4EE4:</p><div class="language-python ext-py"><pre class="language-python"><code><span class="token keyword">import</span> paramiko
<span class="token keyword">import</span> time
<span class="token keyword">import</span> re


<span class="token keyword">class</span> <span class="token class-name">SSH</span><span class="token punctuation">:</span>
    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> host<span class="token punctuation">,</span> username<span class="token punctuation">,</span> password<span class="token punctuation">,</span> port<span class="token operator">=</span><span class="token number">22</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>__ssh <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>SSHClient<span class="token punctuation">(</span><span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>__ssh<span class="token punctuation">.</span>set_missing_host_key_policy<span class="token punctuation">(</span>paramiko<span class="token punctuation">.</span>AutoAddPolicy<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>__ssh<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>host<span class="token punctuation">,</span> username<span class="token operator">=</span>username<span class="token punctuation">,</span>
                           password<span class="token operator">=</span>password<span class="token punctuation">,</span> port<span class="token operator">=</span>port<span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>channel <span class="token operator">=</span> self<span class="token punctuation">.</span>__ssh<span class="token punctuation">.</span>invoke_shell<span class="token punctuation">(</span>width<span class="token operator">=</span><span class="token number">1000</span><span class="token punctuation">,</span> height<span class="token operator">=</span><span class="token number">100</span><span class="token punctuation">)</span>
        time<span class="token punctuation">.</span>sleep<span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">cmd</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> cmd<span class="token punctuation">,</span> keywords<span class="token operator">=</span><span class="token string">r&#39;\\[.*\\]\\#$\\s*&#39;</span><span class="token punctuation">,</span> times<span class="token operator">=</span><span class="token number">60</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>channel<span class="token punctuation">.</span>send<span class="token punctuation">(</span>cmd <span class="token operator">+</span> <span class="token string">&quot;\\n&quot;</span><span class="token punctuation">)</span>
        count <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">while</span> count <span class="token operator">&lt;</span> times<span class="token punctuation">:</span>
            time<span class="token punctuation">.</span>sleep<span class="token punctuation">(</span><span class="token number">0.5</span><span class="token punctuation">)</span>
            recv <span class="token operator">=</span> self<span class="token punctuation">.</span>channel<span class="token punctuation">.</span>recv<span class="token punctuation">(</span><span class="token number">1000000</span><span class="token punctuation">)</span><span class="token punctuation">.</span>decode<span class="token punctuation">(</span><span class="token string">&#39;utf-8&#39;</span><span class="token punctuation">)</span>
            recv <span class="token operator">=</span> re<span class="token punctuation">.</span>sub<span class="token punctuation">(</span><span class="token string">r&#39;\\x1b\\[0m&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span> recv<span class="token punctuation">)</span>
            recv <span class="token operator">=</span> re<span class="token punctuation">.</span>sub<span class="token punctuation">(</span><span class="token string">r&#39;\\x1b\\[0134m&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span> recv<span class="token punctuation">)</span>
            <span class="token keyword">print</span><span class="token punctuation">(</span>recv<span class="token punctuation">)</span>
            <span class="token keyword">if</span> re<span class="token punctuation">.</span>search<span class="token punctuation">(</span>keywords<span class="token punctuation">,</span> recv<span class="token punctuation">)</span><span class="token punctuation">:</span>
                <span class="token keyword">break</span>
        <span class="token keyword">return</span> recv

    <span class="token keyword">def</span> <span class="token function">telent</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> m<span class="token punctuation">,</span> n<span class="token punctuation">,</span> keywords<span class="token operator">=</span><span class="token string">r&#39;\\[.*\\]\\#|.*\\&gt;&#39;</span><span class="token punctuation">,</span> times<span class="token operator">=</span><span class="token number">30</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        flag <span class="token operator">=</span> <span class="token boolean">False</span>
        count <span class="token operator">=</span> <span class="token number">0</span>
        <span class="token keyword">while</span> count <span class="token operator">&lt;</span> times<span class="token punctuation">:</span>
            res <span class="token operator">=</span> self<span class="token punctuation">.</span>cmd<span class="token punctuation">(</span><span class="token string">&#39;telent %s %s&#39;</span> <span class="token operator">%</span> <span class="token punctuation">(</span>m<span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">,</span> keywords<span class="token operator">=</span>keywords<span class="token punctuation">)</span>
            <span class="token keyword">if</span> re<span class="token punctuation">.</span>search<span class="token punctuation">(</span><span class="token string">&#39;Connected|welcome to telent!&#39;</span><span class="token punctuation">,</span>res<span class="token punctuation">)</span><span class="token punctuation">:</span>
                flag <span class="token operator">=</span> <span class="token boolean">True</span>
                <span class="token keyword">break</span>
            <span class="token keyword">else</span><span class="token punctuation">:</span>
                count <span class="token operator">=</span> count <span class="token operator">+</span> <span class="token number">1</span>
                <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">&#39;waitting for telnet \u2026 \\t\\ttime cost%s&#39;</span><span class="token operator">%</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token operator">*</span>count<span class="token punctuation">)</span><span class="token punctuation">)</span>
                time<span class="token punctuation">.</span>sleep<span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> flag

    <span class="token keyword">def</span> <span class="token function">__exit__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> exc_type<span class="token punctuation">,</span> exc_val<span class="token punctuation">,</span> exc_tb<span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>__ssh<span class="token punctuation">.</span>close<span class="token punctuation">(</span><span class="token punctuation">)</span>


    <span class="token keyword">def</span> <span class="token function">__enter__</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token keyword">return</span> self

<span class="token keyword">if</span> __name__ <span class="token operator">==</span> <span class="token string">&quot;__main__&quot;</span><span class="token punctuation">:</span>
    <span class="token keyword">with</span> SSH<span class="token punctuation">(</span><span class="token string">&quot;ip&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;user&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;pwd&quot;</span><span class="token punctuation">)</span> <span class="token keyword">as</span> ssh<span class="token punctuation">:</span>
        res <span class="token operator">=</span> ssh<span class="token punctuation">.</span>cmd<span class="token punctuation">(</span><span class="token string">&quot;ls /etc&quot;</span><span class="token punctuation">)</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span>

</code></pre></div><p>\u901A\u8FC7<code>client.exec_command</code>\u53D1\u9001\u547D\u4EE4\uFF1A</p><div class="language-python ext-py"><pre class="language-python"><code><span class="token keyword">import</span> paramiko

<span class="token comment"># \u5B9E\u4F8B\u5316SSHClient</span>
client <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>SSHClient<span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token comment"># \u81EA\u52A8\u6DFB\u52A0\u7B56\u7565\uFF0C\u4FDD\u5B58\u670D\u52A1\u5668\u7684\u4E3B\u673A\u540D\u548C\u5BC6\u94A5\u4FE1\u606F\uFF0C\u5982\u679C\u4E0D\u6DFB\u52A0\uFF0C\u90A3\u4E48\u4E0D\u518D\u672C\u5730know_hosts\u6587\u4EF6\u4E2D\u8BB0\u5F55\u7684\u4E3B\u673A\u5C06\u65E0\u6CD5\u8FDE\u63A5</span>
client<span class="token punctuation">.</span>set_missing_host_key_policy<span class="token punctuation">(</span>paramiko<span class="token punctuation">.</span>AutoAddPolicy<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment"># \u8FDE\u63A5SSH\u670D\u52A1\u7AEF\uFF0C\u4EE5\u7528\u6237\u540D\u548C\u5BC6\u7801\u8FDB\u884C\u8BA4\u8BC1</span>
client<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>hostname<span class="token operator">=</span><span class="token string">&#39;192.168.1.105&#39;</span><span class="token punctuation">,</span> port<span class="token operator">=</span><span class="token number">22</span><span class="token punctuation">,</span>
               username<span class="token operator">=</span><span class="token string">&#39;root&#39;</span><span class="token punctuation">,</span> password<span class="token operator">=</span><span class="token string">&#39;123456&#39;</span><span class="token punctuation">)</span>

<span class="token comment"># \u6253\u5F00\u4E00\u4E2AChannel\u5E76\u6267\u884C\u547D\u4EE4</span>
stdin<span class="token punctuation">,</span> stdout<span class="token punctuation">,</span> stderr <span class="token operator">=</span> client<span class="token punctuation">.</span>exec_command<span class="token punctuation">(</span>
    <span class="token string">&#39;df -h &#39;</span><span class="token punctuation">)</span>  <span class="token comment"># stdout \u4E3A\u6B63\u786E\u8F93\u51FA\uFF0Cstderr\u4E3A\u9519\u8BEF\u8F93\u51FA\uFF0C\u540C\u65F6\u662F\u67091\u4E2A\u53D8\u91CF\u6709\u503C</span>

<span class="token comment"># \u6253\u5370\u6267\u884C\u7ED3\u679C</span>
<span class="token keyword">print</span><span class="token punctuation">(</span>stdout<span class="token punctuation">.</span>read<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>decode<span class="token punctuation">(</span><span class="token string">&#39;utf-8&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment"># \u5173\u95EDSSHClient</span>
client<span class="token punctuation">.</span>close<span class="token punctuation">(</span><span class="token punctuation">)</span>

</code></pre></div><p>\u5BC6\u94A5\u8FDE\u63A5\u65B9\u5F0F\uFF1A</p><div class="language-python ext-py"><pre class="language-python"><code><span class="token comment"># \u914D\u7F6E\u79C1\u4EBA\u5BC6\u94A5\u6587\u4EF6\u4F4D\u7F6E</span>
private <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>RSAKey<span class="token punctuation">.</span>from_private_key_file<span class="token punctuation">(</span><span class="token string">&#39;/Users/ch/.ssh/id_rsa&#39;</span><span class="token punctuation">)</span>

<span class="token comment">#\u5B9E\u4F8B\u5316SSHClient</span>
client <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>SSHClient<span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token comment">#\u81EA\u52A8\u6DFB\u52A0\u7B56\u7565\uFF0C\u4FDD\u5B58\u670D\u52A1\u5668\u7684\u4E3B\u673A\u540D\u548C\u5BC6\u94A5\u4FE1\u606F\uFF0C\u5982\u679C\u4E0D\u6DFB\u52A0\uFF0C\u90A3\u4E48\u4E0D\u518D\u672C\u5730know_hosts\u6587\u4EF6\u4E2D\u8BB0\u5F55\u7684\u4E3B\u673A\u5C06\u65E0\u6CD5\u8FDE\u63A5</span>
client<span class="token punctuation">.</span>set_missing_host_key_policy<span class="token punctuation">(</span>paramiko<span class="token punctuation">.</span>AutoAddPolicy<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment">#\u8FDE\u63A5SSH\u670D\u52A1\u7AEF\uFF0C\u4EE5\u7528\u6237\u540D\u548C\u5BC6\u7801\u8FDB\u884C\u8BA4\u8BC1</span>
client<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>hostname<span class="token operator">=</span><span class="token string">&#39;10.0.0.1&#39;</span><span class="token punctuation">,</span>port<span class="token operator">=</span><span class="token number">22</span><span class="token punctuation">,</span>username<span class="token operator">=</span><span class="token string">&#39;root&#39;</span><span class="token punctuation">,</span>pkey<span class="token operator">=</span>private<span class="token punctuation">)</span>
</code></pre></div><p>SSHClient \u5C01\u88C5 Transport:</p><div class="language-python ext-py"><pre class="language-python"><code><span class="token keyword">import</span> paramiko

<span class="token comment"># \u521B\u5EFA\u4E00\u4E2A\u901A\u9053</span>
transport <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>Transport<span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token string">&#39;hostname&#39;</span><span class="token punctuation">,</span> <span class="token number">22</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
transport<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>username<span class="token operator">=</span><span class="token string">&#39;root&#39;</span><span class="token punctuation">,</span> password<span class="token operator">=</span><span class="token string">&#39;123&#39;</span><span class="token punctuation">)</span>

ssh <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>SSHClient<span class="token punctuation">(</span><span class="token punctuation">)</span>
ssh<span class="token punctuation">.</span>_transport <span class="token operator">=</span> transport

stdin<span class="token punctuation">,</span> stdout<span class="token punctuation">,</span> stderr <span class="token operator">=</span> ssh<span class="token punctuation">.</span>exec_command<span class="token punctuation">(</span><span class="token string">&#39;df -h&#39;</span><span class="token punctuation">)</span>
<span class="token keyword">print</span><span class="token punctuation">(</span>stdout<span class="token punctuation">.</span>read<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>decode<span class="token punctuation">(</span><span class="token string">&#39;utf-8&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

transport<span class="token punctuation">.</span>close<span class="token punctuation">(</span><span class="token punctuation">)</span>

</code></pre></div><p>SFTPClient \u5E38\u7528\u65B9\u6CD5\u4E3E\u4F8B:</p><div class="language-python ext-py"><pre class="language-python"><code><span class="token keyword">import</span> paramiko

<span class="token comment"># \u83B7\u53D6Transport\u5B9E\u4F8B</span>
tran <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>Transport<span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token string">&#39;10.0.0.3&#39;</span><span class="token punctuation">,</span> <span class="token number">22</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment"># \u8FDE\u63A5SSH\u670D\u52A1\u7AEF\uFF0C\u4F7F\u7528password</span>
tran<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>username<span class="token operator">=</span><span class="token string">&quot;root&quot;</span><span class="token punctuation">,</span> password<span class="token operator">=</span><span class="token string">&#39;123456&#39;</span><span class="token punctuation">)</span>
<span class="token comment"># \u6216\u4F7F\u7528</span>
<span class="token comment"># \u914D\u7F6E\u79C1\u4EBA\u5BC6\u94A5\u6587\u4EF6\u4F4D\u7F6E</span>
private <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>RSAKey<span class="token punctuation">.</span>from_private_key_file<span class="token punctuation">(</span><span class="token string">&#39;/Users/root/.ssh/id_rsa&#39;</span><span class="token punctuation">)</span>
<span class="token comment"># \u8FDE\u63A5SSH\u670D\u52A1\u7AEF\uFF0C\u4F7F\u7528pkey\u6307\u5B9A\u79C1\u94A5</span>
tran<span class="token punctuation">.</span>connect<span class="token punctuation">(</span>username<span class="token operator">=</span><span class="token string">&quot;root&quot;</span><span class="token punctuation">,</span> pkey<span class="token operator">=</span>private<span class="token punctuation">)</span>

<span class="token comment"># \u83B7\u53D6SFTP\u5B9E\u4F8B</span>
sftp <span class="token operator">=</span> paramiko<span class="token punctuation">.</span>SFTPClient<span class="token punctuation">.</span>from_transport<span class="token punctuation">(</span>tran<span class="token punctuation">)</span>

<span class="token comment"># \u8BBE\u7F6E\u4E0A\u4F20\u7684\u672C\u5730/\u8FDC\u7A0B\u6587\u4EF6\u8DEF\u5F84</span>
localpath <span class="token operator">=</span> <span class="token string">&quot;/Users/root/Downloads/1.txt&quot;</span>
remotepath <span class="token operator">=</span> <span class="token string">&quot;/tmp/1.txt&quot;</span>

<span class="token comment"># \u6267\u884C\u4E0A\u4F20\u52A8\u4F5C</span>
sftp<span class="token punctuation">.</span>put<span class="token punctuation">(</span>localpath<span class="token punctuation">,</span> remotepath<span class="token punctuation">)</span>
<span class="token comment"># \u6267\u884C\u4E0B\u8F7D\u52A8\u4F5C</span>
sftp<span class="token punctuation">.</span>get<span class="token punctuation">(</span>remotepath<span class="token punctuation">,</span> localpath<span class="token punctuation">)</span>

tran<span class="token punctuation">.</span>close<span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre></div>`,25);function S(b,v){const a=p("ExternalLinkIcon");return o(),e(c,null,[r,k,d,n("p",null,[m,n("a",h,[y,t(a)])]),n("p",null,[_,n("a",g,[f,t(a)])]),w],64)}var C=u(i,[["render",S]]);export{C as default};
