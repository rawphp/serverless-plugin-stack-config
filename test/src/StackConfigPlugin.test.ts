import { expect } from 'chai';
import * as path from 'path';
import * as Serverless from 'serverless';
import { IStackConfig } from '../../src/types';
import StackConfigPlugin from './../../src/StackConfigPlugin';

const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

describe('StackConfigPlugin', function() {
  this.timeout(5000);

  let stackConfig: IStackConfig;
  let serverless;

  beforeEach(async () => {
    serverless = new Serverless({});
    serverless.config.update({ servicePath: fixturePath });
    serverless.pluginManager.cliOptions = {
      stage: 'dev',
    };

    await serverless.init();

    stackConfig = new StackConfigPlugin(serverless, { env: 'dev', region: 'eu-west-1' });
  });

  it('new StackConfig', () => {
    expect(stackConfig instanceof StackConfigPlugin).to.equal(true);
    expect(typeof stackConfig.defineCommands).to.equal('function');
    expect(typeof stackConfig.defineHooks).to.equal('function');
  });
});
