const AUTH_BASE_URL = import.meta.env.VITE_NETFLIX_AUTH_BASE_URL || "http://localhost:8082";

async function request(path, options = {}) {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.message || `Auth request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function registerUser({ fullName, email, password }) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
  return data.user;
}

export async function loginUser({ email, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function fetchMe() {
  const data = await request("/api/auth/me", {
    method: "GET",
  });
  return data.user;
}

export async function logoutUser() {
  await request("/api/auth/logout", {
    method: "POST",
  });
}
