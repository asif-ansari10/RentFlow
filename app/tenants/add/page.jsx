"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddTenantPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    monthlyRent: "",
    advanceAmount: "",

    billingCycle: "Monthly",
    billingDate: 1,
    gracePeriod: 5,

    agreementStartDate: "",
    tenureYears: 1,
    tenureMonths: 0,
    tenureDays: 0,

    increasePercentage: "",
    increaseAfter: "",
    increaseCycle: "Select",

    notifyBeforeAgreementEnd: true, // future reminder
  });

  const [submitting, setSubmitting] = useState(false);

  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const router = useRouter();
  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [photo, setPhoto] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [electricityEnabled, setElectricityEnabled] = useState(false);
  const [unitCost, setUnitCost] = useState("");
  const [notifyBeforeBilling, setNotifyBeforeBilling] = useState(false);
  const [startThisMonth, setStartThisMonth] = useState(false);


  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      if (photo) fd.append("photo", photo);
      if (agreementFile) fd.append("agreementFile", agreementFile);

      fd.append("electricityEnabled", electricityEnabled);
      fd.append("unitCost", unitCost);
      fd.append("notifyBeforeBilling", notifyBeforeBilling);
      fd.append("startThisMonth", startThisMonth);


      const res = await fetch("/api/tenants", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add tenant");
        setSubmitting(false);
        return;
      }

      toast.success("Tenant added successfully 🎉");
      setTimeout(() => router.push("/tenants"), 800);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add Tenant
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Tenant, rent and agreement details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tenant Info */}
          <Section title="Tenant Information">
            <Input
              label="Tenant Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />

            <Input
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />

            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => {
                update("phone", e.target.value);
                if (sameWhatsapp) update("whatsapp", e.target.value);
              }}
            />

            <div>
              <Input
                label="WhatsApp Number"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
              />

              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={sameWhatsapp}
                  onChange={(e) => {
                    setSameWhatsapp(e.target.checked);
                    if (e.target.checked)
                      update("whatsapp", form.phone);
                  }}
                />
                Same as phone number
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Property Address
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="House / Flat No, Street, Area, City, State"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </Section>

          <Section title="Tenant Photo (Optional)">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload Tenant Photo
              </label>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border border-dashed flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {photo ? (
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Photo</span>
                  )}
                </div>

                <label className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                </label>

                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Section>


          {/* Rent Details */}
          <Section title="Rent Details">
            <Input
              label="Monthly Rent"
              type="number"
              value={form.monthlyRent}
              onChange={(e) => update("monthlyRent", e.target.value)}
            />

            <Input
              label="Advance Amount"
              type="number"
              value={form.advanceAmount}
              onChange={(e) => update("advanceAmount", e.target.value)}
            />
          </Section>

          {/* Billing Rules */}
          <Section title="Rent Billing & Due Rules">
            <Select
              label="Rent Billing Cycle"
              value={form.billingCycle}
              onChange={(e) => update("billingCycle", e.target.value)}
              options={["Monthly", "Every 2 Months", "Every 3 Months"]}
            />

            <Input
              label="Rent Billing Date (Day)"
              type="number"
              min="1"
              max="28"
              value={form.billingDate}
              onChange={(e) => update("billingDate", e.target.value)}
            />

            <Input
              label="Grace Period (Days)"
              type="number"
              value={form.gracePeriod}
              onChange={(e) => update("gracePeriod", e.target.value)}
            />

            <label
              className="
        flex items-start gap-3 p-4 rounded-lg
        bg-gray-50 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:border-indigo-400 dark:hover:border-indigo-500
        transition cursor-pointer
      "
            >
              <input
                type="checkbox"
                checked={startThisMonth}
                onChange={(e) => setStartThisMonth(e.target.checked)}
                className="
          mt-1 h-4 w-4 rounded
          text-indigo-600
          focus:ring-indigo-500
          dark:bg-gray-900 dark:border-gray-600
        "
              />

              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Start rent collection from this month
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  If unchecked, the first rent will be generated from the next month
                </p>
              </div>
            </label>
          </Section>


          {/* Electricity rule */}
          <Section title="Electricity (Optional)">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={electricityEnabled}
                onChange={(e) => setElectricityEnabled(e.target.checked)}
              />
              Enable Electricity Billing
            </label>

            {electricityEnabled && (
              <>
                <Input
                  label="Electricity Unit Cost (₹)"
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={notifyBeforeBilling}
                    onChange={(e) => setNotifyBeforeBilling(e.target.checked)}
                  />
                  Notify me 24 hours before billing date
                </label>
              </>
            )}
          </Section>





          {/* Agreement Period */}
          <Section title="Agreement Period">
            {/* Part 1: Start Date */}
            <div className="md:col-span-2">
              <Input
                label="Agreement Start Date"
                type="date"
                value={form.agreementStartDate}
                onChange={(e) =>
                  update("agreementStartDate", e.target.value)
                }
              />
            </div>

            {/* Part 2: Duration */}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Agreement Duration
              </p>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Years"
                  type="number"
                  value={form.tenureYears}
                  onChange={(e) =>
                    update("tenureYears", e.target.value)
                  }
                />
                <Input
                  label="Months"
                  type="number"
                  value={form.tenureMonths}
                  onChange={(e) =>
                    update("tenureMonths", e.target.value)
                  }
                />
                <Input
                  label="Days"
                  type="number"
                  value={form.tenureDays}
                  onChange={(e) =>
                    update("tenureDays", e.target.value)
                  }
                />
              </div>
            </div>
          </Section>

          <Section title="Agreement Document (Optional)">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload Agreement PDF
              </label>

              <div className="flex items-center gap-4">
                <label className="cursor-pointer px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Choose PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => setAgreementFile(e.target.files[0])}
                  />
                </label>

                {agreementFile && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {agreementFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAgreementFile(null)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Section>


          {/* Rent Increase */}
          <Section title="Rent Increase Rule (Optional)">
            <Input
              label="Increase Percentage (%)"
              type="number"
              value={form.increasePercentage}
              onChange={(e) =>
                update("increasePercentage", e.target.value)
              }
            />

            <Input
              label="Increase After"
              type="number"
              placeholder="Enter number"
              value={form.increaseAfter}
              onChange={(e) =>
                update("increaseAfter", e.target.value)
              }
            />

            <Select
              label="Increase Cycle"
              value={form.increaseCycle}
              onChange={(e) =>
                update("increaseCycle", e.target.value)
              }
              options={["Select", "Yearly", "Monthly"]}
            />
          </Section>

          {/* Agreement Reminder */}
          <Section title="Notifications">
            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.notifyBeforeAgreementEnd}
                onChange={(e) =>
                  update(
                    "notifyBeforeAgreementEnd",
                    e.target.checked
                  )
                }
              />
              Notify me 1 month before agreement ends
            </label>
          </Section>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg shadow-md transition
    ${submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            {submitting ? "Saving..." : "Save Tenant"}

            {submitting && (
              <span className="ml-2 inline-block animate-spin">⏳</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
