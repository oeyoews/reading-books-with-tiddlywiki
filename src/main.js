// TODO: prompt
const generateBook = require("./generatebook");

// const booknames = ["球状闪电", "劫持", "肖申克的救赎"];
const booknames = ['球状闪电'];

booknames.forEach((bookname) => {
  generateBook(bookname);
});
