import { View, Text, Image } from "react-native";

import images from "@/constants/images";
import { HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";

export default function HomeHeader() {
  return (
    <View className="home-header">
      <View className="home-user">
        <Image source={images.avatar} className="home-avatar" />
        <Text className="home-user-name">{HOME_USER.name}</Text>
      </View>

      <Image source={icons.add} className="home-add-icon" />
    </View>
  );
}
