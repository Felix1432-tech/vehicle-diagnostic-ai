# Reconstruction Plan - Vehicle Diagnostic Core

**Stack sugerida:** Web `React + Vite + TypeScript + Tailwind CSS + React Router + TanStack Query + Zustand`; API `Node.js + TypeScript + Fastify + Zod`; Dados `PostgreSQL + Prisma`; IA `adapter abstrato com OpenAI como primeiro provider`; Infra `Docker + GitHub Actions`; Testes `Vitest + Testing Library + Playwright`
**Gerado em:** 2026-05-02
**Status:** 22 tarefas | 0 concluidas | 22 pendentes

---

## Alertas de pre-voo

> Revise estes pontos antes de iniciar. Gaps marcados com `⚠️` bloqueiam a tarefa associada.

- ⚠️ **Homologar o provedor real de busca por placa** - bloqueia Tarefa 06 (PlateLookupService)
- ⚠️ **Resolver inconsistencia entre `Premium Europeias` e `Europeias Premium`** - bloqueia Tarefa 04 (Catalogo de Veiculos)
- ⚠️ **Definir politica de persistencia de historico e LGPD** - bloqueia Tarefa 09 (ChatHistoryService) e Tarefa 19 (Seguranca e Compliance)
- ⚠️ **Nao existem specs SDD, OpenAPI, data-dictionary, state-machines nem user-stories no repositorio atual** - o plano abaixo usa `implementation_plan.md` e os artefatos do Reversa como fonte inferida

---

## Baseline tecnico oficial

As tarefas deste plano devem seguir obrigatoriamente a ADR em [_reversa_sdd/adr-inicial.md](</C:/Users/ACER_2025/claude free/_reversa_sdd/adr-inicial.md>).

- **Frontend:** `React + Vite + TypeScript + Tailwind CSS + React Router + TanStack Query + Zustand`
- **Backend:** `Node.js + TypeScript + Fastify + Zod`
- **Dados:** `PostgreSQL + Prisma`
- **IA:** `adapter abstrato de LLM` com `OpenAI` como primeiro provider
- **Autenticacao:** `sessao anonima + conta opcional com email/senha + JWT + refresh token`
- **Placa:** `PlateProvider` com `MockPlateProvider` e `RealPlateProvider`
- **WhatsApp:** compartilhamento web no MVP; Business API fora do escopo inicial
- **PDF:** `window.print()` no MVP, com possibilidade de evolucao posterior
- **Deploy:** frontend gerenciado, API gerenciada, PostgreSQL gerenciado, CI/CD com `GitHub Actions`
- **Testes:** `Vitest`, `Testing Library`, `Playwright`

Nenhuma tarefa deve reabrir estas decisoes sem nova ADR.

---

## Ordem de implementacao

1. Baseline tecnico e repositorio
2. Infraestrutura de dados e configuracao
3. Servicos de dominio sem interface
4. Frontend base
5. Fluxos de formulario e correcao
6. Fluxos de chat e exportacao
7. Camada de API e integracao end-to-end
8. Seguranca, qualidade, observabilidade e deploy

---

## Dependencias por fase

### Fase 1 - Baseline tecnico e repositorio
- **Dados:** nenhuma dependencia previa
- **Backend:** depende da ADR inicial e da estrutura do monorepo
- **Frontend:** depende da ADR inicial e da estrutura do monorepo
- **Integracoes:** depende da ADR inicial e da definicao dos adapters

### Fase 2 - Infraestrutura de dados e configuracao
- **Dados:** depende da Fase 1
- **Backend:** depende da Fase 2 para persistencia e configuracao
- **Frontend:** sem dependencia direta para iniciar foundation, mas depende da Fase 2 para fluxos reais
- **Integracoes:** dependem da Fase 2 para secrets e configuracoes operacionais

### Fase 3 - Servicos de dominio sem interface
- **Dados:** schema e modelos ja definidos
- **Backend:** depende da Fase 2
- **Frontend:** depende indiretamente desta fase para funcionar com dados reais
- **Integracoes:** dependem desta fase para adapters e orquestracao de negocio

### Fase 4 - Frontend base
- **Frontend:** depende da Fase 1
- **Backend:** sem dependencia do frontend para iniciar
- **Dados:** sem dependencia direta
- **Integracoes:** sem dependencia direta

### Fase 5 - Fluxos de formulario e correcao
- **Frontend:** depende da Fase 4
- **Backend:** depende das Fases 2 e 3
- **Dados:** depende da Fase 2
- **Integracoes:** depende de placa e normalizacao prontas

### Fase 6 - Fluxos de chat e exportacao
- **Frontend:** depende das Fases 4 e 5
- **Backend:** depende da Fase 3
- **Dados:** depende do historico e configuracoes
- **Integracoes:** depende de LLM, PDF e WhatsApp prontos

### Fase 7 - Camada de API e integracao end-to-end
- **Frontend:** depende das Fases 4, 5 e 6
- **Backend:** depende das Fases 2, 3 e 6
- **Dados:** depende da Fase 2
- **Integracoes:** depende dos adapters ja implementados

### Fase 8 - Seguranca, qualidade, observabilidade e deploy
- **Frontend:** depende da Fase 7
- **Backend:** depende da Fase 7
- **Dados:** depende de migrations estaveis
- **Integracoes:** depende dos fluxos ponta a ponta estarem operacionais

---

## Legenda de esforco

- **P:** 0,5 a 1,5 dia util
- **M:** 2 a 4 dias uteis
- **G:** 5 a 8 dias uteis
- **GG:** 9 a 15 dias uteis

**Estimativa agregada por fase**

1. Baseline tecnico e repositorio: `M` a `G`
2. Infraestrutura de dados e configuracao: `M`
3. Servicos de dominio sem interface: `GG`
4. Frontend base: `M`
5. Fluxos de formulario e correcao: `G`
6. Fluxos de chat e exportacao: `GG`
7. Camada de API e integracao end-to-end: `G` a `GG`
8. Seguranca, qualidade, observabilidade e deploy: `GG`

**Estimativa total do projeto**

- `47 a 79 dias uteis` para 1 engenheiro full-stack sênior
- `24 a 42 dias uteis` para 2 engenheiros trabalhando em paralelo com boa coordenacao
- nao inclui atrasos externos de homologacao de provedor de placa, WhatsApp Business API ou ajustes de prompt/qualidade de IA em producao

---

## Tarefas

### Tarefa 01 - Baseline Tecnico e Decisoes Arquiteturais
**Status:** pending
**Depende de:** nenhuma
**Esforco:** M
**Le:** `.reversa/state.json`, `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/dependencies.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`
**Constroi:** estrutura oficial do monorepo, convencoes, ambientes, segredos, backlog MVP vs producao e checklist de execucao aderente a ADR
**Pronto quando:** a stack da ADR estiver refletida em `apps/`, `packages/`, variaveis de ambiente, contratos base e convencoes de engenharia
**Alerta:** esta tarefa implementa a ADR; nao deve rediscutir stack

---

### Tarefa 02 - Schema do Banco de Dados
**Status:** pending
**Depende de:** 01
**Esforco:** M
**Le:** `_reversa_sdd/erd-complete.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`
**Constroi:** schema Prisma para PostgreSQL, migrations iniciais, constraints, foreign keys, enums de dominio e indices principais
**Pronto quando:** todas as tabelas inferidas do ERD existem com relacionamentos validos e migrations executam do zero

---

### Tarefa 03 - ConfigManagementService e Configuracoes Operacionais
**Status:** pending
**Depende de:** 02
**Esforco:** P
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/erd-complete.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/dependencies.md`
**Constroi:** repositorio de configuracoes, acesso a segredos de negocio, parametros de assinatura, toggles, defaults do sistema e feature flags dos adapters
**Pronto quando:** configuracoes do sistema puderem ser lidas e alteradas sem redeploy

---

### Tarefa 04 - Catalogo de Veiculos
**Status:** pending
**Depende de:** 02, 03
**Esforco:** M
**Le:** `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** seed do catalogo, tabelas auxiliares ou JSON mestre, servico de consulta de marcas, categorias, combustiveis e modelos
**Pronto quando:** o sistema expuser o catalogo completo com categorias, marcas e combustiveis consistentes com a especificacao decidida
**Alerta:** bloqueado ate resolver a duplicidade `Premium Europeias` vs `Europeias Premium`

---

### Tarefa 05 - UserManagementService
**Status:** pending
**Depende de:** 02, 03
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/erd-complete.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`
**Constroi:** entidades de usuario, repositorio, autenticacao hibrida, preferencias, perfil, sessao anonima, JWT e refresh token
**Pronto quando:** usuarios anonimos e autenticados puderem operar conforme a ADR, com recuperacao de preferencias quando houver conta

---

### Tarefa 06 - PlateLookupService
**Status:** pending
**Depende de:** 03, 04
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`, `implementation_plan.md`
**Constroi:** `PlateProvider`, `MockPlateProvider`, `RealPlateProvider`, normalizacao de resposta externa, cache e tratamento de falha
**Pronto quando:** uma placa valida retornar dados estruturados do veiculo com timeout, retries e fallback definidos usando o contrato oficial de provider
**Alerta:** bloqueado ate homologar o `RealPlateProvider` de producao

---

### Tarefa 07 - VehicleNormalizationService
**Status:** pending
**Depende de:** 04, 06
**Esforco:** G
**Le:** `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** regras de sanitize/match, comparacao entre valor original e sugerido, historico de correcoes e heuristicas/LLM para normalizacao
**Pronto quando:** o fluxo produzir sugestoes auditaveis de correcao com suporte a confirmar ou descartar

---

### Tarefa 08 - DiagnosisGenerationService
**Status:** pending
**Depende de:** 03, 04, 05, 07
**Esforco:** GG
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** adapter abstrato de LLM, provider OpenAI, prompts de `diagnostico completo` e `consulta tecnica`, montagem do `VEICULO COMPLETO`, parser de blocos `diagnostic_chart`
**Pronto quando:** o backend gerar respostas consistentes nos dois modos, com persona definida e suporte ao contrato de `diagnostic_chart` usando o adapter oficial de IA

---

### Tarefa 09 - ChatHistoryService
**Status:** pending
**Depende de:** 02, 05, 07, 08
**Esforco:** M
**Le:** `_reversa_sdd/erd-complete.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/architecture.md`
**Constroi:** persistencia de consultas, respostas, metadados, correcao aceita/rejeitada e marcacoes de compartilhamento PDF/WhatsApp
**Pronto quando:** cada interacao relevante puder ser salva, recuperada e filtrada por usuario ou sessao
**Alerta:** precisa de definicao de retencao, privacidade e politica LGPD

---

### Tarefa 10 - PDFGenerationService
**Status:** pending
**Depende de:** 03, 08, 09
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** fluxo de exportacao via `window.print()`, template com logo, cabecalho, rodape e conteudo limpo da resposta
**Pronto quando:** uma resposta do chat puder ser exportada em PDF com layout consistente e auditavel dentro da estrategia MVP definida na ADR

---

### Tarefa 11 - Frontend Foundation
**Status:** pending
**Depende de:** 01
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/c4-components.md`, `implementation_plan.md`
**Constroi:** app React com Vite, roteamento, tema base, Tailwind, layout principal, design tokens, TanStack Query e Zustand
**Pronto quando:** o frontend oficial da ADR carregar com tema escuro, rotas principais e infraestrutura de estado pronta

---

### Tarefa 12 - WhatsAppIntegrationService
**Status:** pending
**Depende de:** 03, 08, 09
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`
**Constroi:** compartilhamento web para WhatsApp, composicao de mensagem, assinatura automatica e auditoria basica de envio
**Pronto quando:** uma resposta do sistema puder ser compartilhada no WhatsApp com formato padronizado conforme estrategia MVP da ADR

---

### Tarefa 13 - Shared UI Infrastructure
**Status:** pending
**Depende de:** 11
**Esforco:** P
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/c4-components.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** `Notification`, `LoadingIndicator`, `ErrorBoundary`, sistema de feedback visual e camada de erro do frontend
**Pronto quando:** o frontend possuir tratamento consistente para loading, sucesso, erro e notificacoes globais

---

### Tarefa 14 - Fluxo de Formulario: PlateInput, BrandDropdown, ModelFields, TechFields
**Status:** pending
**Depende de:** 04, 06, 11, 13
**Esforco:** G
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** componentes do formulario, integracao com lookup de placa e preenchimento/edicao manual dos dados do veiculo
**Pronto quando:** o usuario puder identificar um veiculo por placa ou selecao manual com validacoes e feedback visual

---

### Tarefa 15 - Fluxo de Correcao: SubmitButtons e Revisao de Normalize/Match
**Status:** pending
**Depende de:** 07, 14
**Esforco:** M
**Le:** `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`
**Constroi:** tela ou etapa de confirmacao/descartar correcoes, diff dos valores e persistencia da decisao do usuario
**Pronto quando:** o usuario conseguir revisar cada sugestao e a decisao influenciar o contexto final do veiculo

---

### Tarefa 16 - Chat Core: ModeSelector, ShortcutButtons, SendButton
**Status:** pending
**Depende de:** 08, 11, 13, 15
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** entrada do chat, selecao de modo, atalhos de intencao, envio de mensagem e preparacao do contexto da consulta
**Pronto quando:** o usuario puder iniciar uma consulta valida nos modos previstos com atalhos funcionais

---

### Tarefa 17 - Renderizacao do Chat: MessageList, MessageItem e ChartRenderer
**Status:** pending
**Depende de:** 08, 11, 13, 16
**Esforco:** G
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** lista de mensagens, renderer de conteudo, parser e renderizacao de `diagnostic_chart` com graficos validos
**Pronto quando:** respostas textuais e respostas com bloco `diagnostic_chart` forem exibidas corretamente no frontend

---

### Tarefa 18 - ActionButtons: Copiar, PDF e WhatsApp
**Status:** pending
**Depende de:** 10, 12, 17
**Esforco:** M
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`
**Constroi:** acoes por mensagem para copiar texto, exportar PDF e compartilhar no WhatsApp
**Pronto quando:** cada resposta do chat expuser as tres acoes e todas funcionarem ponta a ponta

---

### Tarefa 19 - Camada de API e Seguranca de Aplicacao
**Status:** pending
**Depende de:** 05, 06, 07, 08, 09, 10, 12
**Esforco:** GG
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/dependencies.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/erd-complete.md`
**Constroi:** endpoints REST em Fastify, validacao com Zod, middlewares, autenticacao/autorizacao, rate limiting e contratos para frontend
**Pronto quando:** todos os fluxos principais estiverem expostos por API coerente e protegidos conforme a ADR
**Alerta:** como nao existe `openapi/`, os contratos precisarao ser criados aqui antes da implementacao final

---

### Tarefa 20 - Integracao End-to-End e Historico de Usuario
**Status:** pending
**Depende de:** 09, 14, 15, 16, 17, 18, 19
**Esforco:** G
**Le:** `_reversa_sdd/architecture.md`, `_reversa_sdd/c4-components.md`, `_reversa_sdd/domain.md`, `implementation_plan.md`
**Constroi:** unificacao frontend/backend, historico de consultas, recuperacao de sessoes e navegacao entre fluxos completos
**Pronto quando:** o usuario conseguir completar o fluxo inteiro, rever historico e repetir consultas sem quebra de estado

---

### Tarefa 21 - Qualidade, Observabilidade e Performance
**Status:** pending
**Depende de:** 19, 20
**Esforco:** GG
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/dependencies.md`, `_reversa_sdd/traceability/spec-impact-matrix.md`
**Constroi:** testes com Vitest, Testing Library e Playwright, logs estruturados, metricas, tracing basico, cache e resiliencia das integracoes
**Pronto quando:** o sistema possuir cobertura dos fluxos criticos, monitoracao basica e comportamento previsivel sob falha externa conforme stack oficial

---

### Tarefa 22 - CI/CD, Deploy e Hardening de Producao
**Status:** pending
**Depende de:** 21
**Esforco:** G
**Le:** `_reversa_sdd/adr-inicial.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/dependencies.md`, `_reversa_sdd/erd-complete.md`
**Constroi:** Dockerfiles, pipelines GitHub Actions, ambientes `dev/staging/prod`, migrations automatizadas, backups, politicas de rollout e checklist final de producao
**Pronto quando:** o sistema puder ser publicado de forma repetivel, monitorada e com rollback controlado na estrategia de deploy definida pela ADR

---

## Observacoes

- Este plano foi montado a partir de artefatos inferidos; ele serve como plano tecnico de reconstrucao, nao como reflexo de codigo existente.
- Como faltam `openapi/`, `sdd/`, `data-dictionary.md`, `state-machines.md` e `user-stories/`, varias tarefas incluem a criacao desses contratos como parte da propria implementacao.
- A ordem acima privilegia reducao de retrabalho: dados e dominio antes de UI, integracoes antes de acoes de exportacao, contratos antes de deploy.

---

## Proxima acao recomendada

**Iniciar pela Tarefa 01.** Ela fecha as decisoes que hoje bloqueiam o resto da reconstrucao.
