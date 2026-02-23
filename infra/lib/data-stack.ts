import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';

export class WeatherPIDataStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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
            }
        );

        // allow the functions to modify DynamoDB
        humidityTemperaturePressureDataTable.grantWriteData(humidityTemperaturePressureUploadFunction);
        humidityTemperaturePressureDataTable.grantReadData(humidityTemperaturePressureDownloadFunction);

        // api function deploys lambda
        const humidityTemperaturePressureAPI: apigateway.RestApi = new apigateway.RestApi(
            this,
            "WeatherPIHumidityTemperaturePressureAPI",
            {
                cloudWatchRole: false
            }
        );


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
            }
        );

        // allow the functions to modify DynamoDB
        airQualityDataTable.grantWriteData(airQualityUploadFunction);
        airQualityDataTable.grantReadData(airQualityDownloadFunction);

        // api function deploys lambda
        const airQualityAPI: apigateway.RestApi = new apigateway.RestApi(
            this,
            "WeatherPIAirQualityAPI",
            {
                cloudWatchRole: false,
            }
        );

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
