import sinon from 'sinon';

/**
 * Returns a new context.
 *
 * @returns {Object} new test context
 */
function getContext() {
  const sandbox = sinon.sandbox.create();
  const context = sandbox.mock();

  context.logSpy = sandbox.spy();
  context.errorSpy = sandbox.spy();
  context.serverless = {
    cli: {},
    service: {},
    provider: {},
    variables: {
      service: {
        service: 'test-service',
      },
    },
  };
  context.CF = {
    describeStacksAsync: sandbox.stub(),
  };
  context.options = { stage: 'dev' };
  context.logger = {
    log: args => context.logSpy(args),
    error: args => context.errorSpy(args),
  };

  return context;
}

export default getContext;
