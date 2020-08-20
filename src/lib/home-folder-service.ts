import { join } from 'path';
import { homedir } from 'os';
import {
  mkdir, readdir, readFile, writeFile, stat, access,
} from 'fs';
import { promisify } from 'util';
import HomeFileNames from '../common/constants/home.file.names';
import HomeFolderNames from '../common/constants/home.folder.names';

export default class HomeFolderService {
  private homePath = join(homedir(), HomeFolderNames.CODESTORE);

  private credentialsPath = join(this.homePath, HomeFileNames.CREDENTIALS);

  private fs = {
    mkdir: promisify(mkdir),
    readdir: promisify(readdir),
    readFile: promisify(readFile),
    writeFile: promisify(writeFile),
    stat: promisify(stat),
    access: promisify(access),
  };

  private async isHomeFolderExists(): Promise<boolean> {
    try {
      const stats = await this.fs.stat(this.homePath);
      return stats.isDirectory();
    } catch (e) {
      return false;
    }
  }

  private async createHomeFolder(): Promise<void> {
    await this.fs.mkdir(this.homePath);
    await this.writeFileInHomeFolder('credentials', '');
  }

  private async writeFileInHomeFolder(filename: string, data: string): Promise<void> {
    const path = join(this.homePath, filename);
    return this.fs.writeFile(path, data);
  }

  public async saveToken(token: string): Promise<void> {
    if (!await this.isHomeFolderExists()) {
      await this.createHomeFolder();
    }
    return this.writeFileInHomeFolder(HomeFileNames.CREDENTIALS, token);
  }

  public async removeToken(): Promise<void> {
    if (!await this.isHomeFolderExists()) {
      await this.createHomeFolder();
    }
    return this.writeFileInHomeFolder(HomeFileNames.CREDENTIALS, '');
  }

  public async getToken(): Promise<string> {
    if (!await this.isHomeFolderExists()) {
      throw new Error('Please login.');
    }

    const data = await this.fs.readFile(this.credentialsPath);

    return data.toString().replace(/\n$/, '');
  }
}
