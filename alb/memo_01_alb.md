# VPC & ALB-EC2x2

## ChatGPT3.5プロンプト

```
#命令書
あなたはプロのプログラマーです。以下の制約条件に従って、入力する条件をもとにスクリプトをかいてください。

#制約条件
・aws cdk v2 スクリプト
・プログラム言語はTypeScript


#入力する文章
ALBとEC2を2つ作成するCDKスクリプトを作成してください
作成したEC2はALBのターゲットグループに所属させてください
```

## ChatGPT3.5出力

このスクリプトはエラーになる

```typescript:chatgptの出力
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

const app = new cdk.App();

const vpc = new ec2.Vpc(app, 'MyVpc');

const instance1 = new ec2.Instance(app, 'MyEC2Instance1', {
  vpc: vpc,
  instanceType: new ec2.InstanceType('t2.micro'),
  machineImage: new ec2.AmazonLinuxImage(),
});

const instance2 = new ec2.Instance(app, 'MyEC2Instance2', {
  vpc: vpc,
  instanceType: new ec2.InstanceType('t2.micro'),
  machineImage: new ec2.AmazonLinuxImage(),
});

const lb = new elbv2.ApplicationLoadBalancer(app, 'MyALB', {
  vpc: vpc,
  internetFacing: true,
});

const listener = lb.addListener('MyListener', {
  port: 80,
});

const targetGroup = listener.addTargets('MyTargetGroup', {
  port: 80,
  targets: [instance1, instance2],
});

```

## とりあえず動くスクリプト

試行錯誤して動くスクリプトできた
ただし、ターゲットグループのヘルスチェックはちゃんと動くか確認してない

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets'

import { Construct } from 'constructs'

import { App, Stack, StackProps } from 'aws-cdk-lib';



class MyStackALB extends Stack{
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const app = new cdk.App();
    
    const stack = new cdk.Stack(app, 'MyStack', {
      env: {
        region: 'ap-northeast-1' // 東京リージョン
      }
    });
    
    
    
    //const vpc = new ec2.Vpc(app, 'MyVpc');
    const vpc = new ec2.Vpc(stack, 'MyVpc');

    //const instance1 = new ec2.Instance(app, 'MyEC2Instance1', {
    const instance1 = new ec2.Instance(stack, 'MyEC2Instance1', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });
    
    //const instance2 = new ec2.Instance(app, 'MyEC2Instance2', {
    const instance2 = new ec2.Instance(stack, 'MyEC2Instance2', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });
    
    //const lb = new elbv2.ApplicationLoadBalancer(app, 'MyALB', {
    const lb = new elbv2.ApplicationLoadBalancer(stack, 'MyALB', {
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

    new MyConstruct(this, 'MyConstruct', { myParam: 'value' });
  }
}


interface MyConstructProps {
  myParam: string;
}

export class MyConstruct extends Construct {
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
const stack = new MyStackALB(app, 'MyStackALB');
```

## VPCとそれ以外でスタックを分けた

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


## AutoScalingでEC2をデプロイするようにした


```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
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

    const userData = ec2.UserData.forLinux();
    userData.addCommands('sudo yum update -y');
    userData.addCommands('sudo yum install httpd -y');
    userData.addCommands('echo "<html><body><h1>Hello World</h1></body></html>" > /var/www/html/index.html');

    const asg = new autoscaling.AutoScalingGroup(this, 'MyAutoScalingGroup', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
      userData,
      minCapacity: 2,
      maxCapacity: 4,
      cooldown: cdk.Duration.seconds(60),
      healthCheck: autoscaling.HealthCheck.ec2({
        grace: cdk.Duration.seconds(300)
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('MyListener', {
      port: 80,
    });

    listener.addTargets('MyTargetGroup', {
      port: 80,
      targets: [asg],
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


