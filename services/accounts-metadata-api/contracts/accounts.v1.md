# Accounts API v1 contract

`schema_version: solo-empire.accounts.v1`

Read-only projection of [`accounts/ACCOUNT-MATRIX.yaml`](../../../platform-accounts-api/ACCOUNT-MATRIX.yaml) (in the accounts repository root).
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
- No provider credential or provider call is involved.
- Errors use `{"error": {"code", "message"}}`; an unreadable matrix returns
  `503 matrix_unavailable`.

## Authorization, readiness and snapshot revision

Production GET reads require owner-scoped RS256 JWT authorization using
`ACCOUNTS_API_AUTH_ISSUER`, `ACCOUNTS_API_AUTH_PUBLIC_KEY`, and
`ACCOUNTS_API_AUTH_SUBJECTS`. Required audience is `accounts-api`, scope is
`accounts:read`, tenant is `owner`, and subject is an allowed OIDC owner.
Required `iat/nbf/exp/jti` constrain lifetime to 120 seconds (5 seconds leeway).
See [runtime configuration](../README.md#scoped-authorization-and-readiness).
Errors keep the v1 envelope: 401 invalid token, 403 owner/tenant/scope denial,
503 missing or invalid JWT configuration. Static tokens are local-development only.

`GET /health` remains public liveness. `GET /ready` returns safe
`status`, `source` (available/unavailable), and `auth`
(ready/development/disabled); 200 requires parsed source and configured JWT,
otherwise 503. No metadata rows appear in readiness responses.
`source.revision` is the SHA-256 source checksum, an additive v1
field. Source date and reload semantics remain unchanged.
