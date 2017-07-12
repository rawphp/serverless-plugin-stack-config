import * as BPromise from 'bluebird';
import { ICF, IS3, IServerless } from "../types";

/**
 * Get S3 instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IS3} S3 instance
 */
export function getS3Instance(serverless: IServerless, region: string): IS3 {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return BPromise.promisifyAll(
    new provider.sdk.S3({ region, apiVersion: '2006-03-01' }),
  ) as IS3;
}

/**
 * Get CloudFormation instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {ICF} cloud formation instance
 */
export function getCloudFormationInstance(serverless: IServerless, region: string): ICF {
  const provider = serverless.getProvider(serverless.service.provider.name);

  return BPromise.promisifyAll(
    new provider.sdk.CloudFormation({ region, apiVersion: '2010-12-01' }),
  ) as ICF;
}
