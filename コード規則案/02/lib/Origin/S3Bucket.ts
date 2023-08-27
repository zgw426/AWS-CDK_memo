import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from './Common';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

///////////////////////////////////////////////////////////
// S3Bucket

export interface S3BucketProps extends StackProps {
  note: string;
  oriPjHeadStr: string; // pjName + pjEnv
  oriS3BucketSet: S3BucketSet[];
}

export interface S3BucketSet{
  prmPjHeadStr: string;
  prmBucketName: string;
}

export class S3BucketStack extends Stack {
    public readonly pubS3Bucket: { [bucketName: string]: Bucket };

    constructor(scope: App, id: string, props: S3BucketProps) {
      super(scope, id, props);
      this.pubS3Bucket = {};
      this.createS3BucketFunc(props);
    }

    private createS3BucketFunc(props: S3BucketProps) {
      let index = 0;
      for (const dataSet of props.oriS3BucketSet) {
        try{
          const s3BucketFullName = `${props.oriPjHeadStr}${dataSet.prmBucketName}`;
          const cfnName = replaceUnderscore(`${s3BucketFullName}`);

          // S3バケットを作成
          const bucket = new Bucket(this, dataSet.prmBucketName, {
            bucketName: dataSet.prmBucketName,
            removalPolicy: RemovalPolicy.DESTROY,
          });
    
          // Export する
          new CfnOutput(this, `${cfnName}Output`, {
            value: bucket.bucketName,
            exportName: `${cfnName}Export`,
          });
    
          this.pubS3Bucket[dataSet.prmBucketName] = bucket;

        }catch (error){
            console.log(`[ERROR] S3BucketStack-createS3BucketFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
        }
      } //--- for ---//
    }
}
