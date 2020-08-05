import inquirer from 'inquirer';
import { yellow, bold, blue } from 'chalk';
import Command from '../../../lib/command';
import { createPrefix } from '../../../common/utils';

export default class Promote extends Command {
  public static description = 'Promotes service inside the project between Development, Stating and Production environments.\nRun without arguments to select project and service from a list.';

  public static args = [
    { name: 'project_id', description: 'ID of the project' },
    { name: 'service_id', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    let { args: { project_id: projectUniqueName, service_id: serviceUniqueName } } = this.parse(Promote);

    if (!projectUniqueName) {
      const projects = await this.codestore.Project.list();
      const pmap = new Map(projects.map((p) => [
        `${p.uniqueName}\t${p.description}`,
        p.uniqueName,
      ]));

      if (!projects.length) {
        this.log(`There are no projects yet, try creating one using ${yellow(' codestore project:create ')} command.`);
        return;
      }

      const { project } = await inquirer.prompt<{project: string}>([
        {
          type: 'list',
          name: 'project',
          message: 'Project:',
          prefix: createPrefix('Choose a project you want to promote to'),
          choices: Array.from(pmap).map((it) => it[0]),
        },
      ]);

      projectUniqueName = pmap.get(project)!;
    }

    if (!serviceUniqueName) {
      const services = await this.codestore.Service.list();
      const smap = new Map(services.map((s) => [
        `${s.uniqueName}\t${s.problemSolving}`,
        s.uniqueName,
      ]));

      if (!services.length) {
        this.log(`There are no services yet, try creating one using ${yellow(' codestore service:create ')} command.`);
        return;
      }

      const { service } = await inquirer.prompt<{service: string}>([
        {
          type: 'list',
          name: 'service',
          message: 'Service:',
          prefix: createPrefix('Choose a service which you want to promote'),
          choices: Array.from(smap).map((it) => it[0]),
        },
      ]);

      serviceUniqueName = smap.get(service)!;
    }

    this.log(); // print a blank line

    const { targetEnvironment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetEnvironment',
        message: 'Please select the environment',
        choices: [
          'development',
          'staging',
          'production',
        ],
      },
    ]);

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
}
