const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const md = require("markdown-it")();
const prompt = require("prompt");
const { rimraf } = require("rimraf");

// TODO: prompt
// 读取 Markdown 文件
const outputDir = "plugins";
const bookname = "球状闪电";
const bookOutputDir = path.join(outputDir, bookname, "files");

rimraf.moveRemoveSync(path.join(outputDir, bookname));

const markdown = fs.readFileSync(
  path.join("markdown", `${bookname}.md`),
  "utf-8"
);

if (!fs.existsSync(bookOutputDir)) {
  fs.mkdirSync(bookOutputDir, { recursive: true });
}

// 使用 cheerio 解析 HTML
const $ = cheerio.load(md.render(markdown));

const toc = [];

function processHeading(heading, level, parentTitle) {
  const title = $(heading)
    .text()
    .replace(/[\/\s]/g, "-");

  const chapterNumber = toc.filter((item) => item.level === level).length + 1;
  const headingTitle = parentTitle ? `${parentTitle}-${title}` : title;

  // 找到该标题的起始和结束位置，在 Markdown 中截取出该部分内容
  const start = $(heading).next();
  const end = start.nextUntil(`h${level}, h${level + 1}`);

  // 将截取出来的内容写入一个新的 Markdown 文件
  const filename = `${bookname}-${chapterNumber}-${headingTitle}`;
  const link = `[${filename}](#${filename})`;
  toc.push({ level, title: link });
  const content = `## ${$(heading).text()}\n\n${$(heading)
    .nextUntil(`h${level}, h${level + 1}`)
    .text()}`;
  fs.writeFileSync(path.join(bookOutputDir, `${filename}.md`), content);

  // 处理下一级标题
  const nextLevel = level + 1;
  const nextHeadings = $(`h${nextLevel}`, start);
  nextHeadings.each((index, nextHeading) => {
    processHeading(nextHeading, nextLevel, headingTitle);
  });
}

// 遍历所有标题
const headings = $("h1, h2, h3");
headings.each((index, heading) => {
  processHeading(heading, 1);
});

// 生成目录文件
const tocContent = toc
  .map((item) => `${"###".repeat(item.level)} ${item.title}`)
  .join("\n");
fs.writeFileSync(path.join(bookOutputDir, `${bookname}-toc.md`), tocContent);

// 生成 TiddlyWiki 文件和目录结构
const tiddlywikifiles = {
  directories: [
    {
      path: ".",
      filesRegExp: "^.*\\.md$",
      isTiddlerFile: false,
      fields: {
        title: {
          source: "basename",
        },
        type: "text/markdown",
        tags: `${bookname}`,
      },
    },
  ],
};

const readmecontent = `title: ${bookname}/readme

> ${bookname}

[[${bookname}-toc]]`;

const plugininfo = {
  title: bookname,
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
