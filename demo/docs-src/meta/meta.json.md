Meta 配置
========
--------

Meta 配置通过位于文档系统 src 下每个文件夹下名称为 `meta.json` 的文件实现，建议每个文件夹下都包含此配置。Meta 配置信息用来决定展现的文档内容以及展示顺序, `meta.json` 默认取值如下：
```
{
    "name": "",
    "description": [],
    "order": [],
    "assets": [],
    "childrenOrder": [],
    "showOnNav": true
}
```
Metadocs 在生成过程中会解析 `meta.json` 中的内容并根据 Markdown 文件传入 globe、root 以及 current 对象到模版中。