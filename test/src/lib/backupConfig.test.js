import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import getContext from './../../stubs/context';
import backupConfig from './../../../src/lib/backupConfig';

/* eslint id-length:0 */

chai.use(dirtyChai);
chai.use(sinonChai);

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
        ServiceEndpoint: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
        ServerlessDeploymentBucketName: 'store-dev-serverlessdeploymentbucket-4gioqmkmo42z',
      },
    };

    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObjectAsync.withArgs(request).returns({
      Body: JSON.stringify(existingConfig),
    });

    await context.backupConfig();

    expect(context.S3.putObjectAsync).to.have.been.calledWithExactly({
      Bucket: request.Bucket,
      Key: request.Key,
      Body: JSON.stringify(
        Object.assign({},
          existingConfig,
          context.serverless.variables.stack.outputs,
          { ServerlessDeploymentBucketName: undefined })),
    });
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
        ServiceEndpoint: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
        ServerlessDeploymentBucketName: 'store-dev-serverlessdeploymentbucket-4gioqmkmo42z',
      },
    };

    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObjectAsync.withArgs(request).returns({
      Body: JSON.stringify(existingConfig),
    });

    context.backup.s3.shallow = false;

    await context.backupConfig();

    expect(context.S3.putObjectAsync).to.have.been.calledWithExactly({
      Bucket: request.Bucket,
      Key: request.Key,
      Body: JSON.stringify(
        Object.assign({},
          existingConfig,
          { 'test-service': context.serverless.variables.stack.outputs },
        )),
    });
  });


  it('logs an error if bucket is not defined', async () => {
    context.backup.s3.bucket = undefined;

    await context.backupConfig();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `bucket` name',
    );
  });

  it('logs an error if file key is not defined', async () => {
    context.backup.s3.key = undefined;

    await context.backupConfig();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `key` name',
    );
  });
});
