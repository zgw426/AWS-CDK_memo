import * as cdk from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';


export interface CustomIamProps extends StackProps {

}

export class CustomIamStack extends Stack {
    public readonly iamRole: Role;

    constructor(scope: Construct, id: string, props: CustomIamProps) {
        super(scope, id, props);

        this.iamRole = new Role(this, 'CustomIamRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            roleName: 'CustomIamRole01',
        });
    
        const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonS3ReadOnlyAccess'
        );
        this.iamRole.addManagedPolicy(s3ReadOnlyAccessPolicy);


        // Output the instance ID
        //const myOutPut = new cdk.CfnOutput(this, 'IamRoleArn', {value: iamRole.roleArn});
        //const outputValue = this.getOutput(myOutput);

        //new cdk.CfnOutput(this, 'RoleArn', {
        //   value: iamRole.roleArn,
        //  });


    }
}



/*


class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // MyRole01: s3ReadOnlyAccessPolicyの権限を持つIAMロールを作成
    const role01 = new Role(this, 'MyRole01', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole01',
    });

    const s3ReadOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3ReadOnlyAccess'
    );
    role01.addManagedPolicy(s3ReadOnlyAccessPolicy);

    // MyRole02: s3FullAccessPolicyの権限を持つIAMロールを作成
    const role02 = new Role(this, 'MyRole02', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'MyRole02',
    });

    const s3FullAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonS3FullAccess'
    );
    role02.addManagedPolicy(s3FullAccessPolicy);
  }
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();

*/
