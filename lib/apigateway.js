import { Deployment, LambdaRestApi, Stage } from 'aws-cdk-lib/aws-apigateway'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

export class ApiGatewayConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id, props)

    const { stageName } = props

    this.restApiId = StringParameter.valueFromLookup(
      this,
      `${process.env.SSM_PATH}/${process.env.NODE_ENV}/APIGATEWAY_ID`
    )

    const api = LambdaRestApi.fromRestApiId(this, 'Api', this.restApiId)
    const deployment = new Deployment(this, 'Deployment', { api })
    new Stage(this, `SecondaryStage-${stageName}`, {
      stageName,
      deployment,
      variables: {
        type: 'secondary',
        stageName,
      },
    })
  }
}
