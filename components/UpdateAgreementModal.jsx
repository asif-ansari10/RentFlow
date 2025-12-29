"use client";
import { useState } from "react";

export default function UpdateAgreementModal({ tenantId, onClose }) {
  const [startDate, setStartDate] = useState("");
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

async function handleUpdate() {
  if (loading) return; // 🛑 prevent multiple clicks

  setError("");

  if (!startDate) {
    setError("Please select agreement start date");
    return;
  }

  setLoading(true);

  const fd = new FormData();
  fd.append("startDate", startDate);
  fd.append("years", years);
  fd.append("months", months);
  fd.append("days", days);
  if (file) fd.append("agreementFile", file);

  try {
    const res = await fetch(`/api/tenants/${tenantId}/agreement`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) throw new Error();

    setSuccess(true);
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 1200);
  } catch {
    setError("Failed to update agreement");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">

        <h2 className="text-xl font-semibold text-gray-800">
          Update Agreement
        </h2>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            Agreement Start Date
          </label>
          <input
            type="date"
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Tenure */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            Agreement Tenure
          </label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            <input
              type="number"
              placeholder="Years"
              className="border rounded-lg px-2 py-2"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <input
              type="number"
              placeholder="Months"
              className="border rounded-lg px-2 py-2"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
            <input
              type="number"
              placeholder="Days"
              className="border rounded-lg px-2 py-2"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            New Agreement PDF (optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 w-full text-sm"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* Messages */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm">
            ✅ Agreement updated successfully
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
<button
  onClick={handleUpdate}
  disabled={loading}
  className={`
    px-5 py-2 rounded-lg font-semibold text-white
    transition-all duration-200
    ${loading
      ? "bg-indigo-400 cursor-not-allowed opacity-70"
      : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"}
  `}
>
  {loading ? (
    <span className="flex items-center gap-2">
      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Updating...
    </span>
  ) : (
    "Update Agreement"
  )}
</button>

        </div>
      </div>
    </div>
  );
}
