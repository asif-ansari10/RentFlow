// "use client";
// import { useState } from "react";
// import toast from "react-hot-toast";

// export default function MeterReadingModal({ rent, onClose, onUpdated }) {
//   const [units, setUnits] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSave = async () => {
//     if (!units) {
//       toast.error("Enter units consumed");
//       return;
//     }

//     setLoading(true);

//     const res = await fetch("/api/rents/electricity", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         rentId: rent._id,
//         units: Number(units),
//       }),
//     });

//     if (res.ok) {
//       toast.success("Electricity bill added");
//       onUpdated();
//       onClose();
//     } else {
//       toast.error("Failed to update");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
//         <h2 className="text-lg font-semibold">Electricity Reading</h2>

//         <input
//           type="number"
//           placeholder="Units consumed"
//           className="w-full border rounded-lg px-3 py-2"
//           value={units}
//           onChange={(e) => setUnits(e.target.value)}
//         />

//         <div className="flex justify-end gap-3">
//           <button onClick={onClose} className="border px-4 py-2 rounded-lg">
//             Cancel
//           </button>
//           <button
//             disabled={loading}
//             onClick={handleSave}
//             className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
//           >
//             {loading ? "Saving..." : "Calculate"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MeterReadingModal({ rent, onClose, onUpdated }) {
  const [units, setUnits] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!units || Number(units) <= 0) {
      toast.error("Enter valid units consumed");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/rents/electricity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rentId: rent._id,
        units: Number(units),
      }),
    });

    if (res.ok) {
      toast.success("Electricity bill added");
      onUpdated();
      onClose();
    } else {
      toast.error("Failed to update electricity");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-xl w-full max-w-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-center">
          Electricity Reading
        </h2>

        {/* Unit input */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Units Consumed
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 120"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>

        {/* Preview */}
        {rent?.electricity?.unitCost > 0 && units && (
          <p className="text-sm text-gray-700">
            Amount: ₹{Number(units) * rent.electricity.unitCost}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? "Saving..." : "Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
}
