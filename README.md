# Solo Empire Accounts

This directory is the account and identity registry for external platforms.
It describes how each account is used, what it is connected to, and where its
operating instructions live.

## Directory convention

```text
accounts/{platform}/{purpose}/{account-name}/
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

## Boundaries

- `accounts/` contains account metadata, documentation, workflows, and
  non-secret references.
- Reusable API, webhook, synchronization, and MCP implementation belongs in
  `infra/` or the appropriate integration documentation under `docs/`.
- API keys, channel access tokens, OAuth credentials, cookies, and private
  personal data must not be stored in this directory or committed to Git.
  Store them in the configured environment or local credential store and refer
  to them by name, for example `LINE_SOLO_EMPIRE_TOKEN`.
- One account may be related to one or more ventures, projects, or content
  workflows. Record those relationships in the account README or structured
  registry metadata instead of duplicating the account folder.

## Registry

See [`ACCOUNT-REGISTRY.md`](./ACCOUNT-REGISTRY.md) for the current account
inventory and lifecycle status.
