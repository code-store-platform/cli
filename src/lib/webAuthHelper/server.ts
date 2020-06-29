import Express, { Request, Response } from 'express';
import { createServer } from 'http';
import authEmitter from './emitter';

const app = Express();

/*
 We are using this express application to handle redirect and get user token from auth service.
 */
app.use('/', async (req: Request, res: Response) => {
  const { token, error } = req.query;

  // we have to emit emitter to close server, so CLI is able to end the process
  if (token) {
    authEmitter.emit('auth', {
      success: true,
      token,
    });
  } else {
    authEmitter.emit('auth', {
      success: false,
      error,
    });
  }
  // todo replace with code.store login success page
  res.redirect('https://app.codestore.dev/cli');
});

export default createServer(app);
