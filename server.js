
const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express()
const path = require('path')
console.log("Hi FF, you are here A 1");
const cors = require("cors")
const port = 55831;

const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// Enable CORS for all routes
console.log("Hi FF, you are here A 1");
// Add Access Control Allow Origin headers
// Assuming you are using Express in Node.js



app.use(express.static('routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

console.log("Hi FF, you are here A 2");
app.use(cors({
    origin: 'http://127.0.0.1:55831/put-item',
}));
app.options('http://127.0.0.1:55831/put-item', cors({
    origin: '*',
    allowedHeaders: ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Authorization", "X-Requested-With"],
    credentials: true,
    methods: '*',
}));

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




/*app.post('https://attwvglakc.execute-api.us-east-1.amazonaws.com/', cors({
    origin: '*',
    allowedHeaders: ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Authorization", "X-Requested-With"],
    credentials: true,
    methods: '*',
}), (req, res) => {
    const params = {
        TableName: 'hashnodedata',
        Item: item,
    };

    docClient.put(params, (err, data) => {
        if (err) {
            console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
            res.status(500).json({ error: 'Unable to add item.' });
        } else {
            console.log('Added item:', JSON.stringify(data, null, 2));
            res.json({ message: 'Item added successfully.' });
        }
    });
});*/

/*app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:55831'); // Set your client's origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.options('/storeInDynamoDB', (req, res) => {
    res.sendStatus(200);
});

// Endpoint to store data in DynamoDB
app.post('/storeInDynamoDB', (req, res) => {
    const dataToStore = req.body;

    // Generate a unique ID for each record using the 'uuid' library
    dataToStore.id = uuidv4();

    // Define the DynamoDB parameters
    const params = {
        TableName: 'YourTableName', // Replace with your DynamoDB table name
        Item: dataToStore
    };

    // Put the data into DynamoDB
    dynamoDB.put(params, (err) => {
        if (err) {
            console.error('Error storing data in DynamoDB:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json({ message: 'Data stored in DynamoDB successfully' });
        }
    });
});*/

app.listen(port, () => {
    console.log("Backend server is running at http://127.0.0.1:55831/");
});
