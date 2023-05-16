import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

export class MyVpcStack extends Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: MyVpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'MyVpc');
  }
}

interface MyVpcStackProps extends cdk.StackProps {}
