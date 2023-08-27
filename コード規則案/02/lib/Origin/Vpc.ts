import { App, Stack, StackProps, CfnOutput, Fn } from 'aws-cdk-lib';
import { replaceUnderscore } from '../Origin/Common';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


///////////////////////////////////////////////////////////
// VPC

export interface VpcProps extends StackProps {
    oriPjHeadStr: string; // pjName + pjEnv
    oriVpcSet: VpcSet[];
}

export interface VpcSet{
    note: string;
    prmVpcName: string;
    prmCidr: string;
}


export class VpcStack extends Stack {
    public readonly pubVpc: { [vpcName: string]: ec2.Vpc };

    constructor(scope: App, id: string, props: VpcProps) {
        super(scope, id, props);

        this.pubVpc = {};
        this.createVpcFunc(props);
    } //--- constructor ---//

    private createVpcFunc(props: VpcProps): void {
        let index = 0;
        for (const dataSet of props.oriVpcSet) {
            try{
                // VPCを作成
                const vpcFullName = `${props.oriPjHeadStr}${dataSet.prmVpcName}`;
                const cfnName = replaceUnderscore(`${vpcFullName}`);

                const vpc = new ec2.Vpc(this, `${vpcFullName}`, {
                    vpcName: vpcFullName,
                    ipAddresses: ec2.IpAddresses.cidr(dataSet.prmCidr),
                    maxAzs: 2,
                    subnetConfiguration: [
                        {
                            subnetType: ec2.SubnetType.PUBLIC,
                            name: 'Public',
                            cidrMask: 24
                        },
                        {
                            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                            name: 'Private',
                            cidrMask: 24
                        }
                    ]
                });

                new CfnOutput(this, replaceUnderscore(`${cfnName}Export`), {
                    value: vpc.vpcId,
                    exportName: replaceUnderscore(`${cfnName}Id`),
                });

                this.pubVpc[dataSet.prmVpcName] = vpc;
            }catch (error){
                console.log(`[ERROR] VpcStack-createVpcFunc\n\tthe ${index + 1} th dataSet.\n${error}`);
            }
        } //--- for ---//
    }
} //--- class ---//
