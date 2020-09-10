import archiver from 'archiver';
import { WriteStream, createWriteStream } from 'fs';
import { PromisifiedFs } from 'codestore-utils';
import { join } from 'path';

export default class Archiver {
  private readonly zipName = 'temporaryUpload.zip';

  private excludeFiles = ['node_modules', '.DS_Store', this.zipName, 'dist'];

  private archive: archiver.Archiver;

  private output: WriteStream;

  private absolutePath: string;

  public constructor(private readonly path: string) {
    this.absolutePath = join(this.path, this.zipName);
    this.archive = archiver('zip', { zlib: { level: 9 } });
    this.output = createWriteStream(this.absolutePath);
  }

  public async zipFiles(exclude?: string[]): Promise<string> {
    if (exclude) {
      this.excludeFiles = [...this.excludeFiles, ...exclude];
    }
    await this.addItems();
    await this.archive.finalize();

    return new Promise((resolve, reject) => {
      this.output.on('error', (error) => reject(error));
      this.output.on('close', () => resolve(this.absolutePath));
      this.archive.pipe(this.output);
    });
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
