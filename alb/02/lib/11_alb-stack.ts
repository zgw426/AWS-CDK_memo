import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

export class MyStackALB extends Stack {
  constructor(scope: Construct, id: string, props: MyStackALBProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const instance1 = new ec2.Instance(this, 'MyEC2Instance1', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const instance2 = new ec2.Instance(this, 'MyEC2Instance2', {
      vpc: vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc: vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('MyListener', {
      port: 80,
    });

    const instanceTarget1 = new elbv2_tg.InstanceTarget(instance1);
    const instanceTarget2 = new elbv2_tg.InstanceTarget(instance2);

    listener.addTargets('MyTargetGroup', {
      port: 80,
      targets: [instanceTarget1, instanceTarget2],
    });
  }
}

interface MyStackALBProps extends StackProps {
  vpc: ec2.Vpc;
}
