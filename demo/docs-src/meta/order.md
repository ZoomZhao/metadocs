顺序 (order)
========
当前页面包含的所有 Section 的排列顺序。
`order` 取值为目录下 Markdown 文件名（可以不包含文件后缀）的列表。
传入模版的页面对象中的 `sections` 属性如下：
```
{
    ...,
    sections: [{
        id: '',              // 文件名去除后缀的部分
        fileName: '',        // 文件名
        name: '',            // section 名称
        data: ''             // section 内容转化为 HTML 的结果
    }],
    ...
}
```
其中 Section 获取时根据 [Markdown Headings](http://en.wikipedia.org/wiki/Markdown#Headings) 获取文件中第一个一级标题内容作为 Section 名称，剩余内容作为 Section 内容。
在默认模版中，`sections` 中文件的内容会在页面中 `descriptions` 内容之后按顺序显示。