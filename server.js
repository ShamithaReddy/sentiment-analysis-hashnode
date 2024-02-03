
const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express()
const path = require('path')
console.log("Hi FF, you are here A 1");
const cors = require("cors")
const port = 3001;

const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// Enable CORS for all routes
console.log("Hi FF, you are here A 1");
// Add Access Control Allow Origin headers
// Assuming you are using Express in Node.js


app.use(cors());
app.use(express.static('routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

console.log("Hi FF, you are here A 2");




console.log("Hi FF, you are here A 3");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Enable JSON parsing for request bodies

// Configure AWS credentials and create an instance of the DynamoDB service
AWS.config.update({
    accessKeyId: 'AKIAWKJU6DWKVJTJ6E6D',
    secretAccessKey: 'T42vfsKR/d25cUQhXpzljke/XNGGBZwGRyRDaJli',
    region: 'us-east-1' // Replace with your desired AWS region
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Simulated user ID verification endpoint
app.get('/verifyUserId/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        console.log("within 1st fetch");
        const hashnodeResponse = await fetch(`https://hashnode.com/@${userId}`);
        const hashnodeData = await hashnodeResponse.json();

        if (hashnodeResponse.status === 200) {
            // If the Hashnode request is successful, send the data back to the client
            res.json(hashnodeData);
        } else {
            // If there's an issue with the Hashnode request, send an error status
            res.sendStatus(hashnodeResponse.status);
        }
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
});

app.post('/api', async (req, res) => {
    const url = 'https://attwvglakc.execute-api.us-east-1.amazonaws.com';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
});



// Middleware to parse JSON body
app.use(bodyParser.json());

// Endpoint to handle the POST request from frontend
/*app.post('/callTagsLambda', (req, res) => {
    const contentToAnalyze = req.body.content;

    // Replace 'your-python-script.py' with the actual filename of your Python script
    const pythonScriptPath = 'your-python-script.py';

    // Execute the Python script using child_process module
    exec(`python ${pythonScriptPath} "${contentToAnalyze}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing Python script:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        // Assuming your Python script outputs JSON

        let result;
        try {
            result = JSON.parse(stdout);
            if (result){
                return {
                    statusCode: 200,
                    body: result,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS, GET',
                    },
                };
            else{
                    statusCode: 404,
                        body: result,
                        headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS, GET',
                    },
                }
        }
        } catch (jsonError) {
            console.error('Error parsing JSON from Python script output:', jsonError);
            return res.status(500).json({ success: false, message: 'Invalid JSON from Python script' });
        }

        // Send the processed output back to the frontend
        res.json({ success: true, result });
    });
});*/

app.use(cors({ optionsSuccessStatus: 200 }));
app.post('/callTagsLambda', (req, res) => {
    const contentToAnalyze = req.body.content;

    // Replace 'your-python-script.py' with the actual filename of your Python script
    const pythonScriptPath = 'your-python-script.py';

    // Execute the Python script using child_process module
    exec(`python ${pythonScriptPath} "${contentToAnalyze}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing Python script:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        // Assuming your Python script outputs JSON
        let result;
        try {
            result = JSON.parse(stdout);

            if (result) {
                return res.status(200).json({
                    success: true,
                    result,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS, GET',
                    },
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS, GET',
                    },
                });
            }
        } catch (jsonError) {
            console.error('Error parsing JSON from Python script output:', jsonError);
            return res.status(500).json({ success: false, message: 'Invalid JSON from Python script' });
        }
    });
});



app.listen(port, () => {
    console.log("Backend server is running at http://127.0.0.1:3001/");
});
