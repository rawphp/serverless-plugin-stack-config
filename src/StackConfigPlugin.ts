import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import CLI from 'serverless/lib/classes/CLI';
import { getCloudFormationInstance, getS3Instance } from './lib/AWS';
import backupConfig from './lib/backupConfig';
import download from './lib/download';
import getValues from './lib/getValues';
import putValues from './lib/putValues';
import validate from './lib/validate';
import {
  IBackupConfig,
  IPluginConfig,
  IServerless,
  IStackConfig,
  IStackConfigCommands,
  IStackConfigHooks,
  IStackConfigOptions,
} from './types';

export default class StackConfigPlugin implements IStackConfig {
  private serverless: IServerless;
  private logger: CLI;
  private options: IStackConfigOptions;
  private service: any;
  private backup: IBackupConfig | boolean;
  private config: IPluginConfig;
  private commands: IStackConfigCommands;
  private hooks: IStackConfigHooks;
  private getS3Instance;
  private getCloudFormationInstance;

  /**
   * Create a new instance.
   *
   * @param {Object} serverless the Serverless instance
   * @param {Object} options    passed in options
   */
  constructor(serverless: IServerless, options: IStackConfigOptions) {
    this.serverless = serverless;
    this.logger = this.serverless.cli;
    this.options = options;
    this.service = this.serverless.service;
    this.backup = false;

    if (this.service.custom) {
      this.config = this.service.custom['stack-config'] || {};
    }

    const credentials = new AWS.SharedIniFileCredentials({ profile: this.serverless.processedInput.options.profile });
    AWS.config.credentials = credentials;

    this.commands = this.defineCommands();
    this.hooks = this.defineHooks();

    this.getS3Instance = getS3Instance;
    this.getCloudFormationInstance = getCloudFormationInstance;
  }

  /**
   * Define plugin commands.
   *
   * @returns {IStackConfigCommands}
   */
  public defineCommands(): IStackConfigCommands {
    const commonOptions = {
      path: {
        required: false,
        shortcut: 'p',
        usage:
          'Specify the location of the `stack-outputs.json` file ' + '(e.g. "--path .serverless or -p .serverless)',
        type: 'string',
      },
      profile: {
        shortcut: 'p',
        usage: 'AWS profile name',
        type: 'string',
      },
      region: {
        shortcut: 'r',
        usage: 'Region of the service',
        type: 'string',
      },
      stage: {
        shortcut: 's',
        usage: 'Stage of the service',
        type: 'string',
      },
      verbose: {
        shortcut: 'v',
        usage: 'Show all stack events during deployment',
        type: 'boolean',
      },
    };

    return {
      outputs: {
        commands: {
          download: {
            lifecycleEvents: ['validate', 'download'],
            options: commonOptions,
            usage: 'Download combined config file',
          },
        },
        lifecycleEvents: ['validate', 'getValues', 'putValues', 'backup'],
        options: commonOptions,
        usage: 'Save stack Outputs to file',
      },
    };
  }

  /**
   * Define plugin hooks.
   *
   * @returns {IStackConfigHooks}
   */
  public defineHooks(): IStackConfigHooks {
    return {
      'after:deploy:deploy': () =>
        BPromise.bind(this)
          .then(validate)
          .then(getValues)
          .then(putValues)
          .then(backupConfig),

      'outputs:getValues': () =>
        BPromise.bind(this)
          .then(validate)
          .then(getValues)
          .then(putValues)
          .then(backupConfig),

      // tslint:disable-next-line:object-literal-sort-keys
      'outputs:download:download': () =>
        BPromise.bind(this)
          .then(validate)
          .then(download),
    };
  }
}
