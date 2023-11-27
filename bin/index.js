#!/usr/bin/env node
import { App } from 'aws-cdk-lib'
import 'dotenv/config'
import { Secondary } from '../lib/secondary.stack.js'

const app = new App()
new Secondary(app, 'Secondary', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
