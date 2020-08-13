import { join } from 'path';

const paths = {
  ROOT: process.cwd(),
  DIST: '',
  SRC: '',
  DATA: '',
  ENTITIES: '',
  MIGRATIONS: '',
  BUILD: '',
};
paths.DIST = join(paths.ROOT, 'dist');
paths.SRC = join(paths.ROOT, 'src');
paths.DATA = join(paths.SRC, 'data');
paths.ENTITIES = join(paths.DATA, 'entities');
paths.MIGRATIONS = join(paths.DATA, 'migrations');
paths.BUILD = join(paths.ROOT, '.build');

export default paths;
export {
  join,
};
