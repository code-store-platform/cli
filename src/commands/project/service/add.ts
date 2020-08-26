import { blue, bold } from 'chalk';
import { Listr } from 'listr2';
import inquirer from 'inquirer';
import Command from '../../../lib/command';
import { createPrefix } from '../../../common/utils';
import ProjectServiceBillingDetails from '../../../common/constants/project-service-billing-details.enum';

export default class Add extends Command {
  public static description = 'Adds and existing service to your project';

  public static args = [
    { name: 'projectArg', description: 'ID of the project' },
    { name: 'serviceArg', description: 'ID of the service' },
  ];

  public async execute(): Promise<void> {
    const { args } = this.parse(Add);

    const project = await this.chooseProject(args, 'Choose a project you want to add to');
    if (!project) return;
    const projectUniqueName = project.uniqueName;

    const service = await this.chooseService(args, 'Choose a service which you want to add');
    if (!service) return;
    const serviceUniqueName = service.uniqueName;

    let billingDetails = ProjectServiceBillingDetails.NOT_BILLABLE;

    const { wantToBill } = await inquirer.prompt({
      type: 'confirm',
      name: 'wantToBill',
      message: 'Enable billing:',
      prefix: createPrefix('Would you like to enable billing for your service?'),
    });

    if (wantToBill) {
      const userFriendlyBillingPlans = {
        'Pay Per Call': ProjectServiceBillingDetails.PAY_PER_CALL,
        'Monthly payments': ProjectServiceBillingDetails.MONTHLY,
      };
      const { howToBill } = await inquirer.prompt({
        type: 'list',
        name: 'howToBill',
        message: 'Billing plan:',
        choices: Object.keys(userFriendlyBillingPlans),
        prefix: createPrefix('Choose a billing plan for your service'),
      });
      billingDetails = userFriendlyBillingPlans[howToBill];
    }

    await new Listr<{}>([{
      title: `Including service with id ${blue(serviceUniqueName)} to project ${blue(projectUniqueName)}`,
      task: async (ctx, task): Promise<void> => {
        try {
          const { status } = await this.codestore.Project.includeServiceByUniqueName(projectUniqueName, serviceUniqueName, billingDetails);
          // eslint-disable-next-line no-param-reassign
          task.title = `Service ${blue(serviceUniqueName)} is included to project ${blue(projectUniqueName)}\nStatus: ${bold(status)}`;
        } catch (error) {
          if (error.message.match(/already includes/)) { // TODO: should be changed to error status code check later, when backend will support it.
            // eslint-disable-next-line no-param-reassign
            task.title = `Project ${blue(projectUniqueName)} already includes service ${blue(serviceUniqueName)}`;
          } else throw error;
        }
      },
    }]).run();
  }
}
