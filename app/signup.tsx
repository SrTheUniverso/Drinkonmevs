import { StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Auth from "@/lib/auth";
import { getApiBaseUrl } from "@/constants/oauth";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth({ autoFetch: false });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryColor = useThemeColor({}, "secondary");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleSignup = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        setError("Por favor, preencha todos os campos");
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não correspondem");
        return;
      }

      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
        return;
      }

      setLoading(true);
      setError(null);

      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/api/auth/signup`;

      console.log("[Signup] Attempting signup with email:", email);
      console.log("[Signup] API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      console.log("[Signup] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Falha ao criar conta");
      }

      const data = await response.json();
      console.log("[Signup] Signup successful, token received");

      // Store token and user info
      if (data.token) {
        await Auth.setSessionToken(data.token);
      }

      if (data.user) {
        const userInfo: Auth.User = {
          id: data.user.id,
          openId: data.user.openId || data.user.id.toString(),
          name: data.user.name || name,
          email: data.user.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        };
        await Auth.setUserInfo(userInfo);
      }

      // Navigate to home
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[Signup] Error:", err);
      const message = err instanceof Error ? err.message : "Erro ao criar conta";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
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
          {/* Header */}
          <Pressable onPress={handleBackToLogin} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>← Voltar</ThemedText>
          </Pressable>

          {/* Título */}
          <ThemedText type="title" style={styles.title}>
            Criar Conta
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Junte-se ao DrinkOnMe e resgate drinks grátis
          </ThemedText>

          {/* Formulário */}
          <ThemedView style={styles.formContainer}>
            {error && (
              <ThemedView style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </ThemedView>
            )}

            {/* Name Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nome Completo</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    backgroundColor: surfaceColor,
                    borderColor: secondaryColor,
                  },
                ]}
                placeholder="Seu nome"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoCapitalize="words"
              />
            </ThemedView>

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

            {/* Confirm Password Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
              />
            </ThemedView>

            {/* Signup Button */}
            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.signupButtonPressed,
                loading && styles.signupButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.signupText}>Criar Conta</ThemedText>
              )}
            </Pressable>
          </ThemedView>
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
  backButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
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
  signupButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 8,
  },
  signupButtonPressed: {
    opacity: 0.8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
