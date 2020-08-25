import IService from './service.interface';
import IEnvironment from './environment.interface';

export default interface IProject {
  id: number;
  name: string;
  status: string;
  description?: string;
  services?: IService[];
  uniqueName: string;
  author?: {
    email: string;
  };
  environments?: IEnvironment[];
}
