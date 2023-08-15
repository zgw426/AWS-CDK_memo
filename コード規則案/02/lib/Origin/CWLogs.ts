import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from './Common';
import { Construct } from 'constructs';

import * as logs from 'aws-cdk-lib/aws-logs';


///////////////////////////////////////////////////////////
// CloudWatch Logs

export interface CWLogsProps extends StackProps {
  pjHeadStr: string; // pjName + pjEnv
  cWLogsSet: CWLogsSet[];
}

export interface CWLogsSet{
  pjHeadStr: string;
  logGroupName: string;
}




export class CWLogsStack extends Stack {
    public readonly pubCWLogs: { [logGroupName: string]: logs.LogGroup };
  
    constructor(scope: Construct, id: string, props: CWLogsProps) {
      super(scope, id, props);
      this.pubCWLogs = {};
      this.createCWLogsFunc(props);
    }

    private createCWLogsFunc(props: CWLogsProps) {
      let index = 0;
      for (const dataSet of props.cWLogsSet) {
          try{
            const cWLogsFullName = `${props.pjHeadStr}${dataSet.logGroupName}`;
            const cfnName = replaceUnderscore(`${cWLogsFullName}`);

            const logGroup = new logs.LogGroup(
              this,
              'logGroup',
              {
                logGroupName: cWLogsFullName,
                retention: logs.RetentionDays.ONE_YEAR,
              },
            );
            new CfnOutput(this, `${cfnName}Export`, {
                value: logGroup.logGroupName,
                exportName: `${cfnName}-Id`,
            });

            this.pubCWLogs[dataSet.logGroupName] = logGroup;
            index ++;
          }catch (error){
              console.log(`[ERROR] CWLogsStack-createCWLogsFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
          }
      } //--- for ---//

      /*
      const logGroup = new logs.LogGroup(
        this,
        'logGroup',
        {
          logGroupName: '/aws/apigateway/aaaaa999999999999rest-api-access-log',
          retention: logs.RetentionDays.ONE_YEAR,
        },
      );
      */

      

    }
  }








/*
export class CWLogsStack extends Stack {
    public readonly pubCWLogs: { [bucketName: string]: Bucket };

    constructor(scope: App, id: string, props: CWLogsProps) {
      super(scope, id, props);
      this.pubCWLogs = {};
      this.createCWLogsFunc(props);
    }

    private createCWLogsFunc(props: CWLogsProps) {
      let index = 0;
      for (const dataSet of props.CWLogsSet) {
        try{
          const CWLogsFullName = `${props.pjHeadStr}${dataSet.bucketName}`;
          const cfnName = replaceUnderscore(`${CWLogsFullName}`);

          // S3バケットを作成
          const bucket = new Bucket(this, dataSet.bucketName, {
            bucketName: dataSet.bucketName,
            removalPolicy: RemovalPolicy.DESTROY,
          });
    
          // Export する
          new CfnOutput(this, `${cfnName}Output`, {
            value: bucket.bucketName,
            exportName: `${cfnName}Export`,
          });
    
          this.pubCWLogs[dataSet.bucketName] = bucket;

        }catch (error){
            console.log(`[ERROR] CWLogsStack-createCWLogsFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
        }
      } //--- for ---//
    }
}
*/