import { RemovalPolicy } from 'aws-cdk-lib'
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

const env = process.env.NODE_ENV

export class DynamodbConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id)

    const { stageName } = props

    new Table(this, 'ProblemTable', {
      tableName: `archoj-${env}-${stageName}-${process.env.DYNAMODB_PROBLEM_TABLE_NAME}`,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new Table(this, 'SubmissionTable', {
      tableName: `archoj-${env}-${stageName}-${process.env.DYNAMODB_SUBMISSION_TABLE_NAME}`,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      stream: StreamViewType.NEW_IMAGE,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new Table(this, 'WorkspaceTable', {
      tableName: `archoj-${env}-${stageName}-${process.env.DYNAMODB_WORKSPACE_TABLE_NAME}`,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new Table(this, 'StaitsticTable', {
      tableName: `archoj-${env}-${stageName}-${process.env.DYNAMODB_STATISTIC_TABLE_NAME}`,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}
