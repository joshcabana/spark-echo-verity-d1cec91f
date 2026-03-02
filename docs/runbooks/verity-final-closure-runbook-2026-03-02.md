# Verity Final 100% Completion Runbook

Version: 2026-03-02 (AEDT)
Audience: Human operators and AI agents
Canonical Repo: `/Users/joshcabana/Documents/spark-echo-verity-sync-exec`

## Purpose
This runbook defines the exact execution path to move Verity from current stable fallback mode to strict production readiness with full ownership, no environment drift, and auditable evidence.

## Current Verified Baseline
- Canonical Supabase project: `lixgbpgemcpdbjzhjknf`
- Canonical public domain: `https://getverity.com.au`
- Current production app health: `/`, `/auth`, `/onboarding`, `/lobby`, `/tokens` return HTTP 200
- Current live bundle observed: `assets/index-BMlIffKM.js`
- Auth policy check: PASS in fallback mode with `require_phone_verification=false`
- Phone provider status: `external.phone=false`
- `.com` DNS status: still points to legacy A records (`15.197.148.33`, `3.33.130.190`)

## Locked Decisions
- [x] Canonical Supabase = `lixgbpgemcpdbjzhjknf`
- [x] Canonical host = `https://getverity.com.au`
- [x] `getverity.com` and `www.getverity.com` redirect to `.com.au`
- [x] Auth policy source = DB-only (`public.app_config` via `get-feature-flags`)
- [x] Outage behavior remains fail-open until strict-mode prerequisites are met

## Execution Snapshot (2026-03-02 17:46 AEDT)
- Execution branch: `main` @ `66cc5711ba88`
- `origin/main` verified via `git fetch origin` and `git log --oneline -n 5 origin/main`
- Automated gates completed: Phase 0, Phase 2, and Phase 6
- Launch readiness: **NOT READY** (blocked by Phases 1, 3, 4, 5, and 7)

---

## Phase 0 — Preflight Guardrails
### Goal
Ensure local and remote source-of-truth are aligned before operational changes.

### Steps
- [x] Open terminal in repo root:
  - `cd /Users/joshcabana/Documents/spark-echo-verity-sync-exec`
- [x] Confirm branch sync:
  - `git fetch origin`
  - `git log --oneline -n 5 origin/main`
- [x] Confirm canonical alignment:
  - `npm run check:project-alignment`
- [x] Confirm no hardcoded Supabase credentials in source:
  - `npm run check:no-hardcoded-supabase`

### Exit Criteria
- [x] Alignment check passes for `lixgbpgemcpdbjzhjknf`
- [x] No hardcoded credentials detected

---

## Phase 1 — Publish Latest Frontend to Production
### Goal
Deploy merged `main` so live app uses latest closure changes.

### Navigation
1. Open Lovable dashboard
2. Open Verity project
3. Click `Publish / Update from GitHub main`

### Steps
- [ ] Trigger publish
- [ ] Wait for completion status
- [ ] Hard refresh `https://getverity.com.au` (`Cmd+Shift+R`)

### Validation
```bash
curl -s https://getverity.com.au | rg -o "assets/index-[A-Za-z0-9_-]+\\.js" | head -n1
for p in / /auth /onboarding /lobby /tokens; do
  code=$(curl -o /dev/null -s -w "%{http_code}" "https://getverity.com.au$p")
  echo "$p $code"
done
```

### Exit Criteria
- [ ] Bundle hash is no longer `assets/index-BMlIffKM.js`
- [x] Route matrix returns all 200s

---

## Phase 2 — Runtime Policy and Drift Validation
### Goal
Verify production runtime is using DB-driven policy on canonical backend.

### Steps
- [x] Run:
  - `npm run check:project-alignment`
  - `npm run check:auth-settings`
  - `npm run check:no-hardcoded-supabase`

### Expected
- Alignment PASS on `lixgbpgemcpdbjzhjknf`
- `feature_flags.require_phone_verification` is present
- No hardcoded Supabase URL/key patterns

### Exit Criteria
- [x] All checks pass

---

## Phase 3 — Supabase Auth Provider Hardening
### Goal
Prepare strict-mode prerequisites without breaking current traffic.

### Navigation
1. Supabase Dashboard → Project `lixgbpgemcpdbjzhjknf`
2. Authentication → URL Configuration
3. Authentication → Providers

### Steps
- [ ] Set Site URL = `https://getverity.com.au`
- [ ] Add redirect URLs:
  - `https://getverity.com.au`
  - `https://www.getverity.com.au`
  - `http://localhost:5173`
- [x] Verify Email provider operational (`external.email=true`)
- [ ] Configure Twilio provider and test OTP delivery
- [x] Keep Google provider disabled unless product policy requires it

### Validation
```bash
npm run check:auth-settings
```

### Exit Criteria
- [x] `external.email=true`
- [ ] `external.phone=true`

---

## Phase 4 — Domain Finalization (.com → .com.au)
### Goal
Remove legacy host behavior and enforce canonical redirect strategy.

### Navigation
1. Registrar/DNS for `getverity.com`
2. DNS records + forwarding/redirect rules

### Steps
- [ ] Remove A records:
  - `15.197.148.33`
  - `3.33.130.190`
- [ ] Configure permanent redirect:
  - `https://getverity.com` → `https://getverity.com.au`
  - `https://www.getverity.com` → `https://getverity.com.au`

### Validation
```bash
dig +short getverity.com A
curl -I -s https://getverity.com | sed -n '1,20p'
curl -I -s https://www.getverity.com | sed -n '1,20p'
```

### Exit Criteria
- [ ] No legacy AWS A records remain
- [ ] `.com` responds with 301/302 to `.com.au`

---

## Phase 5 — Strict Mode Activation (DB policy)
### Precondition
- [ ] `external.phone=true` verified in Phase 3

### Steps
- [ ] Run SQL in Supabase SQL Editor:
```sql
update public.app_config
set value_json = jsonb_set(value_json, '{require_phone_verification}', 'true'::jsonb, true),
    updated_at = now()
where key = 'auth_policy';
```
- [ ] Re-run `npm run check:auth-settings`

### Exit Criteria
- [ ] `require_phone_verification=true`
- [ ] `external.phone=true`
- [ ] No strict-policy mismatch warning

---

## Phase 6 — Full QA Regression Gate
### Steps
- [x] Run:
```bash
npm run lint
npm run test -- --run
npm run build
npx tsc -b
npm run check:project-alignment
npm run check:auth-settings
npm run check:no-hardcoded-supabase
npm audit --audit-level=moderate
```

### Exit Criteria
- [x] Lint pass with 0 errors
- [x] Tests pass
- [x] Build + typecheck pass
- [x] Alignment/auth/no-hardcoded checks pass
- [x] Audit has no moderate+ vulnerabilities

---

## Phase 7 — Production E2E Acceptance
### Steps
- [ ] Signup with new email
- [ ] Verification email received and link works
- [ ] OTP send and verify succeeds
- [ ] Selfie + safety pledge complete
- [ ] Lobby entry and Drop join work
- [ ] 45s call flow and Spark/Pass flow complete
- [ ] Token checkout + portal return flow complete

### Exit Criteria
- [ ] No dead-ends on critical path
- [ ] No runtime errors on core routes

---

## Phase 8 — Evidence and Signoff
### Steps
- [x] Update evidence pack:
  - `/Users/joshcabana/Documents/spark-echo-verity-sync-exec/docs/evidence-pack-final-2026-03-02.md`
- [ ] Add:
  - post-publish bundle hash proof
  - `.com` redirect proof
  - strict-mode auth-settings output
  - full gate outputs
  - E2E timestamps/results (`pending`)

### Final status label
- [ ] Mark `Strict-mode launch-ready` only when all phase exit criteria are complete

---

## Rollback Controls
### Strict-mode rollback
```sql
update public.app_config
set value_json = jsonb_set(value_json, '{require_phone_verification}', 'false'::jsonb, true),
    updated_at = now()
where key = 'auth_policy';
```

### Additional controls
- Keep fail-open behavior while recovering provider incidents
- If publish regresses, roll back deployment in hosting control plane
- Do not run `supabase db reset --linked` in production

---

## Quick Verification Bundle
```bash
cd /Users/joshcabana/Documents/spark-echo-verity-sync-exec
npm run check:project-alignment
npm run check:auth-settings
npm run check:no-hardcoded-supabase
npm run lint
npm run test -- --run
npm run build
npx tsc -b
npm audit --audit-level=moderate
curl -s https://getverity.com.au | rg -o "assets/index-[A-Za-z0-9_-]+\\.js" | head -n1
for p in / /auth /onboarding /lobby /tokens; do code=$(curl -o /dev/null -s -w "%{http_code}" "https://getverity.com.au$p"); echo "$p $code"; done
dig +short getverity.com A
curl -I -s https://getverity.com | sed -n '1,20p'
```
