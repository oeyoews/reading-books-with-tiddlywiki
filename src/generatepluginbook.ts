import fs from "fs";
import cheerio, { CheerioAPI, Element, Cheerio } from "cheerio";
import path from "path";
import MarkdownIt from "markdown-it";
import chalk from "chalk";
import { getTitle } from "@/getTitle";
import { generateTOC } from "@/generateTOC";
import { generatePluginFile } from "@/generatePluginFile";
import { rimraf } from "rimraf";

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

export const generateBookInfo = (bookinfo: BookInfo) => {
  // TODO: 默认将图片打包到插件
  // NOTE: github 禁止跨域， 需要移除https, 动态检测
  const { bookname, disable = false }: BookInfo = bookinfo;
  if (disable) {
    console.log(chalk.red.bold(`《《${bookname}》》 在黑名单中， 跳过制作`));
    return;
  }
  const outputDir = "plugins";
  const plugindir = path.join(outputDir, bookname);
  const pluginfiledir = path.join(plugindir, "files");

  rimraf.moveRemoveSync(plugindir);
  fs.mkdirSync(pluginfiledir, { recursive: true });

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
    processHeading(heading, index);
  });

  generatePluginFile(toc, bookinfo);

  function processHeading(heading: Element, index: number) {
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
      const filename = path.join(pluginfiledir, `${currentLink}.tid`);
      fs.writeFileSync(filename, content);
    } catch (error) {
      console.error(`Failed to save file: ${error.message}`);
      return;
    }
  }

  if (!fs.existsSync("HTML")) fs.mkdirSync("HTML");
  fs.writeFileSync(path.join("HTML", `${bookname}.html`), md2html);
};
