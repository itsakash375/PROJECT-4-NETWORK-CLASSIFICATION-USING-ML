import os
import os
import json
from flask import Flask, request, render_template, redirect, url_for, send_from_directory, jsonify
import pandas as pd

app = Flask(__name__, static_folder='static')

# Ensure directories exist
os.makedirs('./Data', exist_ok=True)
os.makedirs('./static', exist_ok=True)

# Function to filter dataset
def filters(data):
    columns_to_remove = ['is_host_login', 'protocol_type', 'service', 'flag', 'land', 'is_guest_login',
                         'su_attempted', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins',
                         'num_compromised', 'root_shell', 'num_root', 'num_file_creations',
                         'num_shells', 'num_access_files', 'srv_diff_host_rate']

    data = data.drop(columns=[col for col in columns_to_remove if col in data.columns], errors='ignore')
    data = data.loc[:, (data != 0).any(axis=0)]
    data.to_csv('./Data/filtered_data.csv', index=False)

    return data

# ✅ Home Page - User visits localhost and uploads data
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', has_data=os.path.exists('./Data/filtered_data.csv'))

# ✅ Handles file upload (User uploads data)
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return redirect(url_for('index'))
    
    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('index'))
    
    if file and file.filename.endswith('.csv'):
        data = pd.read_csv(file)
        data = filters(data)

        # ✅ Store the selected model choice
        model_type = request.form.get('model', 'RandomForest')
        with open('./static/selected_model.json', 'w') as f:
            json.dump({"model": model_type}, f)

        return redirect(url_for('results'))  # ✅ Redirect to results page
    
    return redirect(url_for('index'))

@app.route('/results')
def results():
    try:
        # ✅ Ensure dataset exists
        if not os.path.exists('./Data/filtered_data.csv'):
            return redirect(url_for('index'))

        # ✅ Load dataset
        data = pd.read_csv('./Data/filtered_data.csv')
        sample_data = data.head(5).to_dict('records')  # ✅ Define sample_data early
        columns = data.columns.tolist()

        # ✅ Load model comparison results safely
        model_results = {}
        best_model = None
        best_accuracy = 0.0

        if os.path.exists('./static/model_comparison.json'):
            with open('./static/model_comparison.json', 'r') as f:
                try:
                    model_results = json.load(f)
                    if isinstance(model_results, dict) and model_results:
                        best_model = max(model_results, key=lambda model: model_results[model].get("accuracy", 0))
                        best_accuracy = model_results[best_model].get("accuracy", 0)
                except json.JSONDecodeError:
                    print("❌ Error: Failed to load JSON. Check file formatting.")
                except Exception as e:
                    print(f"❌ Error loading model results: {e}")

        # ✅ Ensure valid best model
        if not best_model:
            print("❌ No model results found! Please run model comparison first.")

        # ✅ Display result based on accuracy
        prediction_text = ""
        if best_model:
            try:
                accuracy = float(best_accuracy)  
                print(f"✅ Best Model: {best_model}, Accuracy: {accuracy:.2%}")  

                if accuracy > 0.8:
                    prediction_text = "✅ The network is normal (Low Anomaly Risk)"
                else:
                    prediction_text = "⚠️ The network may contain anomalies (High Risk)"

            except ValueError:
                print("⚠️ Error: Accuracy value is invalid or missing.")
                prediction_text = "⚠️ Error: Invalid accuracy value"

        return render_template('results.html', 
                               sample_data=sample_data, 
                               columns=columns, 
                               model_results=model_results,
                               prediction_text=prediction_text,
                               selected_model=best_model)

    except Exception as e:
        print(f"❌ Error in results(): {e}")  
        return render_template('error.html', error=str(e))


# ✅ Serve static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8000)
