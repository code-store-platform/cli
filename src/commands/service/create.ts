import { flags } from '@oclif/command';
import { blue, bold, yellow } from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import tree from 'tree-node-cli';
import Command from '../../lib/command';
import { IServiceDataUI } from '../../interfaces/service.interface';
import { createPrefix } from '../../common/utils';
import FileWorker from '../../common/file-worker';
import * as ServiceInfo from './info';
import { serviceEnvironments } from '../../common/constants/environment.enum';
import STRING_LENGTH from '../../common/constants/string.length.enum';

interface Ctx {
  service: {
    id: number;
    createdServiceName: string;
    commitId: string;
    uniqueName: string;
  };
}

export default class Create extends Command {
  public static flags = {
    name: flags.string({
      char: 'n',
      description: 'Service name',
    }),
    problem: flags.string({
      char: 'p',
      description: 'What problem are you solving?',
    }),
    howSolving: flags.string({
      char: 's',
      description: 'How do you solve it?',
    }),
    businessDomain: flags.string({
      char: 'b',
      description: 'What is the most relevant business domain of your service?',
    }),
    tags: flags.string({
      char: 't',
      description: 'Tags (comma-separated)',
    }),
  };

  public static description = 'Create new service';

  private structure: string;

  private serviceId: number;

  public async execute(): Promise<void> {
    const { flags: flagsData } = this.parse(Create);
    let service: IServiceDataUI;
    if (Object.keys(flagsData).length) {
      service = await this.validateFlags(Create.flags, flagsData) as IServiceDataUI;
    } else {
      const questions = await this.getQuestions();
      service = await inquirer.prompt(questions);
    }

    const tasks = new Listr<Ctx>([{
      title: `Creating service "${bold(service.name)}"`,
      task: async (ctx, task): Promise<void> => {
        const { service: { displayName: createdServiceName, id, uniqueName }, commitId } = await this.codestore.Service.create({
          name: service.name,
          tags: service.tags,
          problemSolving: service.problem,
          howSolving: service.howSolving,
          businessDomain: service.businessDomain.replace(' ', '_'),
          private: true,
        });
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
    const deploymentTo = ServiceInfo.deploymentsToEnvironments(deployments, serviceEnvironments);

    Object.keys(deploymentTo).forEach((environment) => {
      this.log(`Your service on ${environment} environment is available by this url: ${blue(Command.getServiceUrl(deploymentTo[environment]!))}`);
    });
    this.log('\n');
    this.log(yellow(this.structure));
  }

  private async getQuestions(): Promise<{ name; message }[]> {
    const choices = await this.codestore.Service.businessDomains();
    const questions = [
      {
        name: 'name',
        message: 'Service name:',
        validate: async (value): Promise<string | boolean> => this.validate('name', value),
      },
      {
        name: 'problem',
        message: 'What problem are you solving?:',
        validate: async (value): Promise<string | boolean> => this.validate('problem', value),
      },
      {
        name: 'howSolving',
        message: 'How do you solve it?:',
        validate: async (value): Promise<string | boolean> => this.validate('howSolving', value),
        prefix: createPrefix(`Describe how do you solve it? It's optional too and should look something like:
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
        validate: async (value): Promise<string | boolean> => this.validate('tags', value),
        prefix: createPrefix(`Now, the last thing, enter free-hashtags describing your service.\n Up to 5, comma-separated, no need to add #.\n Example:
        hospitality, booking, meeting-rooms, office`),
      },
    ];
    return questions;
  }

  public get rules(): { [key: string]: (value: any) => string | boolean | Promise<string | boolean> } {
    return {
      name: async (value): Promise<string | boolean> => {
        const name = 'Service name';

        if (!value.length) {
          return `${name} should not be empty`;
        }

        if (value.length >= STRING_LENGTH.MEDIUM) {
          return `${name} for this field should be less than ${STRING_LENGTH.MEDIUM} characters`;
        }

        if (value.length < STRING_LENGTH.MIN) {
          return `${name} must be longer than or equal to ${STRING_LENGTH.MIN} characters`;
        }

        const available = await this.codestore.Service.isUniqueNameAvailable(value);
        if (available.free) {
          return true;
        }
        return `Service with this name already exists in your organization, available names: ${available.variants.join(', ')}`;
      },
      problem: (value): string | boolean => {
        const name = 'Problem solving';
        if (!value) {
          return `${name} should be provided.`;
        }
        if (value.length >= STRING_LENGTH.LONG) {
          return `${name} should be less than ${STRING_LENGTH.LONG} characters.`;
        }
        return true;
      },
      howSolving: (value): string | boolean => {
        if (!value) {
          return 'Describe how you solve it, please.';
        }
        if (value.length >= STRING_LENGTH.LONG) {
          return `Solving description should be less than ${STRING_LENGTH.LONG} characters.`;
        }
        return true;
      },
      tags: (value): string | boolean => {
        if (!value) {
          return 'Tags should be provided.';
        }

        const tags = value.split(',');

        if (tags.length > STRING_LENGTH.SERVICE_TAGS_COUNT) {
          return `Please select a maximum of ${STRING_LENGTH.SERVICE_TAGS_COUNT} tags.`;
        }

        const exception = tags.find((tag) => tag.length > STRING_LENGTH.SERVICE_TAGS_MAX);

        if (exception) {
          return `Tag ${exception} is more than ${STRING_LENGTH.SERVICE_TAGS_MAX} characters`;
        }

        return true;
      },
      businessDomain: async (value): Promise<string | boolean> => {
        const name = 'Business domain';
        if (!value) {
          return `${name} should be provided.`;
        }
        const choices = await this.codestore.Service.businessDomains();
        const isValid = choices.includes(value);
        if (!isValid) {
          return `${name} should be one of: ${choices.join(', ')}`;
        }
        return true;
      },
    };
  }
}
