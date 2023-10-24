const generateBook = require("./generatepluginbook");

const booknames = [
  "球状闪电",
  "肖申克的救赎",
  "平凡的世界",
  "劫持",
  "提问的智慧",
];

booknames.forEach((bookname) => {
  generateBook(bookname);
});
