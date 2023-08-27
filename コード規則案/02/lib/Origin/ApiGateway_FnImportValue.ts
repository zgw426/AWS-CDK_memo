import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from './Common';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

///////////////////////////////////////////////////////////
// ApiGateway
// メモ：Lambda参照に Fn.importValue 使用
// 接頭：ApiGatewayFnImp

export interface ApiGatewayFnImpProps extends StackProps {
  pjHeadStr: string; // pjName + pjEnv
  ApiGatewayFnImpSet: ApiGatewayFnImpSet[];
}

export interface ApiGatewayFnImpSet{
  pjHeadStr: string;
  restApiName: string;
  lambdaName: string;
  endpointTypes: string;
  stageName: string;
  metricsEnabled: boolean;
  accessLogDestination: string;
}

export class ApiGatewayFnImpStack extends Stack {
    public readonly pubApiGateway: { [restApiName: string]: apigateway.RestApi };

    constructor(scope: App, id: string, props: ApiGatewayFnImpProps) {
      super(scope, id, props);
      this.pubApiGateway = {};
      this.createApiGatewayFunc(props);
    }

    private createApiGatewayFunc(props: ApiGatewayFnImpProps) {
      let index = 0;
      for (const dataSet of props.ApiGatewayFnImpSet) {
        try{
          const ApiGatewayFullName = `${props.pjHeadStr}${dataSet.restApiName}`;
          const cfnName = replaceUnderscore(`${ApiGatewayFullName}`);

          const logGroupId = `LogGroup${index}`;
          const logGroup = logs.LogGroup.fromLogGroupName(this, logGroupId, dataSet.accessLogDestination);
          const lambdaName = dataSet.lambdaName;
          const targetResource = cdk.Fn.importValue(lambdaName);

          //* -----------------------------------------------
          const importedLambdaId = `ImportedLambda${index}`;
          const lambdaInvokeRoleId = `LambdaInvokeRole${index}`;
          const lambdaFunction = lambda.Function.fromFunctionAttributes(this, importedLambdaId, {
            functionArn: targetResource,
            role: new iam.Role(this, lambdaInvokeRoleId, {
              assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            }),
            sameEnvironment: true
          });
          
          // Lambda リソースベースのポリシーステートメントの作成
          lambdaFunction.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
          //------------------------------------------------------ */

          /* //これも動く
          const lambdaFunction = lambda.Function.fromFunctionAttributes(this, 'ImportedLambda', {
            functionArn: targetResource,
            sameEnvironment: true,
          });
          
          // Lambda リソースベースのポリシーステートメントの作成
          lambdaFunction.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
          */
          
          let endpointType;
          switch(dataSet.endpointTypes){
              case "EDGE": endpointType = [apigateway.EndpointType.EDGE]; break;
              case "REGIONAL": endpointType = [apigateway.EndpointType.REGIONAL]; break;
          }
          // API GW作成
          const api = new apigateway.LambdaRestApi(this, dataSet.restApiName, {
            handler: lambdaFunction,
            endpointTypes: endpointType,
            restApiName: dataSet.restApiName, // API名
            proxy: false,
            deployOptions: {
                accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
                loggingLevel: apigateway.MethodLoggingLevel.INFO, 
                stageName: dataSet.stageName, // ステージ名
                metricsEnabled: dataSet.metricsEnabled, // CloudWatch メトリクスを有効化
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
            },
          });

          api.root.addMethod('GET'); // GETメソッドを追加
          api.root.addMethod('ANY'); // ANYメソッドを追加
      
          const items = api.root.addResource('items'); // リソースを追加
          items.addMethod('GET');  // GET /items　※追加したリソースにGETメソッドを追加
          items.addMethod('POST'); // POST /items　※追加したリソースにPOSTメソッドを追加          

          // Export する
          new CfnOutput(this, `${cfnName}Output`, {
            value: api.restApiName,
            exportName: `${cfnName}Export`,
          });

          this.pubApiGateway[dataSet.restApiName] = api;
          index ++;
        }catch (error){
            console.log(`[ERROR] ApiGatewayFnImpStack-createApiGatewayFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
        }
      } //--- for ---//
    }
}
