import { getAuthUser } from "../utils/auth";
import { useEffect, useState } from "react";
import { getApplicationsForCreator, updateApplicationStatus } from "../services/applicationService";
import { getJobById } from "../services/jobService";
import { getUserById } from "../services/getUserService";
import Toast, { useToast } from "../components/common/Toast";

const PAGE_SIZE = 5;

export default function ReceivedApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [updatingId, setUpdatingId]     = useState("");
  const [page, setPage]                 = useState(1);
  const [expanded, setExpanded]         = useState({});
  const { toast, showToast }            = useToast();

  useEffect(() => {
    const user = getAuthUser();
    if (!user) { setError("Not logged in"); setLoading(false); return; }

    getApplicationsForCreator(user.id)
      .then(async (data) => {
        if (!data?.length) { setApplications([]); setLoading(false); return; }

        const enriched = await Promise.all(
          data.map(async (app) => {
            const [jobRes, applicantRes] = await Promise.allSettled([
              getJobById(app.jobId),
              getUserById(app.userId),
            ]);
            const job       = jobRes.status       === "fulfilled" ? jobRes.value       : null;
            const applicant = applicantRes.status === "fulfilled" ? applicantRes.value : null;
            return {
              ...app,
              jobTitle:           job?.title       ?? null,
              jobLocation:        job?.location    ?? null,
              jobType:            job?.jobType     ?? null,
              // Applicant full info
              applicantName:      applicant ? `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() : null,
              applicantEmail:     applicant?.email         ?? null,
              applicantPhone:     applicant?.phoneNumber   ?? null,
              applicantUniversity:applicant?.university    ?? null,
              applicantDegree:    applicant?.degreeProgram ?? null,
              applicantSemester:  applicant?.semester      ?? null,
              applicantCity:      applicant?.city          ?? null,
              applicantCountry:   applicant?.country       ?? null,
              applicantStreet:    applicant?.street        ?? null,
              applicantPostal:    applicant?.postalCode    ?? null,
              applicantAbout:     applicant?.aboutMe       ?? null,
            };
          })
        );

        setApplications(enriched);
        setLoading(false);
      })
      .catch((err) => { setError(err.message || "Failed to load"); setLoading(false); });
  }, []);

  async function handleStatusChange(applicationId, newStatus) {
    try {
      setUpdatingId(applicationId);
      const updated = await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((a) => a.id === applicationId ? { ...a, status: updated.status } : a)
      );
      showToast(`Status updated to ${newStatus.toLowerCase()}`, "success");
    } catch (err) { showToast(err.message || "Failed to update status", "error"); }
    finally { setUpdatingId(""); }
  }

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return <LoadingCard text="Loading received applications..." />;
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

  // unique jobs that have applications
  const uniqueJobs = new Set(applications.map((a) => a.jobId)).size;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Received Applications</h1>
        <p className="text-sm text-slate-400 mt-1">{stats.total} application{stats.total !== 1 ? "s" : ""} across {uniqueJobs} job{uniqueJobs !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} color="slate" />
          <StatCard label="Pending" value={stats.applied} color="blue" />
          <StatCard label="Reviewing" value={stats.reviewing} color="amber" />
          <StatCard label="Accepted" value={stats.accepted} color="green" />
          <StatCard label="Rejected" value={stats.rejected} color="red" />
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-2">📥</p>
          <p className="font-semibold text-slate-600">No applications yet</p>
          <p className="text-sm text-slate-400 mt-1">Applications will appear here when candidates apply to your jobs.</p>
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

                      {/* Job info */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Position</p>
                        <h2 className="font-bold text-slate-800">{app.jobTitle || `Job ${app.jobId}`}</h2>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {app.jobType && <Tag>{app.jobType.replace(/_/g, " ")}</Tag>}
                          {app.jobLocation && <Tag icon="📍">{app.jobLocation}</Tag>}
                        </div>
                      </div>

                      {/* Applicant summary */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Applicant</p>
                        <p className="font-semibold text-slate-800">{app.applicantName || "Unknown"}</p>
                        {app.applicantEmail && (
                          <a href={`mailto:${app.applicantEmail}`} className="text-sm text-[#0F4E7D] hover:underline">
                            {app.applicantEmail}
                          </a>
                        )}
                      </div>

                      <StatusBadge status={app.status} />
                    </div>

                    {/* Status updater */}
                    <div className="shrink-0 w-40 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Update Status</p>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0F4E7D]"
                        value={app.status || "APPLIED"}
                        disabled={updatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <button
                        onClick={() => toggleExpand(app.id)}
                        className="text-xs font-semibold text-[#0F4E7D] hover:underline w-full text-right"
                      >
                        {isOpen ? "Hide details ▲" : "Show details ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-5">

                      {/* Full applicant info */}
                      <Section label="Applicant Information">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                          <InfoRow label="Full Name"   value={app.applicantName} />
                          <InfoRow label="Email"       value={app.applicantEmail} />
                          <InfoRow label="Phone"       value={app.applicantPhone} />
                          <InfoRow label="University"  value={app.applicantUniversity} />
                          <InfoRow label="Degree"      value={app.applicantDegree} />
                          <InfoRow label="Semester"    value={app.applicantSemester} />
                          <InfoRow label="City"        value={app.applicantCity} />
                          <InfoRow label="Country"     value={app.applicantCountry} />
                          <InfoRow label="Street"      value={app.applicantStreet} />
                          <InfoRow label="Postal Code" value={app.applicantPostal} />
                        </div>
                        {app.applicantAbout && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-400">About</p>
                            <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{app.applicantAbout}</p>
                          </div>
                        )}
                      </Section>

                      {/* Cover letter */}
                      {app.coverLetter && (
                        <Section label="Cover Letter">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{app.coverLetter}</p>
                        </Section>
                      )}

                      {/* CV */}
                      {app.cvUrl && (
                        <Section label="Resume / CV">
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4E7D] hover:underline">
                            Download PDF →
                          </a>
                        </Section>
                      )}

                      {/* Review note */}
                      {app.reviewNote && (
                        <Section label="Review Note">
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
    slate: "bg-slate-50 text-slate-700 border-slate-200",
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

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
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
    <button onClick={onClick} disabled={disabled}
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
