// node中可以开启子进程  目的为了充分利用多核cpu
// 开启子进程 可以帮助我们计算一些cpu密集型任务

// spawn  fork exec  execFile
const { spawn } = require("child_process");
const path = require("path");
/**
 * child_process.spawn(command[, args][, options])
 * spawn  开启子进程
 * 参数
 * command： 将要运行的命令例如 'ls'、'git' 等。
 * args： Array 字符串参数数组,
 * options ： 配置项
 */
const child = spawn("ls", ["-al"], {
  cwd: path.resolve(__dirname, "wocker"),
  // shell: true, // 启用 shell 执行
});

// 监听子进程的输出
child.stdout.on("data", (data) => {
  console.log(data.toString());
});

// 监听子进程的错误输出
child.stderr.on("data", (error) => {
  console.log(error.toString());
});
child.on("error", (err) => {
  console.log(err, "子的错误");
});
child.on("exit", (code) => {
  console.log(code, "子进程退出");
});
// console.log(process, "process");
