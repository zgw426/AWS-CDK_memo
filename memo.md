# [検証] ChatGPTでCDK v2 (TypeScript)コードの開発を効率化できるのか

## 概要

## ChatGPTプロンプト

コード開発でよく使ったプロンプトパターン

- プロンプトバターン（１－１）－サンプルコードを書いてもらう
- プロンプトバターン（１ー２）－書いてもらったコードで発生したエラーを対処してもらう
　　このコードで以下のエラーが発生した。エラーを対策したコードを書いて
　　エラーの説明と、対策案を提示してくれる
- プロンプトバターン（２）－作成したコードで発生したエラーを対処してもらう
    - 書いたコード、発生したエラー、対処して
- プロンプトバターン（３）－作成したコードを書き換えてもらう
    - EventBridgeの設定のみ書き換えてもらう


プロンプトバターン（４）
　AWSがサイトで提供するサンプルを実行可能なコードに修正する
　　（このコードを実行可能な状態にして）


プロンプトバターン（５）
　補填してもらう。途中まで書いたコードに追記してもらう
　jsonのループ処理で、要素の出力を途中まで書いたコードを残りの要素を追記するようコードを補填してもらう
　補填の際、こちらの書いてないコード（要素がない場合の処理）も書いてくれる






# 例 プロンプトパターン（４）

読むのが面倒なエラーメッセージ

```
MyStack | 0/3 | 20:56:55 | CREATE_FAILED        | AWS::Transfer::Server | MyCfnServer Property validation failure: [Value for property {/LoggingRole} does not match pattern {arn:.*role/.*}, Value for property {/Protocols/0} does not match pattern {FTP|FTPS|SFTP|AS2}, Value for property {/IdentityProviderDetails/Function} does not match pattern {^arn:[a-z-]+:lambda:.*$}, Value for property {/IdentityProviderDetails/DirectoryId} does not match pattern {d-[0-9a-f]{10}}, Value for property {/IdentityProviderDetails/InvocationRole} does not match pattern {arn:.*role/.*}, Value for property {/EndpointDetails/VpcEndpointId} does not match pattern {vpce-[0-9a-f]{17}}, Value for property {/EndpointDetails/SecurityGroupIds/0} does not match pattern {sg-[0-9a-f]{8,17}}, Value for property {/EndpointType} does not match pattern {PUBLIC|VPC|VPC_ENDPOINT}, Value for property {/SecurityPolicyName} does not match pattern {TransferSecurityPolicy-.+}, Value for property {/ProtocolDetails/As2Transports/0} does not match pattern {HTTP}, Value for property {/ProtocolDetails/SetStatOption} does not match pattern {DEFAULT|ENABLE_NO_OP}, Value for property {/ProtocolDetails/TlsSessionResumptionMode} does not match pattern {ENFORCED|ENABLED|DISABLED}, Value for property {/WorkflowDetails/OnUpload/0/WorkflowId} does not match pattern {w-[0-9a-f]{17}}, Value for property {/WorkflowDetails/OnUpload/0/ExecutionRole} does not match pattern {arn:.*role/.*}, Value for property {/WorkflowDetails/OnPartialUpload/0/WorkflowId} does not match pattern {w-[0-9a-f]{17}}, Value for property {/WorkflowDetails/OnPartialUpload/0/ExecutionRole} does not match pattern {arn:.*role/.*}, Value for property {/Domain} does not match pattern {S3|EFS}, Value for property {/IdentityProviderType} does not match pattern {SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA}]
```

ChatGPTに読みやすくしてもらう

```
エラーメッセージを見ると、いくつかのプロパティが指定されたパターンに一致しないと言われています。それぞれのプロパティの値を修正する必要があります。

修正点の一部を以下に示しますが、すべてのプロパティを修正する必要があります。

LoggingRoleの値がパターン arn:.*role/.* に一致する必要があります。
Protocolsの最初の要素の値がパターン FTP|FTPS|SFTP|AS2 に一致する必要があります。
IdentityProviderDetails内の Function の値がパターン ^arn:[a-z-]+:lambda:.*$ に一致する必要があります。
IdentityProviderDetails内の DirectoryId の値がパターン d-[0-9a-f]{10} に一致する必要があります。
IdentityProviderDetails内の InvocationRole の値がパターン arn:.*role/.* に一致する必要があります。
EndpointDetailsの VpcEndpointId の値がパターン vpce-[0-9a-f]{17} に一致する必要があります。

EndpointDetailsの SecurityGroupIds 内の最初の要素の値がパターン sg-[0-9a-f]{8,17} に一致する必要があります。
EndpointTypeの値がパターン PUBLIC|VPC|VPC_ENDPOINT に一致する必要があります。
SecurityPolicyNameの値がパターン TransferSecurityPolicy-.+ に一致する必要があります。
ProtocolDetailsの As2Transports 内の最初の要素の値がパターン HTTP に一致する必要があります。
ProtocolDetailsの SetStatOption の値がパターン DEFAULT|ENABLE_NO_OP に一致する必要があります。
ProtocolDetailsの TlsSessionResumptionMode の値がパターン ENFORCED|ENABLED|DISABLED に一致する必要があります。
WorkflowDetailsの OnUpload 内の WorkflowId の値がパターン w-[0-9a-f]{17} に一致する必要があります。
WorkflowDetailsの OnUpload 内の ExecutionRole の値がパターン arn:.*role/.* に一致する必要があります。
WorkflowDetailsの OnPartialUpload 内の WorkflowId の値がパターン w-[0-9a-f]{17} に一致する必要があります。
WorkflowDetailsの OnPartialUpload 内の ExecutionRole の値がパターン arn:.*role/.* に一致する必要があります。
Domainの値がパターン S3|EFS に一致する必要があります。
IdentityProviderTypeの値がパターン SERVICE_MANAGED|API_GATEWAY|AWS_DIRECTORY_SERVICE|AWS_LAMBDA に一致する必要があります。
```



## 困難

- ChatGPTでコード作成が困難だったもの
    - AWS Transfer
        - つくられたコードでエラー発生、発生したエラーをChatGPTを使って対処できず
        - ネット上にサンプルコードがない様子



