# Pnyx beta metrics

Metrics are privacy-safe, event-based, and should be reviewed weekly during closed beta.

| Metric | Definition | Event or query |
|---|---|---|
| Useful-answer rate | Questions with an accepted reply divided by public questions created | `accepted_answer` / public question count |
| Artifact conversion rate | Discussions that create at least one artifact divided by public discussions | `artifact_created` and post/artifact source relation |
| Search success | Searches followed by opening a result within 10 minutes | `search_submitted` → result view |
| AI correction rate | AI outputs receiving correction/report feedback divided by completed outputs | `AiFeedback` / `AiOutput(status=COMPLETED)` |
| Report response time | Median time from report creation to resolution | `Report.createdAt` to resolved audit event |
| Abuse rate | Reports or rate-limit events per active user | report tables and rate-limit audit events |
| Accessibility defects | Confirmed WCAG issues by severity | release audit log |
| Retention | Participants returning in the following 7 and 30 days | privacy-safe account activity cohorts |

Do not use these metrics to rank individuals. Report small cohorts in aggregate and exclude sensitive content from dashboards.