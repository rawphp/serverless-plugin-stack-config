import fsp from 'fs-promise';
import path from 'path';
import chalk from 'chalk';

/**
 * Write values to file.
 *
 * @returns {undefined}
 */
export default async function putValues() {
  try {
    if (this.options.verbose) this.logger.log('Writing Outputs...');

    let dir;

    if (this.options.path) {
      dir = path.resolve(this.options.path);
    } else {
      dir = path.resolve(`${this.serverless.config.servicePath}/.serverless`);
    }

    await fsp.writeJson(`${dir}/stack-outputs.json`, this.serverless.variables.stack.outputs);

    this.logger.log(chalk.green('Outputs Retrieved Successfully'));
  } catch (error) {
    this.logger.log(error);
  }
}
