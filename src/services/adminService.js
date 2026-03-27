export async function getAdminStats(requesterId) {
  const response = await fetch(`/api/admin/stats?requesterId=${requesterId}`);
  if (!response.ok) {
    throw new Error("Access denied or failed to load stats");
  }
  return response.json();
}
