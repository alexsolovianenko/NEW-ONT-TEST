import dotenv from 'dotenv';import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8000;
dotenv.config();

app.use(express.static(path.resolve(__dirname, '../Frontend')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.resolve(__dirname, '../Frontend')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.post('/generate-upload-url', async (req, res) => {
  const { text, fileType } = req.body;

  if (!text || !fileType) {
    return res.status(400).send({ error: 'Text and fileType are required!' });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${text}.pdf`,
    Expires: 600, 
    ContentType: fileType
  };

  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    res.json({ uploadURL });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error generating upload URL' });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file || !req.body.text) {
    return res.status(400).send({ error: 'File and text are required!' });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${req.body.text}.pdf`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    res.json({
      message: 'File uploaded successfully!',
      fileUrl: uploadResult.Location,
      text: req.body.text
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error uploading file' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
