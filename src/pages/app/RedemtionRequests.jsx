import { Coins } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const RedemptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalType, setModalType] = useState(null); // "approve" | "reject"
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Redemption Requests
  const fetchRedemptions = async () => {
    try {
      const res = await axios.get("/affiliate/redemptions");
      if (res.data.success) {
        setRequests(res.data.data);
      } else {
        ErrorToast("Failed to fetch redemption requests");
      }
    } catch {
      ErrorToast("Something went wrong while loading redemptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  // ✅ Approve / Reject API
  const handleRedeemAction = async () => {
    if (!selectedRequest || !modalType) return;

    setActionLoading(true);
    try {
      const res = await axios.post(
        `/affiliate/${selectedRequest._id}/redeem-approval`,
        {
          status: modalType === "approve" ? "approved" : "rejected",
        }
      );

      if (res.data.success) {
        SuccessToast(
          `Request ${
            modalType === "approve" ? "approved" : "rejected"
          } successfully`
        );
        fetchRedemptions();
        setModalType(null);
        setSelectedRequest(null);
      } else {
        ErrorToast("Failed to update request");
      }
    } catch {
      ErrorToast("Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };


  const TableSkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {/* User */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-2 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </td>

      {/* Reward */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      </td>

      {/* Coins */}
      <td className="px-5 py-4">
        <div className="h-3 w-14 bg-gray-200 rounded"></div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-center">
        <div className="flex justify-center gap-2">
          <div className="h-7 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-7 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
};


  if (loading) {
    return (
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableSkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    );
  }


  

  return (
    <div className="p-4 pt-2 space-y-8 min-h-screen text-black">
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-4xl font-bold text-[#DE4B12]">
          Redemption Requests
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage user redemption requests.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold bg-[#DE4B12] text-white p-4">
          Requests List
        </h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase border-b text-gray-600">
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Reward</th>
              <th className="px-5 py-3 text-left">Coins</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>

         <tbody className="divide-y">
  {requests.length === 0 ? (
    <tr>
      <td colSpan="5" className="px-5 py-4 text-center text-gray-500">
        No requests available
      </td>
    </tr>
  ) : (
    requests.map((req) => (
      <tr key={req._id} className="hover:bg-gray-50">
        {/* User */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={req.user.profilePicture}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{req.user.name}</p>
              <p className="text-xs text-gray-500">@{req.user.username}</p>
            </div>
          </div>
        </td>

        {/* Reward */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={req.reward.icon}
              className="w-10 h-10 object-cover"
            />
            <p className="font-medium">{req.reward.name}</p>
          </div>
        </td>

        {/* Coins */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#DE4B12]" />
            <span className="font-medium">{req.reward.coins}</span>
          </div>
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <span
            className={`px-3 py-1 text-xs rounded-full border ${
              req.status === "pending"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : req.status === "approved"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {req.status}
          </span>
        </td>

        {/* Actions */}
        <td className="px-5 py-4 text-center">
          {req.status === "pending" ? (
            <div className="flex justify-center gap-2">
              <button
                className="px-3 py-1.5 text-xs border border-green-500 text-green-600 rounded-lg hover:bg-green-600 hover:text-white"
                onClick={() => {
                  setSelectedRequest(req);
                  setModalType("approve");
                }}
              >
                Approve
              </button>
              <button
                className="px-3 py-1.5 text-xs border border-red-500 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"
                onClick={() => {
                  setSelectedRequest(req);
                  setModalType("reject");
                }}
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No actions</span>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      {modalType && selectedRequest && (
        <div className="fixed -inset-20 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

          <div className="relative bg-white max-w-md w-full rounded-2xl shadow-xl p-7">
            <h2 className="text-xl font-bold text-center mb-4">
              {modalType === "approve" ? "Approve" : "Reject"} Request
            </h2>

            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to {modalType} this redemption request?
            </p>

            <div className="flex gap-3">
              <button
                disabled={actionLoading}
                className={`flex-1 py-2 rounded-lg text-white ${
                  modalType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-60`}
                onClick={handleRedeemAction}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>

              <button
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                onClick={() => {
                  setModalType(null);
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionRequests;
