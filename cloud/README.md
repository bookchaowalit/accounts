# Cloud Account Cost Lanes

This is the non-secret account metadata boundary for cloud and hosted software
accounts. It separates **free/quota** accounts from **paid/credit-enabled**
accounts without creating new root BUs.

```text
accounts/cloud/
├── free/       # free-forever or free-quota accounts
└── paid/       # billing-enabled, trial-credit, or paid accounts
```

This is a classification boundary, not proof that an external account exists.
Create a provider account record only after the operator has created or verified
that account. Never put tokens, passwords, OAuth files, recovery codes, billing
numbers, or private identifiers in this directory.

## What belongs here

- provider/account display name and non-secret account ID reference
- plan classification: `free-forever`, `free-quota`, `trial-credit`, or `paid`
- owner, purpose, region, lifecycle, expiry/review date, and budget policy
- links to the provider's official pricing/terms and the repository contract

## What belongs elsewhere

| Need | Canonical owner |
|---|---|
| Provider policy and free/paid catalog | `systems/cloud-platform/free-cloud-saas-catalog.md` |
| Hosted integration environment names and preflight | `infra/scripts/data_lake/hosted_integrations.py` |
| Deployment/configuration code | `infra/` or the owning product repository |
| Secret values and machine credentials | Infisical/Vault/ignored environment/CI secrets |
| Learning notes and lab evidence | `learning/` |
| Generated runs, logs, and datasets | `data/` or the owning data product |

## Lane rule

The free lane may never silently fall back to a paid account, paid provider,
or billable API. A paid lane must have explicit opt-in, budget/expiry metadata,
and a rollback or deletion procedure.

See:

- [`free/README.md`](./free/README.md)
- [`paid/README.md`](./paid/README.md)
- [`BU Operating Model`](../../docs/BU-OPERATING-MODEL.md)
- [`Free Cloud/SaaS Catalog`](../../systems/cloud-platform/free-cloud-saas-catalog.md)
