import { join } from 'path';

const paths = {
  ROOT: process.cwd(),
  DIST: '',
  SRC: '',
  DATA: '',
  ENTITIES: '',
  MIGRATIONS: '',
};
paths.DIST = join(paths.ROOT, 'dist');
paths.SRC = join(paths.ROOT, 'src');
paths.DATA = join(paths.SRC, 'data');
paths.ENTITIES = join(paths.DATA, 'entities');
paths.MIGRATIONS = join(paths.DATA, 'migrations');

export default paths;
export {
  join,
};
