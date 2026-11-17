const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import {
  getSessionToken,
  handleUnauthorizedSession,
} from "../session.js";

export async function bookPrivateInterview(booking) {
  const token = getSessionToken(
    "prepx_token",
    "Please log in to book an interview."
  );

  const response = await fetch(`${API_URL}/interviews/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(booking),
  });

  handleUnauthorizedSession(response, "prepx_token");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to book your interview.");
  }

  return data;
}

async function getInterviewSchedules(endpoint, tokenKey, message) {
  const token = getSessionToken(tokenKey, message);

  const response = await fetch(`${API_URL}/interviews${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  handleUnauthorizedSession(response, tokenKey);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load interview schedule.");
  }

  if (!Array.isArray(data.schedules)) {
    throw new Error("The schedule response was invalid. Please try again.");
  }

  return data.schedules;
}

export function getUserInterviewSchedules() {
  return getInterviewSchedules(
    "/mine",
    "prepx_token",
    "Please log in to view your interview schedule."
  );
}

export function getAdminInterviewSchedules() {
  return getInterviewSchedules(
    "",
    "prepx_admin_token",
    "Please log in as an admin to view the schedule."
  );
}

async function requestInterviewResponses(interviewId, options = {}) {
  const token = getSessionToken(
    "prepx_token",
    "Please log in to access your interview responses."
  );
  const response = await fetch(
    `${API_URL}/interviews/${encodeURIComponent(interviewId)}/responses`,
    {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }
  );

  handleUnauthorizedSession(response, "prepx_token");
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error(
        "The interview response API was not found. Restart the backend and try again."
      );
    }

    throw new Error(
      "The interview response API returned an unexpected response. Check that the backend is running and the API URL is configured correctly."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The interview response API returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Unable to access your interview responses.");
  }

  return data;
}

export async function getInterviewResponses(interviewId) {
  const data = await requestInterviewResponses(interviewId);

  if (!Array.isArray(data.responses)) {
    throw new Error("The interview responses were invalid. Please try again.");
  }

  return data.responses;
}

export async function saveInterviewResponse(interviewId, response) {
  const data = await requestInterviewResponses(interviewId, {
    method: "POST",
    body: JSON.stringify({ response }),
  });

  if (typeof data.response !== "string") {
    throw new Error("The saved response was invalid. Please try again.");
  }

  return data.response;
}

export async function uploadInterviewCv(interviewId, file) {
  const token = getSessionToken(
    "prepx_token",
    "Please log in to submit your CV."
  );
  const formData = new FormData();
  formData.append("file", file);
  formData.append("interviewId", interviewId);

  const response = await fetch(`${API_URL}/upload/cv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  handleUnauthorizedSession(response, "prepx_token");
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The CV upload service returned an unexpected response. Check that the backend is running."
    );
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to submit your CV.");
  }

  return data;
}
