import * as fs from 'fs';
import {join} from 'path'
import * as rimraf from 'rimraf';

// TODO Refactor
export class FileWorker {
  constructor(path: string) {
    this.path = path;
  }

  private readonly path: string;

  updateFile(data: string, name: string) {
    fs.appendFileSync(join(`${this.path}/${name}`), data, {});
  }

  rewriteFile(data: string, name: string) {
    fs.writeFileSync(join(this.path, name), data);
  }

  checkProjectYaml() {
    const files = fs.readdirSync(this.path);
    if (!files.find(f => f === 'codestore_prj.yaml')) {
      throw 'You sould be in Code.Store project directory'
    }
  }

  checkFileExists(name = 'codestore.yaml') {
    const files = fs.readdirSync(this.path);
    return files.find(f => f === name);
  }

  checkIfServiceExists(serviceName: string) {
    const files = fs.readdirSync(join(this.path, '/services'));
    return files.find(f => f === serviceName);
  }

  readFile(name: string): string {
    return fs.readFileSync(join(this.path, name)).toString();
  }
}

export class ProjectManager {
  constructor(name: string, path: string) {
    this.serviceName = name;
    this.path = path;
  }

  private readonly serviceName: string;
  private readonly path: string;

  generate(): void {
    fs.mkdirSync(`${this.path}/${this.serviceName}`);
    fs.mkdirSync(`${this.path}/${this.serviceName}/services`);
    fs.writeFileSync(`${this.path}/${this.serviceName}/codestore_prj.yaml`, '');
  }
}

export class ServiceManager {
  constructor(name: string, path: string) {
    this.serviceName = name + 'Service';
    this.path = join(path, '/services');
  }

  public readonly serviceName: string;
  private readonly path: string;

  private generateModels(name: string = 'sample') {
    fs.mkdirSync(`${this.path}/${this.serviceName}/src/models`);
    fs.writeFileSync(`${this.path}/${this.serviceName}/src/models/${name}.model.js`, '');
  }

  private generateSchema() {
    fs.mkdirSync(`${this.path}/${this.serviceName}/src/schema`);
    fs.writeFileSync(`${this.path}/${this.serviceName}/src/schema/user.schema.graphql`, 'user schema');
  }

  private generateFunctions() {
    fs.mkdirSync(`${this.path}/${this.serviceName}/src/functions`);
    fs.mkdirSync(`${this.path}/${this.serviceName}/src/functions/roles`);
    fs.mkdirSync(`${this.path}/${this.serviceName}/src/functions/users`);
    fs.writeFileSync(`${this.path}/${this.serviceName}/src/functions/roles/index.js`, 'role f');
    fs.writeFileSync(`${this.path}/${this.serviceName}/src/functions/users/index.js`, 'user f');
  }

  private generateService() {
    fs.mkdirSync(`${this.path}/${this.serviceName}`);
    fs.mkdirSync(`${this.path}/${this.serviceName}/src`);
    fs.writeFileSync(`${this.path}/${this.serviceName}/codestore.yaml`, '');
    fs.writeFileSync(`${this.path}/${this.serviceName}/env.yaml`, '');
  }

  generate() {
    this.generateService();
    this.generateSchema();
    this.generateModels();
    this.generateFunctions();
  }

  remove(name: string) {
    rimraf.sync(join(this.path, name))
  }

  check() {
    const data = fs.readdirSync('./src/services');
    if (data.find(dir => dir === this.serviceName)) {
      throw `Service with name ${this.serviceName} already exists`
    }
  }
}
