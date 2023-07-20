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
    //--- _ (アンダースコア) を - (ハイフン) に変換する ---//
    return str.replace(/_/g, '-');
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
