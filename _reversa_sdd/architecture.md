# Architecture Overview - Vehicle Diagnostic Core

## System Vision
Vehicle Diagnostic Core é uma plataforma de seleção de veículos e diagnóstico automotivo baseado em IA. O sistema permite que usuários identifiquem veículos por placa ou seleção manual, recebam diagnósticos inteligentes e compartilhem resultados via WhatsApp ou PDF.

## High-Level Architecture (Inferred)
Baseado no `implementation_plan.md`, o sistema segue uma arquitetura cliente-servidor com as seguintes camadas principais:

### 1. Frontend (Client)
- **Tecnologia:** React com Tailwind CSS
- **Responsabilidades:**
  - Interface de formulário para identificação de veículos
  - Exibição de chat de diagnóstico com IA
  - Renderização dinâmica de gráficos via bloco `diagnostic_chart`
  - Funcionalidades de exportação (copiar texto, salvar como PDF, enviar WhatsApp)
  - Integração com APIs backend e serviços externos

### 2. Backend (Server)
- **Tecnologia:** Node.js (inferido)
- **Responsabilidades:**
  - Exposição de APIs RESTful para:
    - Busca de placas de veículos
    - Processamento e normalização de dados de veículos
    - Histórico de consultas e diagnósticos
    - Gerenciamento de usuários e preferências
  - Integração com serviços de IA/LLM para:
    - Normalização de dados de entrada
    - Geração de diagnósticos e respostas personalizadas
    - Interpretação de sintomas e códigos de falha
  - Persistência de dados (banco de dados não especificado)

### 3. Bancos de Dados e Armazenamento
- **Catálogo de Veículos:** Estrutura JSON definida no documento de arquitetura
- **Histórico de Uso:** Consultas, diagnósticos e interações dos usuários
- **Configurações:** Preferências de usuários, templates de WhatsApp, assinaturas automáticas
- **Tecnologia Sugerida:** PostgreSQL, MongoDB ou similar (não especificado)

### 4. Serviços Externos
- **API de Busca de Placas:** Serviço de terceiros para identificação de veículos por placa
- **WhatsApp Business API:** Para envio de mensagens formatadas
- **IA/LLM:** Modelo de linguagem grande para processamento de linguagem natural e geração de diagnósticos
- **API de Impressão Nativa:** Para geração de PDF via browser print

## Diagrama C4 - Contexto
Ver arquivo separado: `c4-context.md`

## Diagrama C4 - Containers
Ver arquivo separado: `c4-containers.md` (gerado pois doc_level = detalhado)

## Diagrama C4 - Componentes
Ver arquivo separado: `c4-components.md` (gerado pois doc_level = detalhado)

## ERD Completo
Ver arquivo separado: `erd-complete.md` (gerado pois doc_level = detalhado)

## Spec Impact Matrix
Ver arquivo separado: `traceability/spec-impact-matrix.md` (gerado pois doc_level = detalhado)

## Decisões de Arquitetura Principais (Inferidas)

### 1. Separação de Responsabilidades
- **Frontend:** Focado em experiência do usuário, interface responsiva e interatividade
- **Backend:** Focado em lógica de negócio, processamento de dados e integrações externas
- **Camada de IA:** Isolada para facilitar troca de modelos e atualizações

### 2. Estratégia de Integração
- APIs RESTful para comunicação cliente-servidor
- Webhooks ou polling para atualizações em tempo real (se necessário)
- Integração direta com navegador para funcionalidades de impressão e WhatsApp Web

### 3. Tratamento de Dados
- Normalização de entrada realizada tanto por regras quanto por IA
- Cache inteligente para catálogo de veículos e respostas frequentes
- Histórico de consultas para melhoria contínua do modelo de IA

### 4. Escalabilidade e Performance
- Frontend otimizado para carregamento rápido e interatividade suave
- Backend projetado para horizontal scaling
- Uso de CDN para assets estáticos
- Estratégias de caching em múltiplas níveis

## Tecnologias Sugeridas (Baseadas em Análise)

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | React 18+ | Popularidade, ecosistema rico, boa performance |
|  | Tailwind CSS | Utilitários-first, fácil dark mode, manutenção simples |
|  | Recharts ou Chart.js | Bibliotecas maduras para gráficos interativos |
| Backend | Node.js + Express | Maduro, assíncrono, bom para I/O intensivo |
|  | Prisma | ORM recomendado pelo surface schema, bom para desenvolvimento rápido |
|  | Apollo Server (se GraphQL) | Alternativa se preferir GraphQL sobre REST |
| Banco de Dados | PostgreSQL | Relacional bom para dados estruturados de veículos |
|  | MongoDB | Alternativa para maior flexibilidade no schema |
| IA/LLM | API OpenAI ou similar | Para geração de texto e compreensão de linguagem natural |
|  | Modelo fine-tuned | Para domínio específico de diagnóstico automotivo |
| DevOps | Docker | Containerização para deploy consistente |
|  | CI/CD (GitHub Actions) | Automação de testes e deploy |
|  | Monitoring (Prometheus/Grafana) | Observabilidade em produção |

## Considerações de Segurança
- Sanitização rigorosa de entradas para prevenção de injection
- Autenticação e autorização de usuários (JWT ou OAuth)
- Rate limiting em APIs externas
- Criptografia de dados sensíveis em repouso e trânsito
- Conformidade com LGPD para dados pessoais de usuários

## Próximos Passos
1. Definir stack tecnológica definitiva com base em requisitos não-funcionais
2. Criar protótipos de alta fidelidade para validação de UX
3. Implementar API mínima viável para busca de placas e normalização
4. Desenvolver componente de chat com integração de LLM
5. Adicionar testes automatizados em todas as camadas
6. Estratégia de deploy e monitoramento

---
*Documento de arquitetura gerado pelo Reversa Architect em 2026-05-02*
