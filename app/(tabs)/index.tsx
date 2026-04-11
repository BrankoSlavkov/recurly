import "@/app/index.css";

import SafeAreaWrapper from "@/components/safe-area-wrapper";
import HomeHeader from "@/views/home/header";
import HomeBalance from "@/views/home/balance";

export default function App() {
  return (
    <SafeAreaWrapper>
      <HomeHeader />
      <HomeBalance />
    </SafeAreaWrapper>
  );
}
