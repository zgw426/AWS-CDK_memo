# lambdaのCDK v2 コード

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

```typescript
PJ_NAME=lamb
mkdir ${PJ_NAME}
cd ${PJ_NAME}

cdk init app --language typescript
npm run build

※lib/alambt.tsを編集

cdk deploy
```


## (1) シンプルにLambdaを作る

ただLambda関数を作るだけのコード

`bin/lamb.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9, // Python3のランタイムを指定
            code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
            handler: 'index.handler',
        })
    }
}

const app = new cdk.App();

new HelloLambdaStack(app, 'HelloLambdaStack');

app.synth();
```


## (2) Lambdaスクリプトを別ファイルにする

以下2つのファイルにする

- `bin/lamb.ts`
- `lib/lambda/hello.py`


`bin/lamb.ts`

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9,
            functionName: 'MyLambdaFunction', // Lambda 関数名を指定
            code: lambda.Code.fromAsset('lib/lambda'), // 指定ディレクトリからコードを取得
            handler: 'hello.lambda_handler', // hello.py ファイルの lambda_handler 関数を指定
        });
    }
}

const app = new cdk.App();

new HelloLambdaStack(app, 'HelloLambdaStack');

app.synth();
```


`lib/lambda/hello.py`

```typescript
import json

def lambda_handler(event, context):
    # TODO implement
    print("TEST")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
```


## (3) Lambdaスクリプトを別ファイルにする

複数のLambda関数を作る

以下のファイルにする

- `bin/lamb.ts`
- `lib/lambda/lambda1/hello.py`
- `lib/lambda/lambda2/hello.py`

`bin/lamb.ts`

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const lambdaNames = ['MyLambdaFunction1', 'MyLambdaFunction2'];
        const lambdaHandlers = ['hello.lambda_handler', 'hello.lambda_handler'];
        const codePaths = ['lib/lambda/lambda1', 'lib/lambda/lambda2'];

        for (let i = 0; i < lambdaNames.length; i++) {
            const helloLambda = new lambda.Function(this, `HelloLambda${i + 1}`, {
                runtime: lambda.Runtime.PYTHON_3_9,
                functionName: lambdaNames[i], // Lambda関数名を指定
                code: lambda.Code.fromAsset(codePaths[i]), // 指定ディレクトリからコードを取得
                handler: lambdaHandlers[i], // hello.pyファイルのlambda_handler関数を指定
            });
        }
    }
}

const app = new cdk.App();

new HelloLambdaStack(app, 'HelloLambdaStack');

app.synth();
```


`lib/lambda/lambda1/hello.py`

```typescript
import json

def lambda_handler(event, context):
    # TODO implement
    print("TEST01")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
```


`lib/lambda/lambda2/hello.py`

```typescript
import json

def lambda_handler(event, context):
    # TODO implement
    print("TEST02")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
```

## (4) クラス定義をlib配下に、動的値をJSONに格納

コードは sample_04 に格納


## (5) Lambdaの定義をJSON形式でまとめた（ただしIAMロールはJSONで指定できてない）

コードは sample_05 に格納

以下のようにLambdaの設定をJSONにまとめた

```typescript
const lambda_set: string = `{
  "lambdas": [
      {
        "note": "メモこれは lambda01 です",
        "lambdaName": "CustomLambdaFunction01",
        "lambdaHandler": "a01-sample.lambda_handler",
        "codePath": "lib/data/lambda/a01"
      },
      {
        "note": "メモこれは lambda02 です",  
        "lambdaName": "CustomLambdaFunction02",
        "lambdaHandler": "a02-sample.lambda_handler",
        "codePath": "lib/data/lambda/a02"
      }
  ]
}`;
```



## (6) 既存のIAMロールを指定しLambdaを作る

既存のIAMロール 'lambda-role' を指定しLambdaを作る

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const roleName = 'lambda-role'; // 既存のIAMロール名
        const role = iam.Role.fromRoleName(this, 'ExistingRole', roleName);
        console.log('Role ARN:', role.roleArn); // roleのARN値を表示

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9, // Python3のランタイムを指定
            code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
            handler: 'index.handler',
            role: role,
        });
    }
}

const app = new cdk.App();

new HelloLambdaStack(app, 'HelloLambdaStack');

app.synth();
```


## (7) Lambdaの定義をJSON形式でまとめた（IAMロール含む）

コードは sample_07 に格納

- サンプル(5)(6)をマージしたもの
    - (5) Lambdaの定義をJSON形式でまとめた（ただしIAMロールはJSONで指定できてない）
    - (6) 既存のIAMロールを指定しLambdaを作る


## (8) 作ったLambdaとEventBridgeでキックする

Lambdaと、定期的にLambdaを実行するEventBridgeを作る

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';

class CustomLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9, // Python3のランタイムを指定
            code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
            handler: 'index.handler',
        })

        // EventBridgeルールを作成し、毎日実行するトリガーを設定
        const rule = new events.Rule(this, 'MyEventBridgeRule', {
          //schedule: events.Schedule.cron({ minute: '0', hour: '0' }), // 毎日午前0時に実行
          //schedule: events.Schedule.expression('cron(0 3 ? * 5 *)'), // 毎週木曜のAM3時に実行
          schedule: events.Schedule.rate(cdk.Duration.minutes(10)), // 10分ごとに実行
        });

    }//--- Constructor ---//
}

const app = new cdk.App();

new CustomLambdaStack(app, 'CustomLambdaStack');

app.synth();
```

## (9) PrivateなAPI GWを作る

エンドポイントタイプが Private(プライベート) の APIGW を作る

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambda
    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9, // Python3のランタイムを指定
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    })

    // API Gateway
    const privateApi = new apigateway.LambdaRestApi(this, 'privateApi', {
      endpointTypes: [apigateway.EndpointType.PRIVATE],
      handler: lambdaFunction,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            effect: iam.Effect.DENY,
            conditions: {
              StringNotEquals: {
                "aws:SourceVpce": 'vpce-06feb730e9cec5870'
              }
            }
          }),
          new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            effect: iam.Effect.ALLOW
          })
        ]
      })
    });

  }
}

const app = new App();
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```

## (9) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue


```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    new cdk.CfnOutput(this, 'helloLambdaOutput', {
      value: lambdaFunction.functionArn,
      description: 'lambdaFunction-functionArn',
      exportName: 'helloLambdaOutput',
    });
  }
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const targetCfnOutput = 'helloLambdaOutput';
    const targetResource = cdk.Fn.importValue(targetCfnOutput);

    const lambdaFunction = lambda.Function.fromFunctionArn(
      this,
      'ImportedLambda',
      targetResource
    );

    const privateApi = new apigateway.LambdaRestApi(this, 'privateApi', {
      handler: lambdaFunction,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            effect: iam.Effect.DENY,
            conditions: {
              StringNotEquals: {
                'aws:SourceVpce': 'vpce-06feb730e9cec5870',
              },
            },
          }),
          new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


