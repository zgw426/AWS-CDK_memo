# S3バケットを作成するCDK v2 スクリプト(TypeScript)

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


## サンプル１

### chatgptプロンプト

```
#命令書
あなたはプロのプログラマーです。以下の制約条件に従って、入力する条件をもとにスクリプトをかいてください。

#制約条件
・aws cdk v2 スクリプト
・プログラム言語はTypeScript
・cdkコマンドは東京リージョンの環境で実行

#入力する文章
s3バケットを作成するCDKスクリプトを作成してください
```

### ChatGPT回答


以下は、TypeScriptを使用してAWS CDK v2でS3バケットを作成するスクリプトの例です。このスクリプトは東京リージョンの環境で実行されることを前提としています。

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-unique-bucket-name',
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```

このスクリプトでは、`aws-cdk-lib`パッケージから必要なモジュールをインポートし、`MyStack`というCDKスタッククラスを定義しています。`MyStack`のコンストラクタ内で、`Bucket`クラスを使用してS3バケットを作成しています。
S3バケットの名前は`bucketName`プロパティで指定します。上記の例では、バケット名を"my-unique-bucket-name"として指定していますが、実際の使用時には一意のバケット名に変更してください。
最後に、`App`クラスを使用してアプリケーションを合成し、`app.synth()`を呼び出してCloudFormationテンプレートを生成します。
このスクリプトをTypeScriptファイルとして保存し、AWS CDK v2の環境で実行してください。実行すると、指定したバケット名でS3バケットが作成されます。



## サンプル２

### chatgptプロンプト

#命令書
あなたはプロのプログラマーです。以下の制約条件に従って、入力する条件をもとにスクリプトをかいてください。

#制約条件
・aws cdk v2 スクリプト
・プログラム言語はTypeScript
・cdk deployは東京リージョンで実行
・デプロイするリソースは東京リージョン

#入力する文章
以下のスクリプトを参考にして、S3バケットを作成するスクリプトを書いて

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-unique-bucket-name',
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
```

### chatgpt回答


```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-unique-bucket-name',
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack', {
  env: {
    region: 'ap-northeast-1'
  }
});
app.synth();
```



------


## サンプル３

東京リージョンのCDK環境(Cloud9)からバージニアリージョンにS3バケットをデプロイするコード

デプロイする前の準備
以下コマンドでバージニアリージョンでCDK使えるようにする（東京リージョンのCDK環境(Cloud9)で実行）

```console
cdk bootstrap aws://123456789123/us-east-1
```

デプロイする

```console
cdk deploy
```

```typescript
#!/usr/bin/env node
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-piyo-bucket-name-20230518',
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack', {
  env: {
    region: 'us-east-1'
  }
});
app.synth();
```


## サンプル４

東京リージョンのCDK環境(Cloud9)からバージニアリージョンと大阪リージョンにS3バケットをデプロイするコード

デプロイする前の準備
以下コマンドでバージニアリージョンでCDK使えるようにする（東京リージョンのCDK環境(Cloud9)で実行）

```console
cdk bootstrap aws://123456789123/us-east-1
cdk bootstrap aws://123456789123/ap-northeast-3
```

デプロイする

```console
cdk deploy
```

CDKコード

```typescript
#!/usr/bin/env node
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

class MyStack01 extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-piyo02-bucket-name-20230519-01',
    });
  }
}

class MyStack02 extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-piyo02-bucket-name-20230519-02',
    });
  }
}

const app = new App();
new MyStack01(app, 'MyStack01', {  env: {  region: 'us-east-1'  }});
new MyStack02(app, 'MyStack02', {  env: {  region: 'ap-northeast-3'  }});

app.synth();
```


## サンプル５


KMSカスタマーキーを作りS3を暗号化する

```typescript
#!/usr/bin/env node
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';

class MyStack01 extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // KMSカスタマーキーを作成
    const kmsKey = new Key(this, 'MyKmsKey01', {
      enableKeyRotation: true, // キーの自動ローテーションを有効にする場合
    });

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-piyo01-bucket-name-20230519-03',
      encryption: BucketEncryption.KMS,
      encryptionKey: kmsKey,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}

class MyStack02 extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // KMSカスタマーキーを作成
    const kmsKey = new Key(this, 'MyKmsKey02', {
      enableKeyRotation: true, // キーの自動ローテーションを有効にする場合
    });

    // S3バケットを作成
    const bucket = new Bucket(this, 'MyBucket', {
      bucketName: 'my-piyo02-bucket-name-20230519-03',
      encryption: BucketEncryption.KMS,
      encryptionKey: kmsKey,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}

const app = new App();
new MyStack01(app, 'MyStack01', { env: { region: 'us-east-1' } });
new MyStack02(app, 'MyStack02', { env: { region: 'ap-northeast-3' } });

app.synth();
```


## サンプル６

S3バケットを複数まとめて作る

```typescript
#!/usr/bin/env node
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';


export interface CustomS3BucketProps extends StackProps {
  s3DataSet: S3DataSet[];
}

export interface S3DataSet{
  bucketName: string;
}

class CustomS3BucketStack extends Stack {
  constructor(scope: App, id: string, props: CustomS3BucketProps) {
    super(scope, id, props);

    for (const dataSet of props.s3DataSet) {
      // S3バケットを作成
      const bucket = new Bucket(this, dataSet.bucketName, {
        bucketName: dataSet.bucketName,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}


const app = new App();

const s3DataSet: S3DataSet[] = [
  {
    "bucketName": "hoge-bucket-name-20230708-01",
  },
  {
    "bucketName": "hoge-bucket-name-20230708-02",
  },
];

const customS3BucketProps: CustomS3BucketProps = {
  s3DataSet: s3DataSet,
  env: {  region: 'ap-northeast-1'  }
}

new CustomS3BucketStack(app, 'CustomStack01', customS3BucketProps );

app.synth();
```


## サンプル７

- サンプル６（S3バケットを複数まとめて作る）を、以下２通りのクロススタック参照できるようにした
  - CfnOutput
  - public readonly


```typescript
#!/usr/bin/env node
import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';


export interface CustomS3BucketProps extends StackProps {
  s3DataSet: S3DataSet[];
}

export interface S3DataSet{
  bucketName: string;
}

class CustomS3BucketStack extends Stack {
  public readonly buckets: { [bucketName: string]: Bucket };

  constructor(scope: App, id: string, props: CustomS3BucketProps) {
    super(scope, id, props);

    this.buckets = {}; // バケットオブジェクトを保持するオブジェクトを初期化

    for (const dataSet of props.s3DataSet) {
      // S3バケットを作成
      const bucket = new Bucket(this, dataSet.bucketName, {
        bucketName: dataSet.bucketName,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      // Export する
      new CfnOutput(this, `${dataSet.bucketName}Output`, {
        value: bucket.bucketName,
        exportName: `${dataSet.bucketName}Export`,
      });

      this.buckets[dataSet.bucketName] = bucket;
    } //--- for ---//
  }
}


const app = new App();

const s3DataSet: S3DataSet[] = [
  {
    "bucketName": "hoge-bucket-name-20230708-01",
  },
  {
    "bucketName": "hoge-bucket-name-20230708-02",
  },
];

const customS3BucketProps: CustomS3BucketProps = {
  s3DataSet: s3DataSet,
  env: {  region: 'ap-northeast-1'  }
}

const customStack01 = new CustomS3BucketStack(app, 'CustomStack01', customS3BucketProps );


// 変数に格納して使用
const bucket1 = customStack01.buckets["hoge-bucket-name-20230708-01"];
const bucket2 = customStack01.buckets["hoge-bucket-name-20230708-02"];

console.log('Bucket 1:', bucket1.bucketName);
console.log('Bucket 2:', bucket2.bucketName);

app.synth();
```


