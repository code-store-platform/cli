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
        message: 'What is your service name',
        validate: (name): string | boolean => {
          if (!name.length) {
            return 'Value should not be empty';
          }
          if (name.length >= 35) {
            return 'Value for this field should be less than 35 characters.';
          }
          return true;
        },
        suffix: createSuffix('it should be the shortest meaningful name possible, for example: "Meeting-rooms booking"'),
      },
      {
        name: 'problemSolving',
        message: 'Describe what functional problem are you solving with your service?',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        suffix: createSuffix('It\'s optional and here is an example: "My service manages meeting rooms and their booking by users"'),
      },
      {
        name: 'howSolving',
        message: 'Describe how you solve it?',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        suffix: createSuffix('It\'s optional too and should look something like: "This service provides an API to create, update and delete rooms and another set of queries to manage bookings, cancellations, and search for available rooms. It does not manage payments."'),
      },
      {
        type: 'list',
        name: 'businessDomain',
        message: 'What is the most relevant business domain of your service',
        choices,
        suffix: createSuffix('Use up/down arrows to navigate and hit ENTER to select. Please select \'Other\' as last option'),
      },
      {
        name: 'tags',
        message: 'Now, the last thing, enter free-hashtags describing your service.',
        validate: (value): string | boolean => {
          const tags = value.split(',');

          if (tags.length > 5) {
            return 'Please select a maximum of 5 tags.';
          }

          const exception = tags.find((tag) => tag.length > 25);

          if (exception) {
            return `Tag ${exception} is more than 25 characters`;
          }

          return true;
        },
        suffix: createSuffix('Up to 5, comma-separated, no need to add #. Example: hospitality, booking, meeting-rooms, office'),
      },
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
