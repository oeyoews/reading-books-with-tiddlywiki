// TODO: prompt
const generateBook = require("./generatebook");

// TODO 适应不同level
const booknamesLevel2 = ["球状闪电", "劫持", "肖申克的救赎"];
const booknamesLevel3 = ["平凡的世界"];

booknamesLevel2.forEach((bookname) => {
  generateBook(bookname, 2);
});

booknamesLevel3.forEach((bookname) => {
  generateBook(bookname, 3);
});
