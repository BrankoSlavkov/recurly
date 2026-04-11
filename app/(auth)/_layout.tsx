import { useAuth } from "@clerk/expo";
import { Stack } from "expo-router";

import "@/app/index.css";
import { AuthRedirectToHome } from "@/components/auth-redirect-to-home";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for auth to load before rendering anything
  if (!isLoaded) {
    return null;
  }

  // Signed in but still under `(auth)` — `navigateToTabsHome` resets root to `/(tabs)`.
  if (isSignedIn) {
    return <AuthRedirectToHome />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
