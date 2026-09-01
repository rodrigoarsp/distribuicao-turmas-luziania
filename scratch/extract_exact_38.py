import re
import json

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

with open(filename, "r", encoding="utf-8") as f:
    text = f.read()

# Find all blocks starting with ;;;;52xxxxxx;
blocks = re.split(r'\n(?=;;;;52\d{6};)', text)

print(f"Total blocks split: {len(blocks)}")

def sanitize(val):
    if not val:
        return ""
    val = val.replace("\ufffd", "").replace("", "").strip()
    val = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', val)
    return val

def format_school_name(n):
    n = sanitize(n)
    # Fix encoding glitches in Portuguese names
    n = n.replace("1", "1ª").replace("2", "2ª").replace("3", "3ª").replace("4", "4ª").replace("5", "5ª").replace("6", "6ª")
    n = n.replace("1º", "1º").replace("2º", "2º").replace("3º", "3º").replace("4º", "4º").replace("5º", "5º").replace("6º", "6º")
    
    # Fix specific school names
    fixes = {
        "1 ESCOLA MUNICIPAL DE TEMPO INTEGRAL LAUDIMIRIO DE JESUS TORMIN": "1ª Escola Municipal de Tempo Integral Laudimírio de Jesus Tormin",
        "1 ESCOLA POLO MUNICIPAL RURAL REALINO CAIXETA": "1ª Escola Polo Municipal Rural Realino Caixeta",
        "2 ESCOLA POLO MUNICIPAL RURAL SAMAMBAIA DARCY RIBEIRO": "2ª Escola Polo Municipal Rural Samambaia Darcy Ribeiro",
        "3 ESCOLA POLO MUNICIPAL RURAL ARARAS NAIR TIECHER": "3ª Escola Polo Municipal Rural Araras Nair Tiecher",
        "4 ESCOLA POLO MUNICIPAL RURAL DOS AMERICANOS": "4ª Escola Polo Municipal Rural dos Americanos",
        "5 ESCOLA POLO MUNICIPAL RURAL HORTENCIA MARIA FELACIO": "5ª Escola Polo Municipal Rural Hortênsia Maria Felácio",
        "6 ESCOLA POLO MUNICIPAL RURAL JOSE RODRIGUES DOS REIS": "6ª Escola Polo Municipal Rural José Rodrigues dos Reis",
        "CMEB ALDA VIEIRA DE SOUZA MINGONE I": "CMEB Alda Vieira de Souza Mingone I",
        "CMEB ALZIRA ELVIRA XAVIER": "CMEB Alzira Elvira Xavier",
        "CMEB ANDR ROCHAIS": "CMEB André Rochais",
        "CMEB ANDRE ROCHAIS": "CMEB André Rochais",
        "CMEB CARLOS ALBERTO BRANDAO FERREIRA": "CMEB Carlos Alberto Brandão Ferreira",
        "CMEB CORA CORALINA": "CMEB Cora Coralina",
        "CMEB DOM AGOSTINHO": "CMEB Dom Agostinho",
        "CMEB DOM BOSCO": "CMEB Dom Bosco",
        "CMEB DONA GENI DA COSTA AFONSO": "CMEB Dona Geni da Costa Afonso",
        "CMEB DONA NINA": "CMEB Dona Nina",
        "CMEB ELEUZA APARECIDA DE PAIVA NETO": "CMEB Eleuza Aparecida de Paiva Neto",
        "CMEB ESPIRITA GILSON DE MENDONCA HENRIQUES": "CMEB Espírita Gilson de Mendonça Henriques",
        "CMEB ESPRITA GILSON DE MENDONA HENRIQUES": "CMEB Espírita Gilson de Mendonça Henriques",
        "CMEB FRANCISCO VIEIRA LINS NALDO": "CMEB Francisco Vieira Lins Naldo",
        "CMEB GETULIO JOSE DA COSTA": "CMEB Getúlio José da Costa",
        "CMEB KELLY SUSAN SANTOS": "CMEB Kelly Susan Santos",
        "CMEB LAUDIMIRO RORIZ": "CMEB Laudimiro Roriz",
        "CMEB MANOEL FERNANDES VIEIRA": "CMEB Manoel Fernandes Vieira",
        "CMEB MARCILIO DIAS": "CMEB Marcílio Dias",
        "CMEB MARIA DE NONDAS": "CMEB Maria de Nondas",
        "CMEB MARIA LUCINDA LEITE": "CMEB Maria Lucinda Leite",
        "CMEB MARIA VERA LUCIA DE OLIVEIRA": "CMEB Maria Vera Lúcia de Oliveira",
        "CMEB MARIA VERA LCIA DE OLIVEIRA": "CMEB Maria Vera Lúcia de Oliveira",
        "CMEB NATALIA APARECIDA LOUZADA ALVES": "CMEB Natália Aparecida Louzada Alves",
        "CMEB NATLIA APARECIDA LOUZADA ALVES": "CMEB Natália Aparecida Louzada Alves",
        "CMEB PALHOCA PROFESSORA EDINIR CELESTE RORIZ LIMA": "CMEB Palhoça Professora Edinir Celeste Roriz Lima",
        "CMEB PALHOA PROFESSORA EDINIR CELESTE RORIZ LIMA": "CMEB Palhoça Professora Edinir Celeste Roriz Lima",
        "CMEB PROFESSOR BELIM": "CMEB Professor Belim",
        "CMEB PROFESSOR ISMAR GONCALVES": "CMEB Professor Ismar Gonçalves",
        "CMEB PROFESSOR ISMAR GONALVES": "CMEB Professor Ismar Gonçalves",
        "CMEB PROFESSOR JOAQUIM GILBERTO": "CMEB Professor Joaquim Gilberto",
        "CMEB PROFESSOR SEBASTIAO MACHADO DE ARAUJO": "CMEB Professor Sebastião Machado de Araújo",
        "CMEB PROFESSOR SEBASTIO MACHADO DE ARAUJO": "CMEB Professor Sebastião Machado de Araújo",
        "CMEB PROFESSORA ANA REIS MEIRELES DONA TIZINHA CREJA": "CMEB Professora Ana Reis Meireles Dona Tizinha (CREJA)",
        "CMEB PROFESSORA EVA MARRA ROCHA": "CMEB Professora Eva Marra Rocha",
        "CMEB PROFESSORA GERALDA DIVINA LOPES NETO": "CMEB Professora Geralda Divina Lopes Neto",
        "CMEB PROFESSORA ILKA MEIRELES DE MATOS": "CMEB Professora Ilka Meireles de Matos",
        "CMEB PROFESSORA JOANA DARC MACIEL DE LELES": "CMEB Professora Joana D'Arc Maciel de Leles",
        "CMEB PROFESSORA MARIA CLARICE MEIRELES DE QUEIROZ": "CMEB Professora Maria Clarice Meireles de Queiroz",
        "CMEB PROFESSORA MARLENE FLORES DE ARAUJO": "CMEB Professora Marlene Flores de Araújo",
        "CMEB RAMIRO AGUIAR": "CMEB Ramiro Aguiar",
        "CMEB RITA GONCALVES DE FARIA": "CMEB Rita Gonçalves de Faria",
        "CMEB RITA GONALVES DE FARIA": "CMEB Rita Gonçalves de Faria",
        "CMEB SAO MATEUS": "CMEB São Mateus",
        "CMEB SILAS SANTOS JUNIOR": "CMEB Silas Santos Júnior",
        "CMEI ANTONIO SEBASTIAO DA SILVA": "CMEI Antônio Sebastião da Silva",
        "CMEI ANTONIO SEBASTIO DA SILVA": "CMEI Antônio Sebastião da Silva",
        "CMEI CARLINDA ROSA DE BARROS MACHADO": "CMEI Carlinda Rosa de Barros Machado",
        "CMEI CELIA DOS SANTOS DE OLIVEIRA DE JESUS": "CMEI Célia dos Santos de Oliveira de Jesus",
        "CMEI CLAUDIA ROSA GOMES PEIXOTO": "CMEI Cláudia Rosa Gomes Peixoto",
        "CMEI DEBORA GOMES DE AZEREDO": "CMEI Débora Gomes de Azeredo",
        "CMEI DONA LUZIA PEREIRA DOS SANTOS": "CMEI Dona Luzia Pereira dos Santos",
        "CMEI DONA NENZICA": "CMEI Dona Nenzica",
        "CMEI ESPEDITA FURTADO VIEIRA": "CMEI Espedita Furtado Vieira",
        "CMEI IVO JULIO MEIRELES": "CMEI Ivo Júlio Meireles",
        "CMEI JARDIM DO EDEN": "CMEI Jardim do Éden",
        "CMEI JOSE ANTONIO DA ROCHA": "CMEI José Antônio da Rocha",
        "CMEI JOS ANTONIO DA ROCHA": "CMEI José Antônio da Rocha",
        "CMEI LOURDES SALOMAO": "CMEI Lourdes Salomão",
        "CMEI LUIZA VELOSO FALCAO": "CMEI Luíza Velôso Falcão",
        "CMEI LUIZA VELSO FALCO": "CMEI Luíza Velôso Falcão",
        "CMEI PATRICIA PRADO MONTEIRO SEIXO DE BRITO": "CMEI Patrícia Prado Monteiro Seixo de Brito",
        "CMEI PEROLA MEIRELLES DE BRITO": "CMEI Pérola Meirelles de Brito",
        "CMEI PROLA MEIRELLES DE BRITO": "CMEI Pérola Meirelles de Brito",
        "CMEI PROFESSORA AGLAIA LIMA COSTA": "CMEI Professora Aglaia Lima Costa",
        "CMEI PROFESSORA LYDIA HERINGER EMERICK": "CMEI Professora Lydia Heringer Emerick",
        "CMEI PROFESSORA NELIA DE ALMEIDA RODRIGUES": "CMEI Professora Nélia de Almeida Rodrigues",
        "CMEI PROFESSORA NILZA RIBEIRO QUEIROZ": "CMEI Professora Nilza Ribeiro Queiroz",
        "CMEI PROFESSORA VALERIA DIAS": "CMEI Professora Valéria Dias",
        "CMEI PROFESSORA VALRIA DIAS": "CMEI Professora Valéria Dias",
        "CMEI PROFESSORA ZILDA DIAS": "CMEI Professora Zilda Dias",
        "CMEI WILLIANS VIEIRA DA SILVA": "CMEI Willians Vieira da Silva",
        "EDUCANDARIO ESPIRITA MARIA DE NAZARE": "Educandário Espírita Maria de Nazaré",
        "EDUCANDRIO ESPRITA MARIA DE NAZAR": "Educandário Espírita Maria de Nazaré",
        "EMEE EUGENIA CAMPOS COELHO": "EMEE Eugênia Campos Coelho",
        "EMEE EUGNIA CAMPOS COELHO": "EMEE Eugênia Campos Coelho",
        "EMEE PROFESSOR MAURICIO MOURA DA SILVA": "EMEE Professor Maurício Moura da Silva",
        "EMEE PROFESSOR MAURCIO MOURA DA SILVA": "EMEE Professor Maurício Moura da Silva",
        "ESCOLA MUNICIPAL DE TEMPO INTEGRAL ANTONIO FARIAS DE MESQUITA": "Escola Municipal de Tempo Integral Antônio Farias de Mesquita",
        "INSTITUTO DE EDUCACAO CRISTA ESTRELA DE BELEM": "Instituto de Educação Cristã Estrela de Belém",
    }
    
    for k, v in fixes.items():
        if k.lower() in n.lower():
            return v
    return n

escolas_list = []

for block in blocks:
    if not block.strip() or "DIRETORIA REGIONAL" in block:
        continue
    
    # replace newlines inside fields with spaces
    single_line = block.replace("\n", " ").replace("\r", "")
    parts = single_line.split(";")
    
    if len(parts) < 10:
        continue
        
    codigo_inep = sanitize(parts[4])
    if not codigo_inep or not codigo_inep.isdigit():
        continue
        
    nome_raw = sanitize(parts[5])
    nome = format_school_name(nome_raw)
    nome_antigo = sanitize(parts[6])
    unidade_consumidora = sanitize(parts[7])
    tipo_unidade = sanitize(parts[8])
    classificacao = sanitize(parts[9])
    ano_func = sanitize(parts[10])
    rede = sanitize(parts[11])
    
    cep = sanitize(parts[22]) if len(parts) > 22 else ""
    uf = sanitize(parts[23]) if len(parts) > 23 else "GO"
    cidade = sanitize(parts[24]) if len(parts) > 24 else "LUZIÂNIA"
    logradouro = sanitize(parts[25]) if len(parts) > 25 else ""
    complemento = sanitize(parts[26]) if len(parts) > 26 else ""
    bairro = sanitize(parts[27]) if len(parts) > 27 else ""
    distrito = sanitize(parts[31]) if len(parts) > 31 else ""
    tipo_loc = sanitize(parts[32]) if len(parts) > 32 else "Urbana"
    lat = sanitize(parts[35]) if len(parts) > 35 else ""
    lng = sanitize(parts[36]) if len(parts) > 36 else ""
    email = sanitize(parts[37]) if len(parts) > 37 else ""
    telefone = sanitize(parts[38]) if len(parts) > 38 else ""
    
    composicoes = sanitize(parts[40]) if len(parts) > 40 else ""
    anos = sanitize(parts[41]) if len(parts) > 41 else ""
    turnos = sanitize(parts[42]) if len(parts) > 42 else ""
    ocupacao = sanitize(parts[63]) if len(parts) > 63 else ""
    
    gestor_nome = sanitize(parts[98]) if len(parts) > 98 else ""
    gestor_cpf = sanitize(parts[99]) if len(parts) > 99 else ""
    gestor_email = sanitize(parts[100]) if len(parts) > 100 else ""
    gestor_tel = sanitize(parts[101]) if len(parts) > 101 else ""
    gestor_cargo = sanitize(parts[102]) if len(parts) > 102 else ""
    
    # format address
    end_parts = [logradouro]
    if complemento and complemento.lower() != logradouro.lower():
        end_parts.append(complemento)
    if bairro:
        end_parts.append(bairro)
    end_parts.append(f"{cidade}/{uf}")
    if cep:
        end_parts.append(f"CEP: {cep}")
        
    endereco = " - ".join([p for p in end_parts if p])
    
    escolas_list.append({
        "id": f"e-{codigo_inep}",
        "nome": nome,
        "nome_oficial": nome_raw,
        "nome_antigo": nome_antigo,
        "codigo_inep": codigo_inep,
        "endereco": endereco,
        "logradouro": logradouro,
        "complemento": complemento,
        "bairro": bairro,
        "cidade": cidade,
        "uf": uf,
        "cep": cep,
        "latitude": lat,
        "longitude": lng,
        "contato": telefone,
        "email": email,
        "gestor_nome": gestor_nome or "Não Informado",
        "gestor_cpf": gestor_cpf,
        "gestor_email": gestor_email,
        "gestor_telefone": gestor_tel or telefone,
        "gestor_cargo": gestor_cargo or "PROFESSOR",
        "classificacao": classificacao,
        "tipo_unidade": tipo_unidade,
        "ano_funcionamento": ano_func,
        "rede": rede,
        "tipo_localizacao": tipo_loc,
        "distrito": distrito,
        "composicoes": composicoes,
        "anos_escolares": anos,
        "turnos": turnos,
        "forma_ocupacao": ocupacao,
        "status_processo": "nao_iniciado",
        "data_inicio_escolha": "2025-12-19T13:00:00-03:00"
    })

# Deduplicate by INEP
unique_dict = {}
for e in escolas_list:
    unique_dict[e["codigo_inep"]] = e

unique_schools = list(unique_dict.values())
unique_schools.sort(key=lambda x: x["nome"])

print(f"\n=======================================================")
print(f"TOTAL EXACT SCHOOLS EXTRACTED: {len(unique_schools)}")
print(f"=======================================================\n")

for idx, e in enumerate(unique_schools, 1):
    print(f"{idx:02d}. [INEP {e['codigo_inep']}] {e['nome']} | Bairro: {e['bairro']} | Gestor: {e['gestor_nome']} ({e['contato']})")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_38_final.json", "w", encoding="utf-8") as out:
    json.dump(unique_schools, out, ensure_ascii=False, indent=2)

