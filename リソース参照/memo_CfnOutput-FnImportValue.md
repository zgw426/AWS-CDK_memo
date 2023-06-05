# CfnOutput と Fn.importValue を使ってみる

## サンプル（１）

- CfnOutputで作ったIAMロールをCFnアウトプット
- Fn.importValueでCFnアウトプットされたIAMロールを参照

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { StackProps } from 'aws-cdk-lib';


class CustomLambdaStack extends cdk.Stack {
  public readonly helloLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const targetCfnOutput = 'CustomIamRole01-IamRoleExport';
    const importedRoleArn = cdk.Fn.importValue(targetCfnOutput);
    const importedRole = Role.fromRoleArn(this, 'ImportedRole', importedRoleArn);

    console.log(`importedRoleArn = ${importedRoleArn}`)
    console.log(`importedRole = ${importedRole}`)

    const helloLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
      role: importedRole,
    });

    new cdk.CfnOutput(this, 'helloLambdaOutput', {
      value: helloLambda.functionArn,
      description: 'test',
      exportName: 'helloLambdaOutput',
    });

    this.helloLambda = helloLambda;
  }
}

export interface CustomIamProps extends StackProps {}

export class CustomIamStack extends cdk.Stack {
  public readonly iamRole: Role;

  constructor(scope: Construct, id: string, props?: CustomIamProps) {
    super(scope, id, props);

    const roleName = 'CustomIamRole01';

    this.iamRole = new Role(this, 'CustomIamRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: roleName,
    });

    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess');
    this.iamRole.addManagedPolicy(s3ReadOnlyAccessPolicy);

    // CfnOutputを追加してiamRoleをエクスポート
    new cdk.CfnOutput(this, 'IamRoleExport', {
      value: this.iamRole.roleArn,
      exportName: roleName + '-IamRoleExport',
    });
  }
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const iamStackProps: CustomIamProps = {
  env: env,
};

const iamStack = new CustomIamStack(app, 'CustomIamStack', iamStackProps);
const helloLambdaStack = new CustomLambdaStack(app, 'HelloLambdaStack');

app.synth();
```

