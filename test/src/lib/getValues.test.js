import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import getValues from './../../../src/lib/getValues';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('getValues', () => {
  const sandbox = sinon.sandbox.create();
  const context = sandbox.mock();

  let loggerSpy;

  beforeEach(() => {
    loggerSpy = sandbox.spy();

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
      log: (args) => {
        loggerSpy(args);
      },
    };
    context.getValues = getValues;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns stack output values for a valid stack', async () => {
    const request = { StackName: 'test-service-dev' };

    context.CF.describeStacksAsync.withArgs(request).returns({
      Stacks: [
        {
          StackName: request.StackName,
          Outputs: [
            {
              OutputKey: 'PublicSubnet',
              OutputValue: 'subnet-5c2ed23b',
            },
            {
              OutputKey: 'RedisEndpoint',
              OutputValue: 'red-ra-1jr1f3aoud9bh.fi2upk.0001.euw1.cache.amazonaws.com',
            },
            {
              OutputKey: 'ServiceEndpoint',
              OutputValue: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
            },
          ],
        },
      ],
    });

    await context.getValues();

    expect(loggerSpy).to.have.been.calledOnce();
    expect(context.CF.describeStacksAsync).to.have.been.calledWith(request);
    expect(context.serverless.variables.stack).to.exist();
    expect(context.serverless.variables.stack.outputs.PublicSubnet).to.exist();
    expect(context.serverless.variables.stack.outputs.RedisEndpoint).to.exist();
    expect(context.serverless.variables.stack.outputs.ServiceEndpoint).to.exist();
  });

  it('logs an error if stack does not exist', async () => {
    const request = { StackName: 'test-service-dev' };

    context.CF.describeStacksAsync.withArgs(request).returns({
      Stacks: [],
    });

    await context.getValues();

    expect(loggerSpy).to.have.been.calledTwice();
    expect(context.serverless.variables.stack).to.not.exist();
  });
});
