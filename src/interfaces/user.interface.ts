export default interface IUser{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  organization: {
    name: string;
  };
}
