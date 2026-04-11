import { View, Image } from "react-native";

import { cn } from "@/lib/cn";

export default function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <View className="tabs-icon">
      <View className={cn("tabs-pill", { "tabs-active": focused })}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
}
