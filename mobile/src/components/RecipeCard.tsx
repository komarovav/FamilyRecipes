import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import type { Recipe } from "../api/recipes";

type Props = {
  recipe: Recipe;
  onPress: () => void;
};

export default function RecipeCard({ recipe, onPress }: Props) {
  const photo = recipe.image_url || null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photo}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.photoImg}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.photoIcon}>🍲</Text>
        )}
        {!!recipe.meal_type && (
          <View style={styles.category}>
            <Text style={styles.categoryText}>{recipe.meal_type}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        {!!recipe.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}
        <View style={styles.meta}>
          {recipe.cooking_time != null && (
            <Text style={styles.metaItem}>⏱ {recipe.cooking_time} мин</Text>
          )}
          {recipe.servings != null && (
            <Text style={styles.metaItem}>🍽 {recipe.servings} порц.</Text>
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
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
    marginBottom: 16,
  },
  photo: {
    height: 200,
    backgroundColor: "#515726",
    alignItems: "center",
    justifyContent: "center",
  },
  photoImg: {
    width: "100%",
    height: "100%",
  },
  photoIcon: {
    fontSize: 40,
    opacity: 0.4,
  },
  category: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fffaf4",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#515726",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff7e3",
  },
  desc: {
    fontSize: 13,
    color: "#fffaf4",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
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