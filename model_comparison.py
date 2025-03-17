import json
import os
import pandas as pd

# Define models and their corresponding result files
model_files = {
    "Logistic Regression": "./static/Logistic_Regression_results.json",
    "KNN": "./static/KNeighbors_Classifier_results.json",
    "Random Forest": "./static/RandomForest_Classifier_results.json",
    "SVM": "./static/SVM_Classifier_results.json",
    "Neural Network": "./static/Neural_Network_results.json"
}


# Load model results
results = {}
for model, file_path in model_files.items():
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            results[model] = json.load(f)
    else:
        print(f"⚠️ Warning: Results file not found for {model}")

# Convert results into a DataFrame for a tabular view
df = pd.DataFrame.from_dict(results, orient="index")

# Save final comparison table as CSV
df.to_csv("./static/model_comparison_table.csv")

# Print the table
print("\n📊 Model Comparison Table:\n")
print(df)

# Save in JSON format for frontend use
comparison_json = df.to_dict(orient="index")
with open("./static/model_comparison.json", "w") as f:
    json.dump(comparison_json, f, indent=4)

