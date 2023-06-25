import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';


export interface SecretManagerProps extends StackProps {
  userSet: userSet[];
}


export interface userSet extends StackProps {
  userId: string; // ユーザーID
  passwordLength: number; // パスワードの文字数
}


export class SecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SecretManagerProps) {
    super(scope, id, props);

    const jsonList: userSet[] = props.userSet;

    for (const dataTarget of jsonList) {
      const secretId = dataTarget.userId; // 指定されたID
      const password = generateRandomPassword(dataTarget.passwordLength); // ランダムなパスワードを生成
      console.log(`${secretId} ${password}`);

      // Secret Managerのシークレットを作成
      const secret = new secretsmanager.Secret(this, secretId, {
        secretName: secretId,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ password: password }),
          generateStringKey: 'password',
        },
      });
      new cdk.CfnOutput(this, `${secretId}Arn`, { value: secret.secretArn });
    }
  }
}


// ランダムなパスワードを生成する関数
function generateRandomPassword(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const lowercaseCharacters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numericCharacters = '0123456789';

  let password = '';

  // 最低限1つの英大文字、英小文字、数字が含まれるようにする
  password += lowercaseCharacters[Math.floor(Math.random() * lowercaseCharacters.length)];
  password += uppercaseCharacters[Math.floor(Math.random() * uppercaseCharacters.length)];
  password += numericCharacters[Math.floor(Math.random() * numericCharacters.length)];

  // 残りの文字を生成
  const remainingLength = length - 3;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  // 文字列をシャッフルする
  password = shuffleString(password);

  return password;
}

// 文字列をシャッフルする関数
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}
