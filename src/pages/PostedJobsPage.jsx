import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByCreatedByUserId, deleteJob } from "../services/jobService";
import { getApplicationsForCreator, updateApplicationStatus } from "../services/applicationService";
import { getUserById } from "../services/getUserService";

function PostedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingJobId, setDeletingJobId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) {
      setError("No logged in user found");
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    Promise.all([
      getJobsByCreatedByUserId(parsedUser.id),
      getApplicationsForCreator(parsedUser.id),
    ])
      .then(async ([jobsData, appsData]) => {
        setJobs(jobsData || []);

        if (!appsData || appsData.length === 0) {
          setLoading(false);
          return;
        }

        // Enrich applications with applicant info
        const enriched = await Promise.all(
          appsData.map(async (app) => {
            try {
              const applicant = await getUserById(app.userId);
              return {
                ...app,
                applicantName: `${applicant?.firstName ?? ""} ${applicant?.lastName ?? ""}`.trim() || "Unknown",
                applicantEmail: applicant?.email || null,
              };
            } catch {
              return { ...app, applicantName: "Unknown", applicantEmail: null };
            }
          })
        );

        // Group by jobId
        const grouped = {};
        enriched.forEach((app) => {
          if (!grouped[app.jobId]) grouped[app.jobId] = [];
          grouped[app.jobId].push(app);
        });
        setApplicationsByJob(grouped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }, []);

  async function handleDeleteJob(jobId) {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      setDeletingJobId(jobId);
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setApplicationsByJob((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (err) {
      alert(err.message || "Failed to delete job");
    } finally {
      setDeletingJobId("");
    }
  }

  async function handleStatusChange(applicationId, jobId, newStatus) {
    try {
      setUpdatingId(applicationId);
      const updated = await updateApplicationStatus(applicationId, newStatus);
      setApplicationsByJob((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((a) =>
          a.id === applicationId ? { ...a, status: updated.status } : a
        ),
      }));
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <p className="text-app-muted">Loading posted jobs...</p>
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-app-text">My Posted Jobs</h1>
          <p className="text-sm text-app-muted">Jobs you created on the platform.</p>
        </div>
        <button
          onClick={() => navigate("/post-job")}
          className="rounded-2xl bg-[#0F4E7D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A3A5D] transition"
        >
          + Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-app-muted">You have not posted any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobApps = applicationsByJob[job.id] || [];
            const isExpanded = expandedJobId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-app-border bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-app-text">{job.title}</h2>
                    <p className="text-sm text-app-muted">{job.companyName}</p>
                    <p className="mt-1 text-sm text-app-muted">
                      {job.location || "-"} {job.remote ? "• Remote" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        job.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {job.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <button
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                      className="rounded-xl border border-[#0F4E7D] px-3 py-1 text-xs font-semibold text-[#0F4E7D] hover:bg-[#0F4E7D] hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingJobId === job.id}
                      className="rounded-xl border border-red-300 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingJobId === job.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <InfoCard label="Category" value={job.category} />
                  <InfoCard label="Job Type" value={job.jobType} />
                  <InfoCard
                    label="Salary"
                    value={job.salary ? `€${job.salary} ${job.salaryType || ""}` : "-"}
                  />
                </div>

                {job.description && (
                  <p className="mt-4 text-sm text-app-text line-clamp-2">{job.description}</p>
                )}

                {job.tags && job.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#0F4E7D]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Applications toggle */}
                <div className="mt-4 border-t border-app-border pt-3">
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#0F4E7D] hover:underline"
                  >
                    <span>
                      {jobApps.length === 0
                        ? "No applications received"
                        : `Applications received (${jobApps.length})`}
                    </span>
                    {jobApps.length > 0 && (
                      <span className="text-xs">{isExpanded ? "▲" : "▼"}</span>
                    )}
                  </button>

                  {isExpanded && jobApps.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {jobApps.map((app) => (
                        <div
                          key={app.id}
                          className="rounded-xl border border-app-border bg-white p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-semibold text-app-text">
                                {app.applicantName}
                              </p>
                              {app.applicantEmail && (
                                <p className="text-xs text-app-muted">{app.applicantEmail}</p>
                              )}
                              <p className="text-xs text-slate-400">
                                Applied:{" "}
                                {app.appliedAt
                                  ? new Date(app.appliedAt).toLocaleString()
                                  : "—"}
                              </p>
                              {app.coverLetter && (
                                <p className="mt-2 text-sm text-app-text line-clamp-3 leading-relaxed">
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

                            <div className="w-full sm:w-40 shrink-0 space-y-2">
                              <StatusBadge status={app.status} />
                              <select
                                className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-[#0F4E7D]"
                                value={app.status || "APPLIED"}
                                disabled={updatingId === app.id}
                                onChange={(e) =>
                                  handleStatusChange(app.id, job.id, e.target.value)
                                }
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-app-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-app-text">{value || "-"}</p>
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

export default PostedJobsPage;
