# Paid Cloud Lane

Use this directory for non-secret metadata of billing-enabled, trial-credit,
startup-credit, or intentionally paid providers.

Examples include AWS/Azure/GCP paid accounts after promotional credits,
Databricks, Snowflake, paid Vercel/Render/Railway plans, and any provider whose
usage can create a bill after a trial or quota.

Each provider account record must document:

```yaml
provider: google-cloud
plan_type: trial-credit
purpose: cloud-run-comparison-lab
source_of_truth: false
budget_guard: enabled
monthly_budget_usd: 0
expiry_or_review: 2026-09-07
rollback: delete_lab_project_and_revoke_credentials
credentials_location: infisical://solo-empire/cloud/paid/google-cloud
```

`monthly_budget_usd: 0` is the default for a zero-spend portfolio. A non-zero
budget requires an explicit operator decision outside this repository. Never
put billing information, access tokens, or service-account JSON in this folder.

Paid lanes are isolated comparison labs or intentional production services.
They must never become an implicit dependency of the free default pipeline.
