from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import os
import pandas as pd
from flask_cors import CORS
import scipy.special

# Ensure the current working directory matches the script's location
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "neural_net_model.keras")
csv_path = os.path.join(current_dir, "processed_premier_league_matches.csv")

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}")

if not os.path.exists(csv_path):
    raise FileNotFoundError(f"Dataset file not found at {csv_path}")

# Load trained model once
print(f"Loading model from {model_path}...")
model = tf.keras.models.load_model(model_path)
print("Model loaded successfully.")

# Load dataset once (no reloading every request)
print(f"Loading dataset from {csv_path}...")
df = pd.read_csv(csv_path)
print("Dataset loaded successfully.")

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    print("\n====== New Prediction Request Received ======")
    data = request.json
    home_team = data.get("home_team")
    away_team = data.get("away_team")

    print(f"Home Team: {home_team}, Away Team: {away_team}")

    # Retrieve stats for both teams from the preloaded dataset
    home_stats = df[df["Home"] == home_team].select_dtypes(include=[np.number]).mean()
    away_stats = df[df["Away"] == away_team].select_dtypes(include=[np.number]).mean()
    head_to_head = df[(df["Home"] == home_team) & (df["Away"] == away_team)].select_dtypes(include=[np.number]).mean()

    print("\n==== Computed Stats ====")
    print(f"Home Stats: {home_stats.to_dict()}")
    print(f"Away Stats: {away_stats.to_dict()}")
    print(f"Head-to-Head Stats: {head_to_head.to_dict()}")
    print("=========================\n")

    # Ensure all features exist
    required_features = [
        "Season_Home_xG", "Season_Home_xGA", "Season_Home_WinPerc", "Season_Home_GD",
        "Season_Away_xG", "Season_Away_xGA", "Season_Away_WinPerc", "Season_Away_GD",
        "Season_Home_DrawPerc", "Season_Away_DrawPerc",
        "Head_to_Head_HomeWinPerc", "Head_to_Head_AwayWinPerc", "Head_to_Head_DrawPerc"
    ]

    # Fill missing values with 0
    for feature in required_features:
        if feature not in home_stats or pd.isna(home_stats[feature]):
            home_stats[feature] = 0
        if feature not in away_stats or pd.isna(away_stats[feature]):
            away_stats[feature] = 0
        if feature not in head_to_head or pd.isna(head_to_head[feature]):
            head_to_head[feature] = 0

    # Prepare features
    X_input = np.array([
        home_stats["Season_Home_xG"],
        home_stats["Season_Home_xGA"],
        home_stats["Season_Home_WinPerc"],
        home_stats["Season_Home_GD"],
        away_stats["Season_Away_xG"],
        away_stats["Season_Away_xGA"],
        away_stats["Season_Away_WinPerc"],
        away_stats["Season_Away_GD"],
        home_stats["Season_Home_DrawPerc"],
        away_stats["Season_Away_DrawPerc"],
        head_to_head["Head_to_Head_HomeWinPerc"],
        head_to_head["Head_to_Head_AwayWinPerc"],
        head_to_head["Head_to_Head_DrawPerc"],
    ]).reshape(1, -1)

    print(f"Model input shape: {X_input.shape}")

    # Predict match outcome
    logits = model.predict(X_input)[0]

    print(f"Raw model logits (before softmax): {logits}")
    print(f"Sum of raw logits: {sum(logits)}")

    # Apply strict softmax normalization
    win_probabilities = scipy.special.softmax(logits)  # Softmax ensures probabilities sum to 1

    print(f"Final win probabilities after softmax: {win_probabilities}")
    print(f"Sum of final probabilities: {sum(win_probabilities)}")

    # Calculate expected goals based on win probabilities
    home_expected_goals = round(win_probabilities[0] * 3, 2)  # Scale to football score range
    away_expected_goals = round(win_probabilities[2] * 3, 2)

    response = {
        "home_win_probability": float(win_probabilities[0] * 100),
        "draw_probability": float(win_probabilities[1] * 100),
        "away_win_probability": float(win_probabilities[2] * 100),
        "home_expected_goals": float(home_expected_goals),
        "away_expected_goals": float(away_expected_goals)
    }

    print(f"Response sent: {response}")
    return jsonify(response)

if __name__ == "__main__":
    print("Starting Flask API...")
    app.run(debug=True)
