import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface CustomSimpleLambdaProps extends StackProps {
    lambdaSet: lambdas[];
}


export interface lambdas {
  note: string; // 備考
  lambdaName: string; // Lambda名
  lambdaHandler: string;
  codePath: string; // コード xxxx.py の格納パス
  iamRole: string; // 付与するIAMロール
}



export class CustomSimpleLambdaStack extends Stack {
  public readonly lambdaOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: CustomSimpleLambdaProps) {
      super(scope, id, props);

      const jsonList: lambdas[] = props.lambdaSet;

      for (const lambdaTarget of jsonList) {
          const roleName = lambdaTarget.iamRole;
          const role = iam.Role.fromRoleName(this, 'Role'+lambdaTarget.lambdaName, roleName);

          const currentLambda = new lambda.Function(this, lambdaTarget.lambdaName, {
              runtime: lambda.Runtime.PYTHON_3_9,
              functionName: lambdaTarget.lambdaName, // Lambda関数名を指定
              code: lambda.Code.fromAsset(lambdaTarget.codePath), // 指定ディレクトリからコードを取得
              handler: lambdaTarget.lambdaHandler, // xxx.pyファイルのlambda_handler関数を指定
              role: role,
          });

          this.lambdaOutput = new cdk.CfnOutput(this, lambdaTarget.lambdaName + 'Output', {
            value: currentLambda.functionArn,
            description: 'lambdaFunction-functionArn',
            exportName: lambdaTarget.lambdaName,
          });
      }
  } //--- constructor ---//
} //--- class ---//

