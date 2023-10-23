const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

// 读取 Markdown 文件
const markdown = fs.readFileSync(path.resolve("src/input.md"), "utf-8");

// 使用 cheerio 解析 HTML
const $ = cheerio.load(markdown, { xmlMode: true, decodeEntities: false });

// 获取所有的 <div> 元素
const divs = $("div");

if (!fs.existsSync("test")) {
  fs.mkdirSync("test");
}
divs.each((index, element) => {
  // 创建一个新的 Markdown 文件名
  const fileName = `test/chapter-${index + 1}.md`;

  // 获取 <div> 元素的内容
  const divContent = $(element).html().trim();

  // 将内容写入新的 Markdown 文件
  fs.writeFileSync(fileName, divContent);
});
