import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import getContext from './../../stubs/context';
import getValues from './../../../src/lib/getValues';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('getValues', () => {
  let context;

  beforeEach(() => {
    context = getContext();
    context.getValues = getValues;
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

    expect(context.logSpy).to.have.been.calledOnce();
    expect(context.errorSpy).to.not.have.been.called();
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

    expect(context.logSpy).to.have.been.calledOnce();
    expect(context.errorSpy).to.have.been.calledOnce();
    expect(context.serverless.variables.stack).to.not.exist();
  });
});
