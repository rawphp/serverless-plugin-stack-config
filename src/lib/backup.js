import Promise from 'bluebird';

export default async function backup() {
  try {
    if (!this.backup) {
      return;
    }

    if (this.backup.s3) {
      const config = this.backup.s3;

      if (!config.bucket) {
        throw new Error('Hookup plugin backup configuration is missing `bucket` name');
      }

      if (!config.shallow) {
        config.shallow = true;
      }

      const S3 = Promise.promisifyAll(
        new this.provider.sdk.S3({ region: this.options.region })
      );

      let object;

      try {
        const data = (await S3.getObjectAsync({ Bucket: config.bucket, Key: config.key })).Body.toString();

        object = JSON.parse(data);
      } catch (error) {
        this.logger.log('Config file does not exist. Creating...');

        object = {};
      }

      let outputs;

      this.serverless.variables.stack.outputs.ServerlessDeploymentBucketName = undefined;

      if (config.shallow) {
        outputs = Object.assign({}, object, this.serverless.variables.stack.outputs);
      } else {
        let obj = {};

        obj[this.service['service']] = this.serverless.variables.stack.outputs;

        outputs = Object.assign({}, object, obj);
      }

      await S3.putObjectAsync({ Bucket: config.bucket, Key: config.key, Body: JSON.stringify(outputs) });
    }
  } catch (error) {
    this.logger.log(error);
  }
}
