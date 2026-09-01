import json
import csv
import re

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

def sanitize_string(s):
    if not s:
        return ""
    # Remove \ufffd (replacement character) and control characters
    s = s.replace("\ufffd", "").replace("", "")
    # Remove non-printable control chars except spaces
    s = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', s)
    # Fix multiple spaces
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def fix_portuguese_accents(s):
    s = sanitize_string(s)
    if not s:
        return ""
        
    # Ordinal numbers
    s = re.sub(r'\b1\b', '1ª', s)
    s = re.sub(r'\b2\b', '2ª', s)
    s = re.sub(r'\b3\b', '3ª', s)
    s = re.sub(r'\b4\b', '4ª', s)
    s = re.sub(r'\b5\b', '5ª', s)
    s = re.sub(r'\b6\b', '6ª', s)

    # Word fixes for school names and details
    replacements = [
        ("1 ESCOLA", "1ª ESCOLA"),
        ("2 ESCOLA", "2ª ESCOLA"),
        ("3 ESCOLA", "3ª ESCOLA"),
        ("4 ESCOLA", "4ª ESCOLA"),
        ("5 ESCOLA", "5ª ESCOLA"),
        ("6 ESCOLA", "6ª ESCOLA"),
        ("1 ANO", "1º ANO"),
        ("2 ANO", "2º ANO"),
        ("3 ANO", "3º ANO"),
        ("4 ANO", "4º ANO"),
        ("5 ANO", "5º ANO"),
        ("6 ANO", "6º ANO"),
        ("7 ANO", "7º ANO"),
        ("8 ANO", "8º ANO"),
        ("9 ANO", "9º ANO"),
        ("6 AO 9 ANO", "6º AO 9º ANO"),
        ("LUZINIA", "LUZIÂNIA"),
        ("LUZIANIA", "LUZIÂNIA"),
        ("ING", "INGÁ"),
        ("INGA", "INGÁ"),
        ("EDUCAO", "EDUCAÇÃO"),
        ("EDUCACAO", "EDUCAÇÃO"),
        ("PR-ESCOLA", "PRÉ-ESCOLA"),
        ("PRE-ESCOLA", "PRÉ-ESCOLA"),
        ("PRDIO", "PRÉDIO"),
        ("PREDIO", "PRÉDIO"),
        ("PRPRIO", "PRÓPRIO"),
        ("PROPRIO", "PRÓPRIO"),
        ("POO", "POÇO"),
        ("POCO", "POÇO"),
        ("SPTICA", "SÉPTICA"),
        ("SEPTICA", "SÉPTICA"),
        ("SERVIO", "SERVIÇO"),
        ("SERVICO", "SERVIÇO"),
        ("REUTILIZAO", "REUTILIZAÇÃO"),
        ("SEPARAO", "SEPARAÇÃO"),
        ("SEPARACAO", "SEPARAÇÃO"),
        ("LNGUA", "LÍNGUA"),
        ("LINGUA", "LÍNGUA"),
        ("INDGENA", "INDÍGENA"),
        ("INDIGENA", "INDÍGENA"),
        ("SELEO", "SELEÇÃO"),
        ("SELECAO", "SELEÇÃO"),
        ("ESPECFICOS", "ESPECÍFICOS"),
        ("ESPECIFICOS", "ESPECÍFICOS"),
        ("RGOS", "ÓRGÃOS"),
        ("ORGAOS", "ÓRGÃOS"),
        ("RGO", "ÓRGÃO"),
        ("ORGAO", "ÓRGÃO"),
        ("POLTICO", "POLÍTICO"),
        ("POLITICO", "POLÍTICO"),
        ("PEDAGGICO", "PEDAGÓGICO"),
        ("PEDAGOGICO", "PEDAGÓGICO"),
        ("PGINA", "PÁGINA"),
        ("PAGINA", "PÁGINA"),
        ("INTEGRAO", "INTEGRAÇÃO"),
        ("INTEGRACAO", "INTEGRAÇÃO"),
        ("SECRETRIO", "SECRETÁRIO"),
        ("SECRETARIO", "SECRETÁRIO"),
        ("SECRETRIA", "SECRETÁRIA"),
        ("SECRETARIA", "SECRETÁRIA"),
        ("AGENTE DE EDUCAO", "AGENTE DE EDUCAÇÃO"),
        ("AGENTE DE EDUCACAO", "AGENTE DE EDUCAÇÃO"),
        ("MATUTINO/MANH", "Matutino/Manhã"),
        ("VESPERTINO/TARDE", "Vespertino/Tarde"),
        ("NOTURNO/NOITE", "Noturno/Noite"),
        ("CDIGO", "CÓDIGO"),
        ("CODIGO", "CÓDIGO"),
        ("MUNICPIO", "MUNICÍPIO"),
        ("MUNICIPIO", "MUNICÍPIO"),
        ("CNDIDO", "CÂNDIDO"),
        ("CANDIDO", "CÂNDIDO"),
        ("CLUDIA", "CLÁUDIA"),
        ("CLAUDIA", "CLÁUDIA"),
        ("ANDR", "ANDRÉ"),
        ("ANDRE", "ANDRÉ"),
        ("MNICA", "MÔNICA"),
        ("MONICA", "MÔNICA"),
        ("ARAJO", "ARAÚJO"),
        ("ARAUJO", "ARAÚJO"),
        ("CLIA", "CÉLIA"),
        ("CELIA", "CÉLIA"),
        ("INCIO", "INÁCIO"),
        ("INACIO", "INÁCIO"),
        ("FRANA", "FRANÇA"),
        ("FRANCA", "FRANÇA"),
        ("CONCEIO", "CONCEIÇÃO"),
        ("CONCEICAO", "CONCEIÇÃO"),
        ("SEBASTIO", "SEBASTIÃO"),
        ("SEBASTIAO", "SEBASTIÃO"),
        ("JOS", "JOSÉ"),
        ("JOSE", "JOSÉ"),
        ("VALRIA", "VALÉRIA"),
        ("VALERIA", "VALÉRIA"),
        ("PROLA", "PÉROLA"),
        ("PEROLA", "PÉROLA"),
        ("LCIA", "LÚCIA"),
        ("LUCIA", "LÚCIA"),
        ("GARCIA", "GARCIA"),
        ("ESPRITA", "ESPÍRITA"),
        ("ESPIRITA", "ESPÍRITA"),
        ("EUGNIA", "EUGÊNIA"),
        ("EUGENIA", "EUGÊNIA"),
        ("MAURCIO", "MAURÍCIO"),
        ("MAURICIO", "MAURÍCIO"),
        ("BELM", "BELÉM"),
        ("FALCO", "FALCÃO"),
        ("FALCAO", "FALCÃO"),
        ("VELSO", "VELÔSO"),
        ("VELOSO", "VELÔSO"),
        ("NATLIA", "NATÁLIA"),
        ("NATALIA", "NATÁLIA"),
        ("LLIA", "LÍLIA"),
        ("LILIA", "LÍLIA"),
        ("CSSIA", "CÁSSIA"),
        ("CASSIA", "CÁSSIA"),
        ("MARCLIO", "MARCÍLIO"),
        ("MARCILIO", "MARCÍLIO"),
        ("MENDONA", "MENDONÇA"),
        ("MENDONCA", "MENDONÇA"),
        ("AGPITO", "AGÁPITO"),
        ("AGAPITO", "AGÁPITO"),
        ("HORTNCIA", "HORTÊNCIA"),
        ("HORTENCIA", "HORTÊNCIA"),
        ("FELCIO", "FELÁCIO"),
        ("FELACIO", "FELÁCIO"),
        ("PALHOA", "PALHOÇA"),
        ("PALHOCA", "PALHOÇA"),
        ("EDUCANDRIO", "EDUCANDÁRIO"),
        ("EDUCANDARIO", "EDUCANDÁRIO"),
        ("NAZAR", "NAZARÉ"),
        ("NAZARE", "NAZARÉ"),
        ("MANSES", "MANSÕES"),
        ("MANSOES", "MANSÕES"),
        ("PRAA", "PRAÇA"),
        ("PRACA", "PRAÇA"),
        ("AMRICA", "AMÉRICA"),
        ("AMERICA", "AMÉRICA"),
        ("SIMO", "SIMÃO"),
        ("SIMAO", "SIMÃO"),
        ("JOO", "JOÃO"),
        ("JOAO", "JOÃO"),
        ("GONALVES", "GONÇALVES"),
        ("GONCALVES", "GONÇALVES"),
        ("CMARA", "CÂMARA"),
        ("CAMARA", "CÂMARA"),
        ("ROSRIO", "ROSÁRIO"),
        ("ROSARIO", "ROSÁRIO"),
        ("POMPIA", "POMPÉIA"),
        ("POMPEIA", "POMPÉIA"),
        ("BRASLIA", "BRASÍLIA"),
        ("BRASILIA", "BRASÍLIA"),
        ("CARABAS", "CARAÍBAS"),
        ("CARAIBAS", "CARAÍBAS"),
        ("ZIO", "ÉZIO"),
        ("EZIO", "ÉZIO"),
    ]
    
    for old, new in replacements:
        s = s.replace(old, new)
        
    return s.strip()

escolas_map = {}

with open(filename, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=";")
    header = next(reader)
    
    for row in reader:
        if not row or not any(row):
            continue
            
        codigo_inep = fix_portuguese_accents(row[4])
        nome = fix_portuguese_accents(row[5])
        
        if not codigo_inep or not nome:
            continue
            
        if codigo_inep in escolas_map:
            continue
            
        nome_antigo = fix_portuguese_accents(row[6])
        classificacao = fix_portuguese_accents(row[9])
        ano_funcionamento = fix_portuguese_accents(row[10])
        rede = fix_portuguese_accents(row[11])
        
        cep = fix_portuguese_accents(row[22])
        uf = fix_portuguese_accents(row[23]) or "GO"
        cidade = fix_portuguese_accents(row[24]) or "LUZIÂNIA"
        logradouro = fix_portuguese_accents(row[25])
        complemento = fix_portuguese_accents(row[26])
        bairro = fix_portuguese_accents(row[27])
        distrito = fix_portuguese_accents(row[31])
        tipo_localizacao = fix_portuguese_accents(row[32]) or "Urbana"
        latitude = fix_portuguese_accents(row[35])
        longitude = fix_portuguese_accents(row[36])
        email = fix_portuguese_accents(row[37])
        telefone = fix_portuguese_accents(row[38])
        
        composicoes = fix_portuguese_accents(row[40])
        anos_escolares = fix_portuguese_accents(row[41])
        turnos = fix_portuguese_accents(row[42])
        forma_ocupacao = fix_portuguese_accents(row[63])
        
        gestor_nome = fix_portuguese_accents(row[98])
        gestor_cpf = fix_portuguese_accents(row[99])
        gestor_email = fix_portuguese_accents(row[100])
        gestor_telefone = fix_portuguese_accents(row[101])
        gestor_cargo = fix_portuguese_accents(row[102])
        
        secretario1_nome = fix_portuguese_accents(row[103])
        secretario1_cpf = fix_portuguese_accents(row[104])
        secretario1_email = fix_portuguese_accents(row[105])
        secretario1_telefone = fix_portuguese_accents(row[106])
        secretario1_cargo = fix_portuguese_accents(row[107])
        
        partes_end = [logradouro]
        if complemento and complemento.lower() != logradouro.lower():
            partes_end.append(complemento)
        if bairro:
            partes_end.append(bairro)
        partes_end.append(f"{cidade}/{uf}")
        if cep:
            partes_end.append(f"CEP: {cep}")
            
        endereco_completo = " - ".join([p for p in partes_end if p])
        
        id_escola = f"e-{codigo_inep}"
        
        escolas_map[codigo_inep] = {
            "id": id_escola,
            "nome": nome,
            "nome_antigo": nome_antigo,
            "codigo_inep": codigo_inep,
            "endereco": endereco_completo,
            "logradouro": logradouro,
            "complemento": complemento,
            "bairro": bairro,
            "cidade": cidade,
            "uf": uf,
            "cep": cep,
            "latitude": latitude,
            "longitude": longitude,
            "contato": telefone,
            "email": email,
            "gestor_nome": gestor_nome or "Não Informado",
            "gestor_cpf": gestor_cpf,
            "gestor_email": gestor_email,
            "gestor_telefone": gestor_telefone or telefone,
            "gestor_cargo": gestor_cargo or "PROFESSOR",
            "secretario1_nome": secretario1_nome,
            "secretario1_cpf": secretario1_cpf,
            "secretario1_email": secretario1_email,
            "secretario1_cargo": secretario1_cargo,
            "classificacao": classificacao,
            "ano_funcionamento": ano_funcionamento,
            "rede": rede,
            "tipo_localizacao": tipo_localizacao,
            "distrito": distrito,
            "composicoes": composicoes,
            "anos_escolares": anos_escolares,
            "turnos": turnos,
            "forma_ocupacao": forma_ocupacao,
            "status_processo": "nao_iniciado",
            "data_inicio_escolha": "2025-12-19T13:00:00-03:00"
        }

escolas_lista = list(escolas_map.values())
escolas_lista.sort(key=lambda x: x["nome"])

print(f"Total de escolas processadas: {len(escolas_lista)}")
for i, esc in enumerate(escolas_lista):
    print(f"{i+1:02d}. [INEP: {esc['codigo_inep']}] {esc['nome']} | Gestor: {esc['gestor_nome']} ({esc['gestor_email'] or esc['contato']})")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_cleaned.json", "w", encoding="utf-8") as out:
    json.dump(escolas_lista, out, ensure_ascii=False, indent=2)

