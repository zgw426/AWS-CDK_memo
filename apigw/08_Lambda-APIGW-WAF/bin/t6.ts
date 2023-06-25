import { App, Stack } from 'aws-cdk-lib';
import { CustomSimpleLambdaProps, CustomSimpleLambdaStack, lambdas } from '../lib/stack/simple-lambda-stack';
import { CustomApiGatewayStack, CustomApiGatewayProps, apigws } from '../lib/stack/apigateway-stack';
import { WafIntegrationStack } from '../lib/stack/waf';

const app = new App({
  context: {}
});

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

//////////////////////////////////////////////
// Lambda

const lambdaSet: lambdas[] = [
  {
    note: 'メモこれは lambda01 です',
    lambdaName: 'CustomLambdaFunction01',
    lambdaHandler: 'a01-sample.lambda_handler',
    codePath: 'lib/data/lambda/a01',
    iamRole: 'lambda-role'
  },{
    note: 'メモこれは lambda02 です',
    lambdaName: 'CustomLambdaFunction02',
    lambdaHandler: 'a02-sample.lambda_handler',
    codePath: 'lib/data/lambda/a02',
    iamRole: 'lambda-role'
  }
];

const simpleLambdaStackProps: CustomSimpleLambdaProps = {
  lambdaSet: lambdaSet,
  env: env
};


//////////////////////////////////////////////
// API Gateway

const apigatewaySet: apigws[] = [
  {
    note: 'メモこれは ApiGateway01 です',
    restApiName: "customApiGateway01", // API名
    stageName: "stageName01",
    metricsEnabled: true,
    accessLogDestination: "/aws/apigateway/aaaaa999999999999rest-api-access-log",
    lambdaName: "CustomLambdaFunction01",
    endpointTypes: "REGIONAL",
  }
]


const customApiGatewayProps: CustomApiGatewayProps = {
  apigwSet: apigatewaySet,
  env: env
};


//////////////////////////////////////////////
// スタック群

new CustomSimpleLambdaStack(app, 'CustomSimpleLambdaStack', simpleLambdaStackProps);
new CustomApiGatewayStack(app, 'CustomApiGatewayStack', customApiGatewayProps);

/////////////////////////////////////////////
// WAF

// API GatewayのrestApiIdを取得
//const apiGatewayRestApiId = '<API GatewayのrestApiId>';
const apiGatewayRestApiId = 'x3vfaprm1f';

// WAFの連携を行うスタックを作成
new WafIntegrationStack(app, 'WafIntegrationStack', apiGatewayRestApiId);

app.synth();
