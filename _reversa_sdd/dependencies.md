# Dependências do Projeto - Vehicle Diagnostic Core

## Dependências Identificadas

Baseado no `implementation_plan.md`, o projeto planeja utilizar as seguintes tecnologias e bibliotecas:

### Frontend
- **React** - Biblioteca principal para construção da interface
- **Tailwind CSS** - Framework CSS para estilização utilitária-first
- **Recharts** ou **Chart.js** - Bibliotecas para renderização de gráficos dinâmicos no chat
- **Headless UI** ou similar - Para componentes acessíveis (dropdowns, modais)

### Backend (implícito)
- **Node.js** - Runtime para execução do servidor
- **Express.js** ou similar - Framework para criação de APIs REST
- **WebSocket** ou similar - Para comunicação em tempo real (se aplicável ao chat)

### Integrações Externas
- **WhatsApp Web API** - Para funcionalidade de envio de mensagens via WhatsApp
- **API de busca de placas** (simulada ou real) - Para preenchimento automático de dados do veículo
- **Serviço de IA/LLM** - Para normalização de dados, diagnóstico e geração de respostas pessoais

### Desenvolvimento e Build
- **Vite** ou **Create React App** - Para setup e build do projeto React
- **ESLint** e **Prettier** - Para qualidade e formatação de código
- **Jest** e **React Testing Library** - Para testes unitários e de integração (mencionado no surface schema)

### Banco de Dados (implícito)
- **Prisma** - Mencionado no surface schema como possível ORM
- **PostgreSQL**, **MySQL** ou **MongoDB** - Para armazenamento de dados de veículos, usuários e histórico de diagnósticos

## Observações Importantes

1. **Nenhum arquivo de dependência real foi encontrado** no projeto (package.json, requirements.txt, etc.)
2. Todas as dependências listadas acima são **inferidas** a partir do documento `implementation_plan.md`
3. As versões específicas não foram definidas no documento de arquitetura
4. O projeto atualmente consiste principalmente em:
   - Assets de design (screenshots, mockups)
   - Documentação de arquitetura e fluxo
   - Plano detalhado para implementação

## Próximos Passos para Definição de Dependências

1. Criar `package.json` com as dependências frontend
2. Definir arquitetura backend e criar correspondentes arquivos de dependência
3. Escolher tecnologias específicas baseadas nos requisitos de performance e escalabilidade
4. Configurar ambiente de desenvolvimento com ferramentas de build e teste

## Mapeamento de Tecnologias por Funcionalidade

| Funcionalidade | Tecnologia Proposta | Fonte |
|----------------|---------------------|-------|
| Interface Usuário | React + Tailwind CSS | implementation_plan.md, seção 2 |
| Gráficos Dinâmicos | Recharts ou Chart.js | implementation_plan.md, seção 6 |
| Estilização | Dark mode puro (`bg-[#0B1120]`) | implementation_plan.md, seção 2 |
| Componentes Customizados | Dropdowns com optgroup, botões arredondados | implementation_plan.md, seção 2 |
| Integração WhatsApp | WhatsApp Web API | implementation_plan.md, seção 5 |
| Exportação PDF | Browser print API | implementation_plan.md, seção 5 |
| Busca de Placas | API simulada ou real | implementation_plan.md, seção 2 |
| Normalização de Dados | IA/LLM ou banco de dados | implementation_plan.md, seção 3 |
| Sistema de Diagnóstico | LLM com persona customizada | implementation_plan.md, seção 4 |
| Gráficos via Código | Sistema `diagnostic_chart` com JSON | implementation_plan.md, seção 6 |

## Estado Atual das Dependências

- **Frontend**: Dependências a serem definidas (React, Tailwind, etc.)
- **Backend**: Tecnologia a ser definida (Node.js/Express sugerido)
- **Banco de Dados**: Tecnologia a ser definida (Prisma sugerido)
- **Testes**: Framework a ser definido (Jest sugerido no surface schema)
- **DevOps**: Configuração a ser definida (build, deploy, CI/CD)
