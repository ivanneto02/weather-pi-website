const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const S3_PREFIX = process.env.S3_PREFIX || "htp";

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
const MEASUREMENTS = new Set(["temperature", "humidity", "pressure"]);

if (!TABLE_NAME) {
    throw new Error("TABLE_NAME environment variable is required");
}

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

async function fetchFromS3(windowKey, measurement) {
    const suffix = measurement ? `.${measurement}` : "";
    const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${S3_PREFIX}/${windowKey}${suffix}.json`,
    }));
    const body = await streamToString(response.Body);
    const parsed = JSON.parse(body);
    return parsed.data;
}

function projectMeasurement(items, measurement) {
    if (!measurement) return items;
    return items.map((item) => ({
        timestamp: item.timestamp,
        [measurement]: item[measurement],
    }));
}

async function fetchFromDynamo(windowKey, sampleCount, measurement) {
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
            // Read newest-first so capped ranges keep the most recent records.
            ScanIndexForward: false,
            ExclusiveStartKey: lastKey,
        });

        const response = await documentClient.send(command);
        allItems = allItems.concat(response.Items || []);
        lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    // Return chronological order to keep chart axis direction consistent.
    allItems.reverse();
    return projectMeasurement(downsample(allItems, sampleCount), measurement);
}

async function fetchLatestFromDynamo(limit, measurement) {
    const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": "sensor#default" },
        ScanIndexForward: false,
        Limit: limit,
    });

    const response = await documentClient.send(command);
    return projectMeasurement(response.Items || [], measurement);
}

exports.handler = async (event) => {
    try {
        const params = event.queryStringParameters || {};
        const windowKey = (params.window || "").toLowerCase();
        const measurement = (params.measurement || "").toLowerCase();
        const sampleCount = Math.max(parseInt(params.samples, 10) || 600, 1);
        const latestCountRaw = parseInt(params.latest, 10);
        const latestCount = Number.isFinite(latestCountRaw)
            ? Math.max(latestCountRaw, 1)
            : 0;
        const measurementKey = MEASUREMENTS.has(measurement) ? measurement : "";

        if (measurement && !measurementKey) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Invalid measurement. Use temperature, humidity, or pressure." }),
            };
        }

        // Latest-N query for near-real-time cards/widgets.
        if (latestCount > 0) {
            const latestItems = await fetchLatestFromDynamo(latestCount, measurementKey);
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify(latestItems),
            };
        }

        // Time-range query when a valid window is provided
        if (WINDOW_MS[windowKey]) {
            let result;

            // Try S3 first, fall back to DynamoDB
            if (BUCKET_NAME) {
                try {
                    result = await fetchFromS3(windowKey, measurementKey);
                } catch (s3Error) {
                    console.log(`S3 read failed for ${windowKey}${measurementKey ? ` (${measurementKey})` : ""}, falling back to DynamoDB:`, s3Error.message);
                    result = await fetchFromDynamo(windowKey, sampleCount, measurementKey);
                }
            } else {
                result = await fetchFromDynamo(windowKey, sampleCount, measurementKey);
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
        const items = measurementKey ? projectMeasurement(response.Items || [], measurementKey) : response.Items;
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(items),
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
