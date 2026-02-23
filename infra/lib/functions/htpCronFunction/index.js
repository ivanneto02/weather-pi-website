const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const S3_PREFIX = process.env.S3_PREFIX || "htp";
const SAMPLE_COUNT = parseInt(process.env.SAMPLE_COUNT, 10) || 600;
const MEASUREMENTS = ["temperature", "humidity", "pressure"];

const WINDOW_MS = {
    "1h":  3_600_000,
    "10h": 36_000_000,
    "1d":  86_400_000,
    "10d": 864_000_000,
    "3m":  7_776_000_000,
    "12m": 31_536_000_000,
};

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const s3Client = new S3Client();

function downsample(items, target) {
    if (items.length <= target) return items;
    const step = (items.length - 1) / (target - 1);
    const result = [];
    for (let i = 0; i < target; i++) {
        result.push(items[Math.round(i * step)]);
    }
    return result;
}

exports.handler = async (event) => {
    const windowKey = event.window;
    if (!windowKey || !WINDOW_MS[windowKey]) {
        throw new Error(`Invalid window: ${windowKey}`);
    }

    const now = Date.now();
    const start = now - WINDOW_MS[windowKey];

    // Paginated DynamoDB query (newest-first so capped windows keep recent data).
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
            ScanIndexForward: false,
            ExclusiveStartKey: lastKey,
        });

        const response = await dynamoClient.send(command);
        allItems = allItems.concat(response.Items || []);
        lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    // Query is newest-first; reverse to chronological order for chart consumers.
    allItems.reverse();
    const data = downsample(allItems, SAMPLE_COUNT);

    const combinedFileBody = JSON.stringify({
        window: windowKey,
        generatedAt: now,
        sampleCount: data.length,
        data,
    });

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${S3_PREFIX}/${windowKey}.json`,
        Body: combinedFileBody,
        ContentType: "application/json",
    }));

    // Write measurement-specific payloads for lightweight frontend fetches.
    await Promise.all(
        MEASUREMENTS.map(async (measurement) => {
            const filtered = data.map((item) => ({
                timestamp: item.timestamp,
                [measurement]: item[measurement],
            }));

            const body = JSON.stringify({
                window: windowKey,
                measurement,
                generatedAt: now,
                sampleCount: filtered.length,
                data: filtered,
            });

            await s3Client.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `${S3_PREFIX}/${windowKey}.${measurement}.json`,
                    Body: body,
                    ContentType: "application/json",
                })
            );
        })
    );

    console.log(
        `Wrote ${data.length} samples to s3://${BUCKET_NAME}/${S3_PREFIX}/${windowKey}.json and per-measurement files`
    );

    return { statusCode: 200, window: windowKey, sampleCount: data.length };
};
