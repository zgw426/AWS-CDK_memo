# IAMロールのCDK v2 コード

## 環境

Cloud9

```console
$ cdk --version
2.78.0 (build 8e95c37)
$ npm --version 
8.19.4
$ aws --version
aws-cli/2.11.15 Python/3.11.3 Linux/4.14.313-235.533.amzn2.x86_64 exe/x86_64.amzn.2 prompt/off
```

## アプリの作成

```console
PJ_NAME=api
mkdir ${PJ_NAME}
cd ${PJ_NAME}

cdk init app --language typescript
npm run build

※lib/${PJ_NAME}.tsを編集

cdk deploy
```


## (1) シンプルに作る

`AmazonS3ReadOnlyAccess`のIAMロールを作成する

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAMロールを作成
    const role = new Role(this, 'MyRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole',
    });

    // 必要なポリシーをアタッチ
    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromManagedPolicyArn(
      this,
      'S3ReadOnlyAccessPolicy',
      'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'
    );
    role.addManagedPolicy(s3ReadOnlyAccessPolicy);
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```

## (2) IAMロール2つ作る

- 以下のIAMロールを作成する
    - s3ReadOnlyAccessPolicyの権限を持つIAMロール`MyRole01`
    - s3FullAccessの権限を持つIAMロール`MyRole02`

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // MyRole01: s3ReadOnlyAccessPolicyの権限を持つIAMロールを作成
    const role01 = new Role(this, 'MyRole01', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole01',
    });

    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3ReadOnlyAccess'
    );
    role01.addManagedPolicy(s3ReadOnlyAccessPolicy);

    // MyRole02: s3FullAccessPolicyの権限を持つIAMロールを作成
    const role02 = new Role(this, 'MyRole02', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole02',
    });

    const s3FullAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3FullAccess'
    );
    role02.addManagedPolicy(s3FullAccessPolicy);
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```


## (3) 配列を使ってIAMロールを作る

- IAMロール名を配列に格納し、ループ処理でIAMロールを作成する
- IAMポリシーは配列に格納していない。配列にするなら2次元配列使うことになりそう

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const roleNames = ['MyRole01', 'MyRole02']; // IAMロール名の配列

    // IAMロールを作成するループ
    roleNames.forEach(roleName => {
      const role = new Role(this, roleName, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        roleName: roleName,
      });

      if (roleName === 'MyRole01') {
        const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonS3ReadOnlyAccess'
        );
        role.addManagedPolicy(s3ReadOnlyAccessPolicy);
      } else if (roleName === 'MyRole02') {
        const s3FullAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonS3FullAccess'
        );
        role.addManagedPolicy(s3FullAccessPolicy);
      }
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```


## (4) 作成したIAMロールを付与したLambdaを作る(パターン１)

1つのスレッドでIAMロールもLambdaも作成する

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // MyRole01: s3ReadOnlyAccessPolicyの権限を持つIAMロールを作成
    const role01 = new Role(this, 'MyRole01', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole01',
    });

    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3ReadOnlyAccess'
    );
    role01.addManagedPolicy(s3ReadOnlyAccessPolicy);

    // Lambda関数を作成し、MyRole01をアタッチ
    const lambdaFunction = new Function(this, 'MyLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      role: role01,
    });

  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```

## (5) 作成したIAMロールを付与したLambdaを作る(パターン２)

IAMロールとLambdaを別のスレッドで作成する

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

class IAMRoleStack extends Stack {
  // role01プロパティを定義する
  public readonly role01: Role;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // MyRole01: s3ReadOnlyAccessPolicyの権限を持つIAMロールを作成
    this.role01 = new Role(this, 'MyRole01', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole01',
    });

    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3ReadOnlyAccess'
    );
    this.role01.addManagedPolicy(s3ReadOnlyAccessPolicy);
  }
}

class LambdaStack extends Stack {
  constructor(scope: App, id: string, role: Role, props?: StackProps) {
    super(scope, id, props);

    // Lambda関数を作成し、指定されたIAMロールをアタッチ
    const lambdaFunction = new Function(this, 'MyLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      role: role,
    });
  }
}

const app = new App();

// IAMロールのスタックを作成
const iamRoleStack = new IAMRoleStack(app, 'IAMRoleStack');

// Lambda関数のスタックを作成し、IAMロールの参照を渡す
new LambdaStack(app, 'LambdaStack', iamRoleStack.role01);

app.synth();
```

