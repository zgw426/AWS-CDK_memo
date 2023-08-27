import { App } from 'aws-cdk-lib';
import { addDependency, loadCombinationFile, getHeadStr, getDataPath, removeDuplicates, getDevCode } from '../Origin/Common';

import { ApiGatewayFnImpProps, ApiGatewayFnImpSet, ApiGatewayFnImpStack } from '../Origin/ApiGateway_FnImportValue';
import { CwlogsProps, CwlogsSet, CwlogsStack } from '../Origin/Cwlogs';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';

///////////////////////////////////////////////////////
// INTERFACE

// --- IAM Role --- //


// --- API Gateway --- //
export interface UnitApiGatewayFnImpSet {
  pjHeadStr: string;
  iamRoleName: string;
  policys: string[];
  lambdaName: string;
  lambdaHandler: string;
  codePath: string;
  restApiName: string;
  endpointTypes: string;
  stageName: string;
  metricsEnabled: boolean;
  accessLogDestination: string;
}

// --- Lambda --- //
export interface UnitLambdaSet {
  note: string;
  iamRoleName: string;
  policys: string[];
  lambdaName: string;
  lambdaHandler: string;
  codePath: string;
}

// --- CloudWatch Logs --- //
export interface UnitCWLogsSet {
  note: string;
  logGroupName: string;
}


///////////////////////////////////////////////////////
// FUNCTION

export function UnitApiGatewayFnImpFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniApiGatewaySet_FnImportValue.json");
  const dataSet: UnitApiGatewayFnImpSet[] = loadCombinationFile(filePath) as UnitApiGatewayFnImpSet[];
  const staTail = getDevCode(app, "PASCAL");  // 開発コード


  dataSet.shift(); // 1つ目を削除

  // --- IAM Role --- //
  let uniIamRoleSet: IamRoleSet[] = dataSet.map(item => {
    return {
      prmIamRoleName: item.iamRoleName,
      prmPolicys: item.policys
    };
  });

  uniIamRoleSet = removeDuplicates(uniIamRoleSet, 'prmIamRoleName'); //重複削除
  
  const uniIamRoleProps: IamRoleProps = {
      oriPjHeadStr: pjHeadStr,
      oriIamRoleSet: uniIamRoleSet
  }

  const uniIamRoleStack = new IamRoleStack(app, `${pjHeadStr}-UniApigw01-IamRoleStack${staTail}`, uniIamRoleProps);

  // --- Lambda --- //
  let uniLambdaSet: LambdaSet[] = dataSet.map(item => {
    return {
      prmLambdaName: item.lambdaName,
      prmLambdaHandler: item.lambdaHandler,
      prmCodePath: getDataPath(app, item.codePath),
      prmIamRole: uniIamRoleStack.iamRoles[item.iamRoleName],
    };
  });

  uniLambdaSet = removeDuplicates(uniLambdaSet, 'prmLambdaName'); // 重複削除
  
  const uniLambdaProps: LambdaProps = {
    oriPjHeadStr: pjHeadStr,
    oriLambdaSet: uniLambdaSet
  }

  const uniLambdaStack = new LambdaStack(app, `${pjHeadStr}-UniApigw02-LambdaStack${staTail}`, uniLambdaProps);





  // --- CloudWatch Logs --- //
  let uniCwlogsSet: CwlogsSet[] = dataSet.map(item => {
    return {
      prmPjHeadStr: pjHeadStr,
      prmLogGroupName: item.accessLogDestination
    };
  });

  uniCwlogsSet = removeDuplicates(uniCwlogsSet, 'prmLogGroupName'); // 重複削除

  const uniCWLogsProps: CwlogsProps = {
    oriPjHeadStr: pjHeadStr,
    oriCwlogsSet: uniCwlogsSet
  }

  const uniCWLogsStack = new CwlogsStack(app, `${pjHeadStr}-UniApigw03-CWLogsStack${staTail}`, uniCWLogsProps);



/*
cmb01IamRoleStack.iamRoles[item.iamRoleName]
      lambdaName: `${pjHeadStr}${item.lambdaName}`,
uniLambdaStack.pubLambda[item.lambdaName]
lambdaName: "Pj01Stghogelambda-Arn",
*/

  // --- API Gateway --- //
  let uniApiGatewayFnImpSet: ApiGatewayFnImpSet[] = dataSet.map(item => {
    return {
      pjHeadStr: pjHeadStr,
      restApiName: item.restApiName,
      lambdaName: `${pjHeadStr}${item.lambdaName}-Arn`,
      endpointTypes: item.endpointTypes,
      stageName: item.stageName,
      metricsEnabled: item.metricsEnabled,
      accessLogDestination: item.accessLogDestination
    };
  });

  uniApiGatewayFnImpSet = removeDuplicates(uniApiGatewayFnImpSet, 'prmRestApiName'); // 重複削除

  const uniApiGatewayFnImpProps: ApiGatewayFnImpProps = {
    pjHeadStr: pjHeadStr,
    ApiGatewayFnImpSet: uniApiGatewayFnImpSet
  }

  const uniApiGatewayStack = new ApiGatewayFnImpStack(app, `${pjHeadStr}-UniApigw04-ApiGatewayFnImpStack${staTail}`, uniApiGatewayFnImpProps);

  // 依存関係
  addDependency(uniLambdaStack, uniIamRoleStack);
  addDependency(uniLambdaStack, uniCWLogsStack);
  addDependency(uniApiGatewayStack, uniLambdaStack);

  return {
    uniIamRoleStack,
    uniLambdaStack,
    uniApiGatewayStack,
    uniCWLogsStack
  };
}
