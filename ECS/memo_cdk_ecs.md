

```typescript:bin/test.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'ECSFargateStack');

// ネットワークの設定
const vpc = new ec2.Vpc(stack, 'MyVpc', {
  maxAzs: 2, // 可用ゾーンの数
  natGateways: 1, // NATゲートウェイの数
});

// ECR レポジトリの作成
const ecrRepository = new ecr.Repository(stack, 'MyECRRepository');

// ECS クラスターの作成
const cluster = new ecs.Cluster(stack, 'MyCluster', {
  vpc,
});

// タスク定義の作成
const taskDefinition = new ecs.FargateTaskDefinition(stack, 'MyTaskDefinition');
const container = taskDefinition.addContainer('MyContainer', {
  image: ecs.ContainerImage.fromEcrRepository(ecrRepository),
  memoryLimitMiB: 512,
  cpu: 256,
});

// Fargate タスクの作成と実行
const fargateService = new ecs.FargateService(stack, 'MyFargateService', {
  cluster,
  taskDefinition,
});

app.synth();
```


簡単なWebサーバー

```Dockerfile
# 公式のPythonイメージをベースにする
FROM python:3.8-slim

# 作業ディレクトリを設定
WORKDIR /app

# ローカルのカレントディレクトリの内容をコンテナの/appディレクトリにコピー
COPY . /app

# ポート番号を指定
EXPOSE 80

# PythonのシンプルなHTTPサーバーを実行
CMD ["python", "-m", "http.server", "80"]
```

- Dockerイメージのビルド

```console
docker build -t simple-web-server .
```


- コンテナの起動

```console
docker run -p 8080:80 simple-web-server
```

Webサーバーにアクセス

```console
curl http://localhost:8080
curl http://172.31.19.1:8080
```

