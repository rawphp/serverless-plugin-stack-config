import * as fs from 'fs-extra';
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

    await fs.ensureDir(dir);

    await fs.writeJson(`${dir}/stack-outputs.json`, this.serverless.variables.stack.outputs, { spaces: 2 });

    this.logger.log('Outputs Retrieved Successfully');
  } catch (error) {
    this.logger.log(error);
  }
}
