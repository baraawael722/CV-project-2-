# CV-Job Matching Model

This project implements a Deep Learning model for matching resumes (CVs) with job descriptions using BERT and Sentence Transformers to achieve high accuracy.

## Project Structure

```
cv-job-matching-colab
├── notebooks
│   └── train_model.ipynb        # Jupyter notebook for training the model
├── data
│   ├── dataa.csv                # CSV file containing resumes for training
│   └── jobs_clean.csv           # CSV file containing job descriptions for training
├── models
│   ├── best_matching_model.pth   # Saved state of the best-performing model
│   └── cv_job_matcher_final.pkl  # Final trained model serialized using pickle
├── src
│   └── cv_job_matching_model.py   # Implementation of the CV-Job Matching model
├── requirements.txt              # List of dependencies required for the project
└── README.md                     # Documentation for the project
```

## Getting Started

To run the training process for the CV-Job Matching model, follow these steps:

1. **Clone the Repository**: Clone this repository to your local machine or Google Colab.

2. **Install Dependencies**: Install the required libraries listed in `requirements.txt`. You can do this by running:
   ```
   !pip install -r requirements.txt
   ```

3. **Upload Data**: Ensure that the `dataa.csv` and `jobs_clean.csv` files are located in the `data` directory.

4. **Run the Training Notebook**: Open the `notebooks/train_model.ipynb` file in Jupyter or Google Colab. This notebook will import the necessary libraries, load the data, and execute the training function defined in `src/cv_job_matching_model.py`.

5. **Model Output**: After training, the best-performing model will be saved as `best_matching_model.pth`, and the final trained model will be serialized as `cv_job_matcher_final.pkl` in the `models` directory.

## Usage

Once the model is trained, you can use the saved models for inference or further training as needed.

## Acknowledgments

This project utilizes the following libraries:
- PyTorch
- pandas
- sentence-transformers

Feel free to contribute to this project or use it as a reference for your own CV-Job matching applications!