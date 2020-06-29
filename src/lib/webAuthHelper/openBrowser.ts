import open from 'open';
import { ChildProcess } from 'child_process';

const authLink = `${process.env.CODESTORE_GATEWAY_HOST || 'https://api.code.store'}/authentication-service/authorize?cli=true`;

export default (): Promise<ChildProcess> => open(authLink);
