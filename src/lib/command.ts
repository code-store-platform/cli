import { Command as Base } from '@oclif/command';
import { APIClient } from './api-client';

const pjson = require('../../package.json');

export abstract class Command extends Base {
  base = `${pjson.name}@${pjson.version}`;

  _codestore!: APIClient;

  get codestore(): APIClient {
    return this._codestore;
  }
}
