import { join } from 'path';

const paths = {
  ROOT: process.cwd(),
  DIST: '',
  SERVICE: '',
  DIST_SERVICE: '',
  SCHEMA: '',
  RESOLVERS: '',
  DATA: '',
  ENTITIES: '',
  MIGRATIONS: '',
};
paths.DIST = join(paths.ROOT, 'dist');
paths.SERVICE = join(paths.ROOT, 'src');
paths.DIST_SERVICE = join(paths.DIST, 'src');
paths.SCHEMA = join(paths.SERVICE, 'schema.graphql');
paths.RESOLVERS = join(paths.DIST_SERVICE, 'resolvers');
paths.DATA = join(paths.DIST_SERVICE, 'data');
paths.ENTITIES = join(paths.DATA, 'entities');
paths.MIGRATIONS = join(paths.DATA, 'migrations');

export default paths;
export {
  join,
};
