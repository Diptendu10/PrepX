const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import {
  getSessionToken,
  handleUnauthorizedSession,
} from "../session.js";

export async function getAdminQueries() {
  const token = getSessionToken(
    "prepx_admin_token",
    "Please log in as an admin to view queries."
  );

  const response = await fetch(`${API_URL}/queries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  handleUnauthorizedSession(response, "prepx_admin_token");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load user queries.");
  }

  return data.queries;
}

export async function sendQueryFeedback(queryId, message) {
  const token = getSessionToken(
    "prepx_admin_token",
    "Please log in as an admin to send feedback."
  );

  const response = await fetch(
    `${API_URL}/queries/${encodeURIComponent(queryId)}/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  handleUnauthorizedSession(response, "prepx_admin_token");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to send query feedback.");
  }

  return data;
}
