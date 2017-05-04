import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import StackConfig from './../../src';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('StackConfig', () => {
  let stackConfig;
  const sandbox = sinon.sandbox.create();
  const serverless = {
    cli: {},
    service: {},
    getProvider: sandbox.stub(),
  };

  beforeEach(() => {
    stackConfig = new StackConfig(serverless, {});
  });

  it('new StackConfig', () => {
    expect(stackConfig).to.be.an.instanceOf(StackConfig);
    expect(stackConfig.serverless.getProvider).to.have.been.called();
    expect(stackConfig.options).to.deep.equal({});
  });

  it('has commands', () => {
    expect(stackConfig.commands).to.exist();
    expect(stackConfig.commands.outputs).to.exist();
  });

  it('has hooks', () => {
    expect(stackConfig.hooks).to.exist();
  });
});
