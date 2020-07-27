import Command from '../../lib/command';

export default class Promote extends Command {
  public static description = 'Promotes service from private env to demo';

  public static args = [
    { name: 'service_id', description: 'ID of the service (optional, if you\'re inside service folder)' },
  ];

  public async execute(): Promise<void> {
    let { args: { service_id: serviceId } } = this.parse(Promote);

    if (!serviceId) {
      serviceId = (await this.serviceWorker.loadValuesFromYaml()).serviceId;
    }

    await this.codestore.Service.promote(serviceId);

    this.log(`Successfully promoted service with id ${serviceId} to demo environment`);
  }
}
