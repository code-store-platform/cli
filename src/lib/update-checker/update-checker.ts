import chalk from 'chalk';
import isInstalledGlobally from 'is-installed-globally';
import hasYarn from 'has-yarn';
import isYarnGlobal from 'is-yarn-global';
import boxen from 'boxen';
import isCi from 'is-ci';
import { PromisifiedFs } from 'codestore-utils';
import semverDiff from 'semver-diff';
import { spawn } from 'child_process';
import path from 'path';
import UpdateCheckerConstants from '../../common/constants/update-checker';

const debug = require('debug')('update-checker:class');

export default class UpdateChecker {
  public latestVersion: string;

  public constructor(private readonly versionFilePath: string, public readonly currentVersion: string) {
    this.latestVersion = currentVersion;
  }

  public async check(): Promise<void> {
    try {
      debug('checking the updates');
      if (process.argv[2] === 'update' || process.env.NODE_ENV === 'test' || isCi || !process.stdout.isTTY) return;

      debug(`reading local version file ${this.versionFilePath}`);
      const localDistTags = JSON.parse(await PromisifiedFs.readFile(this.versionFilePath, 'utf8'));
      this.latestVersion = localDistTags.latest;
      const versionDiff = semverDiff(this.currentVersion, this.latestVersion) as string;
      if (versionDiff && versionDiff !== 'latest') {
        this.notify();
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    if (await this.refreshNeeded()) await this.spawnRefresh();
  }

  private async refreshNeeded(): Promise<Boolean> {
    try {
      const { mtime } = await PromisifiedFs.stat(this.versionFilePath);
      const staleAt = new Date(mtime.valueOf() + (1000 * 60 * 60 * UpdateCheckerConstants.TIMEOUT_IN_HOURS));
      return staleAt < new Date();
    } catch (error) {
      debug(error);
      return true;
    }
  }

  private async spawnRefresh(): Promise<void> {
    debug('spawning a detached process, passing options as env arguments');
    debug(`spawning at: ${path.join(__dirname, '../../lib/update-checker/get-version')}`);
    spawn(
      process.execPath,
      [path.join(__dirname, '../../lib/update-checker/get-version'), this.versionFilePath, this.currentVersion],
      {
        detached: true,
        windowsHide: true,
        stdio: 'ignore',
      },
    ).unref();
  }

  private notify(): void {
    let installMsg;

    // TODO: check for standalone & brew installation methods
    if (isYarnGlobal()) {
      installMsg = `Run ${chalk.cyan('yarn global add codestore')}`;
    } else if (isInstalledGlobally) {
      installMsg = `Run ${chalk.cyan('npm i -g codestore')}`;
    } else if (hasYarn()) {
      installMsg = `Run ${chalk.cyan('yarn add codestore')}`;
    } else {
      installMsg = `Run ${chalk.cyan('npm i -g codestore')}
      or ${chalk.cyan('brew upgrade codestore')}
      depending on your installation method`;
    }

    const template = `Update available ${chalk.dim(this.currentVersion)} ${chalk.reset('→')} ${chalk.green(this.latestVersion)}
    ${installMsg}`;

    // TODO: enable borderStyle: 'round'
    const message = boxen(template, {
      padding: 1,
      margin: 1,
      align: 'center',
      borderColor: 'yellow',
      // borderStyle: boxen.BorderStyle.Round,
    });
    process.stderr.write(message);
    process.stderr.write('\n');
  }
}
