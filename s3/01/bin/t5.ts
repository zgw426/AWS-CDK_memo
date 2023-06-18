import { App, Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';

import {
  CustomS3ReplicationOsakaProps,
  CustomS3ReplicationTokyoProps,
  s3ReplicationSet,
  CustomS3ReplicationOsaka,
  S3ReplicationTokyo
} from '../lib/stack/s3-cross-region-replication';


const app = new App();

const headStr = 'tesuo';

const s3Replications: s3ReplicationSet[] = [
  {
    note: 'S3クロスリージョンレプリケーション（１）',
    sourceBucketName: `${headStr}-20230617-10`,
    replicationBucketName: `${headStr}-20230617-10-osaka`,
    replicationRuleFile: 'lib/data/s3/replication-rule-1.json',
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
    replicationRuleFile: 'lib/data/s3/replication-rule-2.json',
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
