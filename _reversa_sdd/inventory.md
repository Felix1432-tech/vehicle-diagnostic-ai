# Inventário do Projeto - Vehicle Diagnostic Core

## Visão Geral
Este projeto representa o sistema de design e arquitetura para um aplicativo de seleção de veículos e diagnóstico automotivo baseado em IA com nomenclatura neutra de domínio.

## Estrutura de Arquivos

### Imagens e Design
- **landpage.png** - Landing page principal
- **landpage1-28.png** - Variações e telas da aplicação
- **Arquivos de logo legados** - Recursos visuais herdados do material original
- **Telas detalhadas da interface** - Recursos visuais herdados do material original
- **Logo principal legado** - Recurso visual herdado do material original

### Documentação
- **implementation_plan.md** - Plano detalhado de arquitetura e funcionalidades
- **onde paramos claude.txt** - Notas de desenvolvimento
- **onde paramos claude ANTIGRAVITY.txt** - Notas adicionais

### Estrutura de Diretórios (Reversa)
- **.reversa/** - Configuração e estado do framework Reversa
- **.agents/** - Skills do Reversa para diversos agentes
- **.claude/** - Configurações locais do Claude Code
- **_reversa_sdd/** - Diretório de saída para specs geradas (vazio atualmente)

## Tecnologias Identificadas
Baseado no implementation_plan.md:

### Frontend Proposto
- **React** com **Tailwind CSS** para estilização
- **Dark mode puro** (`bg-[#0B1120]`)
- **Componentes UI customizados** (dropdowns com optgroup, botões arredondados)
- **Charting libraries** (Recharts ou Chart.js para gráficos dinâmicos)
- **WhatsApp Web API** para integração de compartilhamento
- **PDF generation** via browser print API

### Backend Proposto
- **Node.js** (implícito pelas referências a APIs e estrutura de dados)
- **Estrutura de dados JSON** para catálogo de veículos
- **API simulada** para busca de placas
- **Sistema de IA/LLM** para normalização de dados e diagnóstico

### Funcionalidades de IA
- **Normalização de dados** (ex: "Cruze ltz hb at" → "Cruze")
- **Matching inteligente** usando IA ou banco de dados
- **Persona do agente**: "Fala [NOME]! Beleza, me conta o que tá acontecendo com o [VEÍCULO COMPLETO]. Qual o sintoma?"
- **Modos de operação**: "Diagnóstico completo" ou "Consulta técnica"
- **Shortcuts**: "Investigar sintoma", "Código de falha", "Manutenção"

### Componentes Dinâmicos
- **Sistema de gráficos via código** (`diagnostic_chart` bloco com JSON específico)
- **Exportação de mensagens**: copiar texto, salvar como PDF, enviar no WhatsApp
- **Logo e cabeçalho personalizados** em exports

## Catálogo de Veículos (Estrutura de Dados)
Definido no implementation_plan.md:
- Categorias: Populares no Brasil, Premium Europeias, Asiáticas, Chinesas, Europeias Premium, Esportivas/Luxo, Americanas, Outras
- Tipos de combustível: Flex, Gasolina, Etanol, Diesel, GNV, Elétrico, Híbrido

## Estado Atual
O projeto atualmente consiste em:
- **Assets de design** (screenshots, mockups)
- **Documentação de arquitetura**
- **Nenhum código fonte executável** identificado
- **Plano detalhado** para implementação frontend/backend

## Próximos Etapas Sugeridas
1. Extrair especificações detalhadas dos assets de design
2. Implementar estrutura de dados do catálogo de veículos
3. Desenvolver frontend React/Tailwind conforme especificado
4. Implementar backend com APIs para busca de placas e processamento de IA
5. Integrar sistema de LLMs para diagnóstico e normalização
6. Adicionar funcionalidades de exportação e compartilhamento
