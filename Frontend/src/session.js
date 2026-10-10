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
