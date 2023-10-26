export function getTitle(vanillatitle: string) {
  return (
    vanillatitle
      // .replace(/\s+/g, " ")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]+/g, " ")
      .trim()
  );
  // .replace(/-+$/, "");
}
