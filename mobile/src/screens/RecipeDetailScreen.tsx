import { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Image,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  getIngredientNames,
  uploadRecipeImage,
} from "../api/recipes";

type Props = {
  recipeId: string | null;
  goHome: () => void;
};
type IngredientRow = { name: string; amount: string; unit: string };
type Snapshot = {
  title: string;
  category: string;
  cookTime: string;
  servings: string;
  source: string;
  description: string;
  imageUrl: string;
  ingredients: IngredientRow[];
};

const CATEGORIES = ["Завтрак", "Обед", "Ужин", "Перекус"];
const UNITS = [
  "г",
  "кг",
  "мл",
  "л",
  "шт",
  "ч. л.",
  "ст. л.",
  "стакан",
  "щепотка",
  "по вкусу",
];
const MAX_SIZE = 5 * 1024 * 1024;
const HEADER_HEIGHT = 56;
const onlyDigits = (value: string) => value.replace(/\D/g, "");
const emptyIngredient = (): IngredientRow => ({
  name: "",
  amount: "",
  unit: "",
});

export default function RecipeDetailScreen({ recipeId, goHome }: Props) {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [kbVisible, setKbVisible] = useState(false);
useEffect(() => {
  const show = Keyboard.addListener("keyboardDidShow", () => setKbVisible(true));
  const hide = Keyboard.addListener("keyboardDidHide", () => setKbVisible(false));
  return () => {
    show.remove();
    hide.remove();
  };
}, []);
  const isNew = !recipeId;
  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Завтрак");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(),
  ]);
  const [saved, setSaved] = useState<Snapshot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [ingredientNames, setIngredientNames] = useState<string[]>([]);
  const [activeSuggest, setActiveSuggest] = useState<{
    index: number;
    field: "name" | "unit";
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const buildPayload = (finalImageUrl: string | null) => ({
    title: title.trim(),
    description: description.trim() || undefined,
    cooking_time: cookTime ? Number(cookTime) : undefined,
    servings: servings ? Number(servings) : undefined,
    meal_type: category,
    source: source.trim() || undefined,
    image_url: finalImageUrl,
    ingredients: ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name.trim(),
        amount: i.amount ? Number(i.amount) : null,
        unit: i.unit.trim() || null,
      })),
  });

  const applyData = (data: {
    title: string;
    meal_type?: string | null;
    cooking_time?: number | null;
    servings?: number | null;
    source?: string | null;
    description?: string | null;
    image_url?: string | null;
    ingredients?: {
      name: string;
      amount?: number | null;
      unit?: string | null;
    }[];
  }) => {
    const next: Snapshot = {
      title: data.title,
      category: data.meal_type || "Завтрак",
      cookTime: data.cooking_time != null ? String(data.cooking_time) : "",
      servings: data.servings != null ? String(data.servings) : "",
      source: data.source || "",
      description: data.description || "",
      imageUrl: data.image_url || "",
      ingredients: data.ingredients?.length
        ? data.ingredients.map((i) => ({
            name: i.name,
            amount: i.amount != null ? String(i.amount) : "",
            unit: i.unit || "",
          }))
        : [emptyIngredient()],
    };
    setTitle(next.title);
    setCategory(next.category);
    setCookTime(next.cookTime);
    setServings(next.servings);
    setSource(next.source);
    setDescription(next.description);
    setImageUrl(next.imageUrl);
    setIngredients(next.ingredients);
    setSaved(next);
    setImageUri(null);
    setImageMime(null);
  };

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
        applyData(data);
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

  const scrollToField = (key: string, offset = 12) => {
    setTimeout(() => {
      const y = fieldY.current[key];
      if (y != null) {
        scrollRef.current?.scrollTo({
          y: Math.max(y - offset, 0),
          animated: true,
        });
      }
    }, 300);
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Нет доступа к галерее");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_SIZE) {
      setError("Файл больше 5 МБ");
      return;
    }
    setError("");
    setImageUri(asset.uri);
    setImageMime(asset.mimeType || "image/jpeg");
  };

  const handleRemovePhoto = () => {
    setImageUri(null);
    setImageMime(null);
    setImageUrl("");
  };

  const handleCancelEdit = () => {
    if (saved) {
      setTitle(saved.title);
      setCategory(saved.category);
      setCookTime(saved.cookTime);
      setServings(saved.servings);
      setSource(saved.source);
      setDescription(saved.description);
      setImageUrl(saved.imageUrl);
      setIngredients(saved.ingredients.map((i) => ({ ...i })));
    }
    setImageUri(null);
    setImageMime(null);
    setError("");
    setActiveSuggest(null);
    setIsEditing(false);
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
      let finalImageUrl: string | null = imageUrl || null;
      if (imageUri) {
        finalImageUrl = await uploadRecipeImage(
          {
            uri: imageUri,
            type: imageMime || "image/jpeg",
            name: "photo.jpg",
          },
          token
        );
      } else if (!imageUrl) {
        finalImageUrl = null;
      }
      if (isNew) {
        await createRecipe(buildPayload(finalImageUrl), token);
        goHome();
      } else if (recipeId) {
        await updateRecipe(recipeId, buildPayload(finalImageUrl), token);
        const fresh = await getRecipe(recipeId, token);
        applyData(fresh);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = () => {
    setError("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!token || !recipeId) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteRecipe(recipeId, token);
      setShowDeleteModal(false);
      goHome();
    } catch (err: any) {
      setError(err.message || "Ошибка удаления");
    } finally {
      setIsDeleting(false);
    }
  };

  const shownPhoto = imageUri || imageUrl || null;

  const suggestions: string[] = (() => {
    if (!activeSuggest) return [];
    const row = ingredients[activeSuggest.index];
    if (!row) return [];
    if (activeSuggest.field === "name") {
      const q = row.name.trim().toLowerCase();
      return ingredientNames
        .filter((n) => {
          const low = n.toLowerCase();
          return (!q || low.includes(q)) && low !== q;
        })
        .slice(0, 12);
    }
    const q = row.unit.trim().toLowerCase();
    return UNITS.filter((u) => {
      const low = u.toLowerCase();
      return (!q || low.includes(q)) && low !== q;
    });
  })();

  const pickSuggestion = (value: string) => {
    if (!activeSuggest) return;
    updateIngredient(activeSuggest.index, activeSuggest.field, value);
    setActiveSuggest(null);
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

  // ПРОСМОТР
  if (!isNew && !isEditing) {
    const list = ingredients.filter((i) => i.name.trim());
    return (
      <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={goHome}>
            <Text style={styles.back}>← Домой</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text>✏️</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={openDeleteModal}>
              <Text>🗑️</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.card}>
            <View style={styles.photo}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.photoImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 56 }}>🍲</Text>
              )}
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
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => !isDeleting && setShowDeleteModal(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Удалить рецепт?</Text>
              <Text style={styles.modalText}>
                «{title || "Без названия"}» будет удалён без возможности
                восстановления.
              </Text>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  disabled={isDeleting}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalBtnGhostText}>Отмена</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnDanger]}
                  disabled={isDeleting}
                  onPress={confirmDelete}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#fffaf4" />
                  ) : (
                    <Text style={styles.modalBtnDangerText}>Удалить</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  // СОЗДАНИЕ / РЕДАКТИРОВАНИЕ
  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={isEditing ? handleCancelEdit : goHome}>
          <Text style={styles.back}>{isEditing ? "Отмена" : "← Домой"}</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={
          Platform.OS === "ios" ? insets.top + HEADER_HEIGHT : 0
        }
      >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.formScroll,
          { paddingBottom: kbVisible ? 16 : insets.bottom + 40 },]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Фото</Text>
          {shownPhoto ? (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: shownPhoto }}
                style={styles.previewImg}
                resizeMode="cover"
              />
              <Pressable onPress={handleRemovePhoto} disabled={isSaving}>
                <Text style={styles.removePhoto}>Убрать фото</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable
            style={styles.pickBtn}
            onPress={handlePickImage}
            disabled={isSaving}
          >
            <Text style={styles.pickBtnText}>Выбрать фото</Text>
          </Pressable>

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setActiveSuggest(null)}
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
                onChangeText={(v) => setCookTime(onlyDigits(v))}
                onFocus={() => setActiveSuggest(null)}
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
                onChangeText={(v) => setServings(onlyDigits(v))}
                onFocus={() => setActiveSuggest(null)}
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
            onLayout={(e) => {
              fieldY.current.source = e.nativeEvent.layout.y;
            }}
            onFocus={() => {
              setActiveSuggest(null);
              scrollToField("source", 30);
            }}
            placeholder="Бабушка"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Ингредиенты</Text>
          {ingredients.map((ing, index) => (
            <View
              key={index}
              style={styles.ingBlock}
              onLayout={(e) => {
                fieldY.current[`ing-${index}`] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.ingRow}>
                <TextInput
                  style={[styles.input, styles.ingInput, styles.nameInput]}
                  value={ing.name}
                  onChangeText={(v) => {
                    updateIngredient(index, "name", v);
                    setActiveSuggest({ index, field: "name" });
                  }}
                  onFocus={() => {
                    setActiveSuggest({ index, field: "name" });
                    scrollToField(`ing-${index}`);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setActiveSuggest((cur) =>
                        cur?.index === index && cur.field === "name"
                          ? null
                          : cur
                      );
                    }, 150);
                  }}
                  placeholder="Название"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={[styles.input, styles.ingInput, styles.amountInput]}
                  value={ing.amount}
                  onChangeText={(v) =>
                    updateIngredient(index, "amount", onlyDigits(v))
                  }
                  onFocus={() => {
                    setActiveSuggest(null);
                    scrollToField(`ing-${index}`);
                  }}
                  placeholder="Кол"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={[styles.input, styles.ingInput, styles.unitInput]}
                  value={ing.unit}
                  onChangeText={(v) => {
                    updateIngredient(index, "unit", v);
                    setActiveSuggest({ index, field: "unit" });
                  }}
                  onFocus={() => {
                    setActiveSuggest({ index, field: "unit" });
                    scrollToField(`ing-${index}`);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setActiveSuggest((cur) =>
                        cur?.index === index && cur.field === "unit"
                          ? null
                          : cur
                      );
                    }, 150);
                  }}
                  placeholder="Ед."
                  placeholderTextColor="#888"
                />
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => {
                    setActiveSuggest(null);
                    setIngredients((p) => p.filter((_, i) => i !== index));
                  }}
                >
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <Pressable
            style={styles.addIng}
            onPress={() => setIngredients((p) => [...p, emptyIngredient()])}
          >
            <Text style={styles.addIngText}>+ Добавить ингредиент</Text>
          </Pressable>

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            onLayout={(e) => {
              fieldY.current.description = e.nativeEvent.layout.y;
            }}
            onFocus={() => {
              setActiveSuggest(null);
              scrollToField("description", 36);
            }}
            multiline
            placeholder="Как готовить..."
            placeholderTextColor="#888"
            textAlignVertical="top"
            scrollEnabled
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

        {/* Полоса подсказок: лежит над клавиатурой, а не внутри формы */}
        {suggestions.length > 0 && (
          <View style={styles.suggestBar}>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="always"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestBarContent}
            >
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  style={styles.suggestChip}
                  onPress={() => pickSuggestion(s)}
                >
                  <Text style={styles.suggestText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffaf4" },
  header: {
    height: HEADER_HEIGHT,
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
  content: { padding: 20, paddingBottom: 60 },
  formScroll: {
    flexGrow: 1,
    padding: 20,
  },
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
    height: 200,
    backgroundColor: "#515726",
    alignItems: "center",
    justifyContent: "center",
  },
  photoImg: { width: "100%", height: "100%" },
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
  addIngText: { color: "#515726", fontWeight: "700", fontSize: 15 },
  textarea: { height: 160, paddingTop: 10 },
  saveBtn: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#515726", fontWeight: "600", fontSize: 15 },
  previewWrap: { marginBottom: 8 },
  previewImg: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#f2e5bc",
  },
  removePhoto: {
    color: "#c62828",
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  pickBtn: {
    borderWidth: 1,
    borderColor: "#f2e5bc",
    backgroundColor: "#fff7e3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  pickBtnText: { color: "#515726", fontWeight: "600" },

  ingBlock: { marginBottom: 12 },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ingInput: { marginBottom: 0 },
  nameInput: { flex: 2 },
  amountInput: { flex: 1 },
  unitInput: { flex: 1 },
  removeBtn: { alignSelf: "center" },
  remove: { color: "#c62828", fontSize: 16, padding: 8 },

  suggestBar: {
    backgroundColor: "#fff7e3",
    borderTopWidth: 1,
    borderTopColor: "#f2e5bc",
    paddingVertical: 8,
  },
  suggestBarContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
  },
  suggestChip: {
    backgroundColor: "#f2e5bc",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestText: { color: "#515726", fontSize: 14, fontWeight: "500" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(81, 87, 38, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#515726",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: "#6a7040",
    lineHeight: 22,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  modalBtnGhost: {
    backgroundColor: "#fff7e3",
    borderWidth: 1,
    borderColor: "#f2e5bc",
  },
  modalBtnGhostText: { color: "#515726", fontWeight: "600" },
  modalBtnDanger: { backgroundColor: "#8b3a3a" },
  modalBtnDangerText: { color: "#fffaf4", fontWeight: "600" },
});