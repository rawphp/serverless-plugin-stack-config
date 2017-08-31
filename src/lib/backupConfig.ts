import * as BPromise from 'bluebird';

/**
 * Backs up config to S3 bucket.
 *
 * @returns {undefined}
 */
export default async function backupConfig(): Promise<void> {
  try {
    if (!this.config || !this.config.backup) {
      return;
    }

    if (this.config.backup.s3) {
      const config = this.config.backup.s3;

      if (!config.bucket) {
        throw new Error('StackConfig plugin has not defined a `bucket` name');
      }
      if (!config.key) {
        throw new Error('StackConfig plugin has not defined a `key` name');
      }

      if (typeof config.shallow === 'undefined') {
        config.shallow = true;
      }

      if (!this.S3) {
        this.S3 = this.getS3Instance(this.serverless, this.options.region);
      }

      let object;

      try {
        const data = (await this.S3.getObjectAsync({ Bucket: config.bucket, Key: config.key }))
          .Body.toString();

        object = JSON.parse(data);
      } catch (error) {
        this.logger.log('Config file does not exist. Creating...');

        object = {};
      }

      let outputs;

      /* eslint id-length:0 */
      this.serverless.variables.stack.outputs.ServerlessDeploymentBucketName = undefined;

      if (config.shallow) {
        outputs = Object.assign({}, object, this.serverless.variables.stack.outputs);
      } else {
        const obj = {};

        obj[this.service.service] = this.serverless.variables.stack.outputs;

        outputs = Object.assign({}, object, obj);
      }

      await this.S3.uploadAsync({
        Body: JSON.stringify(outputs),
        Bucket: config.bucket,
        Key: config.key,
      });
    }
  } catch (error) {
    this.logger.log(error);
  }
}
