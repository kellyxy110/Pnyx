# Dependency audit evidence

Date: 2026-07-29  
Command: `npm audit --omit=dev --audit-level=high`

Result: 4 vulnerabilities (1 moderate, 3 high) in transitive `postcss` and `sharp` dependencies reached through Next.js. npm proposes `npm audit fix --force`, which would install a breaking Next.js 9.3.3 downgrade.

Action: no forced remediation was applied. A deliberate framework/dependency upgrade must be created on a separate branch, tested with typecheck, lint, unit tests, production build, and smoke tests before adoption.

Classification: BLOCKED BY SAFE DEPENDENCY UPGRADE WORK, not a reason to weaken the application or downgrade Next.js.

