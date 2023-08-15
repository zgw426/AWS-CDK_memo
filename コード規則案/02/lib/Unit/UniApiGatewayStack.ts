import { App } from 'aws-cdk-lib';
import { loadCombinationFile, getHeadStr, getDataPath, removeDuplicates } from '../Origin/Common';

import { ApiGatewayProps, ApiGatewaySet, ApiGatewayStack } from '../Origin/ApiGateway';
import { CWLogsProps, CWLogsSet, CWLogsStack } from '../Origin/CWLogs';


//import * as apigateway from 'aws-cdk-lib/aws-apigateway';
//import * as logs from 'aws-cdk-lib/aws-logs';
//import * as lambda from 'aws-cdk-lib/aws-lambda';

// --- API Gateway --- //
export interface UnitApiGatewaySet {
  pjHeadStr: string;
  restApiName: string;
  lambdaName: string;
  endpointTypes: string;
  stageName: string;
  metricsEnabled: boolean;
  accessLogDestination: string;
}

// --- Lambda --- //


// --- CloudWatch Logs --- //
export interface UnitCWLogsSet {
  note: string;
  logGroupName: string;
}


export function UnitApiGatewayFunc(app: App) {
  const pjHeadStr = getHeadStr(app, "PASCAL");
  const filePath = getDataPath(app, "Unit/UniApiGatewaySet.json");
  const dataSet: UnitApiGatewaySet[] = loadCombinationFile(filePath) as UnitApiGatewaySet[];

  dataSet.shift(); // 1つ目を削除

  // --- Lambda --- //


  // --- CloudWatch Logs --- //
  let uniCWLogsSet: CWLogsSet[] = dataSet.map(item => {
    return {
      pjHeadStr: pjHeadStr,
      logGroupName: item.accessLogDestination
    };
  });

  uniCWLogsSet = removeDuplicates(uniCWLogsSet, 'logGroupName'); // 重複削除 ：同じロググループ名のものは1つしか作らない

  const uniCWLogsProps: CWLogsProps = {
    pjHeadStr: pjHeadStr,
    cWLogsSet: uniCWLogsSet
  }

  const uniCWLogsStack = new CWLogsStack(app, `${pjHeadStr}UniCWLogsStackForApiGW`, uniCWLogsProps);




  // --- API Gateway --- //
  let uniApiGatewaySet: ApiGatewaySet[] = dataSet.map(item => {
    return {
      pjHeadStr: pjHeadStr,
      restApiName: item.restApiName,
      lambdaName: item.lambdaName,
      endpointTypes: item.endpointTypes,
      stageName: item.stageName,
      metricsEnabled: item.metricsEnabled,
      accessLogDestination: item.accessLogDestination
    };
  });

  uniApiGatewaySet = removeDuplicates(uniApiGatewaySet, 'restApiName'); // 重複削除 ：同じS３バケット名のものは1つしか作らない

  const uniApiGatewayProps: ApiGatewayProps = {
    pjHeadStr: pjHeadStr,
    ApiGatewaySet: uniApiGatewaySet
  }

  const uniApiGatewayStack = new ApiGatewayStack(app, `${pjHeadStr}UniApiGatewayStack`, uniApiGatewayProps);

  return {
    uniApiGatewayStack,
    uniCWLogsStack
  };
}
