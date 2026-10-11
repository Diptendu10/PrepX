const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function bookPrivateInterview(booking) {
  const token = sessionStorage.getItem("prepx_token");

  if (!token) {
    throw new Error("Please log in to book an interview.");
  }

  const response = await fetch(`${API_URL}/interviews/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(booking),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to book your interview.");
  }

  return data;
}

async function getInterviewSchedules(endpoint, tokenKey, message) {
  const token = sessionStorage.getItem(tokenKey);

  if (!token) {
    throw new Error(message);
  }

  const response = await fetch(`${API_URL}/interviews${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
