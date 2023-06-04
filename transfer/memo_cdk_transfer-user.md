


## サンプル（０）

全オプション(?)を列挙（動作未検証）
```typescript
import * as transfer from 'aws-cdk-lib/aws-transfer';

const cfnUser = new transfer.CfnUser(this, 'MyCfnUser', {
  role: 'role',
  serverId: 'serverId',
  userName: 'userName',

  // the properties below are optional
  homeDirectory: 'homeDirectory', // /{{S3バケット}}/xxxxxxxx
  homeDirectoryMappings: [{
    entry: 'entry',
    target: 'target',
  }],
  homeDirectoryType: 'homeDirectoryType',
  policy: 'policy',
  posixProfile: {
    gid: 123,
    uid: 123,

    // the properties below are optional
    secondaryGids: [123],
  },
  sshPublicKeyBody: 'sshPublicKeys',
  tags: [{
    key: 'key',
    value: 'value',
  }],
});
```


## サンプル（１）

ホームディレクトリが"制限付き"のユーザーを作成

```typescript
import * as cdk from 'aws-cdk-lib';
import * as transfer from 'aws-cdk-lib/aws-transfer';
import { Construct } from 'constructs';

class HelloTransferStackUser extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
      super(scope, id, props);
      const cfnUser = new transfer.CfnUser(this, 'MyCfnUser', {
        role: 'arn:aws:iam::123456789012:role/service-role/AWSTransferLoggingAccess', // ※IAMポリシーAWSTransferLoggingAccess
        serverId: 's-2f7538d010d24915b', // Transfer Family Server の ID
        userName: 'hoge-user-001', // ユーザー名

        // the properties below are optional
        //homeDirectory: '/testsuo-20220904/hoge-user-001',
        homeDirectoryMappings: [{
          entry: '/entry',
          target: '/target',
        }],
        homeDirectoryType: 'LOGICAL',
        policy: JSON.stringify({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": "s3:*",
              "Resource": "*"
            }
          ]
        }),
        tags: [{
          key: 'key',
          value: 'value',
        }],
      });
  }
}

const app = new cdk.App();
new HelloTransferStackUser(app, 'HelloTransferStackUser');
app.synth();
```





非推奨APIを使ったパターン

```
import { App, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

class CustomVpcStack extends cdk.Stack {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = this.createVpc();
    this.outputSubnetIds();
  }

  private createVpc(): IVpc {
    return new Vpc(this, 'CustomVpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
  }

  private outputSubnetIds(): void {
    const publicSubnet1 = this.vpc.publicSubnets[0];
    const publicSubnet2 = this.vpc.publicSubnets[1];
    const privateSubnet1 = this.vpc.privateSubnets[0];
    const privateSubnet2 = this.vpc.privateSubnets[1];

    console.log('Public Subnet 1:', publicSubnet1.subnetId);
    console.log('Public Subnet 1 CIDR:', publicSubnet1.ipv4CidrBlock);
    console.log('Public Subnet 2:', publicSubnet2.subnetId);
    console.log('Public Subnet 2 CIDR:', publicSubnet2.ipv4CidrBlock);
    console.log('Private Subnet 1:', privateSubnet1.subnetId);
    console.log('Private Subnet 1 CIDR:', privateSubnet1.ipv4CidrBlock);
    console.log('Private Subnet 2:', privateSubnet2.subnetId);
    console.log('Private Subnet 2 CIDR:', privateSubnet2.ipv4CidrBlock);
  }
}

class CustomAccessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomAccessProps) {
    super(scope, id, props);

    const vpcInfo = props.vpc;

    // VPCのNameタグとIDを出力
    //console.log('VPC:', vpcInfo.vpcId);
    //console.log('VPC CIDR:', vpcInfo.vpcCidrBlock);

    // パブリックサブネットとプライベートサブネットの情報を取得
    const publicSubnets = vpcInfo.publicSubnets;
    const privateSubnets = vpcInfo.privateSubnets;

    // サブネットのNameタグとIDを出力
    for (const subnet of publicSubnets) {
      console.log('Public Subnet ID:', subnet.subnetId);
      console.log('Public Subnet CIDR:', subnet.ipv4CidrBlock);
    }
    for (const subnet of privateSubnets) {
      console.log('Private Subnet ID:', subnet.subnetId);
      console.log('Private Subnet CIDR:', subnet.ipv4CidrBlock);
    }

    // ここで vpcInfo を使って必要な処理を行う
  }
}

interface CustomAccessProps extends cdk.StackProps {
  vpc: IVpc;
}

const app = new App();
const customVpcStack = new CustomVpcStack(app, 'CustomVpcStack');
const accessStack = new CustomAccessStack(app, 'CustomAccessStack', { vpc: customVpcStack.vpc });

app.synth();

```








======================================



aws transfer describe-user --server-id s-2f7538d010d24915b --user-name transuser001

```
$ aws transfer describe-user --server-id s-2f7538d010d24915b --user-name transuser001
{
    "ServerId":## サンプル
 "s-2f7538d010d24915b",
    "User": {
        "Arn": "arn:aws:transfer:ap-northeast-1:123456789012:user/s-2f7538d010d24915b/transuser001",
        "HomeDirectory": "/testsuo-20220904/transuser001",
        "HomeDirectoryType": "PATH",
        "Role": "arn:aws:iam::123456789012:role/service-role/AWSTransferLoggingAccess",
        "SshPublicKeys": [],
        "Tags": [],
        "UserName": "transuser001"
    }
}
```

