import { getTitle } from '@/lib/getTitle';
import fs from 'fs';
import path from 'path';

/**
 * Generates book files based on the provided parameters.
 *
 * @param {Document} document - The HTML document object.
 * @param {Array} toc - The table of contents.
 * @param {Element} heading - The heading element.
 * @param {string} headingarrange - The heading arrange string.
 * @param {number} index - The index of the current chapter.
 * @param {BookInfo} bookinfo - The book information.
 * @param {number} padLength - The length to pad the chapter number.
 * @return {void}
 */
export const generateBookFiles = (
  toc,
  heading,
  headingarrange,
  index,
  bookinfo,
  padLength,
) => {
  const { bookname } = bookinfo;
  const pluginfiledir = `plugins/${bookname}/files`;
  const vanillatitle = heading.textContent.replace(/\s+/g, ' ');
  const title = getTitle(vanillatitle);
  if (!title) return;

  const currentLink = toc[index].currentLink;
  console.log(currentLink);

  let headingAllContent = [];
  let nextSibling = heading.nextElementSibling;
  while (nextSibling && !nextSibling.matchesSelector(headingarrange)) {
    headingAllContent.push(nextSibling.textContent);
    nextSibling = nextSibling.nextElementSibling;
  }

  if (!headingAllContent.length) {
    // @ts-ignore
    headingAllContent = `!! 章节: ${vanillatitle}`;
  } else {
    // @ts-ignore
    headingAllContent = headingAllContent.join('\n');
  }

  const prevChapterLinkNumber = toc[index - 1];
  const nextChapterLinkNumber = toc[index + 1];

  const prevChapterLink =
    index > 1
      ? `@@display: flex;justify-content: space-between;\n[[« ${prevChapterLinkNumber.vanillatitle}|${prevChapterLinkNumber.currentLink}]]`
      : `@@display: flex;justify-content: flex-end;\n`;
  const nextChapterLink =
    index < toc.length - 1
      ? `[[${nextChapterLinkNumber.vanillatitle} »|${nextChapterLinkNumber.currentLink}]] \n@@`
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
