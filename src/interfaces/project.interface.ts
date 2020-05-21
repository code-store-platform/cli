import { IService } from './service.interface';

export default interface IProject {
  id: number;
  name: string;
  status: string;
  services?: IService[];
}
