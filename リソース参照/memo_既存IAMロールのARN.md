# CDK v2 (TypeScript) で既存のIAMロールのARNをロール名から取得する

## コード

IAMロール名 'AWSCloud9SSMAccessRole' のARNを取得する

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

const roleName = 'AWSCloud9SSMAccessRole'; // 既存のIAMロール名

const role = iam.Role.fromRoleName(stack, 'ExistingRole', roleName);

console.log('Role ARN:', role.roleArn); // roleのARN値を表示

app.synth();
```

## 実行

```console
$ cdk deploy
Role ARN: arn:${Token[AWS.Partition.7]}:iam::${Token[AWS.AccountId.4]}:role/AWSCloud9SSMAccessRole

✨  Synthesis time: 4.38s

MyStack: deploying... [1/1]

 ✅  MyStack (no changes)

✨  Deployment time: 0.41s

Stack ARN:
arn:aws:cloudformation:ap-northeast-1:1234567890123:stack/MyStack/12345678-1234-1234-1234-123456789012

✨  Total time: 4.79s
```



