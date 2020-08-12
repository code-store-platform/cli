import * as fs from 'fs';
import * as utils from 'util';

const isDebugMode = process.env.DEBUG === 'true';

if (isDebugMode) {
  fs.appendFileSync(`${process.cwd()}/debug.log`, `\n[${new Date()}]\n`);
}

export default class Logger {
  public static error(msg: Error | string): void {
    this.print(msg);
  }

  public static log(...msg: any[]): void {
    this.print(msg);
  }

  private static print(first: any, ...msg: any[]): void {
    if (isDebugMode) {
      fs.appendFileSync(
        `${process.cwd()}/debug.log`,
        utils.formatWithOptions({ showHidden: true, depth: 10 }, first, ...msg, '\n'),
      );
    }
  }
}
