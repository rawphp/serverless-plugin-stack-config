import { expect } from 'chai';
import backupConfig from './../../../src/lib/backupConfig';
import getContext from './../../stubs/context';

describe('backupConfig', () => {
  let context;

  beforeEach(() => {
    context = getContext();
    context.backupConfig = backupConfig;
  });

  it('backs up service config with stack config in S3 shallowly', async () => {
    // existing config
    const existingConfig = {
      ResourceBucket: 'serverless-config',
      VPCSecurityGroup: 'sg-956d10ec',
    };

    // new config
    context.serverless.variables.stack = {
      outputs: {
        PublicSubnet: 'subnet-5c2ed23b',
        RedisEndpoint: 'red-ra-1jr1f3aoud9bh.fi2upk.0001.euw1.cache.amazonaws.com',
        ServerlessDeploymentBucketName: 'store-dev-serverlessdeploymentbucket-4gioqmkmo42z',
        ServiceEndpoint: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
      },
    };

    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObject.withArgs(request).returns({
      Body: JSON.stringify(existingConfig),
    });

    await context.backupConfig();

    expect(context.S3.upload.calledOnce).to.equal(true);
  });

  it('backs up service config with stack config in S3 service namespaced', async () => {
    // existing config
    const existingConfig = {
      ResourceBucket: 'serverless-config',
      VPCSecurityGroup: 'sg-956d10ec',
    };

    // new config
    context.serverless.variables.stack = {
      outputs: {
        PublicSubnet: 'subnet-5c2ed23b',
        RedisEndpoint: 'red-ra-1jr1f3aoud9bh.fi2upk.0001.euw1.cache.amazonaws.com',
        ServerlessDeploymentBucketName: 'store-dev-serverlessdeploymentbucket-4gioqmkmo42z',
        ServiceEndpoint: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
      },
    };

    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObject.withArgs(request).returns({
      Body: JSON.stringify(existingConfig),
    });

    context.config.backup.s3.shallow = false;

    await context.backupConfig();

    expect(context.S3.upload.calledOnce).to.equal(true);
  });

  it('logs an error if bucket is not defined', async () => {
    context.config.backup.s3.bucket = undefined;

    await context.backupConfig();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `bucket` name',
    );
  });

  it('logs an error if file key is not defined', async () => {
    context.config.backup.s3.key = undefined;

    await context.backupConfig();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `key` name',
    );
  });
});
