import { yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import clear from 'clear';
import tree from 'tree-node-cli';
import Command from '../../lib/command';
import { IServiceCreate } from '../../interfaces/service.interface';
import { createSuffix } from '../../common/utils';
import FileWorker from '../../common/file-worker';

interface Ctx {
  service: {
    id: number;
    createdServiceName: string;
    commitId: string;
  };
}

export default class Create extends Command {
  public static description = 'Create new service';

  private structure;

  public async execute(): Promise<void> {
    const choices = await this.codestore.Service.businessDomains();
    // todo update description
    const service = await inquirer.prompt([
      {
        name: 'name',
        message: 'Service name',
        validate: (name): string | boolean => {
          if (!name.length) {
            return 'Value should not be empty';
          }
          if (name.length >= 35) {
            return 'Value for this field should be less than 35 characters.';
          }
          return true;
        },
        suffix: createSuffix('The name of the service, will be used as identifier'),
      },
      {
        name: 'problemSolving',
        message: 'What problem is your service solving?',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        suffix: createSuffix('Short description of what service is going to solve.'),
        prefix: '(optional)',
      },
      {
        name: 'howSolving',
        message: 'How your service is solving this problem',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        prefix: '(optional)',
      },
      {
        type: 'list',
        name: 'businessDomain',
        message: 'Business domain of your service:',
        choices,
      },
      {
        name: 'tags',
        message: '#tags (up to 5 comma-separated tags)',
        validate: (value): string | boolean => {
          if (value.length >= 25) {
            return 'Value for this field should be less than 25 characters.';
          }
          if (value.split(',').length > 5) {
            return 'Please select a maximum of 5 tags.';
          }
          return true;
        },
        prefix: '(optional)',
      },
      { name: 'private', message: 'Is your service going to be private?', type: 'confirm' },
    ]) as IServiceCreate;

    clear();

    const tasks = new Listr<Ctx>([{
      title: `Creating service ${yellow(service.name)}`,
      task: async (ctx, task): Promise<void> => {
        const { service: { displayName: createdServiceName, id }, commitId } = await this.codestore.Service.create(service);
        ctx.service = {
          createdServiceName, id, commitId,
        };

        // eslint-disable-next-line no-param-reassign
        task.title = `Created service "${yellow(createdServiceName)}", Service ID: "${yellow(id)}"`;
      },
      options: { persistentOutput: true },
    },
    {
      title: 'Creating demo and private environment',
      task: async (ctx, task): Promise<void> => {
        await this.codestore.Service.checkServiceDeployed(ctx.service.id);

        // eslint-disable-next-line no-param-reassign
        task.title = 'Deployed to demo and private environment';
      },
    },
    {
      title: 'Downloading service template',
      task: async (ctx): Promise<void> => {
        const { id, createdServiceName } = ctx.service;

        const data = await this.codestore.Service.download(id);

        await FileWorker.saveZipFromB64(data, createdServiceName);

        this.structure = tree(createdServiceName);
      },
    },
    ]);

    await tasks.run();
    this.log('\n');
    this.log(yellow(this.structure));
  }
}
