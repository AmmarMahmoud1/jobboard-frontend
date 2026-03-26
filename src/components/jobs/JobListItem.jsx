function JobListItem({ job, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(job)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.companyName}</p>
        </div>

        {job.remote && (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
            Remote
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>{job.location || "No location"}</p>
        <p>{job.jobType || "No type"}</p>
        <p>{job.category || "No category"}</p>
      </div>
    </button>
  );
}

export default JobListItem;