# Stack Config Plugin for Serverless

[![Build Status](https://travis-ci.org/rawphp/serverless-plugin-stack-config.svg?branch=master)](https://travis-ci.org/rawphp/serverless-plugin-stack-config)

A serverless plugin to manage configurations for a micro-service stack.

## Features

* `outputs` - This downloads this service's outputs to a file in */PROJECT_ROOT/.serverless/stack-outputs.json* and updates the config file in S3.

* `outputs download` - This downloads the existing, **combined**, stack config file from S3.

## Usage

Add the plugin to your `serverless.yml` like the following:

### serverless.yml:
```yaml
provider:
...

plugins:
  - serverless-plugin-stack-config

custom:
  stack-config:
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

### shell commands:
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
