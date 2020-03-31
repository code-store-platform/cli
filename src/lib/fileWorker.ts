import { join } from 'path';
import { homedir } from 'os';
import {
  mkdirSync, readdirSync, readFileSync, writeFileSync,
} from 'fs';

export default class FileWorker {
  private homePath = join(homedir(), '.codestore');

  constructor() {
    if (!this.checkHomeFolder()) {
      this.createHomeFolder();
    }
  }

  get getHomePath():string {
    return this.homePath;
  }

  get credentialsPath():string {
    const files = readdirSync(this.homePath);
    const credentialsFile = files.find((file) => file === 'credentials');

    if (!credentialsFile) {
      writeFileSync(this.credentialsPath, '');
    }

    return join(this.homePath, 'credentials');
  }

  public checkHomeFolder() {
    const folders = readdirSync(homedir());
    const codestoreFolder = folders.find((folder) => folder === '.codestore');

    return !!codestoreFolder;
  }

  public createHomeFolder():void {
    mkdirSync(this.homePath);
  }

  public saveToken(token:string) {
    if (!this.checkHomeFolder()) {
      this.createHomeFolder();
    }
    return writeFileSync(join(this.homePath, 'credentials'), token);
  }

  public removeToken():void{
    return writeFileSync(this.credentialsPath, '');
  }

  public getToken():string {
    return readFileSync(this.credentialsPath).toString();
  }
}
