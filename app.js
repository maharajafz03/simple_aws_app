require('dotenv').config();
const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3'); // Import specific classes
const bodyParser = require('body-parser');

const app = express();  // Initialize express app express is https server frame work

// app.use(express.static('public'));  // Serve frontend files (if any)
app.use(bodyParser.json());  // Use JSON body parser

// AWS S3 configuration
const s3 = new S3Client({  // Use S3Client
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_BUCKET_NAME;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');  // Make sure to provide the correct path
});

// Endpoint to store employee data in S3
app.post('/add-employee', async (req, res) => {
  const employee = req.body;
  const employeeKey = `employees/${employee.name}.json`;

  const params = {
    Bucket: bucketName,
    Key: employeeKey,
    Body: JSON.stringify(employee),
    ContentType: 'application/json'
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));  // Use PutObjectCommand
    res.send({ message: 'Employee data saved', data });
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).send({ message: 'Error saving employee data', error: err.message });
  }
});

// Endpoint to search for an employee in S3
app.get('/search-employee/:name', async (req, res) => {
  const employeeKey = `employees/${req.params.name}.json`;

  const params = {
    Bucket: bucketName,
    Key: employeeKey
  };

  try {
    const data = await s3.send(new GetObjectCommand(params)); // Use GetObjectCommand
    const employeeData = JSON.parse(await streamToString(data.Body)); // Parse the employee data
    res.send({ message: 'Employee found', employee: employeeData });
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(404).send({ message: 'Employee not found', error: err.message });
  }
});

// Helper function to convert a readable stream to a string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
