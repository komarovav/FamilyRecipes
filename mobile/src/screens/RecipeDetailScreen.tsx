import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  getIngredientNames,
} from "../api/recipes";

type Props = {
  recipeId: string | null;
  goHome: () => void;
};

type IngredientRow = { name: string; amount: string; unit: string };

const CATEGORIES = ["Завтрак", "Обед", "Ужин", "Перекус"];

const emptyIngredient = (): IngredientRow => ({
  name: "",
  amount: "",
  unit: "",
});

export default function RecipeDetailScreen({ recipeId, goHome }: Props) {
  const { token } = useAuth();
  const isNew = !recipeId;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Завтрак");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(),
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [ingredientNames, setIngredientNames] = useState<string[]>([]);

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim() || undefined,
    cooking_time: cookTime ? Number(cookTime) : undefined,
    servings: servings ? Number(servings) : undefined,
    meal_type: category,
    source: source.trim() || undefined,
    ingredients: ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name.trim(),
        amount: i.amount ? Number(i.amount) : null,
        unit: i.unit.trim() || null,
      })),
  });

  useEffect(() => {
    if (isNew || !token || !recipeId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getRecipe(recipeId, token);
        setTitle(data.title);
        setCategory(data.meal_type || "Завтрак");
        setCookTime(data.cooking_time != null ? String(data.cooking_time) : "");
        setServings(data.servings != null ? String(data.servings) : "");
        setSource(data.source || "");
        setDescription(data.description || "");
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i) => ({
                name: i.name,
                amount: i.amount != null ? String(i.amount) : "",
                unit: i.unit || "",
              }))
            : [emptyIngredient()]
        );
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить рецепт");
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, recipeId, token]);

  useEffect(() => {
    if (!token || (!isNew && !isEditing)) return;
    getIngredientNames(token)
      .then(setIngredientNames)
      .catch(() => setIngredientNames([]));
  }, [token, isNew, isEditing]);

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Введите название рецепта");
      return;
    }
    if (!token) {
      setError("Вы не авторизованы");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      if (isNew) {
        await createRecipe(buildPayload(), token);
        goHome();
      } else if (recipeId) {
        await updateRecipe(recipeId, buildPayload(), token);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!token || !recipeId) return;
    Alert.alert(
      "Удалить рецепт?",
      `«${title || "Без названия"}» будет удалён без возможности восстановления.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe(recipeId, token);
              goHome();
            } catch (err: any) {
              setError(err.message || "Ошибка удаления");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={goHome}>
            <Text style={styles.back}>← Домой</Text>
          </Pressable>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color="#515726" />
          <Text style={styles.muted}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isNew && !isEditing) {
    const list = ingredients.filter((i) => i.name.trim());
    return (
      <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={goHome}>
            <Text style={styles.back}>← Домой</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconBtn} onPress={() => setIsEditing(true)}>
              <Text>✏️</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleDelete}>
              <Text>🗑️</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.card}>
            <View style={styles.photo}>
              <Text style={{ fontSize: 56 }}>🍲</Text>
            </View>
            <View style={styles.body}>
              {!!category && <Text style={styles.badge}>{category}</Text>}
              <Text style={styles.title}>{title || "Без названия"}</Text>
              <View style={styles.metaRow}>
                {!!cookTime && (
                  <Text style={styles.meta}>⏱ {cookTime} мин</Text>
                )}
                {!!servings && (
                  <Text style={styles.meta}>🍽 {servings} порц.</Text>
                )}
                {!!source && <Text style={styles.meta}>от {source}</Text>}
              </View>
              <Text style={styles.h2}>Ингредиенты</Text>
              {list.length > 0 ? (
                list.map((ing, i) => (
                  <View key={i} style={styles.ingItem}>
                    <Text style={styles.ingName}>{ing.name}</Text>
                    <Text style={styles.ingAmount}>
                      {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>Нет ингредиентов</Text>
              )}
              {!!description && (
                <>
                  <Text style={styles.h2}>Описание</Text>
                  <Text style={styles.desc}>{description}</Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={isEditing ? () => setIsEditing(false) : goHome}>
            <Text style={styles.back}>{isEditing ? "Отмена" : "← Домой"}</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Название рецепта"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.cats}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, category === c && styles.chipOn]}
                onPress={() => setCategory(c)}
              >
                <Text style={styles.chipText}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Время (мин)</Text>
              <TextInput
                style={styles.input}
                value={cookTime}
                onChangeText={setCookTime}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Порции</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          <Text style={styles.label}>Источник</Text>
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="Бабушка"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Ингредиенты</Text>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={ing.name}
                onChangeText={(v) => updateIngredient(index, "name", v)}
                placeholder="Название"
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={ing.amount}
                onChangeText={(v) => updateIngredient(index, "amount", v)}
                placeholder="Кол"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={ing.unit}
                onChangeText={(v) => updateIngredient(index, "unit", v)}
                placeholder="Ед."
                placeholderTextColor="#888"
              />
              <Pressable
                onPress={() =>
                  setIngredients((p) => p.filter((_, i) => i !== index))
                }
              >
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            style={styles.addIng}
            onPress={() =>
              setIngredients((p) => [...p, emptyIngredient()])
            }
          >
            <Text style={styles.addIngText}>+ Добавить ингредиент</Text>
          </Pressable>
          {ingredientNames.length > 0 && (
            <Text style={styles.hint}>
              Подсказки: {ingredientNames.slice(0, 5).join(", ")}…
            </Text>
          )}

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Как готовить..."
            placeholderTextColor="#888"
            textAlignVertical="top"
          />

          <Pressable
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#515726" />
            ) : (
              <Text style={styles.saveText}>
                {isNew ? "Сохранить" : "Сохранить изменения"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffaf4" },
  header: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#fff7e3",
    borderBottomWidth: 1,
    borderBottomColor: "#f2e5bc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  back: { color: "#515726", fontWeight: "600", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: "#c62828", marginBottom: 12 },
  muted: { color: "#777" },
  card: {
    backgroundColor: "#fff7e3",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f2e5bc",
  },
  photo: {
    height: 160,
    backgroundColor: "#515726",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#f2e5bc",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    color: "#515726",
    fontWeight: "600",
    marginBottom: 10,
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#515726",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  meta: {
    backgroundColor: "#fffaf4",
    borderWidth: 1,
    borderColor: "#f2e5bc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#515726",
    fontSize: 13,
  },
  h2: {
    fontSize: 16,
    fontWeight: "700",
    color: "#515726",
    marginBottom: 10,
    marginTop: 8,
  },
  ingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fffaf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    padding: 12,
    marginBottom: 8,
  },
  ingName: { fontWeight: "600", color: "#515726" },
  ingAmount: { color: "#777" },
  desc: { color: "#515726", lineHeight: 22 },
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  cats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    backgroundColor: "#fff",
  },
  chipOn: { backgroundColor: "#f2e5bc" },
  chipText: { color: "#515726", fontSize: 13 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  remove: { color: "#c62828", fontSize: 16, padding: 8 },
  addIng: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d6d6d6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  addIngText: { color: "#555", fontWeight: "600" },
  hint: { color: "#777", fontSize: 12, marginBottom: 12 },
  textarea: { minHeight: 100 },
  saveBtn: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#515726", fontWeight: "600", fontSize: 15 },
});