import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from './Common';
import { Construct } from 'constructs';

import * as logs from 'aws-cdk-lib/aws-logs';


///////////////////////////////////////////////////////////
// CloudWatch Logs

export interface CwlogsProps extends StackProps {
  note: string;
  oriPjHeadStr: string; // pjName + pjEnv
  oriCwlogsSet: CwlogsSet[];
}

export interface CwlogsSet{
  prmPjHeadStr: string;
  prmLogGroupName: string;
}

export class CwlogsStack extends Stack {
    public readonly pubCwlogs: { [logGroupName: string]: logs.LogGroup };
  
    constructor(scope: Construct, id: string, props: CwlogsProps) {
      super(scope, id, props);
      this.pubCwlogs = {};
      this.createCwlogsFunc(props);
    }

    private createCwlogsFunc(props: CwlogsProps) {
      let index = 0;
      for (const dataSet of props.oriCwlogsSet) {
        try{
            const CwlogsFullName = `${props.oriPjHeadStr}${dataSet.prmLogGroupName}`;
            const cfnName = replaceUnderscore(`${CwlogsFullName}`);

            const logGroupId = `logGroup${index}`;
            const logGroup = new logs.LogGroup(
              this,
              logGroupId,
              {
                logGroupName: CwlogsFullName,
                retention: logs.RetentionDays.ONE_YEAR,
              },
            );
            new CfnOutput(this, `${cfnName}Export`, {
                value: logGroup.logGroupName,
                exportName: `${cfnName}-Id`,
            });

            this.pubCwlogs[dataSet.prmLogGroupName] = logGroup;
            index ++;
          }catch (error){
              console.log(`[ERROR] CwlogsStack-createCwlogsFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
          }
      } //--- for ---//
    }
  }
