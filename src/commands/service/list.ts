import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';
import { IService } from '../../interfaces/service.interface';
import Environments from '../../common/constants/env.enum';

export default class List extends Command {
  public static description = 'List services in your organization';

  public static aliases = [Aliases.SERVICE_LS];

  private transformService(service: IService): {
    id: string;
    name: string;
    status: string;
    private: string;
    demo: string;
  } {
    const {
      displayName,
      status,
      uniqueName,
      deployments,
      id,
    } = service;

    const privateDeployment = deployments?.find((deployment) => deployment.environment.name === Environments.PRIVATE);
    const demoDeployment = deployments?.find((deployment) => deployment.environment.name === Environments.DEMO);

    return {
      id: uniqueName,
      name: displayName,
      status,
      private: this.createEndpoint(privateDeployment, id, 'private'),
      demo: this.createEndpoint(demoDeployment, id, 'demo'),
    };
  }

  public async execute(): Promise<void> {
    const services = await this.codestore.Service.list(true)
      .then((serviceList) => serviceList.map(((service) => this.transformService(service))));

    if (!services.length) {
      this.log('You don\'t have any services yet. Try creating one by running `codestore service:create`.');
      return;
    }

    this.renderTable(services, {
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
