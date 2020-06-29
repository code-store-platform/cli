import { flags } from '@oclif/command';
import { yellow } from 'chalk';
import { Listr } from 'listr2';
import Command from '../../../lib/command';

export default class Add extends Command {
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
    const { flags: { 'project-id': projectId }, args: { serviceId } } = this.parse(Add);

    await new Listr<{}>([{
      title: `Including  service with id "${yellow(serviceId)}" to project "${yellow(projectId)}"`,
      task: async (ctx, task): Promise<void> => {
        const { data: { includeService: { status } } } = await this.codestore.Project.includeService(projectId, serviceId);
        // eslint-disable-next-line no-param-reassign
        task.title = `Service "${yellow(serviceId)}" is included to project "${yellow(projectId)}", status: ${status}.`;
      },
    }]).run();
  }
}
