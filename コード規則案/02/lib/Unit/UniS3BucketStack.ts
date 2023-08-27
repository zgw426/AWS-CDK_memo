import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates, getDevCode } from '../Origin/Common';
import { S3BucketProps, S3BucketSet, S3BucketStack } from '../Origin/S3Bucket';


export interface UnitS3BucketSet {
  uniNameForS3bucket: string;
}


export function UnitS3BucketFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniS3BucketSet.json");
  const dataSet: UnitS3BucketSet[] = loadCombinationFile(filePath) as UnitS3BucketSet[];
  const staTail = getDevCode(app, "PASCAL");  // 開発コード

  dataSet.shift(); // 1つ目を削除

  let uni01S3BucketSet: S3BucketSet[] = dataSet.map(item => {
    return {
      prmPjHeadStr: pjHeadStr,
      prmBucketName: item.uniNameForS3bucket
    };
  });

  uni01S3BucketSet = removeDuplicates(uni01S3BucketSet, 'prmBucketName'); // 重複削除

  const uni01S3BucketProps: S3BucketProps = {
    note: `[UniS3BucketStack][uni01S3BucketProps]`,
    oriPjHeadStr: pjHeadStr,
    oriS3BucketSet: uni01S3BucketSet
  }

  const uni01S3BucketStack = new S3BucketStack(app, `${pjHeadStr}-UniS3Bucket01-Stack${staTail}`, uni01S3BucketProps);

  return {
    uni01S3BucketStack
  };
}
