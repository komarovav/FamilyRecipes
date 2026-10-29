import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { register as registerApi, login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

type Props = {
  onGoLogin: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function RegisterScreen({ onGoLogin }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Введите корректный email");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      const data = await loginApi({
        email: email.trim(),
        password,
      });
      await login(data.access_token);
    } catch (e: any) {
      const msg = e?.message || "";
      if (
        msg.includes("Не удалось связаться") ||
        msg.includes("Нет связи") ||
        msg.includes("network") ||
        msg === "Failed to fetch" ||
        e?.name === "TypeError"
      ) {
        setError("Сервер недоступен. Проверьте сеть и что бэкенд запущен.");
      } else {
        setError(msg || "Ошибка регистрации");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<KeyboardAvoidingView
    style={styles.page}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
  >
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
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
          onChangeText={(v) => {
            setError("");
            setName(v);
          }}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={(v) => {
            setError("");
            setEmail(v);
          }}
        />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          placeholder="Пароль (минимум 6 символов)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={(v) => {
            setError("");
            setPassword(v);
          }}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#515726" />
          ) : (
            <Text style={styles.buttonText}>
              {loading ? "Создаем аккаунт..." : "Сохранить"}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={onGoLogin} disabled={loading}>
          <Text style={styles.link}>
            Уже есть аккаунт? <Text style={styles.linkBold}>Войти</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
  flexGrow: 1,
  justifyContent: "center",
  padding: 24,
  paddingBottom: 40,
  },
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