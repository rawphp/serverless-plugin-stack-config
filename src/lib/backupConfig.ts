/**
 * Backs up config to S3 bucket.
 *
 * @returns void
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
        const data = await this.S3.getObject({ Bucket: config.bucket, Key: config.key }).promise();

        object = JSON.parse(data.Body.toString());
      } catch (error) {
        this.logger.log('Config file does not exist. Creating...');

        object = {};
      }

      let outputs;

      if (config.shallow) {
        outputs = Object.assign({}, object, this.serverless.variables.stack.outputs);
      } else {
        const obj = {};

        obj[this.service.service] = this.serverless.variables.stack.outputs;

        outputs = Object.assign({}, object, obj);
      }

      this.logger.log('Uploading config to ' + config.bucket);

      await this.S3.upload({
        Body: JSON.stringify(outputs, null, 2),
        Bucket: config.bucket,
        Key: config.key,
      }).promise();
    }
  } catch (error) {
    this.logger.log(error);
  }
}
