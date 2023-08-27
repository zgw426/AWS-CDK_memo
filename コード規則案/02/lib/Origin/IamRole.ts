import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { replaceUnderscore, loadCommonVal, getHeadStr } from '../Origin/Common';


///////////////////////////////////////////////////////////
// IamRole

export interface IamRoleProps extends StackProps {
  note: string;
  oriPjHeadStr: string;
  oriIamRoleSet: IamRoleSet[];
}

export interface IamRoleSet{
  prmIamRoleName: string; // IAM Role 名（の一部）
  prmPolicys: string[]; // 設定するポリシー
}

export class IamRoleStack extends Stack {
  public readonly iamRoles: { [iamRoleName: string]: iam.Role };

  constructor(scope: App, id: string, props: IamRoleProps) {
    super(scope, id, props);

    this.iamRoles = {}; // バケットオブジェクトを保持するオブジェクトを初期化
    this.createIamRolesFunc(props);
  } //--- constructor ---//

  private createIamRolesFunc(props: IamRoleProps): void {
    let index = 0;
    for (const dataSet of props.oriIamRoleSet) {
      try{
        // IAMロールを作成
        const lambdaFullName = `${props.oriPjHeadStr}${dataSet.prmIamRoleName}`;
        const cfnName = replaceUnderscore(`${lambdaFullName}`);
        
        const role = new iam.Role(this, `${lambdaFullName}`, {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          roleName: lambdaFullName,
        });

        for (const policy of dataSet.prmPolicys) {
          // 必要なポリシーをアタッチ
          role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(policy));
        }

        new CfnOutput(this, `${cfnName}Output`, {
          value: role.roleName,
          exportName: `${cfnName}-RoleName`,
        });

        this.iamRoles[dataSet.prmIamRoleName] = role;
      }catch (error){
        console.log(`[ERROR] IamRoleStack-createIamRolesFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
      }
    }
  }
}
