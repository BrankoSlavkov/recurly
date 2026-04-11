import "@/app/index.css";

import SafeAreaWrapper from "@/components/safe-area-wrapper";
import Subscriptions from "@/views/home/subscriptions";

export default function SubscriptionsTab() {
  return (
    <SafeAreaWrapper>
      <Subscriptions />
    </SafeAreaWrapper>
  );
}
