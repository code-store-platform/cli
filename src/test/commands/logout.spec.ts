import Logout from '../../commands/auth/logout';

describe('Logout', () => {
  let command: Logout;

  const codestore = {
    logout: () => true,
  };

  beforeAll(async () => {
    command = new Logout([], []);

    Object.assign(command, {
      _codestore: codestore,
    });
  });

  it('Should print that user was logged out', async (done) => {
    const spy = jest.spyOn(codestore, 'logout');

    await command.run();

    expect(spy).toHaveBeenCalled();

    done();
  });
});
