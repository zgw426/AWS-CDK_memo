


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






