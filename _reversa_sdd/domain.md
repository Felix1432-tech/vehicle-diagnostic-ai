# Domínio de Negócio - Vehicle Diagnostic Core

## Glossário de Termos

| Termo | Descrição |
|-------|-----------|
| **Vehicle Diagnostic Core** | Nome neutro do sistema de seleção de veículos e diagnóstico automotivo baseado em IA |
| **Core Platform** | Plataforma base que abriga os fluxos de identificação, diagnóstico e relatório |
| **VEÍCULO COMPLETO** | Referência utilizada nos prompts do sistema para incluir todas as informações identificadas do veículo (marca, modelo, ano, versão, etc.) |
| **diagnostic_chart** | Bloco de código especial que, quando detectado pelo frontend, dispara a renderização de gráficos dinâmicos no chat |
| **Sanitize/Match** | Processo de normalização e correspondência de dados realizado pelo sistema após o preenchimento inicial do formulário |

## Regras de Negócio Principais

### 1. Estrutura de Dados do Catálogo de Veículos

O sistema utiliza uma estrutura categorizada para organizar marcas de veículos:

**Categorias de Veículos:**
- **Populares no Brasil** (10 marcas): Volkswagen, Fiat, Chevrolet, Hyundai, Toyota, Jeep, [...]
- **Premium Europeias** (8 marcas): Audi, Porsche, Lamborghini, Bentley, Bugatti, Skoda, SEAT
- **Asiáticas** (11 marcas): Kia, Mitsubishi, Subaru, Suzuki, Mazda, Lexus, Infiniti, Acura, Daihatsu, SsangYong, Isuzu
- **Chinesas** (9 marcas): Lifan, MG, Great Wall, [...]
- **Europeias Premium** (7 marcas): BMW, Mercedes-Benz, Mini, Volvo, Land Rover, Jaguar, Smart
- **Esportivas / Luxo** (8 marcas): Ferrari, Maserati, McLaren, Aston Martin, Rolls-Royce, Lotus, Pagani, Koenigsegg
- **Americanas** (9 marcas): GMC, Cadillac, Lincoln, Buick, Hummer, Pontiac, Saturn, Plymouth, Scion
- **Outras** (12 marcas): Tesla, Tata, Genesis, Dacia, Daewoo, Saab, Rover, Hafei, Troller, Agrale, Iveco, Outra

**Tipos de Combustível Suportados:**
- Flex, Gasolina, Etanol, Diesel, GNV, Elétrico, Híbrido

### 2. Regras de Interface do Usuário

**Tema Visual:**
- Modo escuro puro obrigatório: cor de fundo `#0B1120` ou similar

**Componentes do Formulário:**
- Campo Placa: Integração com API (simulada ou real) para preenchimento automático de outros campos
- Campo Marca: Dropdown customizado com agrupamento (optgroup) pelas categorias acima
- Campos Adicionais: Modelo, Ano, Versão, Motor, Cilindradas, Cor, Quilometragem, Combustível
- Validação Visual: Mensagens de sucesso em texto verde indicando preenchimento automático
- Botões: Formato arredondado com cor laranja e estados de hover definidos

### 3. Regras de Normalização de Dados (Fluxo de Inteligência)

Após o envio inicial do formulário, o sistema executa um processo de "Sanitize/Match" usando IA ou consulta ao banco de dados:

**Exemplos de Normalização Confirmados:**
- Entrada: `Cruze ltz hb at` → Saída esperada: `Cruze`
- Entrada: `LEX162840839` → Saída esperada: `Ecotec 1.4 Turbo`
- Entrada: `vazio` (campo vazio) → Saída esperada: `LTZ HB AT`

**Fluxo de Decisão do Usuário:**
- O sistema apresenta as correções sugeridas
- Usuário tem duas opções: **Confirmar** aceitação ou **Descartar** e manter valores originais

### 4. Regras da Interface de Chat de Diagnóstico

**Seleção de Modo:**
- Usuário deve escolher entre duas opções mutuamente exclusivas:
  - "Diagnóstico completo": Análise abrangente do veículo
  - "Consulta técnica": Informação específica ou orientação pontual

**Shortcuts (Ações Rápidas):**
- Três botões de acesso rápido devem estar disponíveis:
  - "Investigar sintoma": Inicia análise baseada em sintomas descritos
  - "Código de falha": Busca informações relacionadas a códigos de erro específicos
  - "Manutenção": Orientações sobre procedimentos de manutenção preventiva ou corretiva

**Persona do Sistema (Prompt Fixo):**
Todas as respostas geradas pela IA devem seguir este modelo de comunicação:
> "Fala [NOME]! Beleza, me conta o que tá acontecendo com o [VEÍCULO COMPLETO]. Qual o sintoma?"

Onde:
- `[NOME]`: Nome do usuário (deve ser capturado ou solicitado)
- `[VEÍCULO COMPLETO]`: Descrição completa do veículo identificada (marca, modelo, ano, versão, etc.)

### 5. Regras de Exportação e Compartilhamento

Cada mensagem gerada pela IA no chat deve disponibilizar três ações rápidas:

**Ações Obrigatórias por Mensagem:**
1. **Copiar Texto:** Copia o conteúdo limpo da mensagem (sem formatação especial) para a área de transferência do sistema
2. **Salvar como PDF:** 
   - Abre a janela de impressão nativa do navegador
   - Formatação deve incluir: Logo TIÃO, cabeçalho identificativo e rodapé
   - Conteúdo deve ser a mensagem gerada pela IA
3. **Enviar no WhatsApp:**
   - Utiliza a API web oficial do WhatsApp
   - Inclui assinatura automática configurável
   - Abre diretamente a interface de envio para um contato ou grupo

### 6. Regras de Componentes de UI Dinâmicos

**Mecanismo de Gatilho para Gráficos:**
- Quando a IA responder com um bloco de código específico contendo JSON estruturado, o frontend deve interceptar e renderizar um gráfico em vez de exibir o código como texto
- Bloco de gatilho identificado por: ````diagnostic_chart` seguido de JSON válido e fechado por ````

**Estrutura Obrigatória do JSON para diagnostic_chart:**
```json
{
  "title": "string (título do gráfico, ex: \"Pressão do Turbo vs. RPM\")",
  "type": "string (tipo: \"line\" para linhas ou \"bar\" para barras)",
  "xAxis": "object (configurações do eixo X)",
  "yAxis": "object (configurações do eixo Y)",
  "series": [
    {
      "name": "string (nome da série de dados)",
      "data": "array (valores numéricos ou pontos [x,y])",
      "lineStyle": "object (estilo da linha, se aplicável)",
      "color": "string (cor em formato hex, rgb ou nome)"
    }
  ],
  "thresholds": "array (linhas de referência/limite com valor e label opcional)"
}
```

**Aplicações Práticas Definidas:**
- Visualização de compressão por cilindro do motor
- Comparação de pressão medida do turbo vs. pressão alvo
- Qualquer outro indicador que beneficie de representação gráfica temporal ou comparativa

## Regras de Infraestrutura e Tecnologia

### Tecnologias Frontend Obrigatórias
- **Framework:** React (versão não especificada no documento)
- **Estilização:** Tailwind CSS (para utilitários-first e dark mode)
- **Gráficos:** Recharts **ou** Chart.js (para renderização de diagnostic_chart)
- **Integração WhatsApp:** WhatsApp Web API oficial
- **Geração PDF:** API de impressão nativa do navegador (window.print())

### Tecnologias Backend Implícitas
- **Runtime:** Node.js (inferido pelas referências a APIs e estrutura)
- **APIs Necessárias:**
  - Busca de placas de veículos (simulada ou integração com serviço real)
  - Endpoints para processamento de dados de normalização
  - Possíveis endpoints para histórico de diagnósticos e preferências de usuários

### Regras de Dados e Persistência
- O sistema deve manter persistência de:
  - Catálogo de veículos (estrutura definida acima)
  - Histórico de consultas e diagnósticos por usuário
  - Preferências e configurações de usuários
  - Template e assinatura para compartilhamento no WhatsApp

## Lacunas Identificadas (Para Validação com Usuário)

⚠️ **LACUNAS QUE REQUEREM CONFIRMAÇÃO:**

1. **Inconsistência na Categorização:**
   - Existe tanto "Premium Europeias" (8 marcas) quanto "Europeias Premium" (7 marcas) na documentação
   - Pergunta: Isto foi um erro do aplicativo original ou deve ser mantido assim mesmo?

2. **Escopo da IA:**
   - Pergunta aberta: O usuário quer desenvolvimento completo do frontend (React/Node.js) ou apenas o prompt do agente de IA?

3. **Detalhes Técnicos Não Especificados:**
   - Versões específicas das bibliotecas/frameworks
   - Detalhes de autenticação e autorização de usuários
   - Estrutura exata do banco de dados para persistência
   - Detalhes de deploy, escalabilidade e performance esperada

## Escala de Confiança

- 🟢 **CONFIRMADO:** Regras explícitas declaradas no implementation_plan.md
- 🟡 **INFERIDO:** Lógica deduzida a partir do contexto e exemplos fornecidos
- 🔴 **LACUNA:** Requer validação explícita do usuário ou descoberta em código-fonte (que não existe atualmente)

---
*Análise de domínio gerada pelo Reversa Detective em 2026-05-02*
