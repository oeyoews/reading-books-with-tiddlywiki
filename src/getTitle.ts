/**
 * Returns a modified version of the input string `vanillatitle` by replacing
 * any characters that are not Chinese characters, English letters, numbers, or
 * hyphens with a space. The resulting string is then trimmed of leading and
 * trailing spaces.
 *
 * @param {string} vanillatitle - the input string to be modified
 * @return {string} the modified string
 */
export const getTitle = (vanillatitle: string) => {
  return (
    vanillatitle
      // .replace(/\s+/g, " ")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]+/g, ' ')
      .trim()
  );
  // .replace(/-+$/, "");
};
