
import re
import json

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    # Split by "## Question" headers
    blocks = re.split(r'## Question', content)[1:] # Skip preamble

    for block in blocks:
        q_data = {}
        
        # Extract Question Number (e.g., "1.1")
        lines = block.strip().split('\n')
        q_num = lines[0].strip()
        q_data['id'] = q_num

        # Helper to find value by key
        def get_value(key):
            match = re.search(fr'\*\*{re.escape(key)}:\*\*\s*(.*)', block)
            return match.group(1).strip() if match else ""

        q_data['units'] = get_value("Study Units")
        q_data['topic'] = get_value("Topic")
        q_data['difficulty'] = get_value("Difficulty")

        # Extract Grammar Rule
        rule_match = re.search(r'\*\*📘 Grammar Rule:\*\*\n(.*?)\n\n', block, re.DOTALL)
        q_data['rule'] = rule_match.group(1).strip() if rule_match else ""

        # Extract Example - capturing everything between Example header and the Question text
        # Only capturing text lines that start with ✓ or ✗ for cleaner validation, or just the block
        example_match = re.search(r'\*\*Example:\*\*\n(.*?)\n\n', block, re.DOTALL)
        q_data['example'] = example_match.group(1).strip() if example_match else ""

        # Extract Question Text - usually appears after Example and before options
        # We look for the line that has the blank "______"
        question_match = re.search(r'\n([^\n]*______[^\n]*)\n', block)
        if question_match:
             q_data['question'] = question_match.group(1).strip()
        else:
            # Fallback for questions that might be formatted differently or multiple lines
            # Look for lines between Example and Options (lists starting with - **(A)**)
            # This is a bit heuristical
            pass

        # Extract Options
        options = []
        correct_answer = -1
        
        opt_matches = re.finditer(r'- \*\*\((.)\)\*\*\s*(.*)', block)
        for idx, match in enumerate(opt_matches):
            text = match.group(2).strip()
            is_correct = '✓' in text
            clean_text = text.replace('✓', '').strip()
            options.append(clean_text)
            if is_correct:
                correct_answer = idx 
        
        q_data['options'] = options
        q_data['correctIndex'] = correct_answer
        
        if 'question' in q_data and q_data['id']:
             questions.append(q_data)

    return questions

if __name__ == "__main__":
    import os
    # Assuming relative path from where script is run, or absolute
    path = r"c:\Users\hal\Documents\grammarMarkDown\essential_grammar_study_guide_hk_kids_with_explanations.md"
    try:
        data = parse_markdown(path)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error: {e}")
