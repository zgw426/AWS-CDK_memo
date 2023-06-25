# CDK v2 (TypeScript) RDSをデプロイするコード



## ChatGPTプロンプト

```
#命令書
あなたはプロのプログラマーです。以下の制約条件に従って、入力する条件をもとにスクリプトをかいてください。

#制約条件
・aws cdk v2 スクリプト
・プログラム言語はTypeScript
・cdkコマンドは東京リージョンの環境で実行
・東京リージョンの環境にデプロイ


#入力する文章
RDSを作成するCDKスクリプトを作成してください
```



## 環境

Cloud9

```console
iam0001:~/environment/cdk-test (master) $ npm --version
8.19.4
iam0001:~/environment/cdk-test (master) $ cdk --version
2.78.0 (build 8e95c37)
iam0001:~/environment/cdk-test (master) $ node --version
v16.20.0
```

## サンプル（１）

VPCも作成しRDSを作る

### コード

ChatGPTが作ったコードをちょっと修正すると動いた
secretmanagerが使われてて、DBユーザー、パスワードはそこに登録されている

```typescript:bin/cdk-test.ts
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'MyStack', {
  env: {
    region: 'ap-northeast-1' // 東京リージョン
  }
});

new rds.DatabaseInstance(stack, 'MyRdsInstance', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_12_7
  }),
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
  allocatedStorage: 20,
  credentials: rds.Credentials.fromUsername('myusername'),
  vpc: new ec2.Vpc(stack, 'MyVpc'),
  databaseName: 'mydatabase'
});

app.synth();
```

### リソースの情報確認

デプロイされたDBの情報はこんな感じ

```
マスターユーザー名　`myusername`
マスターパスワード　`password`
エンジンバージョン　12.7
DB 名　mydatabase
インスタンスクラス　db.t2.micro
vCPU　1
RAM　1 GB
IAM DB 認証　有効でない
マルチ AZ　なし

ストレージ　非暗号化
ストレージタイプ　汎用 SSD (gp2)
ストレージ　20 GiB
プロビジョンド IOPS　-
ストレージスループット　-
ストレージの自動スケーリング　無効
```


### 接続テスト

デプロイしたDBにアクセスしてみる。
前述のとおり、secretmanagerが使われてて、DBユーザー、パスワードはそこに登録されている

動作確認に必要なモジュールをCloud9にインストールする

postgresインストール

```sudo yum install postgresql postgresql-server postgresql-devel postgresql-contrib```

jqインストール

```sudo yum install jq```

これで準備完了。DBにアクセスする

RDS(Postgre) secretmanaer 使ってDBアクセスするコマンド

DBアクセスの基本

```console
export AWS_REGION=<リージョン名>
export SECRET_ID=<Secrets ManagerのシークレットID>
PGPASSWORD=$(aws secretsmanager get-secret-value --secret-id $SECRET_ID --query SecretString --output text | jq -r '.password')
psql "postgresql://<DBユーザー名>:${PGPASSWORD}@<DBエンドポイント>:<ポート番号>/<データベース名>?sslmode=require"
```

DBアクセスの基本で必要パラメータを登録したもの

```console
export AWS_REGION=ap-northeast-1
export SECRET_ID=arn:aws:secretsmanager:ap-northeast-1:123456789123:secret:MyRdsInstanceSecretD3481B26-q74f8LFlXGYH-BySXrg

PGPASSWORD=$(aws secretsmanager get-secret-value --secret-id $SECRET_ID --query SecretString --output text | jq -r '.password')
psql "postgresql://myusername:${PGPASSWORD}@mystack-myrdsinstancefb602cdd-vorlozcfnlxl.c6ekiibnabdc.ap-northeast-1.rds.amazonaws.com:5432/mydatabase?sslmode=require"

```

DBアクセスしてみた。

```console
iam0001:~/environment $ export AWS_REGION=ap-northeast-1
iam0001:~/environment $ export SECRET_ID=arn:aws:secretsmanager:ap-northeast-1:123456789123:secret:MyRdsInstanceSecretD3481B26-q74f8LFlXGYH-BySXrg
iam0001:~/environment $ PGPASSWORD=$(aws secretsmanager get-secret-value --secret-id $SECRET_ID --query SecretString --output text | jq -r '.password')
iam0001:~/environment $ psql "postgresql://myusername:${PGPASSWORD}@mystack-myrdsinstancefb602cdd-vorlozcfnlxl.c6ekiibnabdc.ap-northeast-1.rds.amazonaws.com:5432/mydatabase?sslmode=require"
psql (9.2.24, server 12.7)
WARNING: psql version 9.2, server version 12.0.
         Some psql features might not work.
SSL connection (cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256)
Type "help" for help.

mydatabase=> 
```

SecretManagerからパスワードを抜き出してみた

```console
iam0001:~/environment $ echo ${SECRET_ID}
arn:aws:secretsmanager:ap-northeast-1:123456789123:secret:MyRdsInstanceSecretD3481B26-q74f8LFlXGYH-BySXrg
iam0001:~/environment $ echo ${PGPASSWORD}
xmnuPe=JV_oRUu898VZld7.aGtYUMa
```

## サンプル（２）

VPCとRDSは、別クラスにし、クロススタック参照をつかってVPCを指定する

```typescript
import { App, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import * as rds from 'aws-cdk-lib/aws-rds';

class CustomVpcStack extends cdk.Stack {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = this.createVpc();
    this.outputSubnetIds();
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

  private outputSubnetIds(): void {
    const publicSubnets = this.vpc.publicSubnets;
    const privateSubnets = this.vpc.privateSubnets;

    console.log('Public Subnets:');
    for (const subnet of publicSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
    }

    console.log('Private Subnets:');
    for (const subnet of privateSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
    }
  }
}

class CustomAccessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomAccessProps) {
    super(scope, id, props);

    const vpcInfo = props.vpc;

    console.log('VPC:', vpcInfo.vpcId);
    console.log('VPC CIDR:', vpcInfo.vpcCidrBlock);

    const publicSubnets = vpcInfo.publicSubnets;
    const privateSubnets = vpcInfo.privateSubnets;

    console.log('Public Subnets:');
    for (const subnet of publicSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
      console.log('Subnet CIDR:', subnet.ipv4CidrBlock);
    }

    console.log('Private Subnets:');
    for (const subnet of privateSubnets) {
      console.log('Subnet ID:', subnet.subnetId);
      console.log('Subnet CIDR:', subnet.ipv4CidrBlock);
    }

    // Create RDS instance in the 'PrivateIsolatedA' subnet
    const customRds = new DatabaseInstance(this, 'CustomRDS', {
      engine: DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_7
      }),
      vpc: vpcInfo,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });
  }
}

interface CustomAccessProps extends cdk.StackProps {
  vpc: IVpc;
}

const app = new App();
const customVpcStack = new CustomVpcStack(app, 'CustomVpcStack');
new CustomAccessStack(app, 'CustomAccessStack', { vpc: customVpcStack.vpc });
app.synth();
```


## サンプル（３）

- クラスと関数をつかってみる。
- `CustomVpcStack`クラスでVPCを作る関数`createVpc()`を定義する

```typescript:bin/xxx.ts
import { App, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import * as rds from 'aws-cdk-lib/aws-rds';

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
app.synth();
```


