import { useState } from "react";
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
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { createRecipe } from "../api/recipes";

type Props = {
  onGoHome: () => void;
};

type IngredientRow = {
  name: string;
  amount: string;
  unit: string;
};

const categories = ["Завтрак", "Обед", "Ужин", "Перекус"];

export default function CreateRecipeScreen({ onGoHome }: Props) {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Завтрак");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
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
      await createRecipe(
        {
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
        },
        token
      );
      onGoHome();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onGoHome}>
          <Text style={styles.back}>← Домой</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoText}>📷 Добавить фото (позже)</Text>
        </View>

        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Название рецепта"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Категория</Text>
        <View style={styles.categories}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[
                styles.categoryChip,
                category === c && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(c)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === c && styles.categoryChipTextActive,
                ]}
              >
                {c}
              </Text>
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
              placeholder="30"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Порции</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              placeholder="4"
              placeholderTextColor="#888"
              keyboardType="numeric"
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
          <View key={index} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, styles.ingName]}
              value={ing.name}
              onChangeText={(v) => updateIngredient(index, "name", v)}
              placeholder="Название"
              placeholderTextColor="#888"
            />
            <TextInput
              style={[styles.input, styles.ingAmount]}
              value={ing.amount}
              onChangeText={(v) => updateIngredient(index, "amount", v)}
              placeholder="Кол-во"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.ingUnit]}
              value={ing.unit}
              onChangeText={(v) => updateIngredient(index, "unit", v)}
              placeholder="Ед."
              placeholderTextColor="#888"
            />
            <Pressable onPress={() => removeIngredient(index)} style={styles.removeBtn}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addIng} onPress={addIngredient}>
          <Text style={styles.addIngText}>+ Добавить ингредиент</Text>
        </Pressable>

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Как готовить..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#515726" />
          ) : (
            <Text style={styles.saveText}>Сохранить</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffaf4" },
  header: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#fff7e3",
    borderBottomWidth: 1,
    borderBottomColor: "#f2e5bc",
  },
  back: { color: "#515726", fontWeight: "600", fontSize: 16 },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: "#c62828", marginBottom: 12 },
  photoPlaceholder: {
    height: 140,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d6d6d6",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  photoText: { color: "#777" },
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
    fontSize: 15,
    marginBottom: 14,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f2e5bc",
  },
  categoryChipActive: { backgroundColor: "#f2e5bc" },
  categoryChipText: { color: "#515726", fontSize: 13 },
  categoryChipTextActive: { fontWeight: "700" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ingName: { flex: 2, marginBottom: 8 },
  ingAmount: { flex: 1, marginBottom: 8 },
  ingUnit: { flex: 1, marginBottom: 8 },
  removeBtn: { padding: 8, marginBottom: 8 },
  removeText: { color: "#c62828", fontSize: 16 },
  addIng: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d6d6d6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  addIngText: { color: "#555", fontWeight: "600", fontSize: 13 },
  textarea: { minHeight: 100, marginBottom: 20 },
  saveButton: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: "#515726", fontWeight: "600", fontSize: 15 },
});