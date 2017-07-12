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

    const outputs = {};

    if (!this.CF) {
      this.CF = this.getCloudFormationInstance(this.serverless, this.options.region);
    }

    if (this.options.verbose) {
      this.logger.log('Calling CloudFormation...');
    }

    const response = await this.CF.describeStacksAsync({ StackName: stackName });

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

      this.serverless.variables.stack = { outputs };
    } else {
      throw new Error(`Stack: '${stackName}' not found`);
    }
  } catch (error) {
    this.logger.log(error);
  }
}
