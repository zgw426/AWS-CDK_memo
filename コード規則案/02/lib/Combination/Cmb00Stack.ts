import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath } from '../Origin/Common';
import { VpcProps, VpcSet, VpcStack } from '../Origin/Vpc';


export interface Combination00Set {
    vpcName: string;
    cidr: string;
}

export function Combination00Func(app: App) {
    const pjHeadStr = getHeadStr(app, "PASCAL");
    const filePath = getDataPath(app, "Combination/Cmb00Set.json");
    const dataSet: Combination00Set[] = loadCombinationFile(filePath) as Combination00Set[];

    const cmb00VpcSet: VpcSet[] = dataSet.map(item => {
        return {
            vpcName: item.vpcName,
            cidr: item.cidr
        };
    });

    const cmb00VpcProps: VpcProps = {
        pjHeadStr: pjHeadStr,
        vpcSet: cmb00VpcSet,
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION,
        }
    }

    const cmb00VpcStack = new VpcStack(app, `${pjHeadStr}Cmb00VpcStack`, cmb00VpcProps);

    return {
        cmb00VpcStack
    };
}
