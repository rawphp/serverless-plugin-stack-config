import * as sinon from 'sinon';

/**
 * Returns a new context.
 *
 * @returns {Object} new test context
 */
function getContext() {
  const sandbox = sinon.sandbox.create();
  const context = sandbox.mock();

  context.logSpy = sandbox.spy();
  context.serverless = {
    cli: {},
    service: { service: 'test-service' },
    variables: {},
  };
  context.service = { service: 'test-service' };
  context.CF = {
    describeStacksAsync: sandbox.stub(),
  };
  context.S3 = {
    getObjectAsync: sandbox.stub(),
    uploadAsync: sandbox.stub(),
  };
  context.options = { stage: 'dev', path: '/tmp' };
  context.logger = {
    error: (args) => context.errorSpy(args),
    log: (args) => context.logSpy(args),
  };
  context.config = {
    backup: {
      s3: {
        bucket: 'my-test-bucket',
        key: 'serverless-config.json',
        shallow: true,
      },
    },
  };

  return context;
}

export default getContext;
