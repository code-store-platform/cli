import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import PromisifiedFs from './promisified-fs';
import Archiver from './zip-tool';

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
    const archiver = new Archiver(process.cwd());

    const pathToZip = await archiver.zipFiles();

    const buffer = await PromisifiedFs.readFile(pathToZip);

    await PromisifiedFs.unlink(pathToZip);

    return buffer.toString('base64');
  }
}
