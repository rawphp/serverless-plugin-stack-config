import chai, { expect } from 'chai';
import fsp from 'fs-promise';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import getContext from './../../stubs/context';
import download from './../../../src/lib/download';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('download', () => {
  let context;

  beforeEach(() => {
    context = getContext();
    context.download = download;
  });

  it('saves a new stack config to file', async () => {
    // file does not exist yet
    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObjectAsync.withArgs(request).throws();

    await context.download();

    const file = `${context.options.path}/${request.Key}`;

    expect(fsp.existsSync(file)).to.equal(true);

    const content = await fsp.readJson(file);

    expect(content).to.deep.equal({});
  });

  it('saves the combined stack config to file', async () => {
    // file already exists with existing values from other services
    const existingConfig = {
      ResourceBucket: 'serverless-config',
      VPCSecurityGroup: 'sg-956d10ec',
    };

    const request = { Bucket: 'my-test-bucket', Key: 'serverless-config.json' };

    context.S3.getObjectAsync.withArgs(request).returns({
      Body: JSON.stringify(existingConfig),
    });

    await context.download();

    const file = `${context.options.path}/${request.Key}`;

    expect(fsp.existsSync(file)).to.equal(true);

    const content = await fsp.readJson(file);

    expect(content).to.deep.equal(existingConfig);
  });

  it('logs an error if backup is not defined', async () => {
    context.backup = undefined;

    await context.download();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a backup configuration',
    );
  });

  it('logs an error if backup S3 is not defined', async () => {
    context.backup.s3 = undefined;

    await context.download();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined an S3 backup configuration',
    );
  });

  it('logs an error if bucket is not defined', async () => {
    context.backup.s3.bucket = undefined;

    await context.download();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `bucket` name',
    );
  });

  it('logs an error if file key is not defined', async () => {
    context.backup.s3.key = undefined;

    await context.download();

    expect(typeof context.logSpy.args[0][0]).to.equal('object');
    expect(context.logSpy.args[0][0].message).to.equal(
      'StackConfig plugin has not defined a `key` name',
    );
  });
});
