import { createReadStream } from 'fs';
import * as unzipper from 'unzipper';
import PromisifiedFs from './promisifiedFs';

export default class FileWorker {
  static async saveZipFromB64(data: string, folderName: string): Promise<void> {
    const buffer = Buffer.from(data, 'base64');

    await PromisifiedFs.writeFile('temp.zip', buffer);

    await createReadStream('temp.zip')
      .pipe(unzipper.Extract({ path: folderName }))
      .promise();

    await PromisifiedFs.unlink('temp.zip');
  }
}
