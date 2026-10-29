const API_URL = "http://localhost:8000";

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => (typeof e?.msg === "string" ? e.msg : ""))
      .filter(Boolean)
      .join(". ");
  }
  return "";
}

async function request(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error("Не удалось связаться с сервером. Попробуйте позже");
  }
}

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(formatDetail(error?.detail) || fallback);
}

export async function login(data: LoginData): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append("username", data.email);
  formData.append("password", data.password);

  const res = await request(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!res.ok) await throwApiError(res, "Неверный email или пароль");
  return res.json();
}

export async function register(data: RegisterData): Promise<User> {
  const res = await request(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) await throwApiError(res, "Ошибка регистрации");
  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Не удалось получить пользователя");
  }

  return res.json();
}

export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Не удалось удалить аккаунт");
  }
}