import { flags } from '@oclif/command';
import inquirer from 'inquirer';
import Command from '../../../lib/command';
import { createSuffix } from '../../../common/utils';

export default class Promote extends Command {
  public static description = 'Adds and existing service to your project';

  public static args = [
    { name: 'serviceId', description: 'Id of the service' },
  ];

  public static flags = {
    'project-id': flags.integer({
      required: true,
      name: 'Project ID',
      description: 'Id of the project',
    }),
  };

  public async execute(): Promise<void> {
    const { flags: { 'project-id': projectId }, args: { serviceId } } = this.parse(Promote);

    const { targetEnvironment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetEnvironment',
        message: 'Please select the environment',
        choices: [
          'development',
          'staging',
          'production',
        ],
      },
    ]);

    const promoteData = {
      projectId,
      serviceId: +serviceId,
      targetEnvironment,
    };

    const { data: { promoteServiceInProject } } = await this.codestore.Project.promoteService(promoteData);

    this.log(`Updated ${targetEnvironment} in project ${projectId}, deployment: ${promoteServiceInProject.id}`);
  }
}
