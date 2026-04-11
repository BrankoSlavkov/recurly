import { useEffect } from "react";

import { navigateToTabsHome } from "@/lib/clerk-auth-navigate";

/** Signed in under `(auth)` — reset root nav to `/(tabs)` (same as linking), not `router.dismissTo`. */
export function AuthRedirectToHome() {
  useEffect(() => {
    navigateToTabsHome();
  }, []);

  return null;
}
