import { IConfig } from '@oclif/config';
import Logout from '../../commands/auth/logout';

describe('Logout', () => {
  let command: Logout;

  const codestore = {
    logout: (): boolean => true,
  };

  beforeAll(async () => {
    command = new Logout([], {} as IConfig);

    Object.defineProperty(command, 'codestore', {
      get: () => codestore,
    });
  });

  it('Should print that user was logged out', async (done) => {
    const spy = jest.spyOn(codestore, 'logout');

    await command.run();

    expect(spy).toHaveBeenCalled();

    done();
  });
});
