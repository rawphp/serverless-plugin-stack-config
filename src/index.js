import Promise from 'bluebird';
import { execSync } from 'child_process';
import validate from './lib/validate';
import getValues from './lib/getValues';
import putValues from './lib/putValues';
import backup from './lib/backup';
import download from './lib/download';

class StackConfig {
  /**
   * Create a new instance.
   *
   * @param {Object} serverless the Serverless instance
   * @param {Object} options    passed in options 
   */
  constructor(serverless, options) {
    this.serverless = serverless;
    this.logger = this.serverless.cli;
    this.options = options;
    this.service = this.serverless.service;
    this.provider = serverless.getProvider('aws');
    this.backup = false;

    if (this.service.custom) {
      this.config = this.service.custom['stack-config'];

      if (this.config.backup) {
        this.backup = this.config.backup;
      }
    }

    const commonOptions = {
      stage: {
        usage: 'Stage of the service',
        shortcut: 's',
      },
      region: {
        usage: 'Region of the service',
        shortcut: 'r',
      },
      path: {
        usage: 'Specify the location of the `stack-outputs.json` file '
        + '(e.g. "--path .serverless or -p .serverless)',
        required: false,
        shortcut: 'p',
      },
      verbose: {
        usage: 'Show all stack events during deployment',
        shortcut: 'v',
      },
    };

    this.commands = {
      docker: {
        usage: 'Deploy a Docker Image',
        lifecycleEvents: [
          'initialize',
        ],
      },
      outputs: {
        usage: 'Save stack Outputs to file',
        lifecycleEvents: [
          'validate',
          'getValues',
          'putValues',
          'backup',
        ],
        options: commonOptions,
        commands: {
          download: {
            usage: 'Download combined config.json',
            lifecycleEvents: [
              'validate',
              'download',
            ],
            options: commonOptions,
          },
        },
      },
    };

    this.hooks = {
      'after:deploy:deploy': () => Promise.bind(this)
        .then(validate)
        .then(getValues)
        .then(putValues)
        .then(backup),

      'outputs:getValues': () => Promise.bind(this)
        .then(validate)
        .then(getValues)
        .then(putValues)
        .then(backup),

      'outputs:download:download': () => Promise.bind(this)
        .then(validate)
        .then(download),
    };

    this.addHooks(this.config.hooks);
  }

  /**
   * Add custom commands to hooks.
   *
   * @param {Object} list list of hook commands
   *
   * @returns {undefined}
   */
  addHooks(list) {
    if (!list) {
      return;
    }

    const buildHookFunction = hook => (
      () => {
        const commands = list[hook] || [];

        commands.forEach(
          command => {
            try {
              this.logger.log(`Running ${hook} command: "${command}"`);

              var output = execSync(command).toString();

              if (output) {
                this.logger.log(output);
              }
            } catch (error) {
              this.logger.log(error);
            }
          }
        );
      }
    );

    const hooksObj = {}

    const custom = this.serverless.service.custom || {};

    const hooks = custom.hooks || {};

    Object.keys(list).forEach(
      hook => {
        hooksObj[hook] = buildHookFunction(hook);
      }
    );

    this.hooks = Object.assign({}, this.hooks, hooksObj);
  }
}

module.exports = StackConfig;
