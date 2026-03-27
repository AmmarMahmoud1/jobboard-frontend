import { getAuthUser, clearAuthUser } from "../../utils/auth";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const CATEGORIES = [
  "IT",
  "MARKETING",
  "SALES",
  "DESIGN",
  "FINANCE",
  "CUSTOMER_SERVICE",
  "LOGISTICS",
  "ADMINISTRATION",
  "OTHER",
];

function NavBar() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const catTimer = useRef(null);
  const userTimer = useRef(null);

  function handleLogout() {
    clearAuthUser();
    navigate("/login");
  }

  // Delayed close so mouse can travel into dropdown without it vanishing
  function openCat() {
    clearTimeout(catTimer.current);
    setCatOpen(true);
  }
  function closeCat() {
    catTimer.current = setTimeout(() => setCatOpen(false), 80);
  }
  function openUser() {
    clearTimeout(userTimer.current);
    setUserOpen(true);
  }
  function closeUser() {
    userTimer.current = setTimeout(() => setUserOpen(false), 80);
  }

  const userName = authUser
    ? `${authUser.firstName ?? ""} ${authUser.lastName ?? ""}`.trim() || authUser.email
    : null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LEFT: Logo + Home + Categories */}
        <div className="flex items-center gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-[#0F4E7D] text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-800">
              CAREER<span className="text-[#0F4E7D]">HUB</span>
            </span>
          </Link>

          {/* Home */}
          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 hover:text-[#0F4E7D] transition-colors"
          >
            Home
          </Link>

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={openCat}
            onMouseLeave={closeCat}
          >
            <button className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#0F4E7D] transition-colors py-1">
              Categories
              <svg
                className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && (
              <div
                className="absolute left-0 top-full w-52 z-50"
                onMouseEnter={openCat}
                onMouseLeave={closeCat}
              >
                {/* transparent bridge to prevent gap */}
                <div className="h-2" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg py-2">
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-[#0F4E7D] font-medium"
                    onClick={() => setCatOpen(false)}
                  >
                    All Categories
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/?category=${cat}`}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                      onClick={() => setCatOpen(false)}
                    >
                      {cat.replace("_", " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {authUser ? (
            <>
              {/* Post a Job — COMPANY and ADMIN only */}
              {(authUser.role === "COMPANY" || authUser.role === "ADMIN") && (
                <Link
                  to="/post-job"
                  className="bg-[#0F4E7D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0A3A5D] transition-all"
                >
                  Post a Job
                </Link>
              )}

              {/* User dropdown */}
              <div
                className="relative"
                onMouseEnter={openUser}
                onMouseLeave={closeUser}
              >
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#0F4E7D] hover:text-[#0F4E7D] transition-all">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F4E7D] text-xs font-bold text-white">
                    {(authUser.firstName?.[0] ?? authUser.email?.[0] ?? "U").toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${userOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userOpen && (
                  <div
                    className="absolute right-0 top-full w-56 z-50"
                    onMouseEnter={openUser}
                    onMouseLeave={closeUser}
                  >
                    <div className="h-2" />
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg py-2">

                      {/* Account — all roles */}
                      <p className="px-4 pt-1 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Account
                      </p>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                        onClick={() => setUserOpen(false)}
                      >
                        <span>👤</span> My Profile
                      </Link>

                      {/* Student only */}
                      {authUser.role === "STUDENT" && (
                        <Link
                          to="/my-applications"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                          onClick={() => setUserOpen(false)}
                        >
                          <span>📋</span> My Applications
                        </Link>
                      )}

                      {/* Company / Admin */}
                      {(authUser.role === "COMPANY" || authUser.role === "ADMIN") && (
                        <>
                          <div className="my-1 border-t border-slate-100" />
                          <p className="px-4 pt-2 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Jobs
                          </p>
                          <Link
                            to="/my-jobs"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                            onClick={() => setUserOpen(false)}
                          >
                            <span>💼</span> My Posted Jobs
                          </Link>
                          <Link
                            to="/received-applications"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                            onClick={() => setUserOpen(false)}
                          >
                            <span>📥</span> Received Applications
                          </Link>
                        </>
                      )}

                      {/* Admin only */}
                      {authUser.role === "ADMIN" && (
                        <>
                          <div className="my-1 border-t border-slate-100" />
                          <p className="px-4 pt-2 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Admin
                          </p>
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F4E7D]"
                            onClick={() => setUserOpen(false)}
                          >
                            <span>📊</span> Admin Dashboard
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => { setUserOpen(false); handleLogout(); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-[#0F4E7D] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border-2 border-[#0F4E7D] text-[#0F4E7D] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0F4E7D] hover:text-white transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
