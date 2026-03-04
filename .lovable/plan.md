## Plan: Landing Page Overhaul, About Page, Moderation Tuning, Tests & Documentation

This is a large request with ~8 distinct workstreams. Here's the plan, grouped by area.

---

### 1. Landing Page — SEO & Crawlability

**Problem:** Meta tags exist in `index.html` and JSON-LD is in `Landing.tsx` via react-helmet, but crawlers that don't execute JS won't see the JSON-LD. The OG tags are already in `index.html` (good). No hydration flash issue exists (body has `background-color: #0a0a0a`).

**Changes:**

- Move JSON-LD `<script>` from `Landing.tsx` (react-helmet) into `index.html` `<head>` so it's available on first paint without JS execution
- Verify meta description already in `index.html` (it is — no change needed)
- Add `<noscript>` fallback content in `index.html` for crawlers that don't run JS (headline + description text)
- No "Powered by" branding found anywhere — confirmed clean

### 2. Landing Page — Trust Signals & Content Enhancements

**Problem:** The old review flagged missing trust signals and stats needing 2025/26 citations.

**Changes to existing components:**

- `**StatsSection.tsx**`: Stats already reference "Forbes Health 2025/26" and "Industry data 2026" — already current. No change needed.
- `**FeaturesSection.tsx**`: Already has the six pillars. No change needed.
- `**InnovationsSection.tsx**`: Already has the four innovations. No change needed.
- `**HeroSection.tsx**`: Headline already says "Real chemistry in 45 seconds... Dignity always." No change needed.
- `**Footer.tsx**`: Add trust line "18+ verified · Nothing stored until mutual Spark", add "About" link, add "Australian Built 🇦🇺" badge
- `**Navbar.tsx**`: Add "About" link in the nav

### 3. New About Page (`/about`)

**Create `src/pages/About.tsx`:**

- Solo founder story: "Built by a solo Australian developer in Canberra, 2026"
- Why Verity exists (the burnout stats motivation)
- "No team page yet — this is a one-person project built with conviction"
- Dark + gold styling consistent with brand
- Add route in `App.tsx`

### 4. Footer Enhancements

**Edit `Footer.tsx`:**

- Add "About" link
- Add trust badge line: "18+ verified · Nothing stored until mutual Spark"
- Add "Australian Built" small badge/text

### 5. Admin Pilot Metrics Dashboard (Surface Existing Data)

**Problem:** The old review's #1 strategic warning was lack of real-time pilot metrics visibility.

**Changes:**

- The Admin page already has an Analytics section with platform stats, room stats, gender balance chart, and moderation flags. This is already wired to real data from `platform_stats`.
- Add a new "Pilot" admin section that surfaces: call completion rate (calls with `ended_at` vs total), mutual spark rate (calls with `is_mutual_spark=true` / total), moderation false-positive estimate (flags with `action_taken='clear'` / total flags)
- These are simple SELECT queries against existing tables — no new tables needed
- No feature flag toggle needed since this is already behind `requireAdmin` route guard

### 6. AI Moderation Tuning

**Problem:** The `ai-moderate` edge function is fully wired but needs safe defaults and the browser transcript fallback is already implemented in `LiveCall.tsx` (SpeechRecognition API with `transcriptAvailable` flag).

**Changes:**

- `**ai-moderate/index.ts**`: Add threshold constants at top (`WARN_THRESHOLD = 0.6`, `AUTO_ACTION_THRESHOLD = 0.85`, `SAFE_THRESHOLD = 0.3`). Below `SAFE_THRESHOLD`, skip DB writes entirely. Between thresholds, flag for human review. Above `AUTO_ACTION_THRESHOLD`, auto-warn. These are already partially implemented — formalize them as named constants.
- **No new edge function needed** — the appeal flow already exists via `submit-appeal` edge function and the Appeals page
- The browser transcript fallback is already working (LiveCall.tsx lines 212-241) — no changes needed

### 7. Vitest: Moderation False-Positive Test

**Create/extend `src/test/liveCallModerationWiring.test.ts`:**

- Add test: "treats low-score results as safe (false-positive guard)" — verify that `isModerationFlagged({ flagged: false, safe: true, score: 0.2 })` returns `false`
- Add test: "does not flag when score is below safe threshold" — verify score < 0.3 is treated as safe
- This extends the existing moderation test file

### 8. README & Documentation Polish

**Edit `README.md`:**

- Add "Pilot Results" section with placeholder metrics (call completion rate, spark rate, moderation accuracy — TBD numbers)
- Add "Architecture" section with note: "See PROJECT_OVERVIEW.md for full architecture documentation"
- Add "Deployment Checklist" section for public beta (environment secrets, Stripe webhooks, Agora credentials, feature flag defaults)
- Confirm Phase 4 innovations are behind feature flags (they are — the feature flags system exists via `app_config` and `get-feature-flags`)

### 9. Scope Discipline — Feature Flags

**Current state:** The feature flag system reads from `app_config` table, currently only supporting `require_phone_verification`. Phase 4 features (Replay Vault, Friendfluence, Guardian Net, Voice Intro) are built into the UI without explicit feature flag gates.

**Changes:**

- Extend the feature flags system to include toggles for Phase 4 features: `enable_replay_vault`, `enable_friendfluence`, `enable_voice_intro`, `enable_guardian_net`
- Update `get-feature-flags` edge function and `featureFlags.ts` to parse these new flags
- Add conditional rendering checks in the relevant pages/components
- Default all to `true` (currently live) so nothing breaks

---

### Technical Details

**Files to create:**

- `src/pages/About.tsx` — new About/founder story page

**Files to edit:**

- `index.html` — add JSON-LD in `<head>`, add `<noscript>` fallback
- `src/pages/Landing.tsx` — remove JSON-LD from Helmet (now in index.html)
- `src/components/landing/Footer.tsx` — trust badge, About link, Australian Built
- `src/components/landing/Navbar.tsx` — About link
- `src/App.tsx` — add `/about` route
- `src/pages/Admin.tsx` — add "Pilot" section with completion/spark/FP metrics
- `supabase/functions/ai-moderate/index.ts` — named threshold constants
- `src/test/liveCallModerationWiring.test.ts` — false-positive guard test
- `src/lib/moderation.ts` — add score-based threshold helper
- `src/lib/featureFlags.ts` — add Phase 4 feature flag fields
- `supabase/functions/get-feature-flags/flags-parser.ts` — parse new flags
- `README.md` — pilot results, architecture link, deployment checklist

**Files NOT touched:** All existing working components, pages, hooks, contexts, edge functions (except the targeted edits above). No structural refactors.

**Database changes:** One `app_config` row update to add Phase 4 toggle defaults — done via migration.