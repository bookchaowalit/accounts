# Free Cloud Lane

Use this directory for non-secret metadata of providers operated strictly on a
free-forever or free-quota plan.

Examples include free/quota Cloudflare, GitHub, Neon, Firebase Spark,
MongoDB Atlas M0, Netlify Free, Grafana Cloud Free, and similar lanes listed in
the [Free Cloud/SaaS Catalog](../../../systems/free-cloud-saas-catalog.md).

Each provider account record should document:

```yaml
provider: cloudflare
plan_type: free-quota
purpose: portfolio-data-lake
source_of_truth: false
budget_guard: hard_stop
quota_review_on: 2026-09-07
credentials_location: infisical://solo-empire/cloudflare
```

The example is metadata only. Do not create an `account.yaml` until the
external account is actually created or verified.

Free-lane workloads must use fixtures or public data by default, have bounded
object/query sizes, and stop when quota is reached. They must not use a paid
fallback automatically.

## Current portfolio lab status

`free-cloud-e2e-001` is **R2-provisioned / data-plane verified**: the fixture →
landing → Bronze Parquet → manifest → DuckDB proof was verified against the
Cloudflare R2 bucket with exact raw-byte and lineage checks. The verified
Cloudflare account has the `solo-empire-portfolio` bucket and an active R2 Data
Catalog; S3 access keys and catalog credentials remain outside the repository.

Activation requires an operator-owned R2 prefix, scoped credentials, and the
preflight/rollback steps in [`FREE-CLOUD-E2E-RUNBOOK`](../../../operations/FREE-CLOUD-E2E-RUNBOOK.md).
