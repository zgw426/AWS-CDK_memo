

とりあえず IoT Core ポリシーとルールを作る

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

// IoTポリシーの作成
const policy = new iot.CfnPolicy(stack, 'MyPolicy', {
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'iot:Connect',
          'iot:Publish',
          'iot:Subscribe',
          'iot:Receive',
        ],
        Resource: '*',
      },
    ],
  },
});

// IoTルールの作成
const rule = new iot.CfnTopicRule(stack, 'MyRule', {
  ruleName: 'MyRule',
  topicRulePayload: {
    sql: 'SELECT * FROM "my/topic"',
    actions: [
      {
        lambda: {
          functionArn: 'YOUR_LAMBDA_FUNCTION_ARN',
        },
      },
    ],
  },
});

app.synth();
```


IoT Core ルールを作る

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'IoTCoreRuleStack');

const ruleName = 'hoge';
const ruleDescription = 'hoge-note';
const sqlVersion = '2016-03-23';
const sqlQuery = 'SELECT * FROM *';
const s3BucketName = 's3-bucket-name';
const s3Key = 'iot/hoge.csv';
const defaultAcl = 'private';
const iamRoleArn = 'arn:aws:iam::12345678980123:role/iot-role';

const iotRule = new iot.CfnTopicRule(stack, 'IoTCoreRule', {
  ruleName,
  topicRulePayload: {
    description: ruleDescription,
    awsIotSqlVersion: sqlVersion,
    sql: sqlQuery,
    actions: [
      {
        s3: {
          roleArn: iamRoleArn,
          bucketName: s3BucketName,
          key: s3Key,
          cannedAcl: defaultAcl,
        },
      },
    ],
  },
});

app.synth();
```