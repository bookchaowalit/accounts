# Account Activation Playbook

Verify and activate real accounts. Do not create more folders unless a
missing identity needs one. Templates and checklists live in
`templates/accounts/`.

## Recommended order

### 1. Verify `bookchaowalit-private`

Platforms: Google, Facebook, Instagram, LINE personal.

- Keep private. Friends and family only.
- Confirm ownership and recovery outside Git.
- Do **not** store private handles, emails, phones, or credentials in the repo.
- Update each private `account.yaml` status and `verification.*` booleans only.
- Checklist: copy
  [`templates/accounts/VERIFICATION-CHECKLIST.md`](../templates/accounts/VERIFICATION-CHECKLIST.md)
  and complete section 7.

Target folders:

- `google/personal/bookchaowalit-private/`
- `facebook/personal/bookchaowalit-private/`
- `instagram/personal/bookchaowalit-private/`
- `line/personal/bookchaowalit-private/`

### 2. Verify and complete `bookchaowalit-public`

Start with LinkedIn, then reserve Instagram, TikTok, X, and YouTube using
the same public name, photo, and bio themes.

| Order | Platform folder | Intent |
|---:|---|---|
| 1 | `linkedin/personal/bookchaowalit/` | Optimize profile; primary professional channel |
| 2 | `instagram/personal/bookchaowalit/` | Reserve handle; align name/photo/bio |
| 3 | `tiktok/personal/bookchaowalit/` | Reserve handle; align name/photo/bio |
| 4 | `x/personal/bookchaowalit/` | Reserve handle; align name/photo/bio |
| 5 | `youtube/personal/bookchaowalit/` | Reserve channel; align name/photo/bio |
| — | `github/personal/bookchaowalit/` | Already active; keep URL and topic accurate |
| — | `website/personal/bookchaowalit/` | Already active; keep as portfolio proof |

Public content pillars (shared family):

1. AI and software development
2. Building products and the Solo Empire journey
3. General knowledge, productivity, and systems
4. Personal finance education (no individualized investment advice)

### 3. Launch only one faceless brand first: `ai-for-thai`

Reason: supports the current AI-service and Thai SME goal.

Platforms already stubbed:

- `linkedin/brand/ai-for-thai/`
- `instagram/brand/ai-for-thai/`
- `tiktok/brand/ai-for-thai/`

Launch discipline:

1. Complete LinkedIn brand page or company presence first if that is the
   lead surface; otherwise start where Thai SME attention is easiest to
   convert.
2. Keep other faceless brand folders as `planned` until this brand finishes
   a 30-day publish cycle with metrics.
3. Faceless only: logo, product UI, screen recording, hands, checklists.

### 4. Create one conversion path

```text
LinkedIn / AI for Thai
        ↓
Landing page or email capture
        ↓
LINE OA (business)
        ↓
AI service / product offer
```

Supporting accounts:

| Step | Account / asset | Notes |
|---|---|---|
| Attention | `linkedin/brand/ai-for-thai` (+ optional personal LinkedIn) | Public education and trust |
| Capture | Landing page or email list | Public URL only in yaml |
| Conversation | `line/business/solo-empire` | Business OA, not private LINE |
| Offer | AI services venture | See `opportunities/business/ai-services/` |

Every `ai-for-thai` profile CTA should point to the next step in this path,
not to a second brand or a private channel.

### 5. Fill profile fields before calling an account active

For each public account being activated, set in `account.yaml`:

- Actual public URL / handle
- Final status
- Bio
- Content pillars
- CTA
- Related venture
- Posting frequency
- `verification.*` and `conversion_path` where relevant

Use [`ACCOUNT-PROFILE-STANDARD.md`](./ACCOUNT-PROFILE-STANDARD.md).

### 6. Publish 30 days and track

1. Copy [`templates/accounts/30-DAY-METRICS.md`](../templates/accounts/30-DAY-METRICS.md).
2. Set `metrics_tracking.enabled: true`.
3. Track followers, engagement, leads, and sales weekly.
4. At day 30, decide: continue, change CTA/offer, pause, or only then
   launch a second brand.

## Operator workflow (per account)

```text
1. Open account folder
2. Copy verification checklist (if not already present)
3. Expand account.yaml from templates/accounts/account.yaml if still minimal
4. Complete platform work outside Git (reserve, bio, photo, CTA)
5. Write non-secret results into account.yaml
6. Update ACCOUNT-FOLDER-MAP / MATRIX / REGISTRY only when status changes
7. Start 30-day metrics if publishing
```

## Out of scope for this wave

- Creating more brand folders
- Launching quote, art, drink, or study brands
- Storing private personal identifiers in Git
- Claiming `active` without ownership confirmation

## Related

- [`ACCOUNT-PROFILE-STANDARD.md`](./ACCOUNT-PROFILE-STANDARD.md)
- [`ACCOUNT-REGISTRY.md`](./ACCOUNT-REGISTRY.md)
- [`ACCOUNT-FOLDER-MAP.md`](./ACCOUNT-FOLDER-MAP.md)
- [`ACCOUNT-MATRIX.yaml`](./ACCOUNT-MATRIX.yaml)
