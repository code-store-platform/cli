import * as open from 'open';
import { config } from 'node-config-ts';

// todo replace with deployed auth service
const redirectUrl = `${config.authApiUrl}/callback`;

export default () => open(`${config.auth0Url}?client_id=${config.clientId}&response_type=code&redirect_uri=${redirectUrl}?cli=true&state=STATE&scope=openid+email+profile`);
