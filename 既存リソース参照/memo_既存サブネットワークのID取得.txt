# CDK v2 (TypeScript) で既存のサブネットワークのIDをNameタグから取得する

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

Nameタグの値が `sub1` のサブネットワークのIDを取得する

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as AWS from 'aws-sdk';
import { App, StackProps } from 'aws-cdk-lib';

async function getSubnetIdByTag(tagName: string, tagValue: string): Promise<string | undefined> {
  const ec2Client = new AWS.EC2();
  const describeResponse = await ec2Client.describeSubnets().promise();

  const subnet = describeResponse.Subnets?.find((subnet: AWS.EC2.Subnet) => {
    const tags = subnet.Tags || [];
    return tags.some((tag: AWS.EC2.Tag) => tag.Key === tagName && tag.Value === tagValue);
  });

  return subnet?.SubnetId;
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const subnetName = 'sub1';
    const subnetIdPromise = getSubnetIdByTag('Name', subnetName);

    subnetIdPromise.then((subnetId) => {
      if (subnetId) {
        console.log(`サブネットワーク '${subnetName}' のID: ${subnetId}`);
      } else {
        console.log(`サブネットワーク '${subnetName}' は見つかりませんでした。`);
      }
    });
  }
}

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const stack = new MyStack(app, 'MyStackTest', { env });

app.synth();
```

## 実行例

```console
$ cdk deploy
(node:2976) NOTE: We are formalizing our plans to enter AWS SDK for JavaScript (v2) into maintenance mode in 2023.

Please migrate your code to use AWS SDK for JavaScript (v3).
For more information, check the migration guide at https://a.co/7PzMCcy
(Use `node --trace-warnings ...` to show where the warning was created)
サブネットワーク 'sub1' のID: subnet-12345678901234567

✨  Synthesis time: 8.63s

MyStackTest: deploying... [1/1]

 ✅  MyStackTest (no changes)

✨  Deployment time: 0.42s

Stack ARN:
arn:aws:cloudformation:ap-northeast-1:1234567890123:stack/MyStackTest/12312312-ffff-1111-12345-123456789

✨  Total time: 9.05s
```
