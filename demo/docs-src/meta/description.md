描述 (description)
========
用于描述此页面的内容，取值为目录下 Markdown 文件名（可以不包含文件后缀）的列表。
传入模版的页面对象中的 `description` 属性如下：
```
{
    ...,
    description: [{
        file: '',    // 文件绝对地址
        data: ''     // 文件内容转换为 HTML 之后的内容
    }],
    ...
}
```
在默认模版中，`description` 中文件的内容会在页面的最上方显示。