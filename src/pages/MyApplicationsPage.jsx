import { useEffect, useState } from "react";
import { getApplicationsByUserId, deleteApplication } from "../services/applicationService";
import { getJobById } from "../services/jobService";

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      setError("No logged in user found");
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    getApplicationsByUserId(parsedUser.id)
      .then(async (data) => {
        if (!data || data.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        const enriched = await Promise.all(
          data.map(async (app) => {
            try {
              const job = await getJobById(app.jobId);
              return {
                ...app,
                jobTitle: job?.title || null,
                companyName: job?.companyName || null,
                jobLocation: job?.location || null,
                jobType: job?.jobType || null,
              };
            } catch {
              return { ...app, jobTitle: null, companyName: null };
            }
          })
        );

        setApplications(enriched);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load applications");
        setLoading(false);
      });
  }, []);

  async function handleRevoke(applicationId) {
    if (!confirm("Revoke this application? This cannot be undone.")) return;
    try {
      setRevokingId(applicationId);
      await deleteApplication(applicationId);
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      alert(err.message || "Failed to revoke application");
    } finally {
      setRevokingId("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <p className="text-app-muted">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-app-text">My Applications</h1>
        <p className="text-sm text-app-muted">Jobs you have applied to.</p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-app-muted">You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-app-border bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-1">
                  <h2 className="text-base font-semibold text-app-text">
                    {app.jobTitle || `Job ID: ${app.jobId}`}
                  </h2>
                  {app.companyName && (
                    <p className="text-sm text-app-muted">{app.companyName}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.jobType && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {app.jobType.replace("_", " ")}
                      </span>
                    )}
                    {app.jobLocation && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                        {app.jobLocation}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Applied:{" "}
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString()
                      : "—"}
                  </p>
                  {app.coverLetter && (
                    <p className="mt-2 text-sm text-app-text line-clamp-2 leading-relaxed">
                      {app.coverLetter}
                    </p>
                  )}
                  {app.cvUrl && (
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0F4E7D] hover:underline"
                    >
                      View CV →
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                  <StatusBadge status={app.status} />
                  <button
                    onClick={() => handleRevoke(app.id)}
                    disabled={revokingId === app.id}
                    className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {revokingId === app.id ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    APPLIED: "bg-blue-100 text-blue-700",
    REVIEWING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

export default MyApplicationsPage;
