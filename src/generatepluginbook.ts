import fs from "fs";
import cheerio, { Element } from "cheerio";
import path from "path";
import MarkdownIt from "markdown-it";
import { rimraf } from "rimraf";
import chalk from "chalk";
import { getFolderSize } from "@/getFolderSize";

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

export const generateBookInfo = (bookinfo: {
  bookname: string;
  author?: string;
  description?: string;
  disable?: undefined;
  cover?: undefined;
  version?: undefined;
}) => {
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
  } = bookinfo;
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

  // use markdown-it convert markdown to html, use cheerio to parse
  const md2html = md.render(markdown);

  if (!fs.existsSync("test")) fs.mkdirSync("test");
  fs.writeFileSync(path.join("test", `${bookname}.html`), md2html);
  const $ = cheerio.load(md.render(md2html), {
    xmlMode: true,
    decodeEntities: false,
  });

  const toc: any[] = [];

  function processHeading(heading: Element) {
    const headingContent = $(heading);
    const realtitle = headingContent.text();
    const title = realtitle
      .replace(/\s+/g, "")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]+/g, "-")
      .replace(/-+$/, "");
    // const title = realtitle.replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]+/g, "-");

    if (!title) {
      // console.log("标题为空");
      return;
    }

    const chapterNumber = toc.length + 1;
    let currentLink = `${chapterNumber}-${title}`;
    if (currentLink.length < 6) {
      currentLink += `@${bookname}`;
    }

    let headingAllContent = headingContent.nextUntil("h1, h2, h3, h4");

    if (!headingAllContent.length) {
      // @ts-ignore
      headingAllContent = `!! 章节： ${realtitle}`;
    }

    toc.push({ currentLink, realtitle });

    // 处理上一章节link
    const prevChapterLink =
      toc.length > 1
        ? `@@display: flex;justify-content: space-between;\n[[« ${
            toc[toc.length - 2].realtitle
          }|${toc[toc.length - 2].currentLink}]]`
        : "@@display: flex;justify-content: flex-end;\n";

    const content = `${headingAllContent}\n\n${prevChapterLink}`;

    try {
      fs.writeFileSync(path.join(bookOutputDir, `${currentLink}.tid`), content);
    } catch (error) {
      // @ts-ignore
      console.error(`Failed to save file: ${error.message}`);
      return;
    }
  }

  // 遍历所有标题
  const headings = $("h1, h2, h3, h4");
  const headingMinLength = 5;
  if (headings.length < headingMinLength) {
    console.log(
      chalk.red.bold(
        `${bookname} 的标题总个数为 ${headings.length}, 请确认是否正确`
      )
    );
  } else {
    console.log(
      chalk.cyan.underline(`${bookname} 检测到 ${headings.length} 个标题`)
    );
  }

  headings.each((_, heading) => {
    processHeading(heading);
  });

  toc.forEach((currentChapter, i) => {
    const nextChapter = toc[i + 1];

    const nextLink = nextChapter
      ? `[[${nextChapter.realtitle} »|${nextChapter.currentLink}]] \n@@`
      : `\n@@`;

    const currentChapterFile = fs.readFileSync(
      path.join(bookOutputDir, `${currentChapter.currentLink}.tid`),
      "utf-8"
    );

    const updatedChapterFile = `${currentChapterFile}\t${nextLink}`;

    fs.writeFileSync(
      path.join(bookOutputDir, `${currentChapter.currentLink}.tid`),
      updatedChapterFile
    );
  });

  // 生成目录文件
  const tocContent = toc
    .map(({ currentLink, realtitle }) => `# [[${realtitle}|${currentLink}]]`)
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
};