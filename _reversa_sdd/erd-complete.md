# ERD Complete - Vehicle Diagnostic Core

```mermaid
erDiagram
    %% Entidades Principais
    USUARIOS {
        string id PK
        string nome
        string email
        string senha_hash
        string telefone
        date data_criacao
        date ultimo_login
        boolean ativo
        string preferencias_json
    }
    
    VEICULOS {
        string id PK
        string placa
        string marca
        string modelo
        string ano
        string versao
        string motor
        string cilindradas
        string cor
        string quilometragem
        string combustivel
        string categoria
        date data_cadastro
        boolean ativo
    }
    
    CONSULTAS {
        string id PK
        string usuario_id FK
        string veiculo_id FK
        timestamp timestamp
        string modo_consulta  -- "diagnostico_completo" ou "consulta_tecnica"
        string sintoma
        string codigo_falha
        string tipo_manutencao
        text resposta_ia
        json metadata_json
        boolean compartilhado_whatsapp
        boolean salvo_pdf
    }
    
    HISTORICO_CORRECOES {
        string id PK
        string consulta_id FK
        string campo_original
        string valor_original
        string valor_sugerido
        string valor_final
        boolean aceito_pelo_usuario
        timestamp timestamp
    }
    
    CONFIGURACOES {
        string id PK
        string chave
        string valor
        string descricao
        date data_atualizacao
    }
    
    %% Relacionamentos
    USUARIOS ||--o{ CONSULTAS : "faz"
    VEICULOS ||--o{ CONSULTAS : "consultado_em"
    CONSULTAS ||--o{ HISTORICO_CORRECOES : "possui"
    USUARIOS ||--o{ CONFIGURACOES : "possui"
```

## Descrição das Entidades

### USUARIOS
Armazena informações dos usuários do sistema
- **id:** Identificador único (UUID ou similar)
- **nome:** Nome completo do usuário
- **email:** Endereço de e-mail para login e notificações
- **senha_hash:** Hash seguro da senha
- **telefone:** Número de contato (opcional, para WhatsApp)
- **data_criacao:** Timestamp da criação da conta
- **ultimo_login:** Timestamp do último acesso
- **ativo:** Flag indicando se a conta está ativa
- **preferencias_json:** JSON contendo preferências do usuário (tema, notificações, etc.)

### VEICULOS
Catálogo de veículos consultados no sistema
- **id:** Identificador único
- **placa:** Placa do veículo (quando identificada via API)
- **marca:** Marca do veículo (populares, premium, asiáticas, etc.)
- **modelo:** Modelo específico do veículo
- **ano:** Ano de fabricação
- **versão:** Versão ou trim específico
- **motor:** Tipo e especificações do motor
- **cilindradas:** Capacidade do motor em cc ou litros
- **cor:** Cor do veículo
- **quilometragem:** Quilometragem atual
- **combustivel:** Tipo de combustível (flex, gasolina, etanol, diesel, gnv, elétrico, híbrido)
- **categoria:** Categoria conforme definido no domínio (populares, premium europeias, etc.)
- **data_cadastro:** Quando o veículo foi adicionado ao catálogo
- **ativo:** Se o registro está ativo

### CONSULTAS
Registro de cada interação de diagnóstico ou consulta
- **id:** Identificador único
- **usuario_id:** FK para USUARIOS
- **veiculo_id:** FK para VEICULOS (pode ser null se apenas consulta técnica sem veículo específico)
- **timestamp:** Quando a consulta foi realizada
- **modo_consulta:** "diagnostico_completo" ou "consulta_tecnica"
- **sintoma:** Descrição do sintoma relatado pelo usuário
- **codigo_falha:** Código de falha OBD-II ou similar (se aplicável)
- **tipo_manutencao:** Tipo de manutenção solicitada (se aplicável)
- **resposta_ia:** Texto da resposta gerada pela IA
- **metadata_json:** Dados adicionais (confiança da IA, tempo de processamento, etc.)
- **compartilhado_whatsapp:** Se a resposta foi compartilhada via WhatsApp
- **salvo_pdf:** Se a resposta foi salva como PDF

### HISTORICO_CORRECOES
Rastreamento das correções sugeridas pelo sistema de normalização
- **id:** Identificador único
- **consulta_id:** FK para CONSULTAS
- **campo_original:** Qual campo foi alterado (marca, modelo, motor, etc.)
- **valor_original:** Valor fornecido inicialmente pelo usuário ou pela placa
- **valor_sugerido:** Valor sugerido pelo sistema de normalização
- **valor_final:** Valor aceito pelo usuário (pode ser original ou sugerido)
- **aceito_pelo_usuario:** Se o usuário confirmou a sugestão
- **timestamp:** Quando a correção ocorreu

### CONFIGURACOES
Configurações do sistema que podem ser alteradas sem deploy
- **id:** Identificador único
- **chave:** Nome da configuração (ex: "whatsapp_signature", "ia_model", "default_language")
- **valor:** Valor da configuração
- **descricao:** Descrição do que a configuração faz
- **data_atualizacao:** Quando foi modificada pela última vez

## Observações sobre o ERD

Este ERD foi **inferido** a partir do `implementation_plan.md` e dos requisitos descritos, uma vez que não há código-fonte ou schema de banco de dados disponível para análise direta.

### Assumptions Made:
1. O sistema precisa persistir usuários, veículos consultados e histórico de interações
2. As correções de normalização precisam ser rastreadas para aprendizado e melhoria do modelo
3. Configurações do sistema precisam ser ajustáveis sem redeploy
4. Relacionamentos são modelados com integridade referencial básica

### Lacunas Identificadas (Requerem Validação):
- **Tecnologia de Banco de Dados:** Não especificada (PostgreSQL, MongoDB, etc.)
- **Detalhes de Índices:** Quais campos precisam de índices para performance
- **Políticas de Retenção:** Por quanto tempo manter histórico de consultas
- **Escalabilidade:** Estratégia de particionamento ou sharding para grandes volumes
- **Segurança:** Criptografia de campos sensíveis (dados pessoais, histórico médico implícito)

---
*ERD gerado pelo Reversa Architect em 2026-05-02 com nível de confiança: 🟡 INFERIDO*
