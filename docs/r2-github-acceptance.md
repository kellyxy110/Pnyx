# Dedicated R2 acceptance through GitHub Actions

Prepared 24 November 2026. This is a test runner, not a deployment workflow. Milestone 6A remains open until actual acceptance evidence is reviewed.

The owner reports creating the Standard pnyx-e2e-media bucket in WEUR, enabling its development delivery URL and creating bucket-scoped Object Read & Write credentials. Those reports identify the intended target; they do not establish a passed provider test. The r2.dev endpoint is rate limited and cannot certify a production custom-domain cache policy.

## Private owner setup

In kellyxy110/Pnyx, open Settings → Environments → New environment. Name it exactly pnyx-r2-verification. Under Deployment branches and tags choose Selected branches and tags, add a Branch rule for audit/pnyx-remediation-20261025 only. Do not add main, tags or wildcards. If the repository plan does not support environment secrets and branch restrictions, stop and use a separately reviewed local runner; do not silently broaden secrets to repository-wide access.

Under Environment secrets add only:

| Name | Private value |
| --- | --- |
| R2_ACCESS_KEY_ID | The dedicated token's S3 Access Key ID |
| R2_SECRET_ACCESS_KEY | The dedicated token's S3 Secret Access Key |

Use the S3 credential pair, not the Cloudflare API token value. Never paste them into chat, workflow files, reports or screenshots. No Vercel or production environment is involved. Confirm the token scope is only pnyx-e2e-media and note its expiry privately.

The workflow already declares the non-secret bucket, account S3 endpoint (without a bucket path), public delivery base and matching expected test declarations. There is no need to create additional secrets for those values.

## Controlled execution

The workflow is limited to pushes on the remediation branch that change its own file or docs/r2-media-verification-request.json. The request is initially disabled, so preparing this workflow does not use provider credentials or execute R2 tests. Once private setup is confirmed, change enabled to true in a reviewed request commit on the remediation branch. No default-branch workflow installation, merge or manual dispatch dependency is required.

The media job uses the named environment, serializes provider runs without cancelling active cleanup, creates a fresh PostgreSQL 16 service and invokes the existing guarded verify:media runner. Credentials are injected only into the verification step, after dependency/browser installation. No bucket/token creation, production access, deployment command or artifact upload is included. GitHub may create environment deployment-tracking metadata for this job; no application is deployed.

Review all twelve migration results, drift, 27 HTTP scenarios and all 96 browser cases, including the six real avatar/banner cases. A disabled request, skipped media job or six skipped R2 cases is not provider acceptance. Inspect any failure before rerunning because fixture media may remain. The temporary database disappears after the job, so record any failed cleanup key from the isolated test evidence before relying on an automatic rerun; durable cleanup recovery remains a separate open requirement. Do not empty the bucket as a substitute for scoped reconciliation.

After a completed attempt, disable the request in a documentation commit. Revoke or let the dedicated token expire when verification is finished. The existing isolated-verification.md runbook defines scope and remaining deletion/cache acceptance gaps.

## Preparation validation

Workflow YAML and request parsing are checked locally. GitHub's disabled-request run verifies request execution and the media skip only; it does not validate the unexecuted media job or establish provider connectivity. Existing application evidence remains code commit 709cbf5: 136 units, 27 native HTTP and 90 browser passes; six R2 cases skipped.

Preparation commit 689415e passed the request job in [run 45408918181](https://github.com/kellyxy110/Pnyx/actions/runs/45408918181); the media job was skipped as intended. Local execution of the actual request script verified false, true and invalid string inputs. Shell syntax and YAML checks passed. No real provider tests ran.
