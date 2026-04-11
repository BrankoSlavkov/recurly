import { useAuth } from "@clerk/expo";
import { useFonts } from "expo-font";
import { Redirect, SplashScreen, Stack, useSegments } from "expo-router";
import { useEffect } from "react";

export function RootLayoutContent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  const [fontsLoaded, fontsError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsError) {
      if (__DEV__) {
        console.error("[root-layout:fonts]", fontsError);
      }
      void SplashScreen.hideAsync();
      return;
    }
    if (fontsLoaded && authLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError, authLoaded]);

  // Don't render until auth is ready and fonts either loaded or failed (avoid infinite splash on font error)
  if ((!fontsLoaded && !fontsError) || !authLoaded) return null;

  // Without `app/index.tsx`, cold start can open `/(tabs)`; keep signed-out users on auth.
  if (!isSignedIn && segments[0] === "(tabs)") {
    return <Redirect href="/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
