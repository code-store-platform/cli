import * as open from 'open';
import config from '../../config';

// todo replace with deployed auth service
const url = config.auth0Url;
const redirectUrl = 'http://localhost:3000/cliCallback';
const clientId = 'yNVTwlNBjVxTwCmrQB3GztLnBuAUdaql';

export default () => open(`${url}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&state=STATE&scope=openid+email+profile`);
