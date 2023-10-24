const generateBook = require("./generatepluginbook");

// NOTE: 书名一定要有对应的文件, markdown/<bookname>.md
const books = [
  {
    bookname: "平凡的世界",
    author: "路遥",
    description: "《球状闪电》是刘慈欣创作的一部科幻小说，讲述了一个关于球状闪电的故事。该小说以科学的视角展示了人类对未知事物的探索和挑战。",
    cover: ""
  },
  {
    bookname: "球状闪电",
    author: "刘慈欣",
    description: "《球状闪电》是刘慈欣创作的一部科幻小说，讲述了一个关于球状闪电的故事。该小说以科学的视角展示了人类对未知事物的探索和挑战。",
    cover: ''
  },
  {
    bookname: '肖申克的救赎',
    author: '斯蒂芬·金',
    description: '《肖申克的救赎》是斯蒂芬·金的一部长篇小说，讲述了主人公安迪·杜弗雷恩在肖申克监狱中的生活和逃亡的故事。这部小说以其深刻的人物刻画和令人难忘的故事情节而闻名。',
    cover: ''
  },
  {
    bookname: '劫持',
    author: '',
    description: '',
    cover: ''
  },
  {
    bookname: '提问的智慧',
    author: '',
    description: '《提问的智慧》主要介绍了提问的艺术和技巧。这本书对于希望在技术社区中提问并得到有用回答的人来说是一本非常有价值的参考书。',
    cover: ''
  }
];

books.forEach((bookinfo) => generateBook(bookinfo));