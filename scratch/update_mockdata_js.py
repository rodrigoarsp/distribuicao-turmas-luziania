import json
import re

json_file = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_71_perfect.json"
target_file = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/src/services/mockData.js"

with open(json_file, "r", encoding="utf-8") as f:
    escolas = json.load(f)

# Format JSON to JS code
js_escolas = json.dumps(escolas, ensure_ascii=False, indent=2)

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace INITIAL_ESCOLAS definition
pattern = r'export const INITIAL_ESCOLAS = \[[\s\S]*?\];'
new_export = f"export const INITIAL_ESCOLAS = {js_escolas};"

updated_content = re.sub(pattern, new_export, content)

# Update demo teachers, turmas, choices and logs to point to the first school in the new dataset
first_school_id = escolas[0]["id"] # e-52101894
updated_content = updated_content.replace("'e1111111-1111-1111-1111-111111111111'", f"'{first_school_id}'")

with open(target_file, "w", encoding="utf-8") as f:
    f.write(updated_content)

print(f"Successfully updated {target_file} with {len(escolas)} schools!")
