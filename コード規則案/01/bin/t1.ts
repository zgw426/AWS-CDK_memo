import { App, Stack } from 'aws-cdk-lib';
import {IamRoleProps, IamRoleSet, IamRoleStack} from '../lib/IamRole';
import {LambdaProps, LambdaSet, LambdaStack} from '../lib/Lambda';
import {Ec2Props, Ec2Set, Ec2Stack} from '../lib/Ec2';

//-------------------------------------------------------//
// Stack Dependencies

function addDependency(stack1: Stack, stack2: Stack) {
  stack1.node.addDependency(stack2);
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■//

const app = new App();

//=======================================================//
// Combination01 (LambdaとそのLambdaに付与するIAMロールを作る)
// 接頭辞 cmb01
//-------------------------------------------------------//
// IAM Role

const cmb01IamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-01",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  },
  {
    "iamRoleName": "iamrole-20230708-02",
    "policys": ["AmazonS3ReadOnlyAccess"],
  },
];

const cmb01IamRoleProps: IamRoleProps = {
  iamRoleSet: cmb01IamRoleSet
}

const cmb01IamRoleStack = new IamRoleStack(app, 'Cmb01IamRoleStack', cmb01IamRoleProps);

//-------------------------------------------------------//
// Lambda

const cmb01LambdaSet: LambdaSet[] = [
    {
      "note": "メモこれは lambda01 です",
      "lambdaName": "LambdaFunction01",
      "lambdaHandler": "a01-sample.lambda_handler",
      "codePath": "data/lambda/a01",
      "iamRole": cmb01IamRoleStack.iamRoles["iamrole-20230708-01"],
    },
    {
      "note": "メモこれは lambda02 です",  
      "lambdaName": "LambdaFunction02",
      "lambdaHandler": "a02-sample.lambda_handler",
      "codePath": "data/lambda/a02",
      "iamRole": cmb01IamRoleStack.iamRoles["iamrole-20230708-02"],
    }
];


const cmb01LambdaProps: LambdaProps = {
  lambdaSet: cmb01LambdaSet
}

const cmb01LambdaStack = new LambdaStack(app, 'Cmb01LambdaStack', cmb01LambdaProps);

addDependency(cmb01LambdaStack, cmb01IamRoleStack);


//=======================================================//
// Combination02 (EC2とそのEC2に付与するIAMロールを作る)
// 接頭辞 cmb02
//-------------------------------------------------------//
// IAM Role

const cmb02IamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-03",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  }
];

const cmb02IamRoleProps: IamRoleProps = {
  iamRoleSet: cmb02IamRoleSet
}

const cmb02IamRoleStack = new IamRoleStack(app, 'Cmb02IamRoleStack', cmb02IamRoleProps);

//-------------------------------------------------------//
// EC2

const cmb02Ec2Set: Ec2Set[] = [
  {
    "instanceType": "t2.micro",
    "iamRole": cmb02IamRoleStack.iamRoles["iamrole-20230708-03"],
  }
];

const cmb02Ec2Props: Ec2Props = {
  ec2Set: cmb02Ec2Set,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
}

const cmb02Ec2Stack = new Ec2Stack(app, 'Cmb02Ec2Stack', cmb02Ec2Props);
addDependency(cmb02Ec2Stack, cmb02IamRoleStack);


// スタックをデプロイ
app.synth();
