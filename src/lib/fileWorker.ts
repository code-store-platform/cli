import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, readdirSync, writeFileSync } from 'fs';

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
}
