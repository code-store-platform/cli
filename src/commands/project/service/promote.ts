import inquirer from 'inquirer';
import { bold, blue } from 'chalk';
import Command from '../../../lib/command';
import EnvironmentEnum from '../../../common/constants/environment.enum';

export default class Promote extends Command {
  public static description = 'Promotes service inside the project between Development, Stating and Production environments.\nRun without arguments to select project and service from a list.';

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args } = this.parse(Promote);

    const project = await this.chooseProject(args, 'Choose a project you want to promote to');
    if (!project) return;
    const projectUniqueName = project.uniqueName;

    const service = await this.chooseService(args, 'Choose a service which you want to promote');
    if (!service) return;
    const serviceUniqueName = service.uniqueName;

    this.log(); // print a blank line

    const { targetEnvironment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetEnvironment',
        message: 'Please select the environment',
        choices: [
          EnvironmentEnum.DEVELOPMENT,
          EnvironmentEnum.STAGING,
          EnvironmentEnum.PRODUCTION,
        ],
      },
    ]);

    try {
      await this.codestore.Project.promoteServiceByUniqueName({
        projectUniqueName,
        serviceUniqueName,
        targetEnvironment,
      });

      this.log(`Updated "${bold(targetEnvironment)}" in project ${blue(projectUniqueName)}`);
    } catch (error) {
      if (error.message.match(/is up to date/)) {
        this.log(`\n"${bold(targetEnvironment)}" environment of service ${blue(serviceUniqueName)} is up to date`);
      }
    }
  }
}
