import { yellow } from 'chalk';
import Command from '../../../lib/command';
import { projectServiceEnvironments } from '../../../common/constants/environment.enum';
import * as ServiceInfo from '../../service/info';

export default class Info extends Command {
  public static description = 'Displays detailed information about project\'s service';

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args } = this.parse(Info);

    const project = await this.chooseProject(args, 'Choose which project you want to display information about');
    if (!project) return;
    const { services } = await this.codestore.Project.single(project.id, true);
    if (!services?.length) {
      this.log(`There are no services in the project yet, try adding one using ${yellow('codestore project:service:add')} command.`);
      return;
    }
    const service = await this.chooseService(args, 'Choose which service you want to display information about', services);
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
}
