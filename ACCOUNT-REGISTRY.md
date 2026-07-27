# Account Registry

This is the human-readable inventory of external platform accounts managed by
Solo Empire. It is intentionally limited to non-secret metadata.

## Active and planned accounts

| Platform | Purpose | Account | Status | Details |
|---|---|---|---|---|
| LINE | Business | Solo Empire Official Account | planned | [`line/business/solo-empire/`](./line/business/solo-empire/) |

## Lifecycle statuses

- `planned` — identified, but not configured or verified.
- `setup` — credentials or platform configuration is being prepared.
- `active` — configured and available for normal operation.
- `paused` — intentionally disabled without removing its records.
- `retired` — no longer used; preserve documentation for history.

## Naming rules

- Platform directory names use lowercase platform slugs: `line`, `facebook`,
  `instagram`.
- Purpose directories describe the primary operating context:
  `personal`, `business`, `game`, or another documented context.
- Account names use lowercase kebab-case and should remain stable if the
  platform display name changes.
