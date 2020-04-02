import { Command as Base } from '@oclif/command';
import APIClient from './api-client';

const pjson = require('../../package.json');

export abstract class Command extends Base {
  base = `${pjson.name}@${pjson.version}`;

  _codestore!: APIClient;

  constructor(argv:any, config:any) {
    super(argv, config);
    this._codestore = new APIClient();
  }

  get codestore(): APIClient {
    return this._codestore;
  }

  abstract execute():PromiseLike<any>;

  // do not override this method because it uses execute method to provide base erorr handling logic.
  async run() {
    try {
      await this.execute();
    } catch (e) {
      this.error(e.message);
    }
  }
}
