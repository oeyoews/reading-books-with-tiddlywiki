import fs from 'fs';
import path from 'path';

/**
 * Calculates the size of a folder and its subfolders.
 *
 * @param {string} folderPath - The path to the folder.
 * @return {FolderSize} An object containing the total size of the folder and its subfolders, in bytes, kilobytes, and megabytes.
 */
export const getFolderSize = (folderPath: string): FolderSize => {
  let totalSize = 0;

  const stats = fs.statSync(folderPath);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      totalSize += getFolderSize(filePath).totalSize; // 累加子文件夹的大小
    }
  } else {
    totalSize += stats.size;
  }

  return {
    totalSize,
    kb: (totalSize / 1024).toFixed(0),
    mb: (totalSize / (1024 * 1024)).toFixed(2),
  };
};
