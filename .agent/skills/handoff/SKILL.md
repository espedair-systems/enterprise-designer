---
name: handoff
description: Create a comprehensive context handoff document summarizing conversation history, technical decisions, artifact paths, active work, and recommended next steps for a fresh Antigravity agent or subagent session.
---

# Antigravity Session Handoff Skill

When this skill is invoked, summarize and synthesize the current session context into a structured **Handoff Document** to enable a fresh Antigravity agent or subagent to seamlessly resume work without context loss.

---

## 1. Execution Workflow

1. **Synthesize Session Context**:
   - Review all accomplishments, codebase edits, and design choices made during the current conversation.
   - Reference existing artifacts (`implementation_plan.md`, `walkthrough.md`, schema files, review docs) using clickable `file:///` URLs rather than duplicating large text blocks.

2. **Format Handoff Document**:
   Use standard Markdown with GitHub-style alerts (`> [!NOTE]`, `> [!IMPORTANT]`) and structure the document into:
   - **Executive Summary**: High-level overview of objectives addressed and session accomplishments.
   - **Key Artifacts & File Inventory**: Clickable links (`[filename](file:///absolute/path)`) to created or modified source files and documents.
   - **Architectural & Design Decisions**: Key technical rationale, enforced patterns, and trade-offs.
   - **Pending Tasks & Next Steps**: Prioritized list of uncompleted tasks or requested follow-ups.
   - **Focus Area for Next Session**: Tailored summary based on user prompts or upcoming goals.
   - **Suggested Antigravity Skills**: Recommended skills (e.g. `code-reviewer`, `architect-review`, `performance-engineer`, `sql-pro`, `frontend-developer`) for the next agent to invoke.

3. **Security & Privacy Safeguards**:
   - **Redact Sensitive Data**: Strictly exclude API keys, credentials, tokens, passwords, and personally identifiable information (PII).

4. **Saving & Delivery**:
   - Write the handoff document to the current conversation artifact directory (`<appDataDir>/brain/<conversation-id>/handoff.md`) or `/tmp/antigravity_handoff.md`.
   - Provide a concise response with a direct clickable link to the generated handoff document.

---

## 2. Standard Handoff Structure

```markdown
# Antigravity Session Handoff Document

> [!NOTE]
> Generated for session resumption by fresh Antigravity agent or subagent.

## 🎯 Executive Summary & Objectives
- **Session Focus**: [Summary of user requests]
- **Deliverables Completed**: [Key work accomplished]

## 📂 Key Artifacts & File Inventory
- [implementation_plan.md](file:///path/to/implementation_plan.md)
- [walkthrough.md](file:///path/to/walkthrough.md)
- [Modified Source File](file:///path/to/source_file)

## 💡 Key Architectural & Technical Decisions
- **Decision 1**: [Description and rationale]
- **Enforced Standards**: [Design constraints or rules established]

## ⏳ Pending Work & Immediate Next Steps
1. [Next Action 1]
2. [Next Action 2]

## 🛠️ Suggested Skills for Next Agent Session
- `architect-review`: Review updated system architecture.
- `code-reviewer`: Audit newly generated implementation code.
```
