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
