import Login from '../../commands/auth/login';

describe('Logout', () => {
  let command: Login;

  const codestore = {
    loginWeb: (a, b) => true,
  };

  beforeAll(async () => {
    command = new Login([], []);

    Object.assign(command, {
      _codestore: codestore,
    });
  });

  it('Should print that user was logged in', async () => {
    const spy = jest.spyOn(codestore, 'loginWeb');
    const spyStdout = jest.spyOn(process.stdout, 'write');

    await command.run();

    expect(spy).toHaveBeenCalled();
    expect(spyStdout).toHaveBeenCalled();
  });
});
