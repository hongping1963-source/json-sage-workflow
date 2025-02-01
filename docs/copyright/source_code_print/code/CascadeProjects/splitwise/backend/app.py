from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

def analyze_json_structure(json_data):
    """Analyze JSON structure and provide insights"""
    analysis = {
        'type': type(json_data).__name__,
        'structure': {},
        'insights': []
    }
    
    if isinstance(json_data, dict):
        analysis['structure'] = {
            'type': 'object',
            'properties': len(json_data),
            'keys': list(json_data.keys())
        }
        # Add insights for objects
        if len(json_data) == 0:
            analysis['insights'].append('Empty object detected')
        else:
            nested_objects = [k for k, v in json_data.items() if isinstance(v, (dict, list))]
            if nested_objects:
                analysis['insights'].append(f'Nested structures found in: {", ".join(nested_objects)}')
    
    elif isinstance(json_data, list):
        analysis['structure'] = {
            'type': 'array',
            'length': len(json_data),
            'sample_types': list(set(type(x).__name__ for x in json_data[:5]))
        }
        # Add insights for arrays
        if len(json_data) == 0:
            analysis['insights'].append('Empty array detected')
        elif all(isinstance(x, dict) for x in json_data):
            analysis['insights'].append('Array contains uniform objects')
    
    return analysis

@app.route('/api/analyze', methods=['POST'])
def analyze_json():
    """
    Analyze JSON using JsonSage AI agent
    """
    try:
        data = request.get_json()
        if not data or 'json' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No JSON data provided'
            }), 400

        # Try to parse the JSON if it's a string
        json_input = data['json']
        if isinstance(json_input, str):
            try:
                json_input = json.loads(json_input)
            except json.JSONDecodeError as e:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid JSON format: {str(e)}'
                }), 400

        # Analyze the JSON structure
        analysis_result = analyze_json_structure(json_input)
        
        return jsonify({
            'status': 'success',
            'message': 'JSON analysis completed',
            'result': analysis_result
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error analyzing JSON: {str(e)}'
        }), 500

@app.route('/api/links', methods=['GET'])
def get_links():
    """
    Get external resource links
    """
    links = {
        'npm_package': 'https://www.npmjs.com/settings/zhanghongping/packages',
        'github_repo': 'https://github.com/hongping1963-source/json-sage-workflow'
    }
    return jsonify(links)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
