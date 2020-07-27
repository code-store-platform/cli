import { yellow } from 'chalk';
import { Listr } from 'listr2';
import Command from '../../../lib/command';

export default class Remove extends Command {
  public static description = 'Exclude service from project. ⚠️  This is a potentially destructive operation that might result in a loss of data.';

  public static args = [
    { name: 'project_id', required: true, description: '(required) ID of the project' },
    { name: 'service_id', required: true, description: '(required) ID of the service' },
  ];

  public async execute(): Promise<void> {
    let { args: { project_id: projectId, service_id: serviceId } } = this.parse(Remove);
    projectId = Number(projectId);
    serviceId = Number(serviceId);

    await new Listr<{}>([{
      title: `Excluding service with id "${yellow(serviceId)}" from project "${yellow(projectId)}"`,
      task: async (ctx, task): Promise<void> => {
        const { data: { excludeService: { status } } } = await this.codestore.Project.excludeService(projectId, serviceId);
        // eslint-disable-next-line no-param-reassign
        task.title = `Service "${yellow(serviceId)}" has been removed from project "${yellow(projectId)}", status: ${status}.`;
      },
    }]).run();
  }
}
