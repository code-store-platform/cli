import { writeFile, unlink } from 'fs';
import { promisify } from 'util';

export default class PromisifiedFs {
  public static unlink = promisify(unlink);

  public static writeFile = promisify(writeFile);
}
