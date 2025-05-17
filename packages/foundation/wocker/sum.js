let total = 0;
// 单独交给一个进程出来 node中不能开启线程，所以只能开启一个进程计算
for (let i = 0; i < 100000 * 10000 * 1000; i++) {
  total += i;
}
console.log(total);
