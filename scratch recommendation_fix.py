import json
import re

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_parsed.json", "r", encoding="utf-8") as f:
    escolas = json.load(f)

# Filter out empty or duplicate INEPs
by_inep = {}
for e in escolas:
    inep = e["codigo_inep"]
    if inep and inep not in by_inep:
        by_inep[inep] = e

print(f"Total unique INEPs: {len(by_inep)}")

def fix_pt_chars(s):
    if not s:
        return s
    
    # Common corruption fixes
    # 1. Words with  or 
    s = s.replace("1 ", "1ª ")
    s = s.replace("2 ", "2ª ")
    s = s.replace("3 ", "3ª ")
    s = s.replace("4 ", "4ª ")
    s = s.replace("5 ", "5ª ")
    s = s.replace("6 ", "6ª ")
    s = s.replace("1", "1ª")
    s = s.replace("2", "2ª")
    s = s.replace("3", "3ª")
    s = s.replace("4", "4ª")
    s = s.replace("5", "5ª")
    s = s.replace("6", "6ª")
    
    # Ordinal numbers in text
    s = re.sub(r'(\d+)', r'\1º', s)
    
    # Common words in data
    repls = {
        "LUZINIA": "LUZIÂNIA",
        "LUZIANIA": "LUZIÂNIA",
        "ING": "INGÁ",
        "INGA": "INGÁ",
        "EDUCAO": "EDUCAÇÃO",
        "EDUCACAO": "EDUCAÇÃO",
        "EJA": "EJA",
        "CMEB": "CMEB",
        "CMEI": "CMEI",
        "EMEE": "EMEE",
        "PR-ESCOLA": "PRÉ-ESCOLA",
        "PRE-ESCOLA": "PRÉ-ESCOLA",
        "PRDIO": "PRÉDIO",
        "PRPRIO": "PRÓPRIO",
        "POO": "POÇO",
        "SPTICA": "SÉPTICA",
        "SEPTICA": "SÉPTICA",
        "SERVIO": "SERVIÇO",
        "REUTILIZAO": "REUTILIZAÇÃO",
        "SEPARAO": "SEPARAÇÃO",
        "RECICLAGEM": "RECICLAGEM",
        "LNGUA": "LÍNGUA",
        "INDGENA": "INDÍGENA",
        "SELEO": "SELEÇÃO",
        "ESPECIFICOS": "ESPECÍFICOS",
        "RGOS": "ÓRGÃOS",
        "ORGAOS": "ÓRGÃOS",
        "POLTICO": "POLÍTICO",
        "PEDAGGICO": "PEDAGÓGICO",
        "PGINA": "PÁGINA",
        "INTEGRAO": "INTEGRAÇÃO",
        "ENTORNO": "ENTORNO",
        "SECRETRIO": "SECRETÁRIO",
        "SECRETRIA": "SECRETÁRIA",
        "AGENTE DE EDUCAO": "AGENTE DE EDUCAÇÃO",
        "PROFESSOR": "PROFESSOR",
        "CONSELHO ESCOLAR": "CONSELHO ESCOLAR",
        "MATUTINO/MANH": "Matutino/Manhã",
        "VESPERTINO/TARDE": "Vespertino/Tarde",
        "NOTURNO/NOITE": "Noturno/Noite",
        "INTEGRAL": "Integral",
        "URBANA": "Urbana",
        "RURAL": "Rural",
        "ÁREA": "ÁREA",
        "AREA": "ÁREA",
        "PRAA": "PRAÇA",
        "PRACA": "PRAÇA",
        "JESUS": "JESUS",
        "CNDIDO": "CÂNDIDO",
        "CANDIDO": "CÂNDIDO",
        "CLUDIA": "CLÁUDIA",
        "CLAUDIA": "CLÁUDIA",
        "ANDR": "ANDRÉ",
        "ANDRE": "ANDRÉ",
        "MNICA": "MÔNICA",
        "MONICA": "MÔNICA",
        "ARAJO": "ARAÚJO",
        "ARAUJO": "ARAÚJO",
        "CLIA": "CÉLIA",
        "CELIA": "CÉLIA",
        "INCIO": "INÁCIO",
        "INACIO": "INÁCIO",
        "S": "SÁ",
        "FRANA": "FRANÇA",
        "FRANCA": "FRANÇA",
        "CONCEIO": "CONCEIÇÃO",
        "NOGUEIRA": "NOGUEIRA",
        "SEBASTIO": "SEBASTIÃO",
        "SEBASTIAO": "SEBASTIÃO",
        "JOS": "JOSÉ",
        "JOSE": "JOSÉ",
        "VALRIA": "VALÉRIA",
        "VALERIA": "VALÉRIA",
        "PROLA": "PÉROLA",
        "PEROLA": "PÉROLA",
        "LCIA": "LÚCIA",
        "LUCIA": "LÚCIA",
        "GARCIA": "GARCIA",
        "ESPRITA": "ESPÍRITA",
        "ESPIRITA": "ESPÍRITA",
        "EUGNIA": "EUGÊNIA",
        "EUGENIA": "EUGÊNIA",
        "MAURCIO": "MAURÍCIO",
        "MAURICIO": "MAURÍCIO",
        "BELM": "BELÉM",
        "BELIM": "BELIM",
        "FALCO": "FALCÃO",
        "FALCAO": "FALCÃO",
        "VELSO": "VELÔSO",
        "VELOSO": "VELÔSO",
        "NATLIA": "NATÁLIA",
        "NATALIA": "NATÁLIA",
        "LLIA": "LÍLIA",
        "LILIA": "LÍLIA",
        "AZEVEDO": "AZEVEDO",
        "CSSIA": "CÁSSIA",
        "D'ARC": "D'ARC",
        "MARCLIO": "MARCÍLIO",
        "MARCILIO": "MARCÍLIO",
        "MENDONA": "MENDONÇA",
        "MENDONCA": "MENDONÇA",
        "AGPITO": "AGÁPITO",
        "AGAPITO": "AGÁPITO",
        "MARRA": "MARRA",
        "HORTNCIA": "HORTÊNCIA",
        "HORTENCIA": "HORTÊNCIA",
        "FELCIO": "FELÁCIO",
        "FELACIO": "FELÁCIO",
        "PALHOA": "PALHOÇA",
        "PALHOCA": "PALHOÇA",
        "EDUCANDRIO": "EDUCANDÁRIO",
        "EDUCANDARIO": "EDUCANDÁRIO",
        "NAZAR": "NAZARÉ",
        "NAZARE": "NAZARÉ",
        "MANSES": "MANSÕES",
        "MANSOES": "MANSÕES",
        "AMRICA": "AMÉRICA",
        "AMERICA": "AMÉRICA",
        "SO": "SÃO",
        "SAO": "SÃO",
        "F": "FÉ",
        "FE": "FÉ",
        "TRS": "TRÊS",
        "TRES": "TRÊS",
        "SIMO": "SIMÃO",
        "SIMAO": "SIMÃO",
        "JOO": "JOÃO",
        "JOAO": "JOÃO",
        "GONALVES": "GONÇALVES",
        "GONCALVES": "GONÇALVES",
        "CMARA": "CÂMARA",
        "CAMARA": "CÂMARA",
        "ROSRIO": "ROSÁRIO",
        "ROSARIO": "ROSÁRIO",
        "POMPIA": "POMPÉIA",
        "POMPEIA": "POMPÉIA",
        "BRASLIA": "BRASÍLIA",
        "BRASILIA": "BRASÍLIA",
        "KUBITSCHEK": "KUBITSCHEK",
        "CARABAS": "CARAÍBAS",
        "CARAIBAS": "CARAÍBAS",
        "ZIO": "ÉZIO",
        "EZIO": "ÉZIO",
    }
    
    for k, v in repls.items():
        s = s.replace(k, v)
        
    # Replace any remaining isolated  with proper accents if needed or clean up
    s = s.replace("", "")
    s = re.sub(r'\s+', ' ', s).strip()
    return s

final_list = []
for inep, school in by_inep.items():
    cleaned_school = {}
    for k, v in school.items():
        if isinstance(v, str):
            cleaned_school[k] = fix_pt_chars(v)
        else:
            cleaned_school[k] = v
    final_list.append(cleaned_school)

# Sort by name
final_list.sort(key=lambda x: x["nome"])

print("\n--- SAMPLE CLEANED SCHOOLS ---")
for s in final_list[:10]:
    print(f"INEP: {s['codigo_inep']} | Nome: {s['nome']} | Gestor: {s['gestor_nome']} | End: {s['endereco']}")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_final.json", "w", encoding="utf-8") as out:
    json.dump(final_list, out, ensure_ascii=False, indent=2)

