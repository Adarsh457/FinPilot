const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "finpilot_token";

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized() {
  localStorage.removeItem("finpilot_token");
  window.location.reload();
}

export async function getDashboardStats() {
  const res = await fetch(`${API}/dashboard-stats`, { headers: authHeaders() });
  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function scanReceipt(file) {
  const token = localStorage.getItem("finpilot_token");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/scan-receipt`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Couldn't scan the receipt");
  return data;
}

export async function getBudgets() {
  const res = await fetch(`${API}/budgets`, { headers: authHeaders() });
  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("Failed to load budgets");
  return res.json();
}

export async function setBudget(category, limit_amount) {
  const res = await fetch(`${API}/budgets`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ category, limit_amount }),
  });
  if (!res.ok) throw new Error("Failed to save budget");
  return res.json();
}

export async function deleteBudget(id) {
  const res = await fetch(`${API}/budgets/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete budget");
  return res.json();
}

export async function getInsight() {
  const res = await fetch(`${API}/insight`, { headers: authHeaders() });
  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) throw new Error("Failed to get insight");
  return res.json();
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

