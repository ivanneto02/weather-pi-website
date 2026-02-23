const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const TABLE_NAME = "WeatherPIDataStack-WeatherPIAirQualityDataTable19305D81-1QTQ0GMFKR4YQ";
const BUCKET_NAME = process.env.BUCKET_NAME;
const S3_PREFIX = process.env.S3_PREFIX || "aq";

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client();

const WINDOW_MS = {
    "1h":  3_600_000,
    "10h": 36_000_000,
    "1d":  86_400_000,
    "10d": 864_000_000,
    "3m":  7_776_000_000,
    "12m": 31_536_000_000,
};

const MAX_ITEMS = 10_000;

function downsample(items, target) {
    if (items.length <= target) return items;
    const step = (items.length - 1) / (target - 1);
    const result = [];
    for (let i = 0; i < target; i++) {
        result.push(items[Math.round(i * step)]);
    }
    return result;
}

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
};

async function fetchFromS3(windowKey) {
    const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${S3_PREFIX}/${windowKey}.json`,
    }));
    const body = await streamToString(response.Body);
    const parsed = JSON.parse(body);
    return parsed.data;
}

async function fetchFromDynamo(windowKey, sampleCount) {
    const now = Date.now();
    const start = now - WINDOW_MS[windowKey];

    let allItems = [];
    let lastKey = undefined;

    do {
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "pk = :pk AND #ts BETWEEN :start AND :end",
            ExpressionAttributeNames: { "#ts": "timestamp" },
            ExpressionAttributeValues: {
                ":pk": "sensor#default",
                ":start": String(start),
                ":end": String(now),
            },
            ScanIndexForward: true,
            ExclusiveStartKey: lastKey,
        });

        const response = await documentClient.send(command);
        allItems = allItems.concat(response.Items || []);
        lastKey = response.LastEvaluatedKey;
    } while (lastKey && allItems.length < MAX_ITEMS);

    if (allItems.length > MAX_ITEMS) {
        allItems = allItems.slice(0, MAX_ITEMS);
    }

    return downsample(allItems, sampleCount);
}

exports.handler = async (event) => {
    try {
        const params = event.queryStringParameters || {};
        const windowKey = (params.window || "").toLowerCase();
        const sampleCount = Math.min(Math.max(parseInt(params.samples, 10) || 600, 1), MAX_ITEMS);

        // Time-range query when a valid window is provided
        if (WINDOW_MS[windowKey]) {
            let result;

            // Try S3 first, fall back to DynamoDB
            if (BUCKET_NAME) {
                try {
                    result = await fetchFromS3(windowKey);
                } catch (s3Error) {
                    console.log(`S3 read failed for ${windowKey}, falling back to DynamoDB:`, s3Error.message);
                    result = await fetchFromDynamo(windowKey, sampleCount);
                }
            } else {
                result = await fetchFromDynamo(windowKey, sampleCount);
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify(result),
            };
        }

        // Default behavior: last 600 items (backward compatible)
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ":pk": "sensor#default" },
            ScanIndexForward: false,
            Limit: 600,
        });

        const response = await documentClient.send(command);
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(response.Items),
        };

    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Failed to download contents ", count: 0 }),
        };
    }
};
