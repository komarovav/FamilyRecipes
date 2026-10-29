import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteAccount } from "../api/auth";

type ProfileMenuProps = {
  logout: () => void;
};

function ProfileMenu({ logout }: ProfileMenuProps) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

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
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-button"
        type="button"
        onClick={() => setOpen(!open)}
      >
        {user?.name || "Профиль"} ▼
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-name">
            {user?.name || "User"}
            {user?.email && (
              <div
                style={{
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#777",
                  marginTop: "2px",
                }}
              >
                {user.email}
              </div>
            )}
          </div>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
          <button
            type="button"
            className="delete-account"
            onClick={openDeleteModal}
            disabled={isDeleting}
          >
            Удалить аккаунт
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-card__title">Удалить аккаунт?</h2>
            <p className="modal-card__text">
              Аккаунт «{user?.name || "пользователь"}» и все связанные
              рецепты будут удалены без возможности восстановления.
            </p>
            {error && (
              <p className="modal-card__text" style={{ color: "#c62828" }}>
                {error}
              </p>
            )}
            <div className="modal-card__actions">
              <button
                type="button"
                className="modal-btn modal-btn--ghost"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--danger"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;