## 前言

![banner](https://github.com/oeyoews/reading-books-with-tiddlywiki/raw/main/banner.png)

> 借助 tiddlywiki, 将其作为一个阅读区的载体, 你的下一个阅读器有何尝不可以是太微?

## 可以用来做什么？

- 为你的笔记快速制作一个具有导航的小册子
- 为你的插件生成一个网站式的文档
- 阅读你喜欢的籍
- ...

> 所有的内容最终都以单文件 json 的格式(太微插件的形式）存储， 便于分发(tiddlywiki)

## 本地预览书籍

```bash
git clone --depth 1 https://github.com/oeyoews/reading-books-with-tiddlywiki.git
pnpm build:ibooks
pnpm start
```

## 如何自己制作书籍

1. 下载书籍 epub 文件

- https://zh.annas-archive.org/
- ...

## 使用 calibre 转换成 markdown

https://www.bilibili.com/read/cv13435884/

<!-- * ~~convert epub to single markdown: https://www.vertopal.com/en/convert/epub-to-markdown~~ -->

## 检查 markdown 文件

- 比如章节重复，丢失.
- 删除冗余信息, 空白行, 广告

>  vscode 正则替换是个好东西， 一个正则解决不了的事情， 就多写几个正则

在 VS Code 中，你可以使用正则表达式和替换功能来匹配并将多行空行转换为单行。下面是一个简单的步骤：

1. 打开要进行替换操作的文件。
2. 使用快捷键 `Ctrl + H`（Windows/Linux）或 `Command + H`（Mac）打开替换窗口。
3. 在替换窗口中，点击右侧的正则表达式按钮（`.*`）以启用正则表达式模式。
4. 在 "查找" 输入框中输入 `\n\s*\n` 或者`\n\s{2,}\n`，表示匹配连续的多个空行。
   - `\n` 表示匹配换行符。
   - `\s*` 表示匹配零个或多个空格字符。
5. 在 "替换为" 输入框中输入 `\n\n`，表示将匹配到的多行空行替换为单个换行符。
6. 点击 "全部替换"（Replace All）按钮，或使用快捷键 `Alt + Enter`（Windows/Linux）或 `Option + Enter`（Mac）执行替换操作。

这样，所有的多行空行都会被替换为单行，并且文件中的空行数量得到了减少。

## 文件位置

- md 放在 markdown 目录下面
- 图片在 images 目录下面

## 更新对应的文件夹

- src/books.js
- image 文件夹(文件名均以书籍命名)

## 提交更新仓库， 等待自动打包书籍插件

> 只需要上传通过 calibre 转换后的 markdown 文件，github action 即可自动制作对应的书籍插件, 支持 wikitext(这很 tiddlywiki). 所有的流程完全自动化.

<!-- ## NOTE
> 绝对不保证 100%转换， 可能会丢失部分信息 -->

## 仓库已有的书籍/小册子

- 平凡的世界
- 明朝那些事儿
- 劫持
- 球状闪电
- 肖申克的救赎
- 提问的智慧
  > 列表不再更新， 最新书籍列表请查看 https://oeyoews.github.io/reading-books-with-tiddlywiki/#books

## 想要添加更多书籍 ?

https://github.com/oeyoews/reading-books-with-tiddlywiki/issues

## Creadits

本仓库所用素材均来源于互联网，仅作个人排版参考学习之用，请勿用于商业用途。如果喜欢本仓库的书籍，请购买正版。任何对书籍的修改、加工、传播，请自负法律后果。
