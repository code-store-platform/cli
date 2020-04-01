import { Command as Base } from '@oclif/command';
import APIClient from './api-client';
import HomeFolderService from './homeFolderService';

const pjson = require('../../package.json');

export abstract class Command extends Base {
  base = `${pjson.name}@${pjson.version}`;

  _codestore!: APIClient;

  _fileWorker!: HomeFolderService;

  constructor(argv:any, config:any) {
    super(argv, config);
    this._codestore = new APIClient();
    this._fileWorker = new HomeFolderService();
  }

  get codestore(): APIClient {
    return this._codestore;
  }

  get token(): string {
    return this._fileWorker.getToken();
  }
}
