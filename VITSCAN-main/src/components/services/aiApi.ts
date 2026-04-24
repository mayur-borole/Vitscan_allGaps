const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8001";

const AUTH_TOKEN_KEY = "vitscan_auth_token";
const AUTH_USER_KEY = "vitscan_auth_user";

type ApiErrorPayload = {
  detail?: string;
};

export type AITextResponse = {
  output: string;
};

export type AuthUser = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  email: string;
  phone: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  email: string;
  password: string;
  phone: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
  phone: string;
  newPassword: string;
};

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as LoginResponse;
  saveAuthSession(data.token, data.user);
  return data.user;
}

export async function loginWithCredentials(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as LoginResponse;
  saveAuthSession(data.token, data.user);
  return data.user;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      phone: payload.phone,
      new_password: payload.newPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { message?: string };
  return data.message ?? "Password reset successful.";
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const user = (await response.json()) as AuthUser;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
}

export async function logoutUser(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    });
  }
  clearAuthSession();
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorPayload;
    if (data?.detail) {
      return data.detail;
    }
  } catch {
    // Ignore JSON parse errors and use fallback text.
  }

  return `Request failed with status ${response.status}`;
}

export async function analyzeImages(
  files: File[],
  prompt?: string,
  scanAreas?: string[],
): Promise<AITextResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  if (scanAreas?.length) {
    scanAreas.forEach((area) => {
      formData.append("areas", area);
    });
  }

  if (prompt?.trim()) {
    formData.append("prompt", prompt.trim());
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AITextResponse;
}

export type Report = {
  id: string;
  date: string;
  user_id?: string;
  user_name?: string;
  files: string[];
  areas?: string[];
  prompt: string | null;
  output: string;
};

export async function getReports(): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Report[];
}

export async function deleteReport(reportId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function updateReportPrompt(
  reportId: string,
  prompt: string | null,
): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Report;
}

export async function chatWithAI(
  message: string,
  context?: string,
): Promise<AITextResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      message,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AITextResponse;
}
