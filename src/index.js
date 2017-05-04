import Promise from 'bluebird';
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
  }
}

module.exports = StackConfig;
