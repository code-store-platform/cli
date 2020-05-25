import * as open from 'open';

const authLink = 'https://codestore.dev/api/authentication-service/authorize?cli=true';

export default () => open(authLink);
