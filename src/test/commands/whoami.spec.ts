import { IConfig } from '@oclif/config';
import Whoami from '../../commands/auth/whoami';
import IUser from '../../interfaces/user.interface';

describe('Who Am I', () => {
  let command: Whoami;

  const userExample: IUser = {
    email: 'test@user.com',
    firstName: 'Test',
    id: 1,
    lastName: 'TEST',
  };


  beforeAll(async () => {
    command = new Whoami([], {} as IConfig);

    Object.defineProperty(command, 'codestore', {
      get: jest.fn(() => ({
        getMe: async (): Promise<IUser> => userExample,
      })),
    });
  });

  beforeEach(() => {
  });

  it('Should print user email', async () => {
    const spy = jest.spyOn(process.stdout, 'write');
    await command.run();
    expect(spy).toHaveBeenCalledWith('test@user.com\n');
  });
});
