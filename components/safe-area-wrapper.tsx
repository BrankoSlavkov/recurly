import { styled } from "nativewind";
import { type PropsWithChildren } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

const SafeAreaView = styled(RNSafeAreaView);

export default function SafeAreaWrapper({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <SafeAreaView className={cn("bg-background flex-1 p-5", className)}>{children}</SafeAreaView>;
}
