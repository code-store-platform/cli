import * as Express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';
import axios from 'axios';
import authEmitter from './emitter';
import config from '../../config';

const app = Express();

app.use('/', async (req: Request, res: Response, next: any) => {
  try {
    const addr = `${config.authApiUrl}${req.url}`;
    const { data: { token } } = await axios.get(addr);
    authEmitter.emit('auth', {
      success: true,
      token,
    });
    // todo add redirect to code store success page.
    res.send('success');
  } catch (e) {
    authEmitter.emit('auth', {
      success: false,
      error: e.message,
    });
    res.send('error');
    throw e;
  }
});

export default createServer(app);
