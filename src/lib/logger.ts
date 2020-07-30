export default class Logger {
  public static error(msg: Error | string): void {
    this.print(msg);
  }

  public static log(...msg: any[]): void {
    this.print(msg);
  }

  private static print(...msg: any[]): void {
    if (process.env.DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.log(...msg);
    }
  }
}
