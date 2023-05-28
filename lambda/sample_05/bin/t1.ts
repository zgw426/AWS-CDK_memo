import * as cdk from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { CustomLambdaProps, CustomLambdaStack, lambdas } from '../lib/stack/lambda-stack';
import { CustomIamProps, CustomIamStack } from '../lib/stack/iam-stack';


const app = new App({
  context: {}
});

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};


//////////////////////////////////////////////
// IAM

const iam_stack_props: CustomIamProps = {
  env: env
}

const iam_stack = new CustomIamStack(app, 'CustomIamStack', iam_stack_props);



//////////////////////////////////////////////
// Lambda

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


/*
const lambdas_data: { lambdas: lambdas[] } = JSON.parse(lambda_set);
const lambdas_list: lambdas[] = lambdas_data.lambdas;

for (const lambda_target of lambdas_list) {
  let lambda_name = lambda_target["lambdaName"];
  let lambda_stack_props: CustomLambdaProps = {
    lambdaName: lambda_name,
    lambdaHandler: lambda_target["lambdaHandler"],
    codePath: lambda_target["codePath"],
    env: env
    
  }
  const lambda_stack = new CustomLambdaStack(app, 'CustomLambdaStack-'+lambda_name, lambda_stack_props);

 
  //console.log("debug :: "+lambda_target);
  //console.log(typeof lambda_target);
}
*/


const lambda_stack_props: CustomLambdaProps = {
  lambdaSet: lambda_set,
  env: env
}

const lambda_stack = new CustomLambdaStack(app, 'CustomLambdaStack', lambda_stack_props);



app.synth();
