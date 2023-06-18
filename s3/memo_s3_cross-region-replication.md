


```typescript:動いたかも
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';



interface CustomS3Props extends StackProps {
  bucketName: string;
}

class CustomS3 extends Stack {
  constructor(scope: App, id: string, props: CustomS3Props) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: props.bucketName,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}



class S3ReplicationStack extends Stack {
  constructor(scope: Construct, constructId: string) {
    super(scope, constructId);

    // Create the source bucket
    const sourceBucket = new Bucket(this, 'MyBucket', {
      bucketName: 'mysuo-20230617-05',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create the replication bucket
    //*
    const replicationBucket = new Bucket(this, 'ReplicationBucket', {
      bucketName: 'mysuo-20230617-05-replica',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });//*/


    //レプリケーション先のS3バケットを参照する
    ////const replicationBucketName = "mysuo-20230617-07-osaka"
    ////const replicationBucket = s3.Bucket.fromBucketName(this, "ReplicationBucket", replicationBucketName)


    // Get the underlying CloudFormation bucket resources
    const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
    const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

    // Set versioning configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
      Status: 'Enabled',
    });

    // Create a replication rule
    const replicationRule = {
      Id: 'MyReplicationRule',
      Prefix: '/',
      Status: 'Enabled',
      Destination: {
        Bucket: replicationBucket.bucketArn,
        StorageClass: 'STANDARD_IA',
      },
    };

    // Set the replication configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
      Role: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
      Rules: [replicationRule],
    });

  }
}

const app = new App();


//new CustomS3(app, 'CustomS3', { env: {  region: 'ap-northeast-1'}, bucketName: 'mysuo-20230617-07' });
new CustomS3(app, 'CustomS3-rep', { env: {  region: 'ap-northeast-3'}, bucketName: 'mysuo-20230617-07-osaka' });

new S3ReplicationStack(app, 'S3ReplicationStack');

app.synth();

```






```typescript:バケットまるごとレプリケーションの設定（ただし同じリージョンのS3バケット）
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface CustomS3Props extends StackProps {
  bucketName: string;
}

class CustomS3 extends Stack {
  constructor(scope: App, id: string, props: CustomS3Props) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: props.bucketName,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}



class S3ReplicationStack extends Stack {
  constructor(scope: Construct, constructId: string) {
    super(scope, constructId);

    // Create the source bucket
    const sourceBucket = new Bucket(this, 'MyBucket', {
      bucketName: 'mysuo-20230617-06',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create the replication bucket
    //*
    const replicationBucket = new Bucket(this, 'ReplicationBucket', {
      bucketName: 'mysuo-20230617-06-replica',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });//*/


    //レプリケーション先のS3バケットを参照する
    ////const replicationBucketName = "mysuo-20230617-07-osaka"
    ////const replicationBucket = s3.Bucket.fromBucketName(this, "ReplicationBucket", replicationBucketName)


    // Get the underlying CloudFormation bucket resources
    const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
    const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

    // Set versioning configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
      Status: 'Enabled',
    });

    // Create a replication rule
    const replicationRule = {
      Id: 'MyReplicationRule',
      Status: 'Enabled',
      Prefix: '',
      Destination: {
        Bucket: replicationBucket.bucketArn,
        StorageClass: 'STANDARD_IA',
      },
    };

    // Set the replication configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
      Role: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
      Rules: [replicationRule],
    });

  }
}

const app = new App();


//new CustomS3(app, 'CustomS3', { env: {  region: 'ap-northeast-1'}, bucketName: 'mysuo-20230617-07' });
new CustomS3(app, 'CustomS3-rep', { env: {  region: 'ap-northeast-3'}, bucketName: 'mysuo-20230617-07-osaka' });
new S3ReplicationStack(app, 'S3ReplicationStack');
//S3ReplicationStack.addDependency(CustomS3);

app.synth();
```






```typescript:バケットまるごとレプリケーションの設定（東京リージョンのS3バケットから大阪リージョンのS3バケットにレプリケーションする）
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface CustomS3Props extends StackProps {
  bucketName: string;
}


class CustomS3 extends Stack {
  constructor(scope: App, id: string, props: CustomS3Props) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: props.bucketName,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}


class S3ReplicationStack extends Stack {
  constructor(scope: Construct, constructId: string) {
    super(scope, constructId);

    // Create the source bucket
    const sourceBucket = new Bucket(this, 'MyBucket', {
      bucketName: 'mysuo-20230617-06',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //レプリケーション先の（既存の）S3バケットを参照する
    const replicationBucketName = "mysuo-20230617-08-osaka"
    const replicationBucket = s3.Bucket.fromBucketName(this, "ReplicationBucket", replicationBucketName)

    // Get the underlying CloudFormation bucket resources
    const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
    const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

    // Set versioning configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
      Status: 'Enabled',
    });

    // Create a replication rule
    const replicationRule = {
      Id: 'MyReplicationRule',
      Status: 'Enabled',
      Prefix: '',
      Destination: {
        Bucket: replicationBucket.bucketArn,
        StorageClass: 'STANDARD_IA',
      },
    };

    // Set the replication configuration on the source bucket
    cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
      Role: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
      Rules: [replicationRule],
    });

  }
}

const app = new App();

//大阪リージョンにS3バケット作る
new CustomS3(app, 'CustomS3-rep', { env: {  region: 'ap-northeast-3'}, bucketName: 'mysuo-20230617-08-osaka' });
//東京リージョンにS3バケット作り
new S3ReplicationStack(app, 'S3ReplicationStack');
//S3ReplicationStack.addDependency(CustomS3);

app.synth();
```



```
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


interface CustomS3ReplicationOsakaProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 大阪リージョンS3バケット群
}

interface CustomS3ReplicationTokyoProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 東京リージョンS3バケット群
}

export interface s3ReplicationSet {
  note: string; // 備考欄
  sourceBucketName: string; // レプリケーション元のS3バケット(東京リージョン)
  replicationBucketName: string; // レプリケーション先のS3バケット(大阪リージョン)
  replicationRule: string; // レプリケーションルール名
  replicationIamRole: string; // レプリケーションのIAMロール

}


class CustomS3ReplicationOsaka extends Stack {
  // S3バケットを作成する
  constructor(scope: App, id: string, props: CustomS3ReplicationOsakaProps) {
    super(scope, id, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;
    for (const dataTarget of jsonList) {
      // S3バケットを作成
      const bucket = new Bucket(this, dataTarget.replicationBucketName, {
        bucketName: dataTarget.replicationBucketName,
        versioned: true,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}


class S3ReplicationTokyo extends Stack {
  // レプリケーションの設定混みでS3バケットを作成する
  constructor(scope: Construct, constructId: string, props: CustomS3ReplicationTokyoProps) {
    super(scope, constructId, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;

    for (const dataTarget of jsonList) {
      // Create the source bucket
      const sourceBucket = new Bucket(this, dataTarget.sourceBucketName, {
        bucketName: dataTarget.sourceBucketName,
        versioned: true,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      //レプリケーション先のS3バケットを参照する
      const replicationBucketName = dataTarget.replicationBucketName;
      const replicationBucket = s3.Bucket.fromBucketName(this, dataTarget.replicationBucketName, replicationBucketName)

      // Get the underlying CloudFormation bucket resources
      const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
      const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

      // Set versioning configuration on the source bucket
      cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
        Status: 'Enabled',
      });

      // Create a replication rule
      const replicationRule = {
        Id: dataTarget.replicationRule,
        Status: 'Enabled',
        Prefix: '',
        Destination: {
          Bucket: replicationBucket.bucketArn,
          StorageClass: 'STANDARD_IA',
        },
      };

      // Set the replication configuration on the source bucket
      cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
        Role: dataTarget.replicationIamRole,
        Rules: [replicationRule],
      });
    }
  }
}

const app = new App();

const s3Replications: s3ReplicationSet[] = [
  {
    note: 'S3クロスリージョンレプリケーション（１）',
    sourceBucketName: 'mysuo-20230617-10',
    replicationBucketName: 'mysuo-20230617-10-osaka',
    replicationRule: 'CustomReplicationRule',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
  },
  {
    note: 'S3クロスリージョンレプリケーション（２）',
    sourceBucketName: 'mysuo-20230617-11',
    replicationBucketName: 'mysuo-20230617-11-osaka',
    replicationRule: 'CustomReplicationRule',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
  },
];


////-- 大阪リージョンに --////

const customS3ReplicationOsakaProps: CustomS3ReplicationOsakaProps = {
  s3ReplicatinSet: s3Replications,
  env: {  region: 'ap-northeast-3'},
}

new CustomS3ReplicationOsaka(app, 'CustomS3ReplicationOsaka', customS3ReplicationOsakaProps );

////-- 東京リージョンに --////

const customS3ReplicationTokyoProps: CustomS3ReplicationTokyoProps = {
  s3ReplicatinSet: s3Replications,
  env: {  region: 'ap-northeast-1'},
}

new S3ReplicationTokyo(app, 'CustomS3ReplicationTokyo', customS3ReplicationTokyoProps );

app.synth();
```




レプリケーションルールをJSONファイルから読み込む

```
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs';

interface CustomS3ReplicationOsakaProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 大阪リージョンS3バケット群
}

interface CustomS3ReplicationTokyoProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 東京リージョンS3バケット群
}

export interface s3ReplicationSet {
  note: string; // 備考欄
  sourceBucketName: string; // レプリケーション元のS3バケット(東京リージョン)
  replicationBucketName: string; // レプリケーション先のS3バケット(大阪リージョン)
  replicationRuleFile: string; // レプリケーション設定ファイル(JSON)
  replicationIamRole: string; // レプリケーションのIAMロール

}


class CustomS3ReplicationOsaka extends Stack {
  // S3バケットを作成する
  constructor(scope: App, id: string, props: CustomS3ReplicationOsakaProps) {
    super(scope, id, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;
    for (const dataTarget of jsonList) {
      // S3バケットを作成
      const bucket = new Bucket(this, dataTarget.replicationBucketName, {
        bucketName: dataTarget.replicationBucketName,
        versioned: true,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}


class S3ReplicationTokyo extends Stack {
  // レプリケーションの設定混みでS3バケットを作成する
  constructor(scope: Construct, constructId: string, props: CustomS3ReplicationTokyoProps) {
    super(scope, constructId, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;

    for (const dataTarget of jsonList) {
      // Create the source bucket
      const sourceBucket = new Bucket(this, dataTarget.sourceBucketName, {
        bucketName: dataTarget.sourceBucketName,
        versioned: true,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      //レプリケーション先のS3バケットを参照する
      const replicationBucketName = dataTarget.replicationBucketName;
      const replicationBucket = s3.Bucket.fromBucketName(this, dataTarget.replicationBucketName, replicationBucketName)

      // Get the underlying CloudFormation bucket resources
      const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
      const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

      // Set versioning configuration on the source bucket
      cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
        Status: 'Enabled',
      });

      // レプリケーションルールのJSONファイルを読み込む
      const replicationRuleFile = fs.readFileSync(dataTarget.replicationRuleFile, 'utf-8');
      const replicationRule = JSON.parse(replicationRuleFile);

      // Set the replication configuration on the source bucket
      cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
        Role: dataTarget.replicationIamRole,
        Rules: [replicationRule],
      });

      // Set the replication configuration on the source bucket
      cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
        Role: dataTarget.replicationIamRole,
        Rules: [replicationRule],
      });
    }
  }
}

const app = new App();

const s3Replications: s3ReplicationSet[] = [
  {
    note: 'S3クロスリージョンレプリケーション（１）',
    sourceBucketName: 'mysuo-20230617-10',
    replicationBucketName: 'mysuo-20230617-10-osaka',
    replicationRuleFile: 'bin/replication-rule-1.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
  },
  {
    note: 'S3クロスリージョンレプリケーション（２）',
    sourceBucketName: 'mysuo-20230617-11',
    replicationBucketName: 'mysuo-20230617-11-osaka',
    replicationRuleFile: 'bin/replication-rule-1.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
  },
];


////-- 大阪リージョンに --////

const customS3ReplicationOsakaProps: CustomS3ReplicationOsakaProps = {
  s3ReplicatinSet: s3Replications,
  env: {  region: 'ap-northeast-3'},
}

new CustomS3ReplicationOsaka(app, 'CustomS3ReplicationOsaka', customS3ReplicationOsakaProps );

////-- 東京リージョンに --////

const customS3ReplicationTokyoProps: CustomS3ReplicationTokyoProps = {
  s3ReplicatinSet: s3Replications,
  env: {  region: 'ap-northeast-1'},
}

new S3ReplicationTokyo(app, 'CustomS3ReplicationTokyo', customS3ReplicationTokyoProps );

app.synth();
```

```JSON:replication-rule-1.json
{
  "Id": "MyReplicationRule",
  "Status": "Enabled",
  "Prefix": "",
  "Destination": {
    "Bucket": "arn:aws:s3:::mysuo-20230617-10-osaka",
    "StorageClass": "STANDARD_IA"
  }
}
```




-------------

大阪リージョンのS3バケットにライフサイクルポリシー

```typescript
import { App, Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Bucket, LifecycleRule, StorageClass } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs';

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';


interface CustomS3ReplicationOsakaProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 大阪リージョンS3バケット群
}

interface CustomS3ReplicationTokyoProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 東京リージョンS3バケット群
}

export interface s3ReplicationSet {
  note: string; // 備考欄
  sourceBucketName: string; // レプリケーション元のS3バケット(東京リージョン)
  replicationBucketName: string; // レプリケーション先のS3バケット(大阪リージョン)
  replicationRuleFile?: string; // レプリケーション設定ファイル(JSON)
  replicationIamRole?: string; // レプリケーションのIAMロール
  versionedTokyo: boolean, // バケットのバージョニング有効/無効

}


class CustomS3ReplicationOsaka extends Stack {
  // S3バケットを作成する
  constructor(scope: App, id: string, props: CustomS3ReplicationOsakaProps) {
    super(scope, id, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;
    for (const dataTarget of jsonList) {
      if(dataTarget.replicationBucketName != 'dummy'){
        // S3バケットを作成
        const bucket = new Bucket(this, dataTarget.replicationBucketName, {
          bucketName: dataTarget.replicationBucketName,
          versioned: true,
          removalPolicy: RemovalPolicy.DESTROY,
        });
        ///////////////////////////
        // ライフサイクルポリシーを設定
        bucket.addLifecycleRule({
          abortIncompleteMultipartUploadAfter: Duration.days(7), // 7日後に未完了のマルチパートアップロードを中止
          transitions: [
            {
              storageClass: StorageClass.GLACIER, // ストレージクラスをGLACIERに変更
              transitionAfter: Duration.days(30), // 30日後に移行
            },
          ],
        });
        ///////////////////////////
      }
    }
  }
}


class S3ReplicationTokyo extends Stack {
  // レプリケーションの設定混みでS3バケットを作成する
  constructor(scope: Construct, constructId: string, props: CustomS3ReplicationTokyoProps) {
    super(scope, constructId, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;

    for (const dataTarget of jsonList) {
      // Create the source bucket
      const sourceBucket = new Bucket(this, dataTarget.sourceBucketName, {
        bucketName: dataTarget.sourceBucketName,
        versioned: dataTarget.versionedTokyo,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      if(dataTarget.replicationRuleFile){
        //レプリケーション先のS3バケットを参照する
        const replicationBucketName = dataTarget.replicationBucketName;
        const replicationBucket = s3.Bucket.fromBucketName(this, dataTarget.replicationBucketName, replicationBucketName)
        const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;


        // Get the underlying CloudFormation bucket resources
        const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
        //const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

        // Set versioning configuration on the source bucket
        cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
          Status: 'Enabled',
        });

        // レプリケーションルールのJSONファイルを読み込む
        const replicationRuleFile = fs.readFileSync(dataTarget.replicationRuleFile, 'utf-8');
        const replicationRule = JSON.parse(replicationRuleFile);

        // Set the replication configuration on the source bucket
        cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
          Role: dataTarget.replicationIamRole,
          Rules: [replicationRule],
        });

        // Set the replication configuration on the source bucket
        cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
          Role: dataTarget.replicationIamRole,
          Rules: [replicationRule],
        });
      }
    }//--- for ---//
  }
}

const app = new App();

const headStr = 'tesuo';

const s3Replications: s3ReplicationSet[] = [
  {
    note: 'S3クロスリージョンレプリケーション（１）',
    sourceBucketName: `${headStr}-20230617-10`,
    replicationBucketName: `${headStr}-20230617-10-osaka`,
    replicationRuleFile: 'bin/replication-rule-1.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
    versionedTokyo: true,
  },
  {
    note: 'S3クロスリージョンレプリケーション（２）',
    sourceBucketName: `${headStr}-20230617-11`,
    replicationBucketName: `${headStr}-20230617-11-osaka`,
    replicationRuleFile: 'bin/replication-rule-2.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
    versionedTokyo: true,
  },
  {
    note: 'S3クロスリージョンレプリケーション（３）',
    sourceBucketName: `${headStr}-20230617-12`,
    replicationBucketName: 'dummy',
    versionedTokyo: false,
  }
];


////-- 大阪リージョン --////

const customS3ReplicationOsakaProps: CustomS3ReplicationOsakaProps = {
  s3ReplicatinSet: s3Replications,
  env: { region: 'ap-northeast-3'},
}

new CustomS3ReplicationOsaka(app, 'CustomS3ReplicationOsaka', customS3ReplicationOsakaProps );

////-- 東京リージョン --////

const customS3ReplicationTokyoProps: CustomS3ReplicationTokyoProps = {
  s3ReplicatinSet: s3Replications,
  env: { region: 'ap-northeast-1'},
}

new S3ReplicationTokyo(app, 'CustomS3ReplicationTokyo', customS3ReplicationTokyoProps );

app.synth();
```



## ライフサイクルポリシーの設定を追加

```typescript
import { App, Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Bucket, LifecycleRule, StorageClass, Transition } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs';

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface CustomS3ReplicationOsakaProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 大阪リージョンS3バケット群
}

interface CustomS3ReplicationTokyoProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 東京リージョンS3バケット群
}

export interface s3ReplicationSet {
  note: string; // 備考欄
  sourceBucketName: string; // レプリケーション元のS3バケット(東京リージョン)
  replicationBucketName: string; // レプリケーション先のS3バケット(大阪リージョン)
  replicationRuleFile?: string; // レプリケーション設定ファイル(JSON)
  replicationIamRole?: string; // レプリケーションのIAMロール
  versionedTokyo: boolean, // バケットのバージョニング有効/無効
  lifecycleId: string; // ライフサイクルポリシー：名前
  lifecycleExpiration: number; // ライフサイクルポリシー：オブジェクト作成後の日数
  lifecycleNoncurrentVersionExpiration: number; // ライフサイクルポリシー：オブジェクトが現行バージョンでなくなってからの日数
  lifecycleAbortIncompleteMultipartUploadAfter: number; // ライフサイクルポリシー：不完全なマルチパートアップロードを削除
  lifecycleEnabled: boolean; // ライフサイクルポリシー：
  lifecycleExpiredObjectDeleteMarker: boolean; // ライフサイクルポリシー：
  lifecycleNoncurrentVersionsToRetain: number; // ライフサイクルポリシー：保持する新しいバージョンの数
  lifecycleTransitionsTransitionAfter: number; // ライフサイクルポリシー：オブジェクトが現行バージョンでなくなってからの日数
  lifecycleTransitionsNoncurrentVersionsToRetain: number; // ライフサイクルポリシー：最新の 〇個の非現行バージョンは保持されます
}

export interface LifecycleRuleConfig {
  abortIncompleteMultipartUploadAfter?: Duration;
  transitions?: LifecycleRuleTransition[];
}

export interface LifecycleRuleTransition {
  storageClass: StorageClass;
  transitionAfterObjectExists: Duration;
}



//declare const storageClass: s3.StorageClass;

class CustomS3ReplicationOsaka extends Stack {
  // S3バケットを作成する
  constructor(scope: App, id: string, props: CustomS3ReplicationOsakaProps) {
    super(scope, id, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;
    for (const dataTarget of jsonList) {
      if(dataTarget.replicationBucketName != 'dummy'){
        // S3バケットを作成
        const bucket = new Bucket(this, dataTarget.replicationBucketName, {
          bucketName: dataTarget.replicationBucketName,
          versioned: true,
          removalPolicy: RemovalPolicy.DESTROY,

          //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.LifecycleRule.html
          /*
          lifecycleRules: [
            {
              id: 'lifecycle-test',
              expiration: Duration.days(365), // オブジェクト作成後の日数
              noncurrentVersionExpiration: Duration.days(20), // オブジェクトが現行バージョンでなくなってからの日数
              abortIncompleteMultipartUploadAfter: Duration.days(70), // 不完全なマルチパートアップロードを削除
              enabled: false,
              expiredObjectDeleteMarker: false,
              noncurrentVersionsToRetain: 3, // 保持する新しいバージョンの数
              noncurrentVersionTransitions: [{
                storageClass: StorageClass.GLACIER,
                transitionAfter: Duration.days(10), // オブジェクトが現行バージョンでなくなってからの日数
                noncurrentVersionsToRetain: 21, // 最新の 21 個の非現行バージョンは保持されます
              }],
            }
          ]
          */
          lifecycleRules: [
            {
              id: dataTarget.lifecycleId,
              expiration: Duration.days(dataTarget.lifecycleExpiration), // オブジェクト作成後の日数
              noncurrentVersionExpiration: Duration.days(dataTarget.lifecycleNoncurrentVersionExpiration), // オブジェクトが現行バージョンでなくなってからの日数
              abortIncompleteMultipartUploadAfter: Duration.days(dataTarget.lifecycleAbortIncompleteMultipartUploadAfter), // 不完全なマルチパートアップロードを削除
              enabled: dataTarget.lifecycleEnabled,
              expiredObjectDeleteMarker: dataTarget.lifecycleExpiredObjectDeleteMarker,
              noncurrentVersionsToRetain: dataTarget.lifecycleNoncurrentVersionsToRetain, // 保持する新しいバージョンの数
              noncurrentVersionTransitions: [{
                storageClass: StorageClass.GLACIER,
                transitionAfter: Duration.days(dataTarget.lifecycleTransitionsTransitionAfter), // オブジェクトが現行バージョンでなくなってからの日数
                noncurrentVersionsToRetain: dataTarget.lifecycleTransitionsNoncurrentVersionsToRetain, // 最新の 21 個の非現行バージョンは保持されます
              }],
            }
          ],

        });
      }
    } //--- for (const dataTarget of jsonList) ---//
  }
}


class S3ReplicationTokyo extends Stack {
  // レプリケーションの設定混みでS3バケットを作成する
  constructor(scope: Construct, constructId: string, props: CustomS3ReplicationTokyoProps) {
    super(scope, constructId, props);

    const jsonList: s3ReplicationSet[] = props.s3ReplicatinSet;

    for (const dataTarget of jsonList) {
      // Create the source bucket
      const sourceBucket = new Bucket(this, dataTarget.sourceBucketName, {
        bucketName: dataTarget.sourceBucketName,
        versioned: dataTarget.versionedTokyo,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      if(dataTarget.replicationRuleFile){
        //レプリケーション先のS3バケットを参照する
        const replicationBucketName = dataTarget.replicationBucketName;
        const replicationBucket = s3.Bucket.fromBucketName(this, dataTarget.replicationBucketName, replicationBucketName)
        const cfnReplicationBucket = replicationBucket.node.defaultChild as s3.CfnBucket;

        const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
        cfnSourceBucket.addPropertyOverride('VersioningConfiguration', {
          Status: 'Enabled',
        });

        // レプリケーションルールのJSONファイルを読み込む
        const replicationRuleFile = fs.readFileSync(dataTarget.replicationRuleFile, 'utf-8');
        const replicationRule = JSON.parse(replicationRuleFile);

        // Set the replication configuration on the source bucket
        cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
          Role: dataTarget.replicationIamRole,
          Rules: [replicationRule],
        });

        // Set the replication configuration on the source bucket
        cfnSourceBucket.addPropertyOverride('ReplicationConfiguration', {
          Role: dataTarget.replicationIamRole,
          Rules: [replicationRule],
        });
      }
    }//--- for ---//
  }
}

const app = new App();

const headStr = 'tesuo';

const s3Replications: s3ReplicationSet[] = [
  {
    note: 'S3クロスリージョンレプリケーション（１）',
    sourceBucketName: `${headStr}-20230617-10`,
    replicationBucketName: `${headStr}-20230617-10-osaka`,
    replicationRuleFile: 'bin/replication-rule-1.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
    versionedTokyo: true,
    // 大阪リージョンのライフサイクルポリシー
    lifecycleId: `${headStr}-lifecycle-test`,
    lifecycleExpiration: 365,
    lifecycleNoncurrentVersionExpiration: 20,
    lifecycleAbortIncompleteMultipartUploadAfter: 70,
    lifecycleEnabled: false,
    lifecycleExpiredObjectDeleteMarker: false,
    lifecycleNoncurrentVersionsToRetain: 3,
    lifecycleTransitionsTransitionAfter: 10,
    lifecycleTransitionsNoncurrentVersionsToRetain: 21,
  },
  {
    note: 'S3クロスリージョンレプリケーション（２）',
    sourceBucketName: `${headStr}-20230617-11`,
    replicationBucketName: `${headStr}-20230617-11-osaka`,
    replicationRuleFile: 'bin/replication-rule-2.json',
    replicationIamRole: 'arn:aws:iam::123456789012:role/S3ReplicationRole',
    versionedTokyo: true,
    // 大阪リージョンのライフサイクルポリシー
    lifecycleId: `${headStr}-lifecycle-test`,
    lifecycleExpiration: 365,
    lifecycleNoncurrentVersionExpiration: 20,
    lifecycleAbortIncompleteMultipartUploadAfter: 70,
    lifecycleEnabled: false,
    lifecycleExpiredObjectDeleteMarker: false,
    lifecycleNoncurrentVersionsToRetain: 3,
    lifecycleTransitionsTransitionAfter: 10,
    lifecycleTransitionsNoncurrentVersionsToRetain: 21,
  },
  {
    note: 'S3クロスリージョンレプリケーション（３）',
    sourceBucketName: `${headStr}-20230617-12`,
    replicationBucketName: 'dummy',
    versionedTokyo: false,
    // 大阪リージョンのライフサイクルポリシー
    lifecycleId: `${headStr}-lifecycle-test`,
    lifecycleExpiration: 365,
    lifecycleNoncurrentVersionExpiration: 20,
    lifecycleAbortIncompleteMultipartUploadAfter: 70,
    lifecycleEnabled: false,
    lifecycleExpiredObjectDeleteMarker: false,
    lifecycleNoncurrentVersionsToRetain: 3,
    lifecycleTransitionsTransitionAfter: 10,
    lifecycleTransitionsNoncurrentVersionsToRetain: 21,
  }
];


////-- 大阪リージョン --////

const customS3ReplicationOsakaProps: CustomS3ReplicationOsakaProps = {
  s3ReplicatinSet: s3Replications,
  env: { region: 'ap-northeast-3'},
}

new CustomS3ReplicationOsaka(app, 'CustomS3ReplicationOsaka', customS3ReplicationOsakaProps );

////-- 東京リージョン --////

const customS3ReplicationTokyoProps: CustomS3ReplicationTokyoProps = {
  s3ReplicatinSet: s3Replications,
  env: { region: 'ap-northeast-1'},
}

new S3ReplicationTokyo(app, 'CustomS3ReplicationTokyo', customS3ReplicationTokyoProps );

app.synth();
```

replication-rule-1.json

```json:replication-rule-1.json
{
  "Id": "MyReplicationRule1",
  "Status": "Enabled",
  "Prefix": "",
  "Destination": {
    "Bucket": "arn:aws:s3:::mysuo-20230617-10-osaka",
    "StorageClass": "STANDARD_IA"
  }
}
```

---------



