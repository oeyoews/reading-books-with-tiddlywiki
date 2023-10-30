import fs from 'fs';
import path from 'path';
import { getFolderSize } from '@/lib/getFolderSize';
import chalk from 'chalk';
import getfilename from './getfilename';
import { IPluginInfo } from 'tiddlywiki';

/**
 * Generates book information and creates the necessary files and directories.
 *
 * @param {Array} toc - The table of contents of the book.
 * @param {Object} bookinfo - The information about the book.
 * @return {void} This function does not return a value.
 */
export const generateBookInfo = (toc: TOC[], bookinfo, padLength) => {
  const zeroString = '0'.repeat(padLength);
  const defaultcover = `//github.com/oeyoews/reading-books-with-tiddlywiki/blob/main/image/${bookinfo.bookname}-banner.png?raw=true`;
  const {
    bookname,
    author,
    description,
    cover = defaultcover,
    version = new Date().toLocaleDateString(),
  }: BookInfo = bookinfo;
  const {
    pluginfilename,
    readmefilename,
    statusfilename,
    tocfilename,
    homepagefilename,
  } = getfilename(bookname);
  const outputDir = 'plugins';
  const plugindir = path.join(outputDir, bookname);
  const pluginfiledir = path.join(plugindir, 'files');
  const booksourcefile = path.join('markdown', `${bookname}.md`);
  const sourceSize = getFolderSize(booksourcefile);
  console.log(
    chalk.bgCyan.bold(`${bookname} 源文件大小为 ${sourceSize.kb} kb`),
  );

  const tocText = toc
    .map(({ currentLink, vanillatitle, chapter }) =>
      chapter
        ? `\n!! ${vanillatitle}\n`
        : `# [[${vanillatitle}|${currentLink}]]`,
    )
    .join('\n');

  const tocContent = `title: ${tocfilename}
caption: ${tocfilename}\n\n${tocText}`;

  const homepagecontent = `title: ${zeroString} ${homepagefilename}
caption: ${homepagefilename}
tags: ${bookname}\n\n<<tabs "${tocfilename} ${statusfilename}" "${tocfilename}">>`;

  const { kb } = getFolderSize(path.join(outputDir, bookname));
  // 生成 TiddlyWiki 文件和目录结构
  const tiddlywikifiles = {
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
          bookname,
        },
      },
    ],
  };

  const statuscontent = `title: ${statusfilename}
caption: ${bookname}阅读记录\n\n<% if [[$:/plugins/oeyoews/book-status]has[plugin-type]] %>
  <$tocstatus bookname=${bookname}/>
<% else %>
@@color:red;font-weight:bold;Please Install [[bookstatus|https://oeyoews.github.io/tiddlywiki-starter-kit//#%24%3A%2Fplugins%2Foeyoews%2Fbook-status]] plugin@@
<% endif %>`;

  const readmecontent = `title: ${readmefilename}\n\n<img src='${cover}' alt='' class="spotlight ${bookname}" width=128/>

> ''书籍'': ${bookname || '未知'}\n
> ''作者'': ${author || '未知'}\n
> ''大小'': ${kb} kb\n
> ''构建时间'': {{!!updatetime}} \n
> ''简要描述'': ${description || '未知'}
>  Maked By [[reading books with tiddlywiki|https://github.com/oeyoews/reading-books-with-tiddlywiki]]

> <button>[[开始阅读 |${zeroString} ${homepagefilename}]]</button>`;

  const plugininfo: Partial<IPluginInfo> = {
    updatetime: new Date().toLocaleString(),
    size: kb,
    title: pluginfilename,
    author: 'oeyoews',
    'book#author': author,
    description: bookname,
    cover,
    caption: bookname,
    book: bookname,
    'plugin-type': 'plugin',
    version,
    list: `readme status`,
  };

  fs.writeFileSync(path.join(outputDir, bookname, 'readme.tid'), readmecontent);
  fs.writeFileSync(path.join(outputDir, bookname, 'status.tid'), statuscontent);
  fs.writeFileSync(path.join(outputDir, bookname, 'toc.tid'), tocContent);
  fs.writeFileSync(
    path.join(outputDir, bookname, `${homepagefilename}.tid`),
    homepagecontent,
  );
  fs.writeFileSync(
    path.join(outputDir, bookname, 'plugin.info'),
    JSON.stringify(plugininfo, null, 2),
  );

  fs.writeFileSync(
    `${pluginfiledir}/tiddlywiki.files`,
    JSON.stringify(tiddlywikifiles, null, 2),
  );
  console.log(chalk.green.bold(`${bookname} 书籍制作完成. ${kb} kb\n`));
};
