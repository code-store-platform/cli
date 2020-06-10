import * as open from 'open';
import { ChildProcess } from 'child_process';

const authLink = 'https://api.codestore.dev/authentication-service/authorize?cli=true';

export default (): Promise<ChildProcess> => open(authLink);
