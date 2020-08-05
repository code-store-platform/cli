import { blue, bold, yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import clear from 'clear';
import tree from 'tree-node-cli';
import Command from '../../lib/command';
import { IServiceCreate } from '../../interfaces/service.interface';
import { createPrefix } from '../../common/utils';
import FileWorker from '../../common/file-worker';
import { installDependencies } from '../../lib/child-cli';

interface Ctx {
  service: {
    id: number;
    createdServiceName: string;
    commitId: string;
  };
}

export default class Create extends Command {
  public static description = 'Create new service';

  private structure: string;

  private serviceId: number;

  public async execute(): Promise<void> {
    const choices = await this.codestore.Service.businessDomains();
    // todo update description
    const service = await inquirer.prompt([
      {
        name: 'name',
        message: 'Service name:',
        validate: (name): string | boolean => {
          if (!name.length) {
            return 'Value should not be empty';
          }

          if (name.length >= 35) {
            return 'Value for this field should be less than 35 characters';
          }

          if (name.length < 3) {
            return 'Name must be longer than or equal to 3 characters';
          }

          return true;
        },
        prefix: createPrefix(`What is your service name?\n It should be the shortest meaningful name possible, for example:
        Meeting-rooms booking`),
      },
      {
        name: 'problemSolving',
        message: 'What problem are you solving?:',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        prefix: createPrefix(`Describe what functional problem are you solving with your service?\n It's optional and here is an example:
        My service manages meeting rooms and their booking by users`),
      },
      {
        name: 'howSolving',
        message: 'How you solve it?:',
        validate: (value): string | boolean => {
          if (value.length >= 140) {
            return 'Value for this field should be less than 140 characters.';
          }
          return true;
        },
        prefix: createPrefix(`Describe how you solve it? It's optional too and should look something like:
        This service provides an API to create, update and delete rooms and
        another set of queries to manage bookings, cancellations, and search for available rooms.`),
      },
      {
        type: 'list',
        name: 'businessDomain',
        message: 'Business domain:',
        choices,
        prefix: createPrefix('What is the most relevant business domain of your service?\n Use up/down arrows to navigate and hit ENTER to select.\n Please select \'Other\' as last option'),
      },
      {
        name: 'tags',
        message: 'Hashtags:',
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
        prefix: createPrefix(`Now, the last thing, enter free-hashtags describing your service.\n Up to 5, comma-separated, no need to add #.\n Example:
        hospitality, booking, meeting-rooms, office`),
      },
    ]) as IServiceCreate;

    clear();

    const tasks = new Listr<Ctx>([{
      title: `Creating service "${bold(service.name)}"`,
      task: async (ctx, task): Promise<void> => {
        const { service: { displayName: createdServiceName, id, uniqueName }, commitId } = await this.codestore.Service.create(service);
        ctx.service = {
          createdServiceName, id, commitId,
        };

        this.serviceId = id;

        // eslint-disable-next-line no-param-reassign
        task.title = `Created service with ID: ${blue(uniqueName)}`;
      },
      options: { persistentOutput: true },
    },
    {
      title: 'Building the containers for private and demo environments',
      task: async (ctx, task): Promise<void> => {
        await this.codestore.Service.checkServiceCreated(ctx.service.id);

        // eslint-disable-next-line no-param-reassign
        task.title = 'Private and demo environment containers were built';
      },
    },
    {
      title: 'Deploying to private and demo environments',
      task: async (ctx, task): Promise<void> => {
        await this.codestore.Service.checkServiceDeployed(ctx.service.id);

        // eslint-disable-next-line no-param-reassign
        task.title = 'Deployed to private and demo environments';
      },
    },
    {
      title: 'Downloading service template',
      task: async (ctx): Promise<void> => {
        const { id, createdServiceName } = ctx.service;

        const data = await this.codestore.Service.download(id);

        await FileWorker.saveZipFromB64(data, createdServiceName);

        this.structure = tree(createdServiceName, { exclude: [/node_modules/, /dist/] });
      },
    },
    {
      title: 'Installing dependencies',
      task: async (ctx): Promise<void> => {
        await installDependencies(ctx.service.createdServiceName);
      },
    },
    ]);

    await tasks.run();

    this.log(`Your service on private environment is available by this url: ${blue(`${this.apiPath}/0/private/${this.serviceId}/graphql`)}`);
    this.log(`Your service on demo environment is available by this url: ${blue(`${this.apiPath}/0/demo/${this.serviceId}/graphql`)}`);
    this.log('\n');
    this.log(yellow(this.structure));
  }
}
