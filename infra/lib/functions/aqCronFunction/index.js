const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const S3_PREFIX = process.env.S3_PREFIX || "aq";
const SAMPLE_COUNT = parseInt(process.env.SAMPLE_COUNT, 10) || 600;

const WINDOW_MS = {
    "1h":  3_600_000,
    "10h": 36_000_000,
    "1d":  86_400_000,
    "10d": 864_000_000,
    "3m":  7_776_000_000,
    "12m": 31_536_000_000,
};

const MAX_ITEMS = 10_000;

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

    // Paginated DynamoDB query
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

        const response = await dynamoClient.send(command);
        allItems = allItems.concat(response.Items || []);
        lastKey = response.LastEvaluatedKey;
    } while (lastKey && allItems.length < MAX_ITEMS);

    if (allItems.length > MAX_ITEMS) {
        allItems = allItems.slice(0, MAX_ITEMS);
    }

    const data = downsample(allItems, SAMPLE_COUNT);

    const fileBody = JSON.stringify({
        window: windowKey,
        generatedAt: now,
        sampleCount: data.length,
        data,
    });

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${S3_PREFIX}/${windowKey}.json`,
        Body: fileBody,
        ContentType: "application/json",
    }));

    console.log(`Wrote ${data.length} samples to s3://${BUCKET_NAME}/${S3_PREFIX}/${windowKey}.json`);

    return { statusCode: 200, window: windowKey, sampleCount: data.length };
};
