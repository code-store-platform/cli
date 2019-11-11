import {Command, flags} from '@oclif/command'
import {ProjectManager, FileWorker} from '../generator';
import {yellow, blue} from 'chalk';
import * as inquirer from 'inquirer'

import {commands} from '../utilities/helpers'

// TODO add logic for service creation on this step
export class Init extends Command {
  static description = 'Initializes new Project';

  static examples = [
    `$ cs init %ServiceName%`,
  ];

  static args = [
    {name: 'serviceName'}
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };

  async run() {
    const {args, flags} = this.parse(Init);
    const {serviceName} = args;

    const generator = new ProjectManager(serviceName ? serviceName : "MyExampleProject", process.cwd());
    const fileWorker = new FileWorker(`${process.cwd()}/${serviceName}`);

    this.log(`${blue(`Code.Store: Creating new project ${serviceName}`)}`);

    const prompt: any = await inquirer.prompt([
      {
        type: 'confirm',
        message: blue('Code.Store: Do you need a database in your project?'),
        name: `database`
      },
      {
        type: 'input',
        message: blue('Code.Store: Please enter the name of database:'),
        name: `dbName`,
        when: async (answers) => answers.database,
        validate: async (input) => input.length > 0
      }
    ]);

    const {database, dbName} = prompt;

    try {
      generator.generate();
      if (database && dbName !== undefined) {

        this.log(blue(`Code.Store: Created a database with name ${dbName}`));

        fileWorker.updateFile(`database ${dbName} connected`, 'codestore_prj.yaml');

        this.log(blue(`Code.Sotre: We've added a database for you.`));

        const prompt: any = await inquirer.prompt([
          {
            type: 'confirm',
            message: blue('Code.Store: Do you need a sample GraphQL configuration?'),
            name: `gql`
          },
        ]);

        if (prompt.gql) {
          this.log(blue(`Code.Store: Sample GraphQL`));
        }
      }
    } catch (e) {
      this.error(e)
    }
    this.log(blue(`Code.Store: Please use next command to add or remove new services to the project:`));
    commands.map(command => {
      this.log(yellow(command));
    })
  }


}
