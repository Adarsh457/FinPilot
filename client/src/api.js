const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "finpilot_token";

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


export async function getMe() {
  const res = await fetch(`${API}/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}


export async function register(username, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Could not create account");
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Could not log in");
  return data;
}

export async function getTransactions() {
  const res = await fetch(`${API}/transactions`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${API}/transactions/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API}/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${API}/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${API}/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add transaction");
  return res.json();
}

export async function askAI(question) {
  const res = await fetch(`${API}/ask`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}