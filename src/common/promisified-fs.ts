import {
  writeFile, unlink, readdir, readFile, access, stat, exists, mkdir,
} from 'fs';
import { promisify } from 'util';
import rimraf from 'rimraf';

export default class PromisifiedFs {
  public static rimraf = promisify(rimraf);

  public static unlink = promisify(unlink);

  public static writeFile = promisify(writeFile);

  public static readdir = promisify(readdir);

  public static readFile = promisify(readFile);

  public static access = promisify(access);

  public static stat = promisify(stat);

  public static exists = promisify(exists);

  public static mkdir = promisify(mkdir);

  public static async createFolderIfNotExist(path: string): Promise<void> {
    if (!await PromisifiedFs.exists(path)) {
      await PromisifiedFs.mkdir(path);
    }
  }
}
