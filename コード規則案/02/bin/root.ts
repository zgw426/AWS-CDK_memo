import { App } from 'aws-cdk-lib';
import { addDependency } from '../lib/Origin/Common';
import { Combination00Func } from '../lib/Combination/Cmb00Stack';
import { Combination01Func } from '../lib/Combination/Cmb01Stack';
import { Combination02Func } from '../lib/Combination/Cmb02Stack';

//const app = new App( {context: { pjPath: "pj05-dev" }});
const app = new App( {context: { pjPath: "pj01-stg" }});

const cmb00Stacks = Combination00Func(app); // Combination00
const cmb01Stacks = Combination01Func(app); // Combination01
const cmb02Stacks = Combination02Func(app, cmb00Stacks.cmb00VpcStack); // Combination02

addDependency(cmb02Stacks.cmb02IamRoleStack, cmb00Stacks.cmb00VpcStack);

// スタックをデプロイ
app.synth();
