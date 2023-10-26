import { getTitle } from '@/getTitle';
import { CheerioAPI, Element } from 'cheerio';

/**
 * Generates a table of contents (TOC) based on the provided parameters.
 *
 * @param {CheerioAPI} $ - The Cheerio API object.
 * @param {TOC[]} toc - The array of table of contents.
 * @param {Element} heading - The heading element.
 * @param {string} bookname - The name of the book.
 * @param {number} [padLength=3] - The length to pad the chapter number.
 */
export const generateTOC = (
  $: CheerioAPI,
  toc: TOC[],
  heading: Element,
  bookname: string,
  padLength: number = 3,
) => {
  const headingContent = $(heading);

  const vanillatitle = headingContent.text().replace(/\s+/g, ' ');
  const title = getTitle(vanillatitle);

  if (!title) return;

  const chapterNumber = (toc.length + 1).toString().padStart(padLength, '0');
  let currentLink = `${chapterNumber} ${title}`;
  if (currentLink.length < 8) {
    currentLink += ` @${bookname}`;
  }
  toc.push({ currentLink, vanillatitle });
};
