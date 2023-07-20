import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { replaceUnderscore } from '../Origin/Common';


export interface LambdaProps extends StackProps {
    pjHeadStr: string; // pjName + pjEnv
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
    public readonly pubLambda: { [lambdaName: string]: lambda.Function };

    constructor(scope: Construct, id: string, props: LambdaProps) {
        super(scope, id, props);
        this.pubLambda = {};
        this.createLambdaFunc(props);
    } //--- constructor ---//

    private createLambdaFunc(props: LambdaProps) {
        let index = 0;
        for (const dataSet of props.lambdaSet) {
            try{
                const lambdaFullName = `${props.pjHeadStr}${dataSet.lambdaName}`;
                const cfnName = replaceUnderscore(`${lambdaFullName}`);

                const lambdaFunction = new lambda.Function(this, lambdaFullName, {
                    runtime: lambda.Runtime.PYTHON_3_9,
                    functionName: lambdaFullName,
                    code: lambda.Code.fromAsset(dataSet.codePath),
                    handler: dataSet.lambdaHandler,
                    role: dataSet.iamRole,
                });

                new CfnOutput(this, `${cfnName}Export`, {
                    value: lambdaFunction.functionArn,
                    exportName: `${cfnName}-Arn`,
                });

                this.pubLambda[lambdaFullName] = lambdaFunction;
            }catch (error){
                console.log(`[ERROR] LambdaStack-createLambdaFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
            }
        } //--- for ---//
    }
} //--- class ---//

