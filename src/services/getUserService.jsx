export async function getUserById(userId) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch user");
  }

  return await response.json();
}

export async function updateUser(userId, userData) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update user");
  }

  return await response.json();
}
