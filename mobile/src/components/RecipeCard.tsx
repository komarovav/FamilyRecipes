import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Recipe } from "../api/recipes";

type Props = {
  recipe: Recipe;
  onPress: () => void;
};

export default function RecipeCard({ recipe, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photo}>
        <Text style={styles.photoPlaceholder}>🍲</Text>
        {!!recipe.meal_type && (
          <View style={styles.category}>
            <Text style={styles.categoryText}>{recipe.meal_type}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        {!!recipe.description && (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}
        <View style={styles.meta}>
          {recipe.cooking_time != null && (
            <Text style={styles.metaText}>⏱ {recipe.cooking_time} мин</Text>
          )}
          {recipe.servings != null && (
            <Text style={styles.metaText}>🍽 {recipe.servings} порц.</Text>
          )}
        </View>
        {!!recipe.source && (
          <Text style={styles.source}>от {recipe.source}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#488c42",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  photo: {
    height: 140,
    backgroundColor: "#515726",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholder: {
    fontSize: 40,
    opacity: 0.5,
  },
  category: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#fffaf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#515726",
  },
  body: {
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff7e3",
  },
  description: {
    fontSize: 13,
    color: "#fffaf4",
  },
  meta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#fffaf4",
  },
  source: {
    marginTop: 4,
    fontSize: 12,
    color: "#fffaf4",
    fontStyle: "italic",
  },
});