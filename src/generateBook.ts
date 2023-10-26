import fs from 'fs';
import cheerio, { CheerioAPI } from 'cheerio';
import path from 'path';
import MarkdownIt from 'markdown-it';
import chalk from 'chalk';
import { generateTOC } from '@/generateTOC';
import { generateBookInfo } from '@/generateBookInfo';
import { rimraf } from 'rimraf';
import { generateBookFiles } from './generateBookFiles';

const md = new MarkdownIt({
  linkify: true,
  html: true,
  typographer: true,
});

export const generateBook = (bookinfo: BookInfo) => {
  // TODO: 默认将图片打包到插件
  // NOTE: github 禁止跨域， 需要移除https, 动态检测
  const { bookname, disable = false }: BookInfo = bookinfo;
  if (disable) {
    console.log(chalk.red.bold(`《《${bookname}》》 在黑名单中， 跳过制作`));
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
    generateBookFiles($, toc, heading, headingarrange, index, bookinfo);
  });

  generateBookInfo(toc, bookinfo);

  // if (!fs.existsSync("HTML")) fs.mkdirSync("HTML");
  // fs.writeFileSync(path.join("HTML", `${bookname}.html`), md2html);
};
