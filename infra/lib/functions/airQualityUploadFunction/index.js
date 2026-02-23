const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { BatchWriteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);

if (!TABLE_NAME) {
    throw new Error("TABLE_NAME environment variable is required");
}

exports.handler = async (event) => {

    const data = JSON.parse(event.body).data || [];

    if (data.length == 0) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: "Not enough data (<1)", count: 0 }),
        }
    }

    try {

        // create command to batch upload
        let chunkSize = 25;
        let numberOfChunks = 0;

        for (let i = 0; i < data.length; i += chunkSize) {
            numberOfChunks += 1;
            let chunk = data.slice(i, i + chunkSize);
            const command = new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: chunk.map(item => ({
                        PutRequest: {
                            Item: item,
                        },
                    })),
                }
            });

            // send the command to DynamoDB
            let response = await documentClient.send(command);
            let unprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];
            let attempts = 0;
            while (unprocessed.length > 0 && attempts < 5) {
                // sleep for some time to implement exponential "back-off" strategy
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
                // attempt to send the unprocessed items again
                const retryBatchWriteCommand = new BatchWriteCommand({
                    RequestItems: {
                        [TABLE_NAME]: unprocessed,
                    },
                });
                response = await documentClient.send(retryBatchWriteCommand); // attempt to send again...
                unprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];
                attempts += 1;
            }

            if (attempts >= 5 && unprocessed.length > 0) {
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: JSON.stringify({ error: "Uploaded some items, but failed to upload some unprocessed items", countUnprocessed: unprocessed.length }),
                }
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                message: "Successful file upload",
                count: data.length,
            }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: "Failed to upload contents ", count: 0, errorMessage: error }),
        }
    }

}
