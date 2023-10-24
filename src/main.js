// TODO: prompt
const generateBook = require("./generatebook");

const booknames = ["球状闪电", "肖申克的救赎", "平凡的世界", "劫持"];
// const booknames = ['提问的智慧']

booknames.forEach((bookname) => {
  generateBook(bookname);
});
