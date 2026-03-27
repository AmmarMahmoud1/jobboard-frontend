import { getAuthUser } from "../utils/auth";
import { useEffect, useState } from "react";
import {
  getApplicationsForCreator,
  updateApplicationStatus,
} from "../services/applicationService";
import { getJobById } from "../services/jobService";
import { getUserById } from "../services/getUserService";

function ReceivedApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const storedUser = getAuthUser();

    if (!storedUser) {
      setError("No logged in user found");
      setLoading(false);
      return;
    }

    const parsedUser = storedUser;

    getApplicationsForCreator(parsedUser.id)
      .then(async (data) => {
        if (!data || data.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Enrich each application with job title and applicant name
        const enriched = await Promise.all(
          data.map(async (app) => {
            const [job, applicant] = await Promise.allSettled([
              getJobById(app.jobId),
              getUserById(app.userId),
            ]);
            return {
              ...app,
              jobTitle: job.status === "fulfilled" ? job.value?.title : null,
              applicantName:
                applicant.status === "fulfilled"
                  ? `${applicant.value?.firstName ?? ""} ${applicant.value?.lastName ?? ""}`.trim()
                  : null,
              applicantEmail:
                applicant.status === "fulfilled" ? applicant.value?.email : null,
            };
          })
        );

        setApplications(enriched);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load received applications");
        setLoading(false);
      });
  }, []);

  async function handleStatusChange(applicationId, newStatus) {
    try {
      setUpdatingId(applicationId);
      const updated = await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: updated.status } : a
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update application status");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <p className="text-app-muted">Loading received applications...</p>
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
        <h1 className="text-2xl font-semibold text-app-text">Received Applications</h1>
        <p className="text-sm text-app-muted">
          Applications submitted to your job postings.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-app-muted">No applications received yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            Applications will appear here when candidates apply to your jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-app-border bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  {/* Job title */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-muted">
                      Job
                    </p>
                    <p className="mt-0.5 font-semibold text-app-text">
                      {application.jobTitle || `ID: ${application.jobId}`}
                    </p>
                  </div>

                  {/* Applicant */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-muted">
                      Applicant
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-app-text">
                      {application.applicantName || "Unknown"}
                    </p>
                    {application.applicantEmail && (
                      <p className="text-sm text-app-muted">{application.applicantEmail}</p>
                    )}
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-app-muted">
                        Cover Letter
                      </p>
                      <p className="mt-1 text-sm text-app-text leading-relaxed">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* CV download */}
                  {application.cvUrl && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-app-muted">
                        Resume / CV
                      </p>
                      <a
                        href={application.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4E7D] hover:underline"
                      >
                        View PDF →
                      </a>
                    </div>
                  )}

                  {/* Review Note */}
                  {application.reviewNote && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-app-muted">
                        Review Note
                      </p>
                      <p className="mt-1 text-sm text-app-text">{application.reviewNote}</p>
                    </div>
                  )}
                </div>

                {/* Status control */}
                <div className="w-full lg:w-48 shrink-0">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">
                    Status
                  </p>
                  <StatusBadge status={application.status} />

                  <label className="mt-3 block text-xs font-medium text-slate-500">
                    Update
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-[#0F4E7D]"
                    value={application.status || "APPLIED"}
                    disabled={updatingId === application.id}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
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

export default ReceivedApplicationsPage;
