import { App, Stack } from 'aws-cdk-lib';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { Ec2Props, Ec2Set, Ec2Stack } from '../Origin/Ec2';
import { addDependency, loadCombinationFile, loadCommonVal, getHeadStr, getDataPath } from '../Origin/Common';
import { VpcStack } from '../Origin/Vpc';


export interface Combination02Set {
  note: string;
  ec2Name: string;
  iamRoleName: string;
  policys: string[];
  instanceType: string;
  vpcName: string;
}


export function Combination02Func(app: App, cmb00Stacks: VpcStack) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Combination/Cmb02Set.json");
  const dataSet: Combination02Set[] = loadCombinationFile(filePath) as Combination02Set[];

  const cmb02IamRoleSet: IamRoleSet[] = dataSet.map(item => {
    return {
      iamRoleName: item.iamRoleName,
      policys: item.policys
    };
  });

  const cmb02IamRoleProps: IamRoleProps = {
    pjHeadStr: pjHeadStr,
    iamRoleSet: cmb02IamRoleSet
  }

  const cmb02IamRoleStack = new IamRoleStack(app, `${pjHeadStr}Cmb02IamRoleStack`, cmb02IamRoleProps);

  const cmb02Ec2Set: Ec2Set[] = dataSet.map(item => {
    return {
      ec2Name: item.ec2Name,
      instanceType: item.instanceType,
      iamRole: cmb02IamRoleStack.iamRoles[item.iamRoleName],
      vpc: cmb00Stacks.pubVpc[item.vpcName]
    };
  });

  const cmb02Ec2Props: Ec2Props = {
    pjHeadStr: pjHeadStr,
    ec2Set: cmb02Ec2Set,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    }
  }

  const cmb02Ec2Stack = new Ec2Stack(app, `${pjHeadStr}Cmb02Ec2Stack`, cmb02Ec2Props);

  addDependency(cmb02Ec2Stack, cmb02IamRoleStack);

  return {
    cmb02IamRoleStack,
    cmb02Ec2Stack
  };
}
