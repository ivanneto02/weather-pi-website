import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from 'constructs';

const WINDOW_SCHEDULES = [
    { window: "1h",  rate: events.Schedule.rate(cdk.Duration.minutes(5)) },
    { window: "10h", rate: events.Schedule.rate(cdk.Duration.minutes(10)) },
    { window: "1d",  rate: events.Schedule.rate(cdk.Duration.minutes(30)) },
    { window: "10d", rate: events.Schedule.rate(cdk.Duration.hours(2)) },
    { window: "3m",  rate: events.Schedule.rate(cdk.Duration.hours(6)) },
    { window: "12m", rate: events.Schedule.rate(cdk.Duration.hours(12)) },
];

export class WeatherPIDataStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // --------- PRE-COMPUTED DATA BUCKET --------------

        const precomputedBucket = new s3.Bucket(this, "WeatherPIPrecomputedDataBucket", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
        });

        // --------- HUMIDITY, TEMPERATURE, PRESSURE --------------

        /* DynamoDB stores temperature, humidity, and pressure data entries */
        const humidityTemperaturePressureDataTable: dynamodb.TableV2 = new dynamodb.TableV2(
            this,
            "WeatherPIHumidityTemperaturePressureDataTable",
            {
                partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
                sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
                contributorInsights: false, // prevent charges
                tableClass: dynamodb.TableClass.STANDARD,
            }
        );

        // lambda function to batch add data entries
        const humidityTemperaturePressureUploadFunction: lambda.Function = new lambda.Function(
            this,
            "WeatherPIHumidityTemperaturePressureUploadFunction",
            {
                code: lambda.Code.fromAsset("lib/functions/humidityTemperaturePressureUploadFunction"),
                runtime: lambda.Runtime.NODEJS_LATEST,
                handler: "index.handler"
            }
        );

        // lambda function to batch download data entries
        const humidityTemperaturePressureDownloadFunction: lambda.Function = new lambda.Function(
            this,
            "WeatherPIHumidityTemperaturePressureDownloadFunction",
            {
                code: lambda.Code.fromAsset("lib/functions/humidityTemperaturePressureDownloadFunction"),
                runtime: lambda.Runtime.NODEJS_LATEST,
                handler: "index.handler",
                timeout: cdk.Duration.seconds(15),
                environment: {
                    TABLE_NAME: humidityTemperaturePressureDataTable.tableName,
                    BUCKET_NAME: precomputedBucket.bucketName,
                    S3_PREFIX: "htp",
                },
            }
        );

        // allow the functions to modify DynamoDB
        humidityTemperaturePressureDataTable.grantWriteData(humidityTemperaturePressureUploadFunction);
        humidityTemperaturePressureDataTable.grantReadData(humidityTemperaturePressureDownloadFunction);
        precomputedBucket.grantRead(humidityTemperaturePressureDownloadFunction);

        // api function deploys lambda
        const humidityTemperaturePressureAPI: apigateway.RestApi = new apigateway.RestApi(
            this,
            "WeatherPIHumidityTemperaturePressureAPI",
            {
                cloudWatchRole: false
            }
        );

        // HTP cron Lambda
        const htpCronFunction = new lambda.Function(this, "WeatherPIHtpCronFunction", {
            code: lambda.Code.fromAsset("lib/functions/htpCronFunction"),
            runtime: lambda.Runtime.NODEJS_LATEST,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                TABLE_NAME: humidityTemperaturePressureDataTable.tableName,
                BUCKET_NAME: precomputedBucket.bucketName,
                S3_PREFIX: "htp",
                SAMPLE_COUNT: "600",
            },
        });

        humidityTemperaturePressureDataTable.grantReadData(htpCronFunction);
        precomputedBucket.grantWrite(htpCronFunction);

        // EventBridge rules for HTP cron
        for (const { window, rate } of WINDOW_SCHEDULES) {
            const rule = new events.Rule(this, `HtpCron-${window}`, {
                schedule: rate,
            });
            rule.addTarget(new targets.LambdaFunction(htpCronFunction, {
                event: events.RuleTargetInput.fromObject({ window }),
            }));
        }


        // -------- AIR QUALITY -----------

        /* DynamoDB stores air quality data entries */
        const airQualityDataTable: dynamodb.TableV2 = new dynamodb.TableV2(
            this,
            "WeatherPIAirQualityDataTable",
            {
                partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
                sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
                contributorInsights: false, // prevent charges
                tableClass: dynamodb.TableClass.STANDARD,
            }
        );

        // lambda function to batch add data entries
        const airQualityUploadFunction: lambda.Function = new lambda.Function(
            this,
            "WeatherPIAirQualityUploadFunction",
            {
                code: lambda.Code.fromAsset("lib/functions/airQualityUploadFunction"),
                runtime: lambda.Runtime.NODEJS_LATEST,
                handler: "index.handler"
            }
        );

        // lambda function to batch download data entries
        const airQualityDownloadFunction: lambda.Function = new lambda.Function(
            this,
            "WeatherPIAirQualityDownloadFunction",
            {
                code: lambda.Code.fromAsset("lib/functions/airQualityDownloadFunction"),
                runtime: lambda.Runtime.NODEJS_LATEST,
                handler: "index.handler",
                timeout: cdk.Duration.seconds(15),
                environment: {
                    BUCKET_NAME: precomputedBucket.bucketName,
                    S3_PREFIX: "aq",
                },
            }
        );

        // allow the functions to modify DynamoDB
        airQualityDataTable.grantWriteData(airQualityUploadFunction);
        airQualityDataTable.grantReadData(airQualityDownloadFunction);
        precomputedBucket.grantRead(airQualityDownloadFunction);

        // api function deploys lambda
        const airQualityAPI: apigateway.RestApi = new apigateway.RestApi(
            this,
            "WeatherPIAirQualityAPI",
            {
                cloudWatchRole: false,
            }
        );

        // AQ cron Lambda
        const aqCronFunction = new lambda.Function(this, "WeatherPIAqCronFunction", {
            code: lambda.Code.fromAsset("lib/functions/aqCronFunction"),
            runtime: lambda.Runtime.NODEJS_LATEST,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                TABLE_NAME: airQualityDataTable.tableName,
                BUCKET_NAME: precomputedBucket.bucketName,
                S3_PREFIX: "aq",
                SAMPLE_COUNT: "600",
            },
        });

        airQualityDataTable.grantReadData(aqCronFunction);
        precomputedBucket.grantWrite(aqCronFunction);

        // EventBridge rules for AQ cron
        for (const { window, rate } of WINDOW_SCHEDULES) {
            const rule = new events.Rule(this, `AqCron-${window}`, {
                schedule: rate,
            });
            rule.addTarget(new targets.LambdaFunction(aqCronFunction, {
                event: events.RuleTargetInput.fromObject({ window }),
            }));
        }

        // API Resources
        const airQualityAPIResource = airQualityAPI.root.addResource("samples");
        const humidityTemperaturePressureAPIResource = humidityTemperaturePressureAPI.root.addResource("samples");

        // to upload data
        airQualityAPIResource.addMethod(
            "PUT",
            new apigateway.LambdaIntegration(airQualityUploadFunction),
            {
                authorizationType: apigateway.AuthorizationType.IAM,
            }
        );
        humidityTemperaturePressureAPIResource.addMethod(
            "PUT",
            new apigateway.LambdaIntegration(humidityTemperaturePressureUploadFunction),
            {
                authorizationType: apigateway.AuthorizationType.IAM,
            }
        );

        // to download data
        airQualityAPIResource.addMethod(
            "GET",
            new apigateway.LambdaIntegration(airQualityDownloadFunction),
        );
        airQualityAPIResource.addCorsPreflight({
            allowOrigins: ["*"], // or ["https://ivanneto.dev"] for stricter
            allowMethods: ["GET", "OPTIONS"],
            allowHeaders: ["Content-Type"],
        });

        humidityTemperaturePressureAPIResource.addMethod(
            "GET",
            new apigateway.LambdaIntegration(humidityTemperaturePressureDownloadFunction),
        );
        humidityTemperaturePressureAPIResource.addCorsPreflight({
            allowOrigins: ["*"],
            allowMethods: ["GET", "OPTIONS"],
            allowHeaders: ["Content-Type"],
        });


        // ---------------- USER PERMISSIONS ------------------
        // IAM User for Raspberry Pi
        const raspberryPiUser = new iam.User(
            this,
            "WeatherPIUser",
        );

        // IAM Policy for air quality API
        const airQualityAPIInvokePolicy = new iam.PolicyStatement(
            {
                effect: iam.Effect.ALLOW,
                actions: ["execute-api:Invoke"],
                resources: [
                    cdk.Stack.of(this).formatArn({
                        service: "execute-api",
                        resource: airQualityAPI.restApiId,
                        resourceName: `${airQualityAPI.deploymentStage.stageName}/*/samples`,
                    }),
                ],
            }
        );

        // IAM Policy for humidity, temp, pressure API
        const humidityTemperaturePressureAPIInvokePolicy = new iam.PolicyStatement(
            {
                effect: iam.Effect.ALLOW,
                actions: ["execute-api:Invoke"],
                resources: [
                    cdk.Stack.of(this).formatArn({
                        service: "execute-api",
                        resource: humidityTemperaturePressureAPI.restApiId,
                        resourceName: `${humidityTemperaturePressureAPI.deploymentStage.stageName}/*/samples`,
                    }),
                ],
            }
        );

        // attach user to policy
        raspberryPiUser.addToPolicy(airQualityAPIInvokePolicy);
        raspberryPiUser.addToPolicy(humidityTemperaturePressureAPIInvokePolicy);

        const weatherPIAccessKey = new iam.CfnAccessKey(
            this,
            "WeatherPIDeviceAccessKey",
            {
                userName: raspberryPiUser.userName,
            },
        );

        // will output to the console
        new cdk.CfnOutput(this, "WeatherPIDeviceAccessKeyId", { value: weatherPIAccessKey.ref });
        new cdk.CfnOutput(this, "WeatherPIDevicesAccessKeySecret", { value: weatherPIAccessKey.attrSecretAccessKey });
        // ----------------- END USER PERMISSIONS ------------------------

    }
}
