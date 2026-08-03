# Account Profile Standard

This is the canonical profile schema for every folder under `accounts/`.
Use it when verifying, activating, or updating an account. Do not create
new platform folders unless a real identity needs a place to live.

## Templates

| Template | Use |
|---|---|
| [`templates/accounts/account.yaml`](../templates/accounts/account.yaml) | Full non-secret profile schema |
| [`templates/accounts/VERIFICATION-CHECKLIST.md`](../templates/accounts/VERIFICATION-CHECKLIST.md) | Per-account activation checklist |
| [`templates/accounts/30-DAY-METRICS.md`](../templates/accounts/30-DAY-METRICS.md) | First 30 days of publish tracking |

Copy templates into the owning account folder; never edit the source
templates in place for a live account.

## Required fields

Every `account.yaml` should eventually carry these fields. Older minimal
files are valid placeholders until that account is verified or activated.

| Field | Purpose |
|---|---|
| `identity_layer` | `private-personal`, `public-personal`, `faceless-brand`, or `anonymous` |
| `family_id` | Stable family key shared across platforms |
| `platform` / `purpose` / `name` | Match folder path |
| `status` | Lifecycle state |
| `face_visible` / `privacy` | Audience and identity rules |
| `display_name` | Public or placeholder display name |
| `handle` / `public_url` | Public only; empty for private personal |
| `bio` | Profile text used on the platform |
| `topic` | One-line positioning |
| `content_pillars` | 3–5 recurring content themes |
| `cta` | Label, target type, and non-secret target ref |
| `posting_frequency` | Cadence once active |
| `related_ventures` | Venture or offer linkage |
| `conversion_path` | Ordered public funnel steps |
| `verification` | Checklist-backed booleans and date |
| `metrics_tracking` | 30-day tracking switch and fields |

## Status meanings

| Status | Meaning |
|---|---|
| `planned` | Slot exists; external account not confirmed |
| `setup` | Creating/configuring profile, bio, CTA, credentials |
| `needs-verification` | Known or likely account; ownership/handle unconfirmed |
| `active` | Owned, profile complete enough, available to operate |
| `paused` | Intentionally quiet; record retained |
| `retired` | No longer used; historical record retained |

An account may be `active` for ownership and messaging without being in a
public growth campaign. Growth tracking is controlled by
`metrics_tracking.enabled`.

## Privacy rules

| Identity layer | Store in Git | Never store in Git |
|---|---|---|
| `private-personal` | Family id, platform, status, isolation notes | Handles, emails, phones, recovery, friends lists |
| `public-personal` | Public handle, URL, bio, pillars, CTA | Passwords, tokens, recovery codes |
| `faceless-brand` | Public handle, URL, bio, pillars, CTA, venture | Brand admin passwords, API secrets |
| `anonymous` | Family id and isolation reminder only as needed | Any link to real identity, shared email, payment method |

Credential references must be environment variable **names** only, for
example `LINE_SOLO_EMPIRE_CHANNEL_ACCESS_TOKEN`.

## Profile completeness by layer

### Private personal

Minimum to mark `active`:

1. Ownership confirmed outside Git.
2. Isolation from public and brand accounts confirmed.
3. `handle` and `public_url` remain empty.
4. `verification.ownership_confirmed` and
   `verification.credentials_stored_outside_git` are true.

### Public personal (`bookchaowalit-public`)

Minimum to mark `active`:

1. Public handle and URL recorded.
2. Same-name / same-photo / same-bio family alignment checked.
3. Content pillars and CTA set.
4. LinkedIn is the primary professional channel; other platforms may be
   reserved first (`setup` / handle reserved) before full posting.

### Faceless brand

Minimum to mark `active` for launch:

1. Handle reserved and public URL recorded.
2. Faceless visual identity set.
3. Bio, pillars, CTA, related venture, posting frequency set.
4. Conversion path linked.
5. 30-day metrics log prepared.

## Field examples

### Public personal (LinkedIn)

```yaml
handle: chaowalit-greepoke-b687351a0
public_url: https://www.linkedin.com/in/chaowalit-greepoke-b687351a0
content_pillars:
  - AI and software development
  - Building products and Solo Empire
  - Knowledge, productivity, and systems
  - Personal finance education
cta:
  label: Contact for AI / software work
  target_type: website
  target_ref: ""
posting_frequency: 3x/week
```

### Faceless brand (`ai-for-thai`)

```yaml
handle: ai.for.thai
content_pillars:
  - Practical AI tools for Thai SMEs
  - Before/after workflow automation
  - Short tutorials and checklists
  - Case-style lessons without client secrets
cta:
  label: แอด LINE ปรึกษา AI
  target_type: line_oa
  target_ref: solo-empire
conversion_path:
  - linkedin
  - landing_page_or_email
  - line_oa
  - ai_service_offer
posting_frequency: 5x/week
related_ventures:
  - docs/opportunities/business/ai-services
```

## When to update registry files

| Change | Update |
|---|---|
| Fill bio/CTA on one platform | That platform `account.yaml` only |
| Status change for one platform | `account.yaml` + `ACCOUNT-FOLDER-MAP.md` |
| Family-wide status or priority change | Also `ACCOUNT-MATRIX.yaml` and `ACCOUNT-REGISTRY.md` |
| New real platform identity | Create folder only if needed; update map + matrix |

## Related

- [`ACTIVATION-PLAYBOOK.md`](./ACTIVATION-PLAYBOOK.md) — ordered verify/launch sequence
- [`README.md`](./README.md) — accounts directory convention
- [`ACCOUNT-REGISTRY.md`](./ACCOUNT-REGISTRY.md) — human inventory
