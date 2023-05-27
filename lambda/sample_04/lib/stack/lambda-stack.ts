import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

export interface CustomLambdaProps extends StackProps {
    lambdaSet: string;
}

export interface lambdas {
    lambdaName: string;
    lambdaHandler: string;
    codePath: string;
    note: string;
}

export class CustomLambdaStack extends Stack {

    constructor(scope: Construct, id: string, props: CustomLambdaProps) {
        super(scope, id, props);
        
        const lambdas_data: { lambdas: lambdas[] } = JSON.parse(props.lambdaSet);
        const lambdas_list: lambdas[] = lambdas_data.lambdas;

        for (const lambda_target of lambdas_list) {
            console.log(`${lambda_target.lambdaName}`);

            const custom_lambda = new lambda.Function(this, lambda_target.lambdaName, {
                runtime: lambda.Runtime.PYTHON_3_9,
                functionName: lambda_target.lambdaName, // Lambda関数名を指定
                code: lambda.Code.fromAsset(lambda_target.codePath), // 指定ディレクトリからコードを取得
                handler: lambda_target.lambdaHandler, // xxx.pyファイルのlambda_handler関数を指定
            });
        }          
    } //--- constructor ---//
} //--- class ---//
