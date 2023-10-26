import { getTitle } from '@/lib/getTitle';
import { Node } from 'node-html-parser';

/**
 * Generates a table of contents (TOC) based on the provided parameters.
 *
 * @param {TOC[]} toc - The array of table of contents.
 * @param {Node} heading - The heading node.
 * @param {string} bookname - The name of the book.
 * @param {number} [padLength=3] - The length to pad the chapter number.
 */
export const generateTOC = (
  toc: TOC[],
  heading: Node,
  bookname: string,
  padLength: number = 3,
) => {
  console.log(heading);
  const headingContent = heading.text.replace(/\s+/g, ' ');
  const title = getTitle(headingContent);

  if (!title) return;

  const chapterNumber = (toc.length + 1).toString().padStart(padLength, '0');
  let currentLink = `${chapterNumber} ${title}`;
  if (currentLink.length < 8) {
    currentLink += ` @${bookname}`;
  }
  toc.push({ currentLink, vanillatitle: headingContent });
};
