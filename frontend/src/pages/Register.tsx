import { useState } from "react";
import { register as registerApi, login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

type RegisterProps = {
  goLogin: () => void;
  goHome: () => void;
};

function Register({ goLogin, goHome }: RegisterProps) {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerApi({ name, email, password });

      const data = await loginApi({ email, password });
      await login(data.access_token);

      goHome();
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>
        <p className="subtitle">Создание аккаунта</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Имя</label>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Пароль (минимум 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Создаем аккаунт..." : "Сохранить"}
          </button>
        </form>

        <p className="signup-text">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={goLogin}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              padding: 0,
            }}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;