"""
Job-to-CVs Matching System
Finds best matching CVs for a given job description using BERT + keyword hybrid scoring
Uses the SAME model as employee job matching for consistent results
"""

import sys
import json
import os

# Add model matching directory to path
cv_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'cv', 'cv'))
model_matching_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'model matching'))
sys.path.insert(0, cv_model_dir)
sys.path.insert(0, model_matching_dir)

# Try to import the actual CVJobMatcher from model matching directory
try:
    from cv_job_matching_model import CVJobMatcher as ActualCVJobMatcher
    USE_ACTUAL_MODEL = True
    print("✅ Using actual BERT model from model matching", file=sys.stderr, flush=True)
except ImportError as e:
    print(f"⚠️ Could not import actual model: {e}", file=sys.stderr, flush=True)
    USE_ACTUAL_MODEL = False


def main():
    """
    Main execution: read job + CVs from stdin, return top matches as JSON
    Uses the SAME model as employee job matching for consistent results
    
    IMPORTANT: We match each CV against the job (same direction as employee matching)
    to ensure identical scores
    """
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        job_description = input_data.get('job_description', '')
        cv_texts = input_data.get('cv_texts', [])  # List of CV text strings
        top_k = input_data.get('top_k', 10)
        
        if not job_description or not cv_texts:
            raise ValueError("Missing job_description or cv_texts")
        
        # Use the ACTUAL model from model matching directory (same as employee matching)
        if USE_ACTUAL_MODEL:
            matcher = ActualCVJobMatcher()
            model_path = os.path.join(model_matching_dir, 'cv_job_matcher_final.pkl')
            
            try:
                matcher.load_model(model_path)
            except Exception as e:
                pass  # Model will use embeddings only
        else:
            # Fallback to simulation
            matcher = CVJobMatcher()
            model_path = os.path.join(cv_model_dir, 'cv_job_matcher_final.pkl')
            matcher.load_model(model_path)
        
        # CRITICAL: Match each CV against the job (same as employee matching)
        # This ensures we get the EXACT same scores
        all_matches = []
        for cv_index, cv_text in enumerate(cv_texts):
            # Call find_top_matches with CV first, job second (employee direction)
            matches = matcher.find_top_matches(cv_text, [job_description], top_k=1, use_hybrid=True)
            
            if matches:
                all_matches.append({
                    'job_index': cv_index,  # This is actually CV index (named for compatibility)
                    'similarity_score': matches[0]['similarity_score']
                })
        
        # Sort by score and return top K
        all_matches = sorted(all_matches, key=lambda x: x['similarity_score'], reverse=True)
        top_matches = all_matches[:top_k]
        
        # Return results as JSON to stdout (ONLY JSON, no other text)
        result = {
            'success': True,
            'matches': top_matches
        }
        
        print(json.dumps(result), flush=True)
        
    except json.JSONDecodeError as e:
        error_response = {
            'success': False,
            'error': f'Invalid JSON input: {str(e)}'
        }
        print(json.dumps(error_response), flush=True)
        
    except Exception as e:
        import traceback
        error_response = {
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_response), flush=True)


if __name__ == "__main__":
    main()
