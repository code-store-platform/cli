import {Command, flags} from '@oclif/command'
import {ServiceManager, FileWorker} from '../generator';
import {blue} from 'chalk';


export class Service extends Command {
  add(fw: FileWorker, manager: ServiceManager): void {
    this.log(blue(`Creating new service: ${manager.serviceName}`));

    if (!fw.checkIfServiceExists(manager.serviceName)) {
      manager.generate();
    } else {
      this.error('Service already exists');
      return;
    }

    this.log(blue(`Code.Store: Service ${manager.serviceName} successfully created`))
  }

  remove(fw: FileWorker, manager: ServiceManager) {
    if (fw.checkIfServiceExists(manager.serviceName)) {
      manager.remove(manager.serviceName);
      this.log(blue(`Code.Store: Service ${manager.serviceName} was removed`))
    } else {
      this.error(`Service doesn't exits`)
    }
  }

  check() {
    this.log(blue('Service successfully checked'))
  }

  static description = 'Initializes new Project';

  static examples = [
    `$ cs init %ServiceName%`,
  ];

  static args = [
    {name: "action"},
    {name: 'name'}
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };


  async run() {
    const {args} = this.parse(Service);
    const {name, action} = args;

    const path = process.cwd();

    const fw = new FileWorker(path);
    const manager = new ServiceManager(name, path);

    try {
      fw.checkProjectYaml();
    } catch (e) {
      this.error(e);
    }

    return this.strategy[action](fw, manager) || this.strategy['default'];
  }

  strategy: any = {
    add: this.add.bind(this),
    remove: this.remove.bind(this),
    check: this.check.bind(this),
    default: () => {
      this.error('Unresolved method')
    }
  }
}
