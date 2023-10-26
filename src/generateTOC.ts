import { getTitle } from "@/getTitle";
import { CheerioAPI, Element } from "cheerio";

export function generateTOC(
  $: CheerioAPI,
  toc: Object[],
  heading: Element,
  bookname: string,
  padLength: number = 3
) {
  const headingContent = $(heading);

  const vanillatitle = headingContent.text().replace(/\s+/g, " ");
  const title = getTitle(vanillatitle);

  if (!title) return;

  const chapterNumber = (toc.length + 1).toString().padStart(padLength, "0");
  let currentLink = `${chapterNumber}-${title}`;
  if (currentLink.length < 8) {
    currentLink += `@${bookname}`;
  }
  toc.push({ currentLink, vanillatitle });
}
