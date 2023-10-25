import { getFolderSize } from "./getFolderSize";
import { generateBookInfo } from "./generatepluginbook";
import prompts from "prompts";
import { booklist } from "./books";
import { isCI } from "ci-info";
import chalk from "chalk";

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

// TODO 支持搜索
async function main() {
  let selectedBooksInfo = booklist;
  const choices = booklist.map(({ bookname }) => ({
    title: bookname,
    value: bookname,
  }));

  if (!isCI) {
    const { selectedBookNames } = await prompts({
      onState: onPromptState,
      type: "multiselect",
      name: "selectedBookNames",
      message: "Select",
      choices,
    });

    selectedBooksInfo = booklist.filter((book) =>
      selectedBookNames.includes(book.bookname)
    );
  }

  // @ts-ignore
  selectedBooksInfo.forEach((bookinfo) => generateBookInfo(bookinfo));
  // console.log(selectedBooksInfo.length, "本书籍制作完成");
  const { mb } = getFolderSize("plugins");
  console.log(
    chalk.cyan.bold.underline(
      `\n${selectedBooksInfo.length} 本书籍制作完成, 总计大小: ${mb} Mb`
    )
  );
}

main();
