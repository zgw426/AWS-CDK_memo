# AWS Budgets を作るCDK v2 (TypeScript)コード

## コード

名前が "MyBudget" の予算が作成され、予算制限が月額100ドルに設定する


```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'BudgetsStack');

const budget = new budgets.CfnBudget(stack, 'Budget', {
  budget: {
    budgetName: 'MyBudget',
    budgetLimit: {
      amount: 100,
      unit: 'USD',
    },
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    timePeriod: {
      start: Math.floor(new Date('2023-01-01').getTime() / 1000).toString(),
      end: Math.floor(new Date('2023-12-31').getTime() / 1000).toString(),
    },
    costTypes: {
      includeTax: false,
      includeSubscription: false,
      useBlended: false,
    },
  },
});

app.synth();
```
