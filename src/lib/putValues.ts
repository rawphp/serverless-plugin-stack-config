import * as fsp from 'fs-promise';
import * as path from 'path';

/**
 * Write values to file.
 *
 * @returns {undefined}
 */
export default async function putValues(): Promise<void> {
  try {
    if (this.options.verbose) {
      this.logger.log('Writing Outputs...');
    }

    let dir;

    if (this.options.path) {
      dir = path.resolve(this.options.path);
    } else {
      dir = path.resolve(`${this.serverless.config.servicePath}/.serverless`);
    }

    await fsp.writeJson(`${dir}/stack-outputs.json`, this.serverless.variables.stack.outputs);

    this.logger.log('Outputs Retrieved Successfully');
  } catch (error) {
    this.logger.log(error);
  }
}
