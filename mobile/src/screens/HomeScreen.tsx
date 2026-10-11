import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import { recipes } from "../data/recipe";

type Props = {
  onAddRecipe?: () => void;
  onOpenRecipe?: (id: string) => void;
};

export default function HomeScreen({ onAddRecipe, onOpenRecipe }: Props) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.page}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Family Recipes</Text>
        <Pressable onPress={logout}>
          <Text style={styles.navButton}>{user?.name || "Выйти"} ▾</Text>
        </Pressable>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.toolbar}>
              <Text style={styles.toolbarTitle}>Мои рецепты</Text>
              <View style={styles.toolbarActions}>
                <Pressable style={styles.iconButton}>
                  <Text>🔍</Text>
                </Pressable>
                <Pressable style={styles.iconButton}>
                  <Text>🧭</Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.addButton} onPress={onAddRecipe}>
              <Text style={styles.addButtonText}>+ Добавить рецепт</Text>
            </Pressable>
          </>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => onOpenRecipe?.(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Рецепты</Text>
            <Text style={styles.emptyText}>Рецептов пока нет.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fffaf4",
  },
  navbar: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: "#fff7e3",
    borderBottomWidth: 1,
    borderBottomColor: "#f2e5bc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  logo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#515726",
  },
  navButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#515726",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toolbarTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#515726",
  },
  toolbarActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#f2e5bc",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "#515726",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyCard: {
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
  emptyText: {
    color: "#777",
  },
});