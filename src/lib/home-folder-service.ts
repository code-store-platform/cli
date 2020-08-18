import { join } from 'path';
import { homedir } from 'os';
import { PromisifiedFs } from 'codestore-utils';
import HomeFileNames from '../common/constants/home.file.names';
import HomeFolderNames from '../common/constants/home.folder.names';
import { NotAuthorizedError } from './errors';

export default class HomeFolderService {
  private homePath = join(homedir(), HomeFolderNames.CODESTORE);

  private credentialsPath = join(this.homePath, HomeFileNames.CREDENTIALS);

  private fs = PromisifiedFs;

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
      throw new NotAuthorizedError();
    }
    return this.writeFileInHomeFolder(HomeFileNames.CREDENTIALS, '');
  }

  public async getToken(): Promise<string> {
    if (!await this.isHomeFolderExists() || await this.isTokenFileEmpty()) {
      throw new NotAuthorizedError();
    }

    const data = await this.fs.readFile(this.credentialsPath);

    return data.toString().replace(/\n$/, '');
  }

  private async isTokenFileEmpty(): Promise<boolean> {
    try {
      const stats = await this.fs.stat(this.credentialsPath);
      if (!stats.isFile()) return true;

      const f = await this.fs.readFile(this.credentialsPath);
      return f.toString() === '';
    } catch (e) {
      return false;
    }
  }
}
