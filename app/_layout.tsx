import { RootLayoutContent } from "@/components/root-layout";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <RootLayoutContent />
    </ClerkProvider>
  );
}
