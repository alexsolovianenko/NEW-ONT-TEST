/*require('dotenv').config();
const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'First-Step/Frontend')));

app.use('/subjects', express.static(path.join(__dirname, 'Third-Step/Frontend/Subjects-Front')));

const s3 = new AWS.S3({
    accessKeyId: process.env.SECOND_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECOND_AWS_SECRET_ACCESS_KEY,
    region: process.env.SECOND_AWS_REGION,
});

app.get('/api/files/:subject', async (req, res) => {
    const subject = req.params.subject.toLowerCase();
    const params = {
        Bucket: process.env.SECOND_S3_BUCKET_NAME,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const files = data.Contents.filter(file =>
            file.Key.toLowerCase().includes(subject)
        ).map(file => file.Key);

        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files from S3' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
*/