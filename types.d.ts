interface TOC {
  currentLink: string;
  vanillatitle: string;
}

interface BookInfo {
  bookname: string;
  author?: string;
  description?: string;
  disable?: boolean;
  cover?: string;
  version?: string;
}

interface FolderSize {
  totalSize?: number;
  kb: string;
  mb: string;
}