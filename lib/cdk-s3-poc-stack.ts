import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
//import * as s3 from
import { aws_s3 as s3, aws_s3_deployment as s3Deploy, aws_iam as iam, aws_cloudfront as cloudfront, aws_cloudfront_origins as origins } from 'aws-cdk-lib';
export class CdkS3PocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create s3 bucket
    const bucket = new s3.Bucket(this, "CDKS3PocTs", {
      bucketName: "cdk-poc-ts",
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      blockPublicAccess: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
    });

    //permissions
    const result = bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions:['s3:GetObject'],
        resources:[bucket.arnForObjects('*')],
        principals:[new iam.AccountRootPrincipal()],
      })
    );
    //upload the code to s3
    new s3Deploy.BucketDeployment(this,"BucketDeploy",{
      sources:[s3Deploy.Source.asset("./out")],
      destinationBucket:bucket,
    })

    //cloudfront
    const distribution = new cloudfront.Distribution(this, "myDis", {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });
  }
}
