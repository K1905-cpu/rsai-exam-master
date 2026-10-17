import fitz
import glob
import re
import sys
import json
import base64
import os

sys.stdout.reconfigure(encoding='utf-8')

all_files = sorted(glob.glob('Solutions of RSAI-2026-Week-*.pdf'), key=lambda x: int(re.search(r'Week-(\d+)', x).group(1)))

def clean_text(t):
    t = t.replace('\u200b', '').replace('\xa0', ' ')
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

def get_base64_image(path):
    if os.path.exists(path):
        ext = path.split('.')[-1].lower()
        mime = 'image/png' if ext == 'png' else 'image/jpeg'
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('utf-8')
            return f"data:{mime};base64,{b64}"
    return None

def extract_week(file_path):
    doc = fitz.open(file_path)
    week_num = int(re.search(r'Week-(\d+)', file_path).group(1))
    
    lines = []
    for p_no, page in enumerate(doc):
        blocks = page.get_text('dict')['blocks']
        for b in blocks:
            if 'lines' in b:
                for l in b['lines']:
                    line_text = ""
                    has_red = False
                    for s in l['spans']:
                        line_text += s['text']
                        r = (s['color'] >> 16) & 255
                        g = (s['color'] >> 8) & 255
                        b_val = s['color'] & 255
                        if r > 170 and g < 80 and b_val < 80:
                            if s['text'].strip():
                                has_red = True
                    lines.append({
                        'text': line_text,
                        'has_red': has_red,
                        'page': p_no + 1,
                        'y': l['bbox'][1]
                    })
    
    questions = []
    curr_q = None
    curr_opt = None
    state = 'INIT'
    
    q_re = re.compile(r'^\s*(\d+)\s*\.\s*(.*)$')
    opt_re = re.compile(r'^\s*([a-e])\s*[\.\)](.*)$')
    exp_re = re.compile(r'^\s*Explanation\s*:(.*)$', re.IGNORECASE)
    num_re = re.compile(r'^\s*Answer\s*\([^\)]*\)\s*:\s*(.*)$', re.IGNORECASE)
    
    for l in lines:
        raw_text = clean_text(l['text'])
        if not raw_text:
            continue
            
        if re.match(r'^Week\s*-\s*\d+', raw_text, re.IGNORECASE) and not q_re.match(raw_text):
            continue
            
        q_m = q_re.match(raw_text)
        exp_m = exp_re.match(raw_text)
        num_m = num_re.match(raw_text)
        opt_m = opt_re.match(raw_text)
        
        if q_m and (state == 'EXPLANATION' or state == 'INIT' or (curr_q and int(q_m.group(1)) == curr_q['q_number'] + 1)):
            q_num = int(q_m.group(1))
            q_rest = q_m.group(2).strip()
            curr_q = {
                'id': f"w{week_num}_q{q_num}",
                'week': week_num,
                'q_number': q_num,
                'question': q_rest,
                'options': [],
                'correct_answers': [],
                'is_multiple_choice': False,
                'is_numerical': False,
                'numerical_answer': None,
                'explanation': "",
                'image': None,
                'explanation_image': None
            }
            questions.append(curr_q)
            curr_opt = None
            state = 'QUESTION'
            continue
            
        if curr_q is None:
            continue
            
        if exp_m:
            state = 'EXPLANATION'
            curr_q['explanation'] = exp_m.group(1).strip()
            curr_opt = None
            continue
            
        if num_m:
            state = 'NUMERICAL'
            curr_q['is_numerical'] = True
            ans_val = num_m.group(1).strip()
            curr_q['numerical_answer'] = ans_val
            curr_q['correct_answers'].append(ans_val)
            continue
            
        if opt_m and state in ('QUESTION', 'OPTION'):
            opt_letter = opt_m.group(1).lower()
            opt_text = opt_m.group(2).strip()
            curr_opt = {
                'id': opt_letter,
                'text': opt_text,
                'is_correct': l['has_red']
            }
            curr_q['options'].append(curr_opt)
            if l['has_red']:
                curr_q['correct_answers'].append(opt_letter)
            state = 'OPTION'
            continue
            
        if state == 'QUESTION':
            curr_q['question'] += " " + raw_text
        elif state == 'OPTION' and curr_opt:
            curr_opt['text'] += " " + raw_text
            if l['has_red']:
                curr_opt['is_correct'] = True
                if curr_opt['id'] not in curr_q['correct_answers']:
                    curr_q['correct_answers'].append(curr_opt['id'])
        elif state == 'EXPLANATION':
            curr_q['explanation'] += " " + raw_text
            
    for q in questions:
        q['question'] = clean_text(q['question'])
        q['explanation'] = clean_text(q['explanation'])
        if "select all that apply" in q['question'].lower() or len(q['correct_answers']) > 1:
            q['is_multiple_choice'] = True
            
        if week_num == 5 and q['q_number'] == 9:
            q['explanation_image'] = get_base64_image("quiz_images/week_5_p3_img1.png")
        elif week_num == 6 and q['q_number'] == 6:
            q['explanation_image'] = get_base64_image("quiz_images/week_6_p2_img1.png")
        elif week_num == 7 and q['q_number'] == 5:
            q['explanation_image'] = get_base64_image("quiz_images/week_7_p2_img1.png")
        elif week_num == 8 and q['q_number'] == 8:
            q['image'] = get_base64_image("quiz_images/week_8_p2_img1.png")
            
    return questions

all_questions = []
for f in all_files:
    qs = extract_week(f)
    all_questions.extend(qs)

print(f"Total processed: {len(all_questions)}")

# Write to questions.json
with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

# Write to questions_data.js for easy client-side loading without CORS issues
with open('questions_data.js', 'w', encoding='utf-8') as f:
    f.write("// Auto-generated from Weeks 1-12 Solution PDFs\n")
    f.write("window.ALL_QUESTIONS = ")
    json.dump(all_questions, f, ensure_ascii=False)
    f.write(";\n")

print("Successfully wrote questions.json and questions_data.js!")
