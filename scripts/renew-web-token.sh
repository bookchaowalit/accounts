#!/usr/bin/env bash
# Renew the accounts-web automation token and roll it into the web app.
# Run it when empire-monitor warns that accounts-web expires within 7 days (provision only renews a
# delegation inside that window). Touches no other automation. Never prints the token.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
platform="${EMPIRE_PLATFORM_DIR:-$here/../platform-empire}"
tokens="$HOME/.config/empire-platform/tokens"

EMPIRE_DB_MODE=hosted "$platform/.venv/bin/empire-automations" provision --workspace owner --only accounts-web \
  --tokens "$tokens" --key-dir "$HOME/.config/empire-platform/signing" --issuer empire-platform --ttl-days 30

cd "$here/web"
vercel env add ACCOUNTS_API_TOKEN production --force --scope chaowalit-greepokes-projects < "$tokens/accounts-web.jwt" >/dev/null
vercel deploy --prod --yes --scope chaowalit-greepokes-projects | tail -1
echo "accounts-web token renewed and deployed"
