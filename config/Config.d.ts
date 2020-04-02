/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    authApiUrl: string
    auth0Url: string
    gatewayUrl: string
    clientId: string
  }
  export const config: Config
  export type Config = IConfig
}
