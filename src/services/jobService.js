const API_BASE_URL = "/api/jobs";

export async function getAllJobs() {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
}

export async function getJobById(jobId) {
  const response = await fetch(`${API_BASE_URL}/${jobId}`);
  if (!response.ok) throw new Error("Failed to fetch job");
  return response.json();
}

export async function createJob(jobData) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create job");
  }

  return response.json();
}

export async function deleteJob(jobId) {
  const response = await fetch(`${API_BASE_URL}/${jobId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete job");
}

export async function updateJob(jobId, jobData) {
  const response = await fetch(`${API_BASE_URL}/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update job");
  }

  return response.json();
}

export async function getJobsByCreatedByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/creator/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch posted jobs");
  }

  return response.json();
}
