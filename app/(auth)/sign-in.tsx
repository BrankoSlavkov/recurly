import { useSignIn } from "@clerk/expo";
import { useForm } from "@tanstack/react-form";
import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AuthPasswordInput } from "@/components/auth-password-input";
import SafeAreaWrapper from "@/components/safe-area-wrapper";
import { replaceAfterClerkAuth } from "@/lib/clerk-auth-navigate";
import { cn } from "@/lib/cn";
import { fieldFirstError } from "@/lib/field-error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const form = useForm({
    defaultValues: {
      emailAddress: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const emailAddress = value.emailAddress.trim();
      const { error } = await signIn.password({
        emailAddress,
        password: value.password,
      });

      if (error) {
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return;
            }
            replaceAfterClerkAuth(decorateUrl);
          },
        });
        return;
      }
    },
  });

  return (
    <SafeAreaWrapper className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="auth-screen"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Subscriptions</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <form.Field
                  name="emailAddress"
                  validators={{
                    onBlur: ({ value }) => {
                      const v = value.trim();
                      if (!v) return "Email is required";
                      if (!EMAIL_RE.test(v)) return "Please enter a valid email address";
                    },
                  }}
                >
                  {(field) => {
                    const err = fieldFirstError(field.state.meta.errors);
                    return (
                      <View className="auth-field">
                        <Text className="auth-label">Email address</Text>
                        <TextInput
                          autoCapitalize="none"
                          autoComplete="email"
                          className={cn("auth-input", { "auth-input-error": err })}
                          keyboardType="email-address"
                          onBlur={field.handleBlur}
                          onChangeText={(t) => field.handleChange(t)}
                          value={field.state.value}
                        />
                        {err ? <Text className="auth-error">{err}</Text> : null}
                        {errors?.fields?.identifier ? (
                          <Text className="auth-error">{errors.fields.identifier.message}</Text>
                        ) : null}
                      </View>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value) return "Password is required";
                    },
                  }}
                >
                  {(field) => {
                    const err = fieldFirstError(field.state.meta.errors);
                    return (
                      <View className="auth-field">
                        <Text className="auth-label">Password</Text>
                        <AuthPasswordInput
                          autoComplete="password"
                          hasError={Boolean(err)}
                          onBlur={field.handleBlur}
                          onChangeText={(t) => field.handleChange(t)}
                          value={field.state.value}
                        />
                        {err ? <Text className="auth-error">{err}</Text> : null}
                        {errors?.fields?.password ? (
                          <Text className="auth-error">{errors.fields.password.message}</Text>
                        ) : null}
                      </View>
                    );
                  }}
                </form.Field>

                <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
                  {({ canSubmit, isSubmitting }) => {
                    const busy = isSubmitting || fetchStatus === "fetching";
                    return (
                      <Pressable
                        className={cn("auth-button", { "auth-button-disabled": !canSubmit || busy })}
                        disabled={!canSubmit || busy}
                        onPress={() => void form.handleSubmit()}
                      >
                        <Text className="auth-button-text">{busy ? "Signing in…" : "Sign in"}</Text>
                      </Pressable>
                    );
                  }}
                </form.Subscribe>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Don&apos;t have an account?</Text>
              <Link className="auth-link" href="/(auth)/sign-up">
                Create account
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
