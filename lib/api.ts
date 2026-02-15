const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "API Error");
  }

  return res.json();
}