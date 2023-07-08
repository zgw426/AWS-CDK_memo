


```typescript
import { App, Stack, StackProps, Construct } from 'aws-cdk-lib';

class MyReferencedStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define resources in the referenced stack
    // ...
  }
}

class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hoge = 'MyReferencedStack'; // Store the stack name in a variable

    // Reference the stack using the variable
    const referencedStack = Stack.of(this).scope.node.tryFindChild(hoge) as MyReferencedStack;

    if (!referencedStack) {
      throw new Error(`Referenced stack ${hoge} not found.`);
    }

    // Use the referenced stack
    // ...
  }
}

const app = new App();

new MyStack(app, 'MyStack');

app.synth();
```



```typescript
class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hoge = 'CustomIamStack';
    //const referencedStack = Stack.of(this).scope.node.tryFindChild(hoge) as CustomIamStack;
    const referencedStack = new CustomIamStack(this, hoge, {env: env});
    console.log(`DDSS  ${referencedStack}`);
  }
}
```

