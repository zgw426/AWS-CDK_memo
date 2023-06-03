# TypeScript : JSON形式のデータをループ処理するサンプル

## サンプルコード

```typescript
interface json_dataset {
  element_A: string;
  element_B: string;
  element_C: string;
  element_D: string[];
  element_E: string[];
  element_F?: string[];
}

const json_set: string = `{
  "json_dataset": [
      {
        "element_A": "これは Element 1-A です",
        "element_B": "これは Element 1-B です",
        "element_C": "これは Element 1-C です",
        "element_D": [
          "element_1-D-1",
          "element_1-D-2",
          "element_1-D-3",
          "element_1-D-4"
        ],
        "element_E": [
          "element_1-E-1",
          "element_1-E-2",
          "element_1-E-3"
        ]
      },
      {
        "element_A": "これは Element 2-A です",
        "element_B": "これは Element 2-B です",
        "element_C": "これは Element 2-C です",
        "element_D": [
          "element_2-D-1",
          "element_2-D-2"
        ],
        "element_E": [
          "element_2-E-1",
          "element_2-E-2"
        ],
        "element_F": [
          "element_2-F-1"
        ]
      }
  ]
}`;

const json_data: { json_dataset: json_dataset[] } = JSON.parse(json_set);
const json_list: json_dataset[] = json_data.json_dataset;

for (const data_target of json_list) {
  console.log("---------");
  console.log(`element_A は ${data_target.element_A} です`);
  console.log(`element_B は ${data_target.element_B} です`);
  console.log(`element_C は ${data_target.element_C} です`);

  for (const elementD of data_target.element_D) {
    console.log(elementD);
  }

  for (const elementE of data_target.element_E) {
    console.log(elementE);
  }
  if (data_target.element_F) {
    for (const elementF of data_target.element_F) {
      console.log(elementF);
    }
  }
  console.log("=========");
}
```

## サンプルの実行結果

```console
$ cdk synth
---------
element_A は これは Element 1-A です です
element_B は これは Element 1-B です です
element_C は これは Element 1-C です です
element_1-D-1
element_1-D-2
element_1-D-3
element_1-D-4
element_1-E-1
element_1-E-2
element_1-E-3
=========
---------
element_A は これは Element 2-A です です
element_B は これは Element 2-B です です
element_C は これは Element 2-C です です
element_2-D-1
element_2-D-2
element_2-E-1
element_2-E-2
element_2-F-1
=========
```


