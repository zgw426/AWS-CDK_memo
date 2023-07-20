import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface Ec2Props extends StackProps {
    ec2Set: Ec2Set[];
}

export interface Ec2Set{
    instanceType: string;
    iamRole: iam.Role;
}

export class Ec2Stack extends Stack {
    constructor(scope: App, id: string, props: Ec2Props) {
        super(scope, id, props);
        this.createEc2Func(props);
    }

    private createEc2Func(props: Ec2Props) {
        // 既存のVPCとサブネットのIDを指定
        const existingVpcId = 'vpc-12345678';

        for (const dataSet of props.ec2Set) {
            const ec2Instance = new ec2.Instance(this, 'EC2Instance', {
                vpc: ec2.Vpc.fromLookup(this, 'ExistingVpc', {
                vpcId: existingVpcId
                }),
                instanceType: new ec2.InstanceType(dataSet.instanceType),
                machineImage: ec2.MachineImage.latestAmazonLinux(),
                role: dataSet.iamRole,
            });

            // EC2のインスタンスIDをエクスポート
            new CfnOutput(this, 'EC2InstanceIdExport', {
                value: ec2Instance.instanceId,
                exportName: 'EC2InstanceId',
            });
        }
    }
}
