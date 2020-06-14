import * as archiver from 'archiver-promise';
import { join } from 'path';
import PromisifiedFs from './promisified-fs';

export default class Archiver {
  private readonly zipName = 'temporaryUpload.zip';

  private excludeFiles = ['node_modules', '.DS_Store', this.zipName];

  private archive;

  public constructor(private readonly path: string) {
    this.archive = archiver(this.zipName, { zlib: { level: 9 } });
  }

  public async zipFiles(exclude?: string[]): Promise<string> {
    if (exclude) {
      this.excludeFiles = [...this.excludeFiles, ...exclude];
    }
    await this.addItems();
    await this.archive.finalize();

    return join(this.path, this.zipName);
  }

  private async addItems(): Promise<void> {
    const filesAndFolders = await PromisifiedFs.readdir(process.cwd());

    const result = filesAndFolders.map(async (item) => {
      if (this.excludeFiles.find((element) => element === item)) {
        return;
      }

      const stat = await PromisifiedFs.stat(item);

      if (stat.isFile()) {
        this.archive.file(item, { name: item });
      } else {
        this.archive.directory(item, item);
      }
    });

    await Promise.all(result);
  }
}
