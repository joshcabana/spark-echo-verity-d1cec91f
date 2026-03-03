

# Upgrade ExcitementStep with Real Agora Video Demo

## Problem

The existing `agora-token` edge function requires authentication + a valid `call_id` from the `calls` table. Onboarding Step 1 users are **unauthenticated** — they can't call this function. We need a separate lightweight edge function for demo tokens.

## Architecture

```text
User clicks "Watch demo"
  → POST /agora-demo-token (no auth required, rate-limited)
  → Returns { token, appId, uid, channel: "verity-demo-45s" }
  → useAgoraCall joins channel, shows local video + countdown
  → At 0s: leave call, show Spark/Pass buttons
  → On choice: mutual-spark reveal animation → auto-continue
```

## Files to Create/Modify

### 1. NEW: `supabase/functions/agora-demo-token/index.ts`

Lightweight public edge function (no auth required):
- Generates an Agora RTC token for channel `"verity-demo-45s"` with 60s expiry
- Uses existing `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` secrets
- Returns `{ token, appId, uid, channel }`
- No database queries needed — this is a stateless demo token

### 2. MODIFY: `src/components/onboarding/ExcitementStep.tsx`

Replace the simulated countdown overlay with a real Agora video demo:

- On "Watch 45-second demo" click:
  1. Call `agora-demo-token` edge function
  2. Log `AGORA_DEMO_START` and `AGORA_TOKEN_GENERATED`
  3. Use `useAgoraCall` hook to join channel with local camera preview
  4. Show fullscreen overlay with local video feed + countdown ring (45s)
  5. At 0s or manual skip: call `leave()`, log `DEMO_ENDED`, show Spark/Pass buttons
  6. On Spark click: log `SPARK_SELECTED`, show mutual-spark reveal animation, then auto-advance after 2s
  7. On Pass: same flow (no ego damage — both choices lead to continue)

- **Test Mode toggle**: In dev (`import.meta.env.DEV`), show a small Switch in corner that reduces demo to 5 seconds

- **Error fallback**: If Agora token fetch fails or camera denied, fall back to the existing simulated countdown (graceful degradation)

- Reuse existing `SparkPassButtons` component for the Spark/Pass UI
- Mobile-first: Agora SDK handles mobile cameras natively, video container uses `aspect-video` responsive sizing

### 3. No changes to
- `Onboarding.tsx` — step flow unchanged
- `MagicLinkStep.tsx`, `VerifyStep.tsx` — untouched
- `useAgoraCall.ts` — reused as-is
- Existing `agora-token` edge function — untouched
- Any RLS policies or database tables

