interface TOC {
  currentLink: string;
  vanillatitle: string;
  chapter: boolean;
}

interface BookInfo {
  bookname: string;
  indent?: boolean;
  author?: string;
  description?: string;
  disabled?: boolean;
  cover?: string;
  version?: string;
}

interface FolderSize {
  totalSize?: number;
  kb: string;
  mb: string;
}
