import { App } from 'aws-cdk-lib';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';
import { addDependency, loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';


export interface Combination01Set {
    cmbNameForIamRoleAddLambda: string;
    cmbPolicysForIamRole: string[];
    cmbNameForLambda: string;
    cmbHandlerForLambda: string;
    cmbCodepathForLambda: string;
}


export function Combination01Func(app: App) {
    const pjHeadStr = getHeadStr(app, "PASCAL");
    const filePath = getDataPath(app, "Combination/Cmb01Set.json");
    const dataSet: Combination01Set[] = loadCombinationFile(filePath) as Combination01Set[];

    dataSet.shift(); // 1つ目を削除

    // --- IAM Role --- //
    let cmb01IamRoleSet: IamRoleSet[] = dataSet.map(item => {
        return {
            note: `[Cmb01Stack][cmb01IamRoleSet]`,
            prmIamRoleName: item.cmbNameForIamRoleAddLambda,
            prmPolicys: item.cmbPolicysForIamRole
        };
    });

    cmb01IamRoleSet = removeDuplicates(cmb01IamRoleSet, 'prmIamRoleName'); //重複削除

    const cmb01IamRoleProps: IamRoleProps = {
        note: `[Cmb01Stack][cmb01IamRoleProps]`,
        oriPjHeadStr: pjHeadStr,
        oriIamRoleSet: cmb01IamRoleSet
    }

    const cmb01IamRoleStack = new IamRoleStack(app, `${pjHeadStr}-Cmb0101-IamRoleStack`, cmb01IamRoleProps);

    // --- Lambda --- //
    let cmb01LambdaSet: LambdaSet[] = dataSet.map(item => {
            return {
              note: `[Cmb01Stack][cmb01LambdaSet]`,
              prmLambdaName: item.cmbNameForLambda,
              prmLambdaHandler: item.cmbHandlerForLambda,
              prmCodePath: getDataPath(app, item.cmbCodepathForLambda),
              prmIamRole: cmb01IamRoleStack.iamRoles[item.cmbNameForIamRoleAddLambda],
        };
    });

    cmb01LambdaSet = removeDuplicates(cmb01LambdaSet, 'prmLambdaName'); // 重複削除

    const cmb01LambdaProps: LambdaProps = {
        note: `[Cmb01Stack][cmb01LambdaProps]`,
        oriPjHeadStr: pjHeadStr,
        oriLambdaSet: cmb01LambdaSet
    }

    const cmb01LambdaStack = new LambdaStack(app, `${pjHeadStr}-Cmb0102-LambdaStack`, cmb01LambdaProps);
    addDependency(cmb01LambdaStack, cmb01IamRoleStack);

    return {
        cmb01IamRoleStack,
        cmb01LambdaStack
    };
}
