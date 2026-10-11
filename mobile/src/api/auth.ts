const API_URL = "http://10.120.159.241:8000"; 

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

export async function login(data: LoginData): Promise<TokenResponse> {
  const url = `${API_URL}/auth/login`;
  const body = `username=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`;

  console.log("LOGIN URL", url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });
  } catch (e: any) {
    console.log("LOGIN FETCH ERROR", e?.message);
    throw new Error("Нет связи с сервером: " + (e?.message || "network"));
  }

  const text = await res.text();
  console.log("LOGIN STATUS", res.status);
  console.log("LOGIN BODY", text);

  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Ответ не JSON (${res.status}): ${text.slice(0, 80)}`);
  }

  if (!res.ok) {
    const detail = json.detail;
    const message =
      typeof detail === "string"
        ? detail
        : "Ошибка входа: " + res.status;
    throw new Error(message);
  }

  if (!json.access_token) {
    throw new Error("Нет access_token в ответе: " + text.slice(0, 100));
  }

  return json;
}

export async function register(data: RegisterData): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Ошибка регистрации");
  }

  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Не удалось получить пользователя");
  }

  return res.json();
}