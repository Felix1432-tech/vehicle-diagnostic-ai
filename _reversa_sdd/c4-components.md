# C4 Components Diagram - Vehicle Diagnostic Core

## Frontend Components (React SPA)
```mermaid
flowchart TB
    %% Top Level
    FrontendApp[Aplicação Frontend<br/>(React SPA)] --> Router[Router<br/>(React Router)]
    
    %% Pages/Routes
    Router --> HomePage[Página Inicial<br/>(Landing/Vehicle Diagnostic)]
    Router --> FormPage[Página de Formulário<br/>(Identificação do Veículo)]
    Router --> ChatPage[Página de Chat<br/>(Diagnóstico com IA)]
    Router --> HistoryPage[Página de Histórico<br/>(Consultas Anteriores)]
    
    %% Form Page Components
    FormPage --> FormContainer[Container do Formulário]
    FormContainer --> PlateInput[Campo Placa<br/>(Com busca automática)]
    FormContainer --> BrandDropdown[Dropdown Marca<br/>(Optgroup por categoria)]
    FormContainer --> ModelFields[Campos Modelo, Ano, Versão]
    FormContainer --> TechFields[Campos Motor, Cilindradas, Cor, etc.]
    FormContainer --> SubmitButtons[Botões de Ação<br/>(Confirmar/Descartar correções)]
    
    %% Chat Page Components
    ChatPage --> ChatInterface[Interface de Chat]
    ChatInterface --> MessageList[Lista de Mensagens]
    MessageList --> MessageItem[Item de Mensagem<br/>(Texto, gráficos, ações)]
    MessageItem --> MessageText[Texto da Mensagem]
    MessageItem --> ChartRenderer[Renderizador de Gráfico<br/>(Bloco diagnostic_chart)]
    MessageItem --> ActionButtons[Botões de Ação<br/>(Copiar, PDF, WhatsApp)]
    ChatInterface --> InputArea[Area de Input<br/>(Modo: Diagnóstico/Consulta)]
    InputArea --> ModeSelector[Seletor de Modo]
    InputArea --> ShortcutButtons[Atalhos Rápidos<br/>(Sintoma, Código, Manutenção)]
    InputArea --> SendButton[Botão Enviar]
    
    %% Shared Components
    FormPage --> SharedUI[Componentes Compartilhados]
    ChatPage --> SharedUI
    SharedUI --> Notification[Sistema de Notificação]
    SharedUI --> LoadingIndicator[Indicador de Carregamento]
    SharedUI --> ErrorBoundary[Tratamento de Erros]
    
    %% Styling
    classDef container fill:#E8F5E8,stroke:#2E7D32,stroke-width:1px;
    classDef component fill:#FFF3E0,stroke:#EF6C00,stroke-width:1px;
    classDef element fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1px;
    
    class FormContainer,ChatInterface,MessageList component
    class PlateInput,BrandDropdown,ModelFields,TechFields,SubmitButtons element
    class MessageItem,MessageText,ChartRenderer,ActionButtons element
    class InputArea,ModeSelector,ShortcutButtons,SendButton element
    class SharedUI,Notification,LoadingIndicator,ErrorBoundary component
    class Router,HomePage,FormPage,ChatPage,HistoryPage component
    class FrontendApp container
```
