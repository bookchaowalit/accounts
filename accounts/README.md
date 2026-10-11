# Solo Empire Accounts

This directory is the account and identity registry for external platforms.
It describes how each account is used, what it is connected to, and where its
operating instructions live. Cloud and hosted software accounts also use a
cost-lane classification under [`cloud/`](./cloud/): `free/` and `paid/`.

## Directory convention

```text
accounts/{platform}/{purpose}/{account-name}/

# Cloud provider cost-lane metadata:
accounts/cloud/{free,paid}/{provider-account}/
```

Examples:

```text
accounts/line/business/solo-empire/
accounts/facebook/business/brand-name/
accounts/instagram/personal/creator-name/
accounts/line/game/game-brand/
```

Use the platform as the first level, then the primary purpose or audience,
then a stable human-readable account name.

## Identity model

Solo Empire uses three identity layers:

1. `private-personal` — real-life relationships and private communication.
2. `public-personal` — the visible `bookchaowalit` identity for technology,
   AI, business-building, general knowledge, and finance education.
3. `faceless-brand` — public niche or venture accounts that use a brand,
   logo, screen recording, hands, or product visuals instead of a face.

Optional anonymous (Z3) identities are not tracked in this repository and and must never share
emails, profile details, payment methods, devices, or cross-links with the
public identities.

## Boundaries

- `accounts/` contains account metadata, documentation, workflows, and
  non-secret references.
- `accounts/cloud/free/` contains metadata for free-forever/free-quota
  accounts. `accounts/cloud/paid/` contains metadata for billing-enabled,
  trial-credit, or intentionally paid accounts. These are cost lanes, not new
  root BUs and not proof that an external account exists.
- Reusable API, webhook, synchronization, and MCP implementation belongs in
  `infra/` or the appropriate integration documentation under `docs/`.
- API keys, channel access tokens, OAuth credentials, cookies, and private
  personal data must not be stored in this directory or committed to Git.
  Store them in the configured environment or local credential store and refer
  to them by name, for example `LINE_SOLO_EMPIRE_TOKEN`.
- One account may be related to one or more ventures, projects, or content
  workflows. Record those relationships in the account README or structured
  registry metadata instead of duplicating the account folder.

Cloud cost lanes are deliberately separate from implementation: policies live
in `docs/`, adapters and preflight live in `infra/`, and secrets stay in the
configured secret manager or CI secret store.

## Registry files

- [`ACCOUNT-REGISTRY.md`](./ACCOUNT-REGISTRY.md) — human-readable inventory,
  lifecycle, and operating rules.
- [`ACCOUNT-MATRIX.yaml`](./ACCOUNT-MATRIX.yaml) — structured account-family
  and platform matrix for future automation.
- [`ACCOUNT-FOLDER-MAP.md`](./ACCOUNT-FOLDER-MAP.md) — concrete folder-by-folder
  inventory for every platform identity.
- [`ACCOUNT-PROFILE-STANDARD.md`](./ACCOUNT-PROFILE-STANDARD.md) — required
  profile fields, privacy rules, and completeness criteria.
- [`ACTIVATION-PLAYBOOK.md`](./ACTIVATION-PLAYBOOK.md) — verify/activate order
  and the single conversion path for the first brand launch.

## Profile template and verification

Do not create more folders to make progress. Verify and activate existing
ones using:

| Artifact | Path |
|---|---|
| Profile schema template | [`templates/accounts/account.yaml`](../templates/accounts/account.yaml) |
| Verification checklist | [`templates/accounts/VERIFICATION-CHECKLIST.md`](../templates/accounts/VERIFICATION-CHECKLIST.md) |
| 30-day metrics log | [`templates/accounts/30-DAY-METRICS.md`](../templates/accounts/30-DAY-METRICS.md) |

Every active or in-progress public account should record: public URL/handle,
status, bio, content pillars, CTA, related venture, and posting frequency.
Private personal accounts record status and verification flags only — never
private handles or credentials.

## Activation order (summary)

1. Verify `bookchaowalit-private` (keep private; no private data in Git).
2. Complete `bookchaowalit-public` starting with LinkedIn; reserve IG, TikTok, X, YouTube with the same name/photo/bio family.
3. Launch only one faceless brand first: `ai-for-thai`.
4. Conversion path: LinkedIn / AI for Thai → landing page or email → LINE OA → AI offer.
5. Publish 30 days; track followers, engagement, leads, sales.

Details: [`ACTIVATION-PLAYBOOK.md`](./ACTIVATION-PLAYBOOK.md).

## Registry

See [`ACCOUNT-REGISTRY.md`](./ACCOUNT-REGISTRY.md) for the current account
inventory and lifecycle status. When operating a specific platform, open its
dedicated folder from [`ACCOUNT-FOLDER-MAP.md`](./ACCOUNT-FOLDER-MAP.md).

The matrix records planned identities as planned; it does not claim that an
external account has been created or verified. Credentials and exact private
identifiers remain outside this repository.
