import * as BPromise from 'bluebird';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Downloads configuration.
 *
 * @returns {undefined}
 */
export default async function download(): Promise<void> {
  try {
    if (!this.S3) {
      this.S3 = this.getS3Instance(this.serverless, this.options.region);
    }

    if (!this.config || !this.config.backup) {
      throw new Error('StackConfig plugin has not defined a backup configuration');
    }
    if (!this.config.backup.s3) {
      throw new Error('StackConfig plugin has not defined an S3 backup configuration');
    }

    const config = this.config.backup.s3;

    if (!config.bucket) {
      throw new Error('StackConfig plugin has not defined a `bucket` name');
    }
    if (!config.key) {
      throw new Error('StackConfig plugin has not defined a `key` name');
    }

    if (!config.shallow) {
      config.shallow = true;
    }

    let object;

    try {
      const data = await this.S3.getObject({ Bucket: config.bucket, Key: config.key }).promise();

      object = JSON.parse(data.Body.toString());
    } catch (error) {
      this.logger.log('Config file not found');

      object = {};
    }

    let dir;

    if (this.options.path) {
      dir = path.resolve(this.options.path);
    } else {
      dir = path.resolve(`${this.serverless.config.servicePath}/.serverless`);
    }

    // ensure directory exists
    if (!fs.existsSync(dir)) {
      await fs.mkdirs(dir);
    }

    await fs.writeJson(`${dir}/stack-config.json`, object, { spaces: 2 });

    this.logger.log('Stack Config Downloaded Successfully');
  } catch (error) {
    this.logger.log(error);
  }
}
