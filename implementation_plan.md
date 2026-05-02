# Arquitetura de Seleção de Veículos (Clone TIÃO)

Como você me enviou todo o mapeamento do catálogo de veículos sem uma instrução específica, eu assumi a iniciativa e montei o plano de arquitetura de dados e interface (Front-end) para replicarmos esse exato formulário.

## User Review Required

> [!IMPORTANT]  
> Você passou mais de uma hora enviando dezenas de capturas de tela detalhando o fluxo do sistema. Eu tenho **toda** a base de dados visual.
> **Para eu começar a escrever o código (React/Node.js) ou montar o prompt de Inteligência Artificial, você precisa APROVAR este plano ou me DIZER EM TEXTO o que você quer.**

## Open Questions

> [!WARNING]
> 1. Você quer que eu desenvolva o Front-end (React/Tailwind) ou apenas o Prompt do agente?
> 2. Notei uma inconsistência nos seus prints: Existe a categoria `PREMIUM EUROPEIAS (8)` (Audi, Porsche...) e `EUROPEIAS PREMIUM (7)` (BMW, Mercedes...). Foi um erro do aplicativo original ou você quer que eu mantenha duplicado assim mesmo?

## Proposed Changes

### 1. Estrutura de Dados (Banco / JSON)
Vamos criar um catálogo estruturado para alimentar o *Dropdown* categorizado exatamente como nas imagens.

```json
{
  "categories": [
    {
      "name": "Populares no Brasil",
      "count": 10,
      "brands": ["Volkswagen", "Fiat", "Chevrolet", "Hyundai", "Toyota", "Jeep", "..."]
    },
    {
      "name": "Premium Europeias",
      "count": 8,
      "brands": ["Audi", "Porsche", "Lamborghini", "Bentley", "Bugatti", "Skoda", "SEAT"]
    },
    {
      "name": "Asiáticas",
      "count": 11,
      "brands": ["Kia", "Mitsubishi", "Subaru", "Suzuki", "Mazda", "Lexus", "Infiniti", "Acura", "Daihatsu", "SsangYong", "Isuzu"]
    },
    {
      "name": "Chinesas",
      "count": 9,
      "brands": ["Lifan", "MG", "Great Wall", "..."]
    },
    {
      "name": "Europeias Premium",
      "count": 7,
      "brands": ["BMW", "Mercedes-Benz", "Mini", "Volvo", "Land Rover", "Jaguar", "Smart"]
    },
    {
      "name": "Esportivas / Luxo",
      "count": 8,
      "brands": ["Ferrari", "Maserati", "McLaren", "Aston Martin", "Rolls-Royce", "Lotus", "Pagani", "Koenigsegg"]
    },
    {
      "name": "Americanas",
      "count": 9,
      "brands": ["GMC", "Cadillac", "Lincoln", "Buick", "Hummer", "Pontiac", "Saturn", "Plymouth", "Scion"]
    },
    {
      "name": "Outras",
      "count": 12,
      "brands": ["Tesla", "Tata", "Genesis", "Dacia", "Daewoo", "Saab", "Rover", "Hafei", "Troller", "Agrale", "Iveco", "Outra"]
    }
  ],
  "fuel_types": [
    "Flex", "Gasolina", "Etanol", "Diesel", "GNV", "Elétrico", "Híbrido"
  ]
}
```

### 2. Front-end (Formulário)
- **Tema:** Dark mode puro (`bg-[#0B1120]` ou similar).
- **Campos:** Placa (com busca via API simulada preenchendo o restante), Marca (Dropdown customizado com `optgroup`), Modelo, Ano, Versão, Motor, Cilindradas, Cor, Quilometragem, Combustível.
- **Validação Visual:** Textos em verde (`Encontrado automaticamente`, `Dados preenchidos automaticamente. Ajuste se necessário.`).
- **Botões:** Laranjas arredondados com hover states.

### 3. Fluxo de Inteligência: Normalização de Dados ("Verificar correções")
Após o formulário, o sistema faz um "Sanitize/Match" usando IA ou Banco de Dados:
- **De:** `Cruze ltz hb at` -> **Para:** `Cruze`
- **De:** `LEX162840839` -> **Para:** `Ecotec 1.4 Turbo`
- **De:** `vazio` -> **Para:** `LTZ HB AT`
O usuário pode **Confirmar** ou **Descartar** essas correções.

### 4. Interface do Chat de Diagnóstico (O Core)
- **Seleção de Modo:** Usuário escolhe entre "Diagnóstico completo" ou "Consulta técnica".
- **Shortcuts (Botões rápidos):** "Investigar sintoma", "Código de falha", "Manutenção".
- **Prompt do Sistema (Persona):** *"Fala [NOME]! Beleza, me conta o que tá acontecendo com o [VEÍCULO COMPLETO]. Qual o sintoma?..."*

### 5. Funcionalidades de Exportação e Compartilhamento
O chat possui três ações rápidas em cada mensagem gerada pela IA:
- **Copiar Texto:** Copia a resposta limpa para a área de transferência.
- **Salvar como PDF:** Abre a janela de impressão nativa formatada (Logo TIÃO, cabeçalho e rodapé).
- **Enviar no WhatsApp:** Usa a API web do WhatsApp com assinatura automática.

### 6. Componentes de UI Dinâmicos no Chat (Gráficos)
O chat tem a capacidade de renderizar componentes visuais (React Components) baseados em saídas de código do LLM.
- **Código de Gatilho:** Se o LLM responder com um bloco de código `tiao_chart` contendo um JSON específico, o front-end intercepta e renderiza um gráfico (ex: Recharts ou Chart.js).
- **Estrutura do JSON (`tiao_chart`):**
  - `title`: Título do gráfico (ex: "Pressão do Turbo vs. RPM").
  - `type`: "line" ou "bar".
  - `xAxis` e `yAxis`: Configurações de eixo.
  - `series`: Lista de dados com `name`, `data`, `lineStyle`, `color`.
  - `thresholds`: Linhas de limite/referência.
- **Uso Prático:** Visualizar compressão por cilindro, pressão medida vs alvo, etc.

## Verification Plan

### Manual Verification
1. Renderizar o formulário no navegador (se você pedir em React).
2. Testar o fluxo de digitar uma placa vs abrir o dropdown e navegar pelas categorias de luxo, americanas e asiáticas.
3. Se você pedir apenas a estrutura do Agente, testar o prompt de extração de veículos no LLM.
