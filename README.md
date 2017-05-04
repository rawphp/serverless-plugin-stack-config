# Stack Config Pluign for Serverless

A serverless plugin to manage configurations for a micro-service stack.

## NOTE: Plugin Under Heavy Development - Coming Soon

## Usage

Add the plugin to your `serverless.yml` like the following:

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

resources:
...
```
