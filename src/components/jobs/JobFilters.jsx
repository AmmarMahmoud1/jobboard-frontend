function JobFilters() {
  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Filters</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <select className="rounded-lg border border-slate-300 px-3 py-2">
          <option value="">All Categories</option>
        </select>

        <select className="rounded-lg border border-slate-300 px-3 py-2">
          <option value="">All Job Types</option>
        </select>
      </div>
    </div>
  );
}

export default JobFilters;