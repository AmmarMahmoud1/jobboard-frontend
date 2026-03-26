function JobDetail({ job }) {
  if (!job) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-slate-500">Select a job to see details.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{job.title}</h2>
            <p className="mt-2 text-lg text-slate-600">{job.companyName}</p>
          </div>

          {job.remote && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              Remote
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {job.location || "No location"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {job.jobType || "No type"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {job.category || "No category"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {job.workingHoursPerWeek
              ? `${job.workingHoursPerWeek} h/week`
              : "No hours info"}
          </span>
        </div>
      </div>

      <div className="grid gap-8 py-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Description</h3>
          <p className="whitespace-pre-line text-slate-700">
            {job.description || "No description available."}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Details</h3>
          <div className="space-y-2 text-slate-700">
            <p>
              <span className="font-semibold">Salary:</span>{" "}
              {job.salary ? `${job.salary} ${job.salaryType || ""}` : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Application deadline:</span>{" "}
              {job.applicationDeadline || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Start date:</span>{" "}
              {job.startDate || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Active:</span>{" "}
              {job.active ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 border-t border-slate-200 pt-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Requirements</h3>
          <p className="whitespace-pre-line text-slate-700">
            {job.requirements || "No requirements provided."}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Responsibilities</h3>
          <p className="whitespace-pre-line text-slate-700">
            {job.responsibilities || "No responsibilities provided."}
          </p>
        </div>
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-3 text-lg font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default JobDetail;