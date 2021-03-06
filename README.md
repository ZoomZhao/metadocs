Metadocs
========
--------

Metadocs 是一个基于 [Nodejs](http://nodejs.org/) 根据目录下的 `meta.json` 文件以及 Markdown 文件生成文档的工具。
通过 Metadocs 可以通过编写 Markdown 文件轻松的生成项目文档。
Metadocs 的 Markdown 文件解析基于 [github-flavored-markdown](https://github.com/github/github-flavored-markdown) 进行了部分改造，增加了 [Table](http://michelf.ca/projects/php-markdown/extra/#table) 功能来满足生成表格的需求。

使用
--------
使用 Metadocs 需要安装 Nodejs 环境，安装完成后通过以下步骤生成文档：
1. 通过 `npm install metadocs` 安装 `Metadocs`
2. 在自己的代码中通过以下方式调用 `Metadocs` ：

```
var Metadocs = require('metadocs');

new Metadocs({
    src: './src/docs',    // 用来生成文档的根目录, 默认值为 `../src/docs`
    dest: './docs',       // 生成文档到的位置，默认值为 `../docs`
    theme: 'bootstrap'    // 主题，暂时只有 `bootstrap`，默认为 `bootstrap`
}).gen();
```
