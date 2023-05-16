# VPC & ALB-EC2x2 のその２

## ChatGPTプロンプト

---

以下のCDKコードを命令にしたがい書き直してください。

#命令

- 以下3つのファイルに分割する
    - bin/cdk-test.ts
    - lib/10_vpc-stack.ts
    - lib/11_alb-stack.ts

- それぞれのファイルに記載することは以下になる
    - bin/cdk-test.ts
        - vpcとALBのスタックを実行する
    - lib/10_vpc-stack.ts
        - VPCを作成するクラス
    - lib/11_alb-stack.ts
        - ALBを作成するクラス

#コード

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';

class MyVpcStack extends Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: MyVpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'MyVpc');
  }
}

interface MyVpcStackProps extends cdk.StackProps {}


interface MyStackALBProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}


class MyStackALB extends Stack {
  constructor(scope: Construct, id: string, props: MyStackALBProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const instance1 = new ec2.Instance(this, 'MyEC2Instance1', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const instance2 = new ec2.Instance(this, 'MyEC2Instance2', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc: vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('MyListener', {
      port: 80,
    });

    const instanceTarget1 = new elbv2_tg.InstanceTarget(instance1);
    const instanceTarget2 = new elbv2_tg.InstanceTarget(instance2);

    const targetGroup = listener.addTargets('MyTargetGroup', {
      port: 80,
      targets: [instanceTarget1, instanceTarget2],
    });
  }
}

interface MyConstructProps {
  myParam: string;
}


class MyConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MyConstructProps) {
    super(scope, id);

    // MyConstructのコンストラクタで、Stackのスコープ内での生成をチェックします
    if (!(scope instanceof Stack)) {
      throw new Error(`MyConstruct must be created within a Stack`);
    }

    // Constructの実装をここに記述してください
    // ...
  }
}

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const vpcStack = new MyVpcStack(app, 'MyVpcStack', { env });
const albStack = new MyStackALB(app, 'MyStackALB', { vpc: vpcStack.vpc, env });

albStack.addDependency(vpcStack);

app.synth();
```

---

## ChatGPTで生成したコードを改良したコード

- 作成したコードと役割
    - bin/cdk-test.ts
        - vpcとALBのスタックを実行する
    - lib/10_vpc-stack.ts
        - VPCを作成するクラス
    - lib/11_alb-stack.ts
        - ALBを作成するクラス


## ChatGPTに作ってもらったコードを動くように修正したコード

`bin/cdk-test.ts`

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { MyVpcStack } from '../lib/10_vpc-stack';
import { MyStackALB } from '../lib/11_alb-stack';

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const vpcStack = new MyVpcStack(app, 'MyVpcStack', { env });
const albStack = new MyStackALB(app, 'MyStackALB', { vpc: vpcStack.vpc, env });

albStack.addDependency(vpcStack);

app.synth();
```


`lib/10_vpc-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

export class MyVpcStack extends Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: MyVpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'MyVpc');
  }
}

interface MyVpcStackProps extends cdk.StackProps {}
```


`lib/11_alb-stack.ts`

```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

export class MyStackALB extends Stack {
  constructor(scope: Construct, id: string, props: MyStackALBProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const instance1 = new ec2.Instance(this, 'MyEC2Instance1', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const instance2 = new ec2.Instance(this, 'MyEC2Instance2', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc: vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('MyListener', {
      port: 80,
    });

    const instanceTarget1 = new elbv2_tg.InstanceTarget(instance1);
    const instanceTarget2 = new elbv2_tg.InstanceTarget(instance2);

    listener.addTargets('MyTargetGroup', {
      port: 80,
      targets: [instanceTarget1, instanceTarget2],
    });
  }
}

interface MyStackALBProps extends StackProps {
  vpc: ec2.Vpc;
}
```
