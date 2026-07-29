# Static accessibility evidence

Date: 2026-07-29

Command:

```text
node scripts/audit-static-accessibility.mjs
```

Result:

```text
PASS skip link
PASS main landmark id
PASS visible focus styles
PASS reduced motion support
PASS auth labels
PASS status/error semantics
PASS brand mark asset
PASS web manifest
Static checks: 8/8 passed
```

This is static repository evidence only. It does not replace axe, Lighthouse, keyboard-only browser execution, device review, or manual screen-reader testing. Those remain open under Milestone 6.

