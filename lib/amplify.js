import { CfnApp, CfnBranch, CfnDomain } from 'aws-cdk-lib/aws-amplify'
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild'
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources'
import { Construct } from 'constructs'

export class AmplifyConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id)

    const { restApiId, stageName } = props

    const app = new CfnApp(this, 'App', {
      name: 'archoj-frontend',
      repository: process.env.AMPLIFY_REPOSITORY,
      accessToken: process.env.AMPLIFY_GITHUB_TOKEN,
      environmentVariables: [
        {
          name: '_CUSTOM_IMAGE',
          value: 'amplify:al2023',
        },
        {
          name: 'VITE_USER_POOL_ID',
          value: process.env.COGNITO_USER_POOL_ID,
        },
        {
          name: 'VITE_USER_POOL_CLIENT_ID',
          value: process.env.COGNITO_USER_POOL_CLIENT_ID,
        },
        {
          name: 'VITE_ACCOUNT_ID',
          value: process.env.CDK_DEFAULT_ACCOUNT,
        },
        {
          name: 'VITE_BACKEND_URL',
          value: `https://${restApiId}.execute-api.${process.env.CDK_DEFAULT_REGION}.amazonaws.com/${stageName}`,
        },
      ],
      customRules: [
        {
          source: '</^((?!.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$).)*$/>',
          target: '/',
          status: '200',
        },
      ],
      buildSpec: BuildSpec.fromObject({
        version: 0.1,
        frontend: {
          phases: {
            preBuild: {
              commands: ['nvm use 18', 'npm ci'],
            },
            build: {
              commands: ['npm run build'],
            },
          },
          artifacts: {
            baseDirectory: 'dist',
            files: ['**/*'],
          },
          cache: {
            paths: ['node_modules/**/*'],
          },
        },
      }).toBuildSpec(this),
    })

    const branch = new CfnBranch(this, 'Branch', {
      appId: app.attrAppId,
      branchName: process.env.AMPLIFY_BRANCH_NAME,
      enableAutoBuild: true,
      stage: process.env.NODE_ENV.toUpperCase(),
    })
    branch.addDependency(app)

    if (process.env.FRONTEND_DOMAIN_NAME) {
      const domain = new CfnDomain(this, 'Domain', {
        appId: app.attrAppId,
        domainName: process.env.FRONTEND_DOMAIN_NAME,
        subDomainSettings: [
          {
            branchName: process.env.AMPLIFY_BRANCH_NAME,
            prefix: '',
          },
        ],
      })
      domain.addDependency(domain)
      domain.addDependency(branch)
    }

    new AwsCustomResource(this, 'LaunchAppBuild', {
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      onCreate: {
        service: 'Amplify',
        action: 'startJob',
        physicalResourceId: PhysicalResourceId.of('app-build-trigger'),
        parameters: {
          appId: app.attrAppId,
          branchName: process.env.AMPLIFY_BRANCH_NAME,
          jobType: 'RELEASE',
          jobReason: 'Auto Start build',
        },
      },
    })
  }
}
