"""
JOB-to-CVs Matching System - Automated Test
"""

import os
import re
from cv_job_matching_model import CVJobMatcher

def main():
    """
    Test the model with multiple CVs and a single job description
    """
    print("\n" + "="*80)
    print("JOB-TO-CVs Matching System - Automated Test")
    print("="*80)

    # File paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cvs_file_path = os.path.join(base_dir, "CVs.txt")
    job_file_path = os.path.join(base_dir, "job_description_1.txt")

    # Load the trained model
    print("\nLoading the BERT model...")
    matcher = CVJobMatcher()
    try:
        matcher.load_model(r'c:\Users\bodyn\OneDrive\Desktop\Assignments\Dr-Hanaa\cv\cv_job_matcher_final.pkl')
        print("✅ Trained model loaded successfully!")
    except FileNotFoundError:
        print("⚠️ Trained model not found. Using semantic matching only (hybrid mode).")

    # Read CVs
    print(f"\nReading CVs from: {cvs_file_path}")
    with open(cvs_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split CVs by number pattern (1. 2. 3. ...) at the start of a line
    lines = content.split('\n')
    cvs = []
    current_cv = []

    for line in lines:
        if re.match(r'^\d+\.', line.strip()):
            if current_cv:
                cvs.append(' '.join(current_cv).strip())
            current_cv = [line.strip()]
        else:
            if current_cv:
                current_cv.append(line.strip())
    if current_cv:
        cvs.append(' '.join(current_cv).strip())

    print(f"✅ Loaded {len(cvs)} CVs")

    # Read job description
    print(f"\nReading job description from: {job_file_path}")
    with open(job_file_path, 'r', encoding='utf-8') as f:
        job_text = f.read().strip()

    print(f"✅ Job description loaded ({len(job_text)} characters)")

    # Find top 10 matching CVs
    print("\n🔍 Matching CVs to the job description...")
    matches = matcher.find_top_matches(job_text, cvs, top_k=10, use_hybrid=True)

    # Display results
    print("\n" + "="*80)
    print("TOP 10 MATCHING CVs FOR THE JOB DESCRIPTION:")
    print("="*80)

    for i, match in enumerate(matches, 1):
        cv_idx = match['cv_index'] if 'cv_index' in match else match['job_index']
        score = match['similarity_score']
        cv_preview = cvs[cv_idx][:300].replace('\n', ' ')
        print(f"{i}. CV #{cv_idx+1}")
        print(f"   Match Score: {score:.2f}%")
        print(f"   CV Preview: {cv_preview}...")
        print("-"*80)

    print("\n✅ Matching complete!")

if __name__ == "__main__":
    main()
