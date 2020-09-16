import { flags } from '@oclif/command';
import inquirer from 'inquirer';
import { bold, blue } from 'chalk';
import Command from '../../../lib/command';
import EnvironmentEnum, { projectServiceEnvironments } from '../../../common/constants/environment.enum';
import IProject from '../../../interfaces/project.interface';
import IService from '../../../interfaces/service.interface';

export default class Promote extends Command {
  public static description = 'Promotes service inside the project between Development, Stating and Production environments.\nRun without arguments to select project and service from a list.';

  public static flags = {
    project: flags.string({
      char: 'p',
      description: 'ID of the project',
    }),
    service: flags.string({
      char: 's',
      description: 'ID of the service',
    }),
    targetEnvironment: flags.string({
      char: 'e',
      description: 'Target environment',
    }),
  };

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args, flags: flagsData } = this.parse(Promote);
    let project: IProject | undefined;
    let service: IService | undefined;
    let targetEnvironment: EnvironmentEnum;

    if (Object.keys(flagsData).length) {
      const data = await this.validateFlags(Promote.flags, flagsData);
      project = await this.findProject(data.project);
      if (!project) {
        this.error(`Project with id ${blue(data.project)} does not exist`);
      }
      service = await this.findService(data.service);
      if (!service) {
        this.error(`Service with id ${blue(data.service)} does not exist`);
      }
      targetEnvironment = data.targetEnvironment as EnvironmentEnum;
    } else {
      project = await this.chooseProject(args, 'Choose a project you want to promote to');
      if (!project) return;
      service = await this.chooseService(args, 'Choose a service which you want to promote');
      if (!service) return;
      targetEnvironment = (await inquirer.prompt([
        {
          type: 'list',
          name: 'targetEnvironment',
          message: 'Please select the environment',
          choices: projectServiceEnvironments,
        },
      ])).targetEnvironment;
    }

    const projectUniqueName = project.uniqueName;
    const serviceUniqueName = service.uniqueName;

    this.log(); // print a blank line

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

  // eslint-disable-next-line class-methods-use-this
  public get rules(): { [key: string]: (value: any) => string | boolean } {
    return {
      service: (value): string | boolean => {
        if (!value) {
          return 'ID of the service is required';
        }
        return true;
      },
      project: (value): string | boolean => {
        if (!value) {
          return 'ID of the project is required';
        }
        return true;
      },
      targetEnvironment: (value): string | boolean => {
        if (!value || !projectServiceEnvironments.includes(value)) {
          return `Target environment should be one of: ${projectServiceEnvironments.join(', ')}`;
        }
        return true;
      },
    };
  }
}
