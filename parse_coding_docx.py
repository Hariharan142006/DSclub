import sys
import json
import docx

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\antigravity\DS club\public\Python_Coding_Challenges_11_30_35_Points.docx'
doc = docx.Document(file_path)

challenges = []
current_challenge = None
current_section = None
current_test_case = None

# A helper to extract table text
def get_table_text(element):
    table = docx.table.Table(element, doc)
    rows = []
    for row in table.rows:
        cells = [cell.text.strip().replace('\n', ' ') for cell in row.cells]
        rows.append(cells)
    return rows

for element in doc.element.body:
    if element.tag.endswith('p'):
        p = docx.text.paragraph.Paragraph(element, doc)
        text = p.text.strip()
        if not text: continue
        
        # New challenge heuristic: Number dot Title
        import re
        match = re.match(r'^(\d{2})\.\s+(.+)', text)
        if match:
            if current_challenge:
                if current_test_case:
                    current_challenge['testCases'].append(current_test_case)
                    current_test_case = None
                challenges.append(current_challenge)
            
            num = int(match.group(1))
            current_challenge = {
                'title': match.group(2),
                'difficulty': 'Medium' if num <= 20 else 'Hard',
                'points': 35,
                'description': '',
                'problemStatement': '',
                'sampleInput': '',
                'sampleOutput': '',
                'testCases': []
            }
            current_section = None
            current_test_case = None
            continue
            
        if 'Code Problem Details' in text:
            current_section = 'details'
        elif 'Sample Input' in text:
            current_section = 'sampleInput'
        elif 'Sample Output' in text:
            current_section = 'sampleOutput'
        elif 'Test Case #' in text:
            if current_test_case:
                current_challenge['testCases'].append(current_test_case)
            current_test_case = {'input': '', 'expectedOutput': '', 'isHidden': False}
            current_section = 'testCase'
        elif 'Input' == text and current_test_case is not None:
            current_section = 'testCaseInput'
        elif 'Expected Output' == text and current_test_case is not None:
            current_section = 'testCaseOutput'

    elif element.tag.endswith('tbl'):
        if not current_challenge:
            continue
            
        table_rows = get_table_text(element)
        
        # Determine what to do based on current_section
        if not current_section:
            # Metadata table
            for row in table_rows:
                if len(row) >= 2:
                    k, v = row[0], row[1]
                    if 'Brief Description' in k:
                        current_challenge['description'] = v
        elif current_section == 'details':
            for row in table_rows:
                if len(row) >= 2 and 'Full Problem Statement' in row[0]:
                    current_challenge['problemStatement'] = row[1]
        elif current_section == 'sampleInput':
            current_challenge['sampleInput'] = '\n'.join(row[0] for row in table_rows if row)
        elif current_section == 'sampleOutput':
            current_challenge['sampleOutput'] = '\n'.join(row[0] for row in table_rows if row)
        elif current_section == 'testCase':
            # Hidden Test Case table
            for row in table_rows:
                if row and 'Yes' in row[-1]:
                    current_test_case['isHidden'] = True
        elif current_section == 'testCaseInput':
            current_test_case['input'] = '\n'.join(row[0] for row in table_rows if row)
        elif current_section == 'testCaseOutput':
            current_test_case['expectedOutput'] = '\n'.join(row[0] for row in table_rows if row)

if current_challenge:
    if current_test_case:
        current_challenge['testCases'].append(current_test_case)
    challenges.append(current_challenge)

with open('seed_coding.json', 'w', encoding='utf-8') as f:
    json.dump(challenges, f, indent=2)

print(f"Extracted {len(challenges)} coding challenges.")
