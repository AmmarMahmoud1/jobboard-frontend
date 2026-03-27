import { getAuthUser } from "../utils/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../services/adminService";

function StatCard({ label, value, color = "blue", icon }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${colors[color]}`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

function BarChart({ data, title }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-32 text-xs font-semibold text-slate-600 truncate">{key.replace("_", " ")}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3">
              <div
                className="bg-[#0F4E7D] h-3 rounded-full transition-all"
                style={{ width: `${(val / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 w-6 text-right">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser || authUser.role !== "ADMIN") {
      navigate("/");
      return;
    }
    getAdminStats(authUser.id)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const appStatusData = {
    Applied: stats.appliedApplications,
    Reviewing: stats.reviewingApplications,
    Accepted: stats.acceptedApplications,
    Rejected: stats.rejectedApplications,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Platform overview and statistics</p>
      </div>

      {/* Users */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} color="blue" icon="👥" />
          <StatCard label="Active Users" value={stats.activeUsers} color="green" icon="✅" />
          <StatCard label="Students" value={stats.studentCount} color="purple" icon="🎓" />
          <StatCard label="Employers" value={stats.employerCount} color="amber" icon="🏢" />
        </div>
      </section>

      {/* Jobs */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Jobs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <StatCard label="Total Jobs" value={stats.totalJobs} color="blue" icon="💼" />
          <StatCard label="Active Jobs" value={stats.activeJobs} color="green" icon="🟢" />
          <StatCard label="Inactive Jobs" value={stats.totalJobs - stats.activeJobs} color="slate" icon="⏸️" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChart data={stats.jobsByCategory} title="Jobs by Category" />
          <BarChart data={stats.jobsByType} title="Jobs by Type" />
        </div>
      </section>

      {/* Applications */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Applications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Applications" value={stats.totalApplications} color="blue" icon="📋" />
          <StatCard label="Applied" value={stats.appliedApplications} color="amber" icon="📨" />
          <StatCard label="Accepted" value={stats.acceptedApplications} color="green" icon="🎉" />
          <StatCard label="Rejected" value={stats.rejectedApplications} color="red" icon="❌" />
        </div>
        <BarChart data={appStatusData} title="Applications by Status" />
      </section>

    </div>
  );
}
