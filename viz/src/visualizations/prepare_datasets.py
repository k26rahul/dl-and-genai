"""
prepare_datasets.py
===================
Generates all dataset JSON files + a metadata index for the
Real-World Neural Network Training visualization.

Run from: viz/src/visualizations/
Output:   viz/src/visualizations/datasets/

Required packages:
  pip install pandas scikit-learn numpy openpyxl xlrd
  (xlrd   → for .xls  files: Concrete)
  (openpyxl → for .xlsx files: Energy Efficiency)
"""

import json
import os
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer, load_iris
from sklearn.impute import SimpleImputer

# ── Configuration ────────────────────────────────────────────────────────────

GITHUB_RAW_BASE = (
  "https://raw.githubusercontent.com/k26rahul/dl-and-genai"
  "/refs/heads/main/viz/src/visualizations/datasets"
)

# Always write relative to this script's own location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "datasets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

metadata_entries = {}  # accumulated while saving each dataset

# ── Helpers ──────────────────────────────────────────────────────────────────

def save(dataset_id, X, y, feature_names, meta):
  """Write minified JSON and register metadata entry."""
  filename = f"{dataset_id}.json"
  filepath = os.path.join(OUTPUT_DIR, filename)

  payload = {
    "features": list(feature_names),
    "X": np.array(X, dtype=float).tolist(),
    "y": np.array(y, dtype=float).tolist(),
  }
  with open(filepath, "w") as f:
    json.dump(payload, f, separators=(",", ":"))

  size_bytes = os.path.getsize(filepath)
  metadata_entries[dataset_id] = {
    **meta,
    "id": dataset_id,
    "filename": filename,
    "url": f"{GITHUB_RAW_BASE}/{filename}",
    "rows": int(len(X)),
    "numFeatures": int(len(list(feature_names))),
    "sizeBytes": int(size_bytes),
  }
  print(
    f"  ✅ {dataset_id}: {len(X)} rows × {len(list(feature_names))} features"
    f" — {size_bytes:,} bytes"
  )


# ── Datasets ─────────────────────────────────────────────────────────────────

print("=" * 62)
print("  Dataset Generator — Real-World NN Training Visualization")
print("=" * 62)

# ── 1. Breast Cancer Wisconsin (Binary Classification) ───────────────────────
print("\n[1/13] Breast Cancer Wisconsin")
try:
  bc = load_breast_cancer()
  save(
    "breast_cancer",
    X=bc.data,
    y=bc.target.reshape(-1, 1),
    feature_names=bc.feature_names.tolist(),
    meta={
      "name": "Breast Cancer (Binary)",
      "description": (
        "Classify breast tumors as malignant or benign from 30 cell-nucleus "
        "features (radius, texture, perimeter, area, smoothness …). "
        "A classic binary classification benchmark from sklearn."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 2. Iris (Multi-class Classification) ─────────────────────────────────────
print("\n[2/13] Iris")
try:
  iris = load_iris()
  # One-hot encode targets: 0/1/2 → (N, 3)
  y_ohe = pd.get_dummies(pd.Series(iris.target), dtype=int).values
  save(
    "iris",
    X=iris.data,
    y=y_ohe,
    feature_names=list(iris.feature_names),
    meta={
      "name": "Iris (Multi-class)",
      "description": (
        "Identify 3 iris species (setosa, versicolor, virginica) from sepal "
        "and petal length/width. Targets are one-hot encoded into 3 output neurons."
      ),
      "type": "classification",
      "classes": 3,
      "outNeurons": 3,
      "activation": "softmax",
      "loss": "categoricalCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 3. Auto MPG (Regression) ─────────────────────────────────────────────────
print("\n[3/13] Auto MPG")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/auto-mpg/auto-mpg.data"
  )
  cols = ["mpg", "cylinders", "displacement", "horsepower",
          "weight", "acceleration", "model_year", "origin", "car_name"]
  df = pd.read_csv(url, names=cols, sep=r"\s+", na_values="?").dropna()
  X_df = df.drop(columns=["mpg", "car_name"])
  save(
    "auto_mpg",
    X=X_df.values,
    y=df["mpg"].values.reshape(-1, 1),
    feature_names=X_df.columns.tolist(),
    meta={
      "name": "Auto MPG (Regression)",
      "description": (
        "Predict fuel efficiency (miles per gallon) from cylinders, displacement, "
        "horsepower, weight, acceleration, model year, and origin. "
        "Missing horsepower values are dropped."
      ),
      "type": "regression",
      "classes": 0,
      "outNeurons": 1,
      "activation": "linear",
      "loss": "meanSquaredError",
      "metric": "meanAbsoluteError",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 4. Spambase (Binary Classification) ──────────────────────────────────────
print("\n[4/13] Spambase")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/spambase/spambase.data"
  )
  df = pd.read_csv(url, header=None)
  # Official feature names from spambase.names (48 word + 6 char + 3 capital)
  feature_names = [
    "word_freq_make", "word_freq_address", "word_freq_all", "word_freq_3d",
    "word_freq_our", "word_freq_over", "word_freq_remove", "word_freq_internet",
    "word_freq_order", "word_freq_mail", "word_freq_receive", "word_freq_will",
    "word_freq_people", "word_freq_report", "word_freq_addresses", "word_freq_free",
    "word_freq_business", "word_freq_email", "word_freq_you", "word_freq_credit",
    "word_freq_your", "word_freq_font", "word_freq_000", "word_freq_money",
    "word_freq_hp", "word_freq_hpl", "word_freq_george", "word_freq_650",
    "word_freq_lab", "word_freq_labs", "word_freq_telnet", "word_freq_857",
    "word_freq_data", "word_freq_415", "word_freq_85", "word_freq_technology",
    "word_freq_1999", "word_freq_parts", "word_freq_pm", "word_freq_direct",
    "word_freq_cs", "word_freq_meeting", "word_freq_original", "word_freq_project",
    "word_freq_re", "word_freq_edu", "word_freq_table", "word_freq_conference",
    "char_freq_semicolon", "char_freq_leftparen", "char_freq_leftbracket",
    "char_freq_exclamation", "char_freq_dollar", "char_freq_hash",
    "capital_run_avg", "capital_run_longest", "capital_run_total",
  ]
  save(
    "spambase",
    X=df.iloc[:, :-1].values,
    y=df.iloc[:, -1].values.reshape(-1, 1),
    feature_names=feature_names,
    meta={
      "name": "Spambase (Binary)",
      "description": (
        "Classify 4,601 emails as spam or legitimate using word/character "
        "frequency statistics and capital-letter run metrics. All features "
        "are continuous — no encoding needed."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 5. MAGIC Gamma Telescope (Binary Classification) ─────────────────────────
print("\n[5/13] MAGIC Gamma Telescope")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/magic/magic04.data"
  )
  feat_names = [
    "fLength", "fWidth", "fSize", "fConc", "fConc1",
    "fAsym", "fM3Long", "fM3Trans", "fAlpha", "fDist",
  ]
  df = pd.read_csv(url, names=feat_names + ["class"])
  y = (df["class"] == "g").astype(int).values.reshape(-1, 1)  # gamma=1, hadron=0
  save(
    "magic_gamma",
    X=df[feat_names].values,
    y=y,
    feature_names=feat_names,
    meta={
      "name": "MAGIC Telescope (Binary)",
      "description": (
        "Distinguish gamma-ray (signal) from cosmic-ray hadron (background) "
        "events using 10 geometric shower features recorded by the MAGIC "
        "Cherenkov telescope. 19,020 simulated events."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 6. Ionosphere (Binary Classification) ────────────────────────────────────
print("\n[6/13] Ionosphere")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/ionosphere/ionosphere.data"
  )
  df = pd.read_csv(url, header=None)
  # Column 1 is a constant 0 (junk from data collection) — drop it
  X_df = df.iloc[:, :-1].drop(columns=[1])
  y = (df.iloc[:, -1] == "g").astype(int).values.reshape(-1, 1)
  feat_names = [f"pulse_{i+1}" for i in range(X_df.shape[1])]
  save(
    "ionosphere",
    X=X_df.values,
    y=y,
    feature_names=feat_names,
    meta={
      "name": "Ionosphere (Binary)",
      "description": (
        "Classify radar returns from the ionosphere as 'good' (evidence of "
        "electron structure) or 'bad' (pass-through). 351 instances, 33 "
        "pulse features. Constant column 2 is dropped."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 7. Wine Quality – Red (Binary Classification) ────────────────────────────
print("\n[7/13] Wine Quality (Red)")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/wine-quality/winequality-red.csv"
  )
  df = pd.read_csv(url, sep=";")
  feat_cols = df.columns[:-1].tolist()
  y = (df["quality"] >= 6).astype(int).values.reshape(-1, 1)  # 6+ = good
  save(
    "wine_quality",
    X=df[feat_cols].values,
    y=y,
    feature_names=feat_cols,
    meta={
      "name": "Wine Quality Red (Binary)",
      "description": (
        "Predict if a Portuguese red wine is 'good' (quality ≥ 6) or 'mediocre' "
        "from 11 physicochemical properties: fixed/volatile acidity, citric acid, "
        "residual sugar, chlorides, sulfur dioxide, density, pH, sulphates, alcohol."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 8. Heart Disease – Cleveland (Binary Classification) ─────────────────────
print("\n[8/13] Heart Disease (Cleveland)")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/heart-disease/processed.cleveland.data"
  )
  feat_names = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal",
  ]
  df = pd.read_csv(url, names=feat_names + ["target"], na_values="?").dropna()
  y = (df["target"] > 0).astype(int).values.reshape(-1, 1)  # any disease > 0
  save(
    "heart_disease",
    X=df[feat_names].values,
    y=y,
    feature_names=feat_names,
    meta={
      "name": "Heart Disease (Binary)",
      "description": (
        "Predict presence of heart disease from 13 clinical features: age, sex, "
        "chest pain type, resting blood pressure, cholesterol, fasting blood sugar, "
        "ECG results, max heart rate, exercise angina, ST depression, slope, vessels, thal. "
        "Rows with missing values (ca, thal) are dropped."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 9. Mushroom (Binary Classification) ──────────────────────────────────────
print("\n[9/13] Mushroom")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/mushroom/agaricus-lepiota.data"
  )
  col_names = [
    "class", "cap-shape", "cap-surface", "cap-color", "bruises", "odor",
    "gill-attachment", "gill-spacing", "gill-size", "gill-color",
    "stalk-shape", "stalk-root", "stalk-surface-above-ring",
    "stalk-surface-below-ring", "stalk-color-above-ring",
    "stalk-color-below-ring", "veil-type", "veil-color", "ring-number",
    "ring-type", "spore-print-color", "population", "habitat",
  ]
  df = pd.read_csv(url, names=col_names, na_values="?")
  y = (df["class"] == "e").astype(int).values.reshape(-1, 1)  # edible=1
  df = df.drop(columns=["class"])

  # Impute missing stalk-root values with most frequent category
  imputer = SimpleImputer(strategy="most_frequent")
  df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)

  # One-hot encode all 22 categorical features; get_feature_names_out via columns
  df_encoded = pd.get_dummies(df_imputed, dtype=int)
  feat_names = df_encoded.columns.tolist()
  save(
    "mushroom",
    X=df_encoded.values,
    y=y,
    feature_names=feat_names,
    meta={
      "name": "Mushroom (Binary)",
      "description": (
        "Classify 8,124 mushrooms as edible or poisonous. All 22 features are "
        "categorical (cap shape, odor, gill color, ring type …) and are one-hot "
        "encoded. Missing stalk-root values imputed with the most frequent category."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 10. Adult Census Income (Binary Classification) ──────────────────────────
print("\n[10/15] Adult Census Income")
try:
  col_names = [
    "age", "workclass", "fnlwgt", "education", "education-num",
    "marital-status", "occupation", "relationship", "race", "sex",
    "capital-gain", "capital-loss", "hours-per-week", "native-country", "income",
  ]

  # Load training split
  url_train = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/adult/adult.data"
  )
  df_train = pd.read_csv(
    url_train, names=col_names, na_values="?", skipinitialspace=True
  )

  # Load test split — first line is a junk header, target values have trailing '.'
  url_test = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/adult/adult.test"
  )
  df_test = pd.read_csv(
    url_test, names=col_names, na_values="?", skipinitialspace=True, skiprows=1
  )
  df_test["income"] = df_test["income"].str.rstrip(".")

  # Merge both splits, drop rows with any missing value
  df = pd.concat([df_train, df_test], ignore_index=True).dropna()

  y = (df["income"] == ">50K").astype(int).values.reshape(-1, 1)

  # Drop: fnlwgt (census sample weight, not a predictive feature),
  #       education (superseded by ordinal education-num)
  df = df.drop(columns=["income", "fnlwgt", "education"])

  numeric_cols = ["age", "education-num", "capital-gain", "capital-loss", "hours-per-week"]
  cat_cols = [
    "workclass", "marital-status", "occupation",
    "relationship", "race", "sex", "native-country",
  ]

  df_encoded = pd.get_dummies(df[numeric_cols + cat_cols], columns=cat_cols, dtype=int)
  feat_names = df_encoded.columns.tolist()
  save(
    "adult",
    X=df_encoded.values.astype(float),
    y=y,
    feature_names=feat_names,
    meta={
      "name": "Adult Income (Binary)",
      "description": (
        "Predict if a person earns >$50K/year from US Census data (training + test "
        "splits merged, ~45K rows). Numeric: age, education-num, capital gain/loss, "
        "hours/week. Categorical (one-hot): workclass, marital status, occupation, "
        "relationship, race, sex, native-country. fnlwgt and redundant education "
        "text column dropped. Rows with missing values dropped."
      ),
      "type": "classification",
      "classes": 2,
      "outNeurons": 1,
      "activation": "sigmoid",
      "loss": "binaryCrossentropy",
      "metric": "accuracy",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 11. Abalone (Regression) ─────────────────────────────────────────────────
print("\n[11/13] Abalone")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/abalone/abalone.data"
  )
  col_names = [
    "Sex", "Length", "Diameter", "Height",
    "Whole_weight", "Shucked_weight", "Viscera_weight", "Shell_weight", "Rings",
  ]
  df = pd.read_csv(url, names=col_names)
  y = df["Rings"].values.reshape(-1, 1)
  df = df.drop(columns=["Rings"])

  # One-hot encode Sex (M / F / I=infant); get proper feature names automatically
  df_encoded = pd.get_dummies(df, columns=["Sex"], dtype=int)
  feat_names = df_encoded.columns.tolist()
  save(
    "abalone",
    X=df_encoded.values.astype(float),
    y=y,
    feature_names=feat_names,
    meta={
      "name": "Abalone (Regression)",
      "description": (
        "Predict the age (ring count) of abalone shellfish from physical "
        "measurements: length, diameter, height, and four weight measurements. "
        "Sex (M/F/Infant) is one-hot encoded. Age is ring count + 1.5 years."
      ),
      "type": "regression",
      "classes": 0,
      "outNeurons": 1,
      "activation": "linear",
      "loss": "meanSquaredError",
      "metric": "meanAbsoluteError",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 12. Concrete Compressive Strength (Regression) ───────────────────────────
print("\n[12/13] Concrete Compressive Strength")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/concrete/compressive/Concrete_Data.xls"
  )
  df = pd.read_excel(url)   # requires xlrd: pip install xlrd
  feat_names = [
    "cement", "blast_furnace_slag", "fly_ash", "water",
    "superplasticizer", "coarse_aggregate", "fine_aggregate", "age_days",
  ]
  # Rename to clean names (last col = target)
  df.columns = feat_names + ["compressive_strength_MPa"]
  save(
    "concrete",
    X=df[feat_names].values,
    y=df["compressive_strength_MPa"].values.reshape(-1, 1),
    feature_names=feat_names,
    meta={
      "name": "Concrete Strength (Regression)",
      "description": (
        "Predict compressive strength (MPa) of concrete from 8 ingredients: "
        "cement, blast furnace slag, fly ash, water, superplasticizer, "
        "coarse aggregate, fine aggregate, and curing age in days. "
        "All features are continuous. No missing values."
      ),
      "type": "regression",
      "classes": 0,
      "outNeurons": 1,
      "activation": "linear",
      "loss": "meanSquaredError",
      "metric": "meanAbsoluteError",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── 13. Energy Efficiency – Heating Load (Regression) ───────────────────────
print("\n[13/15] Energy Efficiency – Heating Load")
print("[14/15] Energy Efficiency – Cooling Load")
try:
  url = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases"
    "/00242/ENB2012_data.xlsx"
  )
  df = pd.read_excel(url)  # requires openpyxl: pip install openpyxl
  feat_names = [
    "relative_compactness", "surface_area", "wall_area", "roof_area",
    "overall_height", "orientation", "glazing_area", "glazing_area_distribution",
  ]
  # Columns: 8 features + Y1 (Heating Load) + Y2 (Cooling Load)
  df.columns = feat_names + ["heating_load", "cooling_load"]
  X = df[feat_names].values

  _desc_common = (
    "768 building configurations simulated by Ecotect. "
    "8 architectural features: relative compactness, surface/wall/roof area, "
    "overall height, orientation, glazing area and its distribution. "
    "No missing values."
  )

  save(
    "energy_efficiency_heating",
    X=X,
    y=df["heating_load"].values.reshape(-1, 1),
    feature_names=feat_names,
    meta={
      "name": "Energy Efficiency – Heating (Regression)",
      "description": "Predict heating load (kWh/m²). " + _desc_common,
      "type": "regression",
      "classes": 0,
      "outNeurons": 1,
      "activation": "linear",
      "loss": "meanSquaredError",
      "metric": "meanAbsoluteError",
    },
  )

  save(
    "energy_efficiency_cooling",
    X=X,
    y=df["cooling_load"].values.reshape(-1, 1),
    feature_names=feat_names,
    meta={
      "name": "Energy Efficiency – Cooling (Regression)",
      "description": "Predict cooling load (kWh/m²). " + _desc_common,
      "type": "regression",
      "classes": 0,
      "outNeurons": 1,
      "activation": "linear",
      "loss": "meanSquaredError",
      "metric": "meanAbsoluteError",
    },
  )
except Exception as e:
  print(f"  ❌ {e}")

# ── Save metadata.json ────────────────────────────────────────────────────────

metadata = {
  "generatedAt": datetime.now(timezone.utc).isoformat(),
  "defaultDataset": "breast_cancer",
  "datasets": metadata_entries,
}

meta_path = os.path.join(OUTPUT_DIR, "metadata.json")
with open(meta_path, "w") as f:
  json.dump(metadata, f, indent=2)

print(f"\n{'=' * 62}")
print(f"  ✅ metadata.json — {len(metadata_entries)} datasets indexed")
print(f"  📁 Output: {OUTPUT_DIR}")
print(f"{'=' * 62}")
print("\n🎉 All datasets generated successfully!")
