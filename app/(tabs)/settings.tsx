import SafeAreaWrapper from "@/components/safe-area-wrapper";
import images from "@/constants/images";
import { capitalizeUsernameFirst } from "@/lib/username";
import { useClerk, useUser } from "@clerk/expo";
import { Image, Pressable, Text, View } from "react-native";

export default function Settings() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  const displayName =
    `${capitalizeUsernameFirst(user?.firstName ?? "")} ${capitalizeUsernameFirst(user?.lastName ?? "")}`.trim() ||
    user?.fullName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <SafeAreaWrapper>
      <Text className="font-sans-bold text-primary mb-6 text-3xl">Settings</Text>

      {/* User Profile Section */}
      <View className="auth-card mb-5">
        <View className="mb-4 flex-row items-center gap-4">
          <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="size-16 rounded-full" />
          <View className="flex-1">
            <Text className="font-sans-bold text-primary text-lg">{capitalizeUsernameFirst(displayName)}</Text>
            {email && <Text className="font-sans-medium text-muted-foreground text-sm">{email}</Text>}
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View className="auth-card mb-5">
        <Text className="font-sans-semibold text-primary mb-3 text-base">Account</Text>
        <View className="gap-2">
          <View className="flex-row items-center justify-between py-2">
            <Text className="font-sans-medium text-muted-foreground text-sm">Username</Text>
            <Text className="font-sans-medium text-primary text-sm">
              {capitalizeUsernameFirst(user?.username ?? "")}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="font-sans-medium text-muted-foreground text-sm">Joined</Text>
            <Text className="font-sans-medium text-primary text-sm">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <Pressable className="auth-button bg-destructive" onPress={handleSignOut}>
        <Text className="auth-button-text text-white">Sign Out</Text>
      </Pressable>
    </SafeAreaWrapper>
  );
}
