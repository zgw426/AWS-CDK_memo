import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { replaceUnderscore } from '../Origin/Common';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Vpc } from 'aws-cdk-lib/aws-ec2';


///////////////////////////////////////////////////////////
// EC2

export interface Ec2Props extends StackProps {
    pjHeadStr: string; // pjName + pjEnv
    ec2Set: Ec2Set[];
}

export interface Ec2Set{
    ec2Name: string; // EC2のNameタグ(の一部)
    instanceType: string; // インスタンスタイプ
    iamRole: iam.Role; // EC2に付与するIAM Role
    vpc: Vpc; // EC2を起動するVPC
}

export class Ec2Stack extends Stack {
    public readonly pubEc2: { [vpcName: string]: ec2.Instance };

    constructor(scope: App, id: string, props: Ec2Props) {
        super(scope, id, props);
        this.pubEc2 = {};
        this.createEc2Func(props);
    }

    private createEc2Func(props: Ec2Props) {
        let index = 0;
        for (const dataSet of props.ec2Set) {
            try{
                const ec2FullName = `${props.pjHeadStr}${dataSet.ec2Name}`;
                const cfnName = replaceUnderscore(`${ec2FullName}`);

                const ec2Instance = new ec2.Instance(this, ec2FullName, {
                    vpc: dataSet.vpc,
                    instanceType: new ec2.InstanceType(dataSet.instanceType),
                    machineImage: ec2.MachineImage.latestAmazonLinux2(),
                    role: dataSet.iamRole,
                    instanceName: ec2FullName,
                });

                new CfnOutput(this, replaceUnderscore(`${cfnName}Export`), {
                    value: ec2Instance.instanceId,
                    exportName: replaceUnderscore(`${cfnName}-Id`),
                });

                this.pubEc2[dataSet.ec2Name] = ec2Instance;
                index ++;
            }catch (error){
                console.log(`[ERROR] Ec2Stack-createEc2Func\n\tthe ${index + 1} th dataSet.\n${error}`);
            }
        } //--- for ---//
    }
}
