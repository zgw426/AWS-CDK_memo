# AWS Transfer Family サーバーを作る CDK v2 (TypeScript) コード

## パターン（１）

とりあえず動くもの

```typescript:bin/test.ts
import * as cdk from 'aws-cdk-lib';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnServer = new transfer.CfnServer(this, 'MyCfnServer', {});
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack');

app.synth();
```

作ったリソースの情報を取得したもの

```console
$ aws transfer describe-server --server-id s-00000000000000000
{
    "Server": {
        "Arn": "arn:aws:transfer:ap-northeast-1:123456789012:server/s-00000000000000000",
        "ProtocolDetails": {
            "PassiveIp": "AUTO",
            "TlsSessionResumptionMode": "ENFORCED",
            "SetStatOption": "DEFAULT"
        },
        "Domain": "S3",
        "EndpointType": "PUBLIC",
        "HostKeyFingerprint": "SHA256:222222222222222222/S/11111111111111111111=",
        "IdentityProviderType": "SERVICE_MANAGED",
        "Protocols": [
            "SFTP"
        ],
        "SecurityPolicyName": "TransferSecurityPolicy-2018-11",
        "ServerId": "s-00000000000000000",
        "State": "ONLINE",
        "Tags": [
            {
                "Key": "aws:cloudformation:stack-name",
                "Value": "MyStack"
            },
            {
                "Key": "aws:cloudformation:logical-id",
                "Value": "MyCfnServer"
            },
            {
                "Key": "aws:cloudformation:stack-id",
                "Value": "arn:aws:cloudformation:ap-northeast-1:123456789012:stack/MyStack/914d7950-0210-11ee-9d62-06c5754c9893"
            }
        ],
        "UserCount": 0
    }
}
```







## パターン（２）

オプションパラメータを全部列挙（動作未確認）

```typescript:bin/test.ts
import * as cdk from 'aws-cdk-lib';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnServer = new transfer.CfnServer(this, 'MyCfnServer', /* all optional props */ {
      certificate: 'certificate',
      domain: 'domain', // S3|EFS
      endpointDetails: {
        addressAllocationIds: ['addressAllocationIds'],
        securityGroupIds: ['securityGroupIds'], // sg-[0-9a-f]{8,17}
        subnetIds: ['subnetIds'], // arn:.*role/.*
        vpcEndpointId: 'vpcEndpointId', //  vpce-[0-9a-f]{17}
        vpcId: 'vpcId',
      },
      endpointType: 'endpointType', // PUBLIC|VPC|VPC_ENDPOINT
      identityProviderDetails: {
        directoryId: 'directoryId', // d-[0-9a-f]{10}
        function: 'function', // ^arn:[a-z-]+:lambda:.*$
        invocationRole: 'invocationRole', // arn:.*role/.*
        url: 'url',
      },
      identityProviderType: 'identityProviderType', // SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA
      loggingRole: 'loggingRole',
      postAuthenticationLoginBanner: 'postAuthenticationLoginBanner',
      preAuthenticationLoginBanner: 'preAuthenticationLoginBanner',
      protocolDetails: {
        as2Transports: ['as2Transports'], // 最初の要素の値がパターン HTTP に一致する必要があり
        passiveIp: 'passiveIp',
        setStatOption: 'setStatOption', // DEFAULT|ENABLE_NO_OP
        tlsSessionResumptionMode: 'tlsSessionResumptionMode', // ENFORCED|ENABLED|DISABLED
      },
      protocols: ['SFTP'], // FTP|FTPS|SFTP|AS2
      securityPolicyName: 'securityPolicyName', // TransferSecurityPolicy-.+
      tags: [{
        key: 'key',
        value: 'value',
      }],
      workflowDetails: {
        onPartialUpload: [{
          executionRole: 'executionRole',
          workflowId: 'workflowId',
        }],
        onUpload: [{
          executionRole: 'executionRole', //arn:.*role/.*
          workflowId: 'workflowId', // w-[0-9a-f]{17}
        }],
      },
    });
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack');

app.synth();
```


