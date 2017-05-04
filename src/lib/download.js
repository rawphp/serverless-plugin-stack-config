import Promise from 'bluebird';
import fsp from 'fs-promise';
import path from 'path';
import chalk from 'chalk';

export default async function download() {
  try {
    const S3 = Promise.promisifyAll(
      new this.provider.sdk.S3({ region: this.options.region })
    );

    const config = this.backup.s3;

    if (!config.bucket) {
      throw new Error('Hookup plugin backup configuration is missing `bucket` name');
    }

    if (!config.shallow) {
      config.shallow = true;
    }

    let object;

    try {
      const data = (await S3.getObjectAsync({ Bucket: config.bucket, Key: config.key })).Body.toString();

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

    await fsp.writeJson(`${dir}/${config.key}`, object);

    this.logger.log(chalk.green('Stack Config Downloaded Successfully'));
  } catch (error) {
    this.logger.log(error);
  }
}
