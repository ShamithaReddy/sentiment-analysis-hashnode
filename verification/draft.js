// Frontend User Verification Function
async function verifyUser() {
    const userId = document.getElementById('userId').value.trim();

    if (!userId) {
        alert('Please enter a User ID.');
        return;
    }

    const userVerificationUrl = `https://hashnode.com/@${userId}`;

    try {
        const userVerificationResponse = await fetch(userVerificationUrl);

        if (userVerificationResponse.status === 200 || userVerificationResponse.status === 0) {
            displayResult('User ID is valid. You can proceed to verify the Access Token.');
            document.getElementById('accessToken').disabled = false;
        } else if (userVerificationResponse.status === 404) {
            displayResult('Invalid User ID. User not found.');
        } else {
            console.error("ERROR:", userVerificationResponse.status);
            displayResult('An error occurred while verifying the User ID.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayResult('An error occurred while verifying the User ID.');
    }
}

function displayResult(message) {
    document.getElementById('result').innerText = message;
}



// Example: Call verifyUser with the user ID from the input field
document.getElementById('verifyButton').addEventListener('click', function() {
    const userId = document.getElementById('userId').value.trim();
    verifyUser(userId);
});


// Frontend Access Token Verification Function
async function verifyAccessToken(accessToken) {
    const userId = document.getElementById('userId').value.trim();

    if (!accessToken || !userId) {
        alert('Please enter both Access Token and User ID.');
        return;
    }

    const graphqlUrl = 'https://gql.hashnode.com/';
    const graphqlQuery = `
        query User($username: String!) {
            user(username: $username) {
                id
                username
                name
                profilePicture
                publications(first: 50) {
                    edges {
                        node {
                            drafts(first: 50) {
                                edges {
                                    node {
                                        id
                                        slug
                                        title
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;

    const variables = {
        username: userId // Use the user ID as the value for the variable
    };

    try {
        const graphqlResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: variables
            })
        });

        const graphqlData = await graphqlResponse.json();
        console.log(graphqlData);

        if (graphqlResponse.status === 200 && graphqlData.data && graphqlData.data.user) {
            displayResult('Access Token is valid.');

            const extractIdsAndTitles = (edgesArray) => {
                const ids = [];
                const titles = [];
                edgesArray.forEach(edge => {
                    if (edge.node && edge.node.id) {
                        ids.push(edge.node.id);
                        if (edge.node.title){
                            titles.push(edge.node.title);
                        }
                        else{
                            titles.push("No title for the article");
                        }
                        console.log (edge.node.title,edge.node.id)

                    }
                });
                console.log(titles);
                console.log(ids);
                return { ids, titles };
            };

            const allIdsAndTitles = graphqlData.data.user.publications.edges.map(edge => {
                return extractIdsAndTitles(edge.node.drafts.edges);
            });

            const allIds = allIdsAndTitles.flatMap(obj => obj.ids);
            const allTitles = allIdsAndTitles.flatMap(obj => obj.titles);

            // Create a link to the new page (displaylistdraft.html) with parameters
            const link = document.createElement('a');
            link.href = `../listOfDrafts/displaylistdraft.html?ids=${encodeURIComponent(JSON.stringify(allIds))}&titles=${encodeURIComponent(JSON.stringify(allTitles))}&accessToken=${encodeURIComponent(accessToken)}`;
            link.textContent = 'Go to Display Titles Page';

            document.body.appendChild(link);



        } else if (graphqlResponse.status === 403) {
            // Assuming a 403 status code indicates an invalid access token
            displayResult('Access Token is not valid.');
        } else {
            console.error('Error:', graphqlData.errors);
            displayResult('An error occurred while verifying the Access Token.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayResult('An error occurred while verifying the Access Token.');
    }
}

