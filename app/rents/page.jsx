"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

/* ================= PAGE ================= */

export default function RentsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  /* 🔹 MODALS STATE */
  const [selectedRent, setSelectedRent] = useState(null);
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshRents = async () => {
  try {
    setRefreshing(true);

    const res = await fetch("/api/cron/generate-rents");
    const data = await res.json();

    if (!data.success) {
      throw new Error("Cron failed");
    }

    toast.success("Rents refreshed successfully");

    // reload rents list
    await fetchRents();
  } catch (err) {
    toast.error("Failed to refresh rents");
  } finally {
    setRefreshing(false);
  }
};


  useEffect(() => {
    fetchRents();
  }, [statusFilter]);

  const fetchRents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/rents${statusFilter ? `?status=${statusFilter}` : ""}`
      );
      const data = await res.json();

      if (data.unauthorized) {
        setNeedLogin(true);
        setRents([]);
        return;
      }

      setRents(data.rents || []);
    } catch {
      toast.error("Failed to load rents");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  if (needLogin) {
    return (
      <div className="flex flex-col items-center py-24">
        <h2 className="text-2xl font-semibold">Login required</h2>
        <Link href="/login" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Refresh Button */}
<div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold">Rents</h1>

  <button
    onClick={refreshRents}
    disabled={refreshing}
    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg
      transition-all duration-300
      ${
        refreshing
          ? "bg-indigo-400 cursor-not-allowed"
          : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-md hover:shadow-lg"
      }
      text-white`}
  >

    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

      

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        <FilterButton label="All" />
        <FilterButton label="Pending" value="pending" />
        <FilterButton label="Overdue" value="overdue" />
        <FilterButton label="Paid" value="paid" />
      </div>




      {/* TABLE */}
      {!loading && rents.length > 0 && (
        <div className="hidden md:block bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <Th>Tenant</Th>
                <Th>Amount</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
                <Th>Meter</Th>
                <Th>Breakup</Th>
              </tr>
            </thead>
            <tbody>
              {rents.map((rent) => (
                <tr key={rent._id} className="border-t">
                  <Td>
                    <div className="flex items-center gap-3">

                      <Avatar photoUrl={rent.photoUrl} name={rent.tenantName} />

                      <span className="font-medium">{rent.tenantName}</span>
                    </div>
                  </Td>

                  <Td>₹{rent.amount}</Td>
                  <Td>{new Date(rent.dueDate).toLocaleDateString()}</Td>
                  <Td><StatusBadge status={rent.status} /></Td>

                  <Td>
                    {(rent.status === "pending" || rent.status === "overdue") && (

                      <button
                        onClick={() => {
                          setSelectedRent(rent);
                          setShowPaidModal(true);
                        }}
                        className="text-green-600 hover:underline"
                      >
                        Mark Paid
                      </button>
                    )}
                  </Td>

                  <Td>
                    {rent.electricity?.enabled &&
                      !rent.electricity?.calculated &&
                      (rent.status === "pending" || rent.status === "overdue") && (

                        <button
                          onClick={() => {
                            setSelectedRent(rent);
                            setShowMeterModal(true);
                          }}
                          className="text-orange-600 hover:underline"
                        >
                          Add Reading
                        </button>
                      )}
                  </Td>

                  <Td>
                    <button
                      onClick={() => {
                        setSelectedRent(rent);
                        setShowBreakupModal(true);
                      }}
                    >
                      ℹ️
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     {/* MOBILE VIEW */}
{!loading && rents.length > 0 && (
  <div className="md:hidden space-y-4">
    {rents.map((rent) => (
      <div
        key={rent._id}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar photoUrl={rent.photoUrl} name={rent.tenantName} />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {rent.tenantName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Due: {new Date(rent.dueDate).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={rent.status} />
        </div>

        {/* Amount */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Rent Amount
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₹{rent.amount}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(rent.status === "pending" || rent.status === "overdue") && (
            <button
              onClick={() => {
                setSelectedRent(rent);
                setShowPaidModal(true);
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Mark Paid
            </button>
          )}

          {rent.electricity?.enabled &&
            !rent.electricity?.calculated &&
            (rent.status === "pending" || rent.status === "overdue") && (
              <button
                onClick={() => {
                  setSelectedRent(rent);
                  setShowMeterModal(true);
                }}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Add Meter
              </button>
            )}

          <button
            onClick={() => {
              setSelectedRent(rent);
              setShowBreakupModal(true);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Details
          </button>
        </div>
      </div>
    ))}
  </div>
)}




      {/* MODALS */}
      {showMeterModal && (
        <MeterModal
          rent={selectedRent}
          onClose={() => setShowMeterModal(false)}
          onSuccess={fetchRents}
        />
      )}

      {showPaidModal && (
        <PaidModal
          rent={selectedRent}
          onClose={() => setShowPaidModal(false)}
          onSuccess={fetchRents}
        />
      )}

      {showBreakupModal && (
        <BreakupModal rent={selectedRent} onClose={() => setShowBreakupModal(false)} />
      )}
    </div>
  );
}

/* ================= MODALS ================= */

function MeterModal({ rent, onClose, onSuccess }) {
  const [units, setUnits] = useState("");

  async function submit() {
    if (!units || Number(units) <= 0) {
      toast.error("Enter valid units");
      return;
    }

    await fetch("/api/rents/electricity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rentId: rent._id,
        units: Number(units),
      }),
    });

    toast.success("Electricity added");
    onClose();
    onSuccess();
  }


  return (
    <Modal title="Add Meter Reading" onClose={onClose}>
      <input
        type="number"
        placeholder="Units consumed"
        className="border w-full p-2 rounded"
        onChange={(e) => setUnits(e.target.value)}
      />
      <ModalActions onClose={onClose} onSubmit={submit} />
    </Modal>
  );
}

function PaidModal({ rent, onClose, onSuccess }) {

  const [paidAmount, setPaidAmount] = useState("");

  async function fullPaid() {
    await fetch("/api/rents/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentId: rent._id }),
    });
    toast.success("Marked paid");
    onClose();
    onSuccess();
  }

  async function dueNextMonth() {
    // await fetch("/api/rents/partial-paid", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     rentId: rent._id,
    //     dueAmount: due,
    //   }),
    // });

    await fetch("/api/rents/partial-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rentId: rent._id,
        paidAmount: Number(paidAmount),
      }),
    });

    toast.success("Due saved for next month");
    onClose();
    onSuccess();
  }

  return (
    <Modal title="Mark Paid" onClose={onClose}>
      <button onClick={fullPaid} className="w-full bg-green-600 text-white py-2 rounded">
        Full Paid
      </button>

      <div className="mt-4">
        <input
          type="number"
          placeholder="Paid amount"
          className="border w-full p-2 rounded"
          onChange={(e) => setPaidAmount(e.target.value)}
        />

        <button
          onClick={dueNextMonth}
          className="w-full mt-2 bg-orange-600 text-white py-2 rounded"
        >
          Due Next Month
        </button>
      </div>
    </Modal>
  );
}


function BreakupModal({ rent, onClose }) {
  const unitCost = rent.electricity?.unitCost || 0;
  const unitsConsumed = rent.electricity?.unitsConsumed || 0;
  const electricityAmount = rent.electricity?.electricityAmount || 0;

  const previousDue = rent.previousDue || 0;

  // ✅ base rent = amount - previousDue (electricity excluded)
  const baseRent = rent.amount - previousDue - electricityAmount;

  // ✅ total payable = rent.amount + electricity
  const total = rent.amount;

  const paid = rent.paidAmount || 0;

  // ✅ due = total - paid (for pending / partial)
  const dueNow =
    rent.status === "pending" || rent.status === "partial"
      ? Math.max(total - paid, 0)
      : 0;

  const dueNextMonth = rent.dueNextMonth || 0;

  return (
<Modal title="Rent Breakup" onClose={onClose}>
  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">

    {/* BASE RENT */}
    <p>
      Base Rent:{" "}
      <span className="font-medium text-gray-900 dark:text-gray-100">
        ₹{baseRent}
      </span>
    </p>

    {/* PREVIOUS DUE */}
    {previousDue > 0 && (
      <p className="text-orange-600 dark:text-orange-400">
        Previous Month Due:{" "}
        <span className="font-medium">₹{previousDue}</span>
      </p>
    )}

    {/* ELECTRICITY */}
    {rent.electricity?.enabled && unitsConsumed > 0 && (
      <p>
        Electricity:{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          ₹{unitCost} × {unitsConsumed} units = ₹{electricityAmount}
        </span>
      </p>
    )}

    {/* DIVIDER */}
    <hr className="border-gray-200 dark:border-gray-700" />

    {/* TOTAL */}
    <p className="font-semibold text-gray-900 dark:text-gray-100">
      Total Payable: ₹{total}
    </p>

    {/* PAID */}
    {paid > 0 && (
      <p className="text-green-600 dark:text-green-400">
        Paid: ₹{paid}
      </p>
    )}

    {/* DUE */}
    {dueNow > 0 && (
      <p className="text-red-600 dark:text-red-400">
        Due: ₹{dueNow}
      </p>
    )}

    {/* CARRY FORWARD */}
    {dueNextMonth > 0 && (
      <p className="text-orange-700 dark:text-orange-400">
        Carry Forward (Next Month): ₹{dueNextMonth}
      </p>
    )}
  </div>
</Modal>

  );
}





function Avatar({ photoUrl, name }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        onError={(e) => (e.currentTarget.style.display = "none")}
        className="w-9 h-9 rounded-full object-cover border"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}


/* ================= REUSABLE ================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {children}

        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


function ModalActions({ onClose, onSubmit }) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <button onClick={onClose}>Cancel</button>
      <button onClick={onSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-6 py-4 text-left">{children}</th>;
}

function Td({ children }) {
  return <td className="px-6 py-4">{children}</td>;
}

function StatusBadge({ status }) {
  const map = {
    paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    partial: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function FilterButton({ label, value }) {
  const href = value ? `/rents?status=${value}` : "/rents";
  return <a href={href} className="px-4 py-2 border rounded">{label}</a>;
}
