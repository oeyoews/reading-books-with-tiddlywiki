import fs from 'fs';
import { load, type CheerioAPI } from 'cheerio';
import path from 'path';
import MarkdownIt from 'markdown-it';
import chalk from 'chalk';
import { generateTOC } from '@/generate/generateTOC';
import { generateBookInfo } from '@/generate/generateBookInfo';
import { rimraf } from 'rimraf';
import { generateBookFiles } from '@/generate/generateBookFiles';
import emoji from 'markdown-it-emoji';
import checkbox from 'markdown-it-task-checkbox';
import footnote from 'markdown-it-footnote';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import mark from 'markdown-it-mark';
import ins from 'markdown-it-ins';
import smarkarrows from 'markdown-it-smartarrows';
import deflist from 'markdown-it-deflist';
import hljs from 'highlight.js';

// https://markdown-it.github.io/
// https://github.com/markdown-it/markdown-it
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />).
  breaks: true, // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-',
  linkify: true,
  quotes: '“”‘’',
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (e) {
        console.log(e);
      }
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    );
  },
});

md.use(emoji)
  .use(checkbox)
  .use(footnote)
  .use(sub)
  .use(sup)
  .use(mark)
  .use(ins)
  .use(deflist)
  .use(smarkarrows);

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
  const source = 'markdown';
  const booksourcefile = path.join(source, `${bookname}.md`);
  if (!fs.existsSync(booksourcefile)) {
    console.log(chalk.red.bold(`${booksourcefile} 不存在`));
    return;
  }
  // 首先检查源文件是否存在

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
  const $: CheerioAPI = load(md.render(md2html), {
    xmlMode: true,
    decodeEntities: false,
  });

  // 遍历所有标题, h1-h4
  const toc: TOC[] = [];
  const headingarrange = 'h1, h2, h3, h4'; // TODO hr no close tag
  const headings = $(headingarrange);
  const headingMinLength = 5;
  const totalchapters = headings.length;
  const padLength = totalchapters.toString().length;

  headings.each((_, heading) => {
    generateTOC($, toc, heading, bookname, padLength, headingarrange);
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

  let chaptercount: number = 0;
  toc.forEach(({ chapter }) => {
    chapter && chaptercount++;
  });

  if (headings.length < headingMinLength) {
    console.log(
      chalk.red.bold(
        `${bookname} 的标题总个数为 ${totalchapters}, 请确认是否正确`,
      ),
    );
  } else {
    console.log(
      chalk.cyan.underline(
        `${bookname} 检测到 ${chaptercount} 个章节, ${headings.length} 个标题`,
      ),
    );
  }


  // if (!fs.existsSync('HTML')) fs.mkdirSync('HTML');
  // fs.writeFileSync(path.join('HTML', `${bookname}.html`), md2html);
};
