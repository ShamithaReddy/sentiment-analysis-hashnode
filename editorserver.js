const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

const s3 = new aws.S3({
    accessKeyId: 'AKIAWKJU6DWKVJTJ6E6D',
    secretAccessKey: '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',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const fileType = file.mimetype.split('/')[1];
    const params = {
        Bucket: 'hashnodebucket',
        Key: `${uuidv4()}.${fileType}`,
        Body: file.buffer,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading file to S3');
        } else {
            console.log('File uploaded successfully:', data.Location);
            res.status(200).json({ url: data.Location });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
