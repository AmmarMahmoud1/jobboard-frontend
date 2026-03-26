function JobCard({ job }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.companyName}</p>
        </div>

        {job.remote && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Remote
          </span>
        )}
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {job.description}
      </p>

      <div className="space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-semibold">Category:</span> {job.category || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Type:</span> {job.jobType || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Location:</span> {job.location || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Hours/week:</span> {job.workingHoursPerWeek ?? "N/A"}
        </p>
        <p>
          <span className="font-semibold">Salary:</span>{" "}
          {job.salary ? `${job.salary} ${job.salaryType || ""}` : "N/A"}
        </p>
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <button className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
        View Details
      </button>
    </article>
  );
}

export default JobCard;