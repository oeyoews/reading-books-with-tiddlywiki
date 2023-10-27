/**
 * Retrieves the link node based on the given parameters.
 *
 * @param {TOC[]} toc - The table of contents array.
 * @param {number} index - The index of the current node.
 * @param {string} type - The type of link node to retrieve.
 * @return {TOC | null} The link node or null if it doesn't exist.
 */
export const getLinkNode = (toc: TOC[], index: number, type) => {
  if (
    (index <= 0 && type === 'pre') ||
    (index >= toc.length - 1 && type === 'next')
  ) {
    return null;
  }
  const nextIndex = type === 'pre' ? index - 1 : index + 1;
  const nextNode = toc[nextIndex];
  return nextNode.chapter ? getLinkNode(toc, nextIndex, type) : nextNode;
};
