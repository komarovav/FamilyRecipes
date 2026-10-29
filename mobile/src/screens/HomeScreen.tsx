import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import { getRecipes, type Recipe } from "../api/recipes";
import ProfileMenu from "../components/ProfileMenu";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  logout: () => void;
  openRecipe: (recipeId: string | null) => void;
};

const CATEGORIES = ["Все", "Завтрак", "Обед", "Ужин", "Перекус"];

export default function HomeScreen({ logout, openRecipe }: Props) {
  const { token, user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setError("");
        setLoading(true);
        const data = await getRecipes(token);
        setRecipes(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesCategory =
        category === "Все" || (r.meal_type || "") === category;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.source || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, category]);

  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
    <View style={styles.navbar}>
      <Text style={styles.logo}>Family Recipes</Text>
      <ProfileMenu logout={logout} />
    </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#515726" />
          <Text style={styles.muted}>Загрузка рецептов...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              <View style={styles.toolbar}>
                <Text style={styles.toolbarTitle}>Мои рецепты</Text>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => setShowFilters((v) => !v)}
                >
                  <Text>🔍</Text>
                </Pressable>
              </View>

              {showFilters && (
                <View style={styles.filters}>
                  <TextInput
                    style={styles.search}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Поиск по названию, описанию, источнику..."
                    placeholderTextColor="#888"
                  />
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
                </View>
              )}

              <Pressable
                style={styles.addBtn}
                onPress={() => openRecipe(null)}
              >
                <Text style={styles.addBtnText}>+ Добавить рецепт</Text>
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          }
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => openRecipe(String(item.id))}
            />
          )}
          ListEmptyComponent={
            !error ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {recipes.length === 0 ? "Рецепты" : "Ничего не найдено"}
                </Text>
                <Text style={styles.muted}>
                  {recipes.length === 0
                    ? "Рецептов пока нет."
                    : "Попробуйте другой запрос или категорию."}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffaf4" },
  navbar: {
  height: 56,
  paddingHorizontal: 20,
  backgroundColor: "#fff7e3",
  borderBottomWidth: 1,
  borderBottomColor: "#f2e5bc",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 20,
  elevation: 20,
},
  logo: { fontSize: 18, fontWeight: "700", color: "#515726" },
  navBtn: { fontSize: 14, fontWeight: "600", color: "#515726" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  content: { padding: 20, paddingBottom: 40 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toolbarTitle: { fontSize: 28, fontWeight: "700", color: "#515726" },
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
  filters: { marginBottom: 16, gap: 10 },
  search: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d6d6d6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#515726",
  },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    backgroundColor: "#fff",
  },
  chipOn: { backgroundColor: "#f2e5bc" },
  chipText: { color: "#515726", fontSize: 13, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  addBtnText: { color: "#515726", fontSize: 15, fontWeight: "600" },
  error: { color: "#c62828", marginBottom: 12 },
  empty: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#515726",
    marginBottom: 8,
  },
  muted: { color: "#777" },
});