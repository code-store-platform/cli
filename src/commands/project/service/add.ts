import { flags } from '@oclif/command';
import { yellow } from 'chalk';
import Command from '../../../lib/command';

export default class Add extends Command {
  static description = 'Include service to project';

  static args = [
    { name: 'serviceId', description: 'Id of the service' },
  ];

  static flags = {
    'project-id': flags.integer({
      required: true,
      name: 'Project ID',
      description: 'Id of the project',
    }),
  };

  async execute() {
    const { flags: { 'project-id': projectId }, args: { serviceId } } = this.parse(Add);

    const { data: { includeService: { status } } } = await this.codestore.Project.includeService(projectId, serviceId);
    this.log(`Service "${yellow(serviceId)}" is included to project "${yellow(projectId)}", status: ${status}.`);
  }
}
