import { getTitle } from '@/lib/getTitle';
import fs from 'fs';
import path from 'path';
import { Element } from 'cheerio';

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
  bookinfo,
  padLength,
) => {
  const { bookname }: BookInfo = bookinfo;
  const pluginfiledir = `plugins/${bookname}/files`;
  const headingContent = $(heading);
  // /\s{2,}/g
  const vanillatitle = headingContent.text().replace('s+/g', ' ');
  const title = getTitle(vanillatitle);
  if (!title) return;

  let headingAllContent = headingContent.nextUntil(headingarrange);
  if (!headingAllContent.length) {
    // @ts-ignore
    headingAllContent = `!! 章节: ${vanillatitle}`;
    // console.log(`检测到 章节 ${vanillatitle}`);
    return;
  }

  const currentLink = toc[index].currentLink;

  //  TODO
  let prevChapterLinkNode = toc[index - 1];
  let nextChapterLinkNode = toc[index + 1];
  if (prevChapterLinkNode?.chapter && index >= 1) {
    prevChapterLinkNode = toc[index - 2];
  }
  if (nextChapterLinkNode?.chapter && index <= toc.length - 3) {
    nextChapterLinkNode = toc[index + 2];
  }

  const prevChapterLink =
    index > 1
      ? `@@display: flex;justify-content: space-between;\n[[« ${prevChapterLinkNode.vanillatitle}|${prevChapterLinkNode.currentLink}]]`
      : `@@display: flex;justify-content: flex-end;\n`;
  const nextChapterLink =
    index < toc.length - 1
      ? `[[${nextChapterLinkNode.vanillatitle} »|${nextChapterLinkNode.currentLink}]] \n@@`
      : `[[回到目录↝|${'0'.repeat(padLength)} ${bookname}目录]]\n@@`;

  const content = `${headingAllContent}\n\n${prevChapterLink}${nextChapterLink}`;

  try {
    const filename = path.join(pluginfiledir, `${currentLink}.tid`);
    fs.writeFileSync(filename, content);
  } catch (error) {
    console.error(`Failed to save file: ${error.message}`);
    return;
  }
};
