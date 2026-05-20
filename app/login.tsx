import { StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Auth from "@/lib/auth";
import { getApiBaseUrl } from "@/constants/oauth";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth({ autoFetch: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryColor = useThemeColor({}, "secondary");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("Por favor, preencha email e senha");
        return;
      }

      setLoading(true);
      setError(null);

      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/api/auth/login`;

      console.log("[Login] Attempting login with email:", email);
      console.log("[Login] API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      console.log("[Login] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Falha ao fazer login");
      }

      const data = await response.json();
      console.log("[Login] Login successful, token received");

      // Store token and user info
      if (data.token) {
        await Auth.setSessionToken(data.token);
      }

      if (data.user) {
        const userInfo: Auth.User = {
          id: data.user.id,
          openId: data.user.openId || data.user.id.toString(),
          name: data.user.name || null,
          email: data.user.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        };
        await Auth.setUserInfo(userInfo);
      }

      // Navigate to home
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[Login] Error:", err);
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.push({
      pathname: "/signup",
    } as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: Math.max(insets.left, 16),
              paddingRight: Math.max(insets.right, 16),
            },
          ]}
        >
          {/* Logo */}
          <ThemedView style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
            />
          </ThemedView>

          {/* Título */}
          <ThemedText type="title" style={styles.title}>
            DrinkOnMe
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Resgate drinks grátis em bares participantes
          </ThemedText>

          {/* Formulário */}
          <ThemedView style={styles.formContainer}>
            {error && (
              <ThemedView style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </ThemedView>
            )}

            {/* Email Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    backgroundColor: surfaceColor,
                    borderColor: secondaryColor,
                  },
                ]}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Senha</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    backgroundColor: surfaceColor,
                    borderColor: secondaryColor,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
              />
            </ThemedView>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                loading && styles.loginButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.loginText}>Entrar</ThemedText>
              )}
            </Pressable>

            {/* Signup Link */}
            <ThemedView style={styles.signupContainer}>
              <ThemedText style={styles.signupText}>Não tem conta? </ThemedText>
              <Pressable onPress={handleSignup} disabled={loading}>
                <ThemedText style={styles.signupLink}>Criar conta</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>

          {/* Forgot Password Link */}
          <Pressable style={styles.forgotPasswordContainer}>
            <ThemedText style={styles.forgotPasswordLink}>
              Esqueceu a senha?
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 14,
    color: "#666",
  },
  formContainer: {
    marginBottom: 24,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 44,
  },
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 8,
  },
  loginButtonPressed: {
    opacity: 0.8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordLink: {
    fontSize: 14,
    color: "#004E89",
    fontWeight: "500",
  },
});
