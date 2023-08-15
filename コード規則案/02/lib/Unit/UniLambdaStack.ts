import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';

export interface UnitLambdaSet {
  note: string;
  iamRoleName: string;
  policys: string[];
  lambdaName: string;
  lambdaHandler: string;
  codePath: string;
}

export function UnitLambdaFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniLambdaSet.json");
  const dataSet: UnitLambdaSet[] = loadCombinationFile(filePath) as UnitLambdaSet[];

  dataSet.shift(); // 1つ目を削除

  // --- IAM Role --- //
  let uniIamRoleSet: IamRoleSet[] = dataSet.map(item => {
    return {
      iamRoleName: item.iamRoleName,
      policys: item.policys
    };
  });

  uniIamRoleSet = removeDuplicates(uniIamRoleSet, 'iamRoleName'); //重複削除。同じIAMロール名のものは1つしか作らない

  const uniIamRoleProps: IamRoleProps = {
      pjHeadStr: pjHeadStr,
      iamRoleSet: uniIamRoleSet
  }

  const uniIamRoleStack = new IamRoleStack(app, `${pjHeadStr}uniIamRoleStack`, uniIamRoleProps);

  // --- Lambda --- //
  let uniLambdaSet: LambdaSet[] = dataSet.map(item => {
    return {
      note: item.note,
      lambdaName: item.lambdaName,
      lambdaHandler: item.lambdaHandler,
      codePath: getDataPath(app, item.codePath),
      iamRole: uniIamRoleStack.iamRoles[item.iamRoleName],
    };
  });

  uniLambdaSet = removeDuplicates(uniLambdaSet, 'lambdaName'); // 重複削除 ：同じロググループ名のものは1つしか作らない

  const uniLambdaProps: LambdaProps = {
    pjHeadStr: pjHeadStr,
    lambdaSet: uniLambdaSet
  }

  const uniLambdaStack = new LambdaStack(app, `${pjHeadStr}UniLambdaStack`, uniLambdaProps);

  return {
    uniLambdaStack
  };
}
