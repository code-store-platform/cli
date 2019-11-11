import {Command, flags} from '@oclif/command'
import {FileWorker} from "../generator";
import {blue} from 'chalk';

export class ENV extends Command {

  static args = [
    {name: "action"},
    {name: 'envName'},
    {name: "envValue"}
  ];

  async run() {
    const {args} = this.parse(ENV);
    const {action, envName: name, envValue: value} = args;
    const path = process.cwd();

    const fileWorker = new FileWorker(path);

    const env = `${name}=${value}`;

    if (fileWorker.checkFileExists()) {
      if (action === 'add') {
        fileWorker.updateFile(`${env}\n`, 'env.yaml');
        this.log(blue(`ENV ${env} was added`))
      }
      if (action === 'remove') {
        const updatedFile = fileWorker
          .readFile('env.yaml')
          .split('\n')
          .filter(i => i !== `${env}`)
          .join('\n');

        fileWorker.rewriteFile(updatedFile, 'env.yaml');
        this.log(blue(`ENV ${env} was removed`))
      }
    } else {
      this.error('You should be in service folder');
    }
  }

}
