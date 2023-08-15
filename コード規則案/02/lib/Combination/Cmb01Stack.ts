import { App } from 'aws-cdk-lib';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';
import { addDependency, loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';


export interface Combination01Set {
    note: string;
    iamRoleName: string;
    policys: string[];
    lambdaName: string;
    lambdaHandler: string;
    codePath: string;
}


export function Combination01Func(app: App) {
    const pjHeadStr = getHeadStr(app, "PASCAL");
    const filePath = getDataPath(app, "Combination/Cmb01Set.json");
    const dataSet: Combination01Set[] = loadCombinationFile(filePath) as Combination01Set[];

    dataSet.shift(); // 1つ目を削除

    // --- IAM Role --- //
    let cmb01IamRoleSet: IamRoleSet[] = dataSet.map(item => {
        return {
            iamRoleName: item.iamRoleName,
            policys: item.policys
        };
    });

    cmb01IamRoleSet = removeDuplicates(cmb01IamRoleSet, 'iamRoleName'); //重複削除。同じIAMロール名のものは1つしか作らない

    const cmb01IamRoleProps: IamRoleProps = {
        pjHeadStr: pjHeadStr,
        iamRoleSet: cmb01IamRoleSet
    }

    const cmb01IamRoleStack = new IamRoleStack(app, `${pjHeadStr}Cmb01IamRoleStack`, cmb01IamRoleProps);

    // --- Lambda --- //
    const cmb01LambdaSet: LambdaSet[] = dataSet.map(item => {
            return {
            note: item.note,
            lambdaName: item.lambdaName,
            lambdaHandler: item.lambdaHandler,
            codePath: getDataPath(app, item.codePath),
            iamRole: cmb01IamRoleStack.iamRoles[item.iamRoleName],
        };
    });

    const cmb01LambdaProps: LambdaProps = {
        pjHeadStr: pjHeadStr,
        lambdaSet: cmb01LambdaSet
    }

    const cmb01LambdaStack = new LambdaStack(app, `${pjHeadStr}Cmb01LambdaStack`, cmb01LambdaProps);
    addDependency(cmb01LambdaStack, cmb01IamRoleStack);

    return {
        cmb01IamRoleStack,
        cmb01LambdaStack
    };
}
