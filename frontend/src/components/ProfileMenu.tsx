import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { deleteAccount } from '../api/auth'

type ProfileMenuProps = {
  logout: () => void
}

function ProfileMenu({ logout }: ProfileMenuProps) {
  const { user, token } = useAuth()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Вы точно хотите удалить аккаунт? Это действие нельзя отменить.'
    )

    if (!confirmed || !token) return

    setIsDeleting(true)

    try {
      await deleteAccount(token)
      logout()
    } catch (err: any) {
      alert(err.message || 'Ошибка при удалении аккаунта')
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-button"
        onClick={() => setOpen(!open)}
      >
        {user?.name || 'Профиль'} ▼
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-name">
            {user?.name || 'User'}
            {user?.email && (
              <div style={{ fontWeight: 400, fontSize: '13px', color: '#777', marginTop: '2px' }}>
                {user.email}
              </div>
            )}
          </div>

          <button onClick={handleLogout}>
            Выйти
          </button>

          <button
            className="delete-account"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаляем...' : 'Удалить аккаунт'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu