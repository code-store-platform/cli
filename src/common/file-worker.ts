import { createReadStream, createWriteStream } from 'fs';
import * as unzipper from 'unzipper';
import { zip } from 'zip-a-folder';
import * as archiver from 'archiver';
import PromisifiedFs from './promisified-fs';

export default class FileWorker {
  public static async saveZipFromB64(data: string, folderName: string): Promise<void> {
    const buffer = Buffer.from(data, 'base64');

    await PromisifiedFs.writeFile('temp.zip', buffer);

    await createReadStream('temp.zip')
      .pipe(unzipper.Extract({ path: folderName }))
      .promise();

    await PromisifiedFs.unlink('temp.zip');
  }

  public static async zipFolder(): Promise<string> {
    const archive = archiver('zip', {});

    const stream = createWriteStream('temp.zip');

    archive.pipe(stream);

    const filesAndFolders = await PromisifiedFs.readdir(process.cwd());

    const result = filesAndFolders.map(async (item) => {
      if (['node_modules', '.DS_Store', 'temp.zip'].find((element) => element === item)) {
        return;
      }

      const stat = await PromisifiedFs.stat(item);

      if (stat.isFile()) {
        archive.file(item, { name: item });
      } else {
        archive.directory(item, item);
      }
    });

    await Promise.all(result);

    await archive.finalize();

    const buffer = await PromisifiedFs.readFile('temp.zip');

    await PromisifiedFs.unlink('temp.zip');

    return buffer.toString('base64');
  }
}
