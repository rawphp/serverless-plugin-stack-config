import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';

/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function getValues(): Promise<void> {
  try {
    this.logger.log('Retrieving Outputs...');

    const stackName = `${this.service.service}-${this.options.stage}`;

    let outputs = {};

    if (!this.CF) {
      this.CF = this.getCloudFormationInstance(this.serverless, this.options.region);
    }

    if (this.options.verbose) {
      this.logger.log('Calling CloudFormation...');
    }

    const response = await this.CF.describeStacks({ StackName: stackName }).promise();

    let stack;

    if (this.options.verbose) {
      this.logger.log('Parsing CloudFormation Response...');
    }

    response.Stacks.some((sk) => {
      if (sk.StackName === stackName) {
        stack = sk;

        return true;
      }

      return false;
    });

    if (stack) {
      stack.Outputs.forEach((element) => {
        outputs[element.OutputKey] = element.OutputValue;
      });

      // execute custom script if provided
      if (this.config.script) {
        this.logger.log(`Executing custom script command: ${this.config.script}`);

        const transform = require(`${process.cwd()}/${this.config.script}`);

        outputs = await transform(this.serverless, outputs);
      }

      this.serverless.variables.stack = { outputs };
    } else {
      throw new Error(`Stack: '${stackName}' not found`);
    }
  } catch (error) {
    this.logger.log('getValues.error: ' + error.message);
  }
}
