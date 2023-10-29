import fs from 'fs';
import path from 'path';
import { Element } from 'cheerio';
import { getLinkNode } from '@/lib/getLinkNode';
import getfilename from './getfilename';

/**
 * Generates book files based on the provided parameters.
 *
 * @param {any} $ - the jQuery object
 * @param {Array} toc - the table of contents
 * @param {Element} heading - the heading element
 * @param {string} headingarrange - the heading arrange string
 * @param {number} index - the index of the current chapter
 * @param {BookInfo} bookinfo - the book information
 * @return {void}
 */
export const generateBookFiles = (
  $,
  toc: TOC[],
  heading: Element,
  headingarrange: string,
  index: number,
  bookinfo: BookInfo,
  padLength,
) => {
  // 不对章节内容生成内容
  // indent 的style 仍然会对全局有效, 暂时禁用
  const { bookname, indent = false }: BookInfo = bookinfo;
  // 如果是章节, 不生成文件
  if (toc[index].chapter) return;
  const pluginfiledir = `plugins/${bookname}/files`;
  const headingContent = $(heading);
  const headingAllContent = headingContent.nextUntil(headingarrange);

  const currentLink = toc[index]?.currentLink;

  const prevChapterLinkNode = getLinkNode(toc, index, 'pre');
  const nextChapterLinkNode = getLinkNode(toc, index, 'next');

  // maybe this footer customize can use tiddlywiki template to soloute
  const indentstyle = indent ? '<style>p{text-indent:32px;}</style>\n\n' : '';
  const prevChapterLink = prevChapterLinkNode
    ? `@@display: flex;justify-content: space-between;\n[[« ${prevChapterLinkNode?.vanillatitle}|${prevChapterLinkNode?.currentLink}]]`
    : `@@display: flex;justify-content: flex-end;\n`;
  const nextChapterLink = nextChapterLinkNode
    ? `[[${nextChapterLinkNode?.vanillatitle} »|${nextChapterLinkNode?.currentLink}]] \n@@`
    : `[[回到目录↝|${'0'.repeat(padLength)} ${
        getfilename(bookname).homepagefilename
      }]]\n@@`;

  const content = `${headingAllContent}\n\n${indentstyle}${prevChapterLink}${nextChapterLink}`;

  try {
    const filename = path.join(pluginfiledir, `${currentLink}.tid`);
    currentLink && fs.writeFileSync(filename, content);
  } catch (error) {
    console.error(`Failed to save file: ${error.message}`);
    return;
  }
};
