import { useEffect, useState } from "react";
import { getUserById, updateUser } from "../services/getUserService";
import { getApplicationsByUserId, updateApplication } from "../services/applicationService";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingApp, setEditingApp] = useState(null);
  const [appEditData, setAppEditData] = useState({ coverLetter: "", cvUrl: "" });
  const [savingApp, setSavingApp] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) {
      setError("No logged in user found");
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    Promise.all([
      getUserById(parsedUser.id),
      getApplicationsByUserId(parsedUser.id),
    ])
      .then(([userData, applicationData]) => {
        setUser(userData);
        setApplications(applicationData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
        setLoading(false);
      });
  }, []);

  function startEditing() {
    setEditData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      street: user.street || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      country: user.country || "",
      university: user.university || "",
      degreeProgram: user.degreeProgram || "",
      semester: user.semester || "",
      cvUrl: user.cvUrl || "",
      profileImageUrl: user.profileImageUrl || "",
      aboutMe: user.aboutMe || "",
    });
    setSaveError("");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateUser(user.id, editData);
      setUser(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "semester" ? (value === "" ? "" : Number(value)) : value,
    }));
  }

  function startEditingApp(application) {
    setAppEditData({
      coverLetter: application.coverLetter || "",
      cvUrl: application.cvUrl || "",
    });
    setEditingApp(application);
  }

  async function handleSaveApp() {
    setSavingApp(true);
    try {
      const updated = await updateApplication(editingApp.id, appEditData);
      setApplications((prev) =>
        prev.map((a) => (a.id === editingApp.id ? { ...a, ...updated } : a))
      );
      setEditingApp(null);
    } catch (err) {
      alert(err.message || "Failed to update application");
    } finally {
      setSavingApp(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <p className="text-app-muted">Loading profile...</p>
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

  if (!user) {
    return (
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <p className="text-app-muted">No profile data found.</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F4E7D] focus:ring-2 focus:ring-blue-100";
  const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-app-muted";

  return (
    <div>
      <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar / Role card */}
        <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="h-20 w-20 rounded-3xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand text-2xl font-bold text-white">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
          )}

          <h1 className="mt-5 text-2xl font-bold text-app-text">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{user.email}</p>

          {user.aboutMe && (
            <p className="mt-3 text-sm text-app-text">{user.aboutMe}</p>
          )}

          <div className="mt-6 rounded-2xl bg-brand-soft p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-app-muted">Role</p>
            <p className="mt-1 font-semibold text-brand">{user.role || "USER"}</p>
          </div>

          {!editing && (
            <button
              onClick={startEditing}
              className="mt-4 w-full rounded-2xl border border-[#0F4E7D] px-4 py-2 text-sm font-semibold text-[#0F4E7D] transition hover:bg-[#0F4E7D] hover:text-white"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Personal Info */}
        <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-app-text">Personal Information</h2>
              <p className="text-sm text-app-muted">Your account details and contact information.</p>
            </div>
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#0F4E7D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A3A5D] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {saveError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {saveError}
            </div>
          )}

          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>First Name</label>
                <input name="firstName" value={editData.firstName} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input name="lastName" value={editData.lastName} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input name="phoneNumber" value={editData.phoneNumber} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input name="country" value={editData.country} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Street</label>
                <input name="street" value={editData.street} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input name="city" value={editData.city} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Postal Code</label>
                <input name="postalCode" value={editData.postalCode} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>University</label>
                <input name="university" value={editData.university} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Degree Program</label>
                <input name="degreeProgram" value={editData.degreeProgram} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Semester</label>
                <input type="number" min="1" name="semester" value={editData.semester} onChange={handleEditChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CV URL</label>
                <input name="cvUrl" value={editData.cvUrl} onChange={handleEditChange} placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Profile Image URL</label>
                <input name="profileImageUrl" value={editData.profileImageUrl} onChange={handleEditChange} placeholder="https://..." className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>About Me</label>
                <textarea
                  name="aboutMe"
                  value={editData.aboutMe}
                  onChange={handleEditChange}
                  rows={3}
                  className={inputCls}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="First Name" value={user.firstName} />
              <InfoCard label="Last Name" value={user.lastName} />
              <InfoCard label="Email" value={user.email} />
              <InfoCard label="Phone Number" value={user.phoneNumber} />
              <InfoCard label="University" value={user.university} />
              <InfoCard label="Degree Program" value={user.degreeProgram} />
              <InfoCard label="Semester" value={user.semester} />
              <InfoCard label="Country" value={user.country} />
              <div className="sm:col-span-2">
                <InfoCard
                  label="Address"
                  value={[user.street, user.postalCode, user.city].filter(Boolean).join(", ")}
                />
              </div>
              {user.cvUrl && (
                <div className="sm:col-span-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-app-muted">CV</p>
                    <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-medium text-[#0F4E7D] hover:underline">
                      {user.cvUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-3xl border border-app-border bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-app-text">My Applications</h2>
          <p className="text-sm text-app-muted">Jobs you have applied for.</p>
        </div>

        {applications.length === 0 ? (
          <p className="text-app-muted">You have not applied to any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-2xl border border-app-border bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-app-text">
                      Job ID: {application.jobId}
                    </p>
                    <p className="text-sm text-app-muted">
                      Applied:{" "}
                      {application.appliedAt
                        ? new Date(application.appliedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={application.status} />
                    {(application.status === "APPLIED" || application.status === "REVIEWING") && (
                      <button
                        onClick={() => startEditingApp(application)}
                        className="rounded-xl border border-[#0F4E7D] px-3 py-1 text-xs font-semibold text-[#0F4E7D] hover:bg-[#0F4E7D] hover:text-white transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-app-muted">Cover Letter</p>
                    <p className="mt-1 text-sm text-app-text">{application.coverLetter}</p>
                  </div>
                )}

                {application.reviewNote && (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-app-muted">Review Note</p>
                    <p className="mt-1 text-sm text-app-text">{application.reviewNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Edit Application Modal */}
    {editingApp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
        <div className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-800">Edit Application</h2>
            <button
              onClick={() => setEditingApp(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Cover Letter</label>
              <textarea
                rows={6}
                value={appEditData.coverLetter}
                onChange={(e) => setAppEditData((p) => ({ ...p, coverLetter: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0F4E7D] focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">CV URL</label>
              <input
                type="text"
                value={appEditData.cvUrl}
                onChange={(e) => setAppEditData((p) => ({ ...p, cvUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0F4E7D] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              onClick={() => setEditingApp(null)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveApp}
              disabled={savingApp}
              className="rounded-xl bg-[#0F4E7D] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A3A5D] disabled:opacity-50"
            >
              {savingApp ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-app-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-app-text">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusStyles = {
    APPLIED: "bg-blue-100 text-blue-700",
    REVIEWING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

export default ProfilePage;
