//node.js modules imported ***(All notes r too understand to change)
import dotenv from 'dotenv'; 
import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import cors from 'cors';

//create local serv
const app = express();
const port = 8000;

//create process.env file
dotenv.config();

//use that process.env n set AWS credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

//Front end HTML connect to Backend JS
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store Files in RAM, no local storage needed
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ChatGPT this || Makes a route for POST
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file || !req.body.text) {
    return res.status(400).send({ error: 'File and text are required!' });
  }

  app.use(express.static(path.join(__dirname, "../Frontend")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/login.html"), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error loading the page");
      }
    });
  });
  // Uses process.env for parameters on AWS
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}-${req.file.originalname}`, // ChatGPt This code__
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  //upload to s3
  try {
    const uploadResult = await s3.upload(params).promise();
    res.json({
      message: 'File uploaded successfully!',
      fileUrl: uploadResult.Location,
      text: req.body.text
    });
    //if doesnt work
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error uploading file' });
  }
});


//test to see if works
app.get("/", (req, res) => {
  res.send("Server is running!");
});  

//start serv
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});