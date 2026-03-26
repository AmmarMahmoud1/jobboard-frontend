import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById, updateJob } from "../services/jobService";

function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    getJobById(id)
      .then((job) => {
        setFormData({
          title: job.title || "",
          companyName: job.companyName || "",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          location: job.location || "",
          remote: job.remote || false,
          category: job.category || "IT",
          jobType: job.jobType || "FULL_TIME",
          salary: job.salary || "",
          salaryType: job.salaryType || "per hour",
          workingHoursPerWeek: job.workingHoursPerWeek || 40,
          applicationDeadline: job.applicationDeadline
            ? job.applicationDeadline.slice(0, 10)
            : "",
          startDate: job.startDate ? job.startDate.slice(0, 10) : "",
          tags: job.tags ? job.tags.join(", ") : "",
          active: job.active !== undefined ? job.active : true,
          createdByUserId: job.createdByUserId || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load job");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateJob(id, {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : null,
        workingHoursPerWeek: Number(formData.workingHoursPerWeek),
        applicationDeadline: formData.applicationDeadline ? formData.applicationDeadline + "T00:00:00" : null,
        startDate: formData.startDate ? formData.startDate + "T00:00:00" : null,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });

      navigate("/my-jobs");
    } catch (err) {
      alert(err.message || "Failed to update job.");
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputStyle =
    "w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F4E7D] focus:border-transparent outline-none transition-all";
  const labelStyle =
    "block text-xs font-black uppercase tracking-widest text-[#0F4E7D] mb-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-app-muted">Loading job...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-[#0F4E7D] pt-16 pb-32 px-6 text-center">
        <h1 className="text-4xl font-black text-white italic">
          EDIT <span className="text-blue-400">JOB POSTING</span>
        </h1>
        <p className="text-blue-100 mt-2">Update your job listing details.</p>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100"
        >
          {/* Title + Company + Category */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="col-span-2">
              <label className={labelStyle}>Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Engineer"
                className={inputStyle}
                value={formData.title}
                onChange={set("title")}
              />
            </div>

            <div>
              <label className={labelStyle}>Company Name</label>
              <input
                type="text"
                required
                placeholder="Your Company Ltd"
                className={inputStyle}
                value={formData.companyName}
                onChange={set("companyName")}
              />
            </div>

            <div>
              <label className={labelStyle}>Category</label>
              <select className={inputStyle} value={formData.category} onChange={set("category")}>
                <option value="IT">IT</option>
                <option value="MARKETING">Marketing</option>
                <option value="SALES">Sales</option>
                <option value="DESIGN">Design</option>
                <option value="FINANCE">Finance</option>
                <option value="CUSTOMER_SERVICE">Customer Service</option>
                <option value="LOGISTICS">Logistics</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className={labelStyle}>Job Description</label>
            <textarea
              rows="5"
              required
              placeholder="What will the candidate do?..."
              className={inputStyle}
              value={formData.description}
              onChange={set("description")}
            />
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <label className={labelStyle}>Requirements</label>
            <textarea
              rows="4"
              placeholder="Required skills, experience, qualifications..."
              className={inputStyle}
              value={formData.requirements}
              onChange={set("requirements")}
            />
          </div>

          {/* Responsibilities */}
          <div className="mb-8">
            <label className={labelStyle}>Responsibilities</label>
            <textarea
              rows="4"
              placeholder="Key responsibilities for this role..."
              className={inputStyle}
              value={formData.responsibilities}
              onChange={set("responsibilities")}
            />
          </div>

          {/* Job Type */}
          <div className="mb-8">
            <label className={labelStyle}>Job Type</label>
            <select className={inputStyle} value={formData.jobType} onChange={set("jobType")}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERN">Intern</option>
              <option value="WORKING_STUDENT">Working Student</option>
              <option value="MINI_JOB">Mini Job</option>
            </select>
          </div>

          {/* Location + Salary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2">
              <label className={labelStyle}>Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Berlin, Germany"
                  className={inputStyle}
                  value={formData.location}
                  onChange={set("location")}
                />
                <label className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#0F4E7D]"
                    checked={formData.remote}
                    onChange={set("remote")}
                  />
                  <span className="text-xs font-bold text-slate-500">Remote</span>
                </label>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Salary (€)</label>
              <input
                type="number"
                placeholder="50000"
                className={inputStyle}
                value={formData.salary}
                onChange={set("salary")}
              />
            </div>

            <div>
              <label className={labelStyle}>Salary Type</label>
              <select className={inputStyle} value={formData.salaryType} onChange={set("salaryType")}>
                <option value="per hour">Per Hour</option>
                <option value="fixed">Fixed</option>
                <option value="per month">Per Month</option>
                <option value="per year">Per Year</option>
              </select>
            </div>
          </div>

          {/* Working Hours + Dates */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={labelStyle}>Working Hours / Week</label>
              <input
                type="number"
                className={inputStyle}
                value={formData.workingHoursPerWeek}
                onChange={set("workingHoursPerWeek")}
              />
            </div>

            <div>
              <label className={labelStyle}>Application Deadline</label>
              <input
                type="date"
                className={inputStyle}
                value={formData.applicationDeadline}
                onChange={set("applicationDeadline")}
              />
            </div>

            <div>
              <label className={labelStyle}>Start Date</label>
              <input
                type="date"
                className={inputStyle}
                value={formData.startDate}
                onChange={set("startDate")}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className={labelStyle}>Tags</label>
            <input
              type="text"
              placeholder="e.g. React, Java, Remote-friendly (comma separated)"
              className={inputStyle}
              value={formData.tags}
              onChange={set("tags")}
            />
          </div>

          {/* Active toggle */}
          <div className="mb-10 flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              className="accent-[#0F4E7D] h-4 w-4"
              checked={formData.active}
              onChange={set("active")}
            />
            <label htmlFor="active" className="text-sm font-medium text-slate-700">
              Active (visible to job seekers)
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#0F4E7D] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#0A3A5D] hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/my-jobs")}
              className="px-8 py-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditJobPage;
