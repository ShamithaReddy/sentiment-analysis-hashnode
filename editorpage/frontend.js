async function analyzeSentiment(inputText) {
    if (!inputText) {
        alert('Please enter text to analyze');
        return;
    }

    const lambdaEndpoint = 'https://42bdfvjutg4dkys7pszazhdjbq0deryu.lambda-url.us-east-1.on.aws'; // Replace with your Lambda function endpoint

    try {
        const response = await fetch(`${lambdaEndpoint}?text=${encodeURIComponent(inputText)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        displayResult(result);
    } catch (error) {
        console.error('Error calling Lambda function:', error.message);
        displayResult({ error: 'Error calling Lambda function' });
    }
}

function displayResult(resultElement) {

    if (!resultElement) {
        console.error('Result element not found.');
        return;
    }

    const sentiment = resultElement.sentiment;
    const sentimentScore = resultElement.SentimentScore;

    const tableHTML = `
    <table id="Sentimentanalysis-table"> 
        <tr>
            <th>Sentiment</th>
            <th>Score</th>
        </tr>
        <tr>
            <td>Mixed</td>
            <td>${sentimentScore.Mixed}</td>
        </tr>
        <tr>
            <td>Negative</td>
            <td>${sentimentScore.Negative}</td>
        </tr>
        <tr>
            <td>Neutral</td>
            <td>${sentimentScore.Neutral}</td>
        </tr>
        <tr>
            <td>Positive</td>
            <td>${sentimentScore.Positive}</td>
        </tr>
    </table>
`;
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `
        <p>Sentiment: ${sentiment}</p>
        ${tableHTML}
    `;
    scrollToTable();

}

function scrollToTable() {
    const tableElement = document.getElementById('Sentimentanalysis-table');
    if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to handle text highlighting
function handleHighlight2(event) {
    const selection = window.getSelection();
    const highlightedText = selection.toString().trim();

    if (highlightedText !== '') {
        const button = document.createElement('button');
        button.textContent = 'Analyze Sentiment';
        button.classList.add('button');
        button.addEventListener('click', async () => {
            // Analyze sentiment
            await analyzeSentiment(highlightedText);

            // Remove the button after sentiment analysis is complete
            button.remove();
        });

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        button.style.position = 'absolute';
        button.style.top = `${rect.bottom + window.scrollY}px`;
        button.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(button);
    }
}


let draftId, accessToken;
document.addEventListener('DOMContentLoaded', () => {
    // Extract draftId from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    draftId = urlParams.get('draftId');
    accessToken = urlParams.get('accessToken');
    console.log(draftId);
    console.log(accessToken);

    // Call fetchDataFromDynamoDB with the extracted draftId
    fetchDataFromDynamoDB(draftId);
});

async function fetchDataFromDynamoDB(draftId) {
    try {
        const response = await fetch(`https://lnqhqtl4hkyf77ng7g7b37scr40oabou.lambda-url.us-east-1.on.aws/?draftId=${draftId}`);
        const data = await response.json();
        const htmlContent = data.htmlContent;
        const title = data.title; // Accessing the title from the data object

        // Update your content with the fetched HTML
        const mainTextElement = document.getElementById('mainText');
        if (mainTextElement) {
            // Clear existing content
            mainTextElement.innerHTML = '';

            // Create an h1 element for the title
            const titleElement = document.createElement('h1');
            titleElement.textContent = title; // Set the text content to the fetched title

            // Append the title to the mainTextElement
            mainTextElement.appendChild(titleElement);
            const publishButton = document.createElement('button');
            publishButton.textContent = 'Publish Draft';
            publishButton.classList.add('publish-button');
            publishButton.addEventListener('click', async () => {
                await publishDraft(draftId);
            });

            // Append the publishButton next to the titleElement
            titleElement.appendChild(publishButton);

            // Create a container for editable content
            const editableContentContainer = document.createElement('div');
            editableContentContainer.innerHTML = htmlContent;

            // Apply a class to the container for specific styling
            editableContentContainer.classList.add('editableContent');

            // Make the content editable
            editableContentContainer.contentEditable = true;

            // Append the container to the mainTextElement
            mainTextElement.appendChild(editableContentContainer);


            // Initialize TinyMCE on the editableContentContainer
            tinymce.init({
                selector: '.editableContent',
                autoresize_min_height: 100,
                autoresize_max_height: 650,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help | customHighlightButton',

                setup: function (editor) {
                    editor.ui.registry.addButton('customHighlightButton', {
                        text: 'Analyse Sentiment',
                        onAction: function () {
                            var selectedText = editor.selection.getContent({ format: 'text' });
                            if (selectedText.trim() !== '') {
                                handleHighlight(selectedText);
                            }
                        }
                    });
                }
            });

            // Add event listener for text highlighting
            mainTextElement.addEventListener('mouseup', handleHighlight2);

            // Add a scroll bar to mainTextElement
            mainTextElement.style.overflowY = 'auto';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function handleHighlight(event) {
    console.log(event);

    if (event!= '') {
        analyzeSentiment(event);
    }
}

async function publishDraft(draftId) {
    const gqlEndpoint = 'https://gql.hashnode.com/';

    const PublishDraftInput = {
        draftId: draftId
    };

    const variables = {
        input: PublishDraftInput
    };

    try {
        console.log(accessToken + " " + draftId);
        const response = await fetch(gqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken, // Replace with your Hashnode token
            },
            body: JSON.stringify({
                query: `
                    mutation PublishDraft($input: PublishDraftInput!) {
                        publishDraft(input: $input) {
                            post {
                                id
                                slug
                                title
                                subtitle
                                url
                                canonicalUrl
                                brief
                                readTimeInMinutes
                                views
                                reactionCount
                                replyCount
                                responseCount
                                featured
                                bookmarked
                                featuredAt
                                publishedAt
                                updatedAt
                                hasLatexInPost
                                isFollowed
                                isAutoPublishedFromRSS
                            }
                        }
                    }
                `,
                variables: variables, // Corrected the case of "Variables" to "variables"
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        const postUrl = data.data.publishDraft.post.url;

        // Redirect to the published post URL
        window.location.href = postUrl;
    } catch (error) {
        console.error('Error publishing draft:', error.message);
        // Handle error as needed
    }
}

