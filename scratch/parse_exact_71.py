import re
import json

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

def sanitize(s):
    if not s:
        return ""
    s = s.replace("\ufffd", "").replace("", "").strip()
    s = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def format_title(text):
    text = sanitize(text)
    if not text:
        return ""
    
    # Check if text is mostly uppercase
    words = text.split()
    formatted_words = []
    lowercase_words = {"de", "da", "do", "dos", "das", "e", "em", "para", "com", "a", "o"}
    uppercase_words = {"cmeb", "cmei", "emee", "eja", "jk", "df", "go", "inep", "br", "km", "iii", "ii", "i", "iv", "v", "vi", "vii", "viii", "ix", "x", "dial", "caic"}
    
    for i, word in enumerate(words):
        w_lower = word.lower()
        if w_lower in uppercase_words:
            formatted_words.append(word.upper())
        elif i > 0 and w_lower in lowercase_words:
            formatted_words.append(w_lower)
        else:
            formatted_words.append(word.capitalize())
            
    res = " ".join(formatted_words)
    # Fix ordinal numbers
    res = re.sub(r'\b1ª?\b', '1ª', res)
    res = re.sub(r'\b2ª?\b', '2ª', res)
    res = re.sub(r'\b3ª?\b', '3ª', res)
    res = re.sub(r'\b4ª?\b', '4ª', res)
    res = re.sub(r'\b5ª?\b', '5ª', res)
    res = re.sub(r'\b6ª?\b', '6ª', res)
    res = res.replace("D'arc", "D'Arc").replace("D'arc", "D'Arc")
    return res

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# Split blocks cleanly by INEP boundary
blocks = re.split(r'\n(?=;;;;52\d{6};)', content)

escolas_71 = []

for block in blocks:
    if not block.strip() or "DIRETORIA REGIONAL" in block:
        continue
        
    line_clean = block.replace("\n", " ").replace("\r", "")
    parts = line_clean.split(";")
    
    if len(parts) < 10:
        continue
        
    raw_inep = sanitize(parts[4])
    inep = re.sub(r'\D', '', raw_inep)
    
    if not inep or len(inep) != 8:
        continue
        
    nome_raw = sanitize(parts[5])
    nome_antigo = sanitize(parts[6])
    tipo_unidade = sanitize(parts[8])
    classificacao = sanitize(parts[9])
    ano_func = sanitize(parts[10])
    rede = sanitize(parts[11])
    
    cep = sanitize(parts[22])
    uf = sanitize(parts[23]) or "GO"
    cidade = sanitize(parts[24]) or "LUZIÂNIA"
    logradouro = sanitize(parts[25])
    complemento = sanitize(parts[26])
    bairro = sanitize(parts[27])
    distrito = sanitize(parts[31])
    tipo_loc = sanitize(parts[32]) or "Urbana"
    lat = sanitize(parts[35])
    lng = sanitize(parts[36])
    email = sanitize(parts[37])
    telefone = sanitize(parts[38])
    
    composicoes = sanitize(parts[40])
    anos = sanitize(parts[41])
    turnos = sanitize(parts[42])
    ocupacao = sanitize(parts[63])
    
    # Gestor fields
    gestor_nome = sanitize(parts[98])
    gestor_cpf = sanitize(parts[99])
    gestor_email = sanitize(parts[100])
    gestor_tel = sanitize(parts[101])
    gestor_cargo = sanitize(parts[102])
    
    # Secretários
    sec1_nome = sanitize(parts[103]) if len(parts) > 103 else ""
    sec1_cpf = sanitize(parts[104]) if len(parts) > 104 else ""
    sec1_email = sanitize(parts[105]) if len(parts) > 105 else ""
    sec1_tel = sanitize(parts[106]) if len(parts) > 106 else ""
    sec1_cargo = sanitize(parts[107]) if len(parts) > 107 else ""
    
    # Format name nicely
    nome_formatado = format_title(nome_raw)
    gestor_nome_fmt = gestor_nome.title() if gestor_nome else "Não Informado"
    sec1_nome_fmt = sec1_nome.title() if sec1_nome else ""
    
    # Format address
    address_parts = [logradouro]
    if complemento and complemento.lower() != logradouro.lower():
        address_parts.append(complemento)
    if bairro:
        address_parts.append(bairro)
    address_parts.append(f"{cidade}/{uf}")
    if cep:
        address_parts.append(f"CEP: {cep}")
        
    endereco = " - ".join([p for p in address_parts if p])
    
    escola_obj = {
        "id": f"e-{inep}",
        "nome": nome_formatado,
        "codigo_inep": inep,
        "endereco": endereco,
        "logradouro": logradouro,
        "complemento": complemento,
        "bairro": bairro,
        "cidade": cidade,
        "uf": uf,
        "cep": cep,
        "latitude": lat,
        "longitude": lng,
        "contato": telefone or gestor_tel or "(61) 3622-0000",
        "email": email or gestor_email,
        "gestor_nome": gestor_nome_fmt,
        "gestor_cpf": gestor_cpf,
        "gestor_email": gestor_email,
        "gestor_telefone": gestor_tel or telefone,
        "gestor_cargo": gestor_cargo or "PROFESSOR",
        "secretario_nome": sec1_nome_fmt,
        "secretario_cpf": sec1_cpf,
        "secretario_email": sec1_email,
        "secretario_telefone": sec1_tel,
        "secretario_cargo": sec1_cargo,
        "classificacao": classificacao,
        "tipo_unidade": tipo_unidade,
        "ano_funcionamento": ano_func,
        "rede": rede,
        "tipo_localizacao": tipo_loc,
        "turnos": turnos,
        "status_processo": "nao_iniciado",
        "data_inicio_escolha": "2025-12-19T13:00:00-03:00"
    }
    
    escolas_71.append(escola_obj)

escolas_71.sort(key=lambda x: x["nome"])

print(f"TOTAL ESCOLAS PROCESSADAS PERFEITAMENTE: {len(escolas_71)}")
for idx, e in enumerate(escolas_71, 1):
    print(f"{idx:02d}. [INEP: {e['codigo_inep']}] {e['nome']} | Gestor: {e['gestor_nome']} | Tel: {e['contato']}")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_71_perfect.json", "w", encoding="utf-8") as out:
    json.dump(escolas_71, out, ensure_ascii=False, indent=2)

