# Docker 学习

## 1. Docker 是什么

- Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。
- Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样

**Docker主要解决的问题**：

- 保证程序运行环境的一致性；
- 降低配置开发环境、生产环境的复杂度和成本；
- 实现程序的快速部署和分发。

## 2.Linux 容器

inux 容器不是模拟一个完整的操作系统，而是对进程进行隔离。或者说，在正常进程的外面套了一个保护层。对于容器里面的进程来说，它接触到的各种资源都是虚拟的，从而实现与底层系统的隔离

**特点**

- 启动快
- 资源占用少
- 体积小

**核心内核技术**

1.命名空间

- 作用：隔离进程的视图，使每个容器拥有独立的系统资源标识。

2.控制组

- 作用：限制和分配容器的物理资源（CPU、内存、磁盘 I/O、网络带宽等）。

3.容器文件系统

- 联合文件系统：通过分层存储实现镜像的轻量共享。
- 写时复制：容器启动时仅复制修改的文件，减少镜像体积。

## 3.docker和KVM

- 启动时间
  - Docker秒级启动
  - KVM分钟级启动
- 轻量级 容器镜像通常以M为单位，虚拟机以G为单位，容器资源占用小，要比虚拟要部署更快速
  - 容器共享宿主机内核，系统级虚拟化，占用资源少，容器性能基本接近物理机
  - 虚拟机需要虚拟化一些设备，具有完整的OS,虚拟机开销大，因而降低性能，没有容器性能好
- 安全性
  - 由于共享宿主机内核，只是进程隔离，因此隔离性和稳定性不如虚拟机，容器具有一定权限访问宿主机内核，存在一下安全隐患
- 使用要求
  - KVM基于硬件的完全虚拟化，需要硬件CPU虚拟化技术支持
  - 容器共享宿主机内核，可运行在主机的Linux的发行版，不用考虑CPU是否支持虚拟化技术

## 4. Docker 体系结构



### **4.1Docker 架构图**

- containerd 是一个守护进程，使用runc管理容器，向Docker Engine提供接口
- shim 只负责管理一个容器
- runC是一个轻量级工具，只用来运行容器

```
+------------------+       +-------------------+       +-------------------+
|                  |       |                   |       |                   |
|   Docker Client  | <---> | Docker Daemon   | <---> | Docker Registry   |
| (CLI, API)       |       | (dockerd + runc)  |       | (Docker Hub, etc) |
+------------------+       +---------+---------+       +---------+---------+
                                                      |       |
                                                      |       v
                                                      | +-------------------+
                                                      | | Docker Images     |
                                                      | +---------+---------+
                                                      |           |
                                                      |           v
                                                      | +---------+---------+
                                                      | | Containers        |
                                                      | +---------+---------+
                                                      |           |
                                                      |           v
                                                      | +---------+---------+
                                                      | | Docker Engine     |
                                                      | | (containerd, runc，Shim)|
                                                      +-------------------+
```

------

### 4.2**核心组件详解**

#### **1. Docker 客户端（Docker Client）**

- **功能**：用户与 Docker 交互的入口（CLI 或 API）。
- **工具**：`docker` 命令行工具。
- **交互**：向 Docker Daemon 发送指令（如 `docker run`、`docker build`）。

#### **2. Docker 守护进程（Docker Daemon）**

- **功能**：后台服务，负责容器生命周期管理。
- 组成：
  - **dockerd**：主守护进程，监听客户端请求，调用底层工具。
  - **containerd**：OCI 标准的容器运行时，管理容器的完整生命周期（创建、启动、停止）。
  - **runc**：轻量级 OCI 运行时，直接与 Linux 内核交互（创建 Namespaces、Cgroups 等）。
- **交互**：从 Registry 拉取镜像，构建容器文件系统，通过 containerd 启动容器。

#### **3. Docker 镜像（Docker Image）**

- **功能**：只读模板，包含应用代码、依赖和配置。
- **存储**：基于 **UnionFS** 的分层结构（如 OverlayFS），支持复用和共享。
- **示例**：`ubuntu:20.04` 镜像包含 Ubuntu 系统的基础环境。

#### **4. Docker 容器（Docker Container）**

- **功能**：镜像的运行实例，具有可写层（读写隔离）。
- **隔离机制**：通过 Namespaces（进程、网络、文件系统等）和 Cgroups 实现资源隔离。
- **生命周期**：由 `docker run` 创建，依赖 containerd 和 runc 启动。

#### **5. Docker Registry**

- **功能**：镜像仓库，用于存储和分发镜像。
- 类型：
  - **公有仓库**：Docker Hub、GitHub Container Registry。
  - **私有仓库**：Harbor、AWS ECR、阿里云 ACR。



## 6.Docker底层使用的技术

- Docker使用Go语言实现。

- Docker利用linux内核的几个特性来实现功能:

  - 利用linux的命名空间(Namespaces)

  - 利用linux控制组(Control Groups)

  - 利用linux的联合文件系统(Union File Systems)

    这也就意味着Docker只能在linux上运行。

    在windows、MacOS上运行Docker，其实本质上是借助了虚拟化技术，然后在linux虚拟机上运行的Docker程序。

- 容器格式（ Container Format ）:

  - Docker Engine将namespace、cgroups、UnionFS进行组合后的一个package，就是一个容器格式(Container Format)。Docker通过对这个package中的namespace、cgroups、UnionFS进行管理控制实现容器的创建和生命周期管理。
  - 容器格式(Container Format)有多种，其中Docker目前使用的容器格式被称为libcontainer。

- Namespaces（命名空间）：为Docker容器提供操作系统层面的隔离

  - 进程号隔离：每一个容器内运行的第一个进程，进程号总是从1开始起算
  - 网络隔离：容器的网络与宿主机或其他容器的网络是隔离的、分开的，也就是相当于两个网络
  - 进程间通隔离：容器中的进程与宿主机或其他容器中的进程是互相不可见的，通信需要借助网络
  - 内核以及系统版本号隔离：容器查看内核版本号或者系统版本号时，查看的是容器的，而非宿主机的
  - 文件系统挂载隔离: 容器拥有自己单独的工作目录

- Control Groups（控制组-cgroups）：为Docker容器提供硬件层面的隔离

- Union File Systems（联合文件系统--UnionFS）：利用分层(layer)思想管理镜像和容器

## 7.docker安装

### 1 .Linux安装

```bash
// 安装依赖和存储驱动相关包
yum install -y yum-utils device-mapper-persistent-data lvm2
```

**作用**：安装 Docker 所需的依赖包和存储驱动支持。

- **`yum-utils`**：提供 `yum-config-manager` 等工具，用于管理 YUM 仓库。
- **`device-mapper-persistent-data`** 和 **`lvm2`**：
  这些是 ​**​设备映射器（Device Mapper）​**​ 存储驱动的依赖项。Docker 默认使用 `overlay2` 存储驱动，但如果系统不支持 `overlay2`（例如旧版内核），可能会回退到 `devicemapper`。

```bash
// 添加 Docker 官方仓库
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

- 作用：将 Docker 的官方软件仓库添加到 CentOS 的 YUM 源列表中。
  - 此仓库包含 Docker CE（社区版）、Docker CLI 和容器运行时 `containerd.io` 的 RPM 包。
  - **`--add-repo`**：直接通过 URL 添加仓库，无需手动下载 `.repo` 文件。

```bash
yum install docker-ce docker-ce-cli containerd.io -y
```

- 作用：从已添加的 Docker 官方仓库中安装以下组件：

  - **`docker-ce`**：Docker 社区版引擎（核心组件，负责容器管理）。
  - **`docker-ce-cli`**：Docker 的命令行工具（CLI），用于执行 `docker` 命令。
  - **`containerd.io`**：容器运行时（Container Runtime），负责底层容器生命周期管理（如创建、启动、停止容器）。

  ### 2.启动

  ```bash
  systemctl start docker
  systemctl enable docker  # 开机自启
  ```

  ### 3. 查看docker版本

  ```bash
  docker version
  docker info
  ```

  ## Docker架构 

![img](https://developer.qcloudimg.com/http-save/yehe-5574182/ca299fb390d5cfc941d74a01650c5183.jpg)

### 2. Docker版本

**Docker-CE和Docker-EE**

- Docker-CE指Docker社区版，由社区维护和提供技术支持，为免费版本，适合个人开发人员和小团队使用。
- Docker-EE指Docker企业版，为收费版本，由售后团队和技术团队提供技术支持，专为企业开发和IT团队而设计。
- 相比Docker-EE，增加一些额外功能，更重要的是提供了更安全的保障。
- 此外，Docker的发布版本分为Stable版和Edge版，区别在于前者是按季度发布的稳定版(发布慢)，后者是按月发布的边缘版(发布快)。
- 通常情况下，Docker-CE足以满足我们的需求。后面学习主要针对Docker-CE进行学习







## 8. Docker核心技术之镜像

- Docker 把应用程序及其依赖，打包在 image 文件里面。只有通过这个文件，才能生成 Docker 容器

- image 文件可以看作是容器的模板
- Docker 根据 image 文件生成容器的实例
- 同一个 image 文件，可以生成多个同时运行的容器实例
- 镜像不是一个单一的文件，而是有多层
- 容器其实就是在镜像的最上面加了一层读写层，在运行容器里做的任何文件改动，都会写到这个读写层里。如果容器删除了，最上面的读写层也就删除了，改动也就丢失了
- 我们可以通过`docker history <ID/NAME>` 查看镜像中各层内容及大小，

- 用户既可以使用 `docker load` 来导入镜像存储文件到本地镜像库，也可以使用 `docker import` 来导入一个容器快照到本地镜像库

- 这两者的区别在于容器(import)快照文件将丢弃所有的历史记录和元数据信息（即仅保存容器当时的快照状态），而镜像(load)存储文件将保存完整记录，体积也要大

  | 命令    | 含义                                          | 语法                                                         | 案例                                              |
  | :------ | :-------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------ |
  | ls      | 查看全部镜像                                  | docker image ls                                              |                                                   |
  | search  | 查找镜像                                      | docker search [imageName]                                    |                                                   |
  | history | 查看镜像历史                                  | docker history [imageName]                                   |                                                   |
  | inspect | 显示一个或多个镜像详细信息                    | docker inspect [imageName]                                   |                                                   |
  | pull    | 拉取镜像                                      | docker pull [imageName]                                      |                                                   |
  | push    | 推送一个镜像到镜像仓库                        | docker push [imageName]                                      |                                                   |
  | rmi     | 删除镜像                                      | docker rmi [imageName] docker image rmi 2                    |                                                   |
  | prune   | 移除未使用的镜像，没有标记或补任何容器引用    | docker image prune                                           | docker image prune                                |
  | tag     | 标记本地镜像，将其归入某一仓库                | docker tag [OPTIONS] IMAGE[:TAG] [REGISTRYHOST/][USERNAME/]NAME[:TAG] | docker tag centos:7 zhangrenyang/centos:v1        |
  | export  | 将容器文件系统作为一个tar归档文件导出到STDOUT | docker export [OPTIONS] CONTAINER                            | docker export -o hello-world.tar b2712f1067a3     |
  | import  | 导入容器快照文件系统tar归档文件并创建镜像     | docker import [OPTIONS] file/URL/- [REPOSITORY[:TAG]]        | docker import hello-world.tar                     |
  | save    | 将指定镜像保存成`tar`文件                     | docker save [OPTIONS] IMAGE [IMAGE...]                       | docker save -o hello-world.tar hello-world:latest |
  | load    | 加载tar文件并创建镜像                         |                                                              | docker load -i hello-world.tar                    |
  | build   | 根据Dockerfile构建镜像                        | docker build [OPTIONS] PATH / URL / -                        | docker build -t zf/ubuntu:v1 .                    |

### 1. 镜像搜索 - docker search

- **作用**：搜索Docker Hub(镜像仓库)上的镜像。
- **命令格式**：docker search [OPTIONS] TERM
- **命令参数(OPTIONS)：**
  - --filter filter                        根据提供的格式筛选结果
  - --format string                   利用GO语言的format格式化输出结果
  - -- limit  int                            展示最大的结果数，默认25个
  - --not-trunc                         内容全部显示



```bash
# 搜索 centos
docker search  centos
# 搜索 hello-world
 docker search  hello-world
```



### 2.  镜像查看 - docker images/docker image ls

- **作用**：列出本地镜像
- **命令格式**：docker image ls [OPTIONS] [REPOSITORY[:TAG]]

- **命令参数（OPTIONS）**：
  -  -a,   --all                                  展示所有镜像（默认隐藏底层的镜像）
  - ​       --no-trunc                        不缩率显示
  -  -q , --quiet                              只显示镜像ID

```bash
# 查看所有本地存储的镜像。
docker images
REPOSITORY      TAG       IMAGE ID       CREATED         SIZE
mongo           6.0       4f3dbc8f2775   5 weeks ago     747MB
bitnami/redis   latest    f7f358889b53   2 months ago    145MB
mysql           8.3.0     6f343283ab56   14 months ago   632MB

# 查看指定
docker images mysql

REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
mysql        8.3.0     6f343283ab56   14 months ago   632MB

```

### 3. 镜像下载 - docker pull

- **作用**：下载远程仓库（如Docker Hub）中的镜像
- **命令格式**：docker pull [OPTIONS] NAME[:TAG|@DIGEST]

- **命令参数（OPTIONS）**：

  -  -a,   --all-tags                                  下载所有符合给定tag的镜像

    

```bash
# 下载 centos
docker  pull centos

# 下载 hello-world
 docker pull  hello-world
```

### 4. 镜像删除 - docker rmi/docker image rm

- **作用**：将本地的一个或多个镜像删除
- **命令格式**：docker rmi [OPTIONS] IMAGE [IMAGE...]

- **命令参数（OPTIONS）**：
  - -f, --force                                  强制删除

```bash
# 删除 hello-world
 docker rmi  hello-world

Untagged: hello-world:latest
 
# 如果有多个版本hello-world 会删除 最新的hello-world
# docker rmi  hello-world 等价 docker rmi  hello-world：last
```



### 5.  镜像保存备份 – docker save

- **作用**：将本地的一个或多个镜像打包保存成本地tar文件(输出到STDOUT)
- **命令格式**：docker save [OPTIONS] IMAGE [IMAGE...]

- **命令参数（OPTIONS）**：
  - -o, --output string                                 指定写入的文件名和路径

```bash
# 语法 备份    mysql (redis_image.tar文件名称)
docker save -o redis_image.tar mysql


```

### 6.  镜像备份导入 - docker load

- **作用**：将save命令打包的镜像导入本地镜像库中
- **命令格式**：docker load [OPTIONS]

- **命令参数（OPTIONS）**：
  - -i,  --input string                                  指定要打入的文件
  - -q, --quiet                                             不打印导入过程信息

```bash
#
docker load -i redis_image.tar
```

### 7.  镜像重命名 – docker tag



- **作用**：对本地镜像的NAME、TAG进行重命名，并新产生一个命名后镜像
- **命令格式**：docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]

``` bash
# 重命名
# 如果centos名称有，就把原有的镜像指向新名称，如果原有名称none 就会覆盖
docker tag centos  centos:7.4
```



### 8. 镜像详细信息 – docker image inspect/docker inspect

- **作用**：查看本地一个或多个镜像的详细信息
- **命令格式**：docker image inspect [OPTIONS] IMAGE [IMAGE...]

- **命令参数（OPTIONS）**：
  - -f, --format string                                  利用特定Go语言的format格式输出结果
  - -q, --quiet                                             不打印导入过程信息

```bash

docker image inspect centos
```



## 9. Docker核心技术之容器

**什么是容器**

容器（Container）：容器是一种轻量级、可移植、并将应用程序进行的打包的技术，使应用程序可以在几乎任何地方以相同的方式运行.

- `docker  run` 命令会从 `image` 文件，生成一个正在运行的容器实例。
- `docker container run`命令具有自动抓取 image 文件的功能。如果发现本地没有指定的 image 文件，就会从仓库自动抓取

- image 文件生成的容器实例，本身也是一个文件，称为容器文件.
- 关闭容器并不会删除容器文件，只是容器停止运行

| 命令                 | 含义                                                         | 案例                                                         |                                                     |
| :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | --------------------------------------------------- |
| run                  | 从镜像运行一个容器                                           | docker run ubuntu /bin/echo 'hello-world'                    |                                                     |
| ls                   | 列出容器                                                     | docker container ls                                          |                                                     |
| inspect              | 显示一个或多个容器详细信息                                   | docker inspect                                               |                                                     |
| attach               | 要attach上去的容器必须正在运行，可以同时连接上同一个container来共享屏幕 | docker attach [OPTIONS] CONTAINER                            | docker attach 6d1a25f95132                          |
| stats                | 显示容器资源使用统计                                         | docker container stats                                       |                                                     |
| top                  | 显示一个容器运行的进程                                       | docker container top                                         |                                                     |
| update               | 更新一个或多个容器配置                                       |                                                              | docker update -m 500m --memory-swap -1 6d1a25f95132 |
| port                 | 列出指定的容器的端口映射                                     | docker run -d -p 8080:80 nginx docker container port containerID |                                                     |
| ps                   | 查看当前运行的容器                                           | docker ps -a -l                                              |                                                     |
| kill [containerId]   | 终止容器(发送SIGKILL )                                       | docker kill [containerId]                                    |                                                     |
| rm [containerId]     | 删除容器                                                     | docker rm [containerId]                                      |                                                     |
| start [containerId]  | 启动已经生成、已经停止运行的容器文件                         | docker start [containerId]                                   |                                                     |
| stop [containerId]   | 终止容器运行 (发送 SIGTERM )                                 | docker stop [containerId] docker container stop $(docker container ps -aq) |                                                     |
| logs [containerId]   | 查看 docker 容器的输出                                       | docker logs [containerId]                                    |                                                     |
| exec [containerId]   | 进入一个正在运行的 docker 容器执行命令                       | docker container exec -it f6a53629488b /bin/bash             |                                                     |
| cp [containerId]     | 从正在运行的 Docker 容器里面，将文件拷贝到本机               | docker container cp f6a53629488b:/root/root.txt .            |                                                     |
| commit [containerId] | 根据一个现有容器创建一个新的镜像                             | docker commit -a "zhufeng" -m "mynginx" a404c6c174a2 mynginx:v1 |                                                     |

https://cloud.tencent.com.cn/developer/article/2236303

<img src="https://developer.qcloudimg.com/http-save/yehe-7144964/0a5ac6d600d74c4d3450123a84732388.jpg" alt="1748328577033" />

### 1. 容器创建 – docker create

- **作用**：利用镜像创建出一个Created 状态的待启动容器
- **命令格式**：docker create [OPTIONS] IMAGE [COMMAND] [ARG...]

- **命令参数（OPTIONS）**：
  - -t, --tty                                   分配一个伪TTY，也就是分配虚拟终端
  - -i, --interactive                      即使没有连接，也要保持STDIN打开
  - --name                                  为容器起名，如果没有指定将会随机产生一个名称
- 命令参数（COMMAND\ARG）:
  - COMMAND 表示容器启动后，需要在容器中执行的命令，如ps、ls 等命令
  - RG 表示执行 COMMAND 时需要提供的一些参数，如ps 命令的 aux、ls命令的-a等等

```bash
# 创建容器名为wo-mysql， 表示容器启动后执行ls命令 参数 -a
 docker  create  --name wo-mysql  mysql:8.3.0  ls -a
 
# docker-entrypoint.sh 是 Docker 容器启动时执行的脚本，通常用于初始化容器的环境设置 
    NAMES         IMAGE               COMMAND                           STATUS
  mysql:8.3.0   mysql:8.3.0         "docker-entrypoint.sh ls -a"        Created
  
  
  
 #-t（--tty）表示为容器分配一个伪终端（TTY），通常用于与容器进行交互式会话。
 #（--interactive）表示以交互模式启动容器，允许你在容器内执行命令。如果你在命令行启动 MySQL 容器时加上 -ti，它意味着你可以在容器内交互
 docker create -ti --name wo-mysql2 mysql:8.3.0
```

### 2. 容器启动 – docker start

- **作用**：将一个或多个处于创建状态或关闭状态的容器启动起来
- **命令格式**：docker start [OPTIONS] CONTAINER [CONTAINER...]

- **命令参数（OPTIONS）**：
  - -a, --attach                           将当前shell的 STDOUT/STDERR 连接到容器上
  - -i, --interactive                      将当前shell的 STDIN连接到容器上	

```bash

# 容器启动 wo-mysql
docker start wo-mysql

# STATUS(容器状态) 从 Created（创建）到很快Exited（退出）状态，是因为ls -a 命令很快执行完了
   IMAGE           COMMAND                           STATUS                          NAMES
  mysql:8.3.0     "docker-entrypoint.s…"      Exited (0) 24 seconds ago             wo-mysql
  
  # 容器启动 -a 把容器输出结果，展示到当前shell
 C:\Users\sunmeng>docker start -a wo-mysql
.
..
.dockerenv
bin
boot
dev
docker-entrypoint-initdb.d
etc
home
lib
lib64
media

#执行容器wo-mysql2 通过创建时候传入  -ti，允许你在容器内执行命令mysql
docker start -a  wo-mysql2
2025-05-27 02:21:04+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.3.0-1.el8 started.
2025-05-27 02:21:05+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2025-05-27 02:21:05+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.3.0-1.el8 started.
2025-05-27 02:21:05+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following as an environment variable:
    # 指定一个密码来初始化 root 用户（推荐）
    - MYSQL_ROOT_PASSWORD
    # 允许使用空密码（不推荐，除非你知道自己在做什么）
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD


```

### 3. 容器创建并启动 – docker run

- **作用**：利用镜像创建并启动一个容器
- **命令格式**：docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

- **命令参数（OPTIONS）**：
  - -t, --tty                                       分配一个伪TTY，也就是分配虚拟终端
  - -i, --interactive                          即使没有连接，也要保持STDIN打开
  - ​    --name                                  为容器起名，如果没有指定将会随机产生一个名称
  - --rm                                          当容器退出运行后，自动删除容器
- 命令参数（COMMAND\ARG）:
  - COMMAND 表示容器启动后，需要在容器中执行的命令，如ps、ls 等命令
  - RG 表示执行 COMMAND 时需要提供的一些参数，如ps 命令的 aux、ls命令的-a等等

```bash

# docker run  ==  docker create + docker start -a   前台模式
# docker run -d  ===  docker create + docker start  后台模式
# 创建并启动 mysql:8.3.0
docker run mysql:8.3.0
2025-05-27 02:39:07+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.3.0-1.el8 started.
2025-05-27 02:39:07+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2025-05-27 02:39:07+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.3.0-1.el8 started.
2025-05-27 02:39:07+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following as an environment variable:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
# 创建时候没有传名称，所以docker随机生成名称 vibrant_hawking
docker ps -a
  IMAGE           COMMAND                   CREATED             STATUS                       NAMES
  mysql:8.3.0     "docker-entrypoint.s…"   8 seconds ago       Exited (1) 6 seconds ago    vibrant_hawking

```

### 4. 容器关闭 – docker stop

- **作用**：关闭一个或多个处于暂停状态或者运行状态的容器
- **命令格式**：docker stop [OPTIONS] CONTAINER [CONTAINER...]

- **命令参数（OPTIONS）**：

  - -t, --time int                                      关闭前，等待的时间，单位秒(默认 10s)	

    

  

```bash
 # 现在后台运行 b-express-mysql-1容器  端口3306  
  IMAGE         COMMAND                  STATUS             PORTS                               NAMES
mysql:8.3.0  "docker-entrypoint.s…"   Up 21 seconds  0.0.0.0:3306->3306/tcp, 33060/tcp   b-express-mysql-1

# 关闭 b-express-mysql-1
docker stop  b-express-mysql-1
```

### 5. 容器终止 – docker kill

- **作用**：强制并立即关闭一个或多个处于暂停状态或者运行状态的容器
- **命令格式**：docker kill [OPTIONS] CONTAINER [CONTAINER...]

- **命令参数（OPTIONS）**：
  - -s, --signal string                   指定发送给容器的关闭信号 (默认“KILL”信号)

```bash
# 常用场景：当容器无法响应 SIGTERM，或者在某些情况下需要立即停止容器时使用
docker kill <container_name_or_id>
```

| 特性     | `docker stop`                                     | `docker kill`                               |
| -------- | ------------------------------------------------- | ------------------------------------------- |
| 停止方式 | 向容器发送 `SIGTERM` 信号，允许容器优雅停止       | 向容器发送 `SIGKILL` 信号，立即强制停止容器 |
| 容器响应 | 容器可以捕获并处理 `SIGTERM` 信号，有时间进行清理 | 容器无法捕获 `SIGKILL` 信号，立即终止容器   |
| 使用场景 | 优雅关闭容器，常用于生产环境                      | 强制停止容器，常用于容器无法正常停止时      |
| 默认超时 | 默认 10 秒（可以通过 `-t` 参数调整）              | 无超时，立即强制停止容器                    |

### 6.  容器暂停 – docker pause

- **作用**：暂停一个或多个处于运行状态的容器
- **命令格式**：docker pause CONTAINER [CONTAINER...]

```bash
# 运行容器 b-express-mysql-1
docker start b-express-mysql-1
# 查看运行容器 
docker  ps
# 状态运行
 IMAGE         COMMAND                        STATUS                      NAMES
 mysql:8.3.0   "docker-entrypoint.s…"      Up 10 seconds        b-express-mysql-1
# 容器暂停 
docker pause b-express-mysql-1
# 状态暂停
docker  ps
   IMAGE         COMMAND                      STATUS                    NAMES
 mysql:8.3.0   "docker-entrypoint.s…"     Up 36 seconds (Paused)    b-express-mysql-1
```

### 7.  容器取消暂停 – docker unpause

- **作用**：取消一个或多个处于暂停状态的容器，恢复运行
- **命令格式**：docker unpause CONTAINER [CONTAINER...]

```bash

# 取消暂停
docker unpause  <container_name_or_id>
```



### 8 . 容器删除 – docker container rm

- **作用**：删除一个或多个容器
- **命令格式**：docker container rm [OPTIONS] CONTAINER [CONTAINER...]

- **命令参数（OPTIONS）**：

  - -f, --force                  强行删除容器(会使用 SIGKILL信号) 
  - -v, --volumes          同时删除绑定在容器上的数据卷

  ```bash
  # 删除
  docker rm <container_name_or_id>
  #强制删除 
  docker rm -f <container_name_or_id>

### 9 .容器重启 – docker restart

- **作用**：重启一个或多个处于运行状态、暂停状态、关闭状态或者新建状态的容器	该命令相当于stop和start命令的结合
- **命令格式**：docker restart [OPTIONS] CONTAINER [CONTAINER...]

- **命令参数（OPTIONS）**：

  - -t, --time int                    重启前，等待的时间，单位秒(默认 10s

  ```bash
  #基本语法
  docker restart <container_name_or_id>
  ```

  

###  10 .容器日志信息 – docker logs

- **作用**：查看容器的日志信息
- **命令格式**：docker logs [OPTIONS] CONTAINER

- **命令参数（OPTIONS）**：
  -  --details              显示日志的额外信息
  - -f, --follow          动态跟踪显示日志信息
  -  --since string    只显示某事时间节点之后的
  - -t, --timestamps 显示timestamps时间
  - --until string     只显示某事时间节点之前的
- 注意： 容器日志中记录的是容器主进程的输出STDOUT\STDERR

 

### 11.  容器连接 – docker attach

- **作用**：将当前终端的STDIN、STDOUT、STDERR绑定到正在运行的容器的主进程上实现连接
- **命令格式**：docker attach [OPTIONS] CONTAINER

- **命令参数（OPTIONS）**：
  - --no-stdin             	不绑定STDIN

```bash
# 基本语法
docker attach <container_name_or_id>
# 1. 连接到标准输入输出：连接后，你会看到容器内正在运行的应用程序的输出，并且你可以通过输入来与容器进行交互（如果容器内有交互式命令）
# 2. 退出连接：如果你希望退出容器的连接，你可以按 Ctrl + C 或 Ctrl + P 然后 Ctrl + Q，以便返回到主机终端，但不会停止容器
```

### 13. 容器中执行新命令 – docker exec

- **作用**：在容器中运行一个命令
- **命令格式**：docker exec [OPTIONS] CONTAINER COMMAND [ARG...]

- **命令参数（OPTIONS）**：
  - -d, --detach             	后台运行命令
  - -i, --interactive               即使没连接容器，也将当前的STDIN绑定上
  - -t, --tty                             即使没连接容器，也将当前的STDIN绑定上
  - -w, --workdir string        指定在容器中的工作目录
  - -e, --env list                   设置容器中运行时的环境变量
