import * as fs from 'fs';
import * as utils from 'util';

fs.appendFileSync(`${process.cwd()}/debug.log`, `\n[${new Date()}]\n`);

export default class Logger {
  public static error(msg: Error | string): void {
    this.print(msg);
  }

  public static log(...msg: any[]): void {
    this.print(msg);
  }

  private static print(first: any, ...msg: any[]): void {
    if (process.env.DEBUG === 'true') {
      fs.appendFileSync(
        `${process.cwd()}/debug.log`,
        utils.formatWithOptions({ showHidden: true, depth: 10 }, first, ...msg, '\n'),
      );
      // eslint-disable-next-line no-console
      console.log(first, ...msg);
    }
  }
}
