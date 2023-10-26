import fs from 'fs';
import cheerio, { CheerioAPI } from 'cheerio';
import path from 'path';
import MarkdownIt from 'markdown-it';
import chalk from 'chalk';
import { generateTOC } from '@/generate/generateTOC';
import { generateBookInfo } from '@/generate/generateBookInfo';
import { rimraf } from 'rimraf';
import { generateBookFiles } from '@/generate/generateBookFiles';

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

/**
 * Generates a book based on the provided book information.
 *
 * @param {BookInfo} bookinfo - The information of the book to be generated.
 * @return {void} This function does not return a value.
 */
export const generateBook = (bookinfo: BookInfo) => {
  // TODO: 默认将图片打包到插件
  // NOTE: github 禁止跨域， 需要移除https, 动态检测
  const { bookname, disabled = false }: BookInfo = bookinfo;
  if (disabled) {
    console.log(chalk.red.bold(`${bookname} 在黑名单中， 跳过制作\n`));
    return;
  }
  const outputDir = 'plugins';
  const plugindir = path.join(outputDir, bookname);
  const pluginfiledir = path.join(plugindir, 'files');

  rimraf.moveRemoveSync(plugindir);
  fs.mkdirSync(pluginfiledir, { recursive: true });

  const markdown = fs.readFileSync(
    path.join('markdown', `${bookname}.md`),
    'utf-8',
  );

  const md2html = md.render(markdown);
  // TODO: deprecated cheerio
  const $: CheerioAPI = cheerio.load(md.render(md2html), {
    xmlMode: true,
    decodeEntities: false,
  });

  // 遍历所有标题, h1-h4
  const toc: TOC[] = [];
  const headingarrange = 'h1, h2, h3, h4';
  const headings = $(headingarrange);
  const headingMinLength = 5;
  const totalchapters = headings.length;
  const padLength = totalchapters.toString().length;

  if (headings.length < headingMinLength) {
    console.log(
      chalk.red.bold(
        `${bookname} 的标题总个数为 ${totalchapters}, 请确认是否正确`,
      ),
    );
  } else {
    console.log(
      chalk.cyan.underline(`${bookname} 检测到 ${headings.length} 个标题`),
    );
  }

  headings.each((_, heading) => {
    generateTOC($, toc, heading, bookname, padLength);
  });

  headings.each((index, heading) => {
    generateBookFiles(
      $,
      toc,
      heading,
      headingarrange,
      index,
      bookinfo,
      padLength,
    );
  });

  generateBookInfo(toc, bookinfo, padLength);

  // if (!fs.existsSync("HTML")) fs.mkdirSync("HTML");
  // fs.writeFileSync(path.join("HTML", `${bookname}.html`), md2html);
};
