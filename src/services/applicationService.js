const API_BASE_URL = "/api/applications";

export async function applyToJob(applicationData) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    throw new Error("Failed to apply to job");
  }

  return response.json();
}

export async function getApplicationsByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export async function getApplicationsForCreator(userId) {
  const response = await fetch(`${API_BASE_URL}/creator/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch received applications");
  }

  return response.json();
}

export async function updateApplication(applicationId, data) {
  const response = await fetch(`${API_BASE_URL}/${applicationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update application");
  }

  return response.json();
}

export async function deleteApplication(applicationId) {
  const response = await fetch(`${API_BASE_URL}/${applicationId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to revoke application");
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await fetch(`${API_BASE_URL}/${applicationId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update application status");
  }

  return response.json();
}
