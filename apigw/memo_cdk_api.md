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



## (5-1) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- ※事前にVPCエンドポイントの作成が必要
    - エンドポイントタイプ interface
    - サービス　com.amazonaws.ap-northeast-1.execute-api


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


## (5-2) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- エンドポイントタイプが Edge の場合


```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
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

    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.EDGE],
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```



## (5-3) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- アクセスログの有効化

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput; // helloLambdaOutputプロパティを追加

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    // API Gatewayを作成する
    const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(prdLogGroup), // LogGroupLogDestinationの引数を修正
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログのフォーマットを設定する
      },
    });

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (5-4) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- CloudWatchログのログレベル
  - loggingLevel: apigateway.MethodLoggingLevel 
    - apigateway.MethodLoggingLevel.OFF       : オフ
    - apigateway.MethodLoggingLevel.INFO      : エラーと情報ログ
    - apigateway.MethodLoggingLevel.ERROR     : エラーのみ

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput; // helloLambdaOutputプロパティを追加

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    // API Gatewayを作成する
    const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(prdLogGroup), // LogGroupLogDestinationの引数を修正
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログのフォーマットを設定する
        loggingLevel: apigateway.MethodLoggingLevel.ERROR, 
            // OFF : オフ
            // INFO: エラーと情報ログ
            // ERROR:エラーのみ
      },
    });

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (5-5) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- ログの形式を CLF にする

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput; // helloLambdaOutputプロパティを追加

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    // API Gatewayを作成する
    const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(prdLogGroup), // LogGroupLogDestinationの引数を修正
        accessLogFormat: apigateway.AccessLogFormat.clf(),
        //accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログのフォーマットを設定する
        /*
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        */

        loggingLevel: apigateway.MethodLoggingLevel.ERROR, 
            // OFF : オフ
            // INFO: エラーと情報ログ
            // ERROR:エラーのみ
      },
    });

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (5-6) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- 以下の設定ができるようになった
  - ステージ名
  - CloudWatch メトリクスを有効化
  - Access Log Destination ARN

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: `/aws/apigateway/aaaaaaaaaaaaaaaaaaaarest-api-access-log`,
        retention: 365,
      },
    );

    // API Gatewayを作成する
    //const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: {
        //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.StageOptions.html
        accessLogFormat: apigateway.AccessLogFormat.clf(), // CloudWatchログ
        //accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログのフォーマットを設定する
        /*
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        */

        loggingLevel: apigateway.MethodLoggingLevel.INFO, 
            // OFF : オフ
            // INFO: エラーと情報ログ
            // ERROR:エラーのみ
        stageName: "hogefuga", // ステージ名
        metricsEnabled: true, // CloudWatch メトリクスを有効化
        accessLogDestination: new apigateway.LogGroupLogDestination( restApiLogAccessLogGroup, ), // Access Log Destination ARN
      },
    });

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```




## (5-7) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue


- 以下の作成ができるようになった
  - リソースとメソッド
  - CORS

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: `/aws/apigateway/aaaaaaaaaaaaaaaaaaaarest-api-access-log`,
        retention: 365,
      },
    );

    // API Gatewayを作成する
    //const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaRestApi.html
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
        // .EDGE
        // .REGIONAL
      restApiName: "apigatewayhogepiyo", // API名
      proxy: false,
      deployOptions: {
        //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.StageOptions.html
        accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
        //accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログの形式 JSON
        /*
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        */

        loggingLevel: apigateway.MethodLoggingLevel.INFO, 
          // OFF : オフ
          // INFO: エラーと情報ログ
          // ERROR:エラーのみ
        stageName: "hogefuga", // ステージ名
        metricsEnabled: true, // CloudWatch メトリクスを有効化
        accessLogDestination: new apigateway.LogGroupLogDestination( restApiLogAccessLogGroup, ), // Access Log Destination ARN
      },
      /*
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
      */
    });

    api.root.addMethod('GET'); // GETメソッドを追加
    api.root.addMethod('ANY'); // ANYメソッドを追加

    const items = api.root.addResource('items'); // リソースを追加
    items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
    items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (5-8) 別スタックで作ったLambdaを参照しPrivateなAPI GWを作る：CFnOutput - Fn.importValue

- ログの形式(CLF, JSON, XML, CSV)に対応

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
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

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: `/aws/apigateway/aaaaaaaaaaaaaaaaaaaarest-api-access-log`,
        retention: 365,
      },
    );

    // API Gatewayを作成する
    //const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaRestApi.html
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
        // .EDGE
        // .REGIONAL
      restApiName: "apigatewayhogepiyo", // API名
      proxy: false,
      deployOptions: {
        //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.StageOptions.html
        //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.AccessLogFormat.html
        accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
        //accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(), // ログの形式 JSON
        //ログの形式 XML
        //accessLogFormat: apigateway.AccessLogFormat.custom(`<request id="$context.requestId"> <ip>$context.identity.sourceIp</ip> <caller>$context.identity.caller</caller> <user>$context.identity.user</user> <requestTime>$context.requestTime</requestTime> <httpMethod>$context.httpMethod</httpMethod> <resourcePath>$context.resourcePath</resourcePath> <status>$context.status</status> <protocol>$context.protocol</protocol> <responseLength>$context.responseLength</responseLength> </request>`),
        //ログの形式 CSV
        //accessLogFormat: apigateway.AccessLogFormat.custom(`$context.identity.sourceIp,$context.identity.caller,$context.identity.user,$context.requestTime,$context.httpMethod,$context.resourcePath,$context.protocol,$context.status,$context.responseLength,$context.requestId`),
        /*
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        */

        loggingLevel: apigateway.MethodLoggingLevel.INFO, 
          // OFF : オフ
          // INFO: エラーと情報ログ
          // ERROR:エラーのみ
        stageName: "hogefuga", // ステージ名
        metricsEnabled: true, // CloudWatch メトリクスを有効化
        accessLogDestination: new apigateway.LogGroupLogDestination( restApiLogAccessLogGroup, ), // Access Log Destination ARN
      },
      /*
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
      */
    });

    api.root.addMethod('GET'); // GETメソッドを追加
    api.root.addMethod('ANY'); // ANYメソッドを追加

    const items = api.root.addResource('items'); // リソースを追加
    items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
    items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (6-1) 既存のCloudWatch ロググループを指定_logs.LogGroup.fromLogGroupName()

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
      value: lambdaFunction.functionArn,
      description: 'lambdaFunction-functionArn',
      exportName: 'helloLambdaOutput',
    });
  }
}

export class CloudWatchStack extends Stack {
  public readonly cloudWatchOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: '/aws/apigateway/aaaaa999999999999rest-api-access-log',
        retention: logs.RetentionDays.ONE_YEAR,
      },
    );

    this.cloudWatchOutput = new cdk.CfnOutput(this, 'CloudWatchOutput', {
      value: restApiLogAccessLogGroup.logGroupName,
      description: 'CloudWatch Log Group ARN',
      exportName: 'CloudWatchLogGroupArn',
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


    // 既存のCloudWatchロググループの名前
    const existingLogGroupName = '/aws/apigateway/aaaaa999999999999rest-api-access-log';
    // 既存のCloudWatchロググループを取得
    const existingLogGroup = logs.LogGroup.fromLogGroupName(this, 'ExistingLogGroup', existingLogGroupName);

    // API Gatewayを作成する
    //const prdLogGroup = new logs.LogGroup(this, "PrdLogs");
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaRestApi.html
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      restApiName: "apigatewayhogepiyo", // API名
      proxy: false,
      deployOptions: {
        accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
        loggingLevel: apigateway.MethodLoggingLevel.INFO, 
        stageName: "hogefuga", // ステージ名
        metricsEnabled: true, // CloudWatch メトリクスを有効化
        accessLogDestination: new apigateway.LogGroupLogDestination(existingLogGroup),
      },
    });

    api.root.addMethod('GET'); // GETメソッドを追加
    api.root.addMethod('ANY'); // ANYメソッドを追加

    const items = api.root.addResource('items'); // リソースを追加
    items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
    items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new CloudWatchStack(app, 'CloudWatchStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```


## (6-2) 既存のCloudWatch ロググループを指定_cdk.Fn.importValue

```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class LambdaStack extends Stack {
  public readonly helloLambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def handler(event, context):\n    print("Hello")'),
      handler: 'index.handler',
    });

    this.helloLambdaOutput = new cdk.CfnOutput(this, 'helloLambdaOutput', {
      value: lambdaFunction.functionArn,
      description: 'lambdaFunction-functionArn',
      exportName: 'helloLambdaOutput',
    });
  }
}

export class CloudWatchStack extends Stack {
  public readonly cloudWatchOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: '/aws/apigateway/aaaaa999999999999rest-api-access-log',
        retention: logs.RetentionDays.ONE_YEAR,
      },
    );

    this.cloudWatchOutput = new cdk.CfnOutput(this, 'CloudWatchOutput', {
      value: restApiLogAccessLogGroup.logGroupName,
      description: 'CloudWatch Log Group ARN',
      exportName: 'CloudWatchLogGroupArn',
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

    // 別スタックのエスポートした値(CFn.Output)を取得
    const existingLogGroupName = cdk.Fn.importValue('CloudWatchLogGroupArn');
    // 既存のCloudWatchロググループを取得
    const existingLogGroup = logs.LogGroup.fromLogGroupName(this, 'ExistingLogGroup', existingLogGroupName);

    // API Gatewayを作成する
    const api = new apigateway.LambdaRestApi(this, 'publicApi', {
      handler: lambdaFunction,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      restApiName: "apigatewayhogepiyo", // API名
      proxy: false,
      deployOptions: {
        accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
        loggingLevel: apigateway.MethodLoggingLevel.INFO, 
        stageName: "hogefuga", // ステージ名
        metricsEnabled: true, // CloudWatch メトリクスを有効化
        accessLogDestination: new apigateway.LogGroupLogDestination(existingLogGroup),
      },
    });

    api.root.addMethod('GET'); // GETメソッドを追加
    api.root.addMethod('ANY'); // ANYメソッドを追加

    const items = api.root.addResource('items'); // リソースを追加
    items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
    items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加

    new cdk.CfnOutput(this, 'apiGatewayOutput', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

const app = new App();
new LambdaStack(app, 'LambdaStack');
new CloudWatchStack(app, 'CloudWatchStack');
new ApiGatewayStack(app, 'ApiGatewayStack');
app.synth();
```

## (7) クラスをlib配下におく

サンプルコードをディレクトリ `07` に格納

## (8) カスタムドメイン名の作成を追加

- カスタムドメイン名を作成する処理を追加
- コード実行前にACMが必要（サンプルではオレオレ証明書をインポートして作成した）
- 以下は`07/lib/stack/apigateway-stack.ts`を抜粋しカスタムドメインの処理を追加したもの

```typescript:07/lib/stack/apigateway-stack.ts
export class CustomApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomApiGatewayProps) {
    super(scope, id, props);

    const jsonList: apigws[] = props.apigwSet;

    for (const valSet of jsonList) {
        const existingLogGroup = logs.LogGroup.fromLogGroupName(this, 'ExistingLogGroup', valSet.accessLogDestination);
        const lambdaName = valSet.lambdaName;
        const targetResource = cdk.Fn.importValue(lambdaName);
        const lambdaFunction = lambda.Function.fromFunctionArn(
          this,
          'ImportedLambda',
          targetResource
        );

        let endpointType;
        switch(valSet.endpointTypes){
            case "EDGE": endpointType = [apigateway.EndpointType.EDGE]; break;
            case "REGIONAL": endpointType = [apigateway.EndpointType.REGIONAL]; break;
        }

        // API Gatewayを作成する
        const api = new apigateway.LambdaRestApi(this, valSet.restApiName, {
            handler: lambdaFunction,
            endpointTypes: endpointType,
            restApiName: valSet.restApiName, // API名
            proxy: false,
            deployOptions: {
                accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
                loggingLevel: apigateway.MethodLoggingLevel.INFO, 
                stageName: valSet.stageName, // ステージ名
                metricsEnabled: valSet.metricsEnabled, // CloudWatch メトリクスを有効化
                accessLogDestination: new apigateway.LogGroupLogDestination(existingLogGroup),
            },
        });
    
        api.root.addMethod('GET'); // GETメソッドを追加
        api.root.addMethod('ANY'); // ANYメソッドを追加
    
        const items = api.root.addResource('items'); // リソースを追加
        items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
        items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加

        //カスタムドメイン名 の作成
        const certificate = acm.Certificate.fromCertificateArn(this, "cert", "arn:aws:acm:ap-northeast-1:123456789012:certificate/12345678-1234-1234-1234-12345678901234");

        const domain = new apigateway.DomainName(this, "domain-name", {
            domainName: "test.hoge.fuga.local",
            certificate: certificate,
            endpointType: apigateway.EndpointType.REGIONAL,
            securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
        });

        new cdk.CfnOutput(this, 'apiGatewayOutput', {
            value: api.url,
            description: 'API Gateway URL',
        });
    } //--- LOOP jsonList ---//
  } //--- constructor ---//
} //--- class CustomApiGatewayStack ---/
```
