# ADR Inicial - Decisoes Tecnicas Fundamentais

**Projeto:** Vehicle Diagnostic Core  
**Data:** 2026-05-02  
**Status:** Aprovado para implementacao inicial  
**Escopo:** Decisoes tecnicas finais para destravar a reconstrucao do sistema em producao

---

## 1. Contexto

O projeto atual nao possui codigo executavel. Ha apenas documentacao funcional, artefatos visuais e especificacoes inferidas pelo Reversa. Esta ADR fecha as decisoes tecnicas que bloqueiam a implementacao da Fase 1 e estabelece a base oficial para o `reconstruction-plan.md`.

As decisoes abaixo priorizam:

- velocidade de execucao
- baixo retrabalho estrutural
- boa capacidade de evolucao para producao
- simplicidade operacional no MVP
- desacoplamento de provedores externos

---

## 2. Decisoes Finais

### 2.1 Backend: Fastify ou Nest

**Decisao final:** `Fastify + TypeScript + Zod`

**Motivo da escolha:**

- menor complexidade estrutural que `NestJS`
- melhor custo-beneficio para iniciar um backend novo e enxuto
- bom desempenho para workload I/O-bound
- menor verbosidade para construir integracoes com LLM, API de placa e compartilhamento
- mais facil manter linguagem unica com o frontend sem carregar um framework excessivamente opinado

**Quando Nest faria sentido:**

- time grande com multiplos squads
- necessidade forte de DI formal e convencoes rigidas
- sistema com muito mais modulos internos do que integracoes externas

**Padrao oficial adotado:**

- `Node.js`
- `TypeScript` em modo strict
- `Fastify`
- validacao com `Zod`
- geracao de contrato `OpenAPI`
- arquitetura modular por dominio

---

### 2.2 Estrategia de Autenticacao

**Decisao final:** `modelo hibrido: sessao anonima + conta opcional`

**Motivo da escolha:**

- reduz friccao no MVP
- permite iniciar consulta sem bloquear o usuario por cadastro
- preserva espaco para historico persistido, preferencias e recursos premium com conta
- reduz risco de atrasar a entrega por causa de auth completa antes do core funcionar

**Modelo adotado:**

- usuarios anonimos podem iniciar fluxo e usar diagnostico
- usuarios autenticados podem salvar historico e preferencias
- autenticacao principal por `email + senha`
- `JWT` de curta duracao para acesso
- `refresh token` com armazenamento seguro
- papeis iniciais: `user` e `admin`

**Decisoes complementares:**

- OAuth fica fora do MVP
- historico persistido completo exige conta
- sessao anonima pode manter estado local temporario

---

### 2.3 Provedor de LLM

**Decisao final:** `arquitetura com adapter abstrato`, usando `OpenAI` como primeiro provider oficial

**Motivo da escolha:**

- o sistema depende criticamente de IA para normalizacao e diagnostico
- acoplamento direto a um unico vendor criaria retrabalho futuro
- OpenAI oferece boa maturidade para geracao textual estruturada e parsing de saida

**Padrao adotado:**

- interface unica para provedores de IA
- primeiro adapter concreto: `OpenAI`
- suporte futuro a novos vendors sem alterar o dominio

**Capacidades obrigatorias do servico de IA:**

- `normalizeVehicleData(input)`
- `generateDiagnosis(context)`
- `generateTechnicalConsult(context)`
- parser estrito de blocos `diagnostic_chart`
- versionamento de prompts
- timeout e retry controlado
- logs sem expor dados sensiveis

**Observacao:**

- fine-tuning nao entra na primeira entrega
- a primeira versao deve usar prompts bem versionados e avaliacao observavel

---

### 2.4 Integracao de Placa

**Decisao final:** `arquitetura dual com adapter`, composta por `MockPlateProvider` e `RealPlateProvider`

**Motivo da escolha:**

- permite desenvolver e testar o sistema sem dependencia imediata de fornecedor externo
- reduz bloqueio de homologacao comercial ou tecnica
- facilita fallback e troca futura de provedor

**Padrao adotado:**

- interface `PlateProvider`
- implementacao `MockPlateProvider` para dev/test
- implementacao `RealPlateProvider` para staging/producao
- escolha por `feature flag` ou variavel de ambiente

**Requisitos tecnicos obrigatorios:**

- timeout
- retry controlado
- cache de respostas
- normalizacao do payload externo
- tratamento previsivel de indisponibilidade

**Decisao operacional:**

- o MVP comeca com mock funcional
- a entrada em producao exige um `RealPlateProvider` homologado

---

### 2.5 Estrategia de Deploy

**Decisao final:** `deploy desacoplado por camada`, com frontend estatico, API gerenciada e banco PostgreSQL gerenciado

**Arquitetura de deploy adotada:**

- frontend: `Vercel` ou equivalente para SPA
- backend: `Railway`, `Render` ou `Fly.io`
- banco: `PostgreSQL gerenciado` como `Neon`, `Supabase` ou equivalente
- CI/CD: `GitHub Actions`

**Motivo da escolha:**

- menor atrito operacional no inicio
- custo reduzido para MVP
- deploy rapido e rollback simples
- elimina necessidade inicial de operar cluster proprio

**Pipeline minimo adotado:**

- lint
- testes unitarios
- testes de integracao
- build web
- build api
- deploy para `staging`
- promocao manual para `prod`

**Ambientes obrigatorios:**

- `dev`
- `staging`
- `prod`

**Politicas minimas:**

- migrations versionadas
- rollback controlado
- segredos por ambiente
- observabilidade basica desde staging

---

## 3. Outras Decisoes Estruturais Complementares

### 3.1 Frontend

**Decisao final:** `React + Vite + TypeScript + Tailwind CSS`

**Complementos:**

- `React Router`
- `TanStack Query`
- `Zustand`

---

### 3.2 Dados

**Decisao final:** `PostgreSQL + Prisma`

**Motivo:**

- dominio fortemente relacional
- facilidade de auditoria
- melhor adequacao para historico, consultas e correcoes

---

### 3.3 Contratos

**Decisao final:** `OpenAPI + DTOs compartilhados + validacao Zod`

**Motivo:**

- evitar divergencia entre frontend e backend
- permitir geracao de clientes e testes contratuais

---

### 3.4 Exportacao e WhatsApp

**Decisao final do MVP:**

- PDF via `window.print()` no frontend ou endpoint simples de composicao, conforme necessidade de layout
- WhatsApp por compartilhamento web no MVP
- `WhatsApp Business API` fica para fase posterior, se houver demanda operacional real

---

## 4. Consequencias Aceitas

### Beneficios

- stack simples e moderna
- menor custo de inicio
- boa separacao entre dominio e provedores externos
- facilidade para evoluir de MVP para producao

### Trade-offs

- `Fastify` exige alguma disciplina arquitetural manual que `NestJS` forneceria por convencao
- auth hibrida aumenta um pouco a complexidade de fluxo
- uso de share simples do WhatsApp no MVP nao cobre automacoes empresariais
- `window.print()` pode nao entregar padronizacao perfeita entre navegadores

---

## 5. Decisoes Consideradas e Rejeitadas

### NestJS como backend principal

**Rejeitado porque:**

- aumentaria o overhead inicial
- adicionaria complexidade antes de o dominio central estar consolidado

### Login obrigatorio no MVP

**Rejeitado porque:**

- aumenta friccao de entrada
- atrasa validacao do fluxo principal de diagnostico

### Acoplamento direto a um unico vendor de LLM

**Rejeitado porque:**

- cria dependencia forte demais em um eixo central do produto

### WhatsApp Business API desde o inicio

**Rejeitado porque:**

- aumenta tempo, custo e dependencia operacional no momento errado

### Infraestrutura propria logo no MVP

**Rejeitado porque:**

- piora tempo de entrega
- aumenta custo operacional sem ganho proporcional

---

## 6. Checklist de Aplicacao

Estas decisoes devem ser refletidas imediatamente em:

- `_reversa_sdd/reconstruction-plan.md`
- estrutura do monorepo
- configuracao inicial do backend
- configuracao inicial do frontend
- definicao dos adapters externos
- pipeline de CI/CD

---

## 7. Resumo Executivo

O projeto sera implementado com:

- backend em `Fastify`
- autenticacao `anonima + conta opcional`
- `OpenAI` como primeiro provedor de LLM, com adapter abstrato
- integracao de placa via `mock + provider real`
- deploy em camadas gerenciadas com `GitHub Actions`

Estas decisoes encerram a fase de bloqueios tecnicos iniciais e liberam a execucao da `Tarefa 01` e das tarefas subsequentes do plano de reconstrucao.
