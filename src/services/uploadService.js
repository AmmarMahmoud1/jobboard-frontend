export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/resume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to upload file");
  }

  return response.json(); // { url: "/api/upload/files/..." }
}
