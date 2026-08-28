# ESPEDAIR Enterprise Schema Taxonomy

Authoritative repository of JSON Schemas, OpenAPI 3.1 specifications, UML metamodels, and Machine Learning configurations organized with **API Contracts (`api/`)** and **Import / Export Exchange Formats (`exchange/`)** at the root of the taxonomy.

---

## Master API & Exchange Taxonomy

```
schema/
├── api/                                  # API Contracts, REST Endpoints & OpenAPI Specifications
│   ├── designer/                         # Enterprise Designer REST API Specs (Port 8088)
│   │   └── enterprise-designer-openapi.yaml
│   └── studio/                           # Data Studio REST API Specs (Port 8084)
│       └── data-artist-openapi.yaml
│
└── exchange/                             # Model Ingestion, Export Formats & Data Exchange Schemas
    ├── agent/                            # Autonomous Agent Network Exchange Formats
    │   ├── factsheet/                    # Fact Sheet Metamodels, Organizational & Financial Concepts
    │   │   ├── factsheet-model.schema.json
    │   │   ├── financials.schema.json
    │   │   ├── kanban-template.schema.json
    │   │   ├── org.schema.json
    │   │   ├── business-information-model.schema.json
    │   │   ├── business-glossary.schema.json
    │   │   └── compendium-model.schema.json
    │   ├── graph/                        # OmniGraph & Knowledge Graph ASTs
    │   │   └── workspace-repository-graph.schema.json
    │   └── registry/                     # Technology Architecture Portfolio (TAP) Registries
    │       ├── tap-registry.schema.json
    │       ├── tap-registry.normalized.schema.json
    │       └── tap-registry.cloud-services.normalized.schema.json
    │
    ├── designer/                         # Enterprise Designer Exchange Formats
    │   ├── q/                            # Questionnaire, Audit & Branching Logic Schemas (DES_BASE.quest_*)
    │   │   ├── questionnaire.schema.json
    │   │   ├── question-bank.schema.json
    │   │   ├── reference-data.schema.json
    │   │   └── submission.schema.json
    │   ├── ui/                           # UI Wireframe & Penpot/Figma Visual Sketch Formats
    │   │   └── sketch-schema.json
    │   └── uml/                          # Behavioral Use Case & Actor Diagram Schemas
    │       └── use-case.schema.json
    │
    ├── studio/                           # Enterprise & Domain Studios Exchange Formats
    │   ├── data/                         # Data Architecture, Capability Matrices & Data Artist Metamodels
    │   │   ├── data-artist.schema.json
    │   │   ├── capability.schema.json
    │   │   └── sample/
    │   │       └── data-artist-seed.json
    │   └── uml/                          # Enterprise Architecture Standards & Frameworks
    │       ├── archimate-model.schema.json
    │       └── togaf/
    │           └── togaf.schema.json
    │
    └── worker/                           # Worker Process & Indexer Exchange Formats
        ├── indexer/                      # MCP Artifact Indexer & Ingestion Sheets
        │   ├── enterprise_indexer_sheet.yaml
        │   ├── custom_project.yaml
        │   ├── full_project.yaml
        │   ├── alteryx_etl.yaml
        │   └── datastage_etl.yaml
        └── models/                       # Embedding & LLM Inference Configurations
            ├── bge_large.yaml
            ├── llama_8b.yaml
            ├── nomic_embed.yaml
            ├── ollama_nomic.yaml
            ├── qwen3_06b.yaml
            ├── qwen3_8b.yaml
            └── business_docs.yaml
```

---

## Dialect & Metaschema Standards

| Taxonomy Root | Subsystem / Domain | Format / Dialect | Target Scope |
| :--- | :--- | :--- | :--- |
| `schema/api/` | `designer/`, `studio/` | OpenAPI 3.1.0 / 3.0.3 | Port 8088 / 8084 REST Interfaces |
| `schema/exchange/` | `agent/` | JSON Schema Draft 2020-12 | Fact Sheets, OmniGraph & TAP Registry |
| `schema/exchange/` | `designer/` | JSON Schema Draft 2020-12 | Survey Audits, Wireframes & Use Cases |
| `schema/exchange/` | `studio/` | JSON Schema Draft 2020-12 | Data Architecture, ArchiMate 3.2, TOGAF 10 |
| `schema/exchange/` | `worker/` | YAML 1.2 / JSON Schema | MCP Artifact Indexers & ETL Ingestion |
