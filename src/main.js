const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

// TODO: prompt
// 读取 Markdown 文件
const outputDir = "books/tiddlers";
const bookname = "平凡的世界";
const bookOutputDir = path.join(outputDir, bookname);

const markdown = fs.readFileSync(
  path.resolve(`markdown/${bookname}.md`),
  "utf-8"
);

// 使用 cheerio 解析 HTML
const $ = cheerio.load(markdown, { xmlMode: true, decodeEntities: false });

// 获取所有的 <div> 元素
const divs = $("div");

// 创建目录文件
const toc = [];

if (!fs.existsSync(bookOutputDir)) {
  fs.mkdirSync(bookOutputDir);
}

divs.each((index, element) => {
  // 创建一个新的 Markdown 文件名
  const fileName = `${bookOutputDir}/${bookname}-chapter-${index + 1}.md`;

  // 获取 <div> 元素的内容
  const divContent = $(element).html().trim();

  const link = `[${bookname}-chapter-${index + 1}](#${bookname}-chapter-${
    index + 1
  })`;
  toc.push(link);

  // 将内容写入新的 Markdown 文件
  fs.writeFileSync(fileName, divContent);
});

// 将目录内容写入 toc.md 文件
fs.writeFileSync(`${bookOutputDir}/${bookname}-toc.md`, toc.join("\n"));
fs.copyFileSync(
  path.join("templates/tiddlywiki.files"),
  `${bookOutputDir}/tiddlywiki.files`
);
