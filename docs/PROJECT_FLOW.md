# Project Flow in ProjectFlow

How a project moves through the app, per USER_MANUAL v1.1. Each node names the app tab where it happens.

```mermaid
flowchart TD
    A["🆕 Create Project<br/>(Projects page)"] --> B["🎯 Set 1-3 Objectives + Key Results<br/>(OKRs tab)"]
    B --> C["💡 Add Opportunities: problems + evidence<br/>scored confidence 1-10 / effort S-M-L<br/>(Discovery tab)"]
    C --> D{"Worth pursuing?<br/>(status: backlog → researching → validated)"}
    D -- "validated" --> E["📝 Draft Hypothesis<br/>if we… then… measured by…<br/>(Discovery tab)"]
    D -- "archive" --> C
    E --> F["🧪 Run Experiment<br/>planned → running → completed<br/>(Discovery tab)"]
    F --> G{"Decision on results"}
    G -- "scale ✅" --> H["🚚 Delivery task auto-created<br/>linked to experiment<br/>(Delivery tab)"]
    G -- "iterate 🔄" --> E
    G -- "kill ❌" --> R["Archive with rationale"]
    G -.-> Q["📋 Log in Decision Log<br/>(Decisions tab)"]
    H --> I["Ready → In Progress (WIP ≤ 3)<br/>→ Review (WIP ≤ 2)"]
    I --> J["🚀 Released"]
    J --> K["📊 Measuring<br/>validate impact in 14-30 days"]
    K --> L["💬 Capture Insights<br/>(Insights tab / Discovery Log)"]
    L --> C
    K --> M["📈 OKR progress review<br/>weekly rhythm: reference KRs<br/>before prioritizing"]
    M --> B
```

**The two tracks:** left side of the loop (Opportunities → Hypotheses → Experiments → Insights) is the **Discovery track** — finding the right problems. Right side (Ready → Measuring) is the **Delivery track** — building validated solutions under WIP limits. Decisions and OKRs wrap both.

**Status today (post-Sprint 3):** every step above works in the app except OKR persistence (needs Sprint 4 auth) and the Measuring→metrics feedback (Sprint 5 dashboard).
