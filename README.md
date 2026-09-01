# Sistema de Distribuição de Turmas — SME Luziânia (Portaria nº 947/2025)

Sistema web completo desenvolvido em **React 18 (Vite, Tailwind CSS, Lucide Icons, jsPDF)** e integrado ao **Supabase (PostgreSQL)** para gerenciar todo o processo de atribuição e escolha de turmas dos professores da rede municipal de ensino de Luziânia - GO, em conformidade com as diretrizes da **Portaria nº 947/2025**.

---

## 🚀 Funcionalidades Principais

### 1. Perfis de Usuário e Controle de Acesso (RLS)
- 🔴 **Técnico**: Acesso irrestrito a todas as escolas, turmas, cadastros e à **Central de Logs de Auditoria** com busca, visualizador de dados em JSON e exportação dos registros em CSV.
- 🔵 **Administrador**: Cadastro, edição e exclusão de escolas municipais, acompanhamento **em tempo real** do progresso de escolha de cada unidade e inspeção de atas geradas.
- 🟢 **Gestor Escolar**: Gestão restrita à sua unidade escolar: cadastro de professores, cadastro de turmas, conferência e validação de pontuação, execução da **Sala Virtual de Escolha Ao Vivo** e geração automática da **Ata Oficial em PDF (Modelo ANEXO I)**.

### 2. Motor de Pontuação Automática (Portaria nº 947/2025)
- **Seção I (Tempo de Serviço)**: Cômputo proporcional por carga horária (20h, 30h e 40h) para regência efetiva na rede, regência na unidade, contratos temporários e cargos de direção/SME (180+ dias = 1 ano completo).
- **Seção II (Publicações)**: Pontuação por trabalhos técnicos (50 pts), artigos ISSN (100 pts) e livros ISBN (200 pts).
- **Seção III (Titulação Presencial)**: Pós-graduação Lato Sensu (50 pts, máx. 4), Mestrado (200 pts, máx. 2) e Doutorado (300 pts, máx. 1).
- **Seção IV (Formação Continuada Presencial 2025)**: Valoração por hora em cursos AlfaMais, Alfabetização, Ed. Infantil, Ed. Especial, SMEL e SINTEGO (5 pts/hora).
- **Seção V (Formação EAD 2025)**: Valoração de 0,5 pt/hora com tetos de 100 pontos por categoria.
- **Seção VI (Desempenho 2025)**: Conversão direta da nota percentual da avaliação em pontos.

### 3. Regras de Desempate e Prioridade AlfaMais
- **Desempate (Art. 2º, V)**: 
  1. Ausência de faltas injustificadas no ano vigente (2025).
  2. Maior tempo de regência de classe na REDE.
  3. Maior tempo de regência de classe na UNIDADE.
  4. Maior média das avaliações de desempenho.
  5. Maior idade.
- **Prioridade AlfaMais (Art. 4º)**: Professores com frequência ≥ 90% no curso AlfaMais em 2025 possuem prioridade de escolha em turmas de Pré I, Pré II, 1º e 2º anos.

---

## 📁 Arquivos do Banco de Dados (Supabase & MySQL)

Os scripts de banco de dados encontram-se na pasta `supabase/`:
- `supabase/schema.sql`: Estrutura PostgreSQL com UUIDs, chaves estrangeiras e políticas de segurança Row Level Security (RLS).
- `supabase/seed.sql`: Dados iniciais de teste (Escola JK, Escola José Roriz, professores com pontuação e turmas).
- `supabase/mysql_migration.sql`: Script 100% equivalente para migração futura para banco de dados MySQL ou MariaDB.

---

## 🛠️ Execução Local

1. Instalar as dependências do projeto:
   ```bash
   npm install
   ```

2. Executar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em `http://localhost:3000`.

3. **Modo Demo Híbrido**:
   - A aplicação funciona **imediatamente offline** com dados fictícios de demonstração pré-carregados da rede municipal de Luziânia.
   - É possível alternar rapidamente de perfil (Gestor ↔ Admin ↔ Técnico) com 1 clique na barra superior.

---

## 🌐 Configuração do Supabase e Deploy na Vercel

### Conectando ao Supabase
Crie um arquivo `.env` na raiz do projeto contendo:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```
Execute o arquivo `supabase/schema.sql` e depois o `supabase/seed.sql` no **SQL Editor** do Supabase Dashboard.

### Deploy na Vercel
1. Faça o push do projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Conecte o repositório no dashboard da **Vercel**.
3. Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações de ambiente do projeto na Vercel.
4. Clique em **Deploy**.
