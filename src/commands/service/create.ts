import { blue, bold, yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import clear from 'clear';
import tree from 'tree-node-cli';
import Command from '../../lib/command';
import { IServiceCreate } from '../../interfaces/service.interface';
import { createPrefix } from '../../common/utils';
import FileWorker from '../../common/file-worker';
import * as ServiceInfo from './info';
import { serviceEnvironments } from '../../common/constants/environment.enum';

interface Ctx {
  service: {
    id: number;
    createdServiceName: string;
    commitId: string;
    uniqueName: string;
  };
}

export default class Create extends Command {
  public static description = 'Create new service';

  private structure: string;

  private serviceId: number;

  public async execute(): Promise<void> {
    const choices = await this.codestore.Service.businessDomains();

    const service = await inquirer.prompt([
      {
        name: 'name',
        message: 'Service name:',
        validate: async (name): Promise<string | boolean> => {
          if (!name.length) {
            return 'Value should not be empty';
          }

          if (name.length >= 35) {
            return 'Value for this field should be less than 35 characters';
          }

          if (name.length < 3) {
            return 'Name must be longer than or equal to 3 characters';
          }

          const available = await this.codestore.Service.isUniqueNameAvailable(name);
          if (available.free) {
            return true;
          }
          return `Service with this name already exists in your organization, available names: ${available.variants.join(', ')}`;
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
          createdServiceName, id, commitId, uniqueName,
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
        const { id, uniqueName } = ctx.service;

        const data = await this.codestore.Service.download(id);

        await FileWorker.saveZipFromB64(data, uniqueName);

        this.structure = tree(uniqueName, { exclude: [/node_modules/, /dist/] });
      },
    },
    ]);

    await tasks.run();

    const deployments = await this.codestore.Deployment.getDeploymentsForService(this.serviceId);
    const deploymentTo = ServiceInfo.deploymentsToEnvronments(deployments, serviceEnvironments);

    Object.keys(deploymentTo).forEach((environment) => {
      this.log(`Your service on ${environment} environment is available by this url: ${
        blue(Command.getServiceUrl(deploymentTo[environment]!))
      }`);
    });
    this.log('\n');
    this.log(yellow(this.structure));
  }
}
