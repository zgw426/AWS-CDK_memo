import * as cdk from 'aws-cdk-lib';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import { Fn } from 'aws-cdk-lib';

export class WafIntegrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, apiGatewayRestApiId: string) {
    super(scope, id);

    // WAFv2ウェブACLを作成
    const webAcl = new wafv2.CfnWebACL(this, 'WebACL', {
      defaultAction: {
        block: {}
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'WebACL',
        sampledRequestsEnabled: true
      },
      rules: [
        // WAFルールを定義
        // ここに適切なルールを追加してください
      ]
    });

    console.log("0000000000000000000000---00000000000000000");

    ///////////////////////////////

    const exportedValue = Fn.importValue('apigw-id');
    console.log(`121212 exportedValue = ${exportedValue}`);

    ///////////////////////////////



    // API GatewayとWAFv2ウェブACLを連携
    const wafv2Integration = new wafv2.CfnWebACLAssociation(this, 'WebACLAssociation', {
      webAclArn: webAcl.attrArn,
      resourceArn: `arn:aws:apigateway:ap-northeast-1::/restapis/x3vfaprm1f/stages/stageName01`,
    });
  }
}
//https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_wafv2.CfnWebACLAssociation.html#resourcearn-1
//arn:aws:apigateway: *region* ::/restapis/ *api-id* /stages/ *stage-name*
