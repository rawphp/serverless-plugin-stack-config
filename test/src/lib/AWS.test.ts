import * as AWS from 'aws-sdk';
import { expect } from 'chai';
import * as path from 'path';
import * as Serverless from 'serverless';
import getContext from '../../stubs/context';
import { getCloudFormationInstance, getS3Instance } from './../../../src/lib/AWS';

describe('AWS', function() {
  this.timeout(5000);

  const fixturePath = path.resolve(`${process.cwd()}/test/fixture`);

  describe('getCloudFormationInstance', () => {
    let serverless;

    beforeEach(async () => {
      serverless = new Serverless({});
      serverless.config.update({ servicePath: fixturePath });
      serverless.pluginManager.cliOptions = {
        stage: 'dev',
      };

      await serverless.init();
    });

    it('correctly returns an ElasticBeanstalk instance', () => {
      const eb = getCloudFormationInstance(serverless, 'eu-west-1');

      expect(eb instanceof AWS.CloudFormation);
    }).timeout(5000);
  });

  describe('S3', () => {
    let serverless;

    beforeEach(async () => {
      serverless = new Serverless({});
      serverless.config.update({ servicePath: fixturePath });
      serverless.pluginManager.cliOptions = {
        stage: 'dev',
      };

      await serverless.init();
    });

    it('correctly returns an S3 instance', () => {
      const eb = getS3Instance(serverless, 'eu-west-1');

      expect(eb instanceof AWS.S3);
    }).timeout(5000);
  });
});
