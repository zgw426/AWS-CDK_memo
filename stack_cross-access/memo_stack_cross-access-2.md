# CDK v2 (TypeScript) でクロススタック参照を考える

規則性のあるクロススタック参照を見つけたくて試行錯誤

## コードの規則について考えてみた

- 原則AWSリソースの種類ごとにクラス(class)を作る
- 複数のAWSリソースを1つのクラスにまとめた方が利点がある場合はまとめてOKとする
- 同じ種類のAWSリソースを作成する場合でも、指定するパラメータが大幅に違うなどあれば別にクラスを作る
- クラス(class)ごとにxxx.tsを作り`./lib/`配下に格納する
- `./lib/`配下のxxx.tsファイルの命名規則
    - {AWSリソース名}.ts
        - 例
            - `./lib/s3.ts`
    - {AWSリソース名}-{中身がわかる文字列}.ts
        - 例
            - `./lib/s3-setLifeCycle.ts`
            - `./lib/s3-setCrossRegion.ts`
- `./lib/xxx.ts`には以下を含める
    - クラス(class)
    - インタフェース(interface):props
        - クラスに渡す引数
    - インタフェース(interface):set
        - リソースを作るパラメータ
- クラス(class)について
    - リソースをN個作成できるようにする
    - 作ったリソースはクロススタック参照できるようにする(`public readonly ・・・`)
    - 作ったリソースは(念のため)CfnOutputValueでエクスポートする
    - constructorに書くコードはできるだけ少なくする
- インターフェース(set)について
    - インターフェース(set)は、1つのAWSリソースを作成するに必要なパラメータのセットを定義する
    - この定義の各要素(変数)に何を設定するかわかるようにコメントで説明する
- クラス外で作成したリソースへのアクセスについて
    - クラス外で作成したAWSリソースへのアクセスは、原則クロススタック参照を使用する
    - 手動作成のAWSリソースへのアクセスは `formXXX` が使えればそれを使う
        - `formXXX`の例を(*1)にかく
    - 上記のどちらでもアクセスできない場合は、臨機応変に考える(知らん)
- 組合せ
    - リソース作るときにセットで作るリソースがある。
    - そのセットのことを`組合せ`と呼称することにした。
    - 変数の接頭辞には組合せで決めた接頭辞をつける
    - スタック名にも組合せの接頭辞を付ける

## コードの規則を元にちょっと作ってみる

命名規則と実際の名前

|リソース|クラス|関数|インタフェース(props)|インタフェース(set)|
|---|---|---|-----|------|
|文字列の規則→|PascalCase|camelCase|PascalCase|PascalCase|
|命名規則→|XxxStack|createXxxFunc|XxxProps|XxxSet|
|IAM Role|IamRoleStack|createIamRolesFunc|IamRoleProps|IamRoleSet|
|Lambda|LambdaStack|createLambdaFunc|LambdaProps|LambdaSet|
|EC2|Ec2Stack|createEc2Func|Ec2Props|Ec2Set|

組合せには接頭辞を用意する

|組合せ名|接頭辞|備考|
|----|---|----|
|Combination01|cmd01|LambdaとそのLambdaに付与するIAMロールを作る|
|Combination02|cmd02|EC2とそのEC2に付与するIAMロールを作る|

スタック名などに組合せの接頭辞を付与し、デプロイしたときにどの組合せのものか分かりやすくする

|接頭辞|リソース|スタック|変数(props)|変数(set)|依存元|備考|
|---|---|---|---|---|---|---|
|cmd01|IAM Role|Cmb01IamRoleStack|cmb01IamRoleProps|cmb01IamRoleSet|ー|Lambda用のIAMロール|
|cmd01|Lambda|Cmb01LambdaStack|cmb01LambdaProps|cmb01LambdaSet|Cmb01IamRoleStack||
|cmd02|IAM Role|Cmb02IamRoleStack|cmb02IamRoleProps|cmb02IamRoleSet|ー|EC2用のIAMロール|
|cmd02|EC2|Cmb02Ec2Stack|cmb02Ec2Props|cmb02Ec2Set|Cmb02IamRoleStack||


## コードの規則を元に作ったサンプルコード

`./bin/xxx.ts`に全コードを書いてるから、完全にコード規則に準じてるわけじゃないサンプル

```typescript:./bin/xxx.ts
import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


//-------------------------------------------------------//
// Stack Dependencies

function addDependency(stack1: Stack, stack2: Stack) {
  stack1.node.addDependency(stack2);
}

///////////////////////////////////////////////////////////
// IAM Role

export interface IamRoleProps extends StackProps {
  iamRoleSet: IamRoleSet[];
}

export interface IamRoleSet{
  iamRoleName: string;
  policys: string[];
}

class IamRoleStack extends Stack {
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

///////////////////////////////////////////////////////////
// Lambda

export interface LambdaProps extends StackProps {
  lambdaSet: LambdaSet[];
}

export interface LambdaSet {
  lambdaName: string; // Lambda名
  lambdaHandler: string;
  codePath: string; // コード xxxx.py の格納パス
  note: string; // 備考
  iamRole: iam.Role; // 付与するIAMロール
}

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaProps) {
      super(scope, id, props);
      this.createLambdaFunc(props);
    } //--- constructor ---//

    private createLambdaFunc(props: LambdaProps) {
      for (const dataSet of props.lambdaSet) {
          console.log(`${dataSet.lambdaName}`);
          new lambda.Function(this, dataSet.lambdaName, {
              runtime: lambda.Runtime.PYTHON_3_9,
              functionName: dataSet.lambdaName,
              code: lambda.Code.fromAsset(dataSet.codePath),
              handler: dataSet.lambdaHandler,
              role: dataSet.iamRole,
          });
      }
    }
} //--- class ---//


///////////////////////////////////////////////////////////
// EC2

export interface Ec2Props extends StackProps {
  ec2Set: Ec2Set[];
}

export interface Ec2Set{
  instanceType: string;
  iamRole: iam.Role;
}

class Ec2Stack extends Stack {
  constructor(scope: App, id: string, props: Ec2Props) {
    super(scope, id, props);
    this.createEc2Func(props);
  }

  private createEc2Func(props: Ec2Props) {
    // 既存のVPCとサブネットのIDを指定
    const existingVpcId = 'vpc-12345678';
    const existingSubnetId = 'subnet-1234567';

    for (const dataSet of props.ec2Set) {
      const ec2Instance = new ec2.Instance(this, 'EC2Instance', {
        vpc: ec2.Vpc.fromLookup(this, 'ExistingVpc', {
          vpcId: existingVpcId
        }),
        instanceType: new ec2.InstanceType(dataSet.instanceType),
        machineImage: ec2.MachineImage.latestAmazonLinux(),
        role: dataSet.iamRole,
      });
    }
  }
}


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■//
const app = new App();

//=======================================================//
// Combination01 (LambdaとそのLambdaに付与するIAMロールを作る)
// 接頭辞 cmb01
//-------------------------------------------------------//
// IAM Role

const cmb01IamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-01",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  },
  {
    "iamRoleName": "iamrole-20230708-02",
    "policys": ["AmazonS3ReadOnlyAccess"],
  },
];

const cmb01IamRoleProps: IamRoleProps = {
  iamRoleSet: cmb01IamRoleSet
}

const cmb01IamRoleStack = new IamRoleStack(app, 'Cmb01IamRoleStack', cmb01IamRoleProps);

//-------------------------------------------------------//
// Lambda

const cmb01LambdaSet: LambdaSet[] = [
    {
      "note": "メモこれは lambda01 です",
      "lambdaName": "LambdaFunction01",
      "lambdaHandler": "a01-sample.lambda_handler",
      "codePath": "lib/data/lambda/a01",
      "iamRole": cmb01IamRoleStack.iamRoles["iamrole-20230708-01"],
    },
    {
      "note": "メモこれは lambda02 です",  
      "lambdaName": "LambdaFunction02",
      "lambdaHandler": "a02-sample.lambda_handler",
      "codePath": "lib/data/lambda/a02",
      "iamRole": cmb01IamRoleStack.iamRoles["iamrole-20230708-02"],
    }
];


const cmb01LambdaProps: LambdaProps = {
  lambdaSet: cmb01LambdaSet
}

const cmb01LambdaStack = new LambdaStack(app, 'Cmb01LambdaStack', cmb01LambdaProps);

addDependency(cmb01LambdaStack, cmb01IamRoleStack);


//=======================================================//
// Combination02 (EC2とそのEC2に付与するIAMロールを作る)
// 接頭辞 cmb02
//-------------------------------------------------------//
// IAM Role

const cmb02IamRoleSet: IamRoleSet[] = [
  {
    "iamRoleName": "iamrole-20230708-03",
    "policys": ["AmazonS3ReadOnlyAccess","AmazonDynamoDBReadOnlyAccess"],
  }
];

const cmb02IamRoleProps: IamRoleProps = {
  iamRoleSet: cmb02IamRoleSet
}

const cmb02IamRoleStack = new IamRoleStack(app, 'Cmb02IamRoleStack', cmb02IamRoleProps);

//-------------------------------------------------------//
// EC2

const cmb02Ec2Set: Ec2Set[] = [
  {
    "instanceType": "t2.micro",
    "iamRole": cmb02IamRoleStack.iamRoles["iamrole-20230708-03"],
  }
];

const cmb02Ec2Props: Ec2Props = {
  ec2Set: cmb02Ec2Set,
  env: {
    account: "123456789012",
    region: "ap-northeast-1"
  }
}

const cmb02Ec2Stack = new Ec2Stack(app, 'Cmb02Ec2Stack', cmb02Ec2Props);
addDependency(cmb02Ec2Stack, cmb02IamRoleStack);


// スタックをデプロイ
app.synth();
```



## (*1) formXXXの例

- ACM:
    - acm.Certificate.fromCertificateArn
- API Gateway v2:
    - apigatewayv2.Api.fromApiId
    - apigatewayv2.Stage.fromStageName
- CloudFormation:
    - cloudformation.Stack.fromStackName
- CloudFront:
    - cloudfront.Distribution.fromDistributionAttributes
- CloudWatch:
    - cloudwatch.Alarm.fromAlarmArn
- DynamoDB:
    - dynamodb.Table.fromTableName
- EC2:
    - ec2.Vpc.fromVpcAttributes
    - ec2.Instance.fromInstanceAttributes
- Elastic Beanstalk:
    - elasticbeanstalk.Application.fromApplicationName
- IAM:
    - iam.Role.fromRoleArn
    - iam.Role.fromRoleName
- Lambda:
    - lambda.Function.fromFunctionArn
    - lambda.Function.fromFunctionName
- S3:
    - s3.Bucket.fromBucketArn
    - s3.Bucket.fromBucketName
- SecurityGroup:
    - ec2.SecurityGroup.fromSecurityGroupId
    - ec2.SecurityGroup.fromSecurityGroupName
    - ec2.SecurityGroup.fromLookup
- VPC
    - ec2.Vpc.fromVpcAttributes
    - ec2.Vpc.fromLookup
    - ec2.Vpc.fromVpcId
    - ec2.Vpc.fromVpcAttributes
- サブネットグループ
    - ec2.SubnetGroup.fromSubnetGroupName
    - ec2.SubnetGroup.fromLookup
