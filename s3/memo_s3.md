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

東京リージョンのCDK環境(Cloud9)でバージニアリージョンでCDK使えるようにする

```console
cdk bootstrap aws://123456789123/us-east-1
```

```console
cdk deploy --role cdk-hnb659fds-cfn-exec-role-123456789123-us-east-1
```


うまく動いてないスクリプト

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

