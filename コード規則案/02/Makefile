# CDKコマンドのmakeファイル

ROOT_FILE = bin/root.ts
ROOT_DATA = $(shell cat $(ROOT_FILE))
pjPath = $(shell echo '$(ROOT_DATA)' | sed -n 's/.*pjPath: *"\([^"]*\)".*/\1/p')

JSON_FILE = data/${pjPath}/rootSet.json

JSON_DATA = $(shell cat $(JSON_FILE))

# 文字列をパスカルケースに変換する関数
pascal_case = $(shell echo $(1) | sed -r 's/(^|_)([a-z])/\U\2/g')

# 変数にJSONデータを格納
pjName = $(shell echo '$(JSON_DATA)' | sed -n 's/.*"pjName": *"\([^"]*\)".*/\1/p')
pjEnv = $(shell echo '$(JSON_DATA)' | sed -n 's/.*"pjEnv": *"\([^"]*\)".*/\1/p')

# パスカルケースに変換
pjNamePascal = $(call pascal_case,$(pjName))
pjEnvPascal = $(call pascal_case,$(pjEnv))
pjHeadStr = $(pjNamePascal)$(pjEnvPascal)



############################
# Combination

# Combination00
deploy-cmb00:
	cdk deploy $(pjHeadStr)Cmb00VpcStack --require-approval never
synth-cmb00:
	cdk synth $(pjHeadStr)Cmb00VpcStack

# Combination01
deploy-cmb01:
	cdk deploy $(pjHeadStr)Cmb01IamRoleStack $(pjHeadStr)Cmb01LambdaStack --require-approval never
synth-cmb01:
	cdk synth $(pjHeadStr)Cmb01IamRoleStack $(pjHeadStr)Cmb01LambdaStack

# Combination02
deploy-cmb02:
	cdk deploy $(pjHeadStr)Cmb02IamRoleStack $(pjHeadStr)Cmb02Ec2Stack --require-approval never
synth-cmb02:
	cdk synth $(pjHeadStr)Cmb02IamRoleStack $(pjHeadStr)Cmb02Ec2Stack

############################
# Unit

# Unit01
deploy-uni01:
	cdk deploy $(pjHeadStr)uni01S3BucketStack --require-approval never








# HELP

help:
	@echo "[ProjectCode]"
	@echo "  pjName = $(pjName)"
	@echo "  pjEnv = $(pjEnv)"
	@echo ""
	@echo "[help]"
	@echo "  command template is ..."
	@echo "  make synth-cmbXX"
	@echo "  make deploy-cmbXX"
	@echo "  ( XX is [00, 01, 02] )"
	@echo ""
	@echo "[Summary]"
	@echo "  cmb00 : Deploy VPC Netowrk."
	@echo "  cmb01 : Deploy Lambda & Lambda's IAM Role."
	@echo "  cmb02 : Deploy EC2 & EC2's IAM Role in cmb00-VPC."
	@echo ""
	@echo "[CommandSample]"
	@echo "  If you want to deploy Combination00, execute the following command."
	@echo "  make deploy-cmb00"
