# Accounts API v1 contract

`schema_version: solo-empire.accounts.v1`

Read-only projection of [`accounts/ACCOUNT-MATRIX.yaml`](../../../accounts/ACCOUNT-MATRIX.yaml).
The YAML file stays canonical; edit it, not the API.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness and schema version |
| `GET` | `/api/v1/accounts` | Summary, signals, groups, and account rows |

Query filters on `/api/v1/accounts` (all optional, exact match except `q`):
`status`, `platform`, `kind` (`identity` / `brand` / `existing`), and `q`
(case-insensitive substring over platform, name, purpose, and group id; max 80
characters). Any other method on the route returns `405`.

## Response fields

- `source`: matrix path, `version`, `updated`, file `modified_at`, and
  `status_definitions` as `{value, description}` rows.
- `summary`: `accounts_total`, `accounts_matched`, `groups`, `platforms`,
  `active`, and `needs_attention` (`setup` + `needs-verification`). Totals are
  unfiltered; `accounts_matched` follows the filters.
- `signals`: unfiltered `{value, count}` lists for `statuses`, `platforms`, and `kinds`.
- `groups`: groups that have at least one matched row: `id`, `kind`, `label`,
  `description`, `privacy`, `face_visible`, `account_count` (unfiltered).
- `accounts`: one row per platform slot: `group_id`, `group_kind`, `platform`,
  `name`, `purpose`, `status`, `face_visible`, `evidence`. A faceless brand
  becomes one row per platform.
- `anonymous`: `isolation_required`, `identities`, `platform_slots`, and
  `by_status` only.

## Boundary

- Anonymous identity ids and purposes are never returned, so the UI cannot
  link them to the public identity.
- No credential, token, or provider call is involved.
- Errors use `{"error": {"code", "message"}}`; an unreadable matrix returns
  `503 matrix_unavailable`.
