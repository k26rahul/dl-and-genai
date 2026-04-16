import json
import os
import pandas as pd
from sklearn.datasets import load_breast_cancer, load_iris

# Create a directory to store the JSON files
output_dir = "datasets"
os.makedirs(output_dir, exist_ok=True)


def save_to_json(X, y, feature_names, filename):
  data = {
      "features": feature_names,
      "X": X.tolist(),
      "y": y.tolist()
  }
  filepath = os.path.join(output_dir, filename)
  with open(filepath, 'w') as f:
    # Minified JSON to save space
    json.dump(data, f, separators=(',', ':'))
  print(f"✅ Saved {filename} | Rows: {len(X)} | Features: {len(feature_names)}")


print("Generating datasets...\n")

# ==========================================
# 1. Breast Cancer Wisconsin (Binary Classification)
# ==========================================
try:
  print("Processing Breast Cancer Dataset...")
  bc = load_breast_cancer()
  X_cancer = bc.data
  y_cancer = bc.target.reshape(-1, 1)
  features_cancer = bc.feature_names.tolist()

  save_to_json(X_cancer, y_cancer, features_cancer, "breast_cancer.json")
except Exception as e:
  print(f"❌ Error processing Breast Cancer: {e}")

# ==========================================
# 2. Iris (Multi-Class Classification)
# ==========================================
try:
  print("Processing Iris Dataset...")
  iris = load_iris()
  X_iris = iris.data
  features_iris = iris.feature_names

  # One-Hot Encode the targets (0, 1, 2) into shape (N, 3)
  y_iris = pd.get_dummies(iris.target).astype(int).values

  save_to_json(X_iris, y_iris, features_iris, "iris.json")
except Exception as e:
  print(f"❌ Error processing Iris: {e}")

# ==========================================
# 3. Auto MPG (Regression)
# ==========================================
try:
  print("Processing Auto MPG Dataset...")
  # Fetching directly from UCI via pandas bypasses the OpenML naming quirks
  url_mpg = "https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data"
  column_names = ['mpg', 'cylinders', 'displacement', 'horsepower',
                  'weight', 'acceleration', 'model_year', 'origin', 'car_name']

  df_mpg = pd.read_csv(url_mpg, names=column_names, delim_whitespace=True, na_values="?")
  df_mpg = df_mpg.dropna()

  y_mpg = df_mpg['mpg'].values.reshape(-1, 1)

  # Drop target and string column to get pure numeric features
  X_mpg_df = df_mpg.drop(columns=['mpg', 'car_name'])
  features_mpg = X_mpg_df.columns.tolist()
  X_mpg = X_mpg_df.values

  save_to_json(X_mpg, y_mpg, features_mpg, "auto_mpg.json")
except Exception as e:
  print(f"❌ Error processing Auto MPG: {e}")

print("\n🎉 All datasets processed successfully!")
