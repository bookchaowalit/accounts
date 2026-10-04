# Solo Empire Accounts API

`accounts-api` is a small read-only backend that turns
[`accounts/ACCOUNT-MATRIX.yaml`](../../accounts/ACCOUNT-MATRIX.yaml) into JSON
for the `/accounts` module of [`apps/solo-web`](../../apps/solo-web/). The YAML
file stays the source that humans and AI agents edit; the service only reads
it and reloads when the file changes.

## Run

From the repository root:

```bash
python3 services/accounts-api/server.py
```

The default listener is `http://127.0.0.1:3470`. Configure
`ACCOUNTS_API_HOST`, `ACCOUNTS_API_PORT`, `ACCOUNTS_API_MATRIX_PATH`, and
`ACCOUNTS_API_CORS_ORIGINS` as needed. A non-loopback host fails to start
unless `ACCOUNTS_API_TOKEN` is set, and `ACCOUNTS_API_ENV=production` refuses
reads without a token.

```text
GET /health
GET /api/v1/accounts?status=&platform=&kind=&q=
```

Anonymous identities are returned as counts only. See the
[Accounts API v1 contract](contracts/accounts.v1.md) for every field.

## Deploy

This folder is an independent deploy unit described by [`service.yaml`](service.yaml).
Build from the repository root; the image contains only this service and the
files listed in `data.reads`:

```bash
docker build -f services/accounts-api/Dockerfile -t solo-empire/accounts-api .
```

The image sets `*_ENV=production` and binds `0.0.0.0`, so it refuses to start
without its `*_TOKEN` secret. `deploy.target` stays `unassigned` until a target
is chosen. `task services:check` reports drift from the
[decentralized services spec](../../docs/superpowers/specs/2026-10-04-decentralized-services-and-storage-design.md).

## Test

```bash
python3 services/accounts-api/tests/test_server.py
```
