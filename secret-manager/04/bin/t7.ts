import * as cdk from 'aws-cdk-lib';
import { SecretManagerStack, SecretManagerProps, userSet } from '../lib/secretmanager-stack';



const userSet: userSet[] = [
  {
    "userId": "your-secret-id-001",
    "passwordLength": 16
  },
  {
    "userId": "your-secret-id-002",
    "passwordLength": 18
  },
];

const secretManagerProps: SecretManagerProps = {
  userSet: userSet,
}

// スタックを構築
const app = new cdk.App();
new SecretManagerStack(app, 'SecretManagerStack', secretManagerProps);
