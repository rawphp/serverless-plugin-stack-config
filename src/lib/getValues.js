import Promise from 'bluebird';
/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function getValues() {
  try {
    this.logger.log('Retrieving Outputs...');

    const stackName = `${this.serverless.variables.service.service}-${this.options.stage}`;

    const outputs = {};

    const CF = Promise.promisifyAll(
      new this.provider.sdk.CloudFormation({ region: this.options.region })
    );

    if (this.options.verbose) this.logger.log('Calling CloudFormation...');

    const response = await CF.describeStacksAsync({ StackName: stackName });

    let stack;

    if (this.options.verbose) this.logger.log('Parsing CloudFormation Response...');

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
