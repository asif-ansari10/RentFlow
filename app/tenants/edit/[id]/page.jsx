"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import UpdateAgreementModal from "@/components/UpdateAgreementModal";

export default function EditTenantPage() {
  const { id } = useParams();
  const router = useRouter();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  /* ================= LOAD TENANT ================= */
  useEffect(() => {
    async function loadTenant() {
      try {
        const res = await fetch(`/api/tenants/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed");
        }
        const data = await res.json();
        setTenant(data.tenant);
      } catch {
        alert("Unable to load tenant");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadTenant();
  }, [id, router]);


async function handleSave() {
  if (saving) return; // 🛑 prevent multiple clicks

  setSaving(true);

  const fd = new FormData();
  fd.append("name", tenant.name);
  fd.append("email", tenant.email || "");
  fd.append("phone", tenant.phone);
  fd.append("whatsapp", tenant.whatsapp || "");
  fd.append("address", tenant.address);

  fd.append("monthlyRent", tenant.rent.monthly);
  fd.append("advance", tenant.rent.advance || 0);

  fd.append("rentIncreasePercentage", tenant.rentIncrease?.percentage || "");
  fd.append("rentIncreaseAfter", tenant.rentIncrease?.after || "");
  fd.append("rentIncreaseCycle", tenant.rentIncrease?.cycle || "");

  fd.append("electricityEnabled", tenant.electricity?.enabled || false);
  fd.append("unitCost", tenant.electricity?.unitCost || 0);

  if (photo) fd.append("photo", photo);

  try {
    const res = await fetch(`/api/tenants/${id}`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) throw new Error();

    setToast("✅ Tenant updated successfully");
    setTimeout(() => router.push("/tenants"), 1200);
  } catch {
    setToast("❌ Failed to update tenant");
  } finally {
    setSaving(false);
  }
}


  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10
                text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Edit Tenant</h1>

      <div className="bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  rounded-xl shadow p-6 space-y-6">

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Name" value={tenant.name}
            onChange={v => setTenant({ ...tenant, name: v })} />
          <Input label="Email" value={tenant.email || ""}
            onChange={v => setTenant({ ...tenant, email: v })} />
          <Input label="Phone" value={tenant.phone}
            onChange={v => setTenant({ ...tenant, phone: v })} />
          <Input label="WhatsApp" value={tenant.whatsapp || ""}
            onChange={v => setTenant({ ...tenant, whatsapp: v })} />
          <Input label="Address" value={tenant.address}
            onChange={v => setTenant({ ...tenant, address: v })} />
        </div>

        {/* RENT */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Monthly Rent" type="number"
            value={tenant.rent.monthly}
            onChange={v => setTenant({
              ...tenant,
              rent: { ...tenant.rent, monthly: v }
            })}
          />
          <Input label="Advance Amount" type="number"
            value={tenant.rent.advance || 0}
            onChange={v => setTenant({
              ...tenant,
              rent: { ...tenant.rent, advance: v }
            })}
          />
        </div>

        {/* ELECTRICITY */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <label className="font-medium">Electricity</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={tenant.electricity?.enabled}
              onChange={e => setTenant({
                ...tenant,
                electricity: {
                  ...tenant.electricity,
                  enabled: e.target.checked,
                }
              })}
            />
            <span className="text-gray-700 dark:text-gray-300">
  Enable electricity billing
</span>

          </div>
          {tenant.electricity?.enabled && (
            <Input
              label="Unit Cost"
              type="number"
              value={tenant.electricity.unitCost || 0}
              onChange={v => setTenant({
                ...tenant,
                electricity: { ...tenant.electricity, unitCost: v }
              })}
            />
          )}
        </div>

        {/* RENT INCREASE */}
        <div className="border-t pt-4 space-y-2">
          <label className="font-medium">Rent Increase</label>
          <div className="grid grid-cols-3 gap-3">
            <Input label="%" type="number"
              value={tenant.rentIncrease?.percentage || ""}
              onChange={v => setTenant({
                ...tenant,
                rentIncrease: { ...tenant.rentIncrease, percentage: v }
              })}
            />
            <Input label="After" type="number"
              value={tenant.rentIncrease?.after || ""}
              onChange={v => setTenant({
                ...tenant,
                rentIncrease: { ...tenant.rentIncrease, after: v }
              })}
            />
            <select
              value={tenant.rentIncrease?.cycle || ""}
              onChange={e => setTenant({
                ...tenant,
                rentIncrease: { ...tenant.rentIncrease, cycle: e.target.value }
              })}
              className="border rounded px-2 py-2
    bg-white dark:bg-gray-800
    border-gray-300 dark:border-gray-700
    text-gray-900 dark:text-gray-100"
            >
              <option value="">Cycle</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

{/* TENANT PHOTO */}
<div className="border-t pt-6">
  <label className="font-medium block mb-3">Tenant Photo</label>

  <div className="flex items-center gap-6">
    {/* Avatar Preview */}
    <div className="relative group">
      <img
        src={
          photo
            ? URL.createObjectURL(photo)
            : tenant.photoUrl || "/avatar.png"
        }
        alt="Tenant Photo"
        className="w-24 h-24 rounded-full object-cover border shadow-sm"
      />

      {/* Hover Overlay */}
      <label className="absolute inset-0 bg-black/50 text-white text-xs 
        flex items-center justify-center rounded-full opacity-0 
        group-hover:opacity-100 cursor-pointer transition">
        Change Photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
      </label>
    </div>

    {/* Info */}
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <p>Upload tenant profile photo</p>
      <p className="text-xs text-gray-400">
        JPG, PNG · Max 2MB
      </p>
    </div>
  </div>
</div>



        {/* AGREEMENT */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-medium">Agreement</span>
          <button
            onClick={() => setShowAgreementModal(true)}
            className="text-indigo-600 underline text-sm"
          >
            Update Agreement
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()}
            className="px-4 py-2 rounded
  border border-gray-300 dark:border-gray-700
  text-gray-700 dark:text-gray-300
  hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancel
          </button>
<button
  onClick={handleSave}
  disabled={saving}
  className={`
    px-6 py-3 rounded-lg font-semibold text-white
    transition-all duration-200
    ${saving
      ? "bg-indigo-400 cursor-not-allowed opacity-70"
      : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"}
  `}
>
  {saving ? (
    <span className="flex items-center gap-2">
      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Saving...
    </span>
  ) : (
    "Save Changes"
  )}
</button>

        </div>

        {toast && (
  <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
    {toast}
  </p>
)}

      </div>

      {showAgreementModal && (
        <UpdateAgreementModal
          tenantId={id}
          onClose={() => setShowAgreementModal(false)}
        />
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded
    border border-gray-300 dark:border-gray-700
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
