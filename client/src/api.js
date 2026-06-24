const API = "http://127.0.0.1:8000";

export async function getTransactions() {
  const res = await fetch(`${API}/transactions`);
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${API}/summary`);
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${API}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add transaction");
  return res.json();
}

export async function askAI(question) {
  const res = await fetch(`${API}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}