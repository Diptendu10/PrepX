const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import {
  getSessionToken,
  handleUnauthorizedSession,
} from "../session.js";

export async function submitQueryRequest(query) {
  const token = getSessionToken(
    "prepx_token",
    "Please log in again to submit a query."
  );

  const response = await fetch(`${API_URL}/queries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });

  handleUnauthorizedSession(response, "prepx_token");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to submit your query.");
  }

  return data;
}

export async function getUserQuerySolutions() {
  const token = getSessionToken(
    "prepx_token",
    "Please log in again to view your solutions."
  );

  const response = await fetch(`${API_URL}/queries/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  handleUnauthorizedSession(response, "prepx_token");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your solutions.");
  }

  return data.queries;
}
