import { expect } from 'chai';
import * as fsp from 'fs-promise';
import putValues from './../../../src/lib/putValues';
import getContext from './../../stubs/context';

describe('putValues', () => {
  let context;

  beforeEach(() => {
    context = getContext();
    context.options.path = '/tmp';
    context.serverless.variables.stack = {
      outputs: {
        PublicSubnet: 'subnet-5c2ed23b',
        RedisEndpoint: 'red-ra-1jr1f3aoud9bh.fi2upk.0001.euw1.cache.amazonaws.com',
        ServiceEndpoint: 'ec2-54-154-172-118.eu-west-1.compute.amazonaws.com',
      },
    };
    context.putValues = putValues;
  });

  it('writes stack output values to file', async () => {
    await context.putValues();

    const configFile = `${context.options.path}/stack-outputs.json`;

    expect(fsp.existsSync(configFile)).to.equal(true);

    const content = await fsp.readJson(configFile);

    expect(content.PublicSubnet).to.equal('subnet-5c2ed23b');
    expect(content.RedisEndpoint).to.equal('red-ra-1jr1f3aoud9bh.fi2upk.0001.euw1.cache.amazonaws.com');
    expect(content.ServiceEndpoint).to.equal('ec2-54-154-172-118.eu-west-1.compute.amazonaws.com');
  });
});
