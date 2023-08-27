import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';
import { VpcProps, VpcSet, VpcStack } from '../Origin/Vpc';


export interface Combination00Set {
    cmbNameForVpc: string;
    cmbCidrForVpc: string;
}

export function Combination00Func(app: App) {
    const pjHeadStr = getHeadStr(app, "PASCAL");
    const filePath = getDataPath(app, "Combination/Cmb00Set.json");
    const dataSet: Combination00Set[] = loadCombinationFile(filePath) as Combination00Set[];

    dataSet.shift(); // 1つ目を削除

    let cmb00VpcSet: VpcSet[] = dataSet.map(item => {
        return {
            note: `[Cmb00Stack][cmb00VpcSet]`,
            prmVpcName: item.cmbNameForVpc,
            prmCidr: item.cmbCidrForVpc
        };
    });

    cmb00VpcSet = removeDuplicates(cmb00VpcSet, 'prmVpcName'); // 重複削除

    const cmb00VpcProps: VpcProps = {
        oriPjHeadStr: pjHeadStr,
        oriVpcSet: cmb00VpcSet,
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION,
        }
    }

    const cmb00VpcStack = new VpcStack(app, `${pjHeadStr}-Cmb0001-VpcStack`, cmb00VpcProps);

    return {
        cmb00VpcStack
    };
}
