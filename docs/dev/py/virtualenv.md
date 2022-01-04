## virtualenv

virtualenv 用来为一个应用创建一套“隔离”的 Python 运行环境。

1、创建项目目录

```batch
mkdir tutorial
cd tutorial
```

2、创建一个 virtualenv 来隔离我们本地的包依赖关系

```batch
virtualenv env
```

创建成功后，新增 env 文件夹，其文件内容如下：

![image](https://img2020.cnblogs.com/blog/2154323/202112/2154323-20211226183714275-1134192107.png)

3、启用对应 virtualenv

`source env/bin/activate` # 在 Windows 下使用 `env\Scripts\activate`。
