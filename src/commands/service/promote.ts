import Command from '../../lib/command';
import Aliases from '../../common/constants/aliases';

export default class Promote extends Command {
  public static description = 'Promotes service from private env to demo';

  public static aliases = [Aliases.PULL];

  public static args = [
    { name: 'id' },
  ];

  private async getServiceId(args): Promise<{serviceId: number}> {
    if (args.id) {
      return { serviceId: +args.id };
    }
    return this.serviceWorker.loadValuesFromYaml();
  }

  public async execute(): Promise<void> {
    const { args } = this.parse(Promote);

    const { serviceId } = await this.getServiceId(args);

    await this.codestore.Service.promote(serviceId);

    this.log(`Successfully promoted service with id ${serviceId} to demo environment`);
  }
}
