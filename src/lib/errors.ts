/* eslint-disable max-classes-per-file */
import { yellow } from 'chalk';

export class BaseCodestoreError extends Error {
}

export class WrongFolderError extends BaseCodestoreError {
}

export class NotAuthorizedError extends BaseCodestoreError {
  public constructor() {
    super(`Seems that you're not logged in. Please execute ${yellow(' codestore login ')} command to sign-in again.`);
  }
}
