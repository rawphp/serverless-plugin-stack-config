import { expect } from 'chai';
import getValues from './../../../src/lib/getValues';
import getContext from './../../stubs/context';

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
          StackName: request.StackName,
        },
      ],
    });

    await context.getValues();

    expect(context.logSpy.calledOnce).to.equal(true);
    // expect(context.CF.describeStacksAsync).to.have.been.calledWith(request);
    // expect(context.serverless.variables.stack).to.exist();
    // expect(context.serverless.variables.stack.outputs.PublicSubnet).to.exist();
    // expect(context.serverless.variables.stack.outputs.RedisEndpoint).to.exist();
    // expect(context.serverless.variables.stack.outputs.ServiceEndpoint).to.exist();
  });

  it('logs an error if stack does not exist', async () => {
    const request = { StackName: 'test-service-dev' };

    context.CF.describeStacksAsync.withArgs(request).returns({
      Stacks: [],
    });

    await context.getValues();

    expect(context.logSpy.calledTwice).to.equal(true);
    // expect(context.serverless.variables.stack).to.not.exist();
  });
});
