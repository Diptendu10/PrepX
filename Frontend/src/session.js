export function getTokenExpiration(token) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch (error) {
    console.error("Unable to read the session token expiration:", error);
    return null;
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const expiration = getTokenExpiration(token);
  return expiration !== null && expiration <= now;
}

export function expireSession(tokenKey) {
  if (tokenKey === "prepx_admin_token") {
    sessionStorage.removeItem("prepx_admin_token");
    sessionStorage.removeItem("prepx_admin");
  } else {
    sessionStorage.removeItem("prepx_token");
    sessionStorage.removeItem("prepx_user");
  }

  window.location.replace("/");
}

export function getSessionToken(tokenKey, missingMessage) {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) throw new Error(missingMessage);

  if (isTokenExpired(token)) {
    expireSession(tokenKey);
    throw new Error("Your session has expired. Please log in again.");
  }

  return token;
}

export function handleUnauthorizedSession(response, tokenKey) {
  if (response.status === 401) {
    expireSession(tokenKey);
  }
}

export function getSessionUser() {
  const storedUser = sessionStorage.getItem("prepx_user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read the signed-in user from session storage:", error);
    return null;
  }
}
