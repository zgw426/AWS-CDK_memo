# CDK v2 TypeScript で Sercret Manger を作る

## サンプル（１）

指定したＩＤとパスワードで作る

```typescript
import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 指定されたIDとパスワード
    const secretId = 'your-secret-id';
    const password = 'your-password';

    // Secret Managerのシークレットを作成
    const secret = new secretsmanager.Secret(this, 'Secret', {
      secretName: secretId,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ password: password }),
        generateStringKey: 'password',
      },
    });

    // 出力
    new cdk.CfnOutput(this, 'SecretArn', { value: secret.secretArn });
  }
}

// スタックを構築
const app = new cdk.App();
new SecretManagerStack(app, 'SecretManagerStack');
```

## サンプル（２）

パスワードをランダム文字列で設定する

```typescript
import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 指定されたID
    const secretId = 'your-secret-id';

    // ランダムなパスワードを生成
    const password = generateRandomPassword(16);
    console.log(`password = ${password}`);

    // Secret Managerのシークレットを作成
    const secret = new secretsmanager.Secret(this, 'Secret', {
      secretName: secretId,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ password: password }),
        generateStringKey: 'password',
      },
    });

    // 出力
    new cdk.CfnOutput(this, 'SecretArn', { value: secret.secretArn });
  }
}

// スタックを構築
const app = new cdk.App();
new SecretManagerStack(app, 'SecretManagerStack');

// ランダムなパスワードを生成する関数
function generateRandomPassword(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

```


## サンプル（３）

パスワードをランダム文字列にする。ただし、英大文字、英小文字、数字は必ず１つ含む。

```typescript
import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 指定されたID
    const secretId = 'your-secret-id';

    // ランダムなパスワードを生成
    const password = generateRandomPassword(16);
    console.log(`password = ${password}`);

    // Secret Managerのシークレットを作成
    const secret = new secretsmanager.Secret(this, 'Secret', {
      secretName: secretId,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ password: password }),
        generateStringKey: 'password',
      },
    });

    // 出力
    new cdk.CfnOutput(this, 'SecretArn', { value: secret.secretArn });
  }
}

// スタックを構築
const app = new cdk.App();
new SecretManagerStack(app, 'SecretManagerStack');

// ランダムなパスワードを生成する関数
function generateRandomPassword(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const lowercaseCharacters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numericCharacters = '0123456789';

  let password = '';

  // 最低限1つの英大文字、英小文字、数字が含まれるようにする
  password += lowercaseCharacters[Math.floor(Math.random() * lowercaseCharacters.length)];
  password += uppercaseCharacters[Math.floor(Math.random() * uppercaseCharacters.length)];
  password += numericCharacters[Math.floor(Math.random() * numericCharacters.length)];

  // 残りの文字を生成
  const remainingLength = length - 3;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  // 文字列をシャッフルする
  password = shuffleString(password);

  return password;
}

// 文字列をシャッフルする関数
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}
```








## サンプル（４）

- サンプルコードは `04` フォルダに格納
- クラス定義を lib 配下に格納

以下は、サンプルコードで作ったsecret managerの情報を取得したもの。パスワードが期待した文字列になっていない(特殊文字列が含まれている)

```console
$ aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-001-xPyyTw
{
    "ARN": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-001-xPyyTw",
    "Name": "your-secret-id-001",
    "VersionId": "e8b739f4-ae49-612d-6a5a-cb8f40f6ddc5",
    "SecretString": "{\"password\":\"T@-E:q@iM}1FU8uq;xH{q4Mu9tp!P_Ov\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2023-06-24T08:29:13.381000+09:00"
}
$ aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-002-o2FDU8
{
    "ARN": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-002-o2FDU8",
    "Name": "your-secret-id-002",
    "VersionId": "5d57b498-c526-16e0-49c6-097f506f8488",
    "SecretString": "{\"password\":\"/2@vPQp8K@SEs/C1eecs')*Inb%04H^h\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2023-06-24T08:29:13.542000+09:00"
}
```

```console
$ aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-001-JsKLrN
{
    "ARN": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:your-secret-id-001-JsKLrN",
    "Name": "your-secret-id-001",
    "VersionId": "a10819e9-7b4a-1494-394f-1ecdd8e9a32c",
    "SecretString": "{\"password\":\"'=b0fq@bv2Y2wDlVnTaD2yKy49V\\\"M[0\\\\\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2023-06-24T08:53:27.916000+09:00"
}
```
