import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';


export interface LambdaProps extends StackProps {
    lambdaSet: LambdaSet[];
}

export interface LambdaSet {
lambdaName: string; // Lambda名
lambdaHandler: string;
codePath: string; // コード xxxx.py の格納パス
note: string; // 備考
iamRole: iam.Role; // 付与するIAMロール
}

export class LambdaStack extends Stack {
constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id, props);
    this.createLambdaFunc(props);
    } //--- constructor ---//

    private createLambdaFunc(props: LambdaProps) {
    for (const dataSet of props.lambdaSet) {
        console.log(`${dataSet.lambdaName}`);
        const lambdaFunction = new lambda.Function(this, dataSet.lambdaName, {
            runtime: lambda.Runtime.PYTHON_3_9,
            functionName: dataSet.lambdaName,
            code: lambda.Code.fromAsset(dataSet.codePath),
            handler: dataSet.lambdaHandler,
            role: dataSet.iamRole,
        });

        new CfnOutput(this, `${dataSet.lambdaName}Export`, {
            value: lambdaFunction.functionArn,
            exportName: `${dataSet.lambdaName}-Arn`,
        });
    }
    }
} //--- class ---//

