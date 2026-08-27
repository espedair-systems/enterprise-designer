Viewed handlers.go:980-1040
Searched for "HandleVectorGraph"
Viewed handlers.go:1574-1660
Viewed handlers.go:1660-1750
Viewed handlers.go:1750-1840
Viewed handlers.go:1840-1910
Viewed VectorKnowledgeGraphView.tsx:1-100

## Comprehensive Review: Knowledge Graph Functionality in Baseline Template (`baseline-template`)

The Knowledge Graph in **Baseline Template** serves as the authoritative, multi-tier cognitive map uniting **business architecture entities** (stored in PostgreSQL `BT_BASE`), **relational 3NF schemas**, **dense 768-dimensional AST code embeddings** (in LanceDB), and **live data pipeline lineage** (from the Rust OmniGraph engine on port `:8095`).

---

### 1. Architectural Model & Multi-Tier Topology

The graph organizes enterprise knowledge into **7 logical tiers** linked by typed directed edges:

```
                  ┌────────────────────────────────────────┐
                  │    Tier 1: Strategic Goals (North)     │
                  │       PostgreSQL BT_BASE.strategic     │
                  └───────────────────┬────────────────────┘
                                      │ enables
      ┌───────────────────────────────▼──────────────────────────────┐
      │               Tier 3: Business Capabilities                  │
      │                  (Center Core Cluster)                       │
      │  • Hierarchical Taxonomy       • Pace Layers (Record/Diff)   │
      └───────────▲───────────────────────────────────────┬──────────┘
                  │ realizes                              │ realizes
  ┌───────────────┴────────────────┐     ┌────────────────▼───────────────┐
  │  Tier 2: Value Streams (West)  │     │ Tier 4: SIPOC Processes (East) │
  │    BT_BASE.value_streams       │     │     BT_BASE.processes          │
  └───────────────┬────────────────┘     └────────────────┬───────────────┘
                  │ persists                              │ persists
                  └───────────────────┬───────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Tier 5: 3NF Metamodel Tables (South)  │
                  │      BT_BASE Relational Persistence    │
                  └───────────────────┬────────────────────┘
                                      │ embeds
                  ┌───────────────────▼────────────────────┐
                  │ Tier 6: 768d Vector AST Chunks (South) │
                  │     LanceDB Dense Columnar Index       │
                  └───────────────────┬────────────────────┘
                                      │ transforms / lineage
                  ┌───────────────────▼────────────────────┐
                  │ Tier 7: Live OmniGraph AST Lineage     │
                  │   DataStage ETL Stages & Code Modules  │
                  └────────────────────────────────────────┘
```

#### Typed Edge Taxonomy:
* **`enables`**: Strategic Goals $\to$ Capabilities.
* **`realizes`**: Value Streams $\to$ Capabilities, and Capabilities $\to$ SIPOC Processes.
* **`hierarchy`**: Parent Capability $\to$ Sub-Capabilities.
* **`persists`**: Business Entities $\to$ PostgreSQL 3NF relational tables.
* **`embeds`**: 3NF schema tables $\to$ LanceDB 768d AST embeddings.
* **`lineage` / `transforms`**: Ingested ETL pipeline stages $\to$ target datasets.

---

### 2. Backend Implementation ([`handlers.go`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/internal/adapters/inbound/http/handlers.go))

* **Endpoint**: `GET /api/v1/vector/graph?workspace_id=...` ([`HandleVectorGraph`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/internal/adapters/inbound/http/handlers.go#L1574-L1920))
* **Zero-Mock Dynamic Generation**: Queries active `BT_BASE` tables via `h.repo.ListCapabilities`, `h.repo.ListValueStreams`, `h.repo.ListProcesses`, and `h.repo.ListStrategicGoals`.
* **Live OmniGraph Fusion**: Connects via HTTP to `http://localhost:8095/api/v1/graph/topology` with a 500ms timeout guard, merging live AST code nodes and DataStage ETL stages into the baseline topology without duplicating vertices.
* **Degree Centrality Computation**: Automatically computes in-degree and out-degree connectivity for every vertex.

---

### 3. Frontend Interactive Visualizer ([`VectorKnowledgeGraphView.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/vectordb/VectorKnowledgeGraphView.tsx))

* **Physics-Based Canvas Simulation**:
  * Uses a continuous 2D spring-force model (Hooke's spring law on connected edges, Coulomb-style electrostatic repulsion, center gravity, and velocity damping).
  * **Interactive Pinning & Dragging**: Clicking and dragging any vertex pulls its connected neighborhood in real time.
  * **Physics Play/Pause**: Allows freezing the simulation once equilibrium is reached.
* **Layout Presets**:
  1. **Force-Directed**: Organic clustering based on connection degree and physical tension.
  2. **Radial Tier**: Concentric rings placing strategic goals at the center, expanding outward to capabilities, processes, and tables.
  3. **Hierarchical DAG**: Top-down structural tree from business intent to code vectors.
* **Active Neighborhood Focus (1-Hop & 2-Hop)**:
  * Hovering or selecting any node instantly highlights all connected incoming and outgoing edges while dimming unrelated nodes to 20% opacity.
* **Pan & Zoom Viewport**:
  * Smooth infinite-canvas pan and mouse-wheel zoom (from `0.35x` to `2.2x`) with reset-to-center controls.
* **Real-Time Filter & Search**:
  * Category chips (`ALL`, `goal`, `valuestream`, `capability`, `process`, `table`, `chunk`, `etl_stage`, `code_module`).
  * Live text search highlighting matching labels, stack definitions, and codes.
* **Lineage & Connectivity Inspector Panel**:
  * Displays pace layer categorization, maturity ratings (`/5.00`), schema/provenance paths, total degree count, and full list of connected neighbor nodes with 1-click jump navigation.

---

### 4. Fused Vector-Graph Hybrid Retrieval ([`VectorSearchEngineView.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/vectordb/VectorSearchEngineView.tsx))

* In addition to standalone visualization, the knowledge graph is integrated directly into the **LanceDB Search Engine**:
  * When **"OmniGraph Hybrid (2-Hop Walk)"** is toggled, search queries execute against `POST /api/v1/vector/hybrid`.
  * The results feed displays the **"OmniGraph Fused Architectural Neighborhood"** badge showing the exact subgraph of connected vertices and edges linked to the ranked vector matches.

---

### Summary of Health & Status
* **PostgreSQL Schema**: Persisting into `BT_BASE`.
* **Port Integrations**: Online on `:8082` (BT Server), `:8095` (Artifact Indexer REST), and `:50051` (TCP RPC).
* **Reliability & Resilience**: All field access and string operations are safely guarded; unhandled errors are trapped by [`AppErrorBoundary.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/common/AppErrorBoundary.tsx) with 1-click clipboard diagnostics.