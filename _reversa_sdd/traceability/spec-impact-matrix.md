# Spec Impact Matrix - Vehicle Diagnostic Core

## Matriz de Impacto entre Componentes e Especificações

Esta matriz mostra quais componentes do sistema são impactados por mudanças em quais especificações ou requisitos.

### Componentes Identificados (do C4 Components)

**Frontend:**
- F1: PlateInput (Campo Placa com busca automática)
- F2: BrandDropdown (Dropdown Marca com optgroup)
- F3: ModelFields (Campos Modelo, Ano, Versão)
- F4: TechFields (Campos Motor, Cilindradas, Cor, etc.)
- F5: SubmitButtons (Botões de Ação - Confirmar/Descartar)
- F6: MessageList (Lista de Mensagens do Chat)
- F7: MessageItem (Item de Mensagem individual)
- F8: ChartRenderer (Renderizador de Gráfico - bloco diagnostic_chart)
- F9: ActionButtons (Botões de Ação: Copiar, PDF, WhatsApp)
- F10: ModeSelector (Seletor de Modo: Diagnóstico/Consulta)
- F11: ShortcutButtons (Atalhos Rápidos: Sintoma, Código, Manutenção)
- F12: SendButton (Botão Enviar do Chat)
- F13: Notification (Sistema de Notificação)
- F14: LoadingIndicator (Indicador de Carregamento)
- F15: ErrorBoundary (Tratamento de Erros)

**Backend:**
- B1: PlateLookupService (Serviço de busca de placas)
- B2: VehicleNormalizationService (Serviço de normalização de dados)
- B3: DiagnosisGenerationService (Serviço de geração de diagnósticos via IA)
- B4: ChatHistoryService (Serviço de armazenamento de histórico)
- B5: UserManagementService (Serviço de gerenciamento de usuários)
- B6: WhatsAppIntegrationService (Serviço de integração com WhatsApp)
- B7: PDFGenerationService (Serviço de geração de PDF)
- B8: ConfigManagementService (Serviço de gerenciamento de configurações)

**Banco de Dados/Armazenamento:**
- D1: Catálogo de Veículos
- D2: Histórico de Consultas
- D3: Histórico de Correções
- D4: Dados de Usuários
- D5: Configurações do Sistema

### Especificações/Requisitos (do domain.md e implementation_plan.md)

**S1:** Estrutura de Dados do Catálogo de Veículos
**S2:** Tema Visual Dark Mode Puro
**S3:** Componentes do Formulário (Placa, Marca, Modelo, etc.)
**S4:** Validação Visual (Textos em verde)
**S5:** Botões Laranjas Arredondados com Hover
**S6:** Regras de Normalização de Dados (Sanitize/Match)
**S7:** Exemplos de Normalização (Cruze → Ecotec, etc.)
**S8:** Fluxo de Decisão do Usuário (Confirmar/Descartar correções)
**S9:** Seleção de Modo (Diagnóstico completo vs Consulta técnica)
**S10:** Shortcuts (Investigar sintoma, Código de falha, Manutenção)
**S11:** Persona do Sistema ("Fala [NOME]! Beleza, me conta o que tá acontecendo com o [VEÍCULO COMPLETO]. Qual o sintoma?")
**S12:** Ações de Exportação por Mensagem (Copiar Texto)
**S13:** Ações de Exportação por Mensagem (Salvar como PDF)
**S14:** Ações de Exportação por Mensagem (Enviar no WhatsApp)
**S15:** Mecanismo de Gatilho para Gráficos (Bloco diagnostic_chart)
**S16:** Estrutura Obrigatória do JSON para diagnostic_chart
**S17:** Aplicações Práticas de Gráficos (Compressão por cilindro, pressão turbo)

### Matriz de Impacto (X = impacto direto, o = impacto indireto)

| Componente \ Espec | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | S13 | S14 | S15 | S16 | S17 |
|--------------------|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|-----|-----|-----|-----|
| **F1: PlateInput** | X | o | X | o | o | X | X | X | o | o | o | o | o | o | o | o | o |
| **F2: BrandDropdown** | X | o | X | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **F3: ModelFields** | X | o | X | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **F4: TechFields** | X | o | X | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **F5: SubmitButtons** | o | o | X | o | X | X | X | X | o | o | o | o | o | o | o | o | o |
| **F6: MessageList** | o | X | o | o | o | o | o | o | o | o | o | X | X | X | o | o | o |
| **F7: MessageItem** | o | X | o | o | o | o | o | o | o | o | X | X | X | X | o | o | o |
| **F8: ChartRenderer** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | X | X | X |
| **F9: ActionButtons** | o | o | o | o | o | o | o | o | o | o | o | X | X | X | o | o | o |
| **F10: ModeSelector** | o | o | o | o | o | o | o | o | X | o | o | o | o | o | o | o | o |
| **F11: ShortcutButtons** | o | o | o | o | o | o | o | o | o | X | o | o | o | o | o | o | o |
| **F12: SendButton** | o | o | o | o | o | o | o | o | o | o | X | o | o | o | o | o | o |
| **F13: Notification** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **F14: LoadingIndicator** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **F15: ErrorBoundary** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **B1: PlateLookupService** | X | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **B2: VehicleNormalizationService** | X | o | o | o | o | X | X | X | o | o | o | o | o | o | o | o | o |
| **B3: DiagnosisGenerationService** | o | o | o | o | o | o | o | o | X | X | X | o | o | o | o | o | o |
| **B4: ChatHistoryService** | o | o | o | o | o | o | o | o | o | o | o | X | X | X | o | o | o |
| **B5: UserManagementService** | o | o | o | o | o | o | o | o | o | o | X | o | o | o | o | o | o |
| **B6: WhatsAppIntegrationService** | o | o | o | o | o | o | o | o | o | o | o | o | o | X | o | o | o |
| **B7: PDFGenerationService** | o | o | o | o | o | o | o | o | o | o | o | o | X | o | o | o | o |
| **B8: ConfigManagementService** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **D1: Catálogo de Veículos** | X | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |
| **D2: Histórico de Consultas** | o | o | o | o | o | o | o | o | o | o | o | X | X | X | o | o | o |
| **D3: Histórico de Correções** | o | o | o | o | o | X | X | X | o | o | o | o | o | o | o | o | o |
| **D4: Dados de Usuários** | o | o | o | o | o | o | o | o | o | o | X | o | o | o | o | o | o |
| **D5: Configurações do Sistema** | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o | o |

### Observações

1. **Impacto Direto (X):** O componente especifica ou implementa diretamente a regra ou requisito.
2. **Impacto Indireto (o):** O componente é afetado por mudanças na especificação, mas não a implementa diretamente.
3. **Componentes de Infraestrutura:** Notification, LoadingIndicator e ErrorBoundary têm impacto indireto geral pois são usados em toda a aplicação.
4. **Serviço de Configuração:** Atualmente mostra baixo impacto, mas em um sistema real teria impacto em muitas áreas através de feature flags e parâmetros configuráveis.

### Próximos Passos

Esta matriz deve ser validada e refinada durante a fase de implementação, à medida que:
1. Os componentes reais são desenvolvidos
2. As especificações são detalhadas
3. Testes são escritos e executados
4. Feedback de usuários é incorporado

---
*Matriz de impacto gerada pelo Reversa Architect em 2026-05-02*
