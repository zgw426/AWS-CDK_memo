# CDK v2 (TypeScript) で既存のSecurityGroupのIDをNameタグから取得する

## 環境準備

AWS SDKのモジュールのインストールが必要
インストールしておかないと、Cannot find module 'aws-sdk'というエラーメッセージが表示される

以下コマンドでAWS SDKモジュールをインストールする

```console
npm install aws-sdk
npm install --save-dev @types/aws-sdk
```

プロジェクト新規に作るときならこのようにすればいけるはず

```typescript
PJ_NAME=t3
mkdir ${PJ_NAME}
cd ${PJ_NAME}

cdk init app --language typescript
npm run build

npm install aws-sdk
npm install --save-dev @types/aws-sdk

※lib/alambt.tsを編集

cdk deploy
```


## サンプルコード

Nameタグの値が `default_SG` のセキュリティグループのIDを取得する

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as AWS from 'aws-sdk';
import { App, StackProps } from 'aws-cdk-lib';



async function getSecurityGroupIdByTag(tagName: string, tagValue: string): Promise<string | undefined> {
  const ec2Client = new AWS.EC2();
  const describeResponse = await ec2Client.describeSecurityGroups().promise();

  const securityGroup = describeResponse.SecurityGroups?.find((sg: AWS.EC2.SecurityGroup) => {
    const tags = sg.Tags || [];
    return tags.some((tag: AWS.EC2.Tag) => tag.Key === tagName && tag.Value === tagValue);
  });

  return securityGroup?.GroupId;
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const securityGroupName = 'default_SG';
    const securityGroupIdPromise = getSecurityGroupIdByTag('Name', securityGroupName);

    securityGroupIdPromise.then((securityGroupId) => {
      if (securityGroupId) {
        console.log(`セキュリティグループ '${securityGroupName}' のID: ${securityGroupId}`);
      } else {
        console.log(`セキュリティグループ '${securityGroupName}' は見つかりませんでした。`);
      }
    });
  }
}


const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const vpcStack = new MyStack(app, 'MyStackTest', { env });

app.synth();
```

## 実行例

サンプルコードの実行時のメッセージ

```console
$ cdk deploy 
(node:1400) NOTE: We are formalizing our plans to enter AWS SDK for JavaScript (v2) into maintenance mode in 2023.

Please migrate your code to use AWS SDK for JavaScript (v3).
For more information, check the migration guide at https://a.co/7PzMCcy
(Use `node --trace-warnings ...` to show where the warning was created)
セキュリティグループ 'default_SG' のID: sg-123456789

✨  Synthesis time: 8.42s

MyStackTest: deploying... [1/1]

 ✅  MyStackTest (no changes)

✨  Deployment time: 0.41s

Stack ARN:
arn:aws:cloudformation:ap-northeast-1:1234567890123:stack/MyStackTest/12345678-ffff-1111-9999-123412341234

✨  Total time: 8.83s
```

