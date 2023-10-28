export default (bookname) => {
  const pluginfilename = `$:/plugins/books/${bookname}`;
  const readmefilename = `${pluginfilename}/readme`;
  const statusfilename = `${pluginfilename}/status`;

  const homepagefilename = `${bookname}主页`;
  const tocfilename = `${bookname}目录`;
  return {
    pluginfilename,
    readmefilename,
    statusfilename,
    homepagefilename,
    tocfilename,
  };
};
