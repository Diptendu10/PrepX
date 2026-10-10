
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function sendAuthRequest(endpoint, formData) {
  const response = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function signupUser(formData) {
  return sendAuthRequest("signup", formData);
}

export function loginUser(formData) {
  return sendAuthRequest("login", formData);
}

export function loginWithGoogle(credential) {
  return sendAuthRequest("google", { credential });
}
