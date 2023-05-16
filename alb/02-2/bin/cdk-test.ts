#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { MyVpcStack } from '../lib/10_vpc-stack';
import { MyStackALB } from '../lib/11_alb-stack';

const app = new App({
    context: {
        "instanceType": "t2.micro"
    }
});

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};


const instanceType = app.node.tryGetContext('instanceType');

const vpcStack = new MyVpcStack(app, 'MyVpcStack', { env });
const albStack = new MyStackALB(app, 'MyStackALB', { vpc: vpcStack.vpc, instanceType, env });

albStack.addDependency(vpcStack);

app.synth();

