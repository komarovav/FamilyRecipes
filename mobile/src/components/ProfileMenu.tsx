import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { deleteAccount } from "../api/auth";

type Props = {
  logout: () => void;
};

export default function ProfileMenu({ logout }: Props) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const openDeleteModal = () => {
    setOpen(false);
    setError("");
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteAccount(token);
      setShowDeleteModal(false);
      logout();
    } catch (err: any) {
      setError(err.message || "Ошибка при удалении аккаунта");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.profileBtn}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={styles.profileBtnText}>
          {user?.name || "Профиль"} ▼
        </Text>
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          <Text style={styles.name}>{user?.name || "User"}</Text>
          {!!user?.email && <Text style={styles.email}>{user.email}</Text>}

          <Pressable style={styles.item} onPress={handleLogout}>
            <Text style={styles.itemText}>Выйти</Text>
          </Pressable>

          <Pressable style={styles.item} onPress={openDeleteModal}>
            <Text style={styles.deleteText}>Удалить аккаунт</Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.cardTitle}>Удалить аккаунт?</Text>
            <Text style={styles.cardText}>
              Аккаунт «{user?.name || "пользователь"}» и все связанные
              рецепты будут удалены без возможности восстановления.
            </Text>
            {!!error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                disabled={isDeleting}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.btnGhostText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnDanger]}
                disabled={isDeleting}
                onPress={handleDeleteAccount}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fffaf4" />
                ) : (
                  <Text style={styles.btnDangerText}>Удалить</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    zIndex: 20,
  },
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f2e5bc",
  },
  profileBtnText: {
    color: "#515726",
    fontWeight: "600",
    fontSize: 14,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 44,
    minWidth: 210,
    backgroundColor: "#fffaf4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    padding: 12,
    elevation: 6,
  },
  name: {
    fontWeight: "700",
    color: "#515726",
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 10,
  },
  itemText: {
    color: "#515726",
    fontWeight: "600",
  },
  deleteText: {
    color: "#c62828",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(81, 87, 38, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fffaf4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f2e5bc",
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#515726",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: "#6a7040",
    lineHeight: 22,
    marginBottom: 16,
  },
  error: {
    color: "#c62828",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  btnGhost: {
    backgroundColor: "#fff7e3",
    borderWidth: 1,
    borderColor: "#f2e5bc",
  },
  btnGhostText: {
    color: "#515726",
    fontWeight: "600",
  },
  btnDanger: {
    backgroundColor: "#8b3a3a",
  },
  btnDangerText: {
    color: "#fffaf4",
    fontWeight: "600",
  },
});