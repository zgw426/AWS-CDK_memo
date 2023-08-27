import { App } from 'aws-cdk-lib';
import { addDependency, loadCombinationFile, getHeadStr, getDataPath, removeDuplicates, getDevCode } from '../Origin/Common';

import { ApigwProps, ApigwSet, ApigwStack } from '../Origin/ApiGateway';
import { CwlogsProps, CwlogsSet, CwlogsStack } from '../Origin/Cwlogs';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';

///////////////////////////////////////////////////////
// INTERFACE

export interface UnitApigwSet {
  uniNameForIamRoleAddLambda: string;
  uniPolicysForIamRole: string[];
  uniNameForLambda: string;
  uniHandlerForLambda: string;
  uniCodepathForLambda: string;
  uniNameForApigw: string;
  uniEndpointtypesForApigw: string;
  uniStagenameForApigw: string;
  uniMetricsenabledForApigw: boolean;
  uniLoggroupnameForCwlogAddApigw: string;
}

///////////////////////////////////////////////////////
// FUNCTION

export function UnitApigwFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniApigwSet.json");
  const dataSet: UnitApigwSet[] = loadCombinationFile(filePath) as UnitApigwSet[];
  const staTail = getDevCode(app, "PASCAL");  // 開発コード


  dataSet.shift(); // 1つ目を削除

  // --- IAM Role --- //
  let uniIamRoleSet: IamRoleSet[] = dataSet.map(item => {
    return {
      prmIamRoleName: item.uniNameForIamRoleAddLambda,
      prmPolicys: item.uniPolicysForIamRole
    };
  });

  uniIamRoleSet = removeDuplicates(uniIamRoleSet, 'prmIamRoleName'); //重複削除

  const uniIamRoleProps: IamRoleProps = {
    note: `[UniApiGatewayStack][uniIamRoleProps]`,
    oriPjHeadStr: pjHeadStr,
    oriIamRoleSet: uniIamRoleSet
  }

  const uniApigw01IamRoleStack = new IamRoleStack(app, `${pjHeadStr}-UniApigw01-IamRoleStack${staTail}`, uniIamRoleProps);

  // --- Lambda --- //
  let uniLambdaSet: LambdaSet[] = dataSet.map(item => {
    return {
      prmLambdaName: item.uniNameForLambda,
      prmLambdaHandler: item.uniHandlerForLambda,
      prmCodePath: getDataPath(app, item.uniCodepathForLambda),
      prmIamRole: uniApigw01IamRoleStack.iamRoles[item.uniNameForIamRoleAddLambda],
    };
  });

  uniLambdaSet = removeDuplicates(uniLambdaSet, 'prmLambdaName'); // 重複削除

  const uniLambdaProps: LambdaProps = {
    note: `[UniApiGatewayStack][uniLambdaProps]`,
    oriPjHeadStr: pjHeadStr,
    oriLambdaSet: uniLambdaSet
  }

  const uniApigw02LambdaStack = new LambdaStack(app, `${pjHeadStr}-UniApigw02-LambdaStack${staTail}`, uniLambdaProps);

  // --- CloudWatch Logs --- //
  let uniCwlogsSet: CwlogsSet[] = dataSet.map(item => {
    return {
      prmPjHeadStr: pjHeadStr,
      prmLogGroupName: item.uniLoggroupnameForCwlogAddApigw
    };
  });

  uniCwlogsSet = removeDuplicates(uniCwlogsSet, 'prmLogGroupName'); // 重複削除

  const uniCwlogsProps: CwlogsProps = {
    note: `[UniApiGatewayStack][uniCwlogsProps]`,
    oriPjHeadStr: pjHeadStr,
    oriCwlogsSet: uniCwlogsSet
  }

  const uniApigw03CwlogsStack = new CwlogsStack(app, `${pjHeadStr}-UniApigw03-CwlogsStack${staTail}`, uniCwlogsProps);

  let uniApigwSet: ApigwSet[] = dataSet.map(item => {
    return {
      prmPjHeadStr: pjHeadStr,
      prmRestApiName: item.uniNameForApigw,
      prmLambdaArn: uniApigw02LambdaStack.pubLambda[ item.uniNameForLambda ].functionArn,
      prmEndpointTypes: item.uniEndpointtypesForApigw,
      prmStageName: item.uniStagenameForApigw,
      prmMetricsEnabled: item.uniMetricsenabledForApigw,
      prmAccessLogDestination: item.uniLoggroupnameForCwlogAddApigw
    };
  });

  uniApigwSet = removeDuplicates(uniApigwSet, 'prmRestApiName'); // 重複削除

  const uniApigwProps: ApigwProps = {
    note: `[UniApiGatewayStack][uniApigwProps]`,
    oriPjHeadStr: pjHeadStr,
    oriApigwSet: uniApigwSet
  }

  const uniApigw04ApigwStack = new ApigwStack(app, `${pjHeadStr}-UniApigw04-ApigwStack${staTail}`, uniApigwProps);

  // 依存関係 (依存先, 依存元)
  addDependency(uniApigw02LambdaStack, uniApigw01IamRoleStack);
  addDependency(uniApigw02LambdaStack, uniApigw03CwlogsStack);
  addDependency(uniApigw04ApigwStack, uniApigw02LambdaStack);

  return {
    uniApigw01IamRoleStack,
    uniApigw02LambdaStack,
    uniApigw04ApigwStack,
    uniApigw03CwlogsStack
  };
}
