import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface IamRoleProps extends StackProps {
  iamRoleSet: IamRoleSet[];
}

export interface IamRoleSet{
  iamRoleName: string;
  policys: string[];
}

export class IamRoleStack extends Stack {
  public readonly iamRoles: { [iamRoleName: string]: iam.Role };

  constructor(scope: App, id: string, props: IamRoleProps) {
    super(scope, id, props);

    this.iamRoles = {}; // バケットオブジェクトを保持するオブジェクトを初期化
    this.createIamRolesFunc(props.iamRoleSet);
  } //--- constructor ---//

  private createIamRolesFunc(iamRoleSet: IamRoleSet[]): void {
    for (const dataSet of iamRoleSet) {
      // IAMロールを作成
      const role = new iam.Role(this, dataSet.iamRoleName, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        roleName: dataSet.iamRoleName,
      });

      for (const policy of dataSet.policys) {
        // 必要なポリシーをアタッチ
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(policy));
      }

      // Export する
      new CfnOutput(this, `${dataSet.iamRoleName}Output`, {
        value: role.roleName,
        exportName: `${dataSet.iamRoleName}Export`,
      });

      this.iamRoles[dataSet.iamRoleName] = role;
    }
  }
}
