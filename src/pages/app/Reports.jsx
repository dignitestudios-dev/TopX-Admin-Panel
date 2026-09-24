/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  Loader2,
  FileText,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  UserCheck,
  ExternalLink,
  Heart,
  MessageSquare,
  Share2,
  Flag,
} from "lucide-react";
import {
  getAdminReports,
  getAdminReport,
  updateAdminReportStatus,
} from "../../services/adminReportService";
import { setAdminUserSuspension } from "../../services/adminUserService";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import UserAvatar from "../../components/common/UserAvatar";

const Reports = () => {
  const navigate = useNavigate();

  // Reports state
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Review Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(null); // null | "resolved" | "rejected"
  const isSubmittingStatus = submittingAction !== null;

  // User Suspension Modal State
  const [suspensionModal, setSuspensionModal] = useState({
    isOpen: false,
    user: null,
    isSuspendedTarget: false,
    loading: false,
  });

  // Debounced search for report reasons
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Fetch Reports List
  const fetchReports = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const res = await getAdminReports({
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
          contentType: contentTypeFilter,
        });

        if (res && res.success) {
          setReports(res.data || []);
          setPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        } else {
          setFetchError(res?.message || "Failed to load reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        const safeMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load reports. Please check your connection and try again.";
        setFetchError(safeMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, statusFilter, contentTypeFilter]
  );

  useEffect(() => {
    fetchReports(pagination.currentPage);
  }, [fetchReports, pagination.currentPage]);

  // Open Report Review Drawer/Modal
  const handleOpenReview = async (report) => {
    setSelectedReport(report);
    setResolutionNote(report.resolutionNote || "");

    // Optionally fetch fresh hydrated report data
    try {
      setIsDetailLoading(true);
      const res = await getAdminReport(report._id);
      if (res && res.success && res.data) {
        setSelectedReport(res.data);
        setResolutionNote(res.data.resolutionNote || "");
      }
    } catch (err) {
      console.warn("Could not refetch single report detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseReview = () => {
    if (isSubmittingStatus) return;
    setSelectedReport(null);
    setResolutionNote("");
  };

  // Handle Mark Resolved / Rejected
  const handleUpdateStatus = async (targetStatus) => {
    if (!selectedReport) return;
    if (selectedReport.status === "resolved" || selectedReport.status === "rejected") {
      ErrorToast("This report has already been reviewed and cannot be modified.");
      return;
    }

    try {
      setSubmittingAction(targetStatus);
      const res = await updateAdminReportStatus(selectedReport._id, {
        status: targetStatus,
        resolutionNote,
      });

      if (res && res.success) {
        SuccessToast(
          res.message ||
            (targetStatus === "resolved"
              ? "Report marked as resolved"
              : "Report marked as rejected")
        );

        // Update local selected report
        const updated = {
          ...selectedReport,
          status: targetStatus,
          resolutionNote,
          reviewedAt: new Date().toISOString(),
        };
        setSelectedReport(updated);

        // Update in list as well
        setReports((prev) =>
          prev.map((r) => (r._id === selectedReport._id ? updated : r))
        );

        // Refetch report list in background
        fetchReports(pagination.currentPage);
      } else {
        ErrorToast(res?.message || "Failed to update report status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      const safeMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update report status";
      ErrorToast(safeMessage);
    } finally {
      setSubmittingAction(null);
    }
  };

  // Suspend / Restore Reported User
  const openSuspensionConfirm = (userToSuspend) => {
    setSuspensionModal({
      isOpen: true,
      user: userToSuspend,
      isSuspendedTarget: !userToSuspend.isSuspended,
      loading: false,
    });
  };

  const handleConfirmSuspension = async () => {
    const { user, isSuspendedTarget } = suspensionModal;
    if (!user) return;

    try {
      setSuspensionModal((prev) => ({ ...prev, loading: true }));
      const res = await setAdminUserSuspension(user._id, isSuspendedTarget);

      if (res && res.success) {
        SuccessToast(
          res.message ||
            (isSuspendedTarget
              ? "User suspended successfully"
              : "User restored successfully")
        );

        // Update user status in selected report
        if (selectedReport && selectedReport.reportedUser?._id === user._id) {
          setSelectedReport((prev) => ({
            ...prev,
            reportedUser: {
              ...prev.reportedUser,
              isSuspended: isSuspendedTarget,
              isDeactivatedByAdmin: isSuspendedTarget,
            },
          }));
        }

        // Update in reports list
        setReports((prev) =>
          prev.map((r) =>
            r.reportedUser?._id === user._id
              ? {
                  ...r,
                  reportedUser: {
                    ...r.reportedUser,
                    isSuspended: isSuspendedTarget,
                    isDeactivatedByAdmin: isSuspendedTarget,
                  },
                }
              : r
          )
        );
      } else {
        ErrorToast(res?.message || "Action failed");
      }
    } catch (err) {
      console.error("Suspension error:", err);
      const safeMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user suspension state";
      ErrorToast(safeMessage);
    } finally {
      setSuspensionModal({
        isOpen: false,
        user: null,
        isSuspendedTarget: false,
        loading: false,
      });
    }
  };

  // Status Badge Component
  const ReportStatusBadge = ({ status }) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "resolved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    }
    if (normalized === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Review
      </span>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 font-sans pb-20">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-orange-200/60 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-orange-100 text-[#DE4B12] rounded-xl">
            <Flag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Reports Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review flagged content, inspect reported users, and resolve or reject reports.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill & Refresh */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <span className="text-xs text-orange-600 font-medium block">
              Total Reports
            </span>
            <span className="text-lg font-bold text-[#DE4B12]">
              {pagination.totalItems || 0}
            </span>
          </div>

          <button
            onClick={() => fetchReports(pagination.currentPage)}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#DE4B12] hover:border-orange-200 hover:bg-orange-50 transition shadow-sm"
            title="Refresh Reports"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin text-[#DE4B12]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Controls Bar: Filters and Reason Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
          {[
            { key: "all", label: "All Status" },
            { key: "pending", label: "Pending" },
            { key: "resolved", label: "Resolved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                  isActive
                    ? "bg-[#DE4B12] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Type Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Content Type Select */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            {[
              { key: "all", label: "All Types" },
              { key: "Post", label: "Posts" },
              { key: "KnowledgePost", label: "Knowledge" },
            ].map((typeTab) => {
              const isSelected = contentTypeFilter === typeTab.key;
              return (
                <button
                  key={typeTab.key}
                  onClick={() => {
                    setContentTypeFilter(typeTab.key);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    isSelected
                      ? "bg-white text-gray-900 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {typeTab.label}
                </button>
              );
            })}
          </div>

          {/* Search by reason */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by reason..."
              className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12] transition"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-sm font-medium">{fetchError}</span>
          </div>
          <button
            onClick={() => fetchReports(pagination.currentPage)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table / List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          /* Skeletons */
          <div className="p-6 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100/70 rounded-xl animate-pulse"
                ></div>
              ))}
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-orange-100 text-[#DE4B12] rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 opacity-75" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              No reports found
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-5">
              {searchInput || statusFilter !== "all" || contentTypeFilter !== "all"
                ? "No reports match your current filter or search criteria."
                : "There are currently no reports submitted in the system."}
            </p>
            {(searchInput || statusFilter !== "all" || contentTypeFilter !== "all") && (
              <button
                onClick={() => {
                  handleClearSearch();
                  setStatusFilter("all");
                  setContentTypeFilter("all");
                }}
                className="px-4 py-2 bg-orange-50 text-[#DE4B12] border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Reports Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Reported Author</th>
                  <th className="py-3.5 px-4">Content Type</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Content Preview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {reports.map((report) => {
                  const isKnowledge = report.contentType === "KnowledgePost";
                  const isUserSuspended = Boolean(report.reportedUser?.isSuspended);
                  const previewText = report.content
                    ? isKnowledge
                      ? report.content.text
                      : report.content.bodyText
                    : report.isContentAvailable === false
                    ? "Content unavailable"
                    : "No preview text";

                  return (
                    <tr
                      key={report._id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      {/* Reporter */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={report.reportedBy?.profilePicture}
                            name={report.reportedBy?.name || "Reporter"}
                            size="sm"
                          />
                          <div className="min-w-0 max-w-[140px]">
                            <div className="font-semibold text-gray-900 truncate">
                              {report.reportedBy?.name || "Anonymous User"}
                            </div>
                            {report.reportedBy?.username && (
                              <div className="text-[11px] text-gray-400 truncate">
                                @{report.reportedBy.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reported User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={report.reportedUser?.profilePicture}
                            name={report.reportedUser?.name || "Reported User"}
                            size="sm"
                          />
                          <div className="min-w-0 max-w-[140px]">
                            <button
                              onClick={() => {
                                if (report.reportedUserId) {
                                  navigate(`/app/user-details/${report.reportedUserId}`);
                                }
                              }}
                              className="font-semibold text-gray-900 hover:text-[#DE4B12] transition truncate text-left block"
                              title="Inspect User Profile"
                            >
                              {report.reportedUser?.name || "Unknown Author"}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isUserSuspended ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-700 font-semibold">
                                  Suspended
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Content Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isKnowledge
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {isKnowledge ? (
                            <Sparkles className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {isKnowledge ? "Knowledge" : "Post"}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <span
                          className="font-medium text-gray-900 line-clamp-2"
                          title={report.reason}
                        >
                          {report.reason || "No reason provided"}
                        </span>
                      </td>

                      {/* Content Preview */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span
                          className={`line-clamp-2 ${
                            report.isContentAvailable === false
                              ? "text-red-500 italic"
                              : "text-gray-500"
                          }`}
                          title={previewText}
                        >
                          {previewText}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ReportStatusBadge status={report.status} />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 text-[11px]">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReview(report)}
                          className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#DE4B12] text-[#DE4B12] hover:text-white border border-orange-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">
            Showing Page{" "}
            <span className="font-semibold text-gray-800">
              {pagination.currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalPages}
            </span>{" "}
            ({pagination.totalItems} total reports)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={pagination.currentPage <= 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 transition shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const curr = pagination.currentPage;
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - curr) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-gray-400 text-xs">...</span>
                    )}
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: page,
                        }))
                      }
                      className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-semibold transition shadow-sm ${
                        page === pagination.currentPage
                          ? "bg-[#DE4B12] text-white border border-[#DE4B12]"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.min(
                    pagination.totalPages,
                    prev.currentPage + 1
                  ),
                }))
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 transition shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED REPORT REVIEW MODAL / DRAWER                                     */}
      {/* ========================================================================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-scaleIn flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 text-[#DE4B12] rounded-xl">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Report Review
                    </h2>
                    <ReportStatusBadge status={selectedReport.status} />
                  </div>
                  {/* <p className="text-xs text-gray-400 mt-0.5">
                    Report ID: {selectedReport._id}
                  </p> */}
                </div>
              </div>

              <button
                onClick={handleCloseReview}
                disabled={isSubmittingStatus}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isDetailLoading && (
                <div className="flex items-center justify-center py-2 text-xs text-orange-600 gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refreshing latest report details...
                </div>
              )}

              {/* Reported Reason Box */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                <span className="text-[11px] font-bold text-[#DE4B12] uppercase tracking-wider block mb-1">
                  Report Reason
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedReport.reason || "No explicit reason submitted."}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Reported on{" "}
                  {selectedReport.createdAt
                    ? new Date(selectedReport.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              {/* Review History (if already reviewed) */}
              {selectedReport.reviewedAt && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Reviewed by {selectedReport.reviewedBy?.name || "Admin"} on{" "}
                      {new Date(selectedReport.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedReport.resolutionNote && (
                    <p className="text-gray-600 mt-1 italic pl-6 break-all">
                      &ldquo;{selectedReport.resolutionNote}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Users Grid: Reporter vs Reported User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reporter Card */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Submitted By (Reporter)
                  </span>
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      src={selectedReport.reportedBy?.profilePicture}
                      name={selectedReport.reportedBy?.name || "Reporter"}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {selectedReport.reportedBy?.name || "Anonymous User"}
                      </div>
                      {selectedReport.reportedBy?.username && (
                        <div className="text-xs text-orange-600 font-medium truncate">
                          @{selectedReport.reportedBy.username}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {selectedReport.reportedBy?.email || "No email"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reported Author Card */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                      Reported Content Author
                    </span>
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        src={selectedReport.reportedUser?.profilePicture}
                        name={selectedReport.reportedUser?.name || "Author"}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {selectedReport.reportedUser?.name || "Unknown Author"}
                        </div>
                        {selectedReport.reportedUser?.username && (
                          <div className="text-xs text-orange-600 font-medium truncate">
                            @{selectedReport.reportedUser.username}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {selectedReport.reportedUser?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Reported User */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        if (selectedReport.reportedUserId) {
                          navigate(`/app/user-details/${selectedReport.reportedUserId}`);
                        }
                      }}
                      className="text-xs font-semibold text-[#DE4B12] hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Full Profile</span>
                    </button>

                    {selectedReport.reportedUser && (
                      <button
                        onClick={() => openSuspensionConfirm(selectedReport.reportedUser)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm ${
                          selectedReport.reportedUser.isSuspended
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {selectedReport.reportedUser.isSuspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Restore Author</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend Author</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reported Content Box */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reported Content
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        selectedReport.contentType === "KnowledgePost"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedReport.contentType}
                    </span>
                  </div>

                  {/* {selectedReport.targetId && (
                    <span className="text-[11px] text-gray-400">
                      ID: {selectedReport.targetId}
                    </span>
                  )} */}
                </div>

                {/* Content Rendering Rule */}
                {selectedReport.isContentAvailable === false || !selectedReport.content ? (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">
                      Content Unavailable
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The reported content was deleted or is no longer present in the database.
                    </p>
                  </div>
                ) : selectedReport.contentType === "KnowledgePost" ? (
                  /* Knowledge Post Content */
                  <div
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40"
                    style={{
                      fontFamily: selectedReport.content.fontFamily || "inherit",
                      textAlign: selectedReport.content.textAlignment || "left",
                    }}
                  >
                    {selectedReport.content.subTopic && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
                        Subtopic: {selectedReport.content.subTopic}
                      </span>
                    )}
                    <p
                      className={`text-gray-900 whitespace-pre-wrap leading-relaxed ${
                        selectedReport.content.isBold ? "font-bold" : ""
                      } ${selectedReport.content.isItalic ? "italic" : ""} ${
                        selectedReport.content.isUnderline ? "underline" : ""
                      }`}
                      style={{
                        fontSize: selectedReport.content.fontSize || "15px",
                      }}
                    >
                      {selectedReport.content.text || "No text available"}
                    </p>

                    {/* Knowledge Metrics */}
                    <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center gap-5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        {selectedReport.content.likesCount ?? 0} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        {selectedReport.content.commentsCount ?? (selectedReport.content.comments?.length || 0)} Comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5 text-green-400" />
                        {selectedReport.content.sharesCount ?? 0} Shares
                      </span>
                    </div>

                    {/* Comments List */}
                    {Array.isArray(selectedReport.content.comments) &&
                      selectedReport.content.comments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-amber-200/60">
                          <div className="flex items-center gap-2 mb-2.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#DE4B12]" />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                              Comments ({selectedReport.content.comments.length})
                            </span>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {selectedReport.content.comments.map((comment) => (
                              <div
                                key={comment._id}
                                className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-2.5 text-xs"
                              >
                                <UserAvatar
                                  src={comment.user?.profilePicture}
                                  name={comment.user?.name || "User"}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="font-semibold text-gray-900 truncate">
                                        {comment.user?.name || "Anonymous User"}
                                      </span>
                                      {comment.user?.username && (
                                        <span className="text-[11px] text-orange-600 font-medium truncate">
                                          @{comment.user.username}
                                        </span>
                                      )}
                                    </div>
                                    {comment.createdAt && (
                                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-700 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  /* Standard Post Content */
                  <div>
                    {selectedReport.content.bodyText && (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                        {selectedReport.content.bodyText}
                      </p>
                    )}

                    {/* Media Gallery */}
                    {Array.isArray(selectedReport.content.media) &&
                      selectedReport.content.media.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {selectedReport.content.media.map((m, idx) => (
                            <div
                              key={m._id || idx}
                              className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-black/5"
                            >
                              {m.fileUrl ? (
                                <img
                                  src={m.fileUrl}
                                  alt="Reported media"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                  No media URL
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Keywords */}
                    {Array.isArray(selectedReport.content.keywords) &&
                      selectedReport.content.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {selectedReport.content.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="text-xs text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full font-medium"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Post Metrics */}
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        {selectedReport.content.likesCount ?? 0} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        {selectedReport.content.commentsCount ?? (selectedReport.content.comments?.length || 0)} Comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5 text-green-400" />
                        {selectedReport.content.sharesCount ?? 0} Shares
                      </span>
                    </div>

                    {/* Comments List */}
                    {Array.isArray(selectedReport.content.comments) &&
                      selectedReport.content.comments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-2.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#DE4B12]" />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                              Comments ({selectedReport.content.comments.length})
                            </span>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {selectedReport.content.comments.map((comment) => (
                              <div
                                key={comment._id}
                                className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5 text-xs"
                              >
                                <UserAvatar
                                  src={comment.user?.profilePicture}
                                  name={comment.user?.name || "User"}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="font-semibold text-gray-900 truncate">
                                        {comment.user?.name || "Anonymous User"}
                                      </span>
                                      {comment.user?.username && (
                                        <span className="text-[11px] text-orange-600 font-medium truncate">
                                          @{comment.user.username}
                                        </span>
                                      )}
                                    </div>
                                    {comment.createdAt && (
                                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-700 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Resolution Note Section - only visible for pending reports */}
              {selectedReport.status === "pending" && (
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Resolution Note (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value.slice(0, 1000))}
                      placeholder="Provide context or explanation for resolving/rejecting this report..."
                      rows={3}
                      maxLength={1000}
                      disabled={isSubmittingStatus}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12] transition disabled:opacity-60"
                    />
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {resolutionNote.length} / 1000 characters
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <ReportStatusBadge status={selectedReport.status} />
                {selectedReport.status !== "pending" && (
                  <span className="text-xs text-gray-500 italic ml-1">
                    (This report has already been {selectedReport.status})
                  </span>
                )}
              </div>

              {selectedReport.status === "pending" ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Reject Button */}
                  <button
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={isSubmittingStatus}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 hover:border-rose-300 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 font-semibold text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingAction === "rejected" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>Reject Report</span>
                  </button>

                  {/* Resolve Button */}
                  <button
                    onClick={() => handleUpdateStatus("resolved")}
                    disabled={isSubmittingStatus}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm shadow-emerald-600/20 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingAction === "resolved" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Resolve Report</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCloseReview}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs transition shadow-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Suspension */}
      {suspensionModal.isOpen && suspensionModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    suspensionModal.isSuspendedTarget
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {suspensionModal.isSuspendedTarget ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <UserCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {suspensionModal.isSuspendedTarget
                      ? "Suspend Reported Author"
                      : "Restore Reported Author"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {suspensionModal.user.name} ({suspensionModal.user.email})
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {suspensionModal.isSuspendedTarget ? (
                  <>
                    <p className="font-semibold text-gray-800">
                      When you suspend this user:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Active sessions and device tokens are revoked immediately.</li>
                      <li>Their posts are hidden from normal user-facing feeds.</li>
                      <li>Their data and posts remain available for admin review.</li>
                    </ul>
                  </>
                ) : (
                  <p>
                    Restoring this author will re-enable their account and unhide
                    their posts in user feeds.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSuspensionModal({
                      isOpen: false,
                      user: null,
                      isSuspendedTarget: false,
                      loading: false,
                    })
                  }
                  disabled={suspensionModal.loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspension}
                  disabled={suspensionModal.loading}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md inline-flex items-center gap-2 transition ${
                    suspensionModal.isSuspendedTarget
                      ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                      : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                  }`}
                >
                  {suspensionModal.loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {suspensionModal.isSuspendedTarget
                      ? "Confirm Suspension"
                      : "Confirm Restore"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
