
async function fetchDraftDetails(draftId) {
    const graphqlUrl = 'https://gql.hashnode.com/';
    const accessToken = '44e3355b-cef7-4cf3-a411-bee59d06ed63'; // Replace with your actual access token

    const graphqlQuery = `
        query Draft($id: ObjectId!) {
  draft(id: $id) {
    id
    slug
    title
    subtitle
    author {
      id
      username
      name
      profilePicture
      followersCount
      followingsCount
      tagline
      dateJoined
      location
      availableFor
      deactivated
      following
      followsBack
      isPro
    }
    coAuthors {
      id
      username
      name
      profilePicture
      followersCount
      followingsCount
      tagline
      dateJoined
      location
      availableFor
      ambassador
      deactivated
      following
      followsBack
      isPro
    }
    tags {
      id
      name
      slug
      logo
      tagline
      followersCount
      postsCount
    }
    canonicalUrl
    coverImage {
      url
      attribution
      photographer
      isAttributionHidden
    }
    readTimeInMinutes
    series {
      id
      name
      createdAt
      coverImage
      cuid
      slug
      sortOrder
    }
    content {
      markdown
      html
      text
    }
    dateUpdated
    updatedAt
    settings {
      disableComments
      stickCoverToBottom
      isDelisted
    }
    seo {
      title
      description
    }
    ogMetaData {
      image
    }
    lastBackup {
      status
      at
    }
    lastSuccessfulBackupAt
    lastFailedBackupAt
  }
}`;

    const variables = { "id": draftId };
    try {
        const graphqlResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({ query: graphqlQuery, variables }),
        });

        const graphqlData = await graphqlResponse.json();

        if (graphqlData.data && graphqlData.data.draft) {
            const draftId = graphqlData.data.draft.id;
            const textContent = graphqlData.data.draft.content.text;
            const markdownContent = graphqlData.data.draft.content.markdown;
            const htmlContent = graphqlData.data.draft.content.html;

            const item = {
                draftId,
                textContent,
                markdownContent,
                htmlContent
            };
            const lambdaResponse = await callLambda(item);

        } else {
            console.error('Error fetching draft details:', graphqlData.errors);
        }
    } catch (error) {
        console.error('Error:', error);
    }

}

async function callLambda(item) {

    const url = 'https://d2oynqddhmz2ijo4wzwraqcmay0pbmil.lambda-url.us-east-1.on.aws/';

    try {
        console.log(item);
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(item),
        });

        const data = await response.json();
        const editPageUrl = `editorpage/edit.html?draftId=${item.draftId}`;
        window.location.href = editPageUrl;

        return {
            statusCode: response.status,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }

}




