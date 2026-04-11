import { useAuth, useSignUp } from "@clerk/expo";
import { useForm } from "@tanstack/react-form";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthPasswordInput } from "@/components/auth-password-input";
import SafeAreaWrapper from "@/components/safe-area-wrapper";
import { replaceAfterClerkAuth } from "@/lib/clerk-auth-navigate";
import { cn } from "@/lib/cn";
import { fieldFirstError } from "@/lib/field-error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUsername(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Username is required";
  if (v.length < 4) return "Username must be at least 4 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(v)) {
    return "Use letters, numbers, and underscores only";
  }
  return undefined;
}

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  /** Local step after `sendEmailCode()` — Clerk status alone can miss the cut (e.g. non-empty `missingFields`). */
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const registerForm = useForm({
    defaultValues: {
      emailAddress: "",
      username: "",
      password: "",
      acceptedTerms: false,
    },
    onSubmit: async ({ value }) => {
      const emailAddress = value.emailAddress.trim();
      const username = value.username.trim();
      const { error } = await signUp.password({
        emailAddress,
        username,
        password: value.password,
        legalAccepted: value.acceptedTerms,
      });

      if (error) {
        return;
      }

      await signUp.verifications.sendEmailCode();
      setVerificationEmail(emailAddress);
    },
  });

  /** Verification step uses local state — TanStack submit pipeline was no-op’ing (validation early-exit) with no feedback. */
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  /** Clerk only creates a session when `status === 'complete'`; `finalize()` fails otherwise (e.g. missing legal acceptance). */
  const [incompleteSignupHint, setIncompleteSignupHint] = useState<string | null>(null);
  const [postVerifyNeedsLegal, setPostVerifyNeedsLegal] = useState(false);
  const [postVerifyNeedsUsername, setPostVerifyNeedsUsername] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState("");

  const finalizeCompletedSignUp = useCallback(async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }
        replaceAfterClerkAuth(decorateUrl);
      },
    });
  }, [signUp]);

  const submitEmailVerification = useCallback(async () => {
    const code = verificationCode.trim();
    setIncompleteSignupHint(null);
    setPostVerifyNeedsLegal(false);
    setPostVerifyNeedsUsername(false);
    if (!code) {
      return;
    }
    Keyboard.dismiss();
    setVerifyBusy(true);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        return;
      }

      if (signUp.status !== "complete") {
        if (signUp.missingFields.includes("username")) {
          setRecoveryUsername((u) => u || (typeof signUp.username === "string" ? signUp.username : ""));
          setPostVerifyNeedsUsername(true);
          return;
        }
        if (signUp.missingFields.includes("legal_accepted")) {
          setPostVerifyNeedsLegal(true);
          return;
        }
        setIncompleteSignupHint(
          `Sign-up is not finished yet. Clerk still needs: ${(signUp.missingFields ?? []).join(", ") || "more information"}. Adjust required fields in the Clerk Dashboard or collect them in the app.`,
        );
        return;
      }

      await finalizeCompletedSignUp();
    } catch (err) {
      if (__DEV__) {
        console.error("[sign-up:verify]", "unexpected error", err);
      }
      throw err;
    } finally {
      setVerifyBusy(false);
    }
  }, [finalizeCompletedSignUp, signUp, verificationCode, verificationEmail]);

  const submitRecoveryUsername = useCallback(async () => {
    const u = validateUsername(recoveryUsername);
    if (u) {
      setIncompleteSignupHint(u);
      return;
    }
    setIncompleteSignupHint(null);
    setVerifyBusy(true);
    try {
      // SDK typings omit `username` on Future `update`; Clerk accepts it when username is in `missingFields`.
      const { error: updateError } = await signUp.update(
        { username: recoveryUsername.trim() } as unknown as Parameters<typeof signUp.update>[0],
      );
      if (updateError) {
        setIncompleteSignupHint(
          typeof updateError.message === "string" ? updateError.message : "Could not save username.",
        );
        return;
      }
      if (signUp.status !== "complete") {
        setIncompleteSignupHint(
          `Still incomplete. Missing: ${(signUp.missingFields ?? []).join(", ") || "unknown"}.`,
        );
        setPostVerifyNeedsUsername(false);
        return;
      }
      setPostVerifyNeedsUsername(false);
      await finalizeCompletedSignUp();
    } finally {
      setVerifyBusy(false);
    }
  }, [finalizeCompletedSignUp, recoveryUsername, signUp]);

  const acceptLegalAndContinue = useCallback(async () => {
    setIncompleteSignupHint(null);
    setVerifyBusy(true);
    try {
      const { error: updateError } = await signUp.update({ legalAccepted: true });
      if (updateError) {
        setIncompleteSignupHint("Could not save your acceptance. Please try again.");
        return;
      }
      if (signUp.status !== "complete") {
        setIncompleteSignupHint(
          `Still incomplete. Missing: ${(signUp.missingFields ?? []).join(", ") || "unknown"}.`,
        );
        setPostVerifyNeedsLegal(false);
        return;
      }
      setPostVerifyNeedsLegal(false);
      await finalizeCompletedSignUp();
    } finally {
      setVerifyBusy(false);
    }
  }, [finalizeCompletedSignUp, signUp]);

  const clerkNeedsEmailCode =
    signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address");

  // Restore verify step if user left and came back while Clerk still holds the attempt
  useEffect(() => {
    if (!clerkNeedsEmailCode || verificationEmail !== null) {
      return;
    }
    const fromClerk = signUp.emailAddress;
    if (typeof fromClerk === "string" && fromClerk.length > 0) {
      setVerificationEmail(fromClerk);
    }
  }, [clerkNeedsEmailCode, signUp.emailAddress, verificationEmail]);

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const showEmailVerify = verificationEmail !== null || clerkNeedsEmailCode;

  if (showEmailVerify) {
    return (
      <SafeAreaWrapper className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="auth-screen"
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
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
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to {verificationEmail ?? signUp.emailAddress ?? "your email"}
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="one-time-code"
                      className={cn("auth-input", errors?.fields?.code && "auth-input-error")}
                      keyboardType="number-pad"
                      onChangeText={(t) => {
                        setVerificationCode(t);
                        setPostVerifyNeedsLegal(false);
                        setPostVerifyNeedsUsername(false);
                        setIncompleteSignupHint(null);
                      }}
                      value={verificationCode}
                    />
                    {errors?.fields?.code ? (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    ) : null}
                  </View>

                  {postVerifyNeedsUsername ? (
                    <View className="gap-3">
                      <Text className="font-sans-medium text-primary text-sm leading-5">
                        Choose a username for your account (required by your Clerk settings).
                      </Text>
                      <View className="auth-field">
                        <Text className="auth-label">Username</Text>
                        <TextInput
                          autoCapitalize="none"
                          autoComplete="username"
                          autoCorrect={false}
                          className="auth-input"
                          onChangeText={(t) => {
                            setRecoveryUsername(t);
                            setIncompleteSignupHint(null);
                          }}
                          value={recoveryUsername}
                        />
                        {incompleteSignupHint && postVerifyNeedsUsername ? (
                          <Text className="auth-error">{incompleteSignupHint}</Text>
                        ) : null}
                      </View>
                      <Pressable
                        className={cn("auth-secondary-button", { "opacity-50": verifyBusy })}
                        disabled={verifyBusy}
                        onPress={() => void submitRecoveryUsername()}
                      >
                        <Text className="auth-secondary-button-text">Save username</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {postVerifyNeedsLegal ? (
                    <View className="gap-3">
                      <Text className="font-sans-medium text-primary text-sm leading-5">
                        Your Clerk app still requires accepting the terms before we can create your account. Tap below to
                        continue.
                      </Text>
                      <Pressable
                        className={cn("auth-secondary-button", { "opacity-50": verifyBusy })}
                        disabled={verifyBusy}
                        onPress={() => void acceptLegalAndContinue()}
                      >
                        <Text className="auth-secondary-button-text">I accept — continue</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {incompleteSignupHint ? <Text className="auth-error">{incompleteSignupHint}</Text> : null}

                  <Pressable
                    className={cn("auth-button", {
                      "auth-button-disabled":
                        verifyBusy ||
                        !verificationCode.trim() ||
                        postVerifyNeedsLegal ||
                        postVerifyNeedsUsername,
                    })}
                    disabled={
                      verifyBusy ||
                      !verificationCode.trim() ||
                      postVerifyNeedsLegal ||
                      postVerifyNeedsUsername
                    }
                    onPress={() => void submitEmailVerification()}
                  >
                    <Text className="auth-button-text">{verifyBusy ? "Verifying…" : "Verify email"}</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    disabled={fetchStatus === "fetching"}
                    onPress={() => {
                      void signUp.verifications.sendEmailCode();
                    }}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaWrapper>
    );
  }

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
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">Start tracking your subscriptions and never miss a payment</Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <registerForm.Field
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
                          className={cn("auth-input", err && "auth-input-error")}
                          keyboardType="email-address"
                          onBlur={field.handleBlur}
                          onChangeText={(t) => field.handleChange(t)}
                          value={field.state.value}
                        />
                        {err ? <Text className="auth-error">{err}</Text> : null}
                        {errors?.fields?.emailAddress ? (
                          <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
                        ) : null}
                      </View>
                    );
                  }}
                </registerForm.Field>

                <registerForm.Field
                  name="username"
                  validators={{
                    onBlur: ({ value }) => validateUsername(value),
                    onSubmit: ({ value }) => validateUsername(value),
                  }}
                >
                  {(field) => {
                    const err = fieldFirstError(field.state.meta.errors);
                    return (
                      <View className="auth-field">
                        <Text className="auth-label">Username</Text>
                        <TextInput
                          autoCapitalize="none"
                          autoComplete="username"
                          autoCorrect={false}
                          className={cn("auth-input", err && "auth-input-error")}
                          onBlur={field.handleBlur}
                          onChangeText={(t) => field.handleChange(t)}
                          value={field.state.value}
                        />
                        {err ? <Text className="auth-error">{err}</Text> : null}
                        {errors?.fields?.username ? (
                          <Text className="auth-error">{errors.fields.username.message}</Text>
                        ) : null}
                      </View>
                    );
                  }}
                </registerForm.Field>

                <registerForm.Field
                  name="password"
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value) return "Password is required";
                      if (value.length < 8) return "Password must be at least 8 characters";
                    },
                  }}
                >
                  {(field) => {
                    const err = fieldFirstError(field.state.meta.errors);
                    return (
                      <View className="auth-field">
                        <Text className="auth-label">Password</Text>
                        <AuthPasswordInput
                          autoComplete="password-new"
                          hasError={Boolean(err)}
                          onBlur={field.handleBlur}
                          onChangeText={(t) => field.handleChange(t)}
                          value={field.state.value}
                        />
                        {err ? <Text className="auth-error">{err}</Text> : null}
                        {errors?.fields?.password ? (
                          <Text className="auth-error">{errors.fields.password.message}</Text>
                        ) : null}
                        {!field.state.meta.isTouched ? (
                          <Text className="auth-helper">Minimum 8 characters required</Text>
                        ) : null}
                      </View>
                    );
                  }}
                </registerForm.Field>

                <registerForm.Field
                  name="acceptedTerms"
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return "Please accept the terms to continue";
                    },
                  }}
                >
                  {(field) => {
                    const err = fieldFirstError(field.state.meta.errors);
                    return (
                      <View className="auth-field">
                        <Pressable
                          className="flex-row gap-3 py-1"
                          onPress={() => field.handleChange(!field.state.value)}
                        >
                          <View
                            className={cn(
                              "border-border mt-0.5 size-5 rounded border",
                              field.state.value && "bg-accent border-accent",
                            )}
                          />
                          <Text className="font-sans-medium text-primary flex-1 text-sm leading-5">
                            I agree to the Terms of Service and Privacy Policy
                          </Text>
                        </Pressable>
                        {err ? <Text className="auth-error mt-1">{err}</Text> : null}
                      </View>
                    );
                  }}
                </registerForm.Field>

                <registerForm.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
                  {({ canSubmit, isSubmitting }) => {
                    const busy = isSubmitting || fetchStatus === "fetching";
                    return (
                      <Pressable
                        className={cn("auth-button", { "auth-button-disabled": !canSubmit || busy })}
                        disabled={!canSubmit || busy}
                        onPress={() => void registerForm.handleSubmit()}
                      >
                        <Text className="auth-button-text">{busy ? "Creating account…" : "Create account"}</Text>
                      </Pressable>
                    );
                  }}
                </registerForm.Subscribe>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link className="auth-link" href="/(auth)/sign-in">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
