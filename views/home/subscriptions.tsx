import { FlatList, Keyboard, KeyboardAvoidingView, Platform, TextInput, View } from "react-native";
import { type PropsWithChildren, memo, useEffect, useMemo, useState } from "react";

import ListHeading from "@/components/list-heading";
import SubscriptionCard from "@/components/subscription-card";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import HomeEmptyState from "@/components/home-empty-state";

function subscriptionMatchesQuery(item: Subscription, rawQuery: string) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const fields = [item.name, item.plan, item.category, item.billing, item.status, item.paymentMethod].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return fields.some((field) => field.toLowerCase().includes(q));
}

const SubscriptionsListHeader = memo(function SubscriptionsListHeader({
  children,
  searchQuery,
  onSearchQueryChange,
}: PropsWithChildren<{
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}>) {
  return (
    <>
      {children}
      <ListHeading title="All Subscriptions" />
      <TextInput
        className="auth-input mb-4 py-3.5"
        placeholder="Search by name, category, plan…"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </>
  );
});

export default function Subscriptions({ children }: PropsWithChildren) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscription, setExpandedSubscription] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(
    () => HOME_SUBSCRIPTIONS.filter((item) => subscriptionMatchesQuery(item, searchQuery)),
    [searchQuery],
  );

  useEffect(() => {
    setExpandedSubscription(null);
  }, [searchQuery]);

  const emptyMessage =
    searchQuery.trim().length > 0 ? "No subscriptions match your search." : "No subscriptions yet.";

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="never"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
        ListHeaderComponent={
          <SubscriptionsListHeader searchQuery={searchQuery} onSearchQueryChange={setSearchQuery}>
            {children}
          </SubscriptionsListHeader>
        }
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={item.id === expandedSubscription}
            onPress={() => {
              Keyboard.dismiss();
              setExpandedSubscription((current) => (current === item.id ? null : item.id));
            }}
          />
        )}
        extraData={[expandedSubscription, searchQuery]}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<HomeEmptyState message={emptyMessage} />}
        contentContainerClassName="pb-20"
      />
    </KeyboardAvoidingView>
  );
}
