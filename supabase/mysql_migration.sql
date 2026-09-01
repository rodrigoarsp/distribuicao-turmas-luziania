-- ==============================================================================
-- SCRIPT DE MIGRAÇÃO PARA MYSQL / MARIADB - SME LUZIÂNIA
-- Sistema de Distribuição de Turmas (Portaria nº 947/2025)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `distribuicao_turmas_luziania` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `distribuicao_turmas_luziania`;

-- ------------------------------------------------------------------------------
-- 1. TABELA DE ESCOLAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `escolas` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `nome` VARCHAR(255) NOT NULL,
    `codigo_inep` VARCHAR(20),
    `endereco` TEXT,
    `contato` VARCHAR(100),
    `gestor_id` CHAR(36),
    `gestor_nome` VARCHAR(255),
    `status_processo` ENUM('nao_iniciado', 'em_andamento', 'concluido') DEFAULT 'nao_iniciado',
    `data_inicio_escolha` DATETIME DEFAULT '2025-12-19 13:00:00',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PROFESSORES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `professores` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `escola_id` CHAR(36) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) UNIQUE,
    `data_nascimento` DATE NOT NULL,
    `data_admissao` DATE NOT NULL,
    `carga_horaria` INT NOT NULL,
    `tipo_vinculo` ENUM('efetivo', 'contrato_temporario', 'comissionado') NOT NULL,
    `faltas_injustificadas_2025` INT DEFAULT 0,
    `frequencia_alfamais_percentual` DECIMAL(5,2) DEFAULT 0.00,
    `pontuacao_total` DECIMAL(10,2) DEFAULT 0.00,
    `pontuacao_detalhada` JSON,
    `justificativa_validacao` TEXT,
    `status_validacao` ENUM('pendente', 'validado', 'necessita_correcao') DEFAULT 'pendente',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 3. HISTÓRICO DE REGÊNCIAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `regencias` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `professor_id` CHAR(36) NOT NULL,
    `tipo` ENUM('efetivo_rede', 'efetivo_unidade', 'contrato_temporario', 'cargo_sme') NOT NULL,
    `ano` INT NOT NULL,
    `carga_horaria` INT NOT NULL,
    `dias_trabalhados` INT NOT NULL DEFAULT 180,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`professor_id`) REFERENCES `professores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 4. PUBLICAÇÕES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `publicacoes` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `professor_id` CHAR(36) NOT NULL,
    `tipo` ENUM('tecnica_pedagogica', 'artigo_issn', 'livro_isbn') NOT NULL,
    `titulo` TEXT NOT NULL,
    `comprovante_url` TEXT,
    `pontos` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`professor_id`) REFERENCES `professores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 5. FORMAÇÕES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `formacoes` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `professor_id` CHAR(36) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `nome_curso` TEXT NOT NULL,
    `carga_horaria` INT DEFAULT 0,
    `modalidade` ENUM('presencial', 'semipresencial', 'ead'),
    `ano_conclusao` INT,
    `instituicao` VARCHAR(255),
    `comprovante_url` TEXT,
    `pontos_calculados` DECIMAL(8,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`professor_id`) REFERENCES `professores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 6. AVALIAÇÕES DE DESEMPENHO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `avaliacoes` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `professor_id` CHAR(36) NOT NULL,
    `ano` INT NOT NULL,
    `percentual` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`professor_id`) REFERENCES `professores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 7. TABELA DE TURMAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `turmas` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `escola_id` CHAR(36) NOT NULL,
    `descricao` VARCHAR(100) NOT NULL,
    `turno` ENUM('matutino', 'vespertino', 'noturno') NOT NULL,
    `tipo` ENUM('pre_i', 'pre_ii', '1_ano', '2_ano', '3_ano_5_ano', 'eja', 'educacao_especial') NOT NULL,
    `eh_alfamais` BOOLEAN DEFAULT FALSE,
    `ano_letivo` INT DEFAULT 2026,
    `status` ENUM('disponivel', 'ocupada', 'reservada') DEFAULT 'disponivel',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 8. ESCOLHAS DE TURMAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `escolhas` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `escola_id` CHAR(36) NOT NULL,
    `turma_id` CHAR(36) NOT NULL,
    `professor_id` CHAR(36) NOT NULL,
    `data_escolha` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `ordem_classificacao` INT NOT NULL,
    `turno_selecionado` VARCHAR(20) NOT NULL,
    `status` ENUM('pendente', 'confirmada', 'cancelada') DEFAULT 'confirmada',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`professor_id`) REFERENCES `professores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 9. LOGS DE AUDITORIA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `logs` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `usuario_id` CHAR(36),
    `usuario_nome` VARCHAR(255),
    `usuario_perfil` VARCHAR(50),
    `acao` VARCHAR(255) NOT NULL,
    `detalhes` JSON,
    `ip` VARCHAR(45),
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
