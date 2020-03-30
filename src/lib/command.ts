import { Command as Base } from '@oclif/command';
import { readFileSync, writeFileSync } from 'fs';
import APIClient from './api-client';
import FileWorker from './fileWorker';

const pjson = require('../../package.json');

export abstract class Command extends Base {
  base = `${pjson.name}@${pjson.version}`;

  _codestore!: APIClient;

  _fileWorker!: FileWorker;

  constructor(argv:any, config:any) {
    super(argv, config);
    this._codestore = new APIClient();
    this._fileWorker = new FileWorker();
  }

  get codestore(): APIClient {
    return this._codestore;
  }

  get token(): string {
    return readFileSync(this._fileWorker.credentialsPath).toString();
  }

  get homeFolderService(): FileWorker {
    return this._fileWorker;
  }

  saveToken(token:string) {
    return writeFileSync(this._fileWorker.credentialsPath, token);
  }
}
