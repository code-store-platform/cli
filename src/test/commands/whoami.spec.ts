import Whoami from '../../commands/auth/whoami';
import IUser from '../../interfaces/user.interface';

describe('Who Am I', () => {
  let command: Whoami;

  const userExample: IUser = {
    email: 'test@user.com',
    firstName: 'Test',
    id: 1,
    lastName: 'User',
  };

  const codestore = {
    getMe: async () => userExample,
  };

  beforeAll(async () => {
    command = new Whoami([], []);

    Object.assign(command, {
      _codestore: codestore,
    });
  });

  it('Should print user email', async () => {
    const spy = jest.spyOn(process.stdout, 'write');
    await command.run();
    expect(spy).toHaveBeenCalledWith('test@user.com\n');
  });
});
