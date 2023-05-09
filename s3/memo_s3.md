
# chatgptプロンプト

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

# ChatGPT回答


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


