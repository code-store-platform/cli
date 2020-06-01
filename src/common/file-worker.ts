import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import { zip } from 'zip-a-folder';
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
    await zip('./', 'temp.zip');

    const buffer = await PromisifiedFs.readFile('temp.zip');

    await PromisifiedFs.unlink('temp.zip');

    return buffer.toString('base64');
  }
}
