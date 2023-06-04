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
      certificate: 'certificate', // 証明書のARN
      domain: 'domain', // S3|EFS
      endpointDetails: {
        addressAllocationIds: ['addressAllocationIds'], // 正規表現パターン ^eipalloc-([0-9a-f]{8,17})$ (Elastic IP アドレスの割り当てIDを指定する)
        securityGroupIds: ['securityGroupIds'], // sg-[0-9a-f]{8,17} ※Subnet IDs unsupported for EndpointType: VPC_ENDPOINT
        subnetIds: ['subnetIds'],
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
      loggingRole: 'loggingRole', //  arn:.*role/.* ※IAMポリシー：AWSTransferLoggingAccess
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


## パターン（３）

VPCとサブネットを指定して、Transferサーバーデプロイ時にエンドポイントも作る

```typescript
import * as cdk from 'aws-cdk-lib';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnServer = new transfer.CfnServer(this, 'MyCfnServer', {
      domain: 'S3', // S3|EFS
      endpointDetails: {
        securityGroupIds: ['sg-12345678'], // sg-[0-9a-f]{8,17} ※Subnet IDs unsupported for EndpointType: VPC_ENDPOINT
        subnetIds: ['subnet-12345678', 'subnet-98765432'],
        vpcId: 'vpc-eeeeeeee',
      },
      endpointType: 'VPC', // PUBLIC|VPC|VPC_ENDPOINT
      identityProviderType: 'SERVICE_MANAGED', // SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA
      loggingRole: 'arn:aws:iam::123456789012:role/service-role/AWSTransferLoggingAccess', //  arn:.*role/.*
      protocols: ['SFTP'], // FTP|FTPS|SFTP|AS2
      securityPolicyName: 'TransferSecurityPolicy-2020-06', // TransferSecurityPolicy-.+

      tags: [{
        key: 'key',
        value: 'value',
      }]

    });
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack', {  env: {  region: 'ap-northeast-1'  }});

app.synth();
```

## パターン（４）

VPCエンドポイントを指定する（エンドポイントみつけられず、うまく動かない・・・）

```typescript
import * as cdk from 'aws-cdk-lib';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnServer = new transfer.CfnServer(this, 'MyCfnServer', {
      domain: 'S3', // S3|EFS
      endpointDetails: {
        vpcEndpointId: 'vpce-0011223344556677', //  vpce-[0-9a-f]{17}
      },
      endpointType: 'VPC_ENDPOINT', // PUBLIC|VPC|VPC_ENDPOINT
      identityProviderType: 'SERVICE_MANAGED', // SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA
      loggingRole: 'arn:aws:iam::123456789012:role/service-role/AWSTransferLoggingAccess', // arn:.*role/.*
      protocols: ['SFTP'], // FTP|FTPS|SFTP|AS2
      securityPolicyName: 'TransferSecurityPolicy-2020-06', // TransferSecurityPolicy-.+

      tags: [{
        key: 'key',
        value: 'value',
      }]

    });
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack', {  env: { region: 'ap-northeast-1' }});

app.synth();
```



## パターン（５）

パブリック

```typescript
import * as cdk from 'aws-cdk-lib';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnServer = new transfer.CfnServer(this, 'MyCfnServer', {
      domain: 'S3', // S3|EFS
      endpointType: 'PUBLIC', // PUBLIC|VPC|VPC_ENDPOINT
      identityProviderType: 'SERVICE_MANAGED', // SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA
      loggingRole: 'arn:aws:iam::602744163118:role/service-role/AWSTransferLoggingAccess', // arn:.*role/.*
      protocols: ['SFTP'], // FTP|FTPS|SFTP|AS2
      securityPolicyName: 'TransferSecurityPolicy-2020-06', // TransferSecurityPolicy-.+

      tags: [{
        key: 'key',
        value: 'value',
      }]

    });
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack', {  env: { region: 'ap-northeast-1' }});

app.synth();
```

