# Docker 学习

## 1. Docker 是什么

- Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。
- Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样

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



### **Docker 架构图**

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

### **核心组件详解**

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



## Docker内部组件

- `namespaces` 命名空间，Linux内核提供的一种对进程资源隔离的机制，例如进程、网络、挂载等资源
- `cgroups` 控制组,linux内核提供的一种限制进程资源的机制，例如cpu 内存等资源
- `unonFS` 联合文件系统，支持将不同位置的目录挂载到同一虚拟文件系统，形成一种分层的模型

## docker安装

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
