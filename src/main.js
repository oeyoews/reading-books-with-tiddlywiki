const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

// TODO: prompt
// 读取 Markdown 文件
const outputDir = "plugins";
const bookname = "劫持";
const bookOutputDir = path.join(outputDir, bookname, "files");

const markdown = fs.readFileSync(
  path.join("markdown", `${bookname}.md`),
  "utf-8"
);

// 使用 cheerio 解析 HTML
const $ = cheerio.load(markdown, { xmlMode: true, decodeEntities: false });

// 获取所有的 <div> 元素
const divs = $("div");

// 创建目录文件
const toc = [];

if (!fs.existsSync(bookOutputDir)) {
  fs.mkdirSync(bookOutputDir, { recursive: true });
} else {
  console.log("更新", bookOutputDir);
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

fs.writeFileSync(
  `${bookOutputDir}/tiddlywiki.files`,
  JSON.stringify(tiddlywikifiles, null, 2)
);


const readmecontent = `title: ${bookname}/readme

> ${bookname}

[[${bookname}-toc]]`

const plugininfo = {
  title: bookname,
  type: "plugin",
  version: "0.0.1",
  list: `readme`,
};

fs.writeFileSync(
  path.join(outputDir, bookname, "readme.tid"),
  readmecontent
);
fs.writeFileSync(
  path.join(outputDir, bookname, "plugin.info"),
  JSON.stringify(plugininfo, null, 2)
);
