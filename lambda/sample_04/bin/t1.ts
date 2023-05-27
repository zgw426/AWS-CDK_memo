import { App } from 'aws-cdk-lib';
import { CustomLambdaProps, CustomLambdaStack, lambdas } from '../lib/stack/lambda-stack';

const app = new App({
  context: {}
});

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

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

const lambda_stack_props: CustomLambdaProps = {
  lambdaSet: lambda_set,
  env: env
}

const lambda_stack = new CustomLambdaStack(app, 'CustomLambdaStack', lambda_stack_props);

app.synth();
