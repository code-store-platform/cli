import { yellow } from 'chalk';

export default class ChildCliError extends Error {
  public constructor(public readonly message: string, public readonly command: string) {
    super(message);
  }

  public toString(): string {
    let message: string = `Failed to run ${yellow(this.command)}:\n${this.message.trim()}`;

    if (message.toLowerCase().includes('cannot find module')) {
      message += `\nTry run ${yellow('npm install')}`;
    }

    return message;
  }
}
