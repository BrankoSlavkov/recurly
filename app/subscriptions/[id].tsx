import { Link, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Subscription Detail {id}</Text>
      <Link href="/subscriptions">Go back</Link>
    </View>
  );
}
