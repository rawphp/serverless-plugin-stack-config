# Stack Config Plugin for Serverless

[![Build Status](https://travis-ci.org/rawphp/serverless-plugin-stack-config.svg?branch=master)](https://travis-ci.org/rawphp/serverless-plugin-stack-config)

A serverless plugin to manage configurations for a micro-service stack.

## Features

* `outputs` - This downloads this service's outputs to a file in */PROJECT_ROOT/.serverless/stack-outputs.json* and updates the config file in S3.

* `outputs download` - This downloads the existing, **combined**, stack config file from S3.

## Install

```shell
npm install --save serverless-plugin-stack-config
```

## Usage

Add the plugin to your `serverless.yml` like the following:

NOTE: The `script` and `backup` properties are optional.

### serverless.yml:
```yaml
provider:
...

plugins:
  - serverless-plugin-stack-config

custom:
  stack-config:
    script: scripts/transform.js
    backup:
      s3:
        key: config/stack-config.json
        bucket: ${self:service}-${opt:env}
        shallow: true

functions:
...
resources:
...
```

### Configure the Stack Output

You can now supply a script that you can use to transform the stack outputs before they are saved to file.

For example you could rename outputs or create new ones from the values received.

```js
// scripts/transform.js

module.exports = async function transform(serverless, stackOutputs) {
  // rename
  stackOutputs.TrackingServiceEndpoint = stackOutputs.ServiceEndpoint;

  // delete
  delete stackOutputs.ServerlessDeploymentBucketName;
  delete stackOutputs.ServiceEndpoint;

  // return updated stack
  return stackOutputs;
}
```

### Example shell commands:
```shell
serverless outputs --stage dev --region eu-west-1

serverless outputs download --stage dev --region eu-west-1
# with save directory location
serverless outputs download --stage dev --region eu-west-1 --path .
```

## Limitations

If you are deploying several applications at the same time, there is the possibility that some data loss could occur in the event that multiple stacks are updating the config file in S3.

## License

MIT
