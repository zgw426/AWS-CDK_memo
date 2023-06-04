import { App, StackProps, Stack } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import * as rds from 'aws-cdk-lib/aws-rds';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as iam from 'aws-cdk-lib/aws-iam';


const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};


class CustomVpcStack extends cdk.Stack {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = this.createVpc();
  }

  private createVpc(): IVpc {
    return new Vpc(this, 'CustomVpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateWithNat',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'PrivateIsolatedA',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: 'PrivateIsolatedB',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}



//////////////////
// IAM
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

//////////////////




//////////////////
// Lambda

export interface CustomLambdaProps extends StackProps {
  lambdaSet: string;
}

export interface lambdas {
  lambdaName: string; // Lambda名
  lambdaHandler: string;
  codePath: string; // コード xxxx.py の格納パス
  note: string; // 備考
  iamRole: string; // 付与するIAMロール
}


export class CustomLambdaStack extends Stack {

  constructor(scope: Construct, id: string, props: CustomLambdaProps) {
      super(scope, id, props);

      const lambdas_data: { lambdas: lambdas[] } = JSON.parse(props.lambdaSet);
      const lambdas_list: lambdas[] = lambdas_data.lambdas;

      for (const lambda_target of lambdas_list) {
          console.log(`${lambda_target.lambdaName}`);

          ///////////////////////////
          const roleName = lambda_target.iamRole;
          console.log(`DEBUG roleName = ${roleName}`);
          const role = iam.Role.fromRoleName(this, 'Role'+lambda_target.lambdaName, roleName);
          console.log('Role ARN:', role.roleArn); // roleのARN値を表示
          ///////////////////////////

          new lambda.Function(this, lambda_target.lambdaName, {
              runtime: lambda.Runtime.PYTHON_3_9,
              functionName: lambda_target.lambdaName, // Lambda関数名を指定
              code: lambda.Code.fromAsset(lambda_target.codePath), // 指定ディレクトリからコードを取得
              handler: lambda_target.lambdaHandler, // xxx.pyファイルのlambda_handler関数を指定
              role: role,
          });
      }
  } //--- constructor ---//
} //--- class CustomLambdaStack ---//


//////////////////



class CustomAccessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomAccessProps) {
    super(scope, id, props);

    this.customRds(props); // RDS
  } //--- constructor ---//

  private customRds(loProps: CustomAccessProps): void {
    new DatabaseInstance(this, 'CustomRDS', {
      engine: DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_7
      }),
      vpc: loProps.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });
  } //--- private customRds ---//
}

interface CustomAccessProps extends cdk.StackProps {
  vpc: IVpc;
}

const app = new App();
const customVpcStack = new CustomVpcStack(app, 'CustomVpcStack');
new CustomAccessStack(app, 'CustomAccessStack', { vpc: customVpcStack.vpc });

/////
//////////////////////////////////////////////
// Lambda

const lambda_set: string = `{
  "lambdas": [
      {
        "note": "メモこれは lambda01 です",
        "lambdaName": "CustomLambdaFunction01",
        "lambdaHandler": "a01-sample.lambda_handler",
        "codePath": "lib/data/lambda/a01",
        "iamRole": "lambda-role"
      },
      {
        "note": "メモこれは lambda02 です",  
        "lambdaName": "CustomLambdaFunction02",
        "lambdaHandler": "a02-sample.lambda_handler",
        "codePath": "lib/data/lambda/a02",
        "iamRole": "lambda-role"
      }
  ]
}`;

const lambda_stack_props: CustomLambdaProps = {
  lambdaSet: lambda_set,
  env: env
}

const lambda_stack = new CustomLambdaStack(app, 'CustomLambdaStack', lambda_stack_props);

/////


app.synth();
