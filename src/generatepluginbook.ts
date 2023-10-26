import fs from "fs";
import cheerio, { CheerioAPI, Element, Cheerio } from "cheerio";
import path from "path";
import MarkdownIt from "markdown-it";
import { rimraf } from "rimraf";
import chalk from "chalk";
import { getFolderSize } from "@/getFolderSize";
import { getTitle } from "@/getTitle";
import { generateTOC } from "@/generateTOC";

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

export const generateBookInfo = (bookinfo: BookInfo) => {
  // TODO: 默认将图片打包到插件
  // NOTE: github 禁止跨域， 需要移除https, 动态检测
  const pluginPrefix = "$:/plugins/books";
  const defaultcover = `//github.com/oeyoews/reading-books-with-tiddlywiki/blob/main/image/${bookinfo.bookname}.png?raw=true`;
  const {
    bookname,
    author,
    description,
    cover = defaultcover,
    version = "0.0.1",
    disable = false,
  }: BookInfo = bookinfo;
  if (disable) {
    console.log(chalk.red.bold(`《《${bookname}》》 在黑名单中， 跳过制作`));
    return;
  }
  const outputDir = "plugins";
  const bookOutputDir = path.join(outputDir, bookname, "files");

  rimraf.moveRemoveSync(path.join(outputDir, bookname));
  fs.mkdirSync(bookOutputDir, { recursive: true });

  const markdown = fs.readFileSync(
    path.join("markdown", `${bookname}.md`),
    "utf-8"
  );

  const md2html = md.render(markdown);
  // TODO: deprecated cheerio
  const $: CheerioAPI = cheerio.load(md.render(md2html), {
    xmlMode: true,
    decodeEntities: false,
  });

  // 遍历所有标题, h1-h4
  const toc: TOC[] = [];
  const headingarrange = "h1, h2, h3, h4";
  const headings = $(headingarrange);
  const headingMinLength = 5;
  const totalchapters = headings.length;
  const padLength = totalchapters.toString().length;

  if (headings.length < headingMinLength) {
    console.log(
      chalk.red.bold(
        `${bookname} 的标题总个数为 ${totalchapters}, 请确认是否正确`
      )
    );
  } else {
    console.log(
      chalk.cyan.underline(`${bookname} 检测到 ${headings.length} 个标题`)
    );
  }

  headings.each((_, heading) => {
    generateTOC($, toc, heading, bookname, padLength);
  });

  headings.each((index, heading) => {
    processHeading(heading, index, padLength);
  });

  function processHeading(heading: Element, index: number, padLength = 3) {
    const headingContent = $(heading);
    // /\s{2,}/g
    const vanillatitle = headingContent.text().replace("s+/g", " ");
    const title = getTitle(vanillatitle);
    if (!title) return;

    const currentLink = toc[index].currentLink;

    let headingAllContent = headingContent.nextUntil(headingarrange);

    if (!headingAllContent.length) {
      // @ts-ignore
      headingAllContent = `!! 章节： ${vanillatitle}`;
    }

    const prevChapterLinkNumber = toc[index - 1];
    const nextChapterLinkNumber = toc[index + 1];

    const prevChapterLink =
      index > 1
        ? `@@display: flex;justify-content: space-between;\n[[« ${prevChapterLinkNumber.vanillatitle}|${prevChapterLinkNumber.currentLink}]]`
        : "@@display: flex;justify-content: flex-end;\n";
    const nextChapterLink =
      index < toc.length - 1
        ? `[[${nextChapterLinkNumber.vanillatitle} »|${nextChapterLinkNumber.currentLink}]] \n@@`
        : `\n@@`;

    const content = `${headingAllContent}\n\n${prevChapterLink}${nextChapterLink}`;

    try {
      const filename = path.join(bookOutputDir, `${currentLink}.tid`);
      fs.writeFileSync(filename, content);
    } catch (error) {
      console.error(`Failed to save file: ${error.message}`);
      return;
    }
  }

  // 生成目录文件
  const tocContent = toc
    .map(
      ({ currentLink, vanillatitle }) => `# [[${vanillatitle}|${currentLink}]]`
    )
    .join("\n");

  fs.writeFileSync(path.join(bookOutputDir, `${bookname}目录.tid`), tocContent);

  const { kb, mb } = getFolderSize(path.join(outputDir, bookname));
  // 生成 TiddlyWiki 文件和目录结构
  const tiddlywikifiles = {
    tiddlers: [
      {
        file: `${bookname}目录.tid`,
        fields: {
          title: {
            source: "basename",
          },
          // type: "text/vnd.tiddlywiki",
          tags: ["toc", bookname],
          caption: bookname,
        },
      },
    ],
    directories: [
      {
        path: ".",
        filesRegExp: "^.*\\.tid$",
        isTiddlerFile: false,
        fields: {
          title: {
            source: "basename",
          },
          // type: "text/vnd.tiddlywiki",
          tags: `${bookname}`,
        },
      },
    ],
  };

  const readmecontent = `title: ${pluginPrefix}/${bookname}/readme

<img src='${cover}' alt='' class="spotlight ${bookname}"/>

> ''书籍'': ${bookname || "未知"}\n
> ''作者'': ${author || "未知"}\n
> ''大小'': ${kb} kb\n
> ''构建时间'': {{!!updatetime}} \n
> ''简要描述'': ${description || "未知"}
>  Maked By [[reading books with tiddlywiki|https://github.com/oeyoews/reading-books-with-tiddlywiki]]

> <button>[[开始阅读 |${bookname}目录]]</button>

`;

  const plugininfo = {
    updatetime: new Date().toLocaleString(),
    size: kb,
    title: `${pluginPrefix}/${bookname}`,
    author: "oeyoews",
    "book#author": author,
    description: bookname,
    cover,
    caption: bookname,
    book: bookname,
    type: "plugin",
    version,
    list: `readme`,
  };

  fs.writeFileSync(path.join(outputDir, bookname, "readme.tid"), readmecontent);
  fs.writeFileSync(
    path.join(outputDir, bookname, "plugin.info"),
    JSON.stringify(plugininfo, null, 2)
  );

  fs.writeFileSync(
    `${bookOutputDir}/tiddlywiki.files`,
    JSON.stringify(tiddlywikifiles, null, 2)
  );
  console.log(chalk.green.bold(`《《${bookname}》》 书籍制作完成. ${mb} Mb`));

  if (!fs.existsSync("HTML")) fs.mkdirSync("HTML");
  fs.writeFileSync(path.join("HTML", `${bookname}.html`), md2html);
};
