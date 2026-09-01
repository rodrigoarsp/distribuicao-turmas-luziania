-- ==============================================================================
-- DADOS DE TESTE E DEMONSTRAÇÃO (SEED) - SME LUZIÂNIA
-- ==============================================================================

-- Inserção de Escolas de Luziânia
INSERT INTO public.escolas (id, nome, codigo_inep, endereco, contato, gestor_nome, status_processo, data_inicio_escolha)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'Escola Municipal Juscelino Kubitschek', '52012345', 'Rua 15, Bairro Rosário - Luziânia/GO', '(61) 3622-1001', 'Profa. Maria das Graças Silva', 'em_andamento', '2025-12-19 13:00:00-03'),
('e2222222-2222-2222-2222-222222222222', 'Escola Municipal Prof. José Roriz', '52054321', 'Av. Alfredo Nasser, Centro - Luziânia/GO', '(61) 3622-2002', 'Prof. Carlos Eduardo Lima', 'nao_iniciado', '2025-12-19 13:00:00-03'),
('e3333333-3333-3333-3333-333333333333', 'Escola Municipal Dep. Cleuvo de Oliveira', '52098765', 'Rua das Flores, Jardim Ingá - Luziânia/GO', '(61) 3623-3003', 'Profa. Ana Paula Santos', 'concluido', '2025-12-19 13:00:00-03');

-- Inserção de Professores para Escola JK (e1111111-1111-1111-1111-111111111111)
INSERT INTO public.professores (id, escola_id, nome, cpf, data_nascimento, data_admissao, carga_horaria, tipo_vinculo, faltas_injustificadas_2025, frequencia_alfamais_percentual, pontuacao_total, status_validacao)
VALUES
('p1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Ana Clara de Oliveira', '111.222.333-44', '1985-04-12', '2012-02-01', 40, 'efetivo', 0, 95.00, 485.50, 'validado'),
('p2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Roberto Carlos da Silva', '222.333.444-55', '1980-11-25', '2010-03-15', 40, 'efetivo', 0, 85.00, 420.00, 'validado'),
('p3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Fernanda Souza Lima', '333.444.555-66', '1992-08-30', '2018-08-10', 30, 'efetivo', 1, 92.50, 310.00, 'validado'),
('p4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'João Pedro Ferreira', '444.555.666-77', '1995-01-05', '2021-02-15', 20, 'contrato_temporario', 0, 90.00, 195.00, 'validado');

-- Inserção de Turmas para Escola JK
INSERT INTO public.turmas (id, escola_id, descricao, turno, tipo, eh_alfamais, ano_letivo, status)
VALUES
('t1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Pré I - Turma A', 'matutino', 'pre_i', true, 2026, 'ocupada'),
('t2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', '1º Ano - Turma B', 'matutino', '1_ano', true, 2026, 'disponivel'),
('t3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', '2º Ano - Turma A', 'vespertino', '2_ano', true, 2026, 'disponivel'),
('t4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', '4º Ano - Turma C', 'vespertino', '3_ano_5_ano', false, 2026, 'disponivel'),
('t5555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'EJA - Módulo I', 'noturno', 'eja', false, 2026, 'disponivel');

-- Escolha realizada de demonstração
INSERT INTO public.escolhas (id, escola_id, turma_id, professor_id, ordem_classificacao, turno_selecionado, status)
VALUES
('c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 1, 'matutino', 'confirmada');

-- Logs Iniciais de Auditoria
INSERT INTO public.logs (usuario_nome, usuario_perfil, acao, detalhes, ip)
VALUES
('Profa. Maria das Graças', 'gestor', 'Validação de Pontuação', '{"professor": "Ana Clara de Oliveira", "pontos": 485.5}', '189.120.45.12'),
('SME Admin', 'administrador', 'Cadastro de Escola', '{"escola": "Escola Municipal Juscelino Kubitschek"}', '201.54.122.90'),
('Sistema', 'tecnico', 'Cálculo Automático de Pontuação', '{"escola_id": "e1111111-1111-1111-1111-111111111111"}', '127.0.0.1');
