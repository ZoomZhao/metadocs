Site 配置
========
--------

Site 配置通过位于文档系统 src 根目录下名称为 `site.json` 的文件实现，这是个可选配置，用来定义生成的文档的网站信息, `site.json` 的所有配置项如下：
```
{
    "name": "",
    "author": "",
    "copyright":"",
    "keywords":"",
    "description":""
}
```
Metadocs 在生成过程中会解析 `site.json` 中的内容并传入 site 对象到模版中。


默认主题中的 Site
--------
在默认主题中：

- `name` 决定了页面的 title，如果 `name` 不为空，页面 Title 会取值为其对应的值加 `-` 加页面自身的名称；
- `author`、`copyright`、`keywords`、`description` 对应 HTML head 中 meta 信息的 name 以及 content；
- `copyright` 还会决定底部版权信息的显示。