// global 就是后端的全局对象，类似与前端的 window

// setTimeout、setInterval、setImmediate：node 中提供的定时器函数

// Buffer：帮我们实现的二进制数据处理（如网络传输、文件读写等）

// process：进程对象，node 运行在进程中
// platform：当前操作系统平台（如 'darwin' 表示 macOS，'win32' 表示 Windows）
// cwd / chdir：当前工作目录（current working directory）和切换目录
// env：环境变量
// argv：命令行参数
// nextTick：事件循环中的下一个 tick，用于异步执行

const path = require('path');

process.chdir('../../'); // 此方法用的不多，用于切换当前工作目录
console.log(process.cwd(), path.resolve()); // 这个路径和 path.resolve 一致，这个路径是可以修改的

// 脚手架可能有一些配置文件
// mac: /users/用户名
// window: c:/users/xxx
console.log(process.platform);

// WINDOWS 下使用 Set 来设置环境变量（临时设置）
// mac 需要使用 export 来设置环境变量
// 电脑中的环境变量在 Windows 系统 → 高级选项 → 环境变量

console.log(process.env); // 根据 env 来区分你是什么环境

console.log(process.argv); // 用于接收用户运行时传递的参数
// 默认第一个参数是 node 的可执行文件
// 第二个参数是当前执行的文件
// 其余的就是我们运行传递的参数，除了前两个就是用户传递的参数
// 使用 node 一般会使用大量的第三方模块：process.env -> cross-env、process.argv -> yargs/commander/...

// nextTick 微任务 setImmediate node 中的宏任务（和浏览器的执行顺序现在基本一致了（10版本之前有区别）为了统一，代码执行现在一致的）
// node 中底层是基于多线程来实现 → 也需要对这些任务进行轮训处理（事件触发线程 event loop）

/*
Promise.resolve().then(() => {
  console.log('promise')
})

process.nextTick(() => {
  console.log('nextTick')
})
*/

// 微任务在每个阶段切换的时候执行？10版本以前是的，10版本之后变成了每个宏任务执行后都会清空（运行的流程和浏览器是一样的）

// setTimeout 和 setImmediate 在主线程中执行时顺序是不一定

require("fs").readFile("./note.md", function () { // poll
    setTimeout(() => {
      console.log("setTimeout");
    });
  
    setImmediate(() => {
      console.log("setImmediate");
    });
  });