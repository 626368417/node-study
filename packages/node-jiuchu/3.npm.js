// 文件模块
// 1) 模块加载的顺序：
//    - 加载相对路径时，会根据文件名匹配后缀：.js、.json
//    - 如果文件名和文件夹同名，则优先查找文件夹
// 2) 文件名和文件夹同名了

const path = require('path');

const file = require('./file');

// 在高版本中会优先查找文件，在查找文件夹
// 在高版本中会先查找 package.json 对应的 "main" 字段，没有会查找文件夹中的 index.js
// 通过相对路径、绝对路径来引用的情况

// 内置模块优先查找

// 第三方模块（需要安装）
console.log(module.paths);

const jquery = require('jquery'); // 找到同名的文件夹，按照会先查找 package.json 对应的 "main" 字段，没有会查找文件夹中的 index.js
// 如果找到根目录下依然找不到则就真的没有这个模块（报错）

// 第三方模块的安装
// 全局模块：全局安装的模块只能在命令行中使用，npm install npm -g 只能在全局下用。我们也可以将全局模块安装到项目中
// webpack babel（为了保证所有人的版本一致）默认安装的时候会生成一个 package-lock.json 文件来存储版本信息，保证每次安装的版本都一致
// lock 文件可以锁定 npm install 的时候安装的是当前锁定的版本

// npm 中版本号分为三部分：major | minor | patch (semver) vue2.7.5
// ^2：锁定大版本，只要是2就可以，不能比当前的低
// ～0.2.0：限制的是第二位，保证版本 0.2.+ 且 >= 当前版本
// （例如：～0.2.0 允许 0.2.1、0.2.2，但不允许 0.3.0）

// 项目模块 在项目中使用到了
// 一种是将这个模块在代码里用了 require('mime')
// 还有一种行为是将此模块 全局模块用在项目中 --save-dev -D (只在开发的时候使用)
// 安装的全局包 都放在 node_modules 下并且会产生一个 .bin 目录

// 想运行项目下的 bin 中的命令 npx 命令的名字 npm run 的方式运行命令（会在运行前将 .bin 目录放到我们的环境变量中）

// 全局模块安装到项目下 也可以像项目依赖来使用 写一个全局包 1) 在 package.json 中添加 bin 2) #!/usr/bin/env node

const mime = require('mime');
console.log(mime);