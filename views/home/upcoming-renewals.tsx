import { FlatList, View } from "react-native";

import ListHeading from "@/components/list-heading";
import UpcomingSubscriptionCard from "@/components/upcoming-subscription-card";
import { UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import HomeEmptyState from "@/components/home-empty-state";

export default function UpcomingRenewals() {
  return (
    <View>
      <ListHeading title="Upcoming" />

      <FlatList
        data={UPCOMING_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<HomeEmptyState />}
      />
    </View>
  );
}
