const express = require('express');
const fetch = require('node-fetch'); // Import the 'node-fetch' library
const app = express();
const path = require('path');
const port = 8080;

app.use(express.static(path.join(__dirname, 'public')));

// Simulated user ID verification endpoint
app.get('/verifyUserId/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
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

app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});
