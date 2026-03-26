import JobCard from "./JobCard";

function JobList({ jobs }) {
  if (!jobs.length) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        No jobs found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default JobList;