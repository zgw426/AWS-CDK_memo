import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates, getDevCode } from '../Origin/Common';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';


///////////////////////////////////////////////////////
// INTERFACE

// --- IAM Role --- //
export interface UnitLambdaSet {
  uniNameForIamRoleAddLambda: string;
  uniPolicysForIamRole: string[];
  uniNameForLambda: string;
  uniHandlerForLambda: string;
  uniCodepathForLambda: string;
}


///////////////////////////////////////////////////////
// FUNCTION

export function UnitLambdaFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniLambdaSet.json");
  const dataSet: UnitLambdaSet[] = loadCombinationFile(filePath) as UnitLambdaSet[];
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
    note: `[UniLambdaStack][uniIamRoleProps]`,
    oriPjHeadStr: pjHeadStr,
    oriIamRoleSet: uniIamRoleSet
  }

  const uniIamRoleStack = new IamRoleStack(app, `${pjHeadStr}-UniLambda01-Stack${staTail}`, uniIamRoleProps);

  // --- Lambda --- //
  let uniLambdaSet: LambdaSet[] = dataSet.map(item => {
    return {
      prmLambdaName: item.uniNameForLambda,
      prmLambdaHandler: item.uniHandlerForLambda,
      prmCodePath: getDataPath(app, item.uniCodepathForLambda),
      prmIamRole: uniIamRoleStack.iamRoles[item.uniNameForIamRoleAddLambda],
    };
  });

  uniLambdaSet = removeDuplicates(uniLambdaSet, 'prmLambdaName'); // 重複削除

  const uniLambdaProps: LambdaProps = {
    note: `[UnitLambdaStack][uniLambdaProps]`,
    oriPjHeadStr: pjHeadStr,
    oriLambdaSet: uniLambdaSet
  }

  const uniLambdaStack = new LambdaStack(app, `${pjHeadStr}-UniLambda02-Stack${staTail}`, uniLambdaProps);

  return {
    uniLambdaStack
  };
}
