import axios from 'axios';
import config from '../config';

export default class APIClient {
  private endpoint = config.authApiUrl;

  async login(email: string, password:string):Promise<string> {
    const { data: token } = await axios.post(`${this.endpoint}/authorize`, { email, password });

    return token;
  }

  async getMe(token:string):Promise<any> {
    const { data } = await axios.get(`${this.endpoint}/getMe`, {
      headers: {
        Authorization: token,
      },
    });

    return data;
  }
}
