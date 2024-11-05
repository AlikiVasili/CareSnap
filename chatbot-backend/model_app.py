from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer
import torch
import os
from RoBERTa_finetune_multi_label import RoBERTaClassifier  # Import your model definition

app = Flask(__name__)
CORS(app)

# Device and Model Setup
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'roberta_multi_label.pth')
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load Model and Tokenizer
model = RoBERTaClassifier(roberta_model_name='roberta-base', num_classes=15)
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device).eval()
tokenizer = AutoTokenizer.from_pretrained('roberta-base')

# Intent Labels
class_to_intent = {
    0: 'allergies', 1: 'current_problems', 2: 'exit', 3: 'feeling',
    4: 'hello', 5: 'illness_history', 6: 'implants', 7: 'info', 8: 'intolerances',
    9: 'other', 10: 'prescription', 11: 'surgery', 12: 'vaccination',
    13: 'placeholder_1', 14: 'placeholder_2'
}


@app.route('/predict', methods=['POST'])
def chat():

    user_message = request.json.get('message')
    inputs = tokenizer(user_message, return_tensors='pt', max_length=128, padding='max_length', truncation=True)
    inputs = {key: val.to(device) for key, val in inputs.items()}

    # Multi-label Prediction
    with torch.no_grad():
        logits = model(input_ids=inputs['input_ids'], attention_mask=inputs['attention_mask'])
        probabilities = torch.sigmoid(logits).cpu().numpy()[0]
        
    # Confidence Thresholding
    confidence_threshold = 0.5
    predicted_intents = [class_to_intent[i] for i, prob in enumerate(probabilities) if prob > confidence_threshold]

    print(predicted_intents)

    # Join list of response messages into a single string for JSON response
    return jsonify(predicted_intents)

# Helper function to find allergy category
def find_allergy_category(user_input, category_keywords):
    from fuzzywuzzy import fuzz  # Import here to avoid unnecessary dependency if not used
    user_input = user_input.lower()

    max_similarity = 0
    best_match = None
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            similarity = fuzz.partial_ratio(user_input, keyword)
            if similarity > max_similarity:
                max_similarity = similarity
                best_match = category

    return best_match if max_similarity >= 70 else None

if __name__ == '__main__':
    app.run(port=5000)
