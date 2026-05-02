# C4 Context Diagram - Vehicle Diagnostic Core

```mermaid
flowchart LR
    %% External Users
    Usuario[Usuário do Sistema] -->|Interage com| Sistema[Vehicle Diagnostic<br/>Core]
    
    %% External Systems
    Sistema -->|Consulta API| API_Placas[API de Busca de Placas<br/>(Serviço de Terceiros)]
    Sistema -->|Envia Mensagem| WhatsApp[WhatsApp Business API]
    Sistema -->|Gera PDF| Navegador[Browser do Usuário<br/>(API de Impressão)]
    
    %% Styling
    classDef usuario fill:#E3F2FD,stroke:#1565C0,stroke-width:2px;
    classDef sistema fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px;
    classDef externo fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px;
    classDef servico fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px;
    
    class Usuario usuario
    class Sistema sistema
    class API_Placas,WhatsApp,Navegador externo
    class WhatsApp servico
```
