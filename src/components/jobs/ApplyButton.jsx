import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyToJob } from "../../services/applicationService";
import { uploadResume } from "../../services/uploadService";

function ApplyButton({ jobId }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Only PDF files are accepted.");
      return;
    }
    setMessage("");
    setCvFile(file);
  }

  function handleRemoveFile() {
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleApply() {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      setMessage("You must be logged in to apply.");
      return;
    }

    const user = JSON.parse(storedUser);
    setIsSubmitting(true);
    setMessage("");

    try {
      let cvUrl = "";

      if (cvFile) {
        setUploading(true);
        const result = await uploadResume(cvFile);
        cvUrl = result.url;
        setUploading(false);
      }

      await applyToJob({ userId: user.id, jobId, coverLetter, cvUrl });

      setMessage("Application submitted successfully.");
      setCoverLetter("");
      setCvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      setUploading(false);
      setMessage(err.message || "Failed to apply.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpen() {
    if (!localStorage.getItem("authUser")) {
      navigate("/login");
      return;
    }
    setIsOpen(true);
    setMessage("");
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ready to apply?</h3>
          <p className="text-sm text-slate-500">
            Add a cover letter and upload your CV as a PDF.
          </p>
        </div>
        <button
          onClick={handleOpen}
          className="rounded-2xl bg-[#0F4E7D] px-6 py-3 font-bold text-white transition hover:bg-[#0A3A5D]"
        >
          Apply Now
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Apply for this job</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your profile details are included automatically.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">
              {/* Cover Letter */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a short cover letter..."
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0F4E7D] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* CV Upload */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Resume / CV <span className="text-xs font-normal text-slate-400">(PDF only)</span>
                </label>

                {cvFile ? (
                  <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F4E7D] text-white text-xs font-bold">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{cvFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(cvFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-[#0F4E7D] hover:bg-blue-50">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500 text-sm font-bold">
                      PDF
                    </div>
                    <p className="text-sm font-semibold text-slate-600">Click to upload your CV</p>
                    <p className="mt-1 text-xs text-slate-400">PDF files only, up to 10 MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {message && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    message.toLowerCase().includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isSubmitting}
                className="rounded-2xl bg-[#0F4E7D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0A3A5D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApplyButton;
