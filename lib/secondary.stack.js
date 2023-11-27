import { Stack } from 'aws-cdk-lib'
import { customAlphabet } from 'nanoid'
import { AmplifyConstruct } from './amplify.js'
import { ApiGatewayConstruct } from './apigateway.js'
import { DynamodbConstruct } from './dynamodb.js'

export class Secondary extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props)

    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)
    const stageName = nanoid()

    const apiGateway = new ApiGatewayConstruct(this, 'ApiGateway', {
      stageName,
    })
    new DynamodbConstruct(this, 'DynamoDB', { stageName })
    new AmplifyConstruct(this, 'Amplify', {
      restApiId: apiGateway.restApiId,
      stageName,
    })
  }
}
