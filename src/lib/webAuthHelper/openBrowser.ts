import * as open from 'open';
import config from '../../config';

const url = config.auth0Url;
const redirectUrl = 'http://localhost:3000';
const clientId = 'yNVTwlNBjVxTwCmrQB3GztLnBuAUdaql';

export default () => open(`${url}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&state=STATE&scope=openid+email+profile`);
