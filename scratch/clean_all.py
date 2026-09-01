import json
import csv

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

# Exact character repair dictionary for Portuguese words corrupted with '' or missing accents
def fix_text(s):
    if not s:
        return ""
    
    # Common character repairs
    s = s.replace("1", "1ª").replace("2", "2ª").replace("3", "3ª").replace("4", "4ª").replace("5", "5ª").replace("6", "6ª")
    s = s.replace("1º", "1º").replace("2º", "2º").replace("3º", "3º").replace("4º", "4º").replace("5º", "5º").replace("6º", "6º").replace("7º", "7º").replace("8º", "8º").replace("9º", "9º")
    
    replacements = [
        ("LUZINIA", "LUZIÂNIA"),
        ("LUZIANIA", "LUZIÂNIA"),
        ("CONVNIO", "CONVÊNIO"),
        ("POSSUI CONVNIO", "POSSUI CONVÊNIO"),
        ("CLASSIFICAO", "CLASSIFICAÇÃO"),
        ("CLASSIFICAO", "CLASSIFICAÇÃO"),
        ("CONDIO", "CONDIÇÃO"),
        ("CONDIO", "CONDIÇÃO"),
        ("INSTRUO", "INSTRUÇÃO"),
        ("INSTRUO", "INSTRUÇÃO"),
        ("SITUAO", "SITUAÇÃO"),
        ("SITUAO", "SITUAÇÃO"),
        ("NMERO", "NÚMERO"),
        ("NMERO", "NÚMERO"),
        ("LOCALIZAO", "LOCALIZAÇÃO"),
        ("LOCALIZAO", "LOCALIZAÇÃO"),
        ("RGOS", "ÓRGÃOS"),
        ("RGO", "ÓRGÃO"),
        ("RGOS", "ÓRGÃOS"),
        ("RGO", "ÓRGÃO"),
        ("ADMINISTRAO", "ADMINISTRAÇÃO"),
        ("INSTITUIES", "INSTITUIÇÕES"),
        ("REGULAMENTAO", "REGULAMENTAÇÃO"),
        ("AUTORIZAO", "AUTORIZAÇÃO"),
        ("VINCULADA ", "VINCULADA À"),
        ("TCNICO", "TÉCNICO"),
        ("INFORMTICA", "INFORMÁTICA"),
        ("PORTTEIS", "PORTÁTEIS"),
        ("PEDAGGICOS", "PEDAGÓGICOS"),
        ("PRDIO", "PRÉDIO"),
        ("PRPRIA", "PRÓPRIA"),
        ("PRPRIO", "PRÓPRIO"),
        ("PRPRIO", "PRÓPRIO"),
        ("OCUPAO", "OCUPAÇÃO"),
        ("DEVOLUO", "DEVOLUÇÃO"),
        ("DELIMITAO", "DELIMITAÇÃO"),
        ("REA", "ÁREA"),
        ("TELEVISO", "TELEVISÃO"),
        ("MULTIMDIA", "MULTIMÍDIA"),
        ("GUA", "ÁGUA"),
        ("ELTRICA", "ELÉTRICA"),
        ("SANITRIO", "SANITÁRIO"),
        ("DESTINAO", "DESTINAÇÃO"),
        ("RESDUOS", "RESÍDUOS"),
        ("SEPARAO", "SEPARAÇÃO"),
        ("REUTILIZAO", "REUTILIZAÇÃO"),
        ("CIRCULAO", "CIRCULAÇÃO"),
        ("DEFICINCIA", "DEFICIÊNCIA"),
        ("INDGENA", "INDÍGENA"),
        ("LNGUA", "LÍNGUA"),
        ("SELEO", "SELEÇÃO"),
        ("ESPECFICOS", "ESPECÍFICOS"),
        ("PGINA", "PÁGINA"),
        ("INTEGRAO", "INTEGRAÇÃO"),
        ("SECRETRIO", "SECRETÁRIO"),
        ("SECRETRIA", "SECRETÁRIA"),
        ("AGENTE DE EDUCAO", "AGENTE DE EDUCAÇÃO"),
        ("EDUCAO", "EDUCAÇÃO"),
        ("PRE-ESCOLA", "PRÉ-ESCOLA"),
        ("PR-ESCOLA", "PRÉ-ESCOLA"),
        ("MATUTINO/MANH", "Matutino/Manhã"),
        ("VESPERTINO/TARDE", "Vespertino/Tarde"),
        ("NOTURNO/NOITE", "Noturno/Noite"),
        ("CDIGO", "CÓDIGO"),
        ("MUNICPIO", "MUNICÍPIO"),
        ("CNDIDO", "CÂNDIDO"),
        ("CLUDIA", "CLÁUDIA"),
        ("ANDR", "ANDRÉ"),
        ("MNICA", "MÔNICA"),
        ("ARAJO", "ARAÚJO"),
        ("CLIA", "CÉLIA"),
        ("INCIO", "INÁCIO"),
        (" S ", " SÁ "),
        (" FRANA ", " FRANÇA "),
        ("CONCEIO", "CONCEIÇÃO"),
        ("SEBASTIO", "SEBASTIÃO"),
        (" JOS ", " JOSÉ "),
        ("VALRIA", "VALÉRIA"),
        ("PROLA", "PÉROLA"),
        (" LCIA ", " LÚCIA "),
        ("ESPRITA", "ESPÍRITA"),
        ("EUGNIA", "EUGÊNIA"),
        ("MAURCIO", "MAURÍCIO"),
        ("BELM", "BELÉM"),
        ("FALCO", "FALCÃO"),
        ("VELSO", "VELÔSO"),
        ("NATLIA", "NATÁLIA"),
        ("LLIA", "LÍLIA"),
        ("CSSIA", "CÁSSIA"),
        ("MARCLIO", "MARCÍLIO"),
        ("MENDONA", "MENDONÇA"),
        ("AGPITO", "AGÁPITO"),
        ("HORTNCIA", "HORTÊNCIA"),
        ("FELCIO", "FELÁCIO"),
        ("PALHOA", "PALHOÇA"),
        ("EDUCANDRIO", "EDUCANDÁRIO"),
        ("NAZAR", "NAZARÉ"),
        ("MANSES", "MANSÕES"),
        ("PRAA", "PRAÇA"),
        ("AMRICA", "AMÉRICA"),
        (" SO ", " SÃO "),
        (" F ", " FÉ "),
        (" TRS ", " TRÊS "),
        ("SIMO", "SIMÃO"),
        ("JOO", "JOÃO"),
        ("GONALVES", "GONÇALVES"),
        ("CMARA", "CÂMARA"),
        ("ROSRIO", "ROSÁRIO"),
        ("POMPIA", "POMPÉIA"),
        ("BRASLIA", "BRASÍLIA"),
        ("CARABAS", "CARAÍBAS"),
        ("ZIO", "ÉZIO"),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    return s.strip()

escolas_map = {}

with open(filename, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=";")
    header = next(reader)
    
    for idx, row in enumerate(reader):
        if not row or not any(row):
            continue
        
        codigo_inep = fix_text(row[4])
        nome = fix_text(row[5])
        if not codigo_inep or not nome:
            continue
            
        if codigo_inep in escolas_map:
            continue
            
        nome_antigo = fix_text(row[6])
        classificacao = fix_text(row[9])
        ano_funcionamento = fix_text(row[10])
        rede = fix_text(row[11])
        
        cep = fix_text(row[22])
        uf = fix_text(row[23]) or "GO"
        cidade = fix_text(row[24]) or "LUZIÂNIA"
        logradouro = fix_text(row[25])
        complemento = fix_text(row[26])
        bairro = fix_text(row[27])
        distrito = fix_text(row[31])
        tipo_localizacao = fix_text(row[32]) or "Urbana"
        latitude = fix_text(row[35])
        longitude = fix_text(row[36])
        email = fix_text(row[37])
        telefone = fix_text(row[38])
        
        composicoes = fix_text(row[40])
        anos_escolares = fix_text(row[41])
        turnos = fix_text(row[42])
        forma_ocupacao = fix_text(row[63])
        
        gestor_nome = fix_text(row[98])
        gestor_cpf = fix_text(row[99])
        gestor_email = fix_text(row[100])
        gestor_telefone = fix_text(row[101])
        gestor_cargo = fix_text(row[102])
        
        secretario1_nome = fix_text(row[103])
        secretario1_cpf = fix_text(row[104])
        secretario1_email = fix_text(row[105])
        secretario1_telefone = fix_text(row[106])
        secretario1_cargo = fix_text(row[107])
        
        partes_end = [logradouro]
        if complemento and complemento.lower() != logradouro.lower():
            partes_end.append(complemento)
        if bairro:
            partes_end.append(bairro)
        partes_end.append(f"{cidade}/{uf}")
        if cep:
            partes_end.append(f"CEP: {cep}")
            
        endereco_completo = " - ".join([p for p in partes_end if p])
        
        # ID determinístico por INEP
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

print(f"Total de escolas cadastradas com sucesso: {len(escolas_lista)}")
for i, esc in enumerate(escolas_lista):
    print(f"{i+1:02d}. [INEP {esc['codigo_inep']}] {esc['nome']} | Gestor: {esc['gestor_nome']} ({esc['gestor_email'] or esc['contato']})")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_cleaned.json", "w", encoding="utf-8") as out:
    json.dump(escolas_lista, out, ensure_ascii=False, indent=2)

