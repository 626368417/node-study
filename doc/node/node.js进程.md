# node 中进程和线程

## 1.什么是进程，什么是线程

**定义**

- 进程（Process）是计算机中的程序关于某数据集合的一次运动活动，是系统进行资源分配和调度基本单位。
- 线程（Thread）是操作系统能够进行运算调度的最小单位，它被包含进程之中，是进程中的实际单位

**node特点主线程是单线程**

一个进程只开一个主线程，基于事件驱动，异步非阻塞，可以应用于高并发场景。Nodejs中没有线程，为了充分利用多核，可以使用子进程实现内核的负载均衡。

**需要解决问题**

- `Node.js`做耗时计算阻塞问题
- `Node.js`如何开启多进程
- 开发过程如何实现进程守护

```js
// 循环累加total变量，会耗时计算阻塞问题。
const http = require("http");
const app = http.createServer((req, res) => {
  if (req.url === "/sum") {
    let total = 0;
      // 单独交给一个进程出来 node中不能开启线程，所以只能开启一个进程计算
    for (let i = 0; i < 100000 * 10000 * 1000; i++) {
      total += i;
    }
    res.end(JSON.stringify({ total }));
  } else {
    res.end("Hello World");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

```

## 2. 子进程

- 在Node.js中，只有一个线程执行所有操作，如果某个操作需要大量消耗CPU资源的情况下，后续操作都需要等待。

### 2.1 spawn

```sql
child_process.spawn(command,[args],[options]);
```

- command 必须指定的参数，指定需要执行的命令
- args 数组，存放了所有运行该命令需要的参数
- options 参数为一个对象，用于指定开启子进程时使用的选项
  - cwd 子进程的工作目录
  - env 环境变量
  - detached 如果为true,该子进程魏一个进程组中的领头进程，当父进程不存在时也可以独立存在
  - stdio 三个元素的数组，设置标准输入/输出
    - pipe 在父进程和子进程之间创建一个管道，父进程可以通过子进程的stdio[0]访问子进程的标准输入，通过stdio[1]访问标准输出,stdio[2]访问错误输出
    - ipc 在父进程和子进程之间创建一个专用与传递消息的IPC通道。可以调用子进程的send方法向子进程发消息，子进程会触发`message`事件
    - ignore 指定不为子进程设置文件描述符。这样子进程的标准输入、标准输出和错误输出被忽略
    - stream 子进程和父进程共享一个终端设备、文件、端口或管道
    - 正整数值 和共享一个steam是一样的
    - null或undefined 在子进程中创建与父进程相连的管道

默认情况下，子进程的stdin,stdout,stderr导向了ChildProcess这个对象的child.stdin,child.stdout,child.stderr流,

```sql
let spawn = require('child_process').spawn;
sapwn('prg',[],{stdio:['pipe','pipe',process.stderr]});
```

- ignore ['ignore','ignore','ignore'] 全部忽略
- pipe ['pipe','pipe','pipe'] 通过管道连接
- inherit [process.stdin,process.stdout,process.stderr]或[0,1,2] 和父进程共享输入输出

```sql
let spawn = require('child_process').spawn;
spawn('prg',[],{stdio:'inherit'});
```

- spawn方法返回一个隐式创建的代表子进程的ChildProcess对象
- 子进程对象同样拥有stdin属性值为一个可用于读入子进程的标准输入流对象
- 子进程对象同样拥有stdiout属性值和stderr属性值可分别用于写入子进程的标准输出流与标准错误输出流
