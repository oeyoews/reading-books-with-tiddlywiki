const generateBook = require("./generatepluginbook");
const books = require("./books");

books.forEach((bookinfo) => generateBook(bookinfo));
// generateBook(books[0])

console.log(`\n书籍插件制作完毕, 一共有 ${books.length} 本书籍`);