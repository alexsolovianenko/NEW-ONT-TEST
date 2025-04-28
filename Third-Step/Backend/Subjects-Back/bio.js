require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for frontend requests
app.use(cors());

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.SECOND_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECOND_AWS_SECRET_ACCESS_KEY,
    region: process.env.SECOND_AWS_REGION,
});

// Endpoint to fetch files for biology
app.get('/files/biology', async (req, res) => {
    const params = {
        Bucket: process.env.SECOND_S3_BUCKET_NAME,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const files = data.Contents.filter(file =>
            file.Key.toLowerCase().includes('biology') || file.Key.toLowerCase().includes('bio')
        ).map(file => ({
            name: file.Key,
            url: `https://${process.env.SECOND_S3_BUCKET_NAME}.s3.${process.env.SECOND_AWS_REGION}.amazonaws.com/${file.Key}`
        }));

        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files from S3' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
