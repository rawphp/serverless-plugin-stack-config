import CLI from 'serverless/lib/classes/CLI';

export interface IStackConfig {
  defineCommands(): IStackConfigCommands;
  defineHooks(): IStackConfigHooks;
}

export interface IServerless {
  config: any;
  cli: CLI;
  service: any;
  processedInput: any;
  getProvider(type: string): any;
}

export interface IStackConfigCommands {
  outputs: any;
}

export interface IStackConfigHooks {
  'after:deploy:deploy';
  'outputs:getValues';
  'outputs:download:download';
}

export interface IS3BackupConfig {
  key: string;
  bucket: string;
  shallow?: boolean;
}

export interface IBackupConfig {
  s3: IS3BackupConfig;
}

export interface IPluginConfig {
  backup: IBackupConfig;
}

export interface IStackConfigOptions {
  env: string;
  region: string;
  path?: string;
}

export interface IS3 {
  uploadAsync(params: any): Promise<any>;
  getObjectAsync(parmas: any): Promise<any>;
}

export interface ICF {
  describeStacksAsync(params: any): Promise<any>;
}
