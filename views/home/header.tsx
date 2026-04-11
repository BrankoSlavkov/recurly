import { Image, Text, View } from "react-native";

import { HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { capitalizeUsernameFirst } from "@/lib/username";
import { useUser } from "@clerk/expo";

export default function HomeHeader() {
  const { user } = useUser();
  const displayName = user?.username || HOME_USER.name;

  return (
    <View className="home-header">
      <View className="home-user">
        <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar" />
        <Text className="home-user-name">{capitalizeUsernameFirst(displayName)}</Text>
      </View>

      <View className="home-action-icon-container">
        <Image source={icons.add} className="home-add-icon" />
      </View>
    </View>
  );
}
