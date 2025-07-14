# Match Predictor

This project predicts outcomes of English Premier League matches. A neural network model is trained on historical results and exposed through a Flask API. An Angular web interface consumes the API to display win probabilities and expected goals for a selected home and away team.

> This project was created for a presentation I did for Moyo.

## Repository Structure

- **api/** – Flask API and trained model (`neural_net_model.keras`).
- **application/** – Angular frontend application.
- **dataset/** – Raw CSV files used for data preparation.
- **notebook/** – Jupyter notebook with data processing and training steps.
- **images/** and **teams/** – Icons used by the frontend.

## Prerequisites

- Python 3.10+
- Node.js and npm for the Angular app

Python packages used by the API include:  
`flask`, `flask_cors`, `tensorflow`, `pandas`, `numpy`, and `scipy`.

## Running the Flask API

```bash
cd api
python flaskAPI.py
```

The endpoint will be available at `http://127.0.0.1:5000/predict` and expects a JSON payload with `home_team` and `away_team`.

## Running the Angular App

```bash
cd application
npm install
npm start   # or 'ng serve'
```

Navigate to `http://localhost:4200/` to use the interface. Selecting two  
teams sends a request to the Flask API and displays predicted win percentages and  
expected goals.

## Notebook

`notebook/Match Predictor Notebook.ipynb` demonstrates how the dataset was  
processed and how the neural network model was trained.

## Dataset

Historical Premier League match data is provided in `dataset/` and a processed  
version used by the API is in `api/processed_premier_league_matches.csv`.

## Credits

Club logos belong to their respective owners. The project is for educational  
purposes only.
