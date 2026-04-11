import { Text, View } from "react-native";

import { HOME_BALANCE } from "@/constants/data";
import { formatCurrency } from "@/lib/currency-formatter";
import { formatDate } from "@/lib/format-date";

export default function HomeBalance() {
  return (
    <View className="home-balance-card">
      <Text className="home-balance-label">Balance</Text>
      <View className="home-balance-row">
        <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
        <Text className="home-balance-date">{formatDate(HOME_BALANCE.nextRenewalDate)}</Text>
      </View>
    </View>
  );
}
