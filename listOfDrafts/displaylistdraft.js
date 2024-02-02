
async function fetchDraftDetails(draftId, accessToken) {
    const graphqlUrl = 'https://gql.hashnode.com/';

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
        console.log(graphqlData);

        if (graphqlData.data && graphqlData.data.draft) {
            const markdownContent = graphqlData?.data?.draft?.content?.markdown || "NO CONTENT EXISTS (remove or edit me)";
            const htmlContent = graphqlData?.data?.draft?.content?.html || "NO CONTENT EXISTS (remove or edit me)";
            const title = graphqlData?.data?.draft?.title || "NO TITLE EXISTS (remove or edit me)";
            const textContent = graphqlData?.data?.draft?.text || "NO CONTENT EXISTS (remove or edit me)";
            const draftId = graphqlData.data.draft.id;


            const item = {
                title,
                draftId,
                textContent,
                markdownContent,
                htmlContent
            };
            const lambdaResponse = await callLambda(item, accessToken);

        } else {
            console.error('Error fetching draft details:', graphqlData.errors);
        }
    } catch (error) {
        console.error('Error:', error);
    }

}

async function callLambda(item, accessToken) {

    const url = 'https://d2oynqddhmz2ijo4wzwraqcmay0pbmil.lambda-url.us-east-1.on.aws/';

    try {
        console.log(item);
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(item),
        });

        const data = await response.json();
        console.log(accessToken);
        console.log("this is where im now");
        const draftId = item.draftId;
        console.log(item.draftId);
        console.log("this is where im now 2");
        const editPageUrl = `../editorpage/edit.html?draftId=${item.draftId}&accessToken=${accessToken}`;
        console.log("this is where im now 3");
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




