

document.addEventListener('DOMContentLoaded', () => {

    const editor = document.getElementById('markdown-editor');
    const preview = document.getElementById('markdown-preview');

    editor.addEventListener('input', updatePreview);
});

function updatePreview() {
    const editor = document.getElementById('markdown-editor');
    const preview = document.getElementById('markdown-preview');
    const markdownText = editor.value;
    const html = marked(markdownText);
    preview.innerHTML = html;
}

function saveToS3() {
    // Implement S3 saving logic here
    console.log('Save to S3 logic goes here');
}
