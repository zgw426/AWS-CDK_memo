import { App } from 'aws-cdk-lib';
import { IamRoleProps, IamRoleSet, IamRoleStack } from '../Origin/IamRole';
import { LambdaProps, LambdaSet, LambdaStack } from '../Origin/Lambda';
import { addDependency, loadCombinationFile, loadCommonVal, getHeadStr, getDataPath } from '../Origin/Common';

/*
const pjHeadStr = getHeadStr("PASCAL");
const filePath = './data/Combination/Cmb01Set.json';
const dataSet: Combination01Set[] = loadCombinationFile(filePath) as Combination01Set[];
*/

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

    const cmb01IamRoleSet: IamRoleSet[] = dataSet.map(item => {
            return {
            iamRoleName: item.iamRoleName,
            policys: item.policys
        };
    });

    const cmb01IamRoleProps: IamRoleProps = {
        pjHeadStr: pjHeadStr,
        iamRoleSet: cmb01IamRoleSet
    }

    const cmb01IamRoleStack = new IamRoleStack(app, `${pjHeadStr}Cmb01IamRoleStack`, cmb01IamRoleProps);

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
