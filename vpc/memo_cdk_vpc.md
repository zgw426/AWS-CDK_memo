# VPC/サブネット の CDK v2 コード

## サンプル（１）

パブリックサブネットワークとプライベートサブネットワークを2つづつ作成する

```typescript:bin/xxx.ts
import { App, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

class CustomVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPCの作成
    const vpc = new Vpc(this, 'CustomVpc', {
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
          subnetType: SubnetType.PRIVATE_WITH_NAT, // プライベートサブネットのプロパティを変更
        },
      ],
    });

    // パブリックサブネット1の作成
    const publicSubnet1 = vpc.publicSubnets[0];
    // パブリックサブネット2の作成
    const publicSubnet2 = vpc.publicSubnets[1];

    // プライベートサブネット1の作成
    const privateSubnet1 = vpc.privateSubnets[0];
    // プライベートサブネット2の作成
    const privateSubnet2 = vpc.privateSubnets[1];

    // 作成したサブネットの情報を出力
    console.log('Public Subnet 1:', publicSubnet1.subnetId);
    console.log('Public Subnet 2:', publicSubnet2.subnetId);
    console.log('Private Subnet 1:', privateSubnet1.subnetId);
    console.log('Private Subnet 2:', privateSubnet2.subnetId);
  }
}

const app = new App();
new CustomVpcStack(app, 'CustomVpcStack');
app.synth();
```

## サンプル（２）

別のスタックからVPC,サブネットワークの情報を取得する
このサンプルは以下の警告が表示される

```console
$ cdk deploy --all
[WARNING] aws-cdk-lib.aws_ec2.VpcProps#cidr is deprecated.
  Use ipAddresses instead
  This API will be removed in the next major release.
[WARNING] aws-cdk-lib.aws_ec2.SubnetType#PRIVATE_WITH_NAT is deprecated.
  use `PRIVATE_WITH_EGRESS`
  This API will be removed in the next major release.
```


```typescript:bin/xxx.ts
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
    const publicSubnets = this.vpc.publicSubnets;
    const privateSubnets = this.vpc.privateSubnets;

    console.log('Public Subnets:');
    for (const subnet of publicSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
    }

    console.log('Private Subnets:');
    for (const subnet of privateSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
    }
  }
}

class CustomAccessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomAccessProps) {
    super(scope, id, props);

    const vpcInfo = props.vpc;

    console.log('VPC:', vpcInfo.vpcId);
    console.log('VPC CIDR:', vpcInfo.vpcCidrBlock);

    const publicSubnets = vpcInfo.publicSubnets;
    const privateSubnets = vpcInfo.privateSubnets;

    console.log('Public Subnets:');
    for (const subnet of publicSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
      console.log('Subnet CIDR:', subnet.ipv4CidrBlock);
    }

    console.log('Private Subnets:');
    for (const subnet of privateSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
      console.log('Subnet CIDR:', subnet.ipv4CidrBlock);
    }
  }
}

interface CustomAccessProps extends cdk.StackProps {
  vpc: IVpc;
}

const app = new App();
const customVpcStack = new CustomVpcStack(app, 'CustomVpcStack');
new CustomAccessStack(app, 'CustomAccessStack', { vpc: customVpcStack.vpc });
app.synth();
```


