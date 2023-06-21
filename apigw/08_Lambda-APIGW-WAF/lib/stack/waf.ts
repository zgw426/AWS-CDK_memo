import * as cdk from 'aws-cdk-lib';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

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

    // API GatewayとWAFv2ウェブACLを連携
    const wafv2Integration = new wafv2.CfnWebACLAssociation(this, 'WebACLAssociation', {
      webAclArn: webAcl.attrArn,
      resourceArn: `arn:aws:apigateway:ap-northeast-1::/restapis/0ojc56fnik/stages/stageName01`
    });
  }
}
//https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_wafv2.CfnWebACLAssociation.html#resourcearn-1
//arn:aws:apigateway: *region* ::/restapis/ *api-id* /stages/ *stage-name*
