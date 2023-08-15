import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';
import { CWLogsProps, CWLogsSet, CWLogsStack } from '../Origin/CWLogs';


export interface UnitCWLogsSet {
  note: string;
  logGroupName: string;
}


export function UnitCWLogsFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/uniCWLogsSet.json");
  const dataSet: UnitCWLogsSet[] = loadCombinationFile(filePath) as UnitCWLogsSet[];

  dataSet.shift(); // 1つ目を削除

  // --- CloudWatch Logs --- //
  let uniCWLogsSet: CWLogsSet[] = dataSet.map(item => {
    return {
      pjHeadStr: pjHeadStr,
      logGroupName: item.logGroupName
    };
  });

  uniCWLogsSet = removeDuplicates(uniCWLogsSet, 'logGroupName'); // 重複削除 ：同じロググループ名のものは1つしか作らない

  const uniCWLogsProps: CWLogsProps = {
    pjHeadStr: pjHeadStr,
    cWLogsSet: uniCWLogsSet
  }

  const uniCWLogsStack = new CWLogsStack(app, `${pjHeadStr}UniCWLogsStack`, uniCWLogsProps);

  return {
    uniCWLogsStack
  };
}
