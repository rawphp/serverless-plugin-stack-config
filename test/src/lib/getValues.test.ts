import * as BPromise from 'bluebird';
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

    context.CF.describeStacks.withArgs(request).returns({
      promise: () =>
        BPromise.resolve({
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
        }),
    });

    await context.getValues();

    expect(context.logSpy.calledOnce).to.equal(true);
    expect(typeof context.serverless.variables.stack).to.equal('object');
    expect(typeof context.serverless.variables.stack.outputs.PublicSubnet).to.equal('string');
    expect(typeof context.serverless.variables.stack.outputs.RedisEndpoint).to.equal('string');
    expect(typeof context.serverless.variables.stack.outputs.ServiceEndpoint).to.equal('string');
  });

  it('returns stack output values with a transform script', async () => {
    const request = { StackName: 'test-service-dev' };

    context.CF.describeStacks.withArgs(request).returns({
      promise: () =>
        BPromise.resolve({
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
        }),
    });

    context.config.script = 'transform.js';

    await context.getValues();

    expect(context.logSpy.calledTwice).to.equal(true);
    expect(typeof context.serverless.variables.stack).to.equal('object');
    expect(typeof context.serverless.variables.stack.outputs.PublicSubnet).to.equal('string');
    expect(typeof context.serverless.variables.stack.outputs.RedisEndpoint).to.equal('string');
    expect(typeof context.serverless.variables.stack.outputs.ServiceEndpoint).to.equal('string');
    expect(context.serverless.variables.stack.outputs.Type).to.equal('field');
  });

  it('logs an error if stack does not exist', async () => {
    const request = { StackName: 'test-service-dev' };

    context.CF.describeStacks.withArgs(request).returns({
      promise: () => BPromise.resolve({ Stacks: [] }),
    });

    await context.getValues();

    expect(context.logSpy.calledTwice).to.equal(true);
    expect(typeof context.serverless.variables.stack).to.equal('undefined');
  });
});
