import {
  writeFile, unlink, readdir, readFile, access,
} from 'fs';
import { promisify } from 'util';

export default class PromisifiedFs {
  public static unlink = promisify(unlink);

  public static writeFile = promisify(writeFile);

  public static readdir = promisify(readdir);

  public static readFile = promisify(readFile);

  public static access = promisify(access);
}
