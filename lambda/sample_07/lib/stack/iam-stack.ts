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
    }
}
