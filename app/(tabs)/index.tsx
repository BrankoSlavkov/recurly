import "@/app/index.css";

import SafeAreaWrapper from "@/components/safe-area-wrapper";
import HomeHeader from "@/views/home/header";
import HomeBalance from "@/views/home/balance";
import UpcomingRenewals from "@/views/home/upcoming-renewals";
import Subscriptions from "@/views/home/subscriptions";

export default function App() {
  return (
    <SafeAreaWrapper>
      <Subscriptions>
        <HomeHeader />
        <HomeBalance />
        <UpcomingRenewals />
      </Subscriptions>
    </SafeAreaWrapper>
  );
}
