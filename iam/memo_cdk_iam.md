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



## (6) IAMロールを複数つくる

JSON使ってIAMロールを複数作るサンプル

```typescript
import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface CustomIamRoleProps extends StackProps {
  iamRoleSet: IamRoleSet[];
}

export interface IamRoleSet{
  iamRoleName: string;
  policys: string[];
}

class CustomIamRoleStack extends Stack {

  constructor(scope: App, id: string, props: CustomIamRoleProps) {
    super(scope, id, props);

    for (const dataSet of props.iamRoleSet) {
      // IAMロールを作成
      const role = new iam.Role(this, dataSet.iamRoleName, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        roleName: dataSet.iamRoleName,
      });

      // 必要なポリシーをアタッチ
      role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'));
      role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBReadOnlyAccess'));

    } //--- for ---//

  }
}


const app = new App();

const iamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-01",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  },
  {
    "iamRoleName": "iamrole-20230708-02",
    "policys": ["AmazonS3ReadOnlyAccess"],
  },
];

const customIamRoleProps: CustomIamRoleProps = {
  iamRoleSet: iamRoleSet
}

const customIamRoleStack = new CustomIamRoleStack(app, 'CustomIamRoleStack', customIamRoleProps);

// スタックをデプロイ
app.synth();
```

## (7) IAMロールを複数つくる(クロススタック対応)

- サンプル(6)のIAMロールについて、以下2通りのクロススタックを追加
  - CfnOutput
  - public readonly


```typescript
import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface CustomIamRoleProps extends StackProps {
  iamRoleSet: IamRoleSet[];
}

export interface IamRoleSet{
  iamRoleName: string;
  policys: string[];
}

class CustomIamRoleStack extends Stack {
  public readonly iamRoles: { [iamRoleName: string]: iam.Role };

  constructor(scope: App, id: string, props: CustomIamRoleProps) {
    super(scope, id, props);

    this.iamRoles = {}; // バケットオブジェクトを保持するオブジェクトを初期化

    for (const dataSet of props.iamRoleSet) {
      // IAMロールを作成
      const role = new iam.Role(this, dataSet.iamRoleName, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        roleName: dataSet.iamRoleName,
      });

      for (const policy of dataSet.policys) {
        // 必要なポリシーをアタッチ
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(policy));
      }

      // Export する
      new CfnOutput(this, `${dataSet.iamRoleName}Output`, {
        value: role.roleName,
        exportName: `${dataSet.iamRoleName}Export`,
      });

      this.iamRoles[dataSet.iamRoleName] = role;
    } //--- for ---//

  }
}


const app = new App();

const iamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-01",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  },
  {
    "iamRoleName": "iamrole-20230708-02",
    "policys": ["AmazonS3ReadOnlyAccess"],
  },
];

const customIamRoleProps: CustomIamRoleProps = {
  iamRoleSet: iamRoleSet
}

const customIamRoleStack = new CustomIamRoleStack(app, 'CustomIamRoleStack', customIamRoleProps);

// 変数に格納して使用
const iamRole1 = customIamRoleStack.iamRoles["iamrole-20230708-01"];
const iamRole2 = customIamRoleStack.iamRoles["iamrole-20230708-02"];

console.log('IAM Role 1:', iamRole1.roleName);
console.log('IAM Role 2:', iamRole2.roleName);

// スタックをデプロイ
app.synth();
```











