import {Command} from "@oclif/command";
import {blueBright, green, red, yellow} from 'chalk'

const Table = require('cli-table');

const fakeList = [
  {id: 'asdmwmw123', name: 'MyApplication', status: green('ok')},
  {id: 'qq2233', name: 'RestApi', status: yellow('warn')},
  {id: 'zxcasd', name: 'AppSyncApp', status: red('error')},
];

export class List extends Command {
  async run() {
    const {args} = this.parse(List);
    const table = new Table({
      head: [
        blueBright('id'),
        blueBright('name'),
        blueBright('status')
      ]
    });

    fakeList.map(item => {
      table.push([ item.id, item.name, item.status ])
    });

    this.log(table.toString());
  }
}
