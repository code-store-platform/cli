import * as open from 'open';
import config from '../../config';

const { authApiUrl, auth0Url } = config;

// todo replace with deployed auth service
const url = auth0Url;
const redirectUrl = `${authApiUrl}/cli/callback`;
const clientId = 'yNVTwlNBjVxTwCmrQB3GztLnBuAUdaql';

export default () => open(`${url}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&state=STATE&scope=openid+email+profile`);
