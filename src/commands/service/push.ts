import inquirer from 'inquirer';
import { Listr } from 'listr2';
import { blue } from 'chalk';
import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { generateFlow } from './generate';
import { createPrefix } from '../../common/utils';
import DeploymentStatusEnum from '../../common/constants/deployment-status.enum';

export default class Push extends Command {
  public static description = 'Push local changes to Private environment';

  public static aliases = [Aliases.PUSH];

  private splitNotes = (notes: string): string[] => notes.split(';');

  public async execute(): Promise<void> {
    const { serviceId } = await this.serviceWorker.loadValuesFromYaml();
    const deployment = await this.codestore.Deployment.getDeployment(serviceId);
    if (!deployment) {
      this.log(`Service with id ${blue(serviceId)} was not deployed`);
      return;
    }
    if (deployment.status !== DeploymentStatusEnum.DEPLOYED) {
      this.log('Your service is deploying, please try again later.');
      return;
    }

    const { releaseNotes, description } = await inquirer.prompt([
      {
        name: 'description',
        message: 'Description:',
        validate: (value): string | boolean => {
          if (!value || this.splitNotes(value).length < 1) {
            return 'At least one note is required';
          }
          return true;
        },
        prefix: createPrefix('Please enter a short description of your changes'),
      },
      {
        name: 'releaseNotes',
        message: 'Notes:',
        validate: (value): string | boolean => {
          if (!value || this.splitNotes(value).length < 1) {
            return 'At least one note is required';
          }
          return true;
        },
        prefix: createPrefix('Please enter release notes (semicolon separated)'),
      },
    ]);

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
}
