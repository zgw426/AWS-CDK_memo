# TypeScript : JSON形式のデータをループ処理するサンプル

## サンプルコード（１）

### コード

```typescript
interface jsonDataset {
  element_A: string;
  element_B: string;
  element_C: string;
  element_D: string[];
  element_E: string[];
  element_F?: string[];
  element_G?: childJson;
}

interface childJson {
  element_Gx: number;
  element_Gy: string;
}

const jsonSet: string = `{
  "jsonDataset": [
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
        ],
        "element_G": {
          "element_Gx": 100,
          "element_Gy": "value 100"
        }
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

const json_data: { jsonDataset: jsonDataset[] } = JSON.parse(jsonSet);
const json_list: jsonDataset[] = json_data.jsonDataset;

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
    // element_F の要素がある場合
    for (const elementF of data_target.element_F) {
      console.log(elementF);
    }
  }

  if (data_target.element_G) {
    // element_G の要素がある場合
    console.log(data_target.element_G.element_Gx);
    console.log(data_target.element_G.element_Gy);
  }

  console.log("=========");
}
```

### サンプルの実行結果

```console
$ cdk deploy
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
100
value 100
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


## サンプルコード（２）

### コード

```typescript
interface jsonDataset {
  element_A: string;
  element_B: string;
  element_C: string;
  element_D: string[];
  element_E: string[];
  element_F?: string[];
  element_G?: childJson;
}

interface childJson {
  element_Gx: number;
  element_Gy: string;
}

const jsonSet: jsonDataset[] = [
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
    ],
    "element_G": {
      "element_Gx": 100,
      "element_Gy": "value 100"
    }
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
];

const json_list: jsonDataset[] = jsonSet;

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
    // element_F の要素がある場合
    for (const elementF of data_target.element_F) {
      console.log(elementF);
    }
  }

  if (data_target.element_G) {
    // element_G の要素がある場合
    console.log(data_target.element_G.element_Gx);
    console.log(data_target.element_G.element_Gy);
  }
  console.log("=========");
}
```

### サンプルの実行結果

```console
$ cdk deploy
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
100
value 100
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

