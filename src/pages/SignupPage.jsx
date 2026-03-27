import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { signupUser } from "../services/authService";

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null = not chosen yet
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    university: "",
    degreeProgram: "",
    semester: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "semester" ? (value === "" ? "" : Number(value)) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signupUser({ ...formData, role });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  // Step 1 — choose role
  if (!role) {
    return (
      <AuthLayout title="Join CareerHUB" subtitle="How do you want to use the platform?">
        <div className="space-y-4">
          <button
            onClick={() => setRole("STUDENT")}
            className="w-full rounded-2xl border-2 border-slate-200 p-5 text-left hover:border-[#0F4E7D] hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl group-hover:bg-[#0F4E7D] group-hover:text-white transition-colors">
                🎓
              </div>
              <div>
                <p className="font-bold text-slate-800">I am looking for a job</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Browse job listings, apply to positions and track your applications.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setRole("COMPANY")}
            className="w-full rounded-2xl border-2 border-slate-200 p-5 text-left hover:border-[#0F4E7D] hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl group-hover:bg-[#0F4E7D] group-hover:text-white transition-colors">
                🏢
              </div>
              <div>
                <p className="font-bold text-slate-800">I want to advertise jobs</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Post job listings, review applications and find the right candidates.
                </p>
              </div>
            </div>
          </button>

          <p className="text-center text-sm text-slate-500 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#0F4E7D] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Step 2 — fill in details
  return (
    <AuthLayout
      title={role === "STUDENT" ? "Create student account" : "Create company account"}
      subtitle={
        role === "STUDENT"
          ? "Sign up to browse and apply for jobs."
          : "Sign up to post jobs and manage applications."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Role badge + back */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0F4E7D]">
            {role === "STUDENT" ? "🎓 Student" : "🏢 Company"}
          </span>
          <button
            type="button"
            onClick={() => setRole(null)}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Change
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
          />
        </div>

        {role === "STUDENT" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">University</label>
                <input
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Degree program</label>
                <input
                  name="degreeProgram"
                  value={formData.degreeProgram}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Semester</label>
              <input
                type="number"
                min="1"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0F4E7D]"
              />
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0F4E7D] px-4 py-3 font-semibold text-white hover:bg-[#0A3A5D] disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#0F4E7D] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
