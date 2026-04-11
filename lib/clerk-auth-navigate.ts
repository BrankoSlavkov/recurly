import type { Href } from "expo-router";
import { store } from "expo-router/build/global-state/router-store";

/** `app/(tabs)/index.tsx` — home tab. Typed routes use `/(tabs)` or `/`, not `/(tabs)/index`. */
export const POST_AUTH_TABS_HOME = "/(tabs)" as const;

/** Clerk sometimes returns group paths; normalize so linking matches `POST_AUTH_TABS_HOME`. */
function normalizeClerkAppPath(url: string): string {
  if (url === "/(tabs)/index" || url === "/") {
    return POST_AUTH_TABS_HOME;
  }
  return url;
}

/**
 * `router.replace` / `dismissTo` from inside `(auth)` target the wrong navigator. `resetRoot` applies
 * the same state linking would use for `href`, at the container root.
 */
function resetRootToHref(href: string): void {
  const nav = store.navigationRef;
  if (!nav || !nav.isReady()) {
    return;
  }
  store.assertIsReady();
  const state = store.getStateForHref(href as Href);
  if (state) {
    nav.resetRoot(state);
  }
}

/**
 * After Clerk session is active, jump to the tab home.
 */
export function replaceAfterClerkAuth(decorateUrl: (path: string) => string) {
  const url = normalizeClerkAppPath(decorateUrl(POST_AUTH_TABS_HOME));
  if (url.startsWith("http")) {
    if (typeof window !== "undefined" && window.location) {
      window.location.href = url;
    } else {
      resetRootToHref(POST_AUTH_TABS_HOME);
    }
  } else {
    resetRootToHref(url);
  }
}

export function navigateToTabsHome(): void {
  resetRootToHref(POST_AUTH_TABS_HOME);
}
