# Rift TCG — Deck & Collection Manager

Aplicação full-stack desenvolvida para gerenciar coleções e construir decks para o TCG **Riftbound (Rift)**.

A arquitetura foi projetada com estrita separação entre camadas:
- **/backend**: Servidor HTTP REST (Node.js + Express + TypeScript) contendo todas as regras de negócio, modelos de dados, validação oficial de zonas/regras de deck, cálculo de completude e parser de importação/exportação.
- **/src**: Frontend em React 19 + TypeScript + Tailwind CSS, consumindo o backend exclusivamente via chamadas HTTP (`fetch` em `/src/api/`).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** v18+ instalado
- **npm** ou **yarn**

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Execução em Modo de Desenvolvimento (Frontend + Backend Integrado)
O projeto utiliza um servidor unificado que inicializa o Express REST API na porta `3000` e anexa o middleware de desenvolvimento do Vite:

```bash
npm run dev
```

Abra seu navegador em:
```
http://localhost:3000
```

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor full-stack (API Express + Vite HMR) com `tsx` na porta 3000 |
| `npm run build` | Compila os assets estáticos do React com Vite e compila o `server.ts` com `esbuild` em `dist/server.cjs` |
| `npm run start` | Executa o bundle de produção compilado (`node dist/server.cjs`) |

---

## 📦 Estrutura de Pastas

```
├── backend/                  # Servidor Backend REST (Express + TypeScript)
│   ├── routes/              # Rotas REST da API
│   │   ├── cards.ts         # GET /cards (com paginação e filtros)
│   │   ├── collection.ts    # CRUD /collection e /completion
│   │   ├── decks.ts         # CRUD /decks, /validate, /missing, /completion
│   │   └── importExport.ts  # POST /import/collection, GET /export/*
│   ├── services/            # Camada de Serviços e Regras de Negócio
│   │   ├── cardService.ts
│   │   ├── collectionService.ts
│   │   ├── deckService.ts
│   │   ├── deckValidator.ts # Validador oficial de regras e zonas
│   │   ├── importParser.ts  # Parser de lista de texto
│   │   └── exportService.ts # Formatador de exportação
│   ├── catalog.ts           # Banco de dados de cartas e seed de dados
│   ├── store.ts             # Estado em memória
│   └── types.ts             # Tipos TypeScript do backend
│
├── src/                      # Frontend SPA (React + Tailwind CSS)
│   ├── api/                 # Cliente HTTP que bate nas rotas /api
│   │   ├── client.ts        # Wrapper de fetch com tipagem e tratamento de erros
│   │   ├── cardsApi.ts
│   │   ├── collectionApi.ts
│   │   ├── decksApi.ts
│   │   └── importExportApi.ts
│   ├── components/          # Componentes visuais
│   │   ├── catalog/         # Catálogo de cartas, filtros, paginação e modal
│   │   ├── collection/      # Gestão da coleção física/digital e barra de progresso
│   │   ├── decks/           # Lista de decks, editor de zonas e validação oficial
│   │   ├── importExport/    # Importador/Exportador com feedback em tempo real
│   │   └── common/          # Navbar, badges e utilitários
│   ├── types/               # Tipos TypeScript compartilhados no front
│   ├── utils/               # Formatadores e helpers visuais de facção/raridade
│   ├── App.tsx              # Componente raiz com navegação e toasts
│   ├── main.tsx             # Ponto de entrada do React
│   └── index.css            # Tailwind CSS
│
└── server.ts                 # Ponto de entrada que monta o Express e o Vite
```

---

## 🃏 Regras Oficiais de Validação de Decks

O backend valida as seguintes regras e zonas:

1. **LEGEND**: Exatamente 1 carta do tipo `LEGEND`.
2. **CHAMPION**: Exatamente 1 carta do tipo `CHAMPION`.
3. **MAIN**: Exatamente 39 cartas (tipos `UNIT` ou `SPELL`).
4. **RUNE**: Exatamente 12 cartas (tipo `RUNE`).
5. **BATTLEFIELD**: Exatamente 3 cartas (tipo `BATTLEFIELD`).
6. **SIDEBOARD**: Até 8 cartas adicionais de `UNIT` ou `SPELL` (aviso se > 8).
7. **SIDEBOARD_BATTLEFIELD**: Até 2 cartas adicionais de `BATTLEFIELD` (aviso se > 2).
8. **Limite de Cópias**: No máximo 3 cópias de uma mesma carta entre Main + Sideboard (com exceção de Runas, Lendas e Campeões).
9. **Cartas Banidas**: Cartas marcadas como banidas geram erro impeditivo de validação.
10. **Compatibilidade de Facção**: Validação de cores/facções alinhadas à Lenda e ao Campeão.
