import { Text } from "react-native";

export default function HomeEmptyState({ message }: { message: string }) {
  return <Text className="home-empty-state">{message}</Text>;
}
