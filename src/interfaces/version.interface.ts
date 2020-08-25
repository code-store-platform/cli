export default interface IVersion {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  commitId: string;
  serviceId: number;
  name: string;
  description: string;
}
