import { IService } from './service.interface';

export default interface IProject {
  id: number;
  name: string;
  status: string;
  description?: string;
  services?: IService[];
  author? : {
    email: string;
  };
}
