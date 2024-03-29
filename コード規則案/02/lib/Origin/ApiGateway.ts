import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from './Common';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';



///////////////////////////////////////////////////////////
// ApiGateway

export interface ApigwProps extends StackProps {
  note: string;
  oriPjHeadStr: string; // pjName + pjEnv
  oriApigwSet: ApigwSet[];
}

export interface ApigwSet{
  prmPjHeadStr: string;
  prmRestApiName: string;
  prmLambdaArn: string;
  prmEndpointTypes: string;
  prmStageName: string;
  prmMetricsEnabled: boolean;
  prmAccessLogDestination: string;
}

export class ApigwStack extends Stack {
    public readonly pubApiGateway: { [restApiName: string]: apigateway.RestApi };

    constructor(scope: App, id: string, props: ApigwProps) {
      super(scope, id, props);
      this.pubApiGateway = {};
      this.createApiGatewayFunc(props);
    }

    private createApiGatewayFunc(props: ApigwProps) {
      let index = 0;
      for (const dataSet of props.oriApigwSet) {
        try{
          const ApiGatewayFullName = `${props.oriPjHeadStr}${dataSet.prmRestApiName}`;
          const cfnName = replaceUnderscore(`${ApiGatewayFullName}`);

          const logGroupId = `LogGroup${index}`;
          const logGroup = logs.LogGroup.fromLogGroupName(this, logGroupId, dataSet.prmAccessLogDestination);
          //const lambdaName = dataSet.lambdaName;
          //const targetResource = cdk.Fn.importValue(lambdaName);
          //const targetResource = cdk.Fn.importValue(lambdaName);

          //* -----------------------------------------------
          const importedLambdaId = `ImportedLambda${index}`;
          const lambdaInvokeRoleId = `LambdaInvokeRole${index}`;
          const lambdaFunction = lambda.Function.fromFunctionAttributes(this, importedLambdaId, {
            functionArn: dataSet.prmLambdaArn,
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
          switch(dataSet.prmEndpointTypes){
              case "EDGE": endpointType = [apigateway.EndpointType.EDGE]; break;
              case "REGIONAL": endpointType = [apigateway.EndpointType.REGIONAL]; break;
          }
          // API GW作成
          const api = new apigateway.LambdaRestApi(this, dataSet.prmRestApiName, {
            handler: lambdaFunction,
            endpointTypes: endpointType,
            restApiName: dataSet.prmRestApiName, // API名
            proxy: false,
            deployOptions: {
                accessLogFormat: apigateway.AccessLogFormat.clf(), // ログの形式 CLF
                loggingLevel: apigateway.MethodLoggingLevel.INFO, 
                stageName: dataSet.prmStageName, // ステージ名
                metricsEnabled: dataSet.prmMetricsEnabled, // CloudWatch メトリクスを有効化
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

          this.pubApiGateway[dataSet.prmRestApiName] = api;
          index ++;
        }catch (error){
            console.log(`[ERROR] ApigwStack-createApiGatewayFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
        }
      } //--- for ---//
    }
}
