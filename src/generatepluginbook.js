const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const MarkdownIt = require("markdown-it");
const prompt = require("prompt");
const { rimraf } = require("rimraf");

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

module.exports = (bookinfo) => {
  // TODO: 默认将图片打包到插件
  // NOTE: github 禁止跨域， 需要移除https, 动态检测
  const defaultcover = `//github.com/oeyoews/reading-books-with-tiddlywiki/blob/main/image/${bookinfo.bookname}.png?raw=true`;
  const { bookname, author, description, cover = defaultcover } = bookinfo;
  const outputDir = "plugins";
  const bookOutputDir = path.join(outputDir, bookname, "files");

  rimraf.moveRemoveSync(path.join(outputDir, bookname));
  fs.mkdirSync(bookOutputDir, { recursive: true });

  const markdown = fs.readFileSync(
    path.join("markdown", `${bookname}.md`),
    "utf-8"
  );

  // use markdown-it convert markdown to html, use cheerio to parse
  const $ = cheerio.load(md.render(markdown), {
    xmlMode: true,
    decodeEntities: false,
  });

  const toc = [];

  function processHeading(heading) {
    const realtitle = $(heading).text(); // 获取标题文本
    const paragraphs = []; // 存储段落内容的数组
    const title = $(heading)
      .text()
      .replace(/[\/\s]/g, "-");
    if (!title) {
      console.log("标题为空");
      return;
    }

    const chapterNumber = toc.length + 1;
    const currentLink = `${chapterNumber}-${title}@${bookname}`;

    $(heading)
      .nextUntil("h1, h2, h3, h4")
      .each((_, element) => {
        const paragraph = $(element).text(); // 获取每个元素的 HTML 内容
        paragraphs.push(`&emsp;&emsp;${paragraph}`); // 将 HTML 内容添加到数组中
      });

    // 空的标题跳过, 会遇到大标题的情况， 暂时不处理
    if (!paragraphs.length) {
      console.log(`${title} 段落为空 @${bookname}`);
      return;
    }

    toc.push({ currentLink, realtitle });

    // 处理上一章节link
    const prevChapterLink =
      toc.length > 1
        ? `@@display: flex;justify-content: space-between;\n[[« ${
            toc[toc.length - 2].realtitle
          }|${toc[toc.length - 2].currentLink}]]`
        : "@@display: flex;justify-content: flex-end;\n";

    const content = `!! ${realtitle}\n\n${paragraphs.join(
      "\n\n"
    )}\n\n${prevChapterLink}`;

    try {
      fs.writeFileSync(path.join(bookOutputDir, `${currentLink}.tid`), content);
    } catch (error) {
      console.error(`Failed to save file: ${error.message}`);
      return;
    }
  }

  // 遍历所有标题
  const headings = $("h1, h2, h3, h4");

  headings.each((index, heading) => {
    processHeading(heading, index);
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

  const readmecontent = `title: ${bookname}/readme

<img src='${cover}' alt='${bookname}' class="spotlight ${bookname}"/>

> ''bookname'': ${bookname || "未知"}\n
> ''bookauthor'': ${author || "未知"}\n
> ''description'': ${description || "未知"}

> [[开始阅读 ${bookname}|${bookname}目录]]
`;

  const plugininfo = {
    title: bookname,
    author: "oeyoews",
    // description,
    cover,
    book: bookname,
    type: "plugin",
    version: "0.0.1",
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
  console.log(bookname, "书籍插件制作完成");
};