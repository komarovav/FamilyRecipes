import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { register as registerApi, login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

type Props = {
  onGoLogin: () => void;
};

export default function RegisterScreen({ onGoLogin }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await registerApi({ name, email, password });
      const data = await loginApi({ email, password });
      await login(data.access_token);
    } catch (e: any) {
      setError(e.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Создание аккаунта</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Имя</Text>
        <TextInput
          style={styles.input}
          placeholder="Ваше имя"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          placeholder="Пароль (минимум 6 символов)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#515726" />
          ) : (
            <Text style={styles.buttonText}>Сохранить</Text>
          )}
        </Pressable>

        <Pressable onPress={onGoLogin}>
          <Text style={styles.link}>
            Уже есть аккаунт? <Text style={styles.linkBold}>Войти</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fffaf4",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#f4f4f1",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#515726",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    color: "#515726",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#515726",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f2e5bc",
    color: "#515726",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d6d6d6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#515726",
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    color: "#c62828",
    marginBottom: 12,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#515726",
    fontSize: 14,
  },
  linkBold: { fontWeight: "700" },
});