[reading book with tiddlywiki demo](https://oeyoews.github.io/reading-books-with-tiddlywiki/)

> ...

>　支持wikitext(这很 tiddlywiki)

## books

- 平凡的世界
- 劫持
- 球状闪电
- 肖申克的救赎
- 提问的智慧

> 绝对不保证100%转换， 可能会丢失部分信息， 比如外链， 图片, 书籍的markdown文件在 markdown 这个目录下

## TODO

- [x] learn use calibre to make better epub with markdown-output calibre plugins
- [x] 改进脚本
- [x] 使用插件的形式分发书籍(不确定版权相关问题)
- [x] 分段
- [x] convert single markdown to multi markdownfiles [main](./src/main.js)
- [x] pin story river list
- [x] toc metadat to better support
- [x] 也支持wikitext, 为了符合中文阅读习惯, 段落开头空两格. ~~但是tw会自动trim, 需要特殊处理一下~~, markdown-it 本身就不支持
- [x] 空格文件保存失败
- [x] 使用prompt, chalk, ora
- [ ] 测试脚本的细微bug, 比如部分文本丢失， 如何处理链接
- [ ] add books plugin library, 也许使用modern.dev也可以
- [ ] 重新排列tag list, 也许是使用list: xxx(增加了插件大小)
- [ ] 书籍封面图片: 如何自动化这个过程
- [ ] 书籍metadata信息: 自动化
- [ ] plugin version automatic update

- ~~不同来源的 epub,的制作方法不同, 导致转换成的 markdown 格式也不同.~~

## Links

- download epub books: https://zh.annas-archive.org/
- ~~convert epub to single markdown: https://www.vertopal.com/en/convert/epub-to-markdown~~

<!-- ```bash
vertopal convert EPUB_INPUT_FILE --to markdown
``` -->

## Creadits

- 此仓库一切内容来源网络.
