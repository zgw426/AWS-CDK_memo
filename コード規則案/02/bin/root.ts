import { App } from 'aws-cdk-lib';
import { addDependency } from '../lib/Origin/Common';
// Combination
import { Combination00Func } from '../lib/Combination/Cmb00Stack';
import { Combination01Func } from '../lib/Combination/Cmb01Stack';
import { Combination02Func } from '../lib/Combination/Cmb02Stack';

// Unit(単体テスト)
import { UnitS3BucketFunc } from '../lib/Unit/UniS3BucketStack';
import { UnitCwlogsFunc } from '../lib/Unit/UniCwlogsStack';
//import { UnitApiGatewayFnImpFunc } from '../lib/Unit/UniApiGatewayStack_FnImportValue';
import { UnitApigwFunc } from '../lib/Unit/UniApiGatewayStack';
import { UnitLambdaFunc } from '../lib/Unit/UniLambdaStack';



//const app = new App( {context: { pjPath: "pj05-dev", devCode: "test" }});
const app = new App( {context: { pjPath: "pj01-stg", devCode: "test" }});

// CombinationFuncの実行
const cmb00Func = Combination00Func(app); // VPC作成
const cmb01Func = Combination01Func(app); // Lambda+IAMRole作成
const cmb02Func = Combination02Func(app, cmb00Func.cmb00VpcStack); // EC2作成

// CombinationFuncの依存関係
addDependency(cmb02Func.cmb02IamRoleStack, cmb00Func.cmb00VpcStack);

// ------------------------------------------------------------ //

// (Develop：コード開発) CombinationFuncの実行
const uniS3BucketFunc = UnitS3BucketFunc(app); // S3バケット作成
const uniCWLogsFunc = UnitCwlogsFunc(app); // CloudWatch Logs
//const uniApiGwFnImpFunc = UnitApiGatewayFnImpFunc(app); // APIGW(FnImportValue)-Lambda-CWLogs
const uniApiGatewayFunc = UnitApigwFunc(app); // APIGW-Lambda-CWLogs
const uniLambdaFunc = UnitLambdaFunc(app); // CloudWatch Logs

// (Develop：コード開発) CombinationFuncの依存関係




// スタックをデプロイ
app.synth();
