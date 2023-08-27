import { App, Stack } from 'aws-cdk-lib';
import * as fs from 'fs';


interface rootParamSet {
    //--- 共通パラメータのインターフェース ---//
    [key: string]: any;
}


//-------------------------------------------------------//
// Common

export function addDependency(stack1: Stack, stack2: Stack) {
    //--- スタック間の依存関係を設定 ---//
    stack1.node.addDependency(stack2);
}

export function replaceUnderscore(str: string): string {
    let result = str;
    //--- _ (アンダースコア) を - (ハイフン) に変換する ---//
    result = str.replace(/_/g, '-');
    //--- / (スラッシュ) を - (ハイフン) に変換する ---//
    result = str.replace(/\//g, '-');
    return result;
}

export function toPascalCase(str: string): string {
    //--- 文字列をパスカルケースに変換する ---//
    return str.replace(/(\w)(\w*)/g, (_match, firstChar, restOfString) => {
        return firstChar.toUpperCase() + restOfString.toLowerCase();
    });
}

export function toCamelCase(str: string): string {
    //--- 文字列をキャメルケースに変換する ---//
    const pascalCase = toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

export function loadCombinationFile(filePath: string){
    //--- Combinationの conf ファイルを読み込む ---//
    try{
        const fileVal = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileVal);
        return jsonData;
    }catch (error){
        console.log(`[ERROR] loadCombinationFile()\n${error}`);
    }
}

export function loadCommonVal(app: App, valName: string, valFlg: string){
    //--- 共通パラメータ(rootSet.json)の指定された要素(valName)の値を返す ---//
    const pjPath = app.node.tryGetContext("pjPath");
    const filePath = `./data/${pjPath}/rootSet.json`;
    const dataSet: rootParamSet = loadCombinationFile(filePath) as rootParamSet;

    let returnVal = "";
    switch (valFlg){
        case "CAMEL": returnVal = toCamelCase(dataSet[valName]); break;
        case "PASCAL": returnVal = toPascalCase(dataSet[valName]); break;
    }
    return returnVal;
}

export function getHeadStr(app: App, valFlg: string){
    //--- pjNameとpjEnvを連結した文字列を返す ---//
    // CAMEL: キャメルケースで連結
    // PASCAL: パスカルケースで連結
    const pjPath = app.node.tryGetContext("pjPath");
    const filePath = `./data/${pjPath}/rootSet.json`;
    const dataSet: rootParamSet = loadCombinationFile(filePath) as rootParamSet;
    const valArr = ["pjName", "pjEnv"]; // rootSet.jsonに設定されたパラメータ

    let getArr: string[] = [];
    for( const comVal of valArr  ){
        switch (valFlg){
            case "CAMEL": getArr.push(toCamelCase(dataSet[comVal])); break;
            case "PASCAL": getArr.push(toPascalCase(dataSet[comVal])); break;
        }
    }
    let returnVal: string = getArr.join("");
    return returnVal;
}

export function getDataPath(app: App, fileName?: string){
    //--- dataディレクトリ配下のパスを返す ---//
    const pjPath = app.node.tryGetContext("pjPath");
    let returnPath;
    if(fileName){
        returnPath = `./data/${pjPath}/${fileName}`;
    }else{
        returnPath = `./data/${pjPath}/`;
    }
    return returnPath;
}

export function removeDuplicates(set: any[], key: string) {
    //--- 重複削除 ---//
    try {
        return set.filter((obj, index, self) => {
            if(obj[key])
            {
                return (
                    index ===
                    self.findIndex(
                        (el) => el[key].toLowerCase() === obj[key].toLowerCase()
                    )
                );
            }else{
                throw new Error(`note=${obj["note"]}\n\tindex=${index}, key=${key}, obj[key]=${obj[key]}`);
            }
        });
    } catch (error) {
        console.error(`[ERROR][Common.js][removeDuplicates]\n\t${error}`);
        return [];
    }
}

export function getDevCode(app: App, valFlg: string){
    //--- contextの変数 devStr を取得 ---//
    // CAMEL: キャメルケースで連結
    // PASCAL: パスカルケースで連結
    const devCode = app.node.tryGetContext("devCode");
    let returnVal;
    switch (valFlg){
        case "CAMEL": returnVal = toCamelCase(devCode); break;
        case "PASCAL": returnVal = toPascalCase(devCode); break;
    }
    returnVal = `-${returnVal}`
    return returnVal;
}

export function generateRandomString(length: number): string {
  //--- （未利用）ランダム文字列を生成 ---//
  const characters = 'abcdefghijklmnopqrstuvwxy0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export function generateTimestampWithRandomString(): string {
    //--- （未利用）{日時}-{ランダム文字} を生成 ---//
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const randomString = generateRandomString(3);

    //const formattedTimestamp = `-${year}${month}${day}${hours}${minutes}${seconds}-${randomString}`;
    const formattedTimestamp = `-${month}${day}${hours}${minutes}${seconds}-${randomString}`;
    return formattedTimestamp;
}  

