import csv
import json

filename = "c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/raw_escolas.csv"

escolas = []

with open(filename, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=";")
    header = next(reader)
    
    print(f"Header columns ({len(header)}): {header[:10]}")
    
    for idx, row in enumerate(reader):
        if not row or not any(row):
            continue
        
        # map fields
        # Column indices based on header:
        # 4: CODIGO INEP
        # 5: NOME
        # 6: NOME ANTIGO
        # 9: CLASSIFICAÇÃO DA ESCOLA
        # 10: ANO DE FUNCIONAMENTO
        # 11: REDE DE ENSINO
        # 22: CEP
        # 23: UF
        # 24: CIDADE
        # 25: LOGRADOURO
        # 26: COMPLEMENTO
        # 27: BAIRRO
        # 31: DISTRITO
        # 32: TIPO DE LOCALIZAÇÃO
        # 35: LATITUDE
        # 36: LONGITUDE
        # 37: EMAIL
        # 38: TELEFONE
        # 40: COMPOSIÇÕES DE ENSINO
        # 41: ANOS ESCOLARES
        # 42: TURNOS ATENDIDOS
        # 63: FORMA DE OCUPAÇÃO
        # 98: NOME DO DIRETOR
        # 99: CPF DO DIRETOR
        # 100: E-MAIL DO DIRETOR
        # 101: TELEFONE DO DIRETOR
        # 102: CARGO DO DIRETOR
        # 103: NOME DO SECRETÁRIO 1
        
        codigo_inep = row[4].strip() if len(row) > 4 else ""
        nome = row[5].strip() if len(row) > 5 else ""
        nome_antigo = row[6].strip() if len(row) > 6 else ""
        classificacao = row[9].strip() if len(row) > 9 else ""
        ano_funcionamento = row[10].strip() if len(row) > 10 else ""
        rede = row[11].strip() if len(row) > 11 else ""
        
        cep = row[22].strip() if len(row) > 22 else ""
        uf = row[23].strip() if len(row) > 23 else "GO"
        cidade = row[24].strip() if len(row) > 24 else "LUZIÂNIA"
        logradouro = row[25].strip() if len(row) > 25 else ""
        complemento = row[26].strip() if len(row) > 26 else ""
        bairro = row[27].strip() if len(row) > 27 else ""
        distrito = row[31].strip() if len(row) > 31 else ""
        tipo_localizacao = row[32].strip() if len(row) > 32 else "Urbana"
        latitude = row[35].strip() if len(row) > 35 else ""
        longitude = row[36].strip() if len(row) > 36 else ""
        email = row[37].strip() if len(row) > 37 else ""
        telefone = row[38].strip() if len(row) > 38 else ""
        
        composicoes = row[40].strip() if len(row) > 40 else ""
        anos_escolares = row[41].strip() if len(row) > 41 else ""
        turnos = row[42].strip() if len(row) > 42 else ""
        forma_ocupacao = row[63].strip() if len(row) > 63 else ""
        
        gestor_nome = row[98].strip() if len(row) > 98 else ""
        gestor_cpf = row[99].strip() if len(row) > 99 else ""
        gestor_email = row[100].strip() if len(row) > 100 else ""
        gestor_telefone = row[101].strip() if len(row) > 101 else ""
        gestor_cargo = row[102].strip() if len(row) > 102 else ""
        
        secretario1_nome = row[103].strip() if len(row) > 103 else ""
        secretario1_cpf = row[104].strip() if len(row) > 104 else ""
        secretario1_email = row[105].strip() if len(row) > 105 else ""
        secretario1_telefone = row[106].strip() if len(row) > 106 else ""
        secretario1_cargo = row[107].strip() if len(row) > 107 else ""
        
        # Assemble complete address
        partes_end = [logradouro]
        if complemento and complemento.lower() != logradouro.lower():
            partes_end.append(complemento)
        if bairro:
            partes_end.append(bairro)
        partes_end.append(f"{cidade}/{uf}")
        if cep:
            partes_end.append(f"CEP: {cep}")
            
        endereco_completo = " - ".join([p for p in partes_end if p])
        
        # ID generation
        id_escola = f"e-inep-{codigo_inep}"
        
        item = {
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
            "gestor_cargo": gestor_cargo or "DIRETOR(A)",
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
            "status_processo": "em_andamento" if idx % 4 == 0 else ("concluido" if idx % 3 == 0 else "nao_iniciado"),
            "data_inicio_escolha": "2025-12-19T13:00:00-03:00"
        }
        escolas.append(item)

print(f"Total escolas parsed: {len(escolas)}")

with open("c:/Users/rodri/.gemini/antigravity-ide/scratch/distribuicao-turmas-luziania/scratch/escolas_parsed.json", "w", encoding="utf-8") as out:
    json.dump(escolas, out, ensure_ascii=False, indent=2)

print("Saved to escolas_parsed.json successfully!")
