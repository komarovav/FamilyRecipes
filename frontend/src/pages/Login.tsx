import { useState } from "react";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

type LoginProps = {
  goHome: () => void;
  goRegister: () => void;
};

function Login({ goHome, goRegister }: LoginProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginApi({ email, password });
      await login(data.access_token);
      goHome();
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>С возвращением!</h1>
        <p className="subtitle">Войдите в свой аккаунт</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

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
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="signup-text">
          Нет аккаунта?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={goRegister}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              padding: 0,
            }}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;