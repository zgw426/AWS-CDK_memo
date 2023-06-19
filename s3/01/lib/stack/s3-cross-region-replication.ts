import { App, Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Bucket, LifecycleRule, StorageClass, Transition } from 'aws-cdk-lib/aws-s3';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs';

import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';


export interface CustomS3ReplicationOsakaProps extends StackProps {
  s3ReplicatinSet: s3ReplicationSet[]; // 大阪リージョンS3バケット群
}

export interface CustomS3ReplicationTokyoProps extends StackProps {
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



export class CustomS3ReplicationOsaka extends Stack {
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

        // SNSトピックを作成
        const topic = new sns.Topic(this, `${dataTarget.replicationBucketName}-sns`,{
          topicName: `${dataTarget.replicationBucketName}-sns`
        });

        // S3バケットにイベント通知設定を追加
        bucket.addEventNotification(
          s3.EventType.REPLICATION_OPERATION_FAILED_REPLICATION,
          new s3n.SnsDestination(topic)
        );



      }
    } //--- for (const dataTarget of jsonList) ---//
  }
}


export class S3ReplicationTokyo extends Stack {
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

