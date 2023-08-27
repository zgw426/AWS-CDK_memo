import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates, getDevCode } from '../Origin/Common';
import { CwlogsProps, CwlogsSet, CwlogsStack } from '../Origin/Cwlogs';


export interface UnitCwlogsSet {
  uniLoggroupnameForCwlog: string;
}


export function UnitCwlogsFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniCwlogsSet.json");
  const dataSet: UnitCwlogsSet[] = loadCombinationFile(filePath) as UnitCwlogsSet[];
  const staTail = getDevCode(app, "PASCAL");  // 開発コード

  dataSet.shift(); // 1つ目を削除

  // --- CloudWatch Logs --- //
  let uniCwlogsSet: CwlogsSet[] = dataSet.map(item => {
    return {
      prmPjHeadStr: pjHeadStr,
      prmLogGroupName: item.uniLoggroupnameForCwlog
    };
  });

  uniCwlogsSet = removeDuplicates(uniCwlogsSet, 'prmLogGroupName'); // 重複削除

  const uniCwlogsProps: CwlogsProps = {
    note: `[UniCwlogsStack][CwlogsProps]`,
    oriPjHeadStr: pjHeadStr,
    oriCwlogsSet: uniCwlogsSet
  }

  const uniCwlogsStack = new CwlogsStack(app, `${pjHeadStr}-UniCwlogs01-Stack${staTail}`, uniCwlogsProps);

  return {
    uniCwlogsStack
  };
}
