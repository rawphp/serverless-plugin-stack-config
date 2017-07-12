import * as BPromise from 'bluebird';
import * as fsp from 'fs-promise';
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

    if (!this.backup) {
      throw new Error('StackConfig plugin has not defined a backup configuration');
    }
    if (!this.backup.s3) {
      throw new Error('StackConfig plugin has not defined an S3 backup configuration');
    }

    const config = this.backup.s3;

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
      const data = (await this.S3.getObjectAsync({ Bucket: config.bucket, Key: config.key }))
        .Body.toString();

      object = JSON.parse(data);
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
    if (!fsp.existsSync(dir)) {
      await fsp.mkdirs(dir);
    }

    await fsp.writeJson(`${dir}/stack-config.json`, object);

    this.logger.log('Stack Config Downloaded Successfully');
  } catch (error) {
    this.logger.log(error);
  }
}
