import * as AWS from 'aws-sdk';
import { IServerless } from '../types';

/**
 * Get S3 instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {IS3} S3 instance
 */
export function getS3Instance(serverless: IServerless, region: string): AWS.S3 {
  return new AWS.S3({ region, apiVersion: '2006-03-01' });
}

/**
 * Get CloudFormation instance.
 *
 * @param {IServerless} serverless serverless instance
 * @param {String}      region     region name
 *
 * @returns {ICF} cloud formation instance
 */
export function getCloudFormationInstance(serverless: IServerless, region: string): AWS.CloudFormation {
  return new AWS.CloudFormation({ region, apiVersion: '2010-12-01' });
}
