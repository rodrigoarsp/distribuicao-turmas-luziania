-- ==============================================================================
-- SISTEMA DE DISTRIBUIÇÃO DE TURMAS - SME LUZIÂNIA (PORTARIA Nº 947/2025)
-- Esquema de Banco de Dados para Supabase (PostgreSQL com Row Level Security)
-- ==============================================================================

-- Habilitar extensão para geração de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE ESCOLAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escolas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    codigo_inep VARCHAR(20),
    endereco TEXT,
    contato TEXT,
    gestor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    gestor_nome VARCHAR(255),
    status_processo VARCHAR(30) DEFAULT 'nao_iniciado' CHECK (status_processo IN ('nao_iniciado', 'em_andamento', 'concluido')),
    data_inicio_escolha TIMESTAMPTZ DEFAULT '2025-12-19 13:00:00-03',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PROFESSORES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE NOT NULL,
    data_admissao DATE NOT NULL,
    carga_horaria INT NOT NULL CHECK (carga_horaria IN (20, 30, 40)),
    tipo_vinculo VARCHAR(50) NOT NULL CHECK (tipo_vinculo IN ('efetivo', 'contrato_temporario', 'comissionado')),
    faltas_injustificadas_2025 INT DEFAULT 0,
    frequencia_alfamais_percentual NUMERIC(5,2) DEFAULT 0.00, -- Para prioridade AlfaMais (≥ 90%)
    pontuacao_total NUMERIC(10,2) DEFAULT 0.00,
    pontuacao_detalhada JSONB DEFAULT '{}'::jsonb,
    justificativa_validacao TEXT,
    status_validacao VARCHAR(20) DEFAULT 'pendente' CHECK (status_validacao IN ('pendente', 'validado', 'necessita_correcao')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HISTÓRICO DE REGÊNCIAS (SEÇÃO I DA PORTARIA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('efetivo_rede', 'efetivo_unidade', 'contrato_temporario', 'cargo_sme')),
    ano INT NOT NULL,
    carga_horaria INT NOT NULL CHECK (carga_horaria IN (20, 30, 40)),
    dias_trabalhados INT NOT NULL DEFAULT 180, -- 180+ dias = 1 ano completo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PUBLICAÇÕES (SEÇÃO II DA PORTARIA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica_pedagogica', 'artigo_issn', 'livro_isbn')),
    titulo TEXT NOT NULL,
    comprovante_url TEXT,
    pontos INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. FORMAÇÃO PEDAGÓGICA E CONTINUADA (SEÇÕES III, IV E V)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.formacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'lato_sensu', 'mestrado', 'doutorado', 'alfamais', 'alfabetizacao', 'ed_infantil', 'ed_especial', 'sintego', etc.
    nome_curso TEXT NOT NULL,
    carga_horaria INT DEFAULT 0,
    modalidade VARCHAR(20) CHECK (modalidade IN ('presencial', 'semipresencial', 'ead')),
    ano_conclusao INT,
    instituicao VARCHAR(255),
    comprovante_url TEXT,
    pontos_calculados NUMERIC(8,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. AVALIAÇÃO DE DESEMPENHO (SEÇÃO VI DA PORTARIA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
    ano INT NOT NULL,
    percentual NUMERIC(5,2) NOT NULL CHECK (percentual >= 0 AND percentual <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. TABELA DE TURMAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.turmas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
    descricao VARCHAR(100) NOT NULL, -- ex: "1º Ano A", "Pré II B", "5º Ano C"
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('matutino', 'vespertino', 'noturno')),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('pre_i', 'pre_ii', '1_ano', '2_ano', '3_ano_5_ano', 'eja', 'educacao_especial')),
    eh_alfamais BOOLEAN DEFAULT FALSE,
    ano_letivo INT DEFAULT 2026,
    status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'ocupada', 'reservada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. REGISTRO DE ESCOLHAS DE TURMAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escolhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
    data_escolha TIMESTAMPTZ DEFAULT NOW(),
    ordem_classificacao INT NOT NULL,
    turno_selecionado VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmada' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. LOGS DE AUDITORIA (ACESSO DO TÉCNICO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID,
    usuario_nome VARCHAR(255),
    usuario_perfil VARCHAR(50),
    acao VARCHAR(255) NOT NULL,
    detalhes JSONB,
    ip VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública/autenticada para aplicação
CREATE POLICY "Permite leitura autenticada em escolas" ON public.escolas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permite leitura autenticada em professores" ON public.professores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permite leitura autenticada em turmas" ON public.turmas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permite leitura autenticada em escolhas" ON public.escolhas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permite leitura de logs apenas por tecnicos" ON public.logs FOR SELECT USING (auth.jwt() ->> 'role_perfil' = 'tecnico');

-- Permissões de gravação
CREATE POLICY "Permite escrita total em escolas" ON public.escolas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permite escrita total em professores" ON public.professores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permite escrita total em turmas" ON public.turmas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permite escrita total em escolhas" ON public.escolhas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permite inclusao de logs por qualquer autenticado" ON public.logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
