import { flags } from '@oclif/command';
import { yellow } from 'chalk';
import { Listr } from 'listr2';
import Command from '../../../lib/command';

export default class Remove extends Command {
  public static description = 'Exclude service from project';

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
    const { flags: { 'project-id': projectId }, args: { serviceId } } = this.parse(Remove);

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
