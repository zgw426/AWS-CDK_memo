# AWS Budgets を作るCDK v2 (TypeScript)コード

## コード

```typescript
import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'BudgetsStack');

const budget = new budgets.CfnBudget(stack, 'Budget', {
  budget: {
    budgetName: 'MyBudget',
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: {
      amount: 100,
      unit: 'USD',
    },
    costFilters: {
      'TagKeyValue': ['key$value'], // キーと値の形式に修正
    },
  },
  notificationsWithSubscribers: [{
    notification: {
      notificationType: 'ACTUAL',
      comparisonOperator: 'GREATER_THAN',
      threshold: 12,
      thresholdType: 'PERCENTAGE',
    },
    subscribers: [{
      address: 'hoge@fuga.com',
      subscriptionType: 'EMAIL',
    }],
  }],
});

app.synth();
```
