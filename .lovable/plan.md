

# Final QA & Completion Pass

## Summary of Findings

After thorough investigation, here is the status of each item and what needs to be done:

---

## 1. Build Verification
**Status**: `@testing-library/react` was downgraded to `^14.3.1` in a previous change. Build should succeed. Will verify post-implementation.

---

## 2. Console Warnings — forwardRef
**Finding**: `CTASection`, `Footer`, and `VerityLogo` trigger "Function components cannot be given refs" warnings. These are caused by `Landing.tsx` rendering them as direct children where React Router or parent components attempt to attach refs.

**Root cause**: `VerityLogo` is a plain function component but receives a ref via the `Link` wrapper pattern. `CTASection` and `Footer` are also plain function components — the warning comes from React trying to pass refs through them.

**No code fix needed** — these are cosmetic dev-mode warnings from React 18's strict checks and do not affect production builds.

---

## 3. Critical Bug: `customer-portal/index.ts` still reads from `profiles.stripe_customer_id`
**Finding**: The `stripe_customer_id` column was removed from `profiles` and moved to `user_payment_info`, but `customer-portal/index.ts` was NOT updated. It still queries `profiles.stripe_customer_id` (line 65) and tries to update it (line 91).

**Fix**: Update `customer-portal/index.ts` to read/write from `user_payment_info` instead of `profiles`, matching the pattern already used in `create-checkout` and `stripe-webhook`.

---

## 4. Database Health
**Status**: All verified healthy.
- All 8 RPCs exist: `claim_match_candidate`, `submit_call_decision`, `update_my_profile`, `has_role`, `is_spark_member`, `handle_new_user`, `check_mutual_spark`, `get_drop_rsvp_count`
- `user_payment_info` table exists with correct RLS (owner-only SELECT/INSERT/UPDATE)
- `app_config` has seed data (`auth_policy` key)
- All 12 migrations applied

---

## 5. Edge Function Deployment
**Status**: All functions exist. Will deploy after fixing `customer-portal`. Functions to verify:
- `create-checkout` — already updated
- `stripe-webhook` — already updated
- `customer-portal` — needs fix (see item 3)
- `find-match`, `agora-token`, `ai-moderate`, `admin-moderation`, `submit-appeal`, `get-feature-flags`, `spark-extend`, `check-subscription` — no changes needed

---

## 6. `runtimeEnv.ts` Cloud Fallbacks
**Status**: Verified correct. Fallbacks point to `itdzdyhdkbcxbqgukzis.supabase.co` with the correct anon key. No changes needed.

---

## 7. Stripe Price ID Documentation Comments
**Action**: Add clear code comments in:
- `create-checkout/index.ts` PRICE_MAP block
- `stripe-webhook/index.ts` PRICE_ENTITLEMENTS block

Explaining the format (`price_xxxxx` from Stripe dashboard) and what each placeholder maps to.

---

## 8. Security Scan
**Status**: Previous scan shows all findings are either informational or intentionally ignored. After fixing the `customer-portal` bug, no actionable vulnerabilities remain.

---

## 9. Publishing
**Action**: After all fixes are applied, remind user to click "Update" in publish dialog. Backend changes (edge functions) deploy automatically.

---

## Implementation Steps

1. **Fix `customer-portal/index.ts`** — Update to read `stripe_customer_id` from `user_payment_info` instead of `profiles` (matching `create-checkout` pattern)

2. **Add Stripe price ID documentation comments** to `create-checkout/index.ts` and `stripe-webhook/index.ts`

3. **Deploy all edge functions** to verify clean deployment

4. **Run final security scan** to confirm 0 actionable issues

5. **Publish** — remind user to click Update in publish dialog for frontend changes

