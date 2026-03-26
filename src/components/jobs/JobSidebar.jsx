import JobListItem from "./JobListItem";

function JobSidebar({ jobs, selectedJob, onSelectJob }) {
  return (
    <aside className="h-[calc(100vh-140px)] overflow-y-auto rounded-2xl bg-slate-100 p-3">
      <div className="mb-3 px-2">
        <h2 className="text-lg font-semibold text-slate-900">Available Jobs</h2>
        <p className="text-sm text-slate-500">{jobs.length} jobs found</p>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            selected={selectedJob?.id === job.id}
            onSelect={onSelectJob}
          />
        ))}
      </div>
    </aside>
  );
}

export default JobSidebar;