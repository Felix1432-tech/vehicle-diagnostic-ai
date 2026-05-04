# Web App — `@core/web`

> Spec SDD gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.

---

## Visao Geral

Single Page Application (SPA) construida com React 18 + Vite 5 + Tailwind CSS 4 que serve como interface unica do Vehicle Diagnostic Core. Consiste em um unico componente (`App.tsx`) que encapsula todo o estado, validacao, chamada de API e renderizacao. O usuario informa uma placa veicular, o sistema valida via Zod no client, envia para a API e exibe resultado com diagnostico.

## Responsabilidades

| Responsabilidade | Prioridade | Justificativa |
|-----------------|-----------|---------------|
| Capturar e validar placa no client (Zod) | **Must** | Previne requests invalidos antes de chegar na API 🟢 |
| Chamar `POST /vehicle/identify` e exibir resultado | **Must** | Fluxo principal do sistema 🟢 |
| Exibir feedback de loading e erro | **Must** | UX minima — usuario precisa saber o que esta acontecendo 🟢 |
| Renderizar result card com dados do veiculo | **Must** | Entrega de valor ao usuario 🟢 |
| Renderizar diagnostic card com sugestao | **Must** | Diferencial do produto — diagnostico por IA 🟢 |
| Converter placa para uppercase no input | **Should** | Consistencia visual e de dados 🟢 |
| Montar App via `main.tsx` com StrictMode | **Could** | Bootstrap padrao React — raramente alterado 🟢 |

## Interface

### Componente `App` 🟢

**Tipo:** Function component (default export)
**Props:** Nenhuma
**Estado interno:**

| Estado | Tipo | Valor inicial | Finalidade |
|--------|------|---------------|-----------|
| `plate` | `string` | `""` | Valor atual do input de placa 🟢 |
| `vehicle` | `IdentifyVehicleResponse \| null` | `null` | Dados do veiculo retornado pela API 🟢 |
| `error` | `string` | `""` | Mensagem de erro exibida ao usuario 🟢 |
| `loading` | `boolean` | `false` | Indica request em andamento 🟢 |

### Funcao `handleSearch()` 🟢

Funcao assincrona interna que orquestra o fluxo de busca.

**Trigger:** Submit do form (Enter ou click no botao)
**Sem parametros** — le `plate` do estado

**Fluxo:**
1. Limpa `error` e `vehicle` do estado
2. `identifyVehicleRequestSchema.safeParse({ plate })` — validacao client
3. Se falha: seta `error` com mensagem fixa e retorna (sem request)
4. Seta `loading = true`
5. `fetch POST ${apiBaseUrl}/vehicle/identify` com body JSON
6. Se `response.ok`: parse body com `identifyVehicleResponseSchema.parse()` e seta `vehicle`
7. Se `response.status === 400`: erro de placa invalida
8. Se outro erro HTTP: extrai `message` do payload ou usa mensagem generica
9. Em `catch`: seta `error` com mensagem da excecao ou fallback generico
10. Em `finally`: seta `loading = false`

### Configuracao de URL da API 🟢

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
```

- Variavel de ambiente `VITE_API_BASE_URL` configura o endpoint da API 🟢
- Remove trailing slash se presente 🟢
- Fallback para string vazia (relative URL) se nao definida 🟢

### Entry Point `main.tsx` 🟢

```typescript
ReactDOM.createRoot(document.getElementById("root")!)
  .render(<React.StrictMode><App /></React.StrictMode>);
```

- Monta no elemento `#root` do HTML 🟢
- `React.StrictMode` ativo — detecta side effects e APIs deprecadas em dev 🟢
- Non-null assertion (`!`) no `getElementById` — assume que `#root` existe no HTML 🟢

## Regras de Negocio

- **RN-01:** Placa e convertida para uppercase em tempo real no input via `onChange` 🟢
- **RN-02:** Validacao Zod no client antes de qualquer request — mesma regra do backend (formato ABC1234 ou ABC1D23) 🟢
- **RN-03:** Mensagem de erro fixa para placa invalida: "Placa invalida. Use formato ABC1234 ou ABC1D23" 🟢
- **RN-04:** Resposta da API e validada com `identifyVehicleResponseSchema.parse()` — rejeita payloads incompletos 🟢
- **RN-05:** Botao e input ficam disabled durante loading — previne requests duplicados 🟢
- **RN-06:** Erro HTTP 400 e mapeado para mensagem de placa invalida; outros erros usam `message` do payload ou fallback generico 🟢
- **RN-07:** Ao iniciar nova busca, resultado anterior e erro sao limpos 🟢

## Fluxo Principal

1. Usuario digita placa no input (convertida para uppercase automaticamente) 🟢
2. Usuario submete o form (Enter ou click em "buscar") 🟢
3. `handleSearch()` e invocado via `onSubmit` com `preventDefault()` 🟢
4. Estado limpo: `error = ""`, `vehicle = null` 🟢
5. Validacao Zod client-side: `safeParse({ plate })` 🟢
6. Se valido: `loading = true`, botao e input disabled 🟢
7. `fetch POST /vehicle/identify` com `Content-Type: application/json` 🟢
8. Resposta parseada e validada com Zod 🟢
9. Result card renderizado com placa, marca, modelo, ano 🟢
10. Diagnostic card renderizado com sugestao inicial 🟢
11. `loading = false` via `finally` 🟢

## Fluxos Alternativos

- **Placa invalida (client):** `safeParse` falha → `error` setado com mensagem fixa → feedback de erro renderizado → request NAO e feito 🟢
- **API retorna 400:** Erro mapeado para mensagem de placa invalida 🟢
- **API retorna outro erro (500, 503, etc.):** Tenta extrair `message` do JSON; se falhar, usa "Nao foi possivel identificar o veiculo." 🟢
- **Erro de rede (fetch rejeita):** `catch` captura → exibe `error.message` ou fallback generico 🟢
- **API retorna JSON incompleto:** `identifyVehicleResponseSchema.parse()` lanca `ZodError` → capturado pelo `catch` → mensagem generica exibida 🟢
- **`VITE_API_BASE_URL` nao definida:** URL relativa usada (ex: `/vehicle/identify`) — funciona se API e frontend estao no mesmo dominio 🟢

## Dependencias

| Dependencia | Tipo | Versao | Motivo |
|------------|------|--------|--------|
| `react` | runtime | 18.3 | Biblioteca de UI 🟢 |
| `react-dom` | runtime | 18.3 | Renderizacao no DOM 🟢 |
| `@core/shared` | workspace | — | Schemas Zod e tipos para validacao e tipagem 🟢 |
| `vite` | dev | 5.4 | Build e dev server 🟢 |
| `tailwindcss` | dev | 4.1 | Estilizacao utilitaria 🟢 |
| TypeScript | dev | 5.8 | Compilacao 🟢 |

**Dependentes:**
- Nenhum — `@core/web` e folha da arvore de dependencias

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Usabilidade | Input uppercase automatico para consistencia | `App.tsx:86` — `toUpperCase()` no onChange | 🟢 |
| Usabilidade | Prevencao de submit duplo via disabled em loading | `App.tsx:89,92` — `disabled={loading}` | 🟢 |
| Acessibilidade | `aria-invalid` no input reflete estado de erro | `App.tsx:88` — `aria-invalid={error ? "true" : "false"}` | 🟢 |
| Seguranca | Validacao client-side com mesmo schema do server (Zod) | `App.tsx:21` — `safeParse` com schema importado do shared | 🟢 |
| Seguranca | Nao expoe detalhes de erro do servidor ao usuario | `App.tsx:48` — mensagem generica como fallback | 🟢 |
| Performance | Sem re-renders desnecessarios — estado minimo e direto | `App.tsx:12-15` — 4 `useState` simples | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: Busca com placa valida retorna resultado
  Dado o input de placa preenchido com "ABC1D23"
  E a API retorna 200 com dados de veiculo
  Quando o usuario clica em "buscar"
  Entao o result card e exibido com placa, marca, modelo e ano
  E o diagnostic card e exibido com sugestao inicial
  E nenhum erro e mostrado

Cenario: Busca com placa invalida mostra erro
  Dado o input de placa preenchido com "123"
  Quando o usuario clica em "buscar"
  Entao a mensagem "Placa invalida. Use formato ABC1234 ou ABC1D23" e exibida
  E nenhum request e feito a API
  E nenhum result card e exibido

Cenario: Input converte para uppercase em tempo real
  Dado o input de placa vazio
  Quando o usuario digita "abc1d23"
  Entao o input exibe "ABC1D23"

Cenario: Loading desabilita controles
  Dado uma busca em andamento (loading = true)
  Entao o input esta disabled
  E o botao esta disabled e exibe "buscando..."
  E a mensagem "Buscando dados do veiculo..." e exibida

Cenario: Erro de rede exibe feedback
  Dado o input de placa preenchido com "ABC1234"
  E a API esta inacessivel
  Quando o usuario clica em "buscar"
  Entao uma mensagem de erro e exibida
  E o loading e desativado

Cenario: Nova busca limpa resultado anterior
  Dado um resultado de busca anterior exibido
  Quando o usuario inicia nova busca
  Entao o resultado anterior e removido
  E o erro anterior e removido
```

## Cenarios de Borda

### Cenario 1: API retorna JSON valido mas schema incompativel

**Contexto:** A API retorna `{ plate: "ABC1234", brand: "Toyota" }` sem os campos `model`, `year`, `diagnostic`.
**Comportamento atual:** `identifyVehicleResponseSchema.parse()` lanca `ZodError` porque os campos obrigatorios estao ausentes. O `catch` captura e exibe "Ocorreu um erro inesperado ao identificar o veiculo." 🟢
**Impacto:** O usuario ve uma mensagem generica sem saber que o problema esta na resposta da API. Nao ha log no console.
**Recomendacao:** Considerar log do `ZodError` no console para debugging, mantendo mensagem generica para o usuario. 🟡

### Cenario 2: `VITE_API_BASE_URL` com path adicional

**Contexto:** `VITE_API_BASE_URL` definida como `"https://api.example.com/v1/"`.
**Comportamento atual:** `replace(/\/$/, "")` remove trailing slash → `"https://api.example.com/v1"`. Fetch chama `"https://api.example.com/v1/vehicle/identify"`. 🟢
**Risco:** Se a variavel contiver path incorreto (ex: `"https://api.example.com/v1/api"`), a URL final sera `"https://api.example.com/v1/api/vehicle/identify"` — 404. Nao ha validacao da URL base. 🟡

### Cenario 3: Submit rapido multiplo (race condition teorica)

**Contexto:** Usuario clica "buscar" muito rapidamente antes do React atualizar `loading = true`.
**Comportamento atual:** `disabled={loading}` previne cliques durante loading, mas ha um frame entre o click e o setState. Na pratica, o `event.preventDefault()` e a natureza sincrona do inicio de `handleSearch` (limpa estado, faz safeParse) minimizam o risco. O `finally` sempre reseta loading. 🟢
**Impacto:** No pior caso, dois requests sao disparados. O ultimo a resolver sobrescreve `vehicle`. Sem efeitos colaterais persistentes.
**Risco:** Baixo — comportamento aceitavel para MVP. 🟢

## Estrutura de UI

```
<main.app-shell>
  <section.hero>
    <p.eyebrow> "Core Platform"
    <h1> "Vehicle Diagnostic"
    <p.copy> descricao
    <form.panel onSubmit={handleSearch}>
      <label.field>
        <span> "Placa"
        <input type="text" value={plate} disabled={loading}>
      </label>
      <button.search-button disabled={loading}>
        {loading ? "buscando..." : "buscar"}
      </button>
      {loading && <p.feedback.loading>}
      {error && <p.feedback.error>}
      {vehicle && <div.result-card>
        <h2> "Resultado"
        <dl>
          <dt>Placa</dt><dd>{plate}</dd>
          <dt>Marca</dt><dd>{brand}</dd>
          <dt>Modelo</dt><dd>{model}</dd>
          <dt>Ano</dt><dd>{year}</dd>
        </dl>
        <div.diagnostic-card>
          <p.diagnostic-label> "Sugestao inicial"
          <p.diagnostic-copy> {diagnostic}
        </div>
      </div>}
    </form>
  </section>
</main>
```

Classes CSS (Tailwind): definidas em `src/index.css` 🟢

## Rastreabilidade de Codigo

| Arquivo | Funcao / Elemento | Cobertura |
|---------|-------------------|-----------|
| `apps/web/src/main.tsx:1-10` | Entry point — `ReactDOM.createRoot` + `<App />` em StrictMode | 🟢 |
| `apps/web/src/App.tsx:1-6` | Imports — schemas do shared, tipos, React hooks | 🟢 |
| `apps/web/src/App.tsx:8` | `invalidPlateMessage` — constante de mensagem de erro | 🟢 |
| `apps/web/src/App.tsx:9` | `apiBaseUrl` — configuracao via env var | 🟢 |
| `apps/web/src/App.tsx:11-15` | Estado: `plate`, `vehicle`, `error`, `loading` | 🟢 |
| `apps/web/src/App.tsx:17-62` | `handleSearch()` — validacao, fetch, parse, error handling | 🟢 |
| `apps/web/src/App.tsx:64-133` | JSX — form, input, botao, feedback, result card, diagnostic card | 🟢 |
| `apps/web/src/index.css` | Estilos globais Tailwind | 🟢 |
| `apps/web/src/vite-env.d.ts` | Declaracao de tipos para `import.meta.env` | 🟢 |

---
*Gerado pelo Reversa Writer em 2026-05-03*
