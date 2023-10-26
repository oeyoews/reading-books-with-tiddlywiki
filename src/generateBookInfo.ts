import fs from 'fs';
import path from 'path';
import { getFolderSize } from '@/getFolderSize';
import chalk from 'chalk';

export function generateBookInfo(toc, bookinfo) {
  const defaultcover = `//github.com/oeyoews/reading-books-with-tiddlywiki/blob/main/image/${bookinfo.bookname}.png?raw=true`;
  const {
    bookname,
    author,
    description,
    cover = defaultcover,
    version = new Date().toLocaleDateString(),
  }: BookInfo = bookinfo;
  const pluginPrefix = '$:/plugins/books';
  const outputDir = 'plugins';
  const plugindir = path.join(outputDir, bookname);
  const pluginfiledir = path.join(plugindir, 'files');

  const tocContent = toc
    .map(
      ({ currentLink, vanillatitle }) => `# [[${vanillatitle}|${currentLink}]]`,
    )
    .join('\n');

  fs.writeFileSync(path.join(pluginfiledir, `${bookname}目录.tid`), tocContent);

  const { kb, mb } = getFolderSize(path.join(outputDir, bookname));
  // 生成 TiddlyWiki 文件和目录结构
  const tiddlywikifiles = {
    tiddlers: [
      {
        file: `${bookname}目录.tid`,
        fields: {
          title: {
            source: 'basename',
          },
          // type: "text/vnd.tiddlywiki",
          tags: ['toc', bookname],
          caption: bookname,
        },
      },
    ],
    directories: [
      {
        path: '.',
        filesRegExp: '^.*\\.tid$',
        isTiddlerFile: false,
        fields: {
          title: {
            source: 'basename',
          },
          // type: "text/vnd.tiddlywiki",
          tags: `${bookname}`,
        },
      },
    ],
  };

  const readmecontent = `title: ${pluginPrefix}/${bookname}/readme

<img src='${cover}' alt='' class="spotlight ${bookname}" width=128/>

> ''书籍'': ${bookname || '未知'}\n
> ''作者'': ${author || '未知'}\n
> ''大小'': ${kb} kb\n
> ''构建时间'': {{!!updatetime}} \n
> ''简要描述'': ${description || '未知'}
>  Maked By [[reading books with tiddlywiki|https://github.com/oeyoews/reading-books-with-tiddlywiki]]

> <button>[[开始阅读 |${bookname}目录]]</button>

`;

  const plugininfo = {
    updatetime: new Date().toLocaleString(),
    size: kb,
    title: `${pluginPrefix}/${bookname}`,
    author: 'oeyoews',
    'book#author': author,
    description: bookname,
    cover,
    caption: bookname,
    book: bookname,
    type: 'plugin',
    version,
    list: `readme`,
  };

  fs.writeFileSync(path.join(outputDir, bookname, 'readme.tid'), readmecontent);
  fs.writeFileSync(
    path.join(outputDir, bookname, 'plugin.info'),
    JSON.stringify(plugininfo, null, 2),
  );

  fs.writeFileSync(
    `${pluginfiledir}/tiddlywiki.files`,
    JSON.stringify(tiddlywikifiles, null, 2),
  );
  console.log(chalk.green.bold(`《《${bookname}》》 书籍制作完成. ${mb} Mb`));
}
