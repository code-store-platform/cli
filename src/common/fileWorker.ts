import { writeFile, createReadStream, unlink } from 'fs';
import { promisify } from 'util';
import * as unzipper from 'unzipper';

export default class FileWorker {
  static async saveZipFromB64(data: string, folderName: string): Promise<void> {
    const buffer = Buffer.from(data, 'base64');

    await promisify(writeFile)('temp.zip', buffer);

    await createReadStream('temp.zip')
      .pipe(unzipper.Extract({ path: folderName }))
      .promise();

    await promisify(unlink)('temp.zip');
  }
}
