// @ts-nocheck
import fs from "fs";
import path from "path";

export function getFolderSize(folderPath) {
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
}
