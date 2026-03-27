import { getAuthUser } from "../utils/auth";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getApplicationsByUserId, deleteApplication } from "../services/applicationService";
import { getJobById } from "../services/jobService";
import Toast, { useToast } from "../components/common/Toast";

const PAGE_SIZE = 5;

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [revokingId, setRevokingId]     = useState("");
  const [page, setPage]                 = useState(1);
  const [expanded, setExpanded]         = useState({});
  const { toast, showToast }            = useToast();
  const location                        = useLocation();

  // Show toast passed via navigation state (e.g. after applying)
  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast, location.state.toastType || "success");
      window.history.replaceState({}, "");
    }
  }, []);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) { setError("Not logged in"); setLoading(false); return; }

    getApplicationsByUserId(user.id)
      .then(async (data) => {
        if (!data?.length) { setApplications([]); setLoading(false); return; }
        const enriched = await Promise.all(
          data.map(async (app) => {
            try {
              const job = await getJobById(app.jobId);
              return {
                ...app,
                jobTitle:      job?.title       ?? null,
                companyName:   job?.companyName ?? null,
                jobLocation:   job?.location    ?? null,
                jobType:       job?.jobType     ?? null,
                salary:        job?.salary      ?? null,
                salaryType:    job?.salaryType  ?? null,
                remote:        job?.remote      ?? null,
                jobDescription: job?.description ?? null,
              };
            } catch { return app; }
          })
        );
        setApplications(enriched);
        setLoading(false);
      })
      .catch((err) => { setError(err.message || "Failed to load"); setLoading(false); });
  }, []);

  async function handleRevoke(id) {
    if (!confirm("Revoke this application? This cannot be undone.")) return;
    try {
      setRevokingId(id);
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast("Application revoked successfully", "info");
    } catch (err) { showToast(err.message || "Failed to revoke", "error"); }
    finally { setRevokingId(""); }
  }

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return <LoadingCard text="Loading your applications..." />;
  if (error)   return <ErrorCard text={error} />;

  const totalPages = Math.ceil(applications.length / PAGE_SIZE);
  const paginated  = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:     applications.length,
    applied:   applications.filter((a) => a.status === "APPLIED").length,
    reviewing: applications.filter((a) => a.status === "REVIEWING").length,
    accepted:  applications.filter((a) => a.status === "ACCEPTED").length,
    rejected:  applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">My Applications</h1>
        <p className="text-sm text-slate-400 mt-1">{stats.total} application{stats.total !== 1 ? "s" : ""} total</p>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Applied" value={stats.applied} color="blue" />
          <StatCard label="Reviewing" value={stats.reviewing} color="amber" />
          <StatCard label="Accepted" value={stats.accepted} color="green" />
          <StatCard label="Rejected" value={stats.rejected} color="red" />
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold text-slate-600">No applications yet</p>
          <p className="text-sm text-slate-400 mt-1">Browse jobs and apply to get started.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((app) => {
              const isOpen = expanded[app.id];
              return (
                <div key={app.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                  {/* Top bar */}
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <h2 className="text-base font-bold text-slate-800 truncate">
                        {app.jobTitle || "Unknown Job"}
                      </h2>
                      {app.companyName && (
                        <p className="text-sm text-slate-500 font-medium">{app.companyName}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={app.status} />
                        {app.jobType && (
                          <Tag>{app.jobType.replace(/_/g, " ")}</Tag>
                        )}
                        {app.jobLocation && (
                          <Tag icon="📍">{app.jobLocation}</Tag>
                        )}
                        {app.remote && (
                          <Tag icon="🌐">Remote</Tag>
                        )}
                        {app.salary && (
                          <Tag icon="💶">€{app.salary} {app.salaryType}</Tag>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => handleRevoke(app.id)}
                        disabled={revokingId === app.id || app.status === "ACCEPTED" || app.status === "REJECTED"}
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {revokingId === app.id ? "Revoking..." : "Revoke"}
                      </button>
                      <button
                        onClick={() => toggleExpand(app.id)}
                        className="text-xs font-semibold text-[#0F4E7D] hover:underline"
                      >
                        {isOpen ? "Hide details ▲" : "Show details ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                      {app.jobDescription && (
                        <Section label="Job Description">
                          <p className="text-sm text-slate-600 leading-relaxed">{app.jobDescription}</p>
                        </Section>
                      )}
                      {app.coverLetter && (
                        <Section label="Your Cover Letter">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{app.coverLetter}</p>
                        </Section>
                      )}
                      {app.cvUrl && (
                        <Section label="Your CV">
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4E7D] hover:underline">
                            View PDF →
                          </a>
                        </Section>
                      )}
                      {app.reviewNote && (
                        <Section label="Review Note from Company">
                          <p className="text-sm text-slate-700 leading-relaxed">{app.reviewNote}</p>
                        </Section>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue:  "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-green-50 text-green-700 border-green-100",
    red:   "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <div className={`rounded-2xl border p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

function Tag({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {icon && <span>{icon}</span>}{children}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    APPLIED:   "bg-blue-100 text-blue-700",
    REVIEWING: "bg-amber-100 text-amber-700",
    ACCEPTED:  "bg-green-100 text-green-700",
    REJECTED:  "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <PagBtn onClick={() => onChange(page - 1)} disabled={page === 1}>← Prev</PagBtn>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PagBtn key={p} onClick={() => onChange(p)} active={p === page}>{p}</PagBtn>
      ))}
      <PagBtn onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next →</PagBtn>
    </div>
  );
}

function PagBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition
        ${active ? "bg-[#0F4E7D] text-white" : "border border-slate-200 text-slate-600 hover:border-[#0F4E7D] hover:text-[#0F4E7D]"}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function LoadingCard({ text }) {
  return (
    <div className="flex items-center justify-center h-48">
      <p className="text-slate-400 animate-pulse">{text}</p>
    </div>
  );
}

function ErrorCard({ text }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 text-sm">{text}</div>
  );
}
