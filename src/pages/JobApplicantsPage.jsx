import { useEffect, useState } from "react";
import {
  getApplicationsByJobId,
  updateApplicationStatus,
} from "../services/applicationService";

function JobApplicantsPage({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await getApplicationsByJobId(jobId);
      setApplications(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    try {
      await updateApplicationStatus(applicationId, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  }

  if (loading) return <p>Loading applicants...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
      <h2 className="mb-6 text-2xl font-semibold text-app-text">Applicants</h2>

      {applications.length === 0 ? (
        <p className="text-app-muted">No one has applied yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-app-border bg-slate-50 p-4"
            >
              <p className="font-semibold text-app-text">
                Applicant User ID: {application.userId}
              </p>

              <p className="mt-1 text-sm text-app-muted">
                Applied at:{" "}
                {application.appliedAt
                  ? new Date(application.appliedAt).toLocaleString()
                  : "-"}
              </p>

              {application.coverLetter && (
                <p className="mt-3 text-sm text-app-text">
                  {application.coverLetter}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(application.id, "REVIEWING")
                  }
                  className="rounded-xl bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700"
                >
                  Reviewing
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(application.id, "ACCEPTED")
                  }
                  className="rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-700"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(application.id, "REJECTED")
                  }
                  className="rounded-xl bg-red-100 px-3 py-2 text-sm font-medium text-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobApplicantsPage;