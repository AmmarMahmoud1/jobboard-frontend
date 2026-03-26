import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import JobSidebar from "../components/jobs/JobSidebar";
import JobDetail from "../components/jobs/JobDetail";
import ApplyButton from "../components/jobs/ApplyButton";

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search inputs (not yet applied)
  const [titleInput, setTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  // Applied filters (only updated on Search click)
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getAllJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Reset selected job when category changes
  useEffect(() => {
    setSelectedJob(null);
  }, [categoryParam]);

  function handleSearch() {
    setSearchTerm(titleInput);
    setLocationTerm(locationInput);
    setSelectedJob(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = searchTerm
      ? job.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const locMatch = locationTerm
      ? (job.location?.toLowerCase().includes(locationTerm.toLowerCase()) ?? false)
      : true;
    const catMatch = categoryParam ? job.category === categoryParam : true;
    return titleMatch && locMatch && catMatch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* HEADER */}
      <header className="bg-[#0F4E7D] pt-20 pb-40 px-6 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
          OPPORTUNITY <span className="text-blue-300">AWAITS</span>
        </h1>

        {categoryParam && (
          <p className="text-blue-200 text-sm font-semibold mb-4 uppercase tracking-widest">
            {categoryParam.replace("_", " ")}
          </p>
        )}

        <div className="mx-auto max-w-3xl bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 mt-6">
          <input
            type="text"
            placeholder="Job title or keyword"
            className="flex-[2] px-4 py-3 outline-none text-slate-700 text-sm"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="hidden md:block w-px bg-slate-200 self-stretch my-1" />
          <input
            type="text"
            placeholder="Location"
            className="flex-1 px-4 py-3 outline-none text-slate-700 text-sm"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            className="bg-[#0F4E7D] text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-[#0A3A5D] transition-all"
          >
            Search
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 -mt-20 pb-20">
        {!selectedJob ? (
          loading ? (
            <p className="text-center text-slate-500 pt-32">Loading jobs...</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-slate-500 pt-32">No jobs found.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
              ))}
            </div>
          )
        ) : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-sm font-semibold text-[#0F4E7D] hover:text-slate-800 transition-colors"
              >
                ← Back to jobs
              </button>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-[760px] flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Listings</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-500">
                    {filteredJobs.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <JobSidebar
                    jobs={filteredJobs}
                    selectedJob={selectedJob}
                    onSelectJob={setSelectedJob}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-[810px] sticky top-6 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <JobDetail job={selectedJob} />
              </div>
              <div className="border-t border-slate-100 p-6 bg-slate-50">
                <ApplyButton jobId={selectedJob.id} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job, onSelect }) {
  const typeColor = {
    FULL_TIME: "bg-blue-50 text-blue-700",
    PART_TIME: "bg-purple-50 text-purple-700",
    INTERN: "bg-orange-50 text-orange-700",
    WORKING_STUDENT: "bg-teal-50 text-teal-700",
    MINI_JOB: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#0F4E7D] hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#0F4E7D] transition-colors leading-snug truncate">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{job.companyName}</p>
        </div>
        {job.remote && (
          <span className="shrink-0 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700">
            Remote
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.jobType && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor[job.jobType] || "bg-slate-100 text-slate-600"}`}>
            {job.jobType.replace("_", " ")}
          </span>
        )}
        {job.category && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {job.category}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-slate-500 mb-5 flex-1">
        {job.location && <p>{job.location}</p>}
        {job.salary && (
          <p className="font-semibold text-slate-700">
            €{job.salary} {job.salaryType || ""}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <span className="text-sm font-semibold text-[#0F4E7D] group-hover:underline">
          View details →
        </span>
      </div>
    </div>
  );
}

export default JobsPage;
