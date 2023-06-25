import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface CustomApiGatewayProps extends StackProps {
    apigwSet: apigws[];
}


export interface apigws {
  note: string; // 備考
  restApiName: string; // API名
  stageName: string; // ステージ名
  metricsEnabled: boolean; // CloudWatch メトリクスを有効化
  accessLogDestination: string;
  lambdaName: string; // Lambda
  endpointTypes: string; // エンドポイントタイプ "REGIONAL","EDGE"
}


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
    
        new cdk.CfnOutput(this, 'apiGatewayOutput', {
            value: api.restApiId,
            description: 'API GateWay REST API',
            exportName: 'apigw-id' // エクスポート名を設定
        });
    } //--- LOOP jsonList ---//
  } //--- constructor ---//
} //--- class CustomApiGatewayStack ---/
