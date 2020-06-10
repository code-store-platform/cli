import { flags } from '@oclif/command';
import { yellow } from 'chalk';
import Command from '../../../lib/command';

export default class Remove extends Command {
  static description = 'Exclude service from project';

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
    const { flags: { 'project-id': projectId }, args: { serviceId } } = this.parse(Remove);

    const { data: { includeService: { status } } } = await this.codestore.Project.excludeService(projectId, serviceId);
    this.log(`Service "${yellow(serviceId)}" has been removed from project "${yellow(projectId)}", status: ${status}.`);
  }
}
