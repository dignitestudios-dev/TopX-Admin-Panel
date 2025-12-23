import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ExpertRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get("/expertisestatus/requests");
      if (res.data.success) {
        setRequests(res.data.data);
      } else {
        ErrorToast("Failed to load expert requests");
      }
    } catch {
      ErrorToast("Failed to load expert requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Approve / Reject
  const handleRespond = async (status) => {
    setActionLoading(true);
    try {
      const res = await axios.post("/expertisestatus/respond", {
        requestId: selectedRequest._id,
        status,
      });

      if (res.data.success) {
        SuccessToast(
          `Request ${status === "accepted" ? "approved" : "rejected"}`
        );
        fetchRequests();
        setSelectedRequest(null);
        setConfirmAction(null);
      } else {
        ErrorToast("Action failed");
      }
    } catch {
      ErrorToast("Action failed");
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
          Expert Requests
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage expert verification requests.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold bg-[#DE4B12] text-white p-4">
          Requests List
        </h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-600 border-b">
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Expertise</th>
              <th className="px-5 py-3 text-left">Docs</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Action</th>
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
              <p className="text-xs text-gray-500 truncate max-w-[140px]">
                {req.user.username}
              </p>
            </div>
          </div>
        </td>

        {/* Expertise */}
        <td className="px-5 py-4">
          <p className="font-medium text-gray-800">{req.experitiseTopic}</p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {req.briefSummaryOfExpertise}
          </p>
        </td>

        {/* Docs */}
        <td className="px-5 py-4 text-gray-600">
          IDs: {req.identificationDocs.length} <br />
          Expertise: {req.expertiseDocs ? 1 : 0}
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <span
            className={`px-3 py-1 text-xs rounded-full border
              ${
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

        {/* Action */}
        <td className="px-5 py-4 text-center">
          <button
            className="text-[#DE4B12] text-sm font-medium hover:underline"
            onClick={() => setSelectedRequest(req)}
          >
            View
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {/* Pagination (UI only) */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="p-2 border rounded-full">
          <FaChevronLeft />
        </button>
        <button className="px-3 py-1 bg-[#DE4B12] text-white rounded-lg">
          1
        </button>
        <button className="p-2 border rounded-full">
          <FaChevronRight />
        </button>
      </div>

      {/* ===== DETAILS MODAL ===== */}
      {selectedRequest && !confirmAction && (
        <div className="fixed -inset-24 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#DE4B12] text-white px-6 py-3 flex justify-between">
              <h2 className="font-semibold">Expert Request Details</h2>
              <button onClick={() => setSelectedRequest(null)}>×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRequest.user.profilePicture}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedRequest.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.experitiseTopic}
                  </p>
                </div>
              </div>

              <p className="text-gray-700">
                {selectedRequest.briefSummaryOfExpertise}
              </p>

              {/* Docs */}
              <div>
                <p className="font-medium text-sm">Identification Docs</p>
                <div className="flex gap-2 mt-2">
                  {selectedRequest.identificationDocs.map((doc, i) => (
                    <img
                      key={i}
                      src={doc}
                      className="w-16 h-16 rounded border cursor-pointer"
                      onClick={() => window.open(doc, "_blank")}
                    />
                  ))}
                </div>
              </div>

              {selectedRequest.expertiseDocs && (
                <div>
                  <p className="font-medium text-sm">Expertise Document</p>
                  <img
                    src={selectedRequest.expertiseDocs}
                    className="w-16 h-16 mt-2 rounded border cursor-pointer"
                    onClick={() =>
                      window.open(selectedRequest.expertiseDocs, "_blank")
                    }
                  />
                </div>
              )}
            </div>

            {selectedRequest.status === "pending" && (
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick={() => setConfirmAction("reject")}
                >
                  Reject
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  onClick={() => setConfirmAction("approve")}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CONFIRM MODAL ===== */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-w-sm w-full rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              {confirmAction === "approve"
                ? "Approve Request"
                : "Reject Request"}
            </h3>

            <p className="text-gray-600">
              Are you sure you want to {confirmAction} this request?
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmAction === "approve"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
                onClick={() =>
                  handleRespond(
                    confirmAction === "approve" ? "accepted" : "rejected"
                  )
                }
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertRequests;
