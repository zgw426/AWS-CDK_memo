import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';
import { S3BucketProps, S3BucketSet, S3BucketStack } from '../Origin/S3Bucket';


export interface UnitS3BucketSet {
  note: string;
  bucketName: string;
}


export function UnitS3BucketFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniS3BucketSet.json");
  const dataSet: UnitS3BucketSet[] = loadCombinationFile(filePath) as UnitS3BucketSet[];

  dataSet.shift(); // 1つ目を削除

  let uni01S3BucketSet: S3BucketSet[] = dataSet.map(item => {
    return {
      pjHeadStr: pjHeadStr,
      bucketName: item.bucketName
    };
  });

  uni01S3BucketSet = removeDuplicates(uni01S3BucketSet, 'bucketName'); // 重複削除 ：同じS３バケット名のものは1つしか作らない

  const uni01S3BucketProps: S3BucketProps = {
    pjHeadStr: pjHeadStr,
    s3BucketSet: uni01S3BucketSet
  }

  const uni01S3BucketStack = new S3BucketStack(app, `${pjHeadStr}Uni01S3BucketStack`, uni01S3BucketProps);

  return {
    uni01S3BucketStack
  };
}
