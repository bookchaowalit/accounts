# Account Registry

This is the human-readable inventory of external platform identities for Solo
Empire. It separates private personal accounts, the public personal identity,
faceless brands, and optional anonymous identities.

The registry is intentionally limited to non-secret metadata. `active` means
the repository contains evidence that the account or platform is in use;
`needs-verification` means the platform is recorded as active but the exact
account/handle still needs to be confirmed. `planned` means it is an intended
identity that has not been confirmed as created.

## Identity architecture

```text
private personal
├── real-life communication
├── private social life
└── never used as a marketing audience

public personal: @bookchaowalit
├── face-visible identity
├── AI, technology, building businesses, knowledge, finance education
└── LinkedIn is the primary professional channel

faceless brands
├── one focused topic and audience per brand
├── logo, screen recording, hands, products, or illustrations
└── connected to a venture only when the venture is ready

optional anonymous identities
└── strictly isolated from all personal and business identities
```

## Current account-family inventory

### Private personal

| Family | Face | Platforms | Status | Purpose |
|---|---:|---|---|---|
| `bookchaowalit-private` | yes, private | Google/Gmail, Facebook, Instagram, LINE | needs-verification | Real friends, family, and private communication |

Exact email addresses, phone numbers, recovery details, and private handles
must stay in the password manager or platform settings, not in this registry.

### Public personal identity

| Family | Face | Platforms | Status | Purpose |
|---|---:|---|---|---|
| `bookchaowalit-public` | yes | LinkedIn | active | Professional authority, AI services, SEO, software development |
| `bookchaowalit-public` | yes | Instagram, TikTok, X, Facebook | planned | General technology, knowledge, building-in-public, and personal finance education |
| `bookchaowalit-public` | yes | YouTube | planned | Long-form AI and technology explanations |
| `bookchaowalit-public` | yes | GitHub, personal website | active | Technical proof and portfolio |

Public content pillars:

1. AI and software development.
2. Building products and the Solo Empire journey.
3. General knowledge, productivity, and systems.
4. Personal finance education and transparent experiments, without
   individualized investment advice.

### Faceless brand families

All rows below are planned identity slots unless explicitly marked
`needs-verification`. They may be reserved first and launched gradually.

| # | Brand family | Platforms | Status | Main topic / monetization |
|---:|---|---|---|---|
| 1 | `artbybook` | Instagram, TikTok | planned | Art styles, interpretation, prints, guides |
| 2 | `lineartbybook` | Instagram, TikTok | planned | Minimal line art, SVGs, wall art |
| 3 | `sketch-daily` | Instagram, TikTok | planned | Daily sketches and art challenges |
| 4 | `code-coffee-repeat` | Instagram, TikTok, X | planned | Developer humor, tips, freelance leads |
| 5 | `buildwithbook` | X, YouTube | planned | Build-in-public and project breakdowns |
| 6 | `typetips-dev` | Instagram, TikTok | planned | TypeScript and JavaScript tips |
| 7 | `hustle-solo` | Instagram, TikTok, X | planned | Solo business lessons and digital products |
| 8 | `solo-empire` | Instagram, X | planned | Operating system, tools, and workflows |
| 9 | `sidehustle-th` | Instagram, TikTok | planned | Thai-language side-hustle education and affiliate content |
| 10 | `quote-daily` | Instagram, TikTok | planned | Quote graphics and digital products |
| 11 | `quotesforher` | Instagram, TikTok | planned | Quote products for women |
| 12 | `hustle-quotes` | Instagram, TikTok | planned | Entrepreneur quote products |
| 13 | `brew-book` | Instagram, TikTok | planned | Drink recipes and future drink-shop brand |
| 14 | `thaibrew-home` | Instagram, TikTok | planned | Thai home brewing and affiliate content |
| 15 | `law-student-th` | Instagram, TikTok | planned | Law study and exam preparation |
| 16 | `studywithbook` | Instagram, TikTok | planned | Study-with-me, desks, and productivity |
| 17 | `ai-for-thai` | Instagram, TikTok, LinkedIn | planned | Practical AI for Thai businesses |
| 18 | `agent-build` | X, YouTube | planned | AI agents, MCP, RAG, and developer education |
| 19 | `book-daily` | Instagram | planned | Faceless lifestyle, desk, coffee, and art |
| 20 | `bangkok-maker` | Instagram, TikTok | planned | Bangkok creative and maker culture |

Existing business-page records require handle verification before being mapped
to a named brand:

| Platform | Recorded identity | Status | Relationship |
|---|---|---|---|
| Facebook | AI SME page | needs-verification | Candidate for `ai-for-thai` or a separate AI automation brand |
| Facebook | Web Dev page | needs-verification | Candidate for `buildwithbook` or a separate development brand |

Do not merge these pages into a named brand until the live page names and
ownership are confirmed.

### Optional anonymous identities

These are not part of the active business plan. If created, they must remain
strictly separate from every public, personal, and business identity.

| Family | Platforms | Status | Purpose |
|---|---|---|---|
| `rustpixel` | X, Reddit | planned | Mature/18+ creative content, subject to platform rules |
| `hollowtide` | X, Reddit | planned | Private thoughts and venting |
| `nexadrift` | X, Reddit | planned | Experimental memes and shitposting |

Isolation rules: separate email, profile details, recovery identity, payment
method, browser/session, and device. Never cross-link, tag, or reuse content
between anonymous and branded accounts.

## Existing operational platform accounts

These are not all audience-building accounts, but they are included so the
inventory covers the operating system around the social accounts.

| Platform | Account/family | Status | Role |
|---|---|---|---|
| LINE Official Account | `solo-empire` | planned | Business automation, customer routing, and CRM |
| Discord | personal/workspace identity | active | Tech communities and networking |
| Telegram | notification bot and groups | active | System notifications and category groups |
| Slack | workspace identity | active | Client and team communication |
| Gmail | Google Workspace identity | active | Outreach, operations, and email infrastructure |
| Etsy | `bookchaowalit` shop | active | SVG/PNG digital product sales |
| Fastwork | `pixiu-watch` / SEO service identity | active | Thai-market service sales |

The LINE account has a dedicated metadata folder at
[`line/business/solo-empire/`](./line/business/solo-empire/). Its account and
Messaging API setup remain planned; the `LINE OA` tool entry being active does
not prove that this specific Official Account is configured.

## Priority for execution

Do not create more account folders for progress. Verify and activate what
already exists. Use
[`ACCOUNT-PROFILE-STANDARD.md`](./ACCOUNT-PROFILE-STANDARD.md) and
[`ACTIVATION-PLAYBOOK.md`](./ACTIVATION-PLAYBOOK.md).

1. Verify `bookchaowalit-private` (Google, Facebook, Instagram, LINE). Keep
   private; never store private handles or credentials in Git.
2. Verify and optimize `bookchaowalit-public` on LinkedIn first.
3. Reserve Instagram, TikTok, X, and YouTube for the public personal family
   with the same name, photo, and bio themes.
4. Launch only one faceless brand first: `ai-for-thai` (supports AI-service
   and Thai SME goals). Leave other faceless brands planned.
5. Build one conversion path:

   ```text
   LinkedIn / AI for Thai
           ↓
   Landing page or email
           ↓
   LINE OA (solo-empire business)
           ↓
   AI service / product offer
   ```

6. For each activated account, fill public URL/handle, status, bio, content
   pillars, CTA, related venture, and posting frequency in `account.yaml`.
7. Publish for 30 days and track followers, engagement, leads, and sales.
8. Later: verify the two existing Facebook pages and map them to brands;
   only then consider a second faceless brand.

Templates:

- [`templates/accounts/account.yaml`](../templates/accounts/account.yaml)
- [`templates/accounts/VERIFICATION-CHECKLIST.md`](../templates/accounts/VERIFICATION-CHECKLIST.md)
- [`templates/accounts/30-DAY-METRICS.md`](../templates/accounts/30-DAY-METRICS.md)

## Lifecycle statuses

- `planned` — intended identity; creation or configuration is not confirmed.
- `setup` — account configuration or credentials are being prepared.
- `active` — configured and available for normal operation.
- `needs-verification` — platform use is documented, but the exact account,
  handle, or ownership still needs confirmation.
- `paused` — intentionally disabled without removing its records.
- `retired` — no longer used; preserve documentation for history.

## Naming rules

- Platform directory names use lowercase platform slugs: `line`, `facebook`,
  `instagram`, `tiktok`, `youtube`, `linkedin`, `x`, and so on.
- Purpose directories use `personal`, `public`, `business`, `brand`,
  `community`, or `anonymous`.
- Account names use lowercase kebab-case and remain stable if the display name
  changes.
- One account family can exist on multiple platforms, but each platform
  identity should be recorded separately once it is actually created.

## Source documents

- [Social media plan](../projects/marketing/growth/book-marketing/social-media-plan.md)
- [Niche account strategy](../projects/marketing/growth/book-marketing/niche-account-strategy.md)
- [Account profile standard](./ACCOUNT-PROFILE-STANDARD.md)
- [Activation playbook](./ACTIVATION-PLAYBOOK.md)
- [Account matrix](./ACCOUNT-MATRIX.yaml)
- [Account folder map](./ACCOUNT-FOLDER-MAP.md)
