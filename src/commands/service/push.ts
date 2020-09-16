import { flags } from '@oclif/command';
import inquirer, { QuestionCollection } from 'inquirer';
import { Listr } from 'listr2';
import { blue } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { generateFlow } from './generate';
import { createPrefix } from '../../common/utils';
import DeploymentStatusEnum from '../../common/constants/deployment-status.enum';

export default class Push extends Command {
  public static flags = {
    releaseNotes: flags.string({
      char: 'r',
      description: 'Release notes (semicolon separated)',
    }),
    description: flags.string({
      char: 'd',
      description: 'A short description of your changes',
    }),
  };

  public static description = 'Push local changes to Private environment';

  public static aliases = [Aliases.PUSH];

  private splitNotes = (notes: string): string[] => notes.split(';');

  public async execute(): Promise<void> {
    const { flags: flagsData } = this.parse(Push);
    const { serviceId } = await this.serviceWorker.loadValuesFromYaml();
    let releaseNotes: string;
    let description: string;

    if (Object.keys(flagsData).length) {
      const data = await this.validateFlags(Push.flags, flagsData);
      releaseNotes = data.releaseNotes;
      description = data.description;
    } else {
      const questions = this.getQuestions();
      const promptResult = await inquirer.prompt(questions) as { description: string; releaseNotes: string };
      description = promptResult.description;
      releaseNotes = promptResult.releaseNotes;
    }

    const deployment = await this.codestore.Deployment.getDeployment(serviceId);
    if (!deployment) {
      this.log(`Service with id ${blue(serviceId)} was not deployed`);
      return;
    }

    if (deployment.status === DeploymentStatusEnum.DEPLOYMENT_INITIALIZED || deployment.status === DeploymentStatusEnum.DEPLOYMENT_IN_PROGRESS) {
      this.log('Your service is deploying, please try again later.');
      return;
    }
    const { error } = this;
    const generate = generateFlow(this, error);

    // need to change only one step
    const uploadToGeneratorIndex = generate.findIndex((task) => task.title === 'Uploading service to the generator');
    generate.splice(uploadToGeneratorIndex, 1, {
      title: 'Pushing service',
      task: async (ctx, task): Promise<void> => {
        const { encodedZip } = ctx;
        ctx.generated = await this.codestore.Service.push(encodedZip, this.splitNotes(releaseNotes), description);

        if (ctx.generated) {
          // eslint-disable-next-line no-param-reassign
          task.title = 'Service has been pushed';
        }
      },
    });

    // wait for deployment in the last place
    generate.push({
      title: 'Deploying to private environment',
      task: async (ctx, task): Promise<void> => {
        await this.codestore.Deployment.checkDeployment(serviceId);

        // eslint-disable-next-line no-param-reassign
        task.title = 'Deployed to private environment';
      },
    });

    this.log(''); // print just a newline

    const tasks = new Listr<{ encodedZip: string; generated: string }>(generate);

    await tasks.run();
  }

  private getQuestions(): QuestionCollection {
    return [
      {
        name: 'description',
        message: 'Description:',
        validate: (value): Promise<string | boolean> => this.validate('description', value),
        prefix: createPrefix('Please enter a short description of your changes'),
      },
      {
        name: 'releaseNotes',
        message: 'Notes:',
        validate: (value): Promise<string | boolean> => this.validate('releaseNotes', value),
        prefix: createPrefix('Please enter release notes (semicolon separated)'),
      },
    ];
  }

  public get rules(): { [key: string]: (value: any) => string | boolean } {
    return {
      description: (value): string | boolean => {
        if (!value || this.splitNotes(value).length < 1) {
          return 'At least one description note is required';
        }
        return true;
      },
      releaseNotes: (value): string | boolean => {
        if (!value || this.splitNotes(value).length < 1) {
          return 'At least one release note is required';
        }
        return true;
      },
    };
  }
}
