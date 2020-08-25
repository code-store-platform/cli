import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import EnvironmentEnum from '../../common/constants/environment.enum';
import { IDeployment } from '../../interfaces/deployment.interface';

export default class List extends Command {
  public static description = 'List services in your organization';

  public static aliases = [Aliases.SERVICE_LS];

  public async execute(): Promise<void> {
    const services = await this.codestore.Service.list();
    if (!services.length) {
      this.log('You don\'t have any services yet. Try creating one by running `codestore service:create`.');
      return;
    }

    const deployments = await this.codestore.Deployment.getDeploymentsForServices(services.map(({ id }) => id));

    const findServiceDeployment = (serviceId: number, environment: EnvironmentEnum): IDeployment | undefined => deployments
      .find((d) => d.serviceId === serviceId && d.environment.name === environment);

    const rows = services.map((service) => {
      const privateDeployment = findServiceDeployment(service.id, EnvironmentEnum.PRIVATE);
      const demoDeployment = findServiceDeployment(service.id, EnvironmentEnum.DEMO);

      return {
        id: service.uniqueName,
        name: service.displayName,
        // todo update when resolvers for deployments is ready
        private: privateDeployment && Command.getServiceUrl(privateDeployment),
        demo: demoDeployment && Command.getServiceUrl(demoDeployment),
        status: service.status,
      };
    });

    this.renderTable(rows, {
      id: {
        header: 'Service ID',
      },
      name: {},
      private: {},
      demo: {},
      status: {},
    });
  }
}
