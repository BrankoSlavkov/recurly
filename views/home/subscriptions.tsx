import { FlatList, View } from "react-native";
import { type PropsWithChildren, useState } from "react";

import ListHeading from "@/components/list-heading";
import SubscriptionCard from "@/components/subscription-card";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import HomeEmptyState from "@/components/home-empty-state";

export default function Subscriptions({ children }: PropsWithChildren) {
  const [expandedSubscription, setExpandedSubscription] = useState<string | null>(null);

  return (
    <View>
      <FlatList
        ListHeaderComponent={() => (
          <>
            {children}
            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={item.id === expandedSubscription}
            onPress={() => {
              setExpandedSubscription((current) => (current === item.id ? null : item.id));
            }}
          />
        )}
        extraData={expandedSubscription}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<HomeEmptyState message="No subscriptions yet." />}
        contentContainerClassName="pb-20"
      />
    </View>
  );
}
