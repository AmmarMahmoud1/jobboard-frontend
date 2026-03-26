import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-lg lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white lg:block">
            <Link to="/" className="inline-block text-3xl font-bold">
              JobBoard
            </Link>
            <h2 className="mt-12 text-4xl font-bold leading-tight">
              Find great jobs.
              <br />
              Build your future.
            </h2>
            <p className="mt-4 max-w-md text-blue-100">
              Discover internships, working student roles, part-time jobs, and
              full-time opportunities.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
              ← Back to jobs
            </Link>

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
              <p className="mt-2 text-slate-500">{subtitle}</p>
            </div>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;