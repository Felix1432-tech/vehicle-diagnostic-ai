# C4 Containers Diagram - Vehicle Diagnostic Core

```mermaid
flowchart TB
    %% External Systems
    Usuario[Usuário<br/>Navegador Web/Mobile] -->|HTTP/HTTPS| Frontend[SPA Frontend<br/>(React + Tailwind)]
    Usuario -->|WhatsApp API| WhatsApp[WhatsApp Business API]
    Usuario -->|Browser Print| Navegador[Browser Local<br/>(Para PDF)]
    
    %% Frontend Container
    Frontend -->|API Requests| Backend[API Backend<br/>(Node.js + Express)]
    Frontend -->|Asset Delivery| CDN[CDN<br/>(Static Assets)]
    
    %% Backend Container
    Backend -->|Database Queries| Database[(Banco de Dados<br/>PostgreSQL/MongoDB)]
    Backend -->|LLM Calls| LLM_Service[Serviço de IA/LLM<br/>(OpenAPI ou similar)]
    Backend -->|Plate Lookup| API_Placas[API de Busca de Placas<br/>(Serviço de Terceiros)]
    
    %% Data Storage
    Database -->|Read/Write| Veiculos_Data[(Catálogo de Veículos)]
    Database -->|Read/Write| Historico_Data[(Histórico de Consultas)]
    Database -->|Read/Write| Usuarios_Data[(Dados de Usuários)]
    
    %% Styling
    classDef usuario fill:#E3F2FD,stroke:#1565C0,stroke-width:2px;
    classDef frontend fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px;
    classDef backend fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px;
    classDef database fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px;
    classDef externo fill:#FFEBEE,stroke:#C62828,stroke-width:2px;
    classDef servico fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px;
    
    class Usuario usuario
    class Frontend frontend
    class Backend backend
    class Database,Veiculos_Data,Historico_Data,Usuarios_Data database
    class WhatsApp,LLM_Service,API_Placas,CDN,Navegador externo
    class LLM_Service,API_Placas servico
```
