import RNFS, { DownloadResult, FSInfoResult } from 'react-native-fs';

const mainPath: string = RNFS.DocumentDirectoryPath;

export default {
  downloadFile(url: string, toPath: string): { jobId: number; promise: Promise<DownloadResult> } {
    return RNFS.downloadFile({
      fromUrl: url,
      toFile: mainPath + toPath
    });
  },
  createDirectory(path: string): Promise<void> {
    return RNFS.mkdir(mainPath + path);
  },
  readDirectory(path: string): Promise<string[]> {
    return RNFS.readdir(mainPath + path);
  },
  saveFile(path: string, content: string): Promise<void> {
    return RNFS.writeFile(mainPath + path, content, 'utf8');
  },
  readFile(path: string): Promise<string> {
    return RNFS.readFile(mainPath + path, 'utf8');
  },
  copyFile(fromPath: string, toPath: string): Promise<void> {
    return RNFS.copyFile(mainPath + fromPath, mainPath + toPath);
  },
  hashFile(path: string): Promise<string> {
    return RNFS.hash(mainPath + path, 'sha1');
  },
  deletePath(path: string): Promise<void> {
    return RNFS.unlink(mainPath + path);
  },
  pathExists(path: string): Promise<boolean> {
    return RNFS.exists(mainPath + path);
  },
  getSpaceInfo(): Promise<FSInfoResult> {
    return RNFS.getFSInfo();
  },
  getMainPath(): string {
    return mainPath;
  }
};
