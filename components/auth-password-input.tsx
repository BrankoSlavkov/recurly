import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { cn } from "@/lib/cn";

type AuthPasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  hasError?: boolean;
  autoComplete?: "password" | "password-new";
};

export function AuthPasswordInput({
  value,
  onChangeText,
  onBlur,
  hasError,
  autoComplete = "password",
}: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View
      className={cn("border-border bg-background flex-row items-center rounded-2xl border pr-1", {
        "border-destructive": hasError,
      })}
    >
      <TextInput
        autoComplete={autoComplete}
        className="font-sans-medium text-primary min-h-[52px] flex-1 px-4 py-4 text-base"
        onBlur={onBlur}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        textContentType={autoComplete === "password-new" ? "newPassword" : "password"}
        value={value}
      />
      <Pressable
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        className="h-12 w-12 items-center justify-center"
        hitSlop={8}
        onPress={() => setVisible((v) => !v)}
      >
        <Ionicons color="#081126" name={visible ? "eye-off-outline" : "eye-outline"} size={22} />
      </Pressable>
    </View>
  );
}
