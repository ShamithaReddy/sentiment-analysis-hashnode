import json
import requests
import nltk
import re  # Added import for 're' module
from nltk import pos_tag, word_tokenize
from nltk.corpus import stopwords
from collections import Counter

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Download NLTK data (Run this once)
nltk.download('stopwords')
nltk.download('punkt')

def get_bert_embeddings(text):
    # Replace with your BERT-as-service server URL
    server_url = "http://your-bert-service-url:5555"

    try:
        # Request BERT embeddings
        response = requests.post(f"{server_url}/encode", json={"sents": [text]})
        response.raise_for_status()  # Check for HTTP errors

        embeddings = response.json()["result"][0]
        return embeddings
    except requests.exceptions.RequestException as e:
        # Log the error
        print(f"Error accessing BERT service: {e}")
        return None

def predict_tags(embeddings):
    if not embeddings:
        return []

    # Use a simple rule-based approach to predict technology-related tags
    tech_tags = ["technology", "coding", "programming", "data science", "artificial intelligence"]

    # Extract single words from the embeddings
    words = re.findall(r'\b\w+\b', embeddings.lower())

    # Predict tags by checking if a unique word is in the tech_tags list
    predicted_tags = set(word for word in words if any(tag.startswith(word) for tag in tech_tags))

    return list(predicted_tags)

def extract_keywords(text):
    try:
        # Tokenize and tag words
        words = word_tokenize(text)
        tagged_words = pos_tag(words)

        # Filter out stopwords and non-nouns
        filtered_words = [word for word, tag in tagged_words if word.lower() not in stopwords.words('english') and tag.startswith('N')]

        # Use Counter to get the most common keywords
        keyword_counter = Counter(filtered_words)
        top_keywords = [keyword for keyword, _ in keyword_counter.most_common(5)]  # Adjust the number as needed

        return top_keywords
    except Exception as e:
        # Log the error
        print(f"Error extracting keywords: {e}")
        return []

def generate_seo_tags(predicted_tags, top_keywords, max_seo_tags=10):
    # Combine predicted tags and top keywords to generate SEO-optimized tags
    seo_tags = list(set(predicted_tags + top_keywords))[:max_seo_tags]
    return seo_tags

def main():
    try:
        input_text = request.json.get('text', '').strip()

        if not input_text:
            return jsonify({'error': 'Empty input text'}), 400

        embeddings = get_bert_embeddings(input_text)
        predicted_tags = predict_tags(embeddings)
        top_keywords = extract_keywords(input_text)
        seo_tags = generate_seo_tags(predicted_tags, top_keywords)

        response = {
            'input_text': input_text,
            'predicted_tags': predicted_tags,
            'top_keywords': top_keywords,
            'seo_tags': seo_tags
        }

        return jsonify(response), 200
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == "__main__":
    main()
