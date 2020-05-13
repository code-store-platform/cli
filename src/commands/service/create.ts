import { yellow, gray } from 'chalk';
import * as inquirer from 'inquirer';
import { Listr } from 'listr2';
import * as clear from 'clear';
import Command from '../../lib/command';
import { IServiceCreate } from '../../interfaces/service.interface';
import { createSuffix } from '../../common/utils';

interface Ctx {
  service: {
    id: number;
    createdServiceName: string;
    commitId: string;
  };
}

export default class Create extends Command {
  static description = 'Create new service';

  async execute() {
    const choices = await this.codestore.Service.businessDomains();
    // todo update description
    const service = await inquirer.prompt([
      {
        name: 'name',
        message: 'Service name',
        validate: (name) => {
          if (name.length >= 35 && name.length) {
            return 'Name to long';
          }
          return true;
        },
        suffix: createSuffix('The name of the service, will be used as identifier'),
      },
      {
        name: 'problemSolving',
        message: 'What problem is your service solving?',
        validate: (value) => {
          if (value.length >= 140) {
            return 'Value for this field is to long';
          }
          return true;
        },
        suffix: createSuffix('Short description about what service going to solve'),
      },
      {
        name: 'howSolving',
        message: 'How your service is solving this problem',
        validate: (value) => {
          if (value.length >= 140) {
            return 'Value for this field is to long';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'businessDomain',
        message: 'Business domain of your service:',
        choices,
      },
      {
        name: 'tags',
        message: '#tags (comma-separated)',
        validate: (value) => {
          if (value.length >= 25) {
            return 'Value for this field is to long';
          }
          if (value.split(',').length > 5) {
            return '5 tags is available';
          }
          return true;
        },
      },
      { name: 'private', message: 'Is your service going to be private?', type: 'confirm' },
    ]) as IServiceCreate;

    clear();

    const tasks = new Listr<Ctx>([{
      title: `Creating service ${yellow(service.name)}`,
      task: async (ctx, task) => {
        const { displayName: createdServiceName, id, commitId } = await this.codestore.Service.create(service);
        ctx.service = {
          createdServiceName, id, commitId: 'test',
        };

        // eslint-disable-next-line no-param-reassign
        task.title = `Created service "${yellow(createdServiceName)}", Service ID: "${yellow(id)}"`;
      },
      options: { persistentOutput: true },
    },
    {
      title: `Dispatching commands to build ${yellow('Develop')} and ${yellow('Demo')} environments`,
      task: async (ctx, task) => {
        const { id, commitId } = ctx.service;
        await this.codestore.Service.deploy(id, commitId);

        // eslint-disable-next-line no-param-reassign
        task.title = `Deployment for service ${id} was successfully enqueued `;
      },
    },
    ]);

    await tasks.run();
  }
}
