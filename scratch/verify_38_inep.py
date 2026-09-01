import csv
import json
import re

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

def clean(val):
    if not val:
        return ""
    val = val.replace("\ufffd", "").replace("", "").strip()
    val = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', val)
    val = re.sub(r'\s+', ' ', val).strip()
    return val

def beautify_name(text):
    text = clean(text)
    if not text:
        return ""
    
    # Fix 1, 2, 3, etc.
    text = re.sub(r'\b1\b', '1ª', text)
    text = re.sub(r'\b2\b', '2ª', text)
    text = re.sub(r'\b3\b', '3ª', text)
    text = re.sub(r'\b4\b', '4ª', text)
    text = re.sub(r'\b5\b', '5ª', text)
    text = re.sub(r'\b6\b', '6ª', text)
    
    # Common fixes
    repls = [
        ("1 ESCOLA MUNICIPAL DE TEMPO INTEGRAL LAUDIMIRIO DE JESUS TORMIN", "1ª Escola Municipal de Tempo Integral Laudimírio de Jesus Tormin"),
        ("1 ESCOLA POLO MUNICIPAL RURAL REALINO CAIXETA", "1ª Escola Polo Municipal Rural Realino Caixeta"),
        ("2 ESCOLA POLO MUNICIPAL RURAL SAMAMBAIA DARCY RIBEIRO", "2ª Escola Polo Municipal Rural Samambaia Darcy Ribeiro"),
        ("3 ESCOLA POLO MUNICIPAL RURAL ARARAS NAIR TIECHER", "3ª Escola Polo Municipal Rural Araras Nair Tiecher"),
        ("4 ESCOLA POLO MUNICIPAL RURAL DOS AMERICANOS", "4ª Escola Polo Municipal Rural dos Americanos"),
        ("5 ESCOLA POLO MUNICIPAL RURAL HORTENCIA MARIA FELACIO", "5ª Escola Polo Municipal Rural Hortênsia Maria Felácio"),
        ("6 ESCOLA POLO MUNICIPAL RURAL JOSE RODRIGUES DOS REIS", "6ª Escola Polo Municipal Rural José Rodrigues dos Reis"),
        ("CMEB ALDA VIEIRA DE SOUZA MINGONE I", "CMEB Alda Vieira de Souza Mingone I"),
        ("CMEB ALZIRA ELVIRA XAVIER", "CMEB Alzira Elvira Xavier"),
        ("CMEB ANDRE ROCHAIS", "CMEB André Rochais"),
        ("CMEB CARLOS ALBERTO BRANDAO FERREIRA", "CMEB Carlos Alberto Brandão Ferreira"),
        ("CMEB CORA CORALINA", "CMEB Cora Coralina"),
        ("CMEB DOM AGOSTINHO", "CMEB Dom Agostinho"),
        ("CMEB DOM BOSCO", "CMEB Dom Bosco"),
        ("CMEB DONA GENI DA COSTA AFONSO", "CMEB Dona Geni da Costa Afonso"),
        ("CMEB DONA NINA", "CMEB Dona Nina"),
        ("CMEB ELEUZA APARECIDA DE PAIVA NETO", "CMEB Eleuza Aparecida de Paiva Neto"),
        ("CMEB ESPIRITA GILSON DE MENDONCA HENRIQUES", "CMEB Espírita Gilson de Mendonça Henriques"),
        ("CMEB FRANCISCO VIEIRA LINS NALDO", "CMEB Francisco Vieira Lins Naldo"),
        ("CMEB GETULIO JOSE DA COSTA", "CMEB Getúlio José da Costa"),
        ("CMEB KELLY SUSAN SANTOS", "CMEB Kelly Susan Santos"),
        ("CMEB LAUDIMIRO RORIZ", "CMEB Laudimiro Roriz"),
        ("CMEB MANOEL FERNANDES VIEIRA", "CMEB Manoel Fernandes Vieira"),
        ("CMEB MARCILIO DIAS", "CMEB Marcílio Dias"),
        ("CMEB MARIA DE NONDAS", "CMEB Maria de Nondas"),
        ("CMEB MARIA LUCINDA LEITE", "CMEB Maria Lucinda Leite"),
        ("CMEB MARIA VERA LUCIA DE OLIVEIRA", "CMEB Maria Vera Lúcia de Oliveira"),
        ("CMEB NATALIA APARECIDA LOUZADA ALVES", "CMEB Natália Aparecida Louzada Alves"),
        ("CMEB PALHOCA PROFESSORA EDINIR CELESTE RORIZ LIMA", "CMEB Palhoça Professora Edinir Celeste Roriz Lima"),
        ("CMEB PROFESSOR BELIM", "CMEB Professor Belim"),
        ("CMEB PROFESSOR ISMAR GONCALVES", "CMEB Professor Ismar Gonçalves"),
        ("CMEB PROFESSOR JOAQUIM GILBERTO", "CMEB Professor Joaquim Gilberto"),
        ("CMEB PROFESSOR SEBASTIAO MACHADO DE ARAUJO", "CMEB Professor Sebastião Machado de Araújo"),
        ("CMEB PROFESSORA ANA REIS MEIRELES DONA TIZINHA CREJA", "CMEB Professora Ana Reis Meireles Dona Tizinha (CREJA)"),
        ("CMEB PROFESSORA EVA MARRA ROCHA", "CMEB Professora Eva Marra Rocha"),
        ("CMEB PROFESSORA GERALDA DIVINA LOPES NETO", "CMEB Professora Geralda Divina Lopes Neto"),
        ("CMEB PROFESSORA ILKA MEIRELES DE MATOS", "CMEB Professora Ilka Meireles de Matos"),
        ("CMEB PROFESSORA JOANA DARC MACIEL DE LELES", "CMEB Professora Joana D'Arc Maciel de Leles"),
        ("CMEB PROFESSORA MARIA CLARICE MEIRELES DE QUEIROZ", "CMEB Professora Maria Clarice Meireles de Queiroz"),
        ("CMEB PROFESSORA MARLENE FLORES DE ARAUJO", "CMEB Professora Marlene Flores de Araújo"),
        ("CMEB RAMIRO AGUIAR", "CMEB Ramiro Aguiar"),
        ("CMEB RITA GONCALVES DE FARIA", "CMEB Rita Gonçalves de Faria"),
        ("CMEB SAO MATEUS", "CMEB São Mateus"),
        ("CMEB SILAS SANTOS JUNIOR", "CMEB Silas Santos Júnior"),
        ("CMEI ANTONIO SEBASTIAO DA SILVA", "CMEI Antônio Sebastião da Silva"),
        ("CMEI CARLINDA ROSA DE BARROS MACHADO", "CMEI Carlinda Rosa de Barros Machado"),
        ("CMEI CELIA DOS SANTOS DE OLIVEIRA DE JESUS", "CMEI Célia dos Santos de Oliveira de Jesus"),
        ("CMEI CLAUDIA ROSA GOMES PEIXOTO", "CMEI Cláudia Rosa Gomes Peixoto"),
        ("CMEI DEBORA GOMES DE AZEREDO", "CMEI Débora Gomes de Azeredo"),
        ("CMEI DONA LUZIA PEREIRA DOS SANTOS", "CMEI Dona Luzia Pereira dos Santos"),
        ("CMEI DONA NENZICA", "CMEI Dona Nenzica"),
        ("CMEI ESPEDITA FURTADO VIEIRA", "CMEI Espedita Furtado Vieira"),
        ("CMEI IVO JULIO MEIRELES", "CMEI Ivo Júlio Meireles"),
        ("CMEI JARDIM DO EDEN", "CMEI Jardim do Éden"),
        ("CMEI JOSE ANTONIO DA ROCHA", "CMEI José Antônio da Rocha"),
        ("CMEI LOURDES SALOMAO", "CMEI Lourdes Salomão"),
        ("CMEI LUIZA VELOSO FALCAO", "CMEI Luíza Velôso Falcão"),
        ("CMEI PATRICIA PRADO MONTEIRO SEIXO DE BRITO", "CMEI Patrícia Prado Monteiro Seixo de Brito"),
        ("CMEI PEROLA MEIRELLES DE BRITO", "CMEI Pérola Meirelles de Brito"),
        ("CMEI PROFESSORA AGLAIA LIMA COSTA", "CMEI Professora Aglaia Lima Costa"),
        ("CMEI PROFESSORA LYDIA HERINGER EMERICK", "CMEI Professora Lydia Heringer Emerick"),
        ("CMEI PROFESSORA NELIA DE ALMEIDA RODRIGUES", "CMEI Professora Nélia de Almeida Rodrigues"),
        ("CMEI PROFESSORA NILZA RIBEIRO QUEIROZ", "CMEI Professora Nilza Ribeiro Queiroz"),
        ("CMEI PROFESSORA VALERIA DIAS", "CMEI Professora Valéria Dias"),
        ("CMEI PROFESSORA ZILDA DIAS", "CMEI Professora Zilda Dias"),
        ("CMEI WILLIANS VIEIRA DA SILVA", "CMEI Willians Vieira da Silva"),
        ("EDUCANDARIO ESPIRITA MARIA DE NAZARE", "Educandário Espírita Maria de Nazaré"),
        ("EMEE EUGENIA CAMPOS COELHO", "EMEE Eugênia Campos Coelho"),
        ("EMEE PROFESSOR MAURICIO MOURA DA SILVA", "EMEE Professor Maurício Moura da Silva"),
        ("ESCOLA MUNICIPAL DE TEMPO INTEGRAL ANTONIO FARIAS DE MESQUITA", "Escola Municipal de Tempo Integral Antônio Farias de Mesquita"),
        ("INSTITUTO DE EDUCACAO CRISTA ESTRELA DE BELEM", "Instituto de Educação Cristã Estrela de Belém")
    ]
    for old, new in repls:
        if old.lower() in text.lower():
            return new
            
    return text.title()

by_inep = {}

with open(filename, "r", encoding="utf-8") as f:
    text = f.read()

# Match INEP line blocks
blocks = re.split(r'\n(?=;;;;52\d{6};)', text)

for block in blocks:
    if not block.strip() or "DIRETORIA REGIONAL" in block:
        continue
        
    line_clean = block.replace("\n", " ").replace("\r", "")
    parts = line_clean.split(";")
    
    if len(parts) < 10:
        continue
        
    raw_inep = clean(parts[4])
    inep = re.sub(r'\D', '', raw_inep)
    
    if not inep or len(inep) != 8:
        continue
        
    if inep in by_inep:
        # keep richer block if already present
        continue
        
    nome_orig = clean(parts[5])
    nome = beautify_name(nome_orig)
    nome_antigo = clean(parts[6])
    tipo_unidade = clean(parts[8])
    classificacao = clean(parts[9])
    ano_func = clean(parts[10])
    rede = clean(parts[11])
    
    cep = clean(parts[22])
    uf = clean(parts[23]) or "GO"
    cidade = clean(parts[24]) or "LUZIÂNIA"
    logradouro = clean(parts[25])
    complemento = clean(parts[26])
    bairro = clean(parts[27])
    distrito = clean(parts[31])
    tipo_loc = clean(parts[32]) or "Urbana"
    lat = clean(parts[35])
    lng = clean(parts[36])
    email = clean(parts[37])
    telefone = clean(parts[38])
    
    composicoes = clean(parts[40])
    anos = clean(parts[41])
    turnos = clean(parts[42])
    ocupacao = clean(parts[63])
    
    # Gestor fields
    gestor_nome = clean(parts[98])
    gestor_cpf = clean(parts[99])
    gestor_email = clean(parts[100])
    gestor_tel = clean(parts[101])
    gestor_cargo = clean(parts[102])
    
    if gestor_nome:
        gestor_nome = gestor_nome.title()
    else:
        gestor_nome = "Não Informado"
        
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
    
    by_inep[inep] = {
        "id": f"e-{inep}",
        "nome": nome,
        "codigo_inep": inep,
        "endereco": endereco,
        "contato": telefone or gestor_tel or "(61) 3622-0000",
        "email": email,
        "gestor_nome": gestor_nome,
        "gestor_cpf": gestor_cpf,
        "gestor_email": gestor_email,
        "gestor_telefone": gestor_tel,
        "gestor_cargo": gestor_cargo or "Diretor(a)",
        "bairro": bairro,
        "cidade": cidade,
        "uf": uf,
        "cep": cep,
        "latitude": lat,
        "longitude": lng,
        "classificacao": classificacao,
        "tipo_unidade": tipo_unidade,
        "ano_funcionamento": ano_func,
        "rede": rede,
        "tipo_localizacao": tipo_loc,
        "turnos": turnos,
        "status_processo": "nao_iniciado",
        "data_inicio_escolha": "2025-12-19T13:00:00-03:00"
    }

escolas_final = list(by_inep.values())
escolas_final.sort(key=lambda x: x["nome"])

print(f"Total de Escolas Únicas Deduplicadas por INEP: {len(escolas_final)}")
for i, esc in enumerate(escolas_final, 1):
    print(f"{i:02d}. [INEP {esc['codigo_inep']}] {esc['nome']} | Gestor: {esc['gestor_nome']}")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_38_dedup.json", "w", encoding="utf-8") as out:
    json.dump(escolas_final, out, ensure_ascii=False, indent=2)

