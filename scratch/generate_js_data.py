import csv
import json
import re

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

def clean_text(s):
    if not s:
        return ""
    # Remove control chars and replacement char
    s = s.replace("\ufffd", "").replace("", "")
    s = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def fix_school_name(nome):
    nome = clean_text(nome)
    # Fix common Portuguese misspellings / encoding glitches
    repls = [
        ("1 ESCOLA", "1ª ESCOLA"),
        ("2 ESCOLA", "2ª ESCOLA"),
        ("3 ESCOLA", "3ª ESCOLA"),
        ("4 ESCOLA", "4ª ESCOLA"),
        ("5 ESCOLA", "5ª ESCOLA"),
        ("6 ESCOLA", "6ª ESCOLA"),
        ("1 ", "1ª "),
        ("2 ", "2ª "),
        ("3 ", "3ª "),
        ("4 ", "4ª "),
        ("5 ", "5ª "),
        ("6 ", "6ª "),
        ("JOSES", "JOSÉ"),
        ("JOS", "JOSÉ"),
        ("JOSE", "JOSÉ"),
        ("MARCLAIO", "MARCÍLIO"),
        ("MARCLIO", "MARCÍLIO"),
        ("MARCILIO", "MARCÍLIO"),
        ("ALDA VIEIRA DE SOUZA MINGONE I", "CMEB Alda Vieira de Souza Mingone I"),
        ("ALZIRA ELVIRA XAVIER", "CMEB Alzira Elvira Xavier"),
        ("ANDR ROCHAIS", "CMEB André Rochais"),
        ("ANDRE ROCHAIS", "CMEB André Rochais"),
        ("CARLOS ALBERTO BRANDAO FERREIRA", "CMEB Carlos Alberto Brandão Ferreira"),
        ("CORA CORALINA", "CMEB Cora Coralina"),
        ("DOM AGOSTINHO", "CMEB Dom Agostinho"),
        ("DOM BOSCO", "CMEB Dom Bosco"),
        ("DONA GENI DA COSTA AFONSO", "CMEB Dona Geni da Costa Afonso"),
        ("DONA NINA", "CMEB Dona Nina"),
        ("ELEUZA APARECIDA DE PAIVA NETO", "CMEB Eleuza Aparecida de Paiva Neto"),
        ("ESPIRITA GILSON DE MENDONCA HENRIQUES", "CMEB Espírita Gilson de Mendonça Henriques"),
        ("FRANCISCO VIEIRA LINS NALDO", "CMEB Francisco Vieira Lins Naldo"),
        ("GETULIO JOSE DA COSTA", "CMEB Getúlio José da Costa"),
        ("KELLY SUSAN SANTOS", "CMEB Kelly Susan Santos"),
        ("LAUDIMIRO RORIZ", "CMEB Laudimiro Roriz"),
        ("MANOEL FERNANDES VIEIRA", "CMEB Manoel Fernandes Vieira"),
        ("MARCILIO DIAS", "CMEB Marcílio Dias"),
        ("MARIA DE NONDAS", "CMEB Maria de Nondas"),
        ("MARIA LUCINDA LEITE", "CMEB Maria Lucinda Leite"),
        ("MARIA VERA LUCIA DE OLIVEIRA", "CMEB Maria Vera Lúcia de Oliveira"),
        ("MARIA VERA LCIA DE OLIVEIRA", "CMEB Maria Vera Lúcia de Oliveira"),
        ("NATALIA APARECIDA LOUZADA ALVES", "CMEB Natália Aparecida Louzada Alves"),
        ("NATALIA APARECIDA LOUZADA ALVES", "CMEB Natália Aparecida Louzada Alves"),
        ("PALHOCA PROFESSORA EDINIR CELESTE RORIZ LIMA", "CMEB Palhoça Professora Edinir Celeste Roriz Lima"),
        ("PALHOA PROFESSORA EDINIR CELESTE RORIZ LIMA", "CMEB Palhoça Professora Edinir Celeste Roriz Lima"),
        ("PROFESSOR BELIM", "CMEB Professor Belim"),
        ("PROFESSOR ISMAR GONCALVES", "CMEB Professor Ismar Gonçalves"),
        ("PROFESSOR ISMAR GONALVES", "CMEB Professor Ismar Gonçalves"),
        ("PROFESSOR JOAQUIM GILBERTO", "CMEB Professor Joaquim Gilberto"),
        ("PROFESSOR SEBASTIAO MACHADO DE ARAUJO", "CMEB Professor Sebastião Machado de Araújo"),
        ("PROFESSOR SEBASTIO MACHADO DE ARAUJO", "CMEB Professor Sebastião Machado de Araújo"),
        ("PROFESSORA ANA REIS MEIRELES DONA TIZINHA CREJA", "CMEB Professora Ana Reis Meireles Dona Tizinha (CREJA)"),
        ("PROFESSORA EVA MARRA ROCHA", "CMEB Professora Eva Marra Rocha"),
        ("PROFESSORA GERALDA DIVINA LOPES NETO", "CMEB Professora Geralda Divina Lopes Neto"),
        ("PROFESSORA ILKA MEIRELES DE MATOS", "CMEB Professora Ilka Meireles de Matos"),
        ("PROFESSORA JOANA DARC MACIEL DE LELES", "CMEB Professora Joana D'Arc Maciel de Leles"),
        ("PROFESSORA MARIA CLARICE MEIRELES DE QUEIROZ", "CMEB Professora Maria Clarice Meireles de Queiroz"),
        ("PROFESSORA MARLENE FLORES DE ARAUJO", "CMEB Professora Marlene Flores de Araújo"),
        ("RAMIRO AGUIAR", "CMEB Ramiro Aguiar"),
        ("RITA GONCALVES DE FARIA", "CMEB Rita Gonçalves de Faria"),
        ("RITA GONALVES DE FARIA", "CMEB Rita Gonçalves de Faria"),
        ("SAO MATEUS", "CMEB São Mateus"),
        ("SILAS SANTOS JUNIOR", "CMEB Silas Santos Júnior"),
        ("ANTONIO SEBASTIAO DA SILVA", "CMEI Antônio Sebastião da Silva"),
        ("ANTONIO SEBASTIO DA SILVA", "CMEI Antônio Sebastião da Silva"),
        ("CARLINDA ROSA DE BARROS MACHADO", "CMEI Carlinda Rosa de Barros Machado"),
        ("CELIA DOS SANTOS DE OLIVEIRA DE JESUS", "CMEI Célia dos Santos de Oliveira de Jesus"),
        ("CLUAUDIA ROSA GOMES PEIXOTO", "CMEI Cláudia Rosa Gomes Peixoto"),
        ("CLAUDIA ROSA GOMES PEIXOTO", "CMEI Cláudia Rosa Gomes Peixoto"),
        ("DEBORA GOMES DE AZEREDO", "CMEI Débora Gomes de Azeredo"),
        ("DONA LUZIA PEREIRA DOS SANTOS", "CMEI Dona Luzia Pereira dos Santos"),
        ("DONA NENZICA", "CMEI Dona Nenzica"),
        ("ESPEDITA FURTADO VIEIRA", "CMEI Espedita Furtado Vieira"),
        ("IVO JULIO MEIRELES", "CMEI Ivo Júlio Meireles"),
        ("JARDIM DO EDEN", "CMEI Jardim do Éden"),
        ("JOSE ANTONIO DA ROCHA", "CMEI José Antônio da Rocha"),
        ("LOURDES SALOMAO", "CMEI Lourdes Salomão"),
        ("LUIZA VELOSO FALCAO", "CMEI Luíza Velôso Falcão"),
        ("LUIZA VELSO FALCO", "CMEI Luíza Velôso Falcão"),
        ("PATRICIA PRADO MONTEIRO SEIXO DE BRITO", "CMEI Patrícia Prado Monteiro Seixo de Brito"),
        ("PEROLA MEIRELLES DE BRITO", "CMEI Pérola Meirelles de Brito"),
        ("PROLA MEIRELLES DE BRITO", "CMEI Pérola Meirelles de Brito"),
        ("PROFESSORA AGLAIA LIMA COSTA", "CMEI Professora Aglaia Lima Costa"),
        ("PROFESSORA LYDIA HERINGER EMERICK", "CMEI Professora Lydia Heringer Emerick"),
        ("PROFESSORA NELIA DE ALMEIDA RODRIGUES", "CMEI Professora Nélia de Almeida Rodrigues"),
        ("PROFESSORA NILZA RIBEIRO QUEIROZ", "CMEI Professora Nilza Ribeiro Queiroz"),
        ("PROFESSORA VALERIA DIAS", "CMEI Professora Valéria Dias"),
        ("PROFESSORA VALRIA DIAS", "CMEI Professora Valéria Dias"),
        ("PROFESSORA ZILDA DIAS", "CMEI Professora Zilda Dias"),
        ("WILLIANS VIEIRA DA SILVA", "CMEI Willians Vieira da Silva"),
        ("EDUCANDARIO ESPIRITA MARIA DE NAZARE", "Educandário Espírita Maria de Nazaré"),
        ("EDUCANDRIO ESPRITA MARIA DE NAZAR", "Educandário Espírita Maria de Nazaré"),
        ("EMEE EUGENIA CAMPOS COELHO", "EMEE Eugênia Campos Coelho"),
        ("EMEE EUGNIA CAMPOS COELHO", "EMEE Eugênia Campos Coelho"),
        ("EMEE PROFESSOR MAURICIO MOURA DA SILVA", "EMEE Professor Maurício Moura da Silva"),
        ("EMEE PROFESSOR MAURCIO MOURA DA SILVA", "EMEE Professor Maurício Moura da Silva"),
        ("ESCOLA MUNICIPAL DE TEMPO INTEGRAL ANTONIO FARIAS DE MESQUITA", "Escola Municipal de Tempo Integral Antônio Farias de Mesquita"),
        ("INSTITUTO DE EDUCACAO CRISTA ESTRELA DE BELEM", "Instituto de Educação Cristã Estrela de Belém"),
        ("1 ESCOLA MUNICIPAL DE TEMPO INTEGRAL LAUDIMIRIO DE JESUS TORMIN", "1ª Escola Municipal de Tempo Integral Laudimírio de Jesus Tormin"),
        ("1 ESCOLA POLO MUNICIPAL RURAL REALINO CAIXETA", "1ª Escola Polo Municipal Rural Realino Caixeta"),
        ("2 ESCOLA POLO MUNICIPAL RURAL SAMAMBAIA DARCY RIBEIRO", "2ª Escola Polo Municipal Rural Samambaia Darcy Ribeiro"),
        ("3 ESCOLA POLO MUNICIPAL RURAL ARARAS NAIR TIECHER", "3ª Escola Polo Municipal Rural Araras Nair Tiecher"),
        ("4 ESCOLA POLO MUNICIPAL RURAL DOS AMERICANOS", "4ª Escola Polo Municipal Rural dos Americanos"),
        ("4 ESCOLA POLO MUNICIPAL RURAL DOS AMRICANOS", "4ª Escola Polo Municipal Rural dos Americanos"),
        ("5 ESCOLA POLO MUNICIPAL RURAL HORTENCIA MARIA FELACIO", "5ª Escola Polo Municipal Rural Hortênsia Maria Felácio"),
        ("5 ESCOLA POLO MUNICIPAL RURAL HORTNCIA MARIA FELCIO", "5ª Escola Polo Municipal Rural Hortênsia Maria Felácio"),
        ("6 ESCOLA POLO MUNICIPAL RURAL JOSE RODRIGUES DOS REIS", "6ª Escola Polo Municipal Rural José Rodrigues dos Reis"),
        ("6 ESCOLA POLO MUNICIPAL RURAL JOS E RODRIGUES DOS REIS", "6ª Escola Polo Municipal Rural José Rodrigues dos Reis"),
    ]
    for old, new in repls:
        if old.lower() in nome.lower():
            nome = new
            break

    # General clean-up fallback
    nome = nome.replace("  ", " ").strip()
    return nome

escolas_by_inep = {}

with open(filename, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=";")
    header = next(reader)
    
    for row in reader:
        if not row or not any(row):
            continue
            
        raw_inep = clean_text(row[4])
        digits_inep = re.sub(r'\D', '', raw_inep)
        
        if not digits_inep or len(digits_inep) < 7:
            continue
            
        if digits_inep in escolas_by_inep:
            continue
            
        raw_nome = clean_text(row[5])
        nome_formatado = fix_school_name(raw_nome)
        nome_antigo = clean_text(row[6])
        tipo_unidade = clean_text(row[8])
        classificacao = clean_text(row[9])
        ano_func = clean_text(row[10])
        rede = clean_text(row[11])
        
        cep = clean_text(row[22])
        uf = clean_text(row[23]) or "GO"
        cidade = clean_text(row[24]) or "LUZIÂNIA"
        logradouro = clean_text(row[25])
        complemento = clean_text(row[26])
        bairro = clean_text(row[27])
        distrito = clean_text(row[31])
        tipo_loc = clean_text(row[32]) or "Urbana"
        lat = clean_text(row[35])
        lng = clean_text(row[36])
        email = clean_text(row[37])
        telefone = clean_text(row[38])
        
        composicoes = clean_text(row[40])
        anos = clean_text(row[41])
        turnos = clean_text(row[42])
        ocupacao = clean_text(row[63])
        
        gestor_nome = clean_text(row[98])
        gestor_cpf = clean_text(row[99])
        gestor_email = clean_text(row[100])
        gestor_tel = clean_text(row[101])
        gestor_cargo = clean_text(row[102])
        
        sec1_nome = clean_text(row[103])
        sec1_cpf = clean_text(row[104])
        sec1_email = clean_text(row[105])
        sec1_tel = clean_text(row[106])
        sec1_cargo = clean_text(row[107])
        
        # Build address
        end_parts = [logradouro]
        if complemento and complemento.lower() != logradouro.lower():
            end_parts.append(complemento)
        if bairro:
            end_parts.append(bairro)
        end_parts.append(f"{cidade}/{uf}")
        if cep:
            end_parts.append(f"CEP: {cep}")
            
        endereco = " - ".join([p for p in end_parts if p])
        
        escolas_by_inep[digits_inep] = {
            "id": f"e-{digits_inep}",
            "nome": nome_formatado,
            "nome_oficial": raw_nome,
            "nome_antigo": nome_antigo,
            "codigo_inep": digits_inep,
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
            "secretario1_nome": sec1_nome,
            "secretario1_cpf": sec1_cpf,
            "secretario1_email": sec1_email,
            "secretario1_cargo": sec1_cargo,
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
        }

lista_escolas = list(escolas_by_inep.values())
lista_escolas.sort(key=lambda x: x["nome"])

print(f"Total de Escolas Únicas Encontradas: {len(lista_escolas)}")
print("\nLISTAGEM COMPLETA DAS 38 ESCOLAS:")
for i, esc in enumerate(lista_escolas, 1):
    print(f"{i:02d}. [INEP {esc['codigo_inep']}] {esc['nome']} - Bairro: {esc['bairro']} - Gestor: {esc['gestor_nome']}")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_38_clean.json", "w", encoding="utf-8") as out:
    json.dump(lista_escolas, out, ensure_ascii=False, indent=2)

