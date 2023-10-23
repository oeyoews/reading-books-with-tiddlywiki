const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const md = require("markdown-it")();
const prompt = require("prompt");

// TODO: prompt
// 读取 Markdown 文件
const outputDir = "plugins";
const bookname = "劫持";
const bookOutputDir = path.join(outputDir, bookname, "files");

const markdown = fs.readFileSync(
  path.join("markdown", `${bookname}.md`),
  "utf-8"
);

if (!fs.existsSync(bookOutputDir)) {
  fs.mkdirSync(bookOutputDir, { recursive: true });
}

// 使用 cheerio 解析 HTML
// const $ = cheerio.load(markdown, { xmlMode: true, decodeEntities: false });

// 将 Markdown 转换为 HTML，并使用 cheerio 解析
const $ = cheerio.load(md.render(markdown));

const toc = [];

const headings = $("h2");
headings.each((index, heading) => {
  // TODO 中文空格
  const title = $(heading).text().replace(/ /g, "-");
  const chapterNumber = index + 1;
  // console.log($(heading).text());

  // 找到该二级标题的起始和结束位置，在 Markdown 中截取出该部分内容
  const start = $(heading).next();
  const end = start.nextUntil("h2");

  // 将截取出来的内容写入一个新的 Markdown 文件
  const filename = `${bookname}-${chapterNumber}-${title}`;
  // const filename = `${bookname}-${chapterNumber}`;

  const link = `[${filename}](#${filename})`;
  toc.push(link);
  const content = `## ${$(heading).text()}\n\n${$(heading)
    .nextUntil("h2")
    .text()}`;
  // const content = $(heading).nextUntil("h2").text();
  fs.writeFileSync(path.join(bookOutputDir, `${filename}.md`), content);
});

fs.writeFileSync(
  path.join(bookOutputDir, `${bookname}-toc.md`),
  toc.join("\n")
);

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

