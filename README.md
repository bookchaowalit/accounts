# Solo Empire Accounts API

`accounts-api` is a small read-only backend that turns
[`accounts/ACCOUNT-MATRIX.yaml`](../../accounts/ACCOUNT-MATRIX.yaml) into JSON
for the `/accounts` module of [`apps/solo-web`](../../apps/solo-web/). The YAML
file stays the source that humans and AI agents edit; the service only reads
it and reloads when the file changes.

## Run

From the repository root:

```bash
python3 -m pip install ./packages/service-auth ./services/accounts-api
python3 services/accounts-api/server.py
```

The default listener is `http://127.0.0.1:3470`. Configure
`ACCOUNTS_API_HOST`, `ACCOUNTS_API_PORT`, `ACCOUNTS_API_MATRIX_PATH`, and
`ACCOUNTS_API_CORS_ORIGINS` as needed. A non-loopback host requires valid scoped JWT configuration and enforces production authorization.

```text
GET /health
GET /api/v1/accounts?status=&platform=&kind=&q=
```

Anonymous identities are returned as counts only. See the
[Accounts API v1 contract](contracts/accounts.v1.md) for every field.

## Deploy

This folder is an independent deploy unit described by [`service.yaml`](service.yaml).
Set `RELEASE_CONTEXT` to this service's isolated exported context outside the
source checkout. The owner must review its release manifest and metadata
projection before uploading the context or image. The context contains this
service, the declared reusable `service-auth` dependency, and projected inputs
from `data.reads`. Building from the raw root checkout bypasses the accounts
projection and copies the original account matrix.

```bash
: "${RELEASE_CONTEXT:?Set RELEASE_CONTEXT to the reviewed accounts-api export}"
docker build -f "$RELEASE_CONTEXT/services/accounts-api/Dockerfile" -t solo-empire/accounts-api "$RELEASE_CONTEXT"
```

The image enforces scoped JWT authorization and binds `0.0.0.0`.
`deploy.target` stays `unassigned` until the parent deployment configuration selects a target. `task services:check` reports drift from the
[decentralized services spec](../../docs/superpowers/specs/2026-10-04-decentralized-services-and-storage-design.md).

## Test

```bash
python3 services/accounts-api/tests/test_server.py
```

## Scoped authorization and readiness

[Railway configuration](railway.toml) selects the Dockerfile and `/ready`
health check (30 seconds), with at most 3 restarts after failure. It declares
no region, resources, runtime secret values, or existing cloud deployment.

Configure `ACCOUNTS_API_AUTH_ISSUER` with the exact HTTPS origin of Solo Web,
`ACCOUNTS_API_AUTH_PUBLIC_KEY` with its PEM RSA public key (at least 2048 bits),
and `ACCOUNTS_API_AUTH_SUBJECTS` with the comma-separated allowed OIDC owner
subjects. See [.env.example](.env.example); provide configuration at runtime.
The signing private key belongs only to Solo Web and is never copied to this image.

Reads require an RS256 JWT: `iss` matches that origin, `aud=accounts-api`,
`sub` is allowed, `tenant_id=owner`, `scope=accounts:read`, and
`iat`, `nbf`, `exp`, `jti` are required. Lifetime is at most 120 seconds
with 5 seconds clock leeway. The verifier uses only the configured local key
and rejects remote key headers. Key rotation replaces the configured public
key and restarts the service; old signatures then fail. Missing configuration
returns `503 reads_disabled`; invalid tokens return `401 unauthorized`;
a valid token for another owner/tenant/scope returns `403 forbidden`.
Production never accepts `ACCOUNTS_API_TOKEN`. Partial JWT configuration
fails closed even in development.

`GET /health` is public liveness. `GET /ready` returns 200 only when the
source snapshot parses and JWT configuration is valid; otherwise it returns
503 with safe source/auth states. A local fixture with auth disabled reports
`auth=development`, not deployment readiness. Metadata contains a SHA-256
`revision` of its source snapshot and preserves its original dates.
Atomic source replacement triggers reload. This does not assert provider
freshness or a live deployment.

The listener accepts PaaS `PORT`; explicit `ACCOUNTS_API_PORT` or `--port`
takes precedence. Package installation is required; no sibling source-path
injection is used at runtime.
