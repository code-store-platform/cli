import { flags } from '@oclif/command';
import { yellow, blue } from 'chalk';
import Command from '../../../lib/command';
import { projectServiceEnvironments } from '../../../common/constants/environment.enum';
import * as ServiceInfo from '../../service/info';
import IProject from '../../../interfaces/project.interface';
import IService from '../../../interfaces/service.interface';

export default class Info extends Command {
  public static description = 'Displays detailed information about project\'s service';

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public static flags = {
    project: flags.string({
      char: 'p',
      description: 'ID of the project',
    }),
    service: flags.string({
      char: 's',
      description: 'ID of the service',
    }),
  };

  public async execute(): Promise<void> {
    const { args, flags: flagsData } = this.parse(Info);
    let project: IProject | undefined;
    let service: IService | undefined;

    if (Object.keys(flagsData).length) {
      const data = await this.validateFlags(Info.flags, flagsData);
      project = await this.findProject(data.project);
      if (!project) {
        this.error(`Project with id ${blue(data.project)} does not exist`);
      }
      const { services } = await this.codestore.Project.single(project.id, true);
      if (!services?.length) {
        this.log(`There are no services in the selected project. Try to add a new one using ${yellow('codestore project:service:add')} command.`);
        return;
      }
      service = await this.findService(data.service, services);
      if (!service) {
        this.error(`Service with id ${blue(data.service)} does not exist`);
      }
    } else {
      project = await this.chooseProject(args, 'Choose which project you want to display information about');
      if (!project) return;
      const { services } = await this.codestore.Project.single(project.id, true);
      if (!services?.length) {
        this.log(`There are no services in the selected project. Try to add a new one using ${yellow('codestore project:service:add')} command.`);
        return;
      }
      service = await this.chooseService(args, 'Choose which service you want to display information about', services);
    }
    if (!service) return;

    const deployments = await this.codestore.Deployment.getDeploymentsForProjectService(project.id, service.id);
    const deploymentTo = ServiceInfo.deploymentsToEnvironments(deployments, projectServiceEnvironments);

    const createRows = (fields: ServiceInfo.Field[]): ServiceInfo.CreateRowResult[] => fields.map(({ name, resolve }) => {
      const result = { name };
      projectServiceEnvironments.forEach((environment) => {
        if (deploymentTo[environment]) {
          result[environment] = resolve(deploymentTo[environment]!);
        }
      });
      return result;
    });

    this.renderTable(createRows(ServiceInfo.getFieldResolvers()), ServiceInfo.createColumns(projectServiceEnvironments, deploymentTo));
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
    };
  }
}
