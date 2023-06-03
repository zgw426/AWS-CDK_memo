# AWS CDK v2 のサンプルスクリプト(TypeScript)

Chat GPTの助けをかりてCDKコード書いたメモ

## 環境

Cloud9 で主に以下の環境でコードの動作確認してます。

```console
$ date
Tue May 16 03:17:03 UTC 2023
$ cat /etc/system-release
Amazon Linux release 2 (Karoo)
$ cdk --version
2.78.0 (build 8e95c37)
$ npm --version 
8.19.4
$ aws --version
aws-cli/2.11.15 Python/3.11.3 Linux/4.14.313-235.533.amzn2.x86_64 exe/x86_64.amzn.2 prompt/off
```



## アプリの作成①

```typescript
PJ_NAME=t3
mkdir ${PJ_NAME}
cd ${PJ_NAME}

cdk init app --language typescript
npm run build

※lib/alambt.tsを編集

cdk deploy
```



## アプリの作成②

AWS SDKモジュールをインストールする場合

```typescript
PJ_NAME=t3
mkdir ${PJ_NAME}
cd ${PJ_NAME}

cdk init app --language typescript
npm run build

※lib/alambt.tsを編集

cdk deploy
```

