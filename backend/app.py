import os
import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pypdf import PdfReader
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PdfReader(file)
        for page in reader.pages:
            extract = page.extract_text()
            if extract: text += extract
    return text

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@app.route('/analyze', methods=['POST'])
def analyze_contract():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        messages = []
        extracted_text = "" # We will store the text here
        
        system_msg = {
            "role": "system", 
            "content": """You are an expert AI Lawyer. Analyze the document provided.
            Return a JSON response with:
            1. "summary": A simple 3-sentence summary of what this document is.
            2. "red_flags": A list of 3-5 risky clauses, weird fees, or important details found.
            3. "rating": A safety/clarity score from 1-10 (10 is safe).
            Output strictly valid JSON."""
        }

        # HANDLE PDF
        if filename.lower().endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
            if len(extracted_text.strip()) < 10:
                return jsonify({"error": "PDF has no text. Use a screenshot instead."}), 400
            
            messages = [
                system_msg,
                {"role": "user", "content": f"Analyze this contract text:\n\n{extracted_text[:15000]}"}
            ]

        # HANDLE IMAGES
        elif filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            base64_image = encode_image(filepath)
            messages = [
                system_msg,
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this image of a document."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        else:
            return jsonify({"error": "File type not supported."}), 400

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                response_format={ "type": "json_object" }
            )
            
            # Parse the JSON response
            parsed_content = json.loads(response.choices[0].message.content)
            
            # KEY CHANGE: We add the extracted text to the response
            # (So the frontend can send it back for chatting)
            parsed_content['full_text'] = extracted_text
            
            return jsonify(parsed_content)

        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500

# NEW: Chat Endpoint
@app.route('/chat', methods=['POST'])
def chat_document():
    data = request.json
    question = data.get('question')
    context = data.get('context') # This is the full contract text

    if not question or not context:
        return jsonify({"answer": "I can only answer questions about text-based PDFs right now."}), 200

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI lawyer. Answer the user's question based ONLY on the contract text provided below. Keep answers short and direct."},
                {"role": "user", "content": f"Contract Text:\n{context}\n\nUser Question: {question}"}
            ]
        )
        return jsonify({"answer": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)