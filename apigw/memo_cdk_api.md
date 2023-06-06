# API Gateway + lambdaのCDK v2 コード

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

lambdaを呼び出すAPI GWをシンプルに作る

- `bin/lamb.ts`
- `lib/lambda/hello.py`

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9,
            functionName: 'MyLambdaFunction', // Lambda 関数名を指定
            code: lambda.Code.fromAsset('lib/lambda'), // 指定ディレクトリからコードを取得
            handler: 'hello.lambda_handler', // hello.py ファイルの lambda_handler 関数を指定
        });


        const api = new apigateway.RestApi(this, 'HelloLambdaAPI', {
            restApiName: 'Hello Lambda API',
        });

        const helloLambdaIntegration = new apigateway.LambdaIntegration(helloLambda);
        api.root.addMethod('GET', helloLambdaIntegration);

    }
}

const app = new cdk.App();

new HelloLambdaStack(app, 'HelloLambdaStack');

app.synth();
```


## (2) スレッドを分ける（ーパターン１）

- LambdaとAPI GWを別スレッドで作る
- Lambdaを作るCFnスタックでAPIGWを作るCFnスタックを作るパターン


```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9,
            functionName: 'MyLambdaFunction', // Lambda 関数名を指定
            code: lambda.Code.fromAsset('lib/lambda'), // 指定ディレクトリからコードを取得
            handler: 'hello.lambda_handler', // hello.py ファイルの lambda_handler 関数を指定
        });
        new HelloLambdaAPI(this, 'HelloLambdaAPI', helloLambda);
    }
}

class HelloLambdaAPI extends cdk.Stack {
    constructor(scope: Construct, id: string, helloLambda: lambda.Function, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new apigateway.RestApi(this, 'HelloLambdaAPI', {
            restApiName: 'Hello Lambda API',
        });

        const helloLambdaIntegration = new apigateway.LambdaIntegration(helloLambda);
        api.root.addMethod('GET', helloLambdaIntegration);
    }
}

const app = new cdk.App();
new HelloLambdaStack(app, 'HelloLambdaStack');
app.synth();
```


## (3) スレッドを分けるーパターン２


- LambdaとAPI GWを別スレッドで作る
- Lambdaを作るCFnスタックとAPIGWを作るCFnスタックを個別に実行するパターン


```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

class HelloLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, helloLambdaAPI: HelloLambdaAPI, props?: cdk.StackProps) {
        super(scope, id, props);

        const helloLambda = new lambda.Function(this, 'HelloLambda', {
            runtime: lambda.Runtime.PYTHON_3_9,
            functionName: 'MyLambdaFunction',
            code: lambda.Code.fromAsset('lib/lambda'),
            handler: 'hello.lambda_handler',
        });

        helloLambdaAPI.addLambdaIntegration(helloLambda);
    }
}

class HelloLambdaAPI extends cdk.Stack {
    public readonly restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.restApi = new apigateway.RestApi(this, 'HelloLambdaAPI', {
            restApiName: 'Hello Lambda API',
        });
    }

    public addLambdaIntegration(lambdaFunction: lambda.Function) {
        const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);
        const helloLambdaResource = this.restApi.root.addResource('hello');
        helloLambdaResource.addMethod('GET', lambdaIntegration);
    }
}

const app = new cdk.App();

const helloLambdaAPI = new HelloLambdaAPI(app, 'HelloLambdaAPI');
const helloLambdaStack = new HelloLambdaStack(app, 'HelloLambdaStack', helloLambdaAPI);

app.synth();
```


## (4) パラメータ指定が少しある

```typescript
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps, aws_apigateway } from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';


export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'My API',
      description: 'My API Gateway',
      deployOptions: {
        stageName: 'prod'
      }
    });

    const sampleLambda = new lambda.Function(this, 'SampleLambda', {
      runtime: lambda.Runtime.PYTHON_3_9, // Python3のランタイムを指定
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    })

    // GET/sample を作成
    const sample = api.root.addResource("sample");
    const courseSearchIntegration = new aws_apigateway.LambdaIntegration(
      sampleLambda
    );
    sample.addMethod("GET", courseSearchIntegration);

    new cdk.CfnOutput(this, 'ApiGatewayEndpoint', {
      value: api.url
    });
  }
}

const app = new cdk.App();
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();

```



## (5) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue


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
                'aws:SourceVpce': 'vpce-12345678901234',
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




