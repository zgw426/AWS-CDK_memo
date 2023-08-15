import { App } from 'aws-cdk-lib';
import { addDependency } from '../lib/Origin/Common';
// Combination
import { Combination00Func } from '../lib/Combination/Cmb00Stack';
import { Combination01Func } from '../lib/Combination/Cmb01Stack';
import { Combination02Func } from '../lib/Combination/Cmb02Stack';

// Unit(単体テスト)
import { UnitS3BucketFunc } from '../lib/Unit/UniS3BucketStack';
import { UnitCWLogsFunc } from '../lib/Unit/UniCWLogsStack';
import { UnitApiGatewayFunc } from '../lib/Unit/UniApiGatewayStack';
import { UnitLambdaFunc } from '../lib/Unit/UniLambdaStack';



//const app = new App( {context: { pjPath: "pj05-dev" }});
const app = new App( {context: { pjPath: "pj01-stg" }});

// CombinationFuncの実行
const cmb00Stacks = Combination00Func(app); // VPC作成
const cmb01Stacks = Combination01Func(app); // Lambda+IAMRole作成
const cmb02Stacks = Combination02Func(app, cmb00Stacks.cmb00VpcStack); // EC2作成


// Unit:単体テスト
const uniS3BucketStacks = UnitS3BucketFunc(app); // S3バケット作成
const uniCWLogsStacks = UnitCWLogsFunc(app); // CloudWatch Logs
const uniApiGatewayStacks = UnitApiGatewayFunc(app); // APIGW-Lambda-CWLogs
const uniLambdaStacks = UnitLambdaFunc(app); // CloudWatch Logs



// 依存関係
addDependency(cmb02Stacks.cmb02IamRoleStack, cmb00Stacks.cmb00VpcStack);

// スタックをデプロイ
app.synth();
