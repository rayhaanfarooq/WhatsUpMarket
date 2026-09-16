const API = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      // keep status text
    }
    throw new Error(detail);
  }
  return response.json();
}

export function getStats() {
  return request("/stats");
}

export function getFeed({ decision, sector, ticker, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (decision) params.set("decision", decision);
  if (sector) params.set("sector", sector);
  if (ticker) params.set("ticker", ticker);
  params.set("limit", String(limit));
  return request(`/feed?${params.toString()}`);
}

export function getRuns(limit = 12) {
  return request(`/runs?limit=${limit}`);
}

export function previewPipeline({ ticker, topic, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (ticker) params.set("ticker", ticker);
  if (topic) params.set("topic", topic);
  params.set("limit", String(limit));
  return request(`/preview?${params.toString()}`, { method: "POST" });
}

export function runPipeline({ ticker, topic, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (ticker) params.set("ticker", ticker);
  if (topic) params.set("topic", topic);
  params.set("limit", String(limit));
  return request(`/run?${params.toString()}`, { method: "POST" });
}
