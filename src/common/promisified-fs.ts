import {
  writeFile, unlink, readdir, readFile, access, stat,
} from 'fs';
import { promisify } from 'util';
import * as rimraf from 'rimraf';

export default class PromisifiedFs {
  public static rimraf = promisify(rimraf);

  public static unlink = promisify(unlink);

  public static writeFile = promisify(writeFile);

  public static readdir = promisify(readdir);

  public static readFile = promisify(readFile);

  public static access = promisify(access);

  public static stat = promisify(stat);
}
