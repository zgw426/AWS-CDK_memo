import { App, Stack } from 'aws-cdk-lib';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { Ec2Props, Ec2Set, Ec2Stack } from '../Origin/Ec2';
import { addDependency, loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';
import { VpcStack } from '../Origin/Vpc';


export interface Combination02Set {
  cmbNameForEc2: string;
  cmbNameForIamRoleAddEc2: string;
  cmbPolicysForIamRole: string[];
  cmbInstancetypeForEc2: string;
  cmbNameForVpcAddEc2: string;
}


export function Combination02Func(app: App, cmb00Stacks: VpcStack) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Combination/Cmb02Set.json");
  const dataSet: Combination02Set[] = loadCombinationFile(filePath) as Combination02Set[];

  dataSet.shift(); // 1つ目を削除

  let cmb02IamRoleSet: IamRoleSet[] = dataSet.map(item => {
    return {
      prmIamRoleName: item.cmbNameForIamRoleAddEc2,
      prmPolicys: item.cmbPolicysForIamRole
    };
  });

  cmb02IamRoleSet = removeDuplicates(cmb02IamRoleSet, 'prmIamRoleName'); // 重複削除

  const cmb02IamRoleProps: IamRoleProps = {
    note: `[Cmb01Stack][cmb02IamRoleProps]`,
    oriPjHeadStr: pjHeadStr,
    oriIamRoleSet: cmb02IamRoleSet
  }

  const cmb02IamRoleStack = new IamRoleStack(app, `${pjHeadStr}-Cmb0201-IamRoleStack`, cmb02IamRoleProps);

  const cmb02Ec2Set: Ec2Set[] = dataSet.map(item => {
    return {
      prmEc2Name: item.cmbNameForEc2,
      prmInstanceType: item.cmbInstancetypeForEc2,
      prmIamRole: cmb02IamRoleStack.iamRoles[item.cmbNameForIamRoleAddEc2],
      prmVpc: cmb00Stacks.pubVpc[item.cmbNameForVpcAddEc2]
    };
  });

  const cmb02Ec2Props: Ec2Props = {
    note: `[Cmb01Stack][cmb02Ec2Props]`,
    oriPjHeadStr: pjHeadStr,
    oriEc2Set: cmb02Ec2Set,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    }
  }

  const cmb02Ec2Stack = new Ec2Stack(app, `${pjHeadStr}-Cmb0202-Ec2Stack`, cmb02Ec2Props);

  addDependency(cmb02Ec2Stack, cmb02IamRoleStack);

  return {
    cmb02IamRoleStack,
    cmb02Ec2Stack
  };
}
