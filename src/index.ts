import { getFolderSize } from '@/lib/getFolderSize';
import { generateBook } from '@/generateBook';
import prompts from 'prompts';
import { booklist } from '@/books';
import chalk from 'chalk';

/**
 * Executes a callback function when the state is not aborted.
 *
 * @param {Object} state - The state object.
 * @return {void} This function does not return a value.
 */
const onPromptState = (state) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

/**
 * Executes the main function.
 *
 * @return {Promise<void>} Returns a promise that resolves when the function is complete.
 */
async function main() {
  let selectedBooksInfo = booklist;
  const choices = booklist.map(({ bookname }) => ({
    title: bookname,
    value: bookname,
  }));

  if (process.argv.includes('-i')) {
    console.log(chalk.green.bold('开始交互式构建书籍'));
    const { selectedBookNames } = await prompts({
      onState: onPromptState,
      type: 'multiselect',
      name: 'selectedBookNames',
      message: 'Select',
      choices,
    });

    selectedBooksInfo = booklist.filter((book) =>
      selectedBookNames.includes(book.bookname),
    );
    console.log(chalk.cyan.bold(`开始构建书籍 ${selectedBookNames}\n`));
  } else {
    console.log(chalk.cyan.bold('开始构建全部书籍\n'));
  }
  selectedBooksInfo.forEach((bookinfo) => generateBook(bookinfo));
  const { mb } = getFolderSize('plugins');
  console.log(
    chalk.cyan.bold.underline(
      `\n${selectedBooksInfo.length} 本书籍制作完成, 总计大小: ${mb} Mb`,
    ),
  );
}

main();
